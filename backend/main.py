import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import settings
from backend.routes.auth import router as auth_router
from backend.routes.users import router as users_router
from backend.routes.detect import router as detect_router
from backend.routes.risk import router as risk_router
from backend.routes.history import router as history_router
from backend.routes.survey import router as survey_router
from backend.routes.chat import router as chat_router
from backend.routes.awareness import router as awareness_router
from backend.routes.admin import router as admin_router
from backend.routes.message_detections import router as message_detections_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("payshield.main")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Assisted Authorised-Push-Payment Scam Detection Platform"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global safe error handler - no raw stack traces exposed to clients
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error handling request {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "A temporary processing error occurred. Please try your request again."}
    )

# Include all route modules
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(detect_router)
app.include_router(risk_router)
app.include_router(history_router)
app.include_router(survey_router)
app.include_router(chat_router)
app.include_router(awareness_router)
app.include_router(admin_router)
app.include_router(message_detections_router)


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "tagline": settings.TAGLINE
    }


@app.get("/api/evaluation")
def evaluation_direct():
    from backend.routes.admin import evaluate_dataset
    return evaluate_dataset()

