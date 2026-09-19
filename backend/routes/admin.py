import time
from typing import Dict, Any, List
from fastapi import APIRouter
from backend.seed.seed_data import EVALUATION_DATASET
from backend.schemas import RiskAnalysisRequest, EvaluationMetricsResponse
from backend.services.risk_engine import risk_engine

router = APIRouter(prefix="/api/admin", tags=["Admin Evaluation"])


from datetime import datetime, timezone

@router.get("/evaluation", response_model=EvaluationMetricsResponse)
def evaluate_dataset():
    total = len(EVALUATION_DATASET)
    tp = 0
    tn = 0
    fp = 0
    fn = 0
    latencies: List[float] = []

    pattern_counts: Dict[str, int] = {}
    signal_counts: Dict[str, int] = {}

    # Per-category tracking: { category: {"total": int, "scam": int, "tp": int, "fn": int, "fp": int, "tn": int} }
    category_tracker: Dict[str, Dict[str, int]] = {}
    
    # Detection type tracking
    type_tracker: Dict[str, Dict[str, int]] = {
        "Payment Risk Detection": {"total": 0, "tp": 0, "tn": 0, "fp": 0, "fn": 0},
        "SMS/Message Detection": {"total": 0, "tp": 0, "tn": 0, "fp": 0, "fn": 0},
        "UPI ID Detection": {"total": 0, "tp": 0, "tn": 0, "fp": 0, "fn": 0},
        "QR Detection": {"total": 0, "tp": 0, "tn": 0, "fp": 0, "fn": 0},
        "Mobile Number Detection": {"total": 0, "tp": 0, "tn": 0, "fp": 0, "fn": 0},
    }

    for item in EVALUATION_DATASET:
        t0 = time.perf_counter()
        
        # Determine detection modality context from scenario
        channel = item.get("channel", "Unknown")
        cat = item.get("category", "General")
        is_qr = "QR" in cat or channel == "QR" or "qr" in item.get("text", "").lower()
        
        req = RiskAnalysisRequest(
            identifier=f"user_{item['id']}@demo" if not is_qr else f"upi://pay?pa=merchant_{item['id']}@bank",
            identifier_type="qr" if is_qr else "upi",
            amount=15000.0 if item["amount_spike"] else 450.0,
            message=item["text"],
            is_new_recipient=item["new_recipient"],
            payment_channel=item["channel"]
        )
        res = risk_engine.analyze(req)
        latencies.append((time.perf_counter() - t0) * 1000)

        # Count signals
        for f in res.factors:
            if f.score_contribution > 0:
                signal_counts[f.factor] = signal_counts.get(f.factor, 0) + 1

        pattern_counts[cat] = pattern_counts.get(cat, 0) + 1

        # Prediction: Score >= 50 considered flagged as high risk / scam pattern
        predicted_scam = res.risk_score >= 50
        actual_scam = item["label"] == "SCAM"

        if actual_scam and predicted_scam:
            tp += 1
            res_type = "tp"
        elif not actual_scam and not predicted_scam:
            tn += 1
            res_type = "tn"
        elif not actual_scam and predicted_scam:
            fp += 1
            res_type = "fp"
        else:
            fn += 1
            res_type = "fn"

        # Track per-category
        if cat not in category_tracker:
            category_tracker[cat] = {"total": 0, "scam": 0, "detected_risky": 0, "tp": 0, "fn": 0, "fp": 0, "tn": 0}
        category_tracker[cat]["total"] += 1
        if actual_scam:
            category_tracker[cat]["scam"] += 1
        if predicted_scam:
            category_tracker[cat]["detected_risky"] += 1
        category_tracker[cat][res_type] += 1

        # Track Payment Risk Detection (overall)
        type_tracker["Payment Risk Detection"]["total"] += 1
        type_tracker["Payment Risk Detection"][res_type] += 1

        # Track SMS / Message Detection (SMS channel items)
        if channel == "SMS":
            type_tracker["SMS/Message Detection"]["total"] += 1
            type_tracker["SMS/Message Detection"][res_type] += 1

        # Track QR Detection (QR category/channel items)
        if is_qr:
            type_tracker["QR Detection"]["total"] += 1
            type_tracker["QR Detection"][res_type] += 1

        # Track UPI ID Detection (UPI identifiers and direct UPI transactions)
        if not is_qr and channel in ["SMS", "WhatsApp", "Phone call", "Merchant", "Friend/family"]:
            type_tracker["UPI ID Detection"]["total"] += 1
            type_tracker["UPI ID Detection"][res_type] += 1

    scam_count = tp + fn
    genuine_count = tn + fp
    accuracy = (tp + tn) / total if total else 0.0
    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) else 0.0
    fpr = fp / (fp + tn) if (fp + tn) else 0.0
    avg_latency = sum(latencies) / len(latencies) if latencies else 0.0

    # Format distributions
    top_signals = [
        {"name": k, "count": v}
        for k, v in sorted(signal_counts.items(), key=lambda x: x[1], reverse=True)[:6]
    ]
    pattern_dist = [
        {"category": k, "count": v}
        for k, v in sorted(pattern_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    # Format Detection Types breakdown (Part 7)
    detection_types = []
    for d_type, stats in type_tracker.items():
        s_total = stats["total"]
        if s_total < 5:
            detection_types.append({
                "detection_type": d_type,
                "samples": s_total,
                "status": "insufficient_data",
                "message": "Insufficient evaluation data",
                "accuracy": None,
                "precision": None,
                "recall": None,
                "f1": None
            })
        else:
            s_tp = stats["tp"]
            s_tn = stats["tn"]
            s_fp = stats["fp"]
            s_fn = stats["fn"]
            s_acc = (s_tp + s_tn) / s_total if s_total else 0.0
            s_prec = s_tp / (s_tp + s_fp) if (s_tp + s_fp) else 0.0
            s_rec = s_tp / (s_tp + s_fn) if (s_tp + s_fn) else 0.0
            s_f1 = 2 * (s_prec * s_rec) / (s_prec + s_rec) if (s_prec + s_rec) else 0.0
            detection_types.append({
                "detection_type": d_type,
                "samples": s_total,
                "status": "available",
                "message": None,
                "accuracy": round(s_acc * 100, 1),
                "precision": round(s_prec * 100, 1),
                "recall": round(s_rec * 100, 1),
                "f1": round(s_f1 * 100, 1)
            })

    # Format Scam Category Analysis (Part 8)
    scam_categories = []
    for cat_name, c_data in category_tracker.items():
        # Focus on scam categories from dataset
        if c_data["scam"] > 0:
            rec = c_data["tp"] / c_data["scam"] if c_data["scam"] else 0.0
            scam_categories.append({
                "category": cat_name,
                "total_samples": c_data["total"],
                "actual_scams": c_data["scam"],
                "detected_risky": c_data["detected_risky"],
                "recall_rate": round(rec * 100, 1),
                "status": "High Detection" if rec >= 0.8 else "Moderate Detection"
            })
    scam_categories.sort(key=lambda x: x["total_samples"], reverse=True)

    iso_timestamp = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    return EvaluationMetricsResponse(
        total_scenarios=total,
        scam_scenarios=scam_count,
        genuine_scenarios=genuine_count,
        true_positives=tp,
        true_negatives=tn,
        false_positives=fp,
        false_negatives=fn,
        accuracy=round(accuracy * 100, 2),
        precision=round(precision * 100, 2),
        recall=round(recall * 100, 2),
        f1_score=round(f1 * 100, 2),
        false_positive_rate=round(fpr * 100, 2),
        avg_latency_ms=round(avg_latency, 2),
        top_detected_signals=top_signals,
        pattern_distribution=pattern_dist,
        confusion_matrix={
            "true_positive": tp,
            "false_negative": fn,
            "false_positive": fp,
            "true_negative": tn
        },
        dataset_type="synthetic",
        evaluation_timestamp=iso_timestamp,
        detection_types=detection_types,
        scam_categories=scam_categories,
        disclaimer="Evaluation performed on synthetic demonstration dataset. Not real-world banking statistics."
    )



@router.get("/nlp-metrics")
def get_nlp_ml_metrics():
    from backend.engine.ml_classifier import ml_classifier
    return ml_classifier.get_metrics()
