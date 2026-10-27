import os
import torch
import torch.nn as nn
from transformers import AutoModel, AutoTokenizer
from rules import (
    extract_amount,
    rule_based_category,
    rule_based_type,
    map_to_fintrack_category
)

MODEL_NAME = "google/muril-base-cased"
MAX_LENGTH = 32
MURIL_CONFIDENCE_THRESHOLD = 0.85

TYPE_LABELS = ["Expense", "Income"]
CATEGORY_LABELS = [
    "Apparel",
    "Beauty",
    "Education",
    "Family",
    "Festivals",
    "Food",
    "Gift",
    "Health",
    "Household",
    "Investment",
    "Leisure",
    "Other",
    "Salary",
    "Subscription",
    "Transportation"
]


class TransactionClassifier(nn.Module):
    """
    MuRIL-based dual-head classifier directly replicating the notebook architecture.
    """
    def __init__(self, bert_model, num_types=len(TYPE_LABELS), num_categories=len(CATEGORY_LABELS)):
        super().__init__()
        self.bert = bert_model
        hidden = self.bert.config.hidden_size  # 768
        self.dropout = nn.Dropout(0.1)
        self.type_head = nn.Linear(hidden, num_types)
        self.category_head = nn.Linear(hidden, num_categories)

    def forward(self, input_ids, attention_mask):
        output = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        pooled = output.pooler_output
        pooled = self.dropout(pooled)
        type_logits = self.type_head(pooled)
        category_logits = self.category_head(pooled)
        return type_logits, category_logits


class MuRILService:
    def __init__(self, checkpoint_path: str = None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"[MuRIL Service] Using device: {self.device}")

        # 1. Determine checkpoint path
        current_dir = os.path.dirname(os.path.abspath(__file__))
        if not checkpoint_path:
            checkpoint_path = os.environ.get(
                "CHECKPOINT_PATH",
                os.path.join(current_dir, "muril_whatsapp_best.pt")
            )
        if not os.path.isabs(checkpoint_path):
            checkpoint_path = os.path.join(current_dir, checkpoint_path)

        self.checkpoint_path = checkpoint_path
        print(f"[MuRIL Service] Loading checkpoint: {self.checkpoint_path}")

        # 2. Load tokenizer
        print(f"[MuRIL Service] Loading tokenizer: {MODEL_NAME}")
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

        # 3. Load backbone and build classifier
        print(f"[MuRIL Service] Initializing backbone: {MODEL_NAME}")
        bert = AutoModel.from_pretrained(MODEL_NAME)
        self.model = TransactionClassifier(
            bert_model=bert,
            num_types=len(TYPE_LABELS),
            num_categories=len(CATEGORY_LABELS)
        )

        # 4. Load state dict
        if not os.path.exists(self.checkpoint_path):
            raise FileNotFoundError(f"Checkpoint not found at: {self.checkpoint_path}")

        state_dict = torch.load(self.checkpoint_path, map_location=self.device)
        self.model.load_state_dict(state_dict)
        self.model = self.model.to(self.device)
        self.model.eval()
        print("[MuRIL Service] Checkpoint loaded and model set to eval mode.")

    def predict_category_with_muril(self, text: str):
        """
        Runs neural inference using fine-tuned MuRIL checkpoint.
        """
        encoded = self.tokenizer(
            text,
            padding="max_length",
            truncation=True,
            max_length=MAX_LENGTH,
            return_tensors="pt"
        )

        input_ids = encoded["input_ids"].to(self.device)
        attention_mask = encoded["attention_mask"].to(self.device)

        with torch.no_grad():
            type_logits, category_logits = self.model(input_ids, attention_mask)

            # Category probability and prediction
            category_probs = torch.softmax(category_logits, dim=1)
            cat_conf, cat_pred = torch.max(category_probs, dim=1)

            # Type probability and prediction
            type_probs = torch.softmax(type_logits, dim=1)
            type_conf, type_pred = torch.max(type_probs, dim=1)

        predicted_category = CATEGORY_LABELS[cat_pred.item()]
        category_confidence = round(cat_conf.item(), 4)

        predicted_type = TYPE_LABELS[type_pred.item()]
        type_confidence = round(type_conf.item(), 4)

        return {
            "category": predicted_category,
            "category_confidence": category_confidence,
            "model_type": predicted_type,
            "type_confidence": type_confidence
        }

    def parse_transaction(self, text: str) -> dict:
        """
        Complete Hybrid WhatsApp transaction parser:
        1. Extract amount using robust regex.
        2. Detect transaction type (Income vs Expense).
        3. Check deterministic category keywords.
        4. If not matched, query the fine-tuned MuRIL model.
        5. Map category to FinTrack's MongoDB schema enum.
        """
        raw_text = (text or "").strip()

        # 1. Extract numeric amount
        amount = extract_amount(raw_text)

        # 2. Detect type
        detected_type = rule_based_type(raw_text)

        # 3. First try deterministic rule matching
        rule_cat = rule_based_category(raw_text)

        category = None
        category_source = None
        category_confidence = 1.0

        if rule_cat is not None:
            category = rule_cat
            category_source = "rule"
            category_confidence = 1.0
        else:
            # 4. Fallback to MuRIL fine-tuned neural model
            model_res = self.predict_category_with_muril(raw_text)
            muril_cat = model_res["category"]
            muril_conf = model_res["category_confidence"]

            if muril_conf >= MURIL_CONFIDENCE_THRESHOLD:
                category = muril_cat
                category_source = "muril"
                category_confidence = muril_conf
            else:
                # Default to Other or best guess with review flag
                category = muril_cat
                category_source = "muril_low_confidence"
                category_confidence = muril_conf

            # If rule detected expense but neural model is highly confident in Income
            if model_res["model_type"] == "Income" and model_res["type_confidence"] > 0.90:
                detected_type = "Income"

        # 5. Map to FinTrack's database enums
        mapped_category = map_to_fintrack_category(category, detected_type)

        ready_to_save = (amount is not None and amount > 0 and category is not None)

        review_reason = None
        if amount is None or amount <= 0:
            review_reason = "Amount could not be extracted from message"
        elif category_source == "muril_low_confidence":
            review_reason = f"Category confidence ({category_confidence}) below optimal threshold ({MURIL_CONFIDENCE_THRESHOLD})"

        return {
            "text": raw_text,
            "amount": amount,
            "type": detected_type,
            "category": category,
            "mapped_category": mapped_category,
            "category_source": category_source,
            "category_confidence": category_confidence,
            "ready_to_save": ready_to_save,
            "review_reason": review_reason
        }
