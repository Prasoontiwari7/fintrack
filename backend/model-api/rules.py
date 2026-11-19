import re

# Category Keywords directly from notebook (Cell 28 & Cell 30)
CATEGORY_KEYWORDS = {
    "Food": [
        "pizza", "burger", "food", "dinner", "lunch", "breakfast",
        "chai", "tea", "snacks", "paneer", "swiggy", "zomato",
        "restaurant", "groceries", "grocery"
    ],
    "Apparel": [
        "shoes", "shoe", "tshirt", "t-shirt", "shirt", "jeans",
        "kurta", "trouser", "dress", "clothes", "jacket", "sweater", "sandal"
    ],
    "Health": [
        "doctor", "medicine", "medicines", "medical", "hospital",
        "checkup", "check-up", "clinic", "tablet", "syrup", "eye checkup",
        "dentist", "therapy"
    ],
    "Transportation": [
        "uber", "ola", "auto", "metro", "cab", "taxi", "bus", "train",
        "rickshaw", "petrol", "diesel", "fuel", "parking"
    ],
    "Subscription": [
        "netflix", "spotify", "amazon prime", "prime", "subscription",
        "recharge", "mobile recharge", "tata play", "hotstar",
        "youtube premium", "membership"
    ],
    "Household": [
        "bedsheet", "bed sheet", "cleaning", "cleaning supplies",
        "bulb", "switch", "household", "home", "ghar ka saman",
        "ghar ke saman", "utensil", "crockery", "furniture", "mop",
        "bucket", "soap", "shampoo"
    ],
    "Investment": [
        "mutual fund", "mutual funds", "sip", "zerodha", "investment",
        "invest", "stock", "stocks", "share market", "shares", "equity",
        "fd", "fixed deposit", "rd", "recurring deposit"
    ],
    "Leisure": [
        "movie", "movies", "pvr", "cinema", "cinépolis", "carnival",
        "outing", "trip", "tour", "planetarium", "concert", "game", "gaming"
    ],
    "Beauty": [
        "haircut", "salon", "beauty", "facial", "parlour", "parlor",
        "spa", "manicure", "pedicure"
    ],
    "Education": [
        "course", "college", "school", "tuition", "exam", "form",
        "fees", "education", "class", "training"
    ],
    "Gift": [
        "gift", "present", "birthday gift", "wedding gift"
    ],
    "Family": [
        "mummy", "mom", "mother", "papa", "father", "brother",
        "sister", "family", "bhai ko", "mummy ke"
    ],
    "Festivals": [
        "diwali", "holi", "puja", "pooja", "festival", "rakhi",
        "eid", "navratri", "dussehra"
    ],
    "Salary": [
        "salary", "salary credit", "salary aa gayi", "paycheck",
        "income credited"
    ],
    "Other": [
        "random expense", "random kharcha", "miscellaneous",
        "miscellaneous expense", "misc expense", "misc kharcha",
        "other expense", "other kharcha", "random kharch",
        "miscellaneous kharch", "misc", "unplanned expense",
        "unplanned kharcha"
    ]
}

# Mapping 15 model categories to FinTrack's MongoDB Schema Enums
# FinTrack Transaction Enum: ['Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Health', 'Income']
# FinTrack Income Enum: ['Salary', 'Freelancing', 'Business', 'Gift', 'Interest', 'Other']
FINTRACK_EXPENSE_CATEGORY_MAP = {
    "Food": "Food",
    "Transportation": "Transport",
    "Apparel": "Shopping",
    "Household": "Utilities",
    "Subscription": "Utilities",
    "Health": "Health",
    "Leisure": "Entertainment",
    "Beauty": "Shopping",
    "Education": "Shopping",
    "Family": "Shopping",
    "Festivals": "Shopping",
    "Gift": "Shopping",
    "Investment": "Utilities",
    "Other": "Shopping",
    "Salary": "Income",
}

FINTRACK_INCOME_SOURCE_MAP = {
    "Salary": "Salary",
    "Gift": "Gift",
    "Investment": "Interest",
    "Food": "Other",
    "Transportation": "Other",
    "Apparel": "Other",
    "Household": "Other",
    "Subscription": "Other",
    "Health": "Other",
    "Leisure": "Other",
    "Beauty": "Other",
    "Education": "Other",
    "Family": "Other",
    "Festivals": "Other",
    "Other": "Other",
}


def extract_amount(text: str):
    """
    Extracts transaction amount from text using the exact notebook patterns.
    Handles '250', '250 rs', 'rs 250', '₹250', '1,500', '1.5k', etc.
    """
    if not text:
        return None

    text_lower = text.lower()
    patterns = [
        # 1.5k / 2k / 10k
        r'(?<!\w)(\d+(?:\.\d+)?)\s*[kK]\b',
        # rs 250 / rs. 250 / ₹250
        r'(?:₹|rs\.?|inr)\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?)',
        # 250 rupees
        r'([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?)\s*(?:rupees|rs)\b',
        # plain number
        r'(?<!\w)([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?)(?!\w)'
    ]

    for pattern in patterns:
        match = re.search(pattern, text_lower)
        if match:
            raw_value = match.group(1).replace(",", "")
            try:
                value = float(raw_value)
                # Convert 'k' notation
                if re.search(r'[kK]\b', match.group(0)):
                    value *= 1000
                return round(value, 2)
            except ValueError:
                continue

    return None


def rule_based_category(text: str):
    """
    Rule-based category matching using the notebook keyword dictionary.
    Prefers longest keyword match.
    """
    if not text:
        return None

    text_lower = text.lower()
    matches = []

    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                matches.append((category, len(keyword)))

    if not matches:
        return None

    matches.sort(key=lambda x: x[1], reverse=True)
    return matches[0][0]


def rule_based_type(text: str):
    """
    Transaction type detection (Income vs Expense) from notebook Step 27.
    """
    if not text:
        return "Expense"

    text_lower = text.lower()
    income_words = [
        "salary", "salary credit", "credited", "income",
        "received", "received money", "cashback", "refund", "bonus"
    ]

    for word in income_words:
        if word in text_lower:
            return "Income"

    return "Expense"


def map_to_fintrack_category(category: str, transaction_type: str) -> str:
    """
    Converts 15-class MuRIL categories to FinTrack MongoDB supported schema enums.
    """
    if transaction_type == "Income":
        return FINTRACK_INCOME_SOURCE_MAP.get(category, "Other")
    return FINTRACK_EXPENSE_CATEGORY_MAP.get(category, "Shopping")
