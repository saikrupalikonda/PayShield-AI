import {
  User,
  RiskAnalysisResult,
  DetectionHistoryItem,
  AwarenessArticle,
  EvaluationMetrics,
  QRDetectResponse,
  MessageAnalysisResponse,
  MessageFeedbackRequest,
  MessageFeedbackResponse,
  MessageDetectionRecord,
  DemoMessageItem,
  NLPEvaluationMetrics,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('payshield_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = 'An unexpected error occurred. Please try again.';
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch {
        // use fallback message
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  // Auth APIs
  async sendOtp(mobile: string): Promise<{ success: boolean; message: string; demo_otp: string; mobile: string }> {
    return this.request('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile }),
    });
  }

  async verifyOtp(mobile: string, otp: string): Promise<{ access_token: string; token_type: string; user: User }> {
    return this.request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp }),
    });
  }

  // User APIs
  async getMe(): Promise<User> {
    return this.request('/api/users/me');
  }

  async completeOnboarding(data: Partial<User>): Promise<User> {
    return this.request('/api/users/onboarding', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Detection & Intelligence Lookup
  async lookupUpi(upiId: string): Promise<any> {
    return this.request(`/api/detect/upi/${encodeURIComponent(upiId)}`);
  }

  async lookupMobile(mobile: string): Promise<any> {
    return this.request(`/api/detect/mobile/${encodeURIComponent(mobile)}`);
  }

  async parseQr(rawPayload: string): Promise<QRDetectResponse> {
    return this.request('/api/detect/qr', {
      method: 'POST',
      body: JSON.stringify({ raw_payload: rawPayload }),
    });
  }

  async detectQr(params: {
    raw_payload?: string;
    payee_vpa?: string;
    payee_name?: string;
    amount?: number;
    transaction_note?: string;
  }): Promise<QRDetectResponse> {
    return this.request('/api/detect/qr', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async detectMessage(message: string): Promise<MessageAnalysisResponse> {
    return this.request('/api/detect/message', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getDemoMessages(): Promise<DemoMessageItem[]> {
    return this.request('/api/detect/demo/messages');
  }

  async submitMessageFeedback(data: MessageFeedbackRequest): Promise<MessageFeedbackResponse> {
    return this.request('/api/message-detections/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMessageDetections(): Promise<MessageDetectionRecord[]> {
    return this.request('/api/message-detections');
  }

  async getNLPEvaluationMetrics(): Promise<NLPEvaluationMetrics> {
    return this.request('/api/admin/nlp-metrics');
  }

  // Risk Engine APIs
  async analyzeRisk(params: {
    identifier: string;
    identifier_type: string;
    amount?: number;
    message?: string;
    recipient_name?: string;
    is_new_recipient?: boolean;
    payment_channel?: string;
    claims_emergency?: boolean;
    immediate_action_demanded?: boolean;
    demo_scenario?: string;
  }): Promise<RiskAnalysisResult> {
    return this.request('/api/risk/analyze', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async analyzeMessage(message: string): Promise<any> {
    return this.request('/api/risk/message', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async simulatePayment(params: {
    analysis_id: string;
    recipient: string;
    amount: number;
    purpose?: string;
    action_taken: 'confirmed' | 'cancelled' | 'cooling_off_cancelled';
  }): Promise<{ transaction_id: string; status: string; message: string; recorded_at: string; is_demo: boolean }> {
    return this.request('/api/risk/simulate-payment', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // History APIs
  async getHistory(params?: { search?: string; risk_level?: string; detection_type?: string }): Promise<DetectionHistoryItem[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.risk_level) query.append('risk_level', params.risk_level);
    if (params?.detection_type) query.append('detection_type', params.detection_type);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/api/history${qs}`);
  }

  async getHistoryStats(): Promise<any> {
    return this.request('/api/history/stats');
  }

  // Survey APIs
  async submitSurvey(data: {
    analysis_id: string;
    was_legitimate: string;
    warning_helped: string;
    felt_pressured: string;
    request_type: string;
    feedback?: string;
  }): Promise<any> {
    return this.request('/api/survey', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Chatbot APIs
  async sendChatMessage(
    message: string,
    riskContext?: any,
    history?: { sender: string; text: string }[]
  ): Promise<{ reply: string; suggested_questions: string[] }> {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, risk_context: riskContext, history }),
    });
  }

  // Awareness & News APIs
  async getAwarenessArticles(): Promise<AwarenessArticle[]> {
    return this.request('/api/awareness/articles');
  }

  async getNews(refresh: boolean = false): Promise<AwarenessArticle[]> {
    return this.request(`/api/awareness/news?refresh=${refresh}`);
  }

  // Admin APIs
  async getEvaluationMetrics(): Promise<EvaluationMetrics> {
    return this.request('/api/admin/evaluation');
  }
}

export const api = new ApiService();
