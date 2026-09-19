import os
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

from backend.config import settings
from backend.seed.seed_data import SYNTHETIC_REPORTS, AWARENESS_ARTICLES

logger = logging.getLogger("payshield.database")

def format_utc_iso(dt: Any) -> str:
    """Normalize any datetime or string to ISO-8601 UTC with explicit 'Z' suffix."""
    if isinstance(dt, datetime):
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
    if isinstance(dt, str) and dt.strip():
        s = dt.strip()
        if not s.endswith("Z") and "+" not in s and "-" not in s[10:]:
            return f"{s}Z"
        return s
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


# Transparent in-memory storage fallback
class FallbackStorage:
    def __init__(self, storage_path: str = "data/payshield_db.json"):
        self.storage_path = storage_path
        self.data: Dict[str, List[Dict[str, Any]]] = {
            "users": [],
            "detections": [],
            "message_detections": [],
            "synthetic_reports": list(SYNTHETIC_REPORTS),
            "surveys": [],
            "awareness_articles": list(AWARENESS_ARTICLES),
            "chat_sessions": []
        }
        self._load_from_disk()

    def _load_from_disk(self):
        try:
            if os.path.exists(self.storage_path):
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    disk_data = json.load(f)
                    for key, val in disk_data.items():
                        if key in self.data:
                            self.data[key] = val
            # Always ensure all latest seed synthetic reports exist
            existing_ids = {r.get("identifier", "").lower() for r in self.data.get("synthetic_reports", [])}
            for rep in SYNTHETIC_REPORTS:
                if rep.get("identifier", "").lower() not in existing_ids:
                    self.data["synthetic_reports"].append(rep)
        except Exception as e:
            logger.warning(f"Could not load fallback storage from disk: {e}")

    def _save_to_disk(self):
        try:
            os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)
            with open(self.storage_path, "w", encoding="utf-8") as f:
                # Helper for datetime serialization
                def serialize(obj):
                    if isinstance(obj, datetime):
                        return obj.isoformat()
                    return str(obj)
                json.dump(self.data, f, default=serialize, indent=2)
        except Exception as e:
            logger.warning(f"Could not save fallback storage to disk: {e}")


class Database:
    def __init__(self):
        self.is_mongodb_connected = False
        self.mongo_client = None
        self.db = None
        self.fallback = FallbackStorage()
        self._init_connection()

    def _init_connection(self):
        try:
            # Try connecting with short timeout
            self.mongo_client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=1200)
            self.mongo_client.admin.command('ping')
            self.db = self.mongo_client.get_database()
            self.is_mongodb_connected = True
            logger.info("Connected successfully to MongoDB.")
            self._seed_mongo_if_empty()
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
            self.is_mongodb_connected = False
            logger.info(f"MongoDB not reachable ({e}). Using resilient in-memory fallback store with local persistence.")

    def _seed_mongo_if_empty(self):
        try:
            if self.is_mongodb_connected and self.db is not None:
                if self.db.synthetic_reports.count_documents({}) == 0:
                    self.db.synthetic_reports.insert_many(SYNTHETIC_REPORTS)
                if self.db.awareness_articles.count_documents({}) == 0:
                    self.db.awareness_articles.insert_many(AWARENESS_ARTICLES)
        except Exception as e:
            logger.warning(f"Error seeding MongoDB: {e}")

    # User operations
    def get_user_by_mobile(self, mobile: str) -> Optional[Dict[str, Any]]:
        clean_mobile = mobile.replace(" ", "").replace("-", "")
        if self.is_mongodb_connected:
            try:
                user = self.db.users.find_one({"mobile": clean_mobile})
                if user:
                    user["id"] = str(user.get("_id", user.get("id")))
                    return user
            except Exception:
                pass
        for u in self.fallback.data["users"]:
            if u.get("mobile") == clean_mobile or u.get("mobile") == mobile:
                return u
        return None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        if self.is_mongodb_connected:
            try:
                user = self.db.users.find_one({"id": user_id})
                if user:
                    user["id"] = str(user.get("_id", user.get("id")))
                    return user
            except Exception:
                pass
        for u in self.fallback.data["users"]:
            if u.get("id") == user_id:
                return u
        return None

    def save_user(self, user_dict: Dict[str, Any]) -> Dict[str, Any]:
        clean_mobile = user_dict["mobile"].replace(" ", "").replace("-", "")
        user_dict["mobile"] = clean_mobile
        if self.is_mongodb_connected:
            try:
                self.db.users.update_one({"id": user_dict["id"]}, {"$set": user_dict}, upsert=True)
            except Exception:
                pass
        # Always maintain in fallback for resilience
        existing = next((i for i, u in enumerate(self.fallback.data["users"]) if u["id"] == user_dict["id"]), None)
        if existing is not None:
            self.fallback.data["users"][existing] = user_dict
        else:
            self.fallback.data["users"].append(user_dict)
        self.fallback._save_to_disk()
        return user_dict

    def update_user(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        user = self.get_user_by_id(user_id)
        if not user:
            return None
        user.update(updates)
        self.save_user(user)
        return user

    # Intelligence & reports lookup
    def get_synthetic_report(self, identifier: str) -> Optional[Dict[str, Any]]:
        clean_id = identifier.strip().lower()
        if self.is_mongodb_connected:
            try:
                report = self.db.synthetic_reports.find_one({"identifier": {"$regex": f"^{clean_id}$", "$options": "i"}})
                if report:
                    return report
            except Exception:
                pass
        for r in self.fallback.data["synthetic_reports"]:
            if r.get("identifier", "").lower() == clean_id:
                return r
        return None

    # Detections
    def save_detection(self, detection: Dict[str, Any]) -> Dict[str, Any]:
        detection["timestamp"] = format_utc_iso(detection.get("timestamp"))
        if self.is_mongodb_connected:
            try:
                self.db.detections.insert_one(dict(detection))
            except Exception:
                pass
        self.fallback.data["detections"].insert(0, detection)
        self.fallback._save_to_disk()
        return detection

    def update_detection_action(self, analysis_id: str, action_taken: str) -> bool:
        if self.is_mongodb_connected:
            try:
                self.db.detections.update_one({"id": analysis_id}, {"$set": {"action_taken": action_taken}})
            except Exception:
                pass
        for d in self.fallback.data["detections"]:
            if d.get("id") == analysis_id:
                d["action_taken"] = action_taken
                self.fallback._save_to_disk()
                return True
        return False

    def get_detections_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        if self.is_mongodb_connected:
            try:
                results = list(self.db.detections.find({"user_id": user_id}).sort("timestamp", -1))
                if results:
                    for r in results:
                        r["id"] = str(r.get("id", r.get("_id")))
                        r["timestamp"] = format_utc_iso(r.get("timestamp"))
                    return results
            except Exception:
                pass
        user_detections = [d for d in self.fallback.data["detections"] if d.get("user_id") == user_id]
        for d in user_detections:
            d["timestamp"] = format_utc_iso(d.get("timestamp"))
        return user_detections

    # Surveys
    def save_survey(self, survey: Dict[str, Any]) -> Dict[str, Any]:
        if self.is_mongodb_connected:
            try:
                self.db.surveys.insert_one(dict(survey))
            except Exception:
                pass
        self.fallback.data["surveys"].append(survey)
        self.fallback._save_to_disk()
        return survey

    # Awareness articles
    def get_articles(self) -> List[Dict[str, Any]]:
        if self.is_mongodb_connected:
            try:
                articles = list(self.db.awareness_articles.find())
                if articles:
                    return articles
            except Exception:
                pass
        return self.fallback.data["awareness_articles"]

    # Message detections & Feedback
    def save_message_detection(self, record: Dict[str, Any]) -> Dict[str, Any]:
        record["timestamp"] = format_utc_iso(record.get("timestamp"))
        if self.is_mongodb_connected:
            try:
                self.db.message_detections.insert_one(dict(record))
            except Exception:
                pass
        self.fallback.data.setdefault("message_detections", []).insert(0, record)
        self.fallback._save_to_disk()
        return record

    def update_message_feedback(self, detection_id: str, feedback: Dict[str, Any]) -> bool:
        if self.is_mongodb_connected:
            try:
                self.db.message_detections.update_one(
                    {"id": detection_id},
                    {"$set": {"user_feedback": feedback}}
                )
            except Exception:
                pass
        for item in self.fallback.data.get("message_detections", []):
            if item.get("id") == detection_id:
                item["user_feedback"] = feedback
                self.fallback._save_to_disk()
                return True
        return False

    def get_message_detections_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        if self.is_mongodb_connected:
            try:
                results = list(self.db.message_detections.find({"user_id": user_id}).sort("timestamp", -1))
                if results:
                    for r in results:
                        r["id"] = str(r.get("id", r.get("_id")))
                        r["timestamp"] = format_utc_iso(r.get("timestamp"))
                    return results
            except Exception:
                pass
        records = self.fallback.data.get("message_detections", [])
        for r in records:
            r["timestamp"] = format_utc_iso(r.get("timestamp"))
        if not user_id or user_id == "demo_guest_user":
            return records
        return [r for r in records if r.get("user_id") == user_id]


    def delete_message_detection(self, detection_id: str, user_id: str) -> bool:
        if self.is_mongodb_connected:
            try:
                self.db.message_detections.delete_one({"id": detection_id})
            except Exception:
                pass
        records = self.fallback.data.get("message_detections", [])
        initial_len = len(records)
        self.fallback.data["message_detections"] = [r for r in records if r.get("id") != detection_id]
        if len(self.fallback.data["message_detections"]) != initial_len:
            self.fallback._save_to_disk()
            return True
        return False


db = Database()
