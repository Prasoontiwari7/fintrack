=== CELL 0 ===
# ============================================================
# STEP 1 — FIND THE ORIGINAL DATASET
# ============================================================

import os

for dirname, _, filenames in os.walk("/kaggle/input"):
    for filename in filenames:
        print(
            os.path.join(dirname, filename)
        )

=== CELL 1 ===
# ============================================================
# STEP 2 — LOAD ORIGINAL DATASET
# ============================================================

import pandas as pd

DATA_PATH = "/kaggle/input/datasets/prasad22/daily-transactions-dataset/Daily Household Transactions.csv"

df = pd.read_csv(DATA_PATH)

print("Dataset loaded successfully!")

print("\nDataset shape:")
print(df.shape)

print("\nColumns:")
print(df.columns.tolist())

print("\nFirst 10 rows:")
display(df.head(10))

=== CELL 2 ===
# ============================================================
# STEP 3 — KEEP REQUIRED COLUMNS
# ============================================================

# Keep only the columns needed for our classification task
df = df[
    [
        "Note",
        "Category",
        "Income/Expense"
    ]
].dropna()

# Rename them to simpler names
df.columns = [
    "text",
    "category",
    "type"
]

print("Shape after cleaning:")
print(df.shape)

print("\nColumns:")
print(df.columns.tolist())

print("\nTransaction types:")
print(df["type"].unique())

print("\nOriginal categories:")
print(df["category"].unique())

print("\nFirst 10 cleaned rows:")
display(df.head(10))

=== CELL 3 ===
# ============================================================
# STEP 4 — CHECK CATEGORY AND TYPE DISTRIBUTION
# ============================================================

print("============================================================")
print("CATEGORY DISTRIBUTION")
print("============================================================")

category_counts = df["category"].value_counts()

print(category_counts)


print("\n============================================================")
print("TYPE DISTRIBUTION")
print("============================================================")

type_counts = df["type"].value_counts()

print(type_counts)


print("\n============================================================")
print("NUMBER OF UNIQUE RAW CATEGORIES")
print("============================================================")

print(
    "Unique categories:",
    df["category"].nunique()
)


print("\n============================================================")
print("NUMBER OF UNIQUE TYPES")
print("============================================================")

print(
    "Unique types:",
    df["type"].nunique()
)


print("\n============================================================")
print("RARE CATEGORIES")
print("============================================================")

print(
    category_counts[
        category_counts <= 20
    ]
)


print("\n============================================================")
print("MOST COMMON CATEGORIES")
print("============================================================")

print(
    category_counts.head(10)
)

=== CELL 4 ===
# ============================================================
# STEP 5 — REMOVE TRANSFER-OUT
# ============================================================

print("Before removing Transfer-Out:")
print("Rows:", len(df))

print("\nTransaction types:")
print(df["type"].value_counts())


# Remove Transfer-Out transactions
df = df[
    df["type"] != "Transfer-Out"
].reset_index(drop=True)


print("\n============================================================")
print("AFTER REMOVING TRANSFER-OUT")
print("============================================================")

print("Remaining rows:", len(df))

print("\nTransaction types:")
print(df["type"].value_counts())

=== CELL 5 ===
# ============================================================
# STEP 6 — MAP RAW CATEGORIES TO FINAL 15 CATEGORIES
# ============================================================

category_mapping = {

    # --------------------------------------------------------
    # FOOD
    # --------------------------------------------------------
    "Food": "Food",

    # --------------------------------------------------------
    # TRANSPORTATION
    # --------------------------------------------------------
    "Transportation": "Transportation",

    # --------------------------------------------------------
    # HOUSEHOLD
    # --------------------------------------------------------
    "Household": "Household",
    "water (jar /tanker)": "Household",
    "maid": "Household",
    "Cook": "Household",
    "Rent": "Household",
    "garbage disposal": "Household",

    # --------------------------------------------------------
    # OTHER
    # --------------------------------------------------------
    "Other": "Other",
    "Petty cash": "Other",
    "Documents": "Other",
    "Money transfer": "Other",
    "Gpay Reward": "Other",
    "Social Life": "Other",
    "scrap": "Other",

    # --------------------------------------------------------
    # SUBSCRIPTION
    # --------------------------------------------------------
    "subscription": "Subscription",

    # --------------------------------------------------------
    # HEALTH
    # --------------------------------------------------------
    "Health": "Health",

    # --------------------------------------------------------
    # INVESTMENT
    # --------------------------------------------------------
    "Investment": "Investment",
    "Interest": "Investment",
    "Dividend earned on Shares": "Investment",
    "Maturity amount": "Investment",
    "Bonus": "Investment",
    "Saving Bank account 1": "Investment",
    "Saving Bank account 2": "Investment",
    "Equity Mutual Fund A": "Investment",
    "Equity Mutual Fund B": "Investment",
    "Equity Mutual Fund C": "Investment",
    "Equity Mutual Fund D": "Investment",
    "Equity Mutual Fund E": "Investment",
    "Equity Mutual Fund F": "Investment",
    "Share Market": "Investment",
    "Fixed Deposit": "Investment",
    "Recurring Deposit": "Investment",
    "Public Provident Fund": "Investment",
    "Life Insurance": "Investment",
    "Small Cap fund 1": "Investment",
    "Small Cap fund 2": "Investment",
    "Small cap fund 1": "Investment",
    "Small cap fund 2": "Investment",
    "Tax refund": "Investment",

    # --------------------------------------------------------
    # APPAREL
    # --------------------------------------------------------
    "Apparel": "Apparel",

    # --------------------------------------------------------
    # SALARY
    # --------------------------------------------------------
    "Salary": "Salary",

    # --------------------------------------------------------
    # GIFT
    # --------------------------------------------------------
    "Gift": "Gift",

    # --------------------------------------------------------
    # FAMILY
    # --------------------------------------------------------
    "Family": "Family",

    # --------------------------------------------------------
    # BEAUTY
    # --------------------------------------------------------
    "Beauty": "Beauty",
    "Grooming": "Beauty",

    # --------------------------------------------------------
    # EDUCATION
    # --------------------------------------------------------
    "Education": "Education",
    "Self-development": "Education",

    # --------------------------------------------------------
    # FESTIVALS
    # --------------------------------------------------------
    "Festivals": "Festivals",

    # --------------------------------------------------------
    # LEISURE
    # --------------------------------------------------------
    "Culture": "Leisure",
    "Tourism": "Leisure",
}


# ============================================================
# APPLY THE MAPPING
# ============================================================

df["category"] = df["category"].map(
    category_mapping
)


# ============================================================
# CHECK WHETHER ANY CATEGORY FAILED TO MAP
# ============================================================

missing_categories = df["category"].isna().sum()

print(
    "Missing categories after mapping:",
    missing_categories
)


# ============================================================
# SHOW FINAL CATEGORY LIST
# ============================================================

print("\nFinal categories:")

final_categories = sorted(
    df["category"].dropna().unique()
)

for i, category in enumerate(
    final_categories,
    start=1
):
    print(
        f"{i}. {category}"
    )


# ============================================================
# NUMBER OF FINAL CATEGORIES
# ============================================================

print(
    "\nNumber of final categories:",
    df["category"].nunique()
)


# ============================================================
# FINAL CATEGORY DISTRIBUTION
# ============================================================

print(
    "\nFinal category distribution:"
)

print(
    df["category"].value_counts()
)

=== CELL 6 ===
# ============================================================
# STEP 7 — REMOVE UNMAPPED ROWS AND VERIFY FINAL DATASET
# ============================================================

# Remove rows where category mapping failed
df = df.dropna(
    subset=["category"]
).reset_index(drop=True)

print("Final dataset size:", len(df))

print("\nNumber of categories:")
print(df["category"].nunique())

print("\nFinal categories:")
print(
    sorted(
        df["category"].unique()
    )
)

print("\nFinal category distribution:")
print(
    df["category"].value_counts()
)

print("\nFinal transaction type distribution:")
print(
    df["type"].value_counts()
)

=== CELL 7 ===
# ============================================================
# STEP 8 — CREATE NUMERICAL LABEL IDS
# ============================================================

# ------------------------------------------------------------
# 1. Create sorted label lists
# ------------------------------------------------------------

type_labels = sorted(
    df["type"].unique()
)

category_labels = sorted(
    df["category"].unique()
)


# ------------------------------------------------------------
# 2. Create text → number mappings
# ------------------------------------------------------------

type_to_id = {
    label: i
    for i, label in enumerate(type_labels)
}

category_to_id = {
    label: i
    for i, label in enumerate(category_labels)
}


# ------------------------------------------------------------
# 3. Add numerical IDs to dataframe
# ------------------------------------------------------------

df["type_id"] = df["type"].map(
    type_to_id
)

df["category_id"] = df["category"].map(
    category_to_id
)


# ------------------------------------------------------------
# 4. Display type labels
# ------------------------------------------------------------

print("TYPE LABELS")
print("=" * 50)

for label, idx in type_to_id.items():
    print(
        f"{idx} = {label}"
    )


# ------------------------------------------------------------
# 5. Display category labels
# ------------------------------------------------------------

print("\nCATEGORY LABELS")
print("=" * 50)

for label, idx in category_to_id.items():
    print(
        f"{idx} = {label}"
    )


# ------------------------------------------------------------
# 6. Check number of labels
# ------------------------------------------------------------

print("\nNumber of types:")
print(len(type_labels))

print("\nNumber of categories:")
print(len(category_labels))


# ------------------------------------------------------------
# 7. Verify that IDs were created correctly
# ------------------------------------------------------------

print("\nMissing type IDs:")
print(
    df["type_id"].isna().sum()
)

print("\nMissing category IDs:")
print(
    df["category_id"].isna().sum()
)


# ------------------------------------------------------------
# 8. Show sample
# ------------------------------------------------------------

print("\nSAMPLE WITH NUMERICAL LABELS")

display(
    df[
        [
            "text",
            "type",
            "type_id",
            "category",
            "category_id"
        ]
    ].head(10)
)

=== CELL 8 ===
# ============================================================
# STEP 9 — CHECK DUPLICATE / REPEATED TRANSACTION TEXT
# ============================================================

# ------------------------------------------------------------
# 1. Total rows
# ------------------------------------------------------------

print("=" * 60)
print("DATASET SIZE")
print("=" * 60)

print("Total rows:", len(df))


# ------------------------------------------------------------
# 2. Number of unique texts
# ------------------------------------------------------------

unique_texts = df["text"].nunique()

print("\nUnique transaction texts:")
print(unique_texts)


# ------------------------------------------------------------
# 3. Number of duplicated rows based on text
# ------------------------------------------------------------

duplicate_text_rows = (
    df["text"].duplicated(keep=False).sum()
)

print("\nRows belonging to repeated-text groups:")
print(duplicate_text_rows)


# ------------------------------------------------------------
# 4. Number of repeated text groups
# ------------------------------------------------------------

text_counts = (
    df["text"]
    .value_counts()
)

repeated_groups = (
    text_counts[text_counts > 1]
)

print("\nNumber of repeated text groups:")
print(len(repeated_groups))


# ------------------------------------------------------------
# 5. Show the most repeated texts
# ------------------------------------------------------------

print("\n" + "=" * 60)
print("MOST REPEATED TRANSACTION TEXTS")
print("=" * 60)

print(
    repeated_groups.head(20)
)


# ------------------------------------------------------------
# 6. Check whether repeated texts have conflicting labels
# ------------------------------------------------------------

text_category_counts = (
    df.groupby("text")["category"]
    .nunique()
)

conflicting_texts = (
    text_category_counts[
        text_category_counts > 1
    ]
)

print("\n" + "=" * 60)
print("CONFLICTING TEXT LABELS")
print("=" * 60)

print(
    "Texts associated with multiple categories:",
    len(conflicting_texts)
)


# ------------------------------------------------------------
# 7. Display conflicting examples
# ------------------------------------------------------------

if len(conflicting_texts) > 0:

    print("\nExamples of conflicting texts:")

    conflicting_examples = df[
        df["text"].isin(
            conflicting_texts.index
        )
    ]

    display(
        conflicting_examples[
            [
                "text",
                "category",
                "type"
            ]
        ].sort_values("text").head(30)
    )


# ------------------------------------------------------------
# 8. Duplicate percentage
# ------------------------------------------------------------

duplicate_percentage = (
    duplicate_text_rows
    / len(df)
    * 100
)

print(
    f"\nPercentage of rows in repeated-text groups: "
    f"{duplicate_percentage:.2f}%"
)

=== CELL 9 ===
# ============================================================
# STEP 10 — REMOVE AMBIGUOUS TEXTS + LEAKAGE-SAFE SPLIT
# ============================================================

from sklearn.model_selection import train_test_split


# ============================================================
# PART A — FIND TEXTS WITH CONFLICTING CATEGORIES
# ============================================================

text_category_counts = (
    df.groupby("text")["category"]
    .nunique()
)

conflicting_texts = (
    text_category_counts[
        text_category_counts > 1
    ]
    .index
)

print("=" * 65)
print("CONFLICTING TEXTS")
print("=" * 65)

print(
    "Number of conflicting text groups:",
    len(conflicting_texts)
)


# ============================================================
# PART B — SHOW THEM
# ============================================================

if len(conflicting_texts) > 0:

    print("\nConflicting texts:")

    print(
        sorted(conflicting_texts.tolist())
    )


# ============================================================
# PART C — REMOVE AMBIGUOUS TEXT GROUPS
# ============================================================

before_rows = len(df)

df_clean = df[
    ~df["text"].isin(conflicting_texts)
].copy()

df_clean = df_clean.reset_index(drop=True)

after_rows = len(df_clean)

print("\n" + "=" * 65)
print("AFTER REMOVING AMBIGUOUS TEXTS")
print("=" * 65)

print("Rows before:", before_rows)
print("Rows after:", after_rows)
print("Rows removed:", before_rows - after_rows)


# ============================================================
# PART D — VERIFY NO CONFLICTS REMAIN
# ============================================================

remaining_conflicts = (
    df_clean.groupby("text")["category"]
    .nunique()
)

remaining_conflicts = remaining_conflicts[
    remaining_conflicts > 1
]

print(
    "\nRemaining conflicting text groups:",
    len(remaining_conflicts)
)


# ============================================================
# PART E — CREATE ONE ROW PER UNIQUE TEXT
# ============================================================

# Every remaining text now has exactly one category.

group_df = (
    df_clean[
        [
            "text",
            "category"
        ]
    ]
    .drop_duplicates()
    .reset_index(drop=True)
)

print("\n" + "=" * 65)
print("UNIQUE TEXT GROUPS")
print("=" * 65)

print(
    "Unique text groups:",
    len(group_df)
)


# ============================================================
# PART F — CHECK GROUP CATEGORY DISTRIBUTION
# ============================================================

print("\nCategory distribution among unique text groups:")

print(
    group_df["category"]
    .value_counts()
)


# ============================================================
# PART G — SPLIT UNIQUE TEXT GROUPS
# ============================================================

# IMPORTANT:
# We split TEXT GROUPS, not individual rows.
#
# Therefore, every occurrence of the same text will stay
# completely inside either train or validation.

train_groups, val_groups = train_test_split(
    group_df["text"],
    test_size=0.15,
    random_state=42,
    stratify=group_df["category"]
)


# ============================================================
# PART H — CREATE TRAIN AND VALIDATION DATAFRAMES
# ============================================================

train_df = df_clean[
    df_clean["text"].isin(train_groups)
].copy()

val_df = df_clean[
    df_clean["text"].isin(val_groups)
].copy()


# ============================================================
# PART I — RESET INDICES
# ============================================================

train_df = train_df.reset_index(drop=True)

val_df = val_df.reset_index(drop=True)


# ============================================================
# PART J — CHECK SPLIT SIZES
# ============================================================

print("\n" + "=" * 65)
print("FINAL TRAIN / VALIDATION SPLIT")
print("=" * 65)

print(
    "Training rows:",
    len(train_df)
)

print(
    "Validation rows:",
    len(val_df)
)

print(
    "Total:",
    len(train_df) + len(val_df)
)


# ============================================================
# PART K — CHECK TEXT OVERLAP
# ============================================================

train_texts = set(
    train_df["text"]
)

val_texts = set(
    val_df["text"]
)

overlap = train_texts.intersection(
    val_texts
)

print(
    "\nText groups appearing in BOTH train and validation:",
    len(overlap)
)


# ============================================================
# PART L — CHECK CATEGORY DISTRIBUTION
# ============================================================

print("\n" + "=" * 65)
print("TRAIN CATEGORY DISTRIBUTION")
print("=" * 65)

print(
    train_df["category"]
    .value_counts()
)


print("\n" + "=" * 65)
print("VALIDATION CATEGORY DISTRIBUTION")
print("=" * 65)

print(
    val_df["category"]
    .value_counts()
)


# ============================================================
# PART M — FINAL SANITY CHECK
# ============================================================

print("\n" + "=" * 65)
print("SANITY CHECK")
print("=" * 65)

print(
    "Train rows:",
    len(train_df)
)

print(
    "Validation rows:",
    len(val_df)
)

print(
    "Overlap:",
    len(overlap)
)

print(
    "Conflicting groups removed:",
    len(conflicting_texts)
)

=== CELL 10 ===
# ============================================================
# STEP 10 — CORRECT LEAKAGE-SAFE TRAIN / VALIDATION SPLIT
# ============================================================

from sklearn.model_selection import train_test_split


# ============================================================
# 1. CHECK HOW MANY UNIQUE TEXT GROUPS EACH CATEGORY HAS
# ============================================================

group_category_counts = (
    group_df["category"]
    .value_counts()
    .sort_index()
)

print("=" * 65)
print("UNIQUE TEXT GROUPS PER CATEGORY")
print("=" * 65)

print(group_category_counts)


# ============================================================
# 2. FIND CATEGORIES WITH ONLY ONE UNIQUE TEXT GROUP
# ============================================================

singleton_categories = (
    group_category_counts[
        group_category_counts < 2
    ]
    .index
    .tolist()
)

print("\nCategories with fewer than 2 unique text groups:")

if singleton_categories:
    print(singleton_categories)
else:
    print("None")


# ============================================================
# 3. SEPARATE SINGLETON CATEGORIES
# ============================================================

singleton_groups = group_df[
    group_df["category"].isin(
        singleton_categories
    )
].copy()


splittable_groups = group_df[
    ~group_df["category"].isin(
        singleton_categories
    )
].copy()


print("\n" + "=" * 65)
print("GROUP SPLITTING DATA")
print("=" * 65)

print(
    "Splittable text groups:",
    len(splittable_groups)
)

print(
    "Singleton text groups:",
    len(singleton_groups)
)


# ============================================================
# 4. STRATIFIED SPLIT FOR CATEGORIES WITH ENOUGH GROUPS
# ============================================================

train_groups, val_groups = train_test_split(
    splittable_groups["text"],
    test_size=0.15,
    random_state=42,
    stratify=splittable_groups["category"]
)


# ============================================================
# 5. FORCE SINGLETON GROUPS INTO TRAINING
# ============================================================

singleton_texts = set(
    singleton_groups["text"]
)


train_groups = list(train_groups) + list(
    singleton_texts
)

val_groups = list(val_groups)


# ============================================================
# 6. BUILD FINAL TRAIN / VALIDATION DATAFRAMES
# ============================================================

train_df = df_clean[
    df_clean["text"].isin(train_groups)
].copy()

val_df = df_clean[
    df_clean["text"].isin(val_groups)
].copy()


train_df = train_df.reset_index(
    drop=True
)

val_df = val_df.reset_index(
    drop=True
)


# ============================================================
# 7. CHECK DATA SIZES
# ============================================================

print("\n" + "=" * 65)
print("FINAL TRAIN / VALIDATION SPLIT")
print("=" * 65)

print(
    "Training rows:",
    len(train_df)
)

print(
    "Validation rows:",
    len(val_df)
)

print(
    "Total rows:",
    len(train_df) + len(val_df)
)


# ============================================================
# 8. CHECK TEXT LEAKAGE
# ============================================================

train_texts = set(
    train_df["text"]
)

val_texts = set(
    val_df["text"]
)

overlap = train_texts.intersection(
    val_texts
)

print("\nText groups appearing in BOTH sets:")

print(
    len(overlap)
)


# ============================================================
# 9. TRAIN CATEGORY DISTRIBUTION
# ============================================================

print("\n" + "=" * 65)
print("TRAIN CATEGORY DISTRIBUTION")
print("=" * 65)

print(
    train_df["category"]
    .value_counts()
)


# ============================================================
# 10. VALIDATION CATEGORY DISTRIBUTION
# ============================================================

print("\n" + "=" * 65)
print("VALIDATION CATEGORY DISTRIBUTION")
print("=" * 65)

print(
    val_df["category"]
    .value_counts()
)


# ============================================================
# 11. CHECK WHICH CATEGORIES ARE IN VALIDATION
# ============================================================

train_categories = set(
    train_df["category"]
)

val_categories = set(
    val_df["category"]
)

print("\n" + "=" * 65)
print("CATEGORY COVERAGE")
print("=" * 65)

print(
    "Categories in training:",
    len(train_categories)
)

print(
    "Categories in validation:",
    len(val_categories)
)

print(
    "Categories only in training:",
    sorted(
        train_categories - val_categories
    )
)

print(
    "Categories only in validation:",
    sorted(
        val_categories - train_categories
    )
)


# ============================================================
# 12. FINAL SANITY CHECK
# ============================================================

print("\n" + "=" * 65)
print("FINAL SANITY CHECK")
print("=" * 65)

print(
    "Conflicting text groups removed:",
    len(conflicting_texts)
)

print(
    "Train/validation text overlap:",
    len(overlap)
)

print(
    "Singleton categories forced into train:",
    singleton_categories
)

=== CELL 11 ===
# ============================================================
# STEP 11 — MuRIL TOKEN LENGTH ANALYSIS
# ============================================================

!pip -q install transformers

from transformers import AutoTokenizer
import numpy as np


# ============================================================
# 1. LOAD MuRIL TOKENIZER
# ============================================================

MODEL_NAME = "google/muril-base-cased"

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME
)

print("MuRIL tokenizer loaded successfully!")


# ============================================================
# 2. COMBINE TRAIN + VALIDATION TEXTS
# ============================================================

all_texts = pd.concat(
    [
        train_df["text"],
        val_df["text"]
    ],
    ignore_index=True
).astype(str)


print("\nTotal texts analyzed:")
print(len(all_texts))


# ============================================================
# 3. CALCULATE TOKEN LENGTHS
# ============================================================

token_lengths = []

for text in all_texts:

    tokens = tokenizer(
        text,
        truncation=False,
        add_special_tokens=True
    )

    token_lengths.append(
        len(tokens["input_ids"])
    )


token_lengths = np.array(
    token_lengths
)


# ============================================================
# 4. BASIC STATISTICS
# ============================================================

print("\n" + "=" * 65)
print("TOKEN LENGTH STATISTICS")
print("=" * 65)

print(
    "Minimum:",
    token_lengths.min()
)

print(
    "Maximum:",
    token_lengths.max()
)

print(
    "Mean:",
    round(
        token_lengths.mean(),
        2
    )
)

print(
    "Median:",
    np.median(token_lengths)
)

print(
    "95th percentile:",
    np.percentile(
        token_lengths,
        95
    )
)

print(
    "99th percentile:",
    np.percentile(
        token_lengths,
        99
    )
)


# ============================================================
# 5. CHECK COVERAGE FOR COMMON MAX_LENGTH VALUES
# ============================================================

print("\n" + "=" * 65)
print("MAX LENGTH COVERAGE")
print("=" * 65)

for max_len in [
    16,
    24,
    32,
    48,
    64
]:

    covered = (
        token_lengths <= max_len
    ).mean() * 100

    truncated = (
        token_lengths > max_len
    ).sum()

    print(
        f"MAX_LENGTH={max_len:2d}  | "
        f"Coverage={covered:6.2f}% | "
        f"Texts truncated={truncated}"
    )


# ============================================================
# 6. SHOW THE LONGEST TRANSACTIONS
# ============================================================

length_df = pd.DataFrame(
    {
        "text": all_texts,
        "token_length": token_lengths
    }
)

print("\n" + "=" * 65)
print("LONGEST TRANSACTION TEXTS")
print("=" * 65)

display(
    length_df
    .sort_values(
        "token_length",
        ascending=False
    )
    .head(20)
)


# ============================================================
# 7. SELECT A PRACTICAL MAX_LENGTH
# ============================================================

# We will choose after looking at the output.

=== CELL 12 ===
# ============================================================
# STEP 12 — CREATE PYTORCH DATASET AND DATALOADERS
# ============================================================

import torch
from torch.utils.data import Dataset, DataLoader


# ============================================================
# 1. SETTINGS
# ============================================================

MAX_LENGTH = 32
BATCH_SIZE = 16


# ============================================================
# 2. CREATE DATASET CLASS
# ============================================================

class TransactionDataset(Dataset):

    def __init__(
        self,
        dataframe,
        tokenizer,
        max_length=32
    ):

        self.data = dataframe.reset_index(
            drop=True
        )

        self.tokenizer = tokenizer
        self.max_length = max_length


    def __len__(self):

        return len(self.data)


    def __getitem__(self, idx):

        # ----------------------------------------------------
        # Get transaction text
        # ----------------------------------------------------

        text = str(
            self.data.loc[
                idx,
                "text"
            ]
        )


        # ----------------------------------------------------
        # Tokenize text using MuRIL tokenizer
        # ----------------------------------------------------

        encoding = self.tokenizer(
            text,
            truncation=True,
            padding="max_length",
            max_length=self.max_length,
            return_tensors="pt"
        )


        # Remove batch dimension
        input_ids = encoding[
            "input_ids"
        ].squeeze(0)

        attention_mask = encoding[
            "attention_mask"
        ].squeeze(0)


        # ----------------------------------------------------
        # Get numerical labels
        # ----------------------------------------------------

        type_label = torch.tensor(
            self.data.loc[
                idx,
                "type_id"
            ],
            dtype=torch.long
        )

        category_label = torch.tensor(
            self.data.loc[
                idx,
                "category_id"
            ],
            dtype=torch.long
        )


        # ----------------------------------------------------
        # Return everything needed by the model
        # ----------------------------------------------------

        return {
            "input_ids": input_ids,
            "attention_mask": attention_mask,
            "type_label": type_label,
            "category_label": category_label
        }


# ============================================================
# 3. CREATE TRAINING DATASET
# ============================================================

train_dataset = TransactionDataset(
    train_df,
    tokenizer,
    MAX_LENGTH
)


# ============================================================
# 4. CREATE VALIDATION DATASET
# ============================================================

val_dataset = TransactionDataset(
    val_df,
    tokenizer,
    MAX_LENGTH
)


print("=" * 65)
print("DATASET OBJECTS")
print("=" * 65)

print(
    "Training dataset size:",
    len(train_dataset)
)

print(
    "Validation dataset size:",
    len(val_dataset)
)


# ============================================================
# 5. SANITY CHECK ONE SAMPLE
# ============================================================

sample = train_dataset[0]

print("\n" + "=" * 65)
print("SAMPLE DATASET ITEM")
print("=" * 65)

print(
    "Input IDs shape:",
    sample["input_ids"].shape
)

print(
    "Attention mask shape:",
    sample["attention_mask"].shape
)

print(
    "Type label:",
    sample["type_label"].item()
)

print(
    "Category label:",
    sample["category_label"].item()
)


# ============================================================
# 6. CREATE TRAINING DATALOADER
# ============================================================

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=2,
    pin_memory=torch.cuda.is_available()
)


# ============================================================
# 7. CREATE VALIDATION DATALOADER
# ============================================================

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=2,
    pin_memory=torch.cuda.is_available()
)


# ============================================================
# 8. CHECK NUMBER OF BATCHES
# ============================================================

print("\n" + "=" * 65)
print("DATALOADERS")
print("=" * 65)

print(
    "Batch size:",
    BATCH_SIZE
)

print(
    "Training batches:",
    len(train_loader)
)

print(
    "Validation batches:",
    len(val_loader)
)


# ============================================================
# 9. CHECK ONE ACTUAL BATCH
# ============================================================

batch = next(
    iter(train_loader)
)

print("\n" + "=" * 65)
print("ONE TRAINING BATCH")
print("=" * 65)

print(
    "input_ids:",
    batch["input_ids"].shape
)

print(
    "attention_mask:",
    batch["attention_mask"].shape
)

print(
    "type_label:",
    batch["type_label"].shape
)

print(
    "category_label:",
    batch["category_label"].shape
)

=== CELL 13 ===
# ============================================================
# STEP 13 — LOAD MuRIL AND BUILD CLASSIFIER
# ============================================================

import torch
import torch.nn as nn

from transformers import AutoModel


# ============================================================
# 1. MODEL NAME
# ============================================================

MODEL_NAME = "google/muril-base-cased"


# ============================================================
# 2. LOAD MuRIL BACKBONE
# ============================================================

print("Loading MuRIL...")

bert = AutoModel.from_pretrained(
    MODEL_NAME
)

print("MuRIL loaded successfully!")

print(
    "\nHidden size:",
    bert.config.hidden_size
)


# ============================================================
# 3. CREATE CLASSIFIER
# ============================================================

class TransactionClassifier(nn.Module):

    def __init__(
        self,
        bert_model,
        num_types,
        num_categories
    ):

        super().__init__()

        # MuRIL backbone
        self.bert = bert_model

        # MuRIL-base hidden size = 768
        hidden = self.bert.config.hidden_size

        # Dropout helps reduce overfitting
        self.dropout = nn.Dropout(0.1)

        # Type classification head
        # 768 → 2
        self.type_head = nn.Linear(
            hidden,
            num_types
        )

        # Category classification head
        # 768 → 15
        self.category_head = nn.Linear(
            hidden,
            num_categories
        )


    def forward(
        self,
        input_ids,
        attention_mask
    ):

        # Pass text through MuRIL
        output = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask
        )

        # Take MuRIL pooled representation
        pooled = output.pooler_output

        # Apply dropout
        pooled = self.dropout(
            pooled
        )

        # Make two predictions
        type_logits = self.type_head(
            pooled
        )

        category_logits = self.category_head(
            pooled
        )

        return (
            type_logits,
            category_logits
        )


# ============================================================
# 4. CREATE MODEL
# ============================================================

model = TransactionClassifier(
    bert_model=bert,
    num_types=len(type_labels),
    num_categories=len(category_labels)
)


# ============================================================
# 5. SELECT DEVICE
# ============================================================

device = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)

model = model.to(device)


print("\n" + "=" * 65)
print("MODEL INFORMATION")
print("=" * 65)

print(
    "Device:",
    device
)

print(
    "Number of types:",
    len(type_labels)
)

print(
    "Number of categories:",
    len(category_labels)
)


# ============================================================
# 6. COUNT PARAMETERS
# ============================================================

total_params = sum(
    p.numel()
    for p in model.parameters()
)

bert_params = sum(
    p.numel()
    for p in model.bert.parameters()
)

head_params = (
    total_params
    - bert_params
)


print(
    "\nMuRIL parameters:",
    f"{bert_params:,}"
)

print(
    "Classification head parameters:",
    f"{head_params:,}"
)

print(
    "Total parameters:",
    f"{total_params:,}"
)


# ============================================================
# 7. CHECK TRAINABLE PARAMETERS
# ============================================================

trainable_params = sum(
    p.numel()
    for p in model.parameters()
    if p.requires_grad
)

print(
    "Trainable parameters:",
    f"{trainable_params:,}"
)


# ============================================================
# 8. TEST ONE BATCH
# ============================================================

model.eval()

with torch.no_grad():

    batch = next(
        iter(train_loader)
    )

    input_ids = batch[
        "input_ids"
    ].to(device)

    attention_mask = batch[
        "attention_mask"
    ].to(device)

    type_logits, category_logits = model(
        input_ids=input_ids,
        attention_mask=attention_mask
    )


print("\n" + "=" * 65)
print("FORWARD PASS TEST")
print("=" * 65)

print(
    "Input shape:",
    input_ids.shape
)

print(
    "Type logits shape:",
    type_logits.shape
)

print(
    "Category logits shape:",
    category_logits.shape
)

=== CELL 14 ===
# ============================================================
# STEP 14 — CALCULATE CATEGORY CLASS WEIGHTS
# ============================================================

import numpy as np
import torch

from sklearn.utils.class_weight import compute_class_weight


# ============================================================
# 1. GET TRAINING CATEGORY LABELS
# ============================================================

train_category_ids = (
    train_df["category_id"]
    .to_numpy()
)


# ============================================================
# 2. CREATE ALL CATEGORY IDS
# ============================================================

all_category_ids = np.arange(
    len(category_labels)
)


# ============================================================
# 3. CALCULATE BALANCED CLASS WEIGHTS
# ============================================================

class_weights = compute_class_weight(
    class_weight="balanced",
    classes=all_category_ids,
    y=train_category_ids
)


# ============================================================
# 4. CONVERT TO PYTORCH TENSOR
# ============================================================

category_class_weights = torch.tensor(
    class_weights,
    dtype=torch.float32
).to(device)


# ============================================================
# 5. DISPLAY CATEGORY WEIGHTS
# ============================================================

print("=" * 65)
print("CATEGORY CLASS WEIGHTS")
print("=" * 65)

for category_id, category_name in enumerate(
    category_labels
):

    print(
        f"{category_id:2d} | "
        f"{category_name:15s} | "
        f"Train count = "
        f"{(train_category_ids == category_id).sum():3d} | "
        f"Weight = "
        f"{class_weights[category_id]:.4f}"
    )


# ============================================================
# 6. BASIC WEIGHT STATISTICS
# ============================================================

print("\n" + "=" * 65)
print("WEIGHT STATISTICS")
print("=" * 65)

print(
    "Minimum weight:",
    round(
        class_weights.min(),
        4
    )
)

print(
    "Maximum weight:",
    round(
        class_weights.max(),
        4
    )
)

print(
    "Mean weight:",
    round(
        class_weights.mean(),
        4
    )
)


# ============================================================
# 7. CHECK TENSOR
# ============================================================

print("\nPyTorch weight tensor:")

print(
    category_class_weights
)

=== CELL 15 ===
# ============================================================
# STEP 15 — LOSS FUNCTIONS + OPTIMIZER
# ============================================================

import torch
import torch.nn as nn


# ============================================================
# 1. TYPE LOSS
# ============================================================

# Type has only 2 classes:
# 0 = Expense
# 1 = Income

type_loss_fn = nn.CrossEntropyLoss()


# ============================================================
# 2. CATEGORY LOSS
# ============================================================

# Category loss uses our balanced class weights.
# This gives more importance to rare categories.

category_loss_fn = nn.CrossEntropyLoss(
    weight=category_class_weights
)


# ============================================================
# 3. OPTIMIZER
# ============================================================

optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=2e-5
)


# ============================================================
# 4. DISPLAY SETTINGS
# ============================================================

print("=" * 65)
print("TRAINING CONFIGURATION")
print("=" * 65)

print(
    "Type loss:",
    "CrossEntropyLoss"
)

print(
    "Category loss:",
    "Weighted CrossEntropyLoss"
)

print(
    "Optimizer:",
    "AdamW"
)

print(
    "Learning rate:",
    2e-5
)


# ============================================================
# 5. TEST THE LOSS FUNCTIONS ON ONE BATCH
# ============================================================

model.train()

batch = next(
    iter(train_loader)
)

input_ids = batch[
    "input_ids"
].to(
    device,
    non_blocking=True
)

attention_mask = batch[
    "attention_mask"
].to(
    device,
    non_blocking=True
)

type_ids = batch[
    "type_label"
].to(
    device,
    non_blocking=True
)

category_ids = batch[
    "category_label"
].to(
    device,
    non_blocking=True
)


# ------------------------------------------------------------
# Clear previous gradients
# ------------------------------------------------------------

optimizer.zero_grad()


# ------------------------------------------------------------
# Forward pass
# ------------------------------------------------------------

type_logits, category_logits = model(
    input_ids,
    attention_mask
)


# ------------------------------------------------------------
# Calculate individual losses
# ------------------------------------------------------------

type_loss = type_loss_fn(
    type_logits,
    type_ids
)

category_loss = category_loss_fn(
    category_logits,
    category_ids
)


# ------------------------------------------------------------
# Combine losses
# ------------------------------------------------------------

total_loss = (
    type_loss
    + category_loss
)


# ============================================================
# 6. DISPLAY TEST RESULTS
# ============================================================

print("\n" + "=" * 65)
print("ONE BATCH LOSS TEST")
print("=" * 65)

print(
    "Type loss:",
    round(
        type_loss.item(),
        4
    )
)

print(
    "Category loss:",
    round(
        category_loss.item(),
        4
    )
)

print(
    "Total loss:",
    round(
        total_loss.item(),
        4
    )
)

=== CELL 16 ===
# ============================================================
# STEP 16 — TRAIN MuRIL
# ============================================================

import time
import torch


# ============================================================
# 1. TRAINING SETTINGS
# ============================================================

EPOCHS = 28

BEST_MODEL_PATH = (
    "/kaggle/working/"
    "muril_original_best.pt"
)

best_val_category_acc = 0.0


# ============================================================
# 2. TRAINING FUNCTION
# ============================================================

def train_one_epoch(
    model,
    loader,
    optimizer,
    device
):

    model.train()

    total_loss = 0.0

    correct_type = 0
    total_type = 0

    correct_category = 0
    total_category = 0


    for batch in loader:

        # ----------------------------------------------------
        # Move batch to GPU
        # ----------------------------------------------------

        input_ids = batch[
            "input_ids"
        ].to(
            device,
            non_blocking=True
        )

        attention_mask = batch[
            "attention_mask"
        ].to(
            device,
            non_blocking=True
        )

        type_ids = batch[
            "type_label"
        ].to(
            device,
            non_blocking=True
        )

        category_ids = batch[
            "category_label"
        ].to(
            device,
            non_blocking=True
        )


        # ----------------------------------------------------
        # Clear old gradients
        # ----------------------------------------------------

        optimizer.zero_grad()


        # ----------------------------------------------------
        # Forward pass
        # ----------------------------------------------------

        type_logits, category_logits = model(
            input_ids,
            attention_mask
        )


        # ----------------------------------------------------
        # Calculate losses
        # ----------------------------------------------------

        type_loss = type_loss_fn(
            type_logits,
            type_ids
        )

        category_loss = category_loss_fn(
            category_logits,
            category_ids
        )

        loss = (
            type_loss
            + category_loss
        )


        # ----------------------------------------------------
        # Backpropagation
        # ----------------------------------------------------

        loss.backward()


        # ----------------------------------------------------
        # Update model
        # ----------------------------------------------------

        optimizer.step()


        # ----------------------------------------------------
        # Store loss
        # ----------------------------------------------------

        total_loss += loss.item()


        # ----------------------------------------------------
        # Type predictions
        # ----------------------------------------------------

        type_predictions = torch.argmax(
            type_logits,
            dim=1
        )


        # ----------------------------------------------------
        # Category predictions
        # ----------------------------------------------------

        category_predictions = torch.argmax(
            category_logits,
            dim=1
        )


        # ----------------------------------------------------
        # Count correct predictions
        # ----------------------------------------------------

        correct_type += (
            type_predictions == type_ids
        ).sum().item()

        total_type += (
            type_ids.size(0)
        )


        correct_category += (
            category_predictions == category_ids
        ).sum().item()

        total_category += (
            category_ids.size(0)
        )


    # ========================================================
    # EPOCH METRICS
    # ========================================================

    average_loss = (
        total_loss
        / len(loader)
    )

    type_accuracy = (
        correct_type
        / total_type
        * 100
    )

    category_accuracy = (
        correct_category
        / total_category
        * 100
    )

    return (
        average_loss,
        type_accuracy,
        category_accuracy
    )


# ============================================================
# 3. VALIDATION FUNCTION
# ============================================================

def validate(
    model,
    loader,
    device
):

    model.eval()

    total_loss = 0.0

    correct_type = 0
    total_type = 0

    correct_category = 0
    total_category = 0


    with torch.no_grad():

        for batch in loader:

            # ------------------------------------------------
            # Move batch to GPU
            # ------------------------------------------------

            input_ids = batch[
                "input_ids"
            ].to(
                device,
                non_blocking=True
            )

            attention_mask = batch[
                "attention_mask"
            ].to(
                device,
                non_blocking=True
            )

            type_ids = batch[
                "type_label"
            ].to(
                device,
                non_blocking=True
            )

            category_ids = batch[
                "category_label"
            ].to(
                device,
                non_blocking=True
            )


            # ------------------------------------------------
            # Forward pass
            # ------------------------------------------------

            type_logits, category_logits = model(
                input_ids,
                attention_mask
            )


            # ------------------------------------------------
            # Validation loss
            # ------------------------------------------------

            type_loss = type_loss_fn(
                type_logits,
                type_ids
            )

            category_loss = category_loss_fn(
                category_logits,
                category_ids
            )

            loss = (
                type_loss
                + category_loss
            )

            total_loss += loss.item()


            # ------------------------------------------------
            # Predictions
            # ------------------------------------------------

            type_predictions = torch.argmax(
                type_logits,
                dim=1
            )

            category_predictions = torch.argmax(
                category_logits,
                dim=1
            )


            # ------------------------------------------------
            # Accuracy
            # ------------------------------------------------

            correct_type += (
                type_predictions == type_ids
            ).sum().item()

            total_type += (
                type_ids.size(0)
            )

            correct_category += (
                category_predictions == category_ids
            ).sum().item()

            total_category += (
                category_ids.size(0)
            )


    average_loss = (
        total_loss
        / len(loader)
    )

    type_accuracy = (
        correct_type
        / total_type
        * 100
    )

    category_accuracy = (
        correct_category
        / total_category
        * 100
    )

    return (
        average_loss,
        type_accuracy,
        category_accuracy
    )


# ============================================================
# 4. TRAINING LOOP
# ============================================================

print("=" * 70)
print("STARTING MuRIL TRAINING")
print("=" * 70)

print(
    "Epochs:",
    EPOCHS
)

print(
    "Best model:",
    BEST_MODEL_PATH
)

print()


for epoch in range(EPOCHS):

    start_time = time.time()


    # --------------------------------------------------------
    # Training
    # --------------------------------------------------------

    train_loss, train_type_acc, train_category_acc = (
        train_one_epoch(
            model,
            train_loader,
            optimizer,
            device
        )
    )


    # --------------------------------------------------------
    # Validation
    # --------------------------------------------------------

    val_loss, val_type_acc, val_category_acc = (
        validate(
            model,
            val_loader,
            device
        )
    )


    # --------------------------------------------------------
    # Time
    # --------------------------------------------------------

    epoch_time = (
        time.time()
        - start_time
    )


    # --------------------------------------------------------
    # Print results
    # --------------------------------------------------------

    print(
        f"Epoch {epoch + 1:02d}/{EPOCHS} | "
        f"Train Loss: {train_loss:.4f} | "
        f"Train Type Acc: {train_type_acc:.2f}% | "
        f"Train Cat Acc: {train_category_acc:.2f}% | "
        f"Val Loss: {val_loss:.4f} | "
        f"Val Type Acc: {val_type_acc:.2f}% | "
        f"Val Cat Acc: {val_category_acc:.2f}% | "
        f"Time: {epoch_time:.1f}s"
    )


    # --------------------------------------------------------
    # Save best model
    # --------------------------------------------------------

    if val_category_acc > best_val_category_acc:

        best_val_category_acc = (
            val_category_acc
        )

        torch.save(
            model.state_dict(),
            BEST_MODEL_PATH
        )

        print(
            f"  --> NEW BEST MODEL SAVED "
            f"(Val Cat Acc: "
            f"{best_val_category_acc:.2f}%)"
        )

    else:

        print(
            f"  --> No improvement "
            f"(Best: "
            f"{best_val_category_acc:.2f}%)"
        )


# ============================================================
# 5. TRAINING COMPLETE
# ============================================================

print("\n" + "=" * 70)
print("TRAINING COMPLETE")
print("=" * 70)

print(
    "Best validation category accuracy:",
    f"{best_val_category_acc:.2f}%"
)

print(
    "Best model saved at:",
    BEST_MODEL_PATH
)

=== CELL 17 ===


# ============================================================
# STEP 17 — LOAD BEST MODEL + FULL EVALUATION
# ============================================================

import torch
import numpy as np
import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score
)


# ============================================================
# 1. LOAD BEST CHECKPOINT
# ============================================================

BEST_MODEL_PATH = (
    "/kaggle/working/"
    "muril_original_best.pt"
)

model.load_state_dict(
    torch.load(
        BEST_MODEL_PATH,
        map_location=device
    )
)

model = model.to(device)

print(
    "Best checkpoint loaded successfully!"
)


# ============================================================
# 2. EVALUATION MODE
# ============================================================

model.eval()


# ============================================================
# 3. STORAGE FOR PREDICTIONS
# ============================================================

all_type_true = []
all_type_pred = []

all_category_true = []
all_category_pred = []


# ============================================================
# 4. RUN VALIDATION
# ============================================================

with torch.no_grad():

    for batch in val_loader:

        input_ids = batch[
            "input_ids"
        ].to(
            device,
            non_blocking=True
        )

        attention_mask = batch[
            "attention_mask"
        ].to(
            device,
            non_blocking=True
        )

        type_ids = batch[
            "type_label"
        ].to(
            device,
            non_blocking=True
        )

        category_ids = batch[
            "category_label"
        ].to(
            device,
            non_blocking=True
        )


        # Forward pass
        type_logits, category_logits = model(
            input_ids,
            attention_mask
        )


        # Predicted classes
        type_predictions = torch.argmax(
            type_logits,
            dim=1
        )

        category_predictions = torch.argmax(
            category_logits,
            dim=1
        )


        # Move predictions back to CPU
        all_type_true.extend(
            type_ids.cpu().numpy()
        )

        all_type_pred.extend(
            type_predictions.cpu().numpy()
        )

        all_category_true.extend(
            category_ids.cpu().numpy()
        )

        all_category_pred.extend(
            category_predictions.cpu().numpy()
        )


# ============================================================
# 5. CONVERT TO NUMPY
# ============================================================

all_type_true = np.array(
    all_type_true
)

all_type_pred = np.array(
    all_type_pred
)

all_category_true = np.array(
    all_category_true
)

all_category_pred = np.array(
    all_category_pred
)


# ============================================================
# 6. TYPE METRICS
# ============================================================

type_accuracy = accuracy_score(
    all_type_true,
    all_type_pred
)

type_macro_f1 = f1_score(
    all_type_true,
    all_type_pred,
    average="macro",
    zero_division=0
)


print("\n" + "=" * 70)
print("TYPE RESULTS")
print("=" * 70)

print(
    f"Type Accuracy: {type_accuracy * 100:.2f}%"
)

print(
    f"Type Macro-F1: {type_macro_f1:.4f}"
)


# ============================================================
# 7. CATEGORY METRICS
# ============================================================

category_accuracy = accuracy_score(
    all_category_true,
    all_category_pred
)

category_macro_f1 = f1_score(
    all_category_true,
    all_category_pred,
    average="macro",
    zero_division=0
)

category_weighted_f1 = f1_score(
    all_category_true,
    all_category_pred,
    average="weighted",
    zero_division=0
)


print("\n" + "=" * 70)
print("CATEGORY RESULTS")
print("=" * 70)

print(
    f"Category Accuracy: "
    f"{category_accuracy * 100:.2f}%"
)

print(
    f"Category Macro-F1: "
    f"{category_macro_f1:.4f}"
)

print(
    f"Category Weighted-F1: "
    f"{category_weighted_f1:.4f}"
)


# ============================================================
# 8. CLASSIFICATION REPORT
# ============================================================

print("\n" + "=" * 70)
print("CATEGORY CLASSIFICATION REPORT")
print("=" * 70)

print(
    classification_report(
        all_category_true,
        all_category_pred,
        labels=np.arange(
            len(category_labels)
        ),
        target_names=category_labels,
        zero_division=0
    )
)


# ============================================================
# 9. CONFUSION MATRIX
# ============================================================

category_cm = confusion_matrix(
    all_category_true,
    all_category_pred,
    labels=np.arange(
        len(category_labels)
    )
)

print("\n" + "=" * 70)
print("CATEGORY CONFUSION MATRIX")
print("=" * 70)

print(
    pd.DataFrame(
        category_cm,
        index=category_labels,
        columns=category_labels
    )
)


# ============================================================
# 10. PER-CATEGORY SUMMARY
# ============================================================

report_dict = classification_report(
    all_category_true,
    all_category_pred,
    labels=np.arange(
        len(category_labels)
    ),
    target_names=category_labels,
    output_dict=True,
    zero_division=0
)

per_category = pd.DataFrame(
    report_dict
).T

print("\n" + "=" * 70)
print("PER-CATEGORY F1")
print("=" * 70)

print(
    per_category[
        [
            "precision",
            "recall",
            "f1-score",
            "support"
        ]
    ]
    .to_string()
)

=== CELL 18 ===
# ============================================================
# STEP 18 — ERROR ANALYSIS
# ============================================================

import torch
import pandas as pd
import numpy as np


# ============================================================
# 1. MAKE SURE BEST MODEL IS LOADED
# ============================================================

BEST_MODEL_PATH = (
    "/kaggle/working/"
    "muril_original_best.pt"
)

model.load_state_dict(
    torch.load(
        BEST_MODEL_PATH,
        map_location=device
    )
)

model.to(device)
model.eval()


# ============================================================
# 2. COLLECT PREDICTIONS + CONFIDENCE
# ============================================================

prediction_rows = []

row_position = 0


with torch.no_grad():

    for batch in val_loader:

        input_ids = batch[
            "input_ids"
        ].to(
            device,
            non_blocking=True
        )

        attention_mask = batch[
            "attention_mask"
        ].to(
            device,
            non_blocking=True
        )


        # Forward pass
        type_logits, category_logits = model(
            input_ids,
            attention_mask
        )


        # Convert logits to probabilities
        category_probs = torch.softmax(
            category_logits,
            dim=1
        )


        # Get prediction + confidence
        category_confidence, category_prediction = (
            torch.max(
                category_probs,
                dim=1
            )
        )


        # Move to CPU
        category_prediction = (
            category_prediction
            .cpu()
            .numpy()
        )

        category_confidence = (
            category_confidence
            .cpu()
            .numpy()
        )


        # Store predictions
        for i in range(
            len(category_prediction)
        ):

            actual_id = int(
                val_df.iloc[
                    row_position,
                    : 
                ]["category_id"]
            )

            predicted_id = int(
                category_prediction[i]
            )

            confidence = float(
                category_confidence[i]
            )

            prediction_rows.append(
                {
                    "text": val_df.iloc[
                        row_position
                    ]["text"],

                    "actual": category_labels[
                        actual_id
                    ],

                    "predicted": category_labels[
                        predicted_id
                    ],

                    "confidence": confidence,

                    "actual_id": actual_id,

                    "predicted_id": predicted_id
                }
            )

            row_position += 1


# ============================================================
# 3. CREATE RESULTS DATAFRAME
# ============================================================

results_df = pd.DataFrame(
    prediction_rows
)


# ============================================================
# 4. MARK CORRECT / INCORRECT
# ============================================================

results_df["correct"] = (
    results_df["actual_id"]
    ==
    results_df["predicted_id"]
)


# ============================================================
# 5. SHOW BASIC COUNTS
# ============================================================

print("=" * 70)
print("ERROR ANALYSIS SUMMARY")
print("=" * 70)

print(
    "Validation examples:",
    len(results_df)
)

print(
    "Correct:",
    results_df["correct"].sum()
)

print(
    "Incorrect:",
    (~results_df["correct"]).sum()
)


# ============================================================
# 6. SHOW ALL MISCLASSIFIED EXAMPLES
# ============================================================

errors_df = results_df[
    ~results_df["correct"]
].copy()

print("\n" + "=" * 70)
print("MISCLASSIFIED TRANSACTIONS")
print("=" * 70)

display(
    errors_df[
        [
            "text",
            "actual",
            "predicted",
            "confidence"
        ]
    ]
    .sort_values(
        "confidence",
        ascending=False
    )
)


# ============================================================
# 7. MOST COMMON CONFUSION PAIRS
# ============================================================

print("\n" + "=" * 70)
print("MOST COMMON CONFUSION PAIRS")
print("=" * 70)

confusion_pairs = (
    errors_df
    .groupby(
        [
            "actual",
            "predicted"
        ]
    )
    .size()
    .reset_index(
        name="count"
    )
    .sort_values(
        "count",
        ascending=False
    )
)

print(
    confusion_pairs.to_string(
        index=False
    )
)


# ============================================================
# 8. LOW-CONFIDENCE CORRECT PREDICTIONS
# ============================================================

print("\n" + "=" * 70)
print("LOW-CONFIDENCE CORRECT PREDICTIONS")
print("=" * 70)

low_conf_correct = results_df[
    results_df["correct"]
].sort_values(
    "confidence"
).head(20)

display(
    low_conf_correct[
        [
            "text",
            "actual",
            "confidence"
        ]
    ]
)


# ============================================================
# 9. WRONG PREDICTIONS BY ACTUAL CATEGORY
# ============================================================

print("\n" + "=" * 70)
print("ERRORS BY ACTUAL CATEGORY")
print("=" * 70)

errors_by_actual = (
    errors_df["actual"]
    .value_counts()
)

print(
    errors_by_actual
)


# ============================================================
# 10. WRONG PREDICTIONS BY PREDICTED CATEGORY
# ============================================================

print("\n" + "=" * 70)
print("ERRORS BY PREDICTED CATEGORY")
print("=" * 70)

errors_by_predicted = (
    errors_df["predicted"]
    .value_counts()
)

print(
    errors_by_predicted
)


=== CELL 19 ===
# ============================================================
# STEP 19 — INSPECT WEAK CATEGORY TRAINING EXAMPLES
# ============================================================

weak_categories = [
    "Family",
    "Leisure",
    "Other",
    "Household",
    "Health"
]


for category in weak_categories:

    print("\n")
    print("=" * 75)
    print("CATEGORY:", category)
    print("=" * 75)

    # --------------------------------------------------------
    # Get unique training examples
    # --------------------------------------------------------

    examples = (
        train_df[
            train_df["category"] == category
        ][
            ["text", "category"]
        ]
        .drop_duplicates()
        .sort_values("text")
    )


    print(
        "Unique training texts:",
        len(examples)
    )

    print(
        "\nTraining examples:"
    )

    display(
        examples[
            ["text", "category"]
        ].reset_index(
            drop=True
        )
    )

=== CELL 20 ===
# ============================================================
# STEP 20 — CREATE TEMPERED CLASS WEIGHTS
# ============================================================

import numpy as np
import torch


# ============================================================
# 1. ORIGINAL BALANCED WEIGHTS
# ============================================================

original_weights = class_weights.copy()


# ============================================================
# 2. TEMPER THE WEIGHTS
# ============================================================

tempered_weights = np.sqrt(
    original_weights
)


# ============================================================
# 3. NORMALIZE WEIGHTS
# ============================================================

# Make the average weight approximately 1.
tempered_weights = (
    tempered_weights
    / tempered_weights.mean()
)


# ============================================================
# 4. MOVE TO GPU
# ============================================================

tempered_category_weights = torch.tensor(
    tempered_weights,
    dtype=torch.float32
).to(device)


# ============================================================
# 5. COMPARE OLD VS NEW
# ============================================================

print("=" * 70)
print("ORIGINAL VS TEMPERED CLASS WEIGHTS")
print("=" * 70)

for category_id, category_name in enumerate(
    category_labels
):

    print(
        f"{category_id:2d} | "
        f"{category_name:15s} | "
        f"Original = {original_weights[category_id]:.4f} | "
        f"Tempered = {tempered_weights[category_id]:.4f}"
    )


# ============================================================
# 6. STATISTICS
# ============================================================

print("\n" + "=" * 70)
print("WEIGHT STATISTICS")
print("=" * 70)

print(
    "Original minimum:",
    round(
        original_weights.min(),
        4
    )
)

print(
    "Original maximum:",
    round(
        original_weights.max(),
        4
    )
)

print(
    "Tempered minimum:",
    round(
        tempered_weights.min(),
        4
    )
)

print(
    "Tempered maximum:",
    round(
        tempered_weights.max(),
        4
    )
)

print(
    "Tempered mean:",
    round(
        tempered_weights.mean(),
        4
    )
)

=== CELL 21 ===
# ============================================================
# STEP 21 — FRESH MuRIL + TEMPERED CLASS WEIGHTS
# ============================================================

import torch
import torch.nn as nn
from transformers import AutoModel


# ============================================================
# 1. LOAD A FRESH MuRIL BACKBONE
# ============================================================

MODEL_NAME = "google/muril-base-cased"

print("Loading fresh MuRIL model...")

fresh_bert = AutoModel.from_pretrained(
    MODEL_NAME
)

print("Fresh MuRIL loaded!")


# ============================================================
# 2. BUILD A FRESH CLASSIFIER
# ============================================================

tempered_model = TransactionClassifier(
    bert_model=fresh_bert,
    num_types=len(type_labels),
    num_categories=len(category_labels)
)


# ============================================================
# 3. MOVE MODEL TO GPU
# ============================================================

tempered_model = tempered_model.to(
    device
)


# ============================================================
# 4. CREATE LOSS FUNCTIONS
# ============================================================

tempered_type_loss_fn = nn.CrossEntropyLoss()

tempered_category_loss_fn = nn.CrossEntropyLoss(
    weight=tempered_category_weights
)


# ============================================================
# 5. CREATE FRESH OPTIMIZER
# ============================================================

tempered_optimizer = torch.optim.AdamW(
    tempered_model.parameters(),
    lr=2e-5
)


# ============================================================
# 6. MODEL INFORMATION
# ============================================================

print("\n" + "=" * 70)
print("TEMPERED-WEIGHT EXPERIMENT")
print("=" * 70)

print(
    "Device:",
    device
)

print(
    "Categories:",
    len(category_labels)
)

print(
    "Types:",
    len(type_labels)
)

print(
    "Learning rate:",
    2e-5
)

print(
    "Category loss:",
    "Tempered Weighted CrossEntropyLoss"
)


# ============================================================
# 7. COUNT PARAMETERS
# ============================================================

tempered_total_params = sum(
    p.numel()
    for p in tempered_model.parameters()
)

tempered_trainable_params = sum(
    p.numel()
    for p in tempered_model.parameters()
    if p.requires_grad
)

print(
    "\nTotal parameters:",
    f"{tempered_total_params:,}"
)

print(
    "Trainable parameters:",
    f"{tempered_trainable_params:,}"
)


# ============================================================
# 8. TEST ONE BATCH
# ============================================================

tempered_model.train()

batch = next(
    iter(train_loader)
)

input_ids = batch[
    "input_ids"
].to(
    device,
    non_blocking=True
)

attention_mask = batch[
    "attention_mask"
].to(
    device,
    non_blocking=True
)

type_ids = batch[
    "type_label"
].to(
    device,
    non_blocking=True
)

category_ids = batch[
    "category_label"
].to(
    device,
    non_blocking=True
)


# Forward pass
type_logits, category_logits = tempered_model(
    input_ids,
    attention_mask
)


# Losses
type_loss = tempered_type_loss_fn(
    type_logits,
    type_ids
)

category_loss = tempered_category_loss_fn(
    category_logits,
    category_ids
)

total_loss = (
    type_loss
    + category_loss
)


# ============================================================
# 9. DISPLAY TEST
# ============================================================

print("\n" + "=" * 70)
print("ONE-BATCH TEST")
print("=" * 70)

print(
    "Input shape:",
    input_ids.shape
)

print(
    "Type logits:",
    type_logits.shape
)

print(
    "Category logits:",
    category_logits.shape
)

print(
    "Type loss:",
    round(
        type_loss.item(),
        4
    )
)

print(
    "Category loss:",
    round(
        category_loss.item(),
        4
    )
)

print(
    "Total loss:",
    round(
        total_loss.item(),
        4
    )
)

=== CELL 22 ===
# ============================================================
# STEP 21 — CREATE WHATSAPP / HINGLISH DATASET
# ============================================================

import pandas as pd


# ============================================================
# 1. WHATSAPP MESSAGE TEMPLATES
# ============================================================

expense_templates = [
    "yaar {text} pe paise lag gaye",
    "bhai {text} ka kharcha hua",
    "aaj {text} ke liye payment kiya",
    "maine {text} liya, paise chale gaye",
    "aaj {text} ke paise diye",
    "just {text} ka payment kar diya",
    "{text} le liya yaar",
    "bhai aaj {text} par spend kiya",
    "{text} ka paisa de diya",
    "aaj {text} ke liye pay kiya"
]

income_templates = [
    "yaar {text} aa gayi",
    "bhai {text} mil gayi",
    "aaj {text} receive hui",
    "account me {text} aayi",
    "{text} credited ho gayi",
    "aaj mujhe {text} mila",
    "{text} aa gaya account me",
    "bhai aaj {text} receive hua"
]


# ============================================================
# 2. FUNCTION TO GENERATE WHATSAPP VARIANTS
# ============================================================

def generate_whatsapp_variants(
    dataframe,
    variants_per_text=8
):

    rows = []

    # Use unique text + category + type
    unique_data = (
        dataframe[
            [
                "text",
                "category",
                "type",
                "category_id",
                "type_id"
            ]
        ]
        .drop_duplicates()
        .reset_index(drop=True)
    )

    for _, row in unique_data.iterrows():

        original_text = str(
            row["text"]
        )

        category = row["category"]
        transaction_type = row["type"]

        category_id = row["category_id"]
        type_id = row["type_id"]

        # ----------------------------------------------------
        # Choose templates based on income/expense
        # ----------------------------------------------------

        if transaction_type == "Income":
            templates = income_templates
        else:
            templates = expense_templates

        # ----------------------------------------------------
        # Keep only requested number
        # ----------------------------------------------------

        selected_templates = templates[
            :variants_per_text
        ]

        # ----------------------------------------------------
        # Add original text
        # ----------------------------------------------------

        rows.append({
            "text": original_text,
            "category": category,
            "type": transaction_type,
            "category_id": category_id,
            "type_id": type_id,
            "style": "original"
        })

        # ----------------------------------------------------
        # Add WhatsApp variants
        # ----------------------------------------------------

        for template in selected_templates:

            whatsapp_text = template.format(
                text=original_text
            )

            rows.append({
                "text": whatsapp_text,
                "category": category,
                "type": transaction_type,
                "category_id": category_id,
                "type_id": type_id,
                "style": "whatsapp"
            })

    return pd.DataFrame(rows)


# ============================================================
# 3. GENERATE TRAINING DATA
# ============================================================

whatsapp_train_df = generate_whatsapp_variants(
    train_df,
    variants_per_text=8
)


# ============================================================
# 4. GENERATE VALIDATION DATA
# ============================================================

whatsapp_val_df = generate_whatsapp_variants(
    val_df,
    variants_per_text=8
)


# ============================================================
# 5. DISPLAY DATASET SIZES
# ============================================================

print("=" * 70)
print("WHATSAPP DATASET SIZES")
print("=" * 70)

print(
    "Original training rows:",
    len(train_df)
)

print(
    "WhatsApp training rows:",
    len(whatsapp_train_df)
)

print(
    "Original validation rows:",
    len(val_df)
)

print(
    "WhatsApp validation rows:",
    len(whatsapp_val_df)
)


# ============================================================
# 6. CHECK CATEGORY DISTRIBUTION
# ============================================================

print("\n" + "=" * 70)
print("WHATSAPP TRAIN CATEGORY DISTRIBUTION")
print("=" * 70)

print(
    whatsapp_train_df[
        "category"
    ].value_counts()
)


print("\n" + "=" * 70)
print("WHATSAPP VALIDATION CATEGORY DISTRIBUTION")
print("=" * 70)

print(
    whatsapp_val_df[
        "category"
    ].value_counts()
)


# ============================================================
# 7. SHOW ACTUAL WHATSAPP EXAMPLES
# ============================================================

print("\n" + "=" * 70)
print("WHATSAPP-STYLE EXAMPLES")
print("=" * 70)

display(
    whatsapp_train_df[
        whatsapp_train_df["style"] == "whatsapp"
    ][
        [
            "text",
            "category"
        ]
    ].head(40)
)


# ============================================================
# 8. CHECK FOR CROSS-SPLIT TEXT LEAKAGE
# ============================================================

train_texts = set(
    whatsapp_train_df["text"]
)

val_texts = set(
    whatsapp_val_df["text"]
)

overlap = train_texts.intersection(
    val_texts
)

print("\n" + "=" * 70)
print("CROSS-SPLIT LEAKAGE CHECK")
print("=" * 70)

print(
    "Exact texts appearing in both:",
    len(overlap)
)


# ============================================================
# 9. SHOW SOME REALISTIC EXAMPLES FROM DIFFERENT CLASSES
# ============================================================

print("\n" + "=" * 70)
print("SAMPLE BY CATEGORY")
print("=" * 70)

for category in [
    "Food",
    "Apparel",
    "Health",
    "Transportation",
    "Subscription",
    "Family",
    "Leisure"
]:

    sample = whatsapp_train_df[
        (
            whatsapp_train_df["category"]
            == category
        )
        &
        (
            whatsapp_train_df["style"]
            == "whatsapp"
        )
    ].head(3)

    print("\nCATEGORY:", category)

    for text in sample["text"]:
        print("-", text)

=== CELL 23 ===
# ============================================================
# STEP 22 — CREATE REALISTIC WHATSAPP TEST SET
# ============================================================

real_whatsapp_test = [

    # ---------------- FOOD ----------------
    ("yaar 250 ka pizza mangaya", "Food"),
    ("aaj 180 ka burger khaya", "Food"),
    ("swiggy pe 420 ka dinner order kiya", "Food"),
    ("bhai chai aur snacks pe 90 rupaye gaye", "Food"),
    ("250 ka paneer order kar diya", "Food"),

    # ---------------- APPAREL ----------------
    ("amazon se 1800 ke shoes liye", "Apparel"),
    ("bhai 1200 ki tshirt kharidi", "Apparel"),
    ("aaj 900 ka kurta liya", "Apparel"),
    ("1500 ki jeans le li", "Apparel"),

    # ---------------- HEALTH ----------------
    ("doctor ko 600 diye", "Health"),
    ("medicine pe 350 kharch hue", "Health"),
    ("bhai 1200 ki medicines li", "Health"),
    ("eye checkup ka 800 laga", "Health"),

    # ---------------- TRANSPORTATION ----------------
    ("uber se ghar aaya 220", "Transportation"),
    ("aaj auto ke 120 diye", "Transportation"),
    ("metro ka 60 ka ticket liya", "Transportation"),
    ("cab pe 450 kharch hue", "Transportation"),

    # ---------------- SUBSCRIPTION ----------------
    ("netflix ka 199 wala plan renew kiya", "Subscription"),
    ("spotify ke 119 rupaye diye", "Subscription"),
    ("bhai mobile recharge 299 ka kiya", "Subscription"),
    ("tata play recharge 350 ka hua", "Subscription"),

    # ---------------- HOUSEHOLD ----------------
    ("ghar ke liye 1200 ka bedsheet liya", "Household"),
    ("500 ke cleaning supplies liye", "Household"),
    ("bhai 300 ka bulb aur switch liya", "Household"),
    ("ghar ke saman pe 900 lage", "Household"),

    # ---------------- INVESTMENT ----------------
    ("bhai 5000 mutual fund me daale", "Investment"),
    ("aaj 2000 ka sip kiya", "Investment"),
    ("zerodha me 3000 invest kiye", "Investment"),

    # ---------------- GIFT ----------------
    ("friend ke birthday pe 700 ka gift liya", "Gift"),
    ("bhai shaadi ke gift pe 1500 lage", "Gift"),

    # ---------------- EDUCATION ----------------
    ("course ke 2000 diye", "Education"),
    ("college form ke 500 lage", "Education"),

    # ---------------- LEISURE ----------------
    ("aaj movie ke 500 lage", "Leisure"),
    ("pvr me 700 kharch hue", "Leisure"),
    ("weekend outing pe 1000 gaye", "Leisure"),

    # ---------------- BEAUTY ----------------
    ("haircut ke 300 diye", "Beauty"),
    ("salon pe 800 kharch hue", "Beauty"),

    # ---------------- FAMILY ----------------
    ("mummy ke liye 1500 ka saman liya", "Family"),
    ("bhai ko 500 ka gift diya", "Family"),

    # ---------------- FESTIVALS ----------------
    ("diwali ke saman pe 1200 kharch hue", "Festivals"),
    ("puja ka saman 600 ka liya", "Festivals"),

    # ---------------- OTHER ----------------
    ("yaar 250 ka random expense ho gaya", "Other"),
    ("500 ka miscellaneous kharcha ho gaya", "Other"),

    # ---------------- SALARY ----------------
    ("aaj salary 45000 aa gayi", "Salary"),
    ("bhai salary credit ho gayi 50000", "Salary"),
]


# ============================================================
# CREATE DATAFRAME
# ============================================================

real_whatsapp_test_df = pd.DataFrame(
    real_whatsapp_test,
    columns=[
        "text",
        "category"
    ]
)


# ============================================================
# MAP CATEGORY TO ID
# ============================================================

real_whatsapp_test_df["category_id"] = (
    real_whatsapp_test_df["category"]
    .map(category_to_id)
)


# ============================================================
# CHECK RESULTS
# ============================================================

print("=" * 70)
print("REALISTIC WHATSAPP TEST SET")
print("=" * 70)

print(
    "Number of test messages:",
    len(real_whatsapp_test_df)
)

print(
    "\nCategory distribution:"
)

print(
    real_whatsapp_test_df[
        "category"
    ].value_counts()
)


print(
    "\nMissing category IDs:",
    real_whatsapp_test_df[
        "category_id"
    ].isna().sum()
)


print(
    "\nSample messages:"
)

display(
    real_whatsapp_test_df.head(20)
)

=== CELL 24 ===
# ============================================================
# STEP 23 — BUILD WHATSAPP TRAINING / VALIDATION LOADERS
# ============================================================

import torch
from torch.utils.data import Dataset, DataLoader


# ============================================================
# 1. SETTINGS
# ============================================================

WHATSAPP_MAX_LENGTH = 32
WHATSAPP_BATCH_SIZE = 16


# ============================================================
# 2. DATASET CLASS
# ============================================================

class WhatsAppTransactionDataset(Dataset):

    def __init__(
        self,
        dataframe,
        tokenizer,
        max_length=32
    ):

        self.data = dataframe.reset_index(
            drop=True
        )

        self.tokenizer = tokenizer
        self.max_length = max_length


    def __len__(self):

        return len(self.data)


    def __getitem__(self, idx):

        text = str(
            self.data.loc[idx, "text"]
        )

        encoding = self.tokenizer(
            text,
            truncation=True,
            padding="max_length",
            max_length=self.max_length,
            return_tensors="pt"
        )

        return {
            "input_ids": encoding[
                "input_ids"
            ].squeeze(0),

            "attention_mask": encoding[
                "attention_mask"
            ].squeeze(0),

            "type_label": torch.tensor(
                self.data.loc[idx, "type_id"],
                dtype=torch.long
            ),

            "category_label": torch.tensor(
                self.data.loc[idx, "category_id"],
                dtype=torch.long
            )
        }


# ============================================================
# 3. CREATE DATASETS
# ============================================================

whatsapp_train_dataset = WhatsAppTransactionDataset(
    whatsapp_train_df,
    tokenizer,
    WHATSAPP_MAX_LENGTH
)

whatsapp_val_dataset = WhatsAppTransactionDataset(
    whatsapp_val_df,
    tokenizer,
    WHATSAPP_MAX_LENGTH
)


# ============================================================
# 4. CREATE DATALOADERS
# ============================================================

whatsapp_train_loader = DataLoader(
    whatsapp_train_dataset,
    batch_size=WHATSAPP_BATCH_SIZE,
    shuffle=True,
    num_workers=2,
    pin_memory=torch.cuda.is_available()
)

whatsapp_val_loader = DataLoader(
    whatsapp_val_dataset,
    batch_size=WHATSAPP_BATCH_SIZE,
    shuffle=False,
    num_workers=2,
    pin_memory=torch.cuda.is_available()
)


# ============================================================
# 5. DISPLAY INFORMATION
# ============================================================

print("=" * 70)
print("WHATSAPP DATALOADERS")
print("=" * 70)

print(
    "Training dataset:",
    len(whatsapp_train_dataset)
)

print(
    "Validation dataset:",
    len(whatsapp_val_dataset)
)

print(
    "Batch size:",
    WHATSAPP_BATCH_SIZE
)

print(
    "Training batches:",
    len(whatsapp_train_loader)
)

print(
    "Validation batches:",
    len(whatsapp_val_loader)
)


# ============================================================
# 6. CHECK ONE BATCH
# ============================================================

batch = next(
    iter(whatsapp_train_loader)
)

print("\n" + "=" * 70)
print("ONE WHATSAPP BATCH")
print("=" * 70)

print(
    "input_ids:",
    batch["input_ids"].shape
)

print(
    "attention_mask:",
    batch["attention_mask"].shape
)

print(
    "type_label:",
    batch["type_label"].shape
)

print(
    "category_label:",
    batch["category_label"].shape
)

=== CELL 25 ===
# ============================================================
# STEP 24 — LOAD BEST MODEL FOR WHATSAPP FINE-TUNING
# ============================================================

import torch
import torch.nn as nn


# ============================================================
# 1. LOAD THE ORIGINAL BEST CHECKPOINT
# ============================================================

BEST_MODEL_PATH = (
    "/kaggle/working/"
    "muril_original_best.pt"
)

print("Loading original best MuRIL checkpoint...")


model.load_state_dict(
    torch.load(
        BEST_MODEL_PATH,
        map_location=device
    )
)

model = model.to(device)

print("Checkpoint loaded successfully!")


# ============================================================
# 2. CREATE WHATSAPP-TUNING LOSS FUNCTIONS
# ============================================================

whatsapp_type_loss_fn = nn.CrossEntropyLoss()

whatsapp_category_loss_fn = nn.CrossEntropyLoss(
    weight=category_class_weights
)


# ============================================================
# 3. CREATE A SMALLER LEARNING RATE
# ============================================================

whatsapp_optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=1e-5,
    weight_decay=0.01
)


# ============================================================
# 4. CHECK MODEL PARAMETER COUNT
# ============================================================

trainable_params = sum(
    p.numel()
    for p in model.parameters()
    if p.requires_grad
)


print("\n" + "=" * 70)
print("WHATSAPP FINE-TUNING CONFIGURATION")
print("=" * 70)

print(
    "Trainable parameters:",
    f"{trainable_params:,}"
)

print(
    "Learning rate:",
    1e-5
)

print(
    "Weight decay:",
    0.01
)

print(
    "Category loss:",
    "Weighted CrossEntropyLoss"
)


# ============================================================
# 5. TEST ONE WHATSAPP BATCH
# ============================================================

model.eval()

batch = next(
    iter(whatsapp_train_loader)
)

input_ids = batch[
    "input_ids"
].to(
    device,
    non_blocking=True
)

attention_mask = batch[
    "attention_mask"
].to(
    device,
    non_blocking=True
)

type_ids = batch[
    "type_label"
].to(
    device,
    non_blocking=True
)

category_ids = batch[
    "category_label"
].to(
    device,
    non_blocking=True
)


with torch.no_grad():

    type_logits, category_logits = model(
        input_ids,
        attention_mask
    )


# ============================================================
# 6. CALCULATE TEST LOSSES
# ============================================================

type_loss = whatsapp_type_loss_fn(
    type_logits,
    type_ids
)

category_loss = whatsapp_category_loss_fn(
    category_logits,
    category_ids
)

total_loss = (
    type_loss
    + category_loss
)


# ============================================================
# 7. DISPLAY RESULTS
# ============================================================

print("\n" + "=" * 70)
print("WHATSAPP ONE-BATCH TEST")
print("=" * 70)

print(
    "Input shape:",
    input_ids.shape
)

print(
    "Type logits:",
    type_logits.shape
)

print(
    "Category logits:",
    category_logits.shape
)

print(
    "Type loss:",
    round(
        type_loss.item(),
        4
    )
)

print(
    "Category loss:",
    round(
        category_loss.item(),
        4
    )
)

print(
    "Total loss:",
    round(
        total_loss.item(),
        4
    )
)

=== CELL 26 ===
# ============================================================
# STEP 25 — WHATSAPP FINE-TUNING
# ============================================================

import torch
import numpy as np

from sklearn.metrics import (
    accuracy_score,
    f1_score
)


# ============================================================
# 1. CONFIGURATION
# ============================================================

NUM_EPOCHS = 6

BEST_WHATSAPP_MODEL_PATH = (
    "/kaggle/working/"
    "muril_whatsapp_best.pt"
)

best_val_macro_f1 = -1.0
best_val_accuracy = -1.0
patience = 2
epochs_without_improvement = 0


# ============================================================
# 2. EVALUATION FUNCTION
# ============================================================

def evaluate_whatsapp(loader):

    model.eval()

    all_type_true = []
    all_type_pred = []

    all_category_true = []
    all_category_pred = []

    total_loss = 0.0

    with torch.no_grad():

        for batch in loader:

            input_ids = batch[
                "input_ids"
            ].to(
                device,
                non_blocking=True
            )

            attention_mask = batch[
                "attention_mask"
            ].to(
                device,
                non_blocking=True
            )

            type_ids = batch[
                "type_label"
            ].to(
                device,
                non_blocking=True
            )

            category_ids = batch[
                "category_label"
            ].to(
                device,
                non_blocking=True
            )

            # Forward pass
            type_logits, category_logits = model(
                input_ids,
                attention_mask
            )

            # Loss
            type_loss = whatsapp_type_loss_fn(
                type_logits,
                type_ids
            )

            category_loss = whatsapp_category_loss_fn(
                category_logits,
                category_ids
            )

            loss = type_loss + category_loss

            total_loss += loss.item()

            # Predictions
            type_preds = torch.argmax(
                type_logits,
                dim=1
            )

            category_preds = torch.argmax(
                category_logits,
                dim=1
            )

            # Move to CPU
            all_type_true.extend(
                type_ids.cpu().numpy()
            )

            all_type_pred.extend(
                type_preds.cpu().numpy()
            )

            all_category_true.extend(
                category_ids.cpu().numpy()
            )

            all_category_pred.extend(
                category_preds.cpu().numpy()
            )

    # --------------------------------------------------------
    # Convert to NumPy
    # --------------------------------------------------------

    all_type_true = np.array(
        all_type_true
    )

    all_type_pred = np.array(
        all_type_pred
    )

    all_category_true = np.array(
        all_category_true
    )

    all_category_pred = np.array(
        all_category_pred
    )

    # --------------------------------------------------------
    # Type metrics
    # --------------------------------------------------------

    type_accuracy = accuracy_score(
        all_type_true,
        all_type_pred
    )

    type_macro_f1 = f1_score(
        all_type_true,
        all_type_pred,
        average="macro",
        zero_division=0
    )

    # --------------------------------------------------------
    # Category metrics
    # --------------------------------------------------------

    category_accuracy = accuracy_score(
        all_category_true,
        all_category_pred
    )

    # Only categories actually present in validation
    present_labels = np.unique(
        all_category_true
    )

    category_macro_f1 = f1_score(
        all_category_true,
        all_category_pred,
        labels=present_labels,
        average="macro",
        zero_division=0
    )

    average_loss = (
        total_loss / len(loader)
    )

    return {
        "loss": average_loss,
        "type_accuracy": type_accuracy,
        "type_macro_f1": type_macro_f1,
        "category_accuracy": category_accuracy,
        "category_macro_f1": category_macro_f1,
        "type_true": all_type_true,
        "type_pred": all_type_pred,
        "category_true": all_category_true,
        "category_pred": all_category_pred
    }


# ============================================================
# 3. TRAINING LOOP
# ============================================================

print("=" * 70)
print("STARTING WHATSAPP MÚRIL FINE-TUNING")
print("=" * 70)

for epoch in range(NUM_EPOCHS):

    model.train()

    running_loss = 0.0

    train_type_true = []
    train_type_pred = []

    train_category_true = []
    train_category_pred = []

    for batch in whatsapp_train_loader:

        # ----------------------------------------------------
        # Move batch to GPU / device
        # ----------------------------------------------------

        input_ids = batch[
            "input_ids"
        ].to(
            device,
            non_blocking=True
        )

        attention_mask = batch[
            "attention_mask"
        ].to(
            device,
            non_blocking=True
        )

        type_ids = batch[
            "type_label"
        ].to(
            device,
            non_blocking=True
        )

        category_ids = batch[
            "category_label"
        ].to(
            device,
            non_blocking=True
        )

        # ----------------------------------------------------
        # Clear old gradients
        # ----------------------------------------------------

        whatsapp_optimizer.zero_grad(
            set_to_none=True
        )

        # ----------------------------------------------------
        # Forward pass
        # ----------------------------------------------------

        type_logits, category_logits = model(
            input_ids,
            attention_mask
        )

        # ----------------------------------------------------
        # Calculate losses
        # ----------------------------------------------------

        type_loss = whatsapp_type_loss_fn(
            type_logits,
            type_ids
        )

        category_loss = whatsapp_category_loss_fn(
            category_logits,
            category_ids
        )

        total_loss = (
            type_loss
            + category_loss
        )

        # ----------------------------------------------------
        # Backpropagation
        # ----------------------------------------------------

        total_loss.backward()

        # ----------------------------------------------------
        # Gradient clipping
        # ----------------------------------------------------

        torch.nn.utils.clip_grad_norm_(
            model.parameters(),
            max_norm=1.0
        )

        # ----------------------------------------------------
        # Update weights
        # ----------------------------------------------------

        whatsapp_optimizer.step()

        running_loss += total_loss.item()

        # ----------------------------------------------------
        # Save predictions for training metrics
        # ----------------------------------------------------

        type_preds = torch.argmax(
            type_logits,
            dim=1
        )

        category_preds = torch.argmax(
            category_logits,
            dim=1
        )

        train_type_true.extend(
            type_ids.detach().cpu().numpy()
        )

        train_type_pred.extend(
            type_preds.detach().cpu().numpy()
        )

        train_category_true.extend(
            category_ids.detach().cpu().numpy()
        )

        train_category_pred.extend(
            category_preds.detach().cpu().numpy()
        )

    # ========================================================
    # TRAINING METRICS
    # ========================================================

    train_loss = (
        running_loss /
        len(whatsapp_train_loader)
    )

    train_type_accuracy = accuracy_score(
        train_type_true,
        train_type_pred
    )

    train_category_accuracy = accuracy_score(
        train_category_true,
        train_category_pred
    )

    # ========================================================
    # VALIDATION
    # ========================================================

    val_metrics = evaluate_whatsapp(
        whatsapp_val_loader
    )

    # ========================================================
    # DISPLAY RESULTS
    # ========================================================

    print("\n" + "-" * 70)

    print(
        f"Epoch {epoch + 1}/{NUM_EPOCHS}"
    )

    print(
        f"Train Loss: "
        f"{train_loss:.4f}"
    )

    print(
        f"Train Type Acc: "
        f"{train_type_accuracy * 100:.2f}%"
    )

    print(
        f"Train Category Acc: "
        f"{train_category_accuracy * 100:.2f}%"
    )

    print(
        f"Val Loss: "
        f"{val_metrics['loss']:.4f}"
    )

    print(
        f"Val Type Acc: "
        f"{val_metrics['type_accuracy'] * 100:.2f}%"
    )

    print(
        f"Val Type Macro-F1: "
        f"{val_metrics['type_macro_f1']:.4f}"
    )

    print(
        f"Val Category Acc: "
        f"{val_metrics['category_accuracy'] * 100:.2f}%"
    )

    print(
        f"Val Category Macro-F1: "
        f"{val_metrics['category_macro_f1']:.4f}"
    )

    # ========================================================
    # SAVE BEST MODEL
    # ========================================================

    current_f1 = (
        val_metrics["category_macro_f1"]
    )

    if current_f1 > best_val_macro_f1:

        best_val_macro_f1 = current_f1

        best_val_accuracy = (
            val_metrics["category_accuracy"]
        )

        epochs_without_improvement = 0

        torch.save(
            model.state_dict(),
            BEST_WHATSAPP_MODEL_PATH
        )

        print(
            "\n✅ NEW BEST MODEL SAVED"
        )

        print(
            f"Best Val Category Macro-F1: "
            f"{best_val_macro_f1:.4f}"
        )

        print(
            f"Best Val Category Accuracy: "
            f"{best_val_accuracy * 100:.2f}%"
        )

    else:

        epochs_without_improvement += 1

        print(
            f"\nNo improvement."
            f" Patience: "
            f"{epochs_without_improvement}/{patience}"
        )

    # ========================================================
    # EARLY STOPPING
    # ========================================================

    if epochs_without_improvement >= patience:

        print(
            "\n⏹ Early stopping triggered."
        )

        break


# ============================================================
# 4. LOAD BEST WHATSAPP CHECKPOINT
# ============================================================

print("\n" + "=" * 70)
print("LOADING BEST WHATSAPP CHECKPOINT")
print("=" * 70)

model.load_state_dict(
    torch.load(
        BEST_WHATSAPP_MODEL_PATH,
        map_location=device
    )
)

model = model.to(device)

print(
    "Best WhatsApp model loaded successfully!"
)

print(
    f"Best validation category accuracy: "
    f"{best_val_accuracy * 100:.2f}%"
)

print(
    f"Best validation category macro-F1: "
    f"{best_val_macro_f1:.4f}"
)

=== CELL 27 ===
# ============================================================
# STEP 26 — REALISTIC WHATSAPP TEST
# ============================================================

import pandas as pd
import numpy as np
import torch

from torch.utils.data import Dataset, DataLoader
from sklearn.metrics import (
    accuracy_score,
    classification_report
)


# ============================================================
# 1. REALISTIC WHATSAPP TEST MESSAGES
# ============================================================

realistic_test_data = [

    # ---------------- FOOD ----------------
    ("yaar 250 ka pizza mangaya", "Food", "Expense"),
    ("aaj 180 ka burger khaya", "Food", "Expense"),
    ("swiggy pe 420 ka dinner order kiya", "Food", "Expense"),
    ("bhai chai aur snacks pe 90 rupaye gaye", "Food", "Expense"),
    ("250 ka paneer order kar diya", "Food", "Expense"),

    # ---------------- APPAREL ----------------
    ("amazon se 1800 ke shoes liye", "Apparel", "Expense"),
    ("bhai 1200 ki tshirt kharidi", "Apparel", "Expense"),
    ("aaj 900 ka kurta liya", "Apparel", "Expense"),
    ("1500 ki jeans le li", "Apparel", "Expense"),

    # ---------------- HEALTH ----------------
    ("doctor ko 600 diye", "Health", "Expense"),
    ("medicine pe 350 kharch hue", "Health", "Expense"),
    ("bhai 1200 ki medicines li", "Health", "Expense"),
    ("eye checkup ka 800 laga", "Health", "Expense"),

    # ---------------- TRANSPORTATION ----------------
    ("uber se ghar aaya 220", "Transportation", "Expense"),
    ("aaj auto ke 120 diye", "Transportation", "Expense"),
    ("metro ka 60 ka ticket liya", "Transportation", "Expense"),
    ("cab pe 450 kharch hue", "Transportation", "Expense"),

    # ---------------- SUBSCRIPTION ----------------
    ("netflix ka 199 wala plan renew kiya", "Subscription", "Expense"),
    ("spotify ke 119 rupaye diye", "Subscription", "Expense"),
    ("bhai mobile recharge 299 ka kiya", "Subscription", "Expense"),
    ("tata play recharge 350 ka hua", "Subscription", "Expense"),

    # ---------------- HOUSEHOLD ----------------
    ("ghar ke liye 1200 ka bedsheet liya", "Household", "Expense"),
    ("500 ke cleaning supplies liye", "Household", "Expense"),
    ("bhai 300 ka bulb aur switch liya", "Household", "Expense"),
    ("ghar ke saman pe 900 lage", "Household", "Expense"),

    # ---------------- INVESTMENT ----------------
    ("bhai 5000 mutual fund me daale", "Investment", "Expense"),
    ("aaj 2000 ka sip kiya", "Investment", "Expense"),
    ("zerodha me 3000 invest kiye", "Investment", "Expense"),

    # ---------------- GIFT ----------------
    ("friend ke birthday pe 700 ka gift liya", "Gift", "Expense"),
    ("bhai shaadi ke gift pe 1500 lage", "Gift", "Expense"),

    # ---------------- EDUCATION ----------------
    ("course ke 2000 diye", "Education", "Expense"),
    ("college form ke 500 lage", "Education", "Expense"),

    # ---------------- LEISURE ----------------
    ("aaj movie ke 500 lage", "Leisure", "Expense"),
    ("pvr me 700 kharch hue", "Leisure", "Expense"),
    ("weekend outing pe 1000 gaye", "Leisure", "Expense"),

    # ---------------- BEAUTY ----------------
    ("haircut ke 300 diye", "Beauty", "Expense"),
    ("salon pe 800 kharch hue", "Beauty", "Expense"),

    # ---------------- FAMILY ----------------
    ("mummy ke liye 1500 ka saman liya", "Family", "Expense"),
    ("bhai ko 500 ka gift diya", "Family", "Expense"),

    # ---------------- FESTIVALS ----------------
    ("diwali ke saman pe 1200 kharch hue", "Festivals", "Expense"),
    ("puja ka saman 600 ka liya", "Festivals", "Expense"),

    # ---------------- OTHER ----------------
    ("yaar 250 ka random expense ho gaya", "Other", "Expense"),
    ("500 ka miscellaneous kharcha ho gaya", "Other", "Expense"),

    # ---------------- SALARY ----------------
    ("aaj salary 45000 aa gayi", "Salary", "Income"),
    ("bhai salary credit ho gayi 50000", "Salary", "Income"),
]


realistic_test_df = pd.DataFrame(
    realistic_test_data,
    columns=[
        "text",
        "category",
        "type"
    ]
)


print("=" * 70)
print("REALISTIC WHATSAPP TEST SET")
print("=" * 70)

print(
    "Number of messages:",
    len(realistic_test_df)
)

print(
    "\nCategory distribution:"
)

print(
    realistic_test_df["category"].value_counts()
)


# ============================================================
# 2. CREATE LABEL MAPPINGS
# ============================================================

category_to_id = {
    label: idx
    for idx, label in enumerate(category_labels)
}

type_to_id = {
    label: idx
    for idx, label in enumerate(type_labels)
}


realistic_test_df["category_id"] = (
    realistic_test_df["category"]
    .map(category_to_id)
)

realistic_test_df["type_id"] = (
    realistic_test_df["type"]
    .map(type_to_id)
)


print("\n" + "=" * 70)
print("LABEL CHECK")
print("=" * 70)

print(
    "Missing category IDs:",
    realistic_test_df["category_id"].isna().sum()
)

print(
    "Missing type IDs:",
    realistic_test_df["type_id"].isna().sum()
)


# ============================================================
# 3. DATASET
# ============================================================

class RealisticWhatsAppDataset(Dataset):

    def __init__(
        self,
        df,
        tokenizer,
        max_length=32
    ):

        self.df = df.reset_index(drop=True)
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):

        return len(self.df)

    def __getitem__(self, idx):

        row = self.df.iloc[idx]

        encoded = self.tokenizer(
            row["text"],
            padding="max_length",
            truncation=True,
            max_length=self.max_length,
            return_tensors="pt"
        )

        return {
            "input_ids": encoded[
                "input_ids"
            ].squeeze(0),

            "attention_mask": encoded[
                "attention_mask"
            ].squeeze(0),

            "type_label": torch.tensor(
                int(row["type_id"]),
                dtype=torch.long
            ),

            "category_label": torch.tensor(
                int(row["category_id"]),
                dtype=torch.long
            ),

            "text": row["text"]
        }


# ============================================================
# 4. CREATE TEST LOADER
# ============================================================

realistic_test_dataset = RealisticWhatsAppDataset(
    realistic_test_df,
    tokenizer,
    max_length=32
)

realistic_test_loader = DataLoader(
    realistic_test_dataset,
    batch_size=16,
    shuffle=False
)


print("\n" + "=" * 70)
print("TEST DATALOADER")
print("=" * 70)

print(
    "Dataset size:",
    len(realistic_test_dataset)
)

print(
    "Batches:",
    len(realistic_test_loader)
)


# ============================================================
# 5. EVALUATION FUNCTION
# ============================================================

def evaluate_model_on_realistic_test(model_path):

    # Load model checkpoint
    model.load_state_dict(
        torch.load(
            model_path,
            map_location=device
        )
    )

    model.to(device)
    model.eval()

    all_type_true = []
    all_type_pred = []

    all_category_true = []
    all_category_pred = []

    all_texts = []

    with torch.no_grad():

        for batch in realistic_test_loader:

            input_ids = batch[
                "input_ids"
            ].to(
                device,
                non_blocking=True
            )

            attention_mask = batch[
                "attention_mask"
            ].to(
                device,
                non_blocking=True
            )

            type_ids = batch[
                "type_label"
            ].to(
                device,
                non_blocking=True
            )

            category_ids = batch[
                "category_label"
            ].to(
                device,
                non_blocking=True
            )

            # Forward pass
            type_logits, category_logits = model(
                input_ids,
                attention_mask
            )

            # Predictions
            type_preds = torch.argmax(
                type_logits,
                dim=1
            )

            category_preds = torch.argmax(
                category_logits,
                dim=1
            )

            # Store predictions
            all_type_true.extend(
                type_ids.cpu().numpy()
            )

            all_type_pred.extend(
                type_preds.cpu().numpy()
            )

            all_category_true.extend(
                category_ids.cpu().numpy()
            )

            all_category_pred.extend(
                category_preds.cpu().numpy()
            )

            all_texts.extend(
                batch["text"]
            )

    return {
        "texts": all_texts,
        "type_true": np.array(all_type_true),
        "type_pred": np.array(all_type_pred),
        "category_true": np.array(
            all_category_true
        ),
        "category_pred": np.array(
            all_category_pred
        )
    }


# ============================================================
# 6. EVALUATE ORIGINAL MODEL
# ============================================================

print("\n" + "=" * 70)
print("TESTING ORIGINAL MODEL")
print("=" * 70)

original_results = evaluate_model_on_realistic_test(
    "/kaggle/working/muril_original_best.pt"
)

original_category_accuracy = accuracy_score(
    original_results["category_true"],
    original_results["category_pred"]
)

original_type_accuracy = accuracy_score(
    original_results["type_true"],
    original_results["type_pred"]
)

print(
    "Original Category Accuracy:",
    f"{original_category_accuracy * 100:.2f}%"
)

print(
    "Original Type Accuracy:",
    f"{original_type_accuracy * 100:.2f}%"
)


# ============================================================
# 7. EVALUATE WHATSAPP MODEL
# ============================================================

print("\n" + "=" * 70)
print("TESTING WHATSAPP-FINE-TUNED MODEL")
print("=" * 70)

whatsapp_results = evaluate_model_on_realistic_test(
    "/kaggle/working/muril_whatsapp_best.pt"
)

whatsapp_category_accuracy = accuracy_score(
    whatsapp_results["category_true"],
    whatsapp_results["category_pred"]
)

whatsapp_type_accuracy = accuracy_score(
    whatsapp_results["type_true"],
    whatsapp_results["type_pred"]
)

print(
    "WhatsApp Category Accuracy:",
    f"{whatsapp_category_accuracy * 100:.2f}%"
)

print(
    "WhatsApp Type Accuracy:",
    f"{whatsapp_type_accuracy * 100:.2f}%"
)


# ============================================================
# 8. COMPARISON
# ============================================================

print("\n" + "=" * 70)
print("MODEL COMPARISON")
print("=" * 70)

print(
    f"Original Model Category Accuracy:"
    f" {original_category_accuracy * 100:.2f}%"
)

print(
    f"WhatsApp Model Category Accuracy:"
    f" {whatsapp_category_accuracy * 100:.2f}%"
)

print(
    f"Original Model Type Accuracy:"
    f" {original_type_accuracy * 100:.2f}%"
)

print(
    f"WhatsApp Model Type Accuracy:"
    f" {whatsapp_type_accuracy * 100:.2f}%"
)


# ============================================================
# 9. SHOW EVERY PREDICTION
# ============================================================

comparison_df = realistic_test_df[
    [
        "text",
        "category",
        "type"
    ]
].copy()

comparison_df["Original Prediction"] = [
    category_labels[x]
    for x in original_results[
        "category_pred"
    ]
]

comparison_df["WhatsApp Prediction"] = [
    category_labels[x]
    for x in whatsapp_results[
        "category_pred"
    ]
]

comparison_df["Original Correct"] = (
    comparison_df["category"]
    ==
    comparison_df["Original Prediction"]
)

comparison_df["WhatsApp Correct"] = (
    comparison_df["category"]
    ==
    comparison_df["WhatsApp Prediction"]
)


print("\n" + "=" * 70)
print("ALL TEST PREDICTIONS")
print("=" * 70)

display(
    comparison_df
)


# ============================================================
# 10. CLASSIFICATION REPORTS
# ============================================================

print("\n" + "=" * 70)
print("ORIGINAL MODEL — CLASSIFICATION REPORT")
print("=" * 70)

print(
    classification_report(
        original_results["category_true"],
        original_results["category_pred"],
        labels=list(range(len(category_labels))),
        target_names=category_labels,
        zero_division=0
    )
)


print("\n" + "=" * 70)
print("WHATSAPP MODEL — CLASSIFICATION REPORT")
print("=" * 70)

print(
    classification_report(
        whatsapp_results["category_true"],
        whatsapp_results["category_pred"],
        labels=list(range(len(category_labels))),
        target_names=category_labels,
        zero_division=0
    )
)


# ============================================================
# 11. SHOW ONLY WRONG PREDICTIONS
# ============================================================

wrong_predictions = comparison_df[
    ~comparison_df["WhatsApp Correct"]
].copy()

print("\n" + "=" * 70)
print("WHATSAPP MODEL — WRONG PREDICTIONS")
print("=" * 70)

print(
    "Wrong:",
    len(wrong_predictions)
)

display(
    wrong_predictions
)

=== CELL 28 ===
# ============================================================
# STEP 27 — HYBRID WHATSAPP TRANSACTION EXTRACTOR
# ============================================================

import re
import pandas as pd


# ============================================================
# 1. CATEGORY KEYWORDS
# ============================================================

CATEGORY_KEYWORDS = {

    "Food": [
        "pizza",
        "burger",
        "food",
        "dinner",
        "lunch",
        "breakfast",
        "chai",
        "tea",
        "snacks",
        "paneer",
        "swiggy",
        "zomato",
        "restaurant",
        "groceries",
        "grocery"
    ],

    "Apparel": [
        "shoes",
        "shoe",
        "tshirt",
        "t-shirt",
        "shirt",
        "jeans",
        "kurta",
        "trouser",
        "dress",
        "clothes",
        "jacket",
        "sweater",
        "sandal"
    ],

    "Health": [
        "doctor",
        "medicine",
        "medicines",
        "medical",
        "hospital",
        "checkup",
        "check-up",
        "clinic",
        "tablet",
        "syrup",
        "eye checkup",
        "dentist",
        "therapy"
    ],

    "Transportation": [
        "uber",
        "ola",
        "auto",
        "metro",
        "cab",
        "taxi",
        "bus",
        "train",
        "rickshaw",
        "petrol",
        "diesel",
        "fuel",
        "parking"
    ],

    "Subscription": [
        "netflix",
        "spotify",
        "amazon prime",
        "prime",
        "subscription",
        "recharge",
        "mobile recharge",
        "tata play",
        "hotstar",
        "youtube premium",
        "membership"
    ],

    "Household": [
        "bedsheet",
        "bed sheet",
        "cleaning",
        "cleaning supplies",
        "bulb",
        "switch",
        "household",
        "home",
        "ghar ka saman",
        "ghar ke saman",
        "utensil",
        "crockery",
        "furniture",
        "mop",
        "bucket",
        "soap",
        "shampoo"
    ],

    "Investment": [
        "mutual fund",
        "mutual funds",
        "sip",
        "zerodha",
        "investment",
        "invest",
        "stock",
        "stocks",
        "share market",
        "shares",
        "equity",
        "fd",
        "fixed deposit",
        "rd",
        "recurring deposit"
    ],

    "Leisure": [
        "movie",
        "movies",
        "pvr",
        "cinema",
        "cinépolis",
        "carnival",
        "outing",
        "trip",
        "tour",
        "planetarium",
        "concert",
        "game",
        "gaming"
    ],

    "Beauty": [
        "haircut",
        "salon",
        "beauty",
        "facial",
        "parlour",
        "parlor",
        "spa",
        "manicure",
        "pedicure"
    ],

    "Education": [
        "course",
        "college",
        "school",
        "tuition",
        "exam",
        "form",
        "fees",
        "education",
        "class",
        "training"
    ],

    "Gift": [
        "gift",
        "present",
        "birthday gift",
        "wedding gift"
    ],

    "Family": [
        "mummy",
        "mom",
        "mother",
        "papa",
        "father",
        "brother",
        "sister",
        "family",
        "bhai ko",
        "mummy ke"
    ],

    "Festivals": [
        "diwali",
        "holi",
        "puja",
        "pooja",
        "festival",
        "rakhi",
        "eid",
        "navratri",
        "dussehra"
    ],

    "Salary": [
        "salary",
        "salary credit",
        "salary aa gayi",
        "paycheck",
        "income credited"
    ]
}


# ============================================================
# 2. AMOUNT EXTRACTION
# ============================================================

def extract_amount(text):

    text_lower = text.lower()

    # --------------------------------------------------------
    # Examples supported:
    # 250
    # 250 rs
    # rs 250
    # 250 rupees
    # 1,500
    # 1.5k
    # --------------------------------------------------------

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

        match = re.search(
            pattern,
            text_lower
        )

        if match:

            raw_value = match.group(1)

            raw_value = raw_value.replace(
                ",",
                ""
            )

            value = float(raw_value)

            # Convert k notation
            if re.search(
                r'[kK]\b',
                match.group(0)
            ):
                value *= 1000

            return value

    return None


# ============================================================
# 3. CATEGORY RULE ENGINE
# ============================================================

def rule_based_category(text):

    text_lower = text.lower()

    matches = []

    for category, keywords in CATEGORY_KEYWORDS.items():

        for keyword in keywords:

            if keyword in text_lower:

                matches.append(
                    (
                        category,
                        len(keyword)
                    )
                )

    if not matches:
        return None

    # Longer keyword generally means
    # more specific matching.
    matches.sort(
        key=lambda x: x[1],
        reverse=True
    )

    return matches[0][0]


# ============================================================
# 4. TYPE DETECTION
# ============================================================

def rule_based_type(text):

    text_lower = text.lower()

    income_words = [
        "salary",
        "salary credit",
        "credited",
        "income",
        "received",
        "received money",
        "cashback",
        "refund",
        "bonus"
    ]

    for word in income_words:

        if word in text_lower:
            return "Income"

    return "Expense"


# ============================================================
# 5. COMPLETE TRANSACTION PARSER
# ============================================================

def parse_whatsapp_message(text):

    amount = extract_amount(text)

    category = rule_based_category(text)

    transaction_type = rule_based_type(text)

    return {
        "text": text,
        "amount": amount,
        "category": category,
        "type": transaction_type
    }


# ============================================================
# 6. TEST ON EXAMPLES
# ============================================================

example_messages = [

    "yaar 250 ka pizza mangaya",

    "amazon se 1800 ke shoes liye",

    "doctor ko 600 diye",

    "uber se ghar aaya 220",

    "netflix ka 199 wala plan renew kiya",

    "bhai 5000 mutual fund me daale",

    "aaj salary 45000 aa gayi",

    "haircut ke 300 diye",

    "diwali ke saman pe 1200 kharch hue"
]


print("=" * 70)
print("HYBRID WHATSAPP PARSER TEST")
print("=" * 70)

for message in example_messages:

    result = parse_whatsapp_message(
        message
    )

    print("\nMessage:", message)

    print(
        "Amount:",
        result["amount"]
    )

    print(
        "Category:",
        result["category"]
    )

    print(
        "Type:",
        result["type"]
    )

=== CELL 29 ===
# ============================================================
# STEP 28 — BENCHMARK HYBRID PARSER ON 45 TEST MESSAGES
# ============================================================

import pandas as pd


# ============================================================
# 1. RUN PARSER ON EVERY TEST MESSAGE
# ============================================================

hybrid_results = []

for _, row in realistic_test_df.iterrows():

    result = parse_whatsapp_message(
        row["text"]
    )

    hybrid_results.append({

        "text": row["text"],

        "actual_category":
            row["category"],

        "predicted_category":
            result["category"],

        "actual_type":
            row["type"],

        "predicted_type":
            result["type"],

        "actual_amount":
            None,   # Our benchmark doesn't have
                    # a separate numeric amount column

        "extracted_amount":
            result["amount"]
    })


hybrid_results_df = pd.DataFrame(
    hybrid_results
)


# ============================================================
# 2. CATEGORY ACCURACY
# ============================================================

category_correct = (
    hybrid_results_df[
        "actual_category"
    ]
    ==
    hybrid_results_df[
        "predicted_category"
    ]
)

category_accuracy = (
    category_correct.mean()
)


# ============================================================
# 3. TYPE ACCURACY
# ============================================================

type_correct = (
    hybrid_results_df[
        "actual_type"
    ]
    ==
    hybrid_results_df[
        "predicted_type"
    ]
)

type_accuracy = (
    type_correct.mean()
)


# ============================================================
# 4. AMOUNT COVERAGE
# ============================================================

amount_extracted = (
    hybrid_results_df[
        "extracted_amount"
    ]
    .notna()
)

amount_coverage = (
    amount_extracted.mean()
)


# ============================================================
# 5. DISPLAY OVERALL RESULTS
# ============================================================

print("=" * 70)
print("HYBRID PARSER — 45 MESSAGE BENCHMARK")
print("=" * 70)

print(
    f"Category Accuracy: "
    f"{category_accuracy * 100:.2f}%"
)

print(
    f"Type Accuracy: "
    f"{type_accuracy * 100:.2f}%"
)

print(
    f"Amount Extraction Coverage: "
    f"{amount_coverage * 100:.2f}%"
)

print(
    "\nCorrect Categories:",
    category_correct.sum(),
    "/",
    len(hybrid_results_df)
)

print(
    "Correct Types:",
    type_correct.sum(),
    "/",
    len(hybrid_results_df)
)

print(
    "Amounts Extracted:",
    amount_extracted.sum(),
    "/",
    len(hybrid_results_df)
)


# ============================================================
# 6. DISPLAY ALL PREDICTIONS
# ============================================================

print("\n" + "=" * 70)
print("ALL HYBRID PREDICTIONS")
print("=" * 70)

display(
    hybrid_results_df[
        [
            "text",
            "actual_category",
            "predicted_category",
            "actual_type",
            "predicted_type",
            "extracted_amount"
        ]
    ]
)


# ============================================================
# 7. SHOW CATEGORY ERRORS
# ============================================================

hybrid_category_errors = (
    hybrid_results_df[
        ~category_correct
    ]
    .copy()
)


print("\n" + "=" * 70)
print("HYBRID CATEGORY ERRORS")
print("=" * 70)

print(
    "Wrong category predictions:",
    len(hybrid_category_errors)
)

display(
    hybrid_category_errors[
        [
            "text",
            "actual_category",
            "predicted_category"
        ]
    ]
)


# ============================================================
# 8. SHOW TYPE ERRORS
# ============================================================

hybrid_type_errors = (
    hybrid_results_df[
        ~type_correct
    ]
    .copy()
)


print("\n" + "=" * 70)
print("HYBRID TYPE ERRORS")
print("=" * 70)

print(
    "Wrong type predictions:",
    len(hybrid_type_errors)
)

display(
    hybrid_type_errors[
        [
            "text",
            "actual_type",
            "predicted_type"
        ]
    ]
)


# ============================================================
# 9. SHOW MESSAGES WHERE NO CATEGORY WAS FOUND
# ============================================================

no_category = hybrid_results_df[
    hybrid_results_df[
        "predicted_category"
    ].isna()
]


print("\n" + "=" * 70)
print("MESSAGES WITH NO RULE MATCH")
print("=" * 70)

print(
    "No category found:",
    len(no_category)
)

display(
    no_category[
        ["text"]
    ]
)

=== CELL 30 ===
# ============================================================
# STEP 29 — FINAL HYBRID PARSER
# ============================================================

import re
import torch


# ============================================================
# 1. ADD GENERIC "OTHER" KEYWORDS
# ============================================================

CATEGORY_KEYWORDS["Other"] = [

    "random expense",
    "random kharcha",
    "miscellaneous",
    "miscellaneous expense",
    "misc expense",
    "misc kharcha",
    "other expense",
    "other kharcha",
    "random kharch",
    "miscellaneous kharch",
    "misc",
    "unplanned expense",
    "unplanned kharcha"
]


# ============================================================
# 2. IMPROVED CATEGORY RULE FUNCTION
# ============================================================

def rule_based_category(text):

    text_lower = text.lower()

    matches = []

    for category, keywords in CATEGORY_KEYWORDS.items():

        for keyword in keywords:

            if keyword in text_lower:

                matches.append(
                    (
                        category,
                        len(keyword)
                    )
                )

    if not matches:
        return None

    # Prefer the most specific / longest keyword
    matches.sort(
        key=lambda x: x[1],
        reverse=True
    )

    return matches[0][0]


# ============================================================
# 3. MÚRIL FALLBACK CLASSIFIER
# ============================================================

def muril_category_prediction(text):

    model.eval()

    encoded = tokenizer(
        text,
        padding="max_length",
        truncation=True,
        max_length=32,
        return_tensors="pt"
    )

    input_ids = encoded[
        "input_ids"
    ].to(device)

    attention_mask = encoded[
        "attention_mask"
    ].to(device)

    with torch.no_grad():

        type_logits, category_logits = model(
            input_ids,
            attention_mask
        )

        probabilities = torch.softmax(
            category_logits,
            dim=1
        )

        confidence, prediction = torch.max(
            probabilities,
            dim=1
        )

    predicted_category = category_labels[
        prediction.item()
    ]

    confidence_value = confidence.item()

    return (
        predicted_category,
        confidence_value
    )


# ============================================================
# 4. FINAL TRANSACTION PARSER
# ============================================================

def parse_whatsapp_message_final(text):

    # --------------------------------------------------------
    # Amount
    # --------------------------------------------------------

    amount = extract_amount(text)

    # --------------------------------------------------------
    # Type
    # --------------------------------------------------------

    transaction_type = rule_based_type(text)

    # --------------------------------------------------------
    # Rule-based category
    # --------------------------------------------------------

    category = rule_based_category(text)

    source = "rule"
    confidence = 1.0

    # --------------------------------------------------------
    # MuRIL fallback
    # --------------------------------------------------------

    if category is None:

        category, confidence = (
            muril_category_prediction(text)
        )

        source = "muril"

    return {

        "text": text,

        "amount": amount,

        "category": category,

        "type": transaction_type,

        "category_source": source,

        "category_confidence": confidence
    }


# ============================================================
# 5. TEST THE TWO PREVIOUS FAILURES
# ============================================================

test_messages = [

    "yaar 250 ka random expense ho gaya",

    "500 ka miscellaneous kharcha ho gaya",

    "kal kuch ajeeb sa kharcha hua"
]


print("=" * 70)
print("FINAL HYBRID PARSER TEST")
print("=" * 70)


for message in test_messages:

    result = parse_whatsapp_message_final(
        message
    )

    print("\nMessage:", message)

    print(
        "Amount:",
        result["amount"]
    )

    print(
        "Category:",
        result["category"]
    )

    print(
        "Type:",
        result["type"]
    )

    print(
        "Source:",
        result["category_source"]
    )

    print(
        "Confidence:",
        round(
            result["category_confidence"],
            4
        )
    )

=== CELL 31 ===
# ============================================================
# STEP 30 — PRODUCTION-SAFE WHATSAPP PARSER
# ============================================================

import json
import torch


# ============================================================
# 1. CONFIDENCE THRESHOLD
# ============================================================

MURIL_CONFIDENCE_THRESHOLD = 0.95


# ============================================================
# 2. SAFE FINAL PARSER
# ============================================================

def parse_whatsapp_message_production(text):

    # --------------------------------------------------------
    # Extract amount
    # --------------------------------------------------------

    amount = extract_amount(text)

    # --------------------------------------------------------
    # Detect transaction type
    # --------------------------------------------------------

    transaction_type = rule_based_type(text)

    # --------------------------------------------------------
    # First try deterministic rules
    # --------------------------------------------------------

    rule_category = rule_based_category(text)

    category_source = None
    category_confidence = None
    category = None

    # --------------------------------------------------------
    # RULE MATCH
    # --------------------------------------------------------

    if rule_category is not None:

        category = rule_category

        category_source = "rule"

        category_confidence = 1.0

    # --------------------------------------------------------
    # MÚRIL FALLBACK
    # --------------------------------------------------------

    else:

        muril_category, muril_confidence = (
            muril_category_prediction(text)
        )

        if (
            muril_confidence
            >=
            MURIL_CONFIDENCE_THRESHOLD
        ):

            category = muril_category

            category_source = "muril"

            category_confidence = (
                muril_confidence
            )

        else:

            category = None

            category_source = "review"

            category_confidence = (
                muril_confidence
            )

    # --------------------------------------------------------
    # DETERMINE WHETHER TRANSACTION IS SAFE TO SAVE
    # --------------------------------------------------------

    ready_to_save = (

        amount is not None

        and

        category is not None

        and

        transaction_type is not None
    )

    # --------------------------------------------------------
    # REVIEW REASON
    # --------------------------------------------------------

    review_reason = None

    if amount is None:

        review_reason = (
            "Amount could not be extracted"
        )

    elif category is None:

        review_reason = (
            "Category confidence is below threshold"
        )

    # --------------------------------------------------------
    # FINAL STRUCTURED RESULT
    # --------------------------------------------------------

    result = {

        "text": text,

        "amount": amount,

        "category": category,

        "type": transaction_type,

        "category_source": category_source,

        "category_confidence":
            round(
                category_confidence,
                4
            )
            if category_confidence is not None
            else None,

        "ready_to_save":
            ready_to_save,

        "review_reason":
            review_reason
    }

    return result


# ============================================================
# 3. TEST MESSAGES
# ============================================================

test_messages = [

    "yaar 250 ka pizza mangaya",

    "amazon se 1800 ke shoes liye",

    "doctor ko 600 diye",

    "uber se ghar aaya 220",

    "aaj salary 45000 aa gayi",

    "yaar 250 ka random expense ho gaya",

    "500 ka miscellaneous kharcha ho gaya",

    "kal kuch ajeeb sa kharcha hua"
]


# ============================================================
# 4. DISPLAY RESULTS
# ============================================================

print("=" * 70)
print("PRODUCTION-SAFE WHATSAPP PARSER")
print("=" * 70)

for message in test_messages:

    result = parse_whatsapp_message_production(
        message
    )

    print("\nMessage:")
    print(message)

    print("\nStructured result:")

    print(
        json.dumps(
            result,
            indent=2,
            ensure_ascii=False
        )
    )

=== CELL 32 ===
# ============================================================
# STEP 31 — DATABASE-READY TRANSACTION JSON
# ============================================================

import json


def create_database_payload(text):

    result = parse_whatsapp_message_production(text)

    # --------------------------------------------------------
    # CASE 1: SAFE TO SAVE
    # --------------------------------------------------------

    if result["ready_to_save"]:

        payload = {
            "amount": result["amount"],
            "category": result["category"],
            "type": result["type"],
            "description": result["text"]
        }

        return {
            "status": "success",
            "save_to_database": True,
            "transaction": payload
        }

    # --------------------------------------------------------
    # CASE 2: NEEDS REVIEW
    # --------------------------------------------------------

    return {
        "status": "needs_review",
        "save_to_database": False,
        "transaction": None,
        "message": (
            "I couldn't understand this transaction "
            "completely. Please provide the amount "
            "and a little more detail."
        )
    }


# ============================================================
# TEST
# ============================================================

messages = [

    "yaar 250 ka pizza mangaya",

    "amazon se 1800 ke shoes liye",

    "doctor ko 600 diye",

    "uber se ghar aaya 220",

    "aaj salary 45000 aa gayi",

    "500 ka miscellaneous kharcha ho gaya",

    "kal kuch ajeeb sa kharcha hua"
]


print("=" * 70)
print("DATABASE-READY WHATSAPP PAYLOADS")
print("=" * 70)

for message in messages:

    print("\nIncoming WhatsApp message:")
    print(message)

    payload = create_database_payload(
        message
    )

    print("\nBackend payload:")

    print(
        json.dumps(
            payload,
            indent=2,
            ensure_ascii=False
        )
    )

=== CELL 33 ===


# ============================================================
# STEP 32 — CREATE API VERSION OF THE PARSER
# ============================================================

from fastapi import FastAPI
from pydantic import BaseModel
import json


# ============================================================
# 1. CREATE FASTAPI APP
# ============================================================

app = FastAPI(
    title="WhatsApp Finance Parser",
    description="AI-powered WhatsApp transaction parser",
    version="1.0.0"
)


# ============================================================
# 2. REQUEST FORMAT
# ============================================================

class TransactionRequest(BaseModel):

    message: str


# ============================================================
# 3. HEALTH CHECK
# ============================================================

@app.get("/")
def root():

    return {
        "status": "ok",
        "service": "WhatsApp Finance Parser"
    }


# ============================================================
# 4. PARSE TRANSACTION ENDPOINT
# ============================================================

@app.post("/parse-transaction")
def parse_transaction(
    request: TransactionRequest
):

    result = create_database_payload(
        request.message
    )

    return result


# ============================================================
# 5. SHOW ROUTES
# ============================================================

print("=" * 70)
print("FASTAPI APPLICATION CREATED")
print("=" * 70)

print("Available endpoints:")

print("GET  /")
print("POST /parse-transaction")

=== CELL 34 ===
# ============================================================
# STEP 33 — TEST FASTAPI ENDPOINT LOCALLY
# ============================================================

from fastapi.testclient import TestClient


# ============================================================
# 1. CREATE TEST CLIENT
# ============================================================

client = TestClient(app)


# ============================================================
# 2. TEST HEALTH CHECK
# ============================================================

print("=" * 70)
print("TEST 1 — HEALTH CHECK")
print("=" * 70)

response = client.get("/")

print("Status code:", response.status_code)

print("Response:")

print(
    response.json()
)


# ============================================================
# 3. TEST TRANSACTION PARSER
# ============================================================

print("\n" + "=" * 70)
print("TEST 2 — TRANSACTION PARSER")
print("=" * 70)

test_message = {
    "message": "yaar 250 ka pizza mangaya"
}

response = client.post(
    "/parse-transaction",
    json=test_message
)

print("Status code:", response.status_code)

print("Response:")

print(
    response.json()
)


# ============================================================
# 4. TEST ANOTHER MESSAGE
# ============================================================

print("\n" + "=" * 70)
print("TEST 3 — SALARY")
print("=" * 70)

test_message = {
    "message": "aaj salary 45000 aa gayi"
}

response = client.post(
    "/parse-transaction",
    json=test_message
)

print("Status code:", response.status_code)

print("Response:")

print(
    response.json()
)


# ============================================================
# 5. TEST REVIEW CASE
# ============================================================

print("\n" + "=" * 70)
print("TEST 4 — UNCLEAR MESSAGE")
print("=" * 70)

test_message = {
    "message": "kal kuch ajeeb sa kharcha hua"
}

response = client.post(
    "/parse-transaction",
    json=test_message
)

print("Status code:", response.status_code)

print("Response:")

print(
    response.json()
)

=== CELL 35 ===
# ============================================================
# STEP 34 — START FASTAPI SERVER
# ============================================================

import subprocess
import sys
import time

print("=" * 70)
print("CHECKING UVICORN")
print("=" * 70)

# Install uvicorn if necessary
subprocess.run(
    [
        sys.executable,
        "-m",
        "pip",
        "install",
        "uvicorn",
        "-q"
    ],
    check=True
)

print("Uvicorn is ready.")


# ============================================================
# START SERVER
# ============================================================

print("\n" + "=" * 70)
print("STARTING FASTAPI SERVER")
print("=" * 70)

server_process = subprocess.Popen(
    [
        sys.executable,
        "-m",
        "uvicorn",
        "__main__:app",
        "--host",
        "0.0.0.0",
        "--port",
        "8000"
    ],
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True
)

time.sleep(5)

print("Server process started.")
print("PID:", server_process.pid)
print("Local endpoint:")
print("http://127.0.0.1:8000")

=== CELL 36 ===
# ============================================================
# TEST ACTUAL FASTAPI SERVER
# ============================================================

import requests

print("=" * 70)
print("TESTING LIVE SERVER")
print("=" * 70)


response = requests.get(
    "http://127.0.0.1:8000/"
)

print(
    "Health status:",
    response.status_code
)

print(
    "Health response:",
    response.json()
)


# ------------------------------------------------------------
# Test transaction endpoint
# ------------------------------------------------------------

response = requests.post(
    "http://127.0.0.1:8000/parse-transaction",
    json={
        "message": "yaar 250 ka pizza mangaya"
    }
)

print("\nTransaction status:", response.status_code)

print(
    "Transaction response:"
)

print(
    response.json()
)

=== CELL 37 ===
# ============================================================
# STEP 34 — START FASTAPI INSIDE THE NOTEBOOK
# ============================================================

import threading
import time
import uvicorn


# ============================================================
# 1. CREATE UVICORN CONFIG
# ============================================================

config = uvicorn.Config(
    app,
    host="0.0.0.0",
    port=8000,
    log_level="info"
)


# ============================================================
# 2. CREATE SERVER
# ============================================================

server = uvicorn.Server(config)


# ============================================================
# 3. START SERVER IN BACKGROUND THREAD
# ============================================================

server_thread = threading.Thread(
    target=server.run,
    daemon=True
)

server_thread.start()


# ============================================================
# 4. WAIT FOR SERVER
# ============================================================

time.sleep(5)


print("=" * 70)
print("FASTAPI SERVER STATUS")
print("=" * 70)

print(
    "Server started:",
    server.started
)

print(
    "URL:",
    "http://127.0.0.1:8000"
)

=== CELL 38 ===
# ============================================================
# STEP 34B — TEST THE ACTUAL SERVER
# ============================================================

import requests


print("=" * 70)
print("TESTING LIVE FASTAPI SERVER")
print("=" * 70)


# ============================================================
# HEALTH CHECK
# ============================================================

response = requests.get(
    "http://127.0.0.1:8000/",
    timeout=10
)

print(
    "\nHealth status:",
    response.status_code
)

print(
    "Health response:",
    response.json()
)


# ============================================================
# TRANSACTION TEST
# ============================================================

response = requests.post(
    "http://127.0.0.1:8000/parse-transaction",
    json={
        "message": "yaar 250 ka pizza mangaya"
    },
    timeout=30
)

print(
    "\nTransaction status:",
    response.status_code
)

print(
    "Transaction response:"
)

print(
    response.json()
)

=== CELL 39 ===
import os

for path in [
    "/kaggle/working/muril_original_best.pt",
    "/kaggle/working/muril_whatsapp_best.pt"
]:
    print(
        path,
        "->",
        os.path.exists(path)
    )

=== CELL 40 ===
import os
import zipfile

files_to_backup = [
    "/kaggle/working/muril_whatsapp_best.pt",
    "/kaggle/working/muril_original_best.pt",
]

backup_path = "/kaggle/working/whatsapp_finance_ai_backup.zip"

with zipfile.ZipFile(
    backup_path,
    "w",
    zipfile.ZIP_DEFLATED
) as zipf:

    for file_path in files_to_backup:

        if os.path.exists(file_path):

            zipf.write(
                file_path,
                arcname=os.path.basename(file_path)
            )

print("Backup created:")
print(backup_path)
print("Size:", os.path.getsize(backup_path) / (1024 * 1024), "MB")

=== CELL 41 ===
# ============================================================
# FINAL BACKUP CHECK
# ============================================================

import os

files = [
    "/kaggle/working/whatsapp_finance_ai_backup.zip",
    "/kaggle/working/muril_whatsapp_best.pt",
    "/kaggle/working/muril_original_best.pt"
]

print("=" * 70)
print("FINAL BACKUP CHECK")
print("=" * 70)

for file_path in files:

    exists = os.path.exists(file_path)

    print("\nFile:", os.path.basename(file_path))
    print("Exists:", exists)

    if exists:
        size_mb = os.path.getsize(file_path) / (1024 * 1024)
        print(f"Size: {size_mb:.2f} MB")

=== CELL 42 ===
# ============================================================
# CREATE DOWNLOAD LINK
# ============================================================

from IPython.display import FileLink, display

backup_file = "/kaggle/working/whatsapp_finance_ai_backup.zip"

print("Your complete model backup:")
display(FileLink(backup_file))

=== CELL 43 ===

