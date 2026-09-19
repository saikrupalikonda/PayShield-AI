export interface User {
  id: string;
  mobile: string;
  masked_mobile: string;
  full_name?: string;
  age_group?: string;
  profession?: string;
  digital_banking_exp?: string;
  preferred_payment_method?: string;
  typical_txn_range?: string;
  is_onboarded: boolean;
  created_at: string;
}

export interface RiskFactor {
  factor: string;
  score_contribution: number;
  explanation: string;
  icon: string;
}

export interface SyntheticReportInfo {
  identifier: string;
  identifier_type: string;
  name?: string;
  report_count: number;
  risk_level: string;
  categories: string[];
  first_reported?: string;
  last_reported?: string;
  details?: string;
  is_synthetic: boolean;
}

export interface StructuredUPIQR {
  raw_payload: string;
  is_valid_upi: boolean;
  pa?: string;
  pn?: string;
  am?: string;
  cu?: string;
  tn?: string;
  mc?: string;
  tr?: string;
  url?: string;
  anomaly_flags: string[];
}

export interface RiskAnalysisResult {
  analysis_id: string;
  identifier: string;
  identifier_type: string;
  risk_score: number;
  risk_level: 'LOW RISK SIGNAL' | 'MODERATE RISK SIGNAL' | 'HIGH RISK SIGNAL' | 'VERY HIGH RISK SIGNAL';
  factors: RiskFactor[];
  plain_explanation: string;
  recommended_actions: string[];
  cooling_off_required: boolean;
  cooling_off_seconds: number;
  synthetic_report_match?: SyntheticReportInfo;
  qr_data?: StructuredUPIQR;
  demo_scenario_name?: string;
  created_at: string;
}

export interface DetectionHistoryItem {
  id: string;
  user_id: string;
  timestamp: string;
  detection_type: string;
  identifier: string;
  amount?: number;
  risk_score: number;
  risk_level: string;
  action_taken: string;
  analysis_result: RiskAnalysisResult;
}

export interface AwarenessArticle {
  id: string;
  title: string;
  short_description: string;
  content: string;
  category: string;
  published_date: string;
  read_time: string;
  icon: string;
  source?: string;
  is_local: boolean;
  url?: string;
}

export interface EvaluationMetrics {
  total_scenarios: number;
  scam_scenarios: number;
  genuine_scenarios: number;
  true_positives: number;
  true_negatives: number;
  false_positives: number;
  false_negatives: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  false_positive_rate: number;
  avg_latency_ms: number;
  top_detected_signals: { name: string; count: number }[];
  pattern_distribution: { category: string; count: number }[];
  confusion_matrix: {
    true_positive: number;
    false_negative: number;
    false_positive: number;
    true_negative: number;
  };
  disclaimer: string;
  dataset_type?: string;
  evaluation_timestamp?: string;
  detection_types?: {
    detection_type: string;
    samples: number;
    status: string;
    message?: string | null;
    accuracy?: number | null;
    precision?: number | null;
    recall?: number | null;
    f1?: number | null;
  }[];
  scam_categories?: {
    category: string;
    total_samples: number;
    actual_scams: number;
    detected_risky: number;
    recall_rate: number;
    status: string;
  }[];
}


export interface QRDetectResponse {
  qr_data: StructuredUPIQR;
  synthetic_report?: SyntheticReportInfo;
  risk_score: number;
  risk_level: string;
  signals: RiskFactor[];
  recommendation: string;
  plain_explanation: string;
  cooling_off_required: boolean;
  is_known_complaint: boolean;
  notice: string;
  analysis_result?: RiskAnalysisResult;
}

export interface DetectedPhrase {
  phrase: string;
  category: string;
  score_contribution: number;
  start_index: number;
  end_index: number;
}

export interface DetectedSignalCard {
  signal: string;
  score_contribution: number;
  explanation: string;
  category: string;
  icon: string;
}

export interface MessageAnalysisResponse {
  analysis_id: string;
  message: string;
  message_hash: string;
  risk_score: number;
  risk_level: string;
  primary_category: string;
  detected_categories: string[];
  detected_signals: DetectedSignalCard[];
  matched_phrases: DetectedPhrase[];
  plain_explanation: string;
  recommended_action: string;
  urgency_detected: boolean;
  refund_detected: boolean;
  impersonation_detected: boolean;
  ml_prediction?: {
    category: string;
    confidence: number;
    is_scam: boolean;
    probabilities: Record<string, number>;
    classifier: string;
  };
  timestamp: string;
}

export interface MessageFeedbackRequest {
  detection_id: string;
  was_helpful: 'Yes' | 'No' | string;
  received_message: 'Yes' | 'No' | string;
  reported: 'Yes' | 'No' | 'Not yet' | string;
}

export interface MessageFeedbackResponse {
  success: boolean;
  message: string;
}

export interface MessageDetectionRecord {
  id: string;
  user_id: string;
  message_hash: string;
  message_preview: string;
  message_category: string;
  risk_score: number;
  risk_level: string;
  detected_signals: string[];
  timestamp: string;
  user_feedback?: Record<string, string>;
  analysis_result: MessageAnalysisResponse;
}

export interface DemoMessageItem {
  id: string;
  title: string;
  text: string;
  expected_category: string;
  expected_risk: string;
  description: string;
}

export interface NLPEvaluationMetrics {
  benchmark_accuracy?: number;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  overall_metrics?: {
    accuracy: number;
    macro_precision: number;
    macro_recall: number;
    macro_f1: number;
    sample_count: number;
  };
  category_metrics?: Record<string, { precision: number; recall: number; f1: number; support: number }>;
  confusion_matrix?: { labels?: string[]; matrix?: number[][] } | number[][];
  categories?: string[];
  classes?: string[];
  model_type?: string;
  dataset_info?: string;
  disclaimer?: string;
}

