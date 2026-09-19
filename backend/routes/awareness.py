from typing import List, Dict, Any
from fastapi import APIRouter, Query
from backend.services.news_service import news_service
from backend.database import db

router = APIRouter(prefix="/api/awareness", tags=["Awareness"])


@router.get("/articles")
def get_articles() -> List[Dict[str, Any]]:
    return db.get_articles()


@router.get("/news")
def get_news(refresh: bool = Query(False)) -> List[Dict[str, Any]]:
    return news_service.get_articles(force_refresh=refresh)
