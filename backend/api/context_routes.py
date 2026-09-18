from fastapi import APIRouter

router = APIRouter(prefix="/context", tags=["context"])


@router.post("/sms")
def ingest_sms_context(payload: dict):
    return {
        "status": "received",
        "message": "SMS context captured for analysis.",
        "payload": payload,
    }
