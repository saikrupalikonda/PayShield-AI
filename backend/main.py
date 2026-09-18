from fastapi import FastAPI

from backend.api.risk_routes import router as risk_router
from backend.api.context_routes import router as context_router
from backend.api.dashboard_routes import router as dashboard_router

app = FastAPI(title="PayShield AI", version="0.1.0")

app.include_router(risk_router, prefix="/v1")
app.include_router(context_router, prefix="/v1")
app.include_router(dashboard_router, prefix="/v1")


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "PayShield AI"}
