import time
import requests
import logging
from typing import List, Dict, Any, Optional

from backend.config import settings
from backend.seed.seed_data import AWARENESS_ARTICLES

logger = logging.getLogger("payshield.news")


class NewsService:
    def __init__(self):
        self._cache: List[Dict[str, Any]] = []
        self._last_fetched: float = 0
        self._cache_ttl: int = 600  # 10 minutes

    def get_articles(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        current_time = time.time()
        
        # If cache is valid and not force refresh, return cached
        if not force_refresh and self._cache and (current_time - self._last_fetched < self._cache_ttl):
            return self._cache

        # Attempt to fetch external news if API key provided
        if settings.NEWS_API_KEY:
            try:
                external_news = self._fetch_external_news(settings.NEWS_API_KEY)
                if external_news:
                    self._cache = external_news
                    self._last_fetched = current_time
                    return self._cache
            except Exception as e:
                logger.warning(f"Error fetching live news from external API: {e}. Falling back to curated awareness content.")

        # Fallback to local curated awareness content
        local_items = []
        for a in AWARENESS_ARTICLES:
            local_items.append({
                "id": a["id"],
                "title": a["title"],
                "short_description": a["short_description"],
                "content": a["content"],
                "category": a["category"],
                "published_date": a["published_date"],
                "read_time": a["read_time"],
                "icon": a["icon"],
                "source": "PayShield Security Research",
                "is_local": True,
                "url": None
            })
        self._cache = local_items
        self._last_fetched = current_time
        return self._cache

    def _fetch_external_news(self, api_key: str) -> List[Dict[str, Any]]:
        url = f"https://newsapi.org/v2/everything?q=UPI+scam+OR+cybercrime+India+OR+banking+fraud&sortBy=publishedAt&pageSize=6&apiKey={api_key}"
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            data = res.json()
            articles = []
            for idx, item in enumerate(data.get("articles", [])):
                articles.append({
                    "id": f"ext_{idx}",
                    "title": item.get("title", "Cybersecurity Awareness Update"),
                    "short_description": item.get("description", "Payment fraud and cyber safety awareness bulletin."),
                    "content": item.get("content", ""),
                    "category": "Live Cybersecurity News",
                    "published_date": item.get("publishedAt", "")[:10],
                    "read_time": "3 min read",
                    "icon": "ShieldAlert",
                    "source": item.get("source", {}).get("name", "Cyber News Wire"),
                    "is_local": False,
                    "url": item.get("url")
                })
            return articles
        return []


news_service = NewsService()
