import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from backend.main import app
from backend.seed.seed_data import EVALUATION_DATASET

client = TestClient(app)

def test_evaluation_endpoint_status_and_schema():
    """Verify /api/admin/evaluation returns 200 and conforms to expected schema."""
    res = client.get("/api/admin/evaluation")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()

    # Required KPI fields (Part 4)
    assert "accuracy" in data
    assert "precision" in data
    assert "recall" in data
    assert "f1_score" in data
    assert "false_positive_rate" in data
    assert "total_scenarios" in data
    assert data["total_scenarios"] == len(EVALUATION_DATASET)
    assert data["total_scenarios"] > 0

    # Required Confusion Matrix (Part 5)
    cm = data.get("confusion_matrix")
    assert cm is not None
    assert "true_positive" in cm
    assert "true_negative" in cm
    assert "false_positive" in cm
    assert "false_negative" in cm
    tp = cm["true_positive"]
    tn = cm["true_negative"]
    fp = cm["false_positive"]
    fn = cm["false_negative"]
    assert tp + tn + fp + fn == data["total_scenarios"]

    # Mathematical consistency checks
    calc_acc = round((tp + tn) / data["total_scenarios"] * 100, 2)
    assert abs(data["accuracy"] - calc_acc) < 0.05

    if (tp + fp) > 0:
        calc_prec = round(tp / (tp + fp) * 100, 2)
        assert abs(data["precision"] - calc_prec) < 0.05

    if (tp + fn) > 0:
        calc_rec = round(tp / (tp + fn) * 100, 2)
        assert abs(data["recall"] - calc_rec) < 0.05

    # Evaluation timestamp and dataset type (Part 14)
    assert data.get("dataset_type") == "synthetic"
    assert "evaluation_timestamp" in data
    assert data["evaluation_timestamp"].endswith("Z") or "+00:00" in data["evaluation_timestamp"]
    print(f"[PASS] Evaluation KPI & Confusion Matrix verified: Acc={data['accuracy']}%, F1={data['f1_score']}%")


def test_evaluation_alias_endpoint():
    """Verify clean /api/evaluation alias works identically."""
    res = client.get("/api/evaluation")
    assert res.status_code == 200
    data = res.json()
    assert data["total_scenarios"] == len(EVALUATION_DATASET)
    assert data["dataset_type"] == "synthetic"
    print("[PASS] Evaluation alias endpoint /api/evaluation verified")


def test_detection_types_breakdown():
    """Verify Part 7: Detection types evaluated with insufficient data badge for mobile."""
    res = client.get("/api/admin/evaluation")
    assert res.status_code == 200
    data = res.json()
    types = data.get("detection_types")
    assert types is not None
    assert len(types) >= 4

    type_names = [t["detection_type"] for t in types]
    assert "Payment Risk Detection" in type_names
    assert "SMS/Message Detection" in type_names
    assert "QR Detection" in type_names
    assert "UPI ID Detection" in type_names
    assert "Mobile Number Detection" in type_names

    # Mobile should have insufficient data badge
    mobile_entry = next(t for t in types if t["detection_type"] == "Mobile Number Detection")
    assert mobile_entry["status"] == "insufficient_data"
    assert mobile_entry["message"] == "Insufficient evaluation data"
    print(f"[PASS] Detection types evaluated across {len(types)} channels (including insufficient data handling)")


def test_scam_categories_analysis():
    """Verify Part 8: Scam categories present in the dataset are reported."""
    res = client.get("/api/admin/evaluation")
    assert res.status_code == 200
    data = res.json()
    cats = data.get("scam_categories")
    assert cats is not None
    assert len(cats) >= 5

    cat_names = [c["category"] for c in cats]
    assert "Refund Scam" in cat_names
    assert "QR Scam" in cat_names
    assert "Investment Scam" in cat_names

    for c in cats:
        assert c["total_samples"] > 0
        assert 0 <= c["recall_rate"] <= 100
    print(f"[PASS] Scam category analysis verified across {len(cats)} categories")


def test_nlp_metrics_endpoint_resilience():
    """Verify Part 1 & Part 9: /api/admin/nlp-metrics provides full structured dictionary."""
    res = client.get("/api/admin/nlp-metrics")
    assert res.status_code == 200
    data = res.json()

    assert "benchmark_accuracy" in data or "accuracy" in data
    assert "overall_metrics" in data
    assert "category_metrics" in data
    assert isinstance(data["category_metrics"], dict)
    assert len(data["category_metrics"]) > 0

    # Ensure each category has precision, recall, f1, support
    for cat_name, metrics in data["category_metrics"].items():
        assert "precision" in metrics
        assert "recall" in metrics
        assert "f1" in metrics
        assert "support" in metrics
    print(f"[PASS] NLP classifier metrics endpoint verified with {len(data['category_metrics'])} category breakdowns")


if __name__ == "__main__":
    print("=== Running Evaluation Test Suite ===")
    test_evaluation_endpoint_status_and_schema()
    test_evaluation_alias_endpoint()
    test_detection_types_breakdown()
    test_scam_categories_analysis()
    test_nlp_metrics_endpoint_resilience()
    print("=== All Evaluation Tests PASSED ===")
