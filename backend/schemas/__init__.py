from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


# --- Authentication Schemas ---
class SendOTPRequest(BaseModel):
    mobile: str = Field(..., description="Mobile number with or without +91")


class SendOTPResponse(BaseModel):
    success: bool
    message: str
    demo_otp: str
    mobile: str


class VerifyOTPRequest(BaseModel):
    mobile: str
    otp: str


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    age_group: Optional[str] = None
    profession: Optional[str] = None
    digital_banking_exp: Optional[str] = None
    preferred_payment_method: Optional[str] = None
    typical_txn_range: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    mobile: str
    masked_mobile: str
    full_name: Optional[str] = None
    age_group: Optional[str] = None
    profession: Optional[str] = None
    digital_banking_exp: Optional[str] = None
    preferred_payment_method: Optional[str] = None
    typical_txn_range: Optional[str] = None
    is_onboarded: bool = False
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Detection & Intelligence Schemas ---
class SyntheticReportInfo(BaseModel):
    identifier: str
    identifier_type: str  # upi, mobile, qr
    name: Optional[str] = None
    report_count: int = 0
    risk_level: str
    categories: List[str] = []
    first_reported: Optional[str] = None
    last_reported: Optional[str] = None
    details: Optional[str] = None
    is_synthetic: bool = True


class QRParseRequest(BaseModel):
    raw_payload: Optional[str] = None
    raw_data: Optional[str] = None
    upi_id: Optional[str] = None
    payee_name: Optional[str] = None
    amount: Optional[float] = 0.0
    transaction_note: Optional[str] = None


class StructuredUPIQR(BaseModel):
    raw_payload: str
    is_valid_upi: bool
    pa: Optional[str] = None  # payee VPA / UPI ID
    pn: Optional[str] = None  # payee name
    am: Optional[str] = None  # amount
    cu: Optional[str] = "INR" # currency
    tn: Optional[str] = None  # transaction note
    mc: Optional[str] = None  # merchant code
    tr: Optional[str] = None  # transaction ref
    url: Optional[str] = None
    anomaly_flags: List[str] = []


# --- Risk Analysis Schemas ---
class RiskFactor(BaseModel):
    factor: str
    score_contribution: int
    explanation: str
    icon: str = "info"  # check, alert, warning, alert-circle


class RiskAnalysisRequest(BaseModel):
    identifier: str
    identifier_type: str  # 'upi', 'mobile', 'qr', 'sms_text'
    amount: Optional[float] = 0.0
    message: Optional[str] = None
    recipient_name: Optional[str] = None
    is_new_recipient: bool = True
    payment_channel: str = "Unknown"  # Friend/family, Merchant, SMS, WhatsApp, Phone call, Social media, Unknown
    claims_emergency: bool = False
    immediate_action_demanded: bool = False
    demo_scenario: Optional[str] = None


class RiskAnalysisResponse(BaseModel):
    analysis_id: str
    identifier: str
    identifier_type: str
    risk_score: int
    risk_level: str  # "LOW RISK SIGNAL", "MODERATE RISK SIGNAL", "HIGH RISK SIGNAL", "VERY HIGH RISK SIGNAL"
    factors: List[RiskFactor]
    plain_explanation: str
    recommended_actions: List[str]
    cooling_off_required: bool
    cooling_off_seconds: int = 5
    synthetic_report_match: Optional[SyntheticReportInfo] = None
    qr_data: Optional[StructuredUPIQR] = None
    demo_scenario_name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class QRDetectResponse(BaseModel):
    qr_data: StructuredUPIQR
    synthetic_report: Optional[SyntheticReportInfo] = None
    risk_score: int
    risk_level: str
    signals: List[RiskFactor]
    recommendation: str
    plain_explanation: str
    cooling_off_required: bool = False
    is_known_complaint: bool = False
    notice: str = "UPI QR decoded successfully. No PIN or bank authentication credentials are ever handled by PayShield."
    analysis_result: Optional[RiskAnalysisResponse] = None


# --- NLP Message Analysis Schemas ---
class DetectedPhrase(BaseModel):
    phrase: str
    category: str
    score_contribution: int
    start_index: int
    end_index: int


class DetectedSignalCard(BaseModel):
    signal: str
    score_contribution: int
    explanation: str
    category: str
    icon: str = "alert-triangle"


class MessageAnalysisRequest(BaseModel):
    message: str


class MessageAnalysisResponse(BaseModel):
    analysis_id: str = ""
    message: str
    message_hash: str = ""
    risk_score: int
    risk_level: str
    primary_category: str
    detected_categories: List[str] = []
    detected_signals: List[DetectedSignalCard] = []
    matched_phrases: List[DetectedPhrase] = []
    plain_explanation: str
    recommended_action: str
    urgency_detected: bool = False
    refund_detected: bool = False
    impersonation_detected: bool = False
    ml_prediction: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class MessageFeedbackRequest(BaseModel):
    detection_id: str
    was_helpful: str  # "Yes", "No"
    received_message: str  # "Yes", "No"
    reported: str  # "Yes", "No", "Not yet"


class MessageFeedbackResponse(BaseModel):
    success: bool
    message: str


class MessageDetectionRecord(BaseModel):
    id: str
    user_id: str
    message_hash: str
    message_preview: str
    message_category: str
    risk_score: int
    risk_level: str
    detected_signals: List[str] = []
    timestamp: datetime
    user_feedback: Optional[Dict[str, str]] = None
    analysis_result: MessageAnalysisResponse


class DemoMessageItem(BaseModel):
    id: str
    title: str
    text: str
    expected_category: str
    expected_risk: str
    description: str


# --- Simulated Payment & History ---
class SimulatedPaymentRequest(BaseModel):
    analysis_id: str
    recipient: str
    amount: float
    purpose: Optional[str] = "Transfer"
    action_taken: str  # 'confirmed', 'cancelled', 'cooling_off_cancelled'


class SimulatedPaymentResponse(BaseModel):
    transaction_id: str
    status: str  # 'COMPLETED_DEMO', 'CANCELLED_BY_USER'
    message: str
    recorded_at: datetime
    is_demo: bool = True


class DetectionHistoryItem(BaseModel):
    id: str
    user_id: str
    timestamp: datetime
    detection_type: str
    identifier: str
    amount: Optional[float] = None
    risk_score: int
    risk_level: str
    action_taken: str  # 'analyzed', 'confirmed', 'cancelled'
    analysis_result: RiskAnalysisResponse


# --- Post-Payment Survey ---
class SurveyCreateRequest(BaseModel):
    analysis_id: str
    was_legitimate: str  # 'Yes', 'No', "I'm not sure"
    warning_helped: str  # 'Yes', 'Somewhat', 'No'
    felt_pressured: str  # 'Yes', 'No'
    request_type: str   # 'Refund', 'Customer support', 'Friend/family', 'Merchant', 'Investment', 'Other'
    feedback: Optional[str] = None


class SurveyResponse(BaseModel):
    id: str
    user_id: str
    analysis_id: str
    submitted_at: datetime
    message: str


# --- Chatbot Schemas ---
class ChatMessageRequest(BaseModel):
    message: str
    risk_context: Optional[Dict[str, Any]] = None
    history: Optional[List[Dict[str, str]]] = []


class ChatMessageResponse(BaseModel):
    reply: str
    suggested_questions: List[str] = []


# --- Awareness & News Schemas ---
class AwarenessArticle(BaseModel):
    id: str
    title: str
    short_description: str
    content: str
    category: str
    published_date: str
    read_time: str
    icon: str
    is_local: bool = True
    source: Optional[str] = "PayShield Security Research"
    url: Optional[str] = None


# --- Admin & Evaluation Schemas ---
class EvaluationMetricsResponse(BaseModel):
    total_scenarios: int
    scam_scenarios: int
    genuine_scenarios: int
    true_positives: int
    true_negatives: int
    false_positives: int
    false_negatives: int
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    false_positive_rate: float
    avg_latency_ms: float
    top_detected_signals: List[Dict[str, Any]]
    pattern_distribution: List[Dict[str, Any]]
    confusion_matrix: Dict[str, int]
    dataset_type: str = "synthetic"
    evaluation_timestamp: Optional[str] = None
    detection_types: Optional[List[Dict[str, Any]]] = []
    scam_categories: Optional[List[Dict[str, Any]]] = []
    disclaimer: str = "Evaluation performed on synthetic demonstration dataset. Not real-world banking statistics."

