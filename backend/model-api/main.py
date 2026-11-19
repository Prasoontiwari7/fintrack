import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

# Load environment variables
load_dotenv()

from model import MuRILService

MODEL_API_KEY = os.environ.get("MODEL_API_KEY", "fintrack_model_secret_key_123")
service: Optional[MuRILService] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global service
    print("[FastAPI] Initializing MuRIL AI Model Service...")
    try:
        service = MuRILService()
        print("[FastAPI] MuRIL Service is ready to serve predictions.")
    except Exception as e:
        print(f"[FastAPI Error] Failed to load MuRIL model: {e}")
        service = None
    yield
    print("[FastAPI] Shutting down MuRIL Service...")


app = FastAPI(
    title="FinTrack MuRIL Transaction Classifier API",
    description="Fine-tuned multilingual MuRIL inference service for Hinglish/WhatsApp finance messages",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def verify_api_key(x_api_key: Optional[str] = Header(None)):
    """
    Validates API key from request headers.
    """
    configured_key = os.environ.get("MODEL_API_KEY", "").strip()
    # If a key is configured, enforce strict match
    if configured_key:
        if not x_api_key or x_api_key.strip() != configured_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or missing X-API-Key header"
            )
    return True


class PredictRequest(BaseModel):
    message: str = Field(..., example="yaar 250 ka pizza mangaya", description="Transaction text from WhatsApp")


class PredictResponse(BaseModel):
    status: str
    type: str
    category: str
    mapped_category: str
    amount: Optional[float]
    confidence: float
    source: str
    ready_to_save: bool
    review_reason: Optional[str] = None
    raw_text: str


@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "FinTrack MuRIL Model API",
        "model_loaded": service is not None,
        "checkpoint": getattr(service, "checkpoint_path", None) if service else None,
        "device": str(getattr(service, "device", "unknown")) if service else None
    }


@app.post("/predict", response_model=PredictResponse, dependencies=[Depends(verify_api_key)])
def predict_transaction(request: PredictRequest):
    """
    Classifies a natural language WhatsApp transaction message.
    Returns predicted transaction type, category, and extracted amount.
    """
    if not service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="MuRIL model service is not loaded."
        )

    if not request.message or not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty."
        )

    parsed = service.parse_transaction(request.message)

    return PredictResponse(
        status="success",
        type=parsed["type"],
        category=parsed["category"],
        mapped_category=parsed["mapped_category"],
        amount=parsed["amount"],
        confidence=parsed["category_confidence"],
        source=parsed["category_source"],
        ready_to_save=parsed["ready_to_save"],
        review_reason=parsed["review_reason"],
        raw_text=parsed["text"]
    )


@app.post("/parse-transaction", dependencies=[Depends(verify_api_key)])
def parse_transaction_notebook_compat(request: PredictRequest):
    """
    Notebook-compatible endpoint matching Step 31/32 format.
    """
    if not service:
        raise HTTPException(status_code=503, detail="Model service not ready")

    parsed = service.parse_transaction(request.message)

    if parsed["ready_to_save"]:
        return {
            "status": "success",
            "save_to_database": True,
            "transaction": {
                "amount": parsed["amount"],
                "category": parsed["category"],
                "mapped_category": parsed["mapped_category"],
                "type": parsed["type"],
                "description": parsed["text"]
            }
        }

    return {
        "status": "needs_review",
        "save_to_database": False,
        "transaction": None,
        "message": (
            "I couldn't understand this transaction completely. "
            "Please provide the amount and category details."
        )
    }
