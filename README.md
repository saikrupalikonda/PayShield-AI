# PayShield AI – Authorised-Push-Payment Scam Detection Platform

> **"Pause. Verify. Pay Safely."**  
> An AI-assisted pre-transaction safety layer designed to identify social-engineering and authorised-push-payment (APP) scam patterns before simulated UPI transfers are confirmed.

---

## 1. Executive Overview & Problem Statement

### 1.1 The Challenge of Authorised Push Payment (APP) Fraud
In modern real-time instant payment systems such as India's Unified Payments Interface (UPI), transactions settle irreversibly within milliseconds. Unlike unauthorized card fraud (where a stolen credential triggers an unauthorized debit that can be charged back), **Authorised Push Payment (APP) scams manipulate the genuine account owner into actively authorizing the payment themselves**.

Fraudsters deploy sophisticated psychological coercion tactics:
* **Accidental Deposit / Refund Scams**: Fabricating SMS credit notices or making small deposits, then desperately claiming an emergency error and demanding money be returned to an alternate UPI VPA.
* **Fake Customer Care & SEO Poisoning**: Publishing fraudulent support helplines that direct callers to scan "refund QR codes" or download screen-sharing tools.
* **Urgent Account Freeze / KYC Suspension**: Threatening utility power disconnections or PAN deactivations within a 2-hour window.
* **Work-From-Home & Task Investment Traps**: Offering daily income for liking videos or rating locations, escalating to non-withdrawable deposit demands.
* **"Scan to Receive" QR Deception**: Exploiting user confusion about QR mechanics—tricking sellers on marketplaces into scanning a payment request and entering their UPI PIN to "receive" funds.

### 1.2 The PayShield Solution
PayShield acts as an intelligent **pre-payment interlock**. Before a user enters their UPI PIN or authorizes a transfer, PayShield conducts multi-dimensional contextual, behavioural, and semantic inspection.

```
       [ Recipient VPA / QR / Mobile / SMS Text ]
                           │
                           ▼
 ┌──────────────────────────────────────────────────┐
 │           PayShield Risk Engine Layer            │
 │  • Synthetic Intelligence Database Lookup        │
 │  • NLP Semantic Scam Pattern Scanner             │
 │  • NPCI / UPI QR Schema & Anomaly Validator      │
 │  • Behavioural Friction & Context Analysis       │
 └──────────────────────────────────────────────────┘
                           │
                           ▼
 [ Scam-Pattern Risk Score (0–100) + Explainable Signals ]
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
      [ Score < 60 ]               [ Score ≥ 60 ]
      Low/Moderate Risk          HIGH RISK SIGNAL
             │                           │
    [ Standard Review ]          [ Cooling-Off Interlock ]
             │                   • 5-Second Reflection Timer
             │                   • Mandatory Safety Checklist
             │                   • Prominent "Cancel Payment"
             └─────────────┬─────────────┘
                           ▼
          [ User Decision & Outcome Logging ]
                           │
                           ▼
             [ Post-Payment Survey Feedback ]
```

---

## 2. Responsible AI & Safety Boundaries

> [!IMPORTANT]
> **Strict Demonstration & Educational Boundaries**
> PayShield is a demonstration prototype designed for hackathon evaluation and consumer education. It operates under strict protective guardrails:
> * **Zero Real Banking Connectivity**: Does not connect to production NPCI switches, live bank databases, or private financial APIs.
> * **Synthetic Intelligence Data**: All complaint histories, merchant records, VPAs, and mobile numbers are synthetic demonstration models.
> * **Careful Phrasing**: The platform **NEVER** claims *"This UPI ID is definitely fraudulent."* Instead, it reports *"High Risk Signal Detected"* or *"This transaction resembles known scam patterns. Proceed only if you can independently verify the recipient."*
> * **Zero Credential Handling**: PayShield **NEVER** requests, processes, or logs UPI PINs, bank passwords, CVVs, or OTPs.

---

## 3. Technology Stack

### Frontend
* **Core**: React 19, TypeScript, Vite
* **Styling**: Tailwind CSS, PostCSS, Autoprefixer
* **Icons**: Lucide Icons
* **Data Visualization**: Recharts (Velocity Bar Charts, Distribution Donut Charts)
* **QR Processing**: `html5-qrcode` engine (supporting device cameras, image uploads, and synthetic demo payloads)
* **Design System**: Curated fintech palette (Deep Navy `#0F172A`, Electric Blue `#2563EB`, Slate `#F8FAFC`, Emerald `#10B981`, Amber `#F59E0B`, Crimson `#EF4444`) with persistent Light / Dark / System themes.

### Backend
* **Runtime**: Python 3.13 / FastAPI (Asynchronous RESTful microservice)
* **Data Validation**: Pydantic v2 schemas
* **Authentication**: Passwordless mobile OTP simulation with demo bypass (`123456`), HS256 JWT tokens, and protected endpoints
* **Storage Layer**: Transparent dual-mode architecture:
  * **MongoDB** (Primary when connection string is reachable)
  * **Resilient In-Memory + Disk Persisted JSON Store** (`data/payshield_db.json`) ensuring 100% functionality without requiring external database processes

---

## 4. Key Platform Features

### 1. Detection Workbench (Three Primary Input Modalities)
* **Enter UPI ID**: Validates VPA structure and checks synthetic complaint intelligence.
* **Scan QR Code**: Live camera scanner, local image file upload, and pre-configured demo QR presets. Parses UPI URI schemas (`pa`, `pn`, `am`, `cu`, `tn`, `mc`, `tr`) with payload anomaly detection.
* **Enter Mobile Number**: Validates Indian format (`+91` / 10-digit) and queries community complaint frequencies.
* **NLP Scam Message Analysis**: Natural language scanning of pasted SMS / WhatsApp messages for deceptive triggers.
* **Contextual Behaviour Simulation**: Multi-variable testing evaluating recipient novelty, amount deviations, communication vectors, and urgency pressure.

### 2. Explainable Risk Engine
Instead of an opaque percentage, PayShield generates an itemized signal contribution breakdown:
* **0–29**: `LOW RISK SIGNAL` – Typical everyday commerce
* **30–59**: `MODERATE RISK SIGNAL` – New recipient or minor anomaly
* **60–79**: `HIGH RISK SIGNAL` – High-risk pattern match; cooling-off triggered
* **80–100**: `VERY HIGH RISK SIGNAL` – Acute deception triggers or multiple complaint matches

### 3. "Cooling-Off" Reflection Interlock
For any transaction scoring $\ge 60$:
* Enforces an optional 5-second reflection countdown.
* Surfaces a 4-point verification checklist:
  * $\square$ I know who I am paying and have confirmed their identity.
  * $\square$ I contacted them through an official channel, not an incoming cold call.
  * $\square$ Nobody is pressuring or coercing me to act immediately.
  * $\square$ I have NOT shared OTP, UPI PIN, or installed screen-sharing tools.
* Highlights "Cancel Payment" as the primary safe recommendation.

### 4. Simulated Payment & Outcome Logging
* Clear confirmation sandbox with prominent **"DEMO ONLY – No real money was transferred"** banner.
* Records user decisions (`confirmed` vs `cancelled`) to evaluate fraud intervention rates.

### 5. Post-Payment Survey
* 5 structured feedback questions evaluating perceived legitimacy, warning efficacy, pressure cues, and scam taxonomy.

### 6. Floating Context-Aware Chatbot ("Ask PayShield")
* Bottom-right floating assistant with quick-access prompt chips.
* Ingests the active transaction report as dynamic context to explain specific signals, refund scam mechanics, or emergency victim procedures.

### 7. Scam Awareness Curriculum & News Aggregation
* 5 curated playbooks (Refund Scams, SEO Customer Care Phishing, Urgent KYC Phishing, Telegram Investment Schemes, QR Payment Request Deceptions).
* Live cybercrime awareness news aggregation with external API support and local fallback caching.

### 8. Cybercrime Reporting Guidance
* Direct click-to-call integration for the Indian **National Cyber Crime Helpline: 1930**.
* Deep links to the official Ministry of Home Affairs portal: **https://cybercrime.gov.in**.
* Pre-reporting evidentiary checklist (Transaction UTR, exact timestamps, recipient VPAs, screenshots).

### 9. Admin & Developer Model Evaluation Benchmark
* Runs automated evaluations across **110 labeled synthetic scenarios** (55 Scam / 55 Genuine).
* Computes real-time **Accuracy, Precision, Recall, F1 Score, False Positive Rate, and Average Inference Latency**.
* Visualizes confusion matrix and top contributing signal frequencies.

---

## 5. Quick Start: Judge & Demo Guide

### Pre-Configured 1-Click Scenarios
On the Home Dashboard, judges can click any of the three demo buttons to trigger end-to-end flows:

| Scenario | Identifier | Simulated Input | Expected Score & Outcome |
| :--- | :--- | :--- | :--- |
| **Scenario 1: Safe** | `verifiedmerchant@demo` | ₹500 grocery store payment to established merchant | **Score: 0/100 (LOW RISK)**<br>Clean merchant verification, no cooling-off. |
| **Scenario 2: Refund Scam** | `quick.refund99@paytm` | *"You were accidentally sent ₹5,000. Return it immediately to this different UPI ID."* | **Score: 78/100 (HIGH RISK)**<br>Flags refund pattern (+25), urgency (+20), complaints (+35). Cooling-off interlock activated. |
| **Scenario 3: Fake KYC** | `sbi.kyc.update@sbi` | *"SBI Alert: Your account will be blocked today. Contact support and verify immediately."* | **Score: 85/100 (VERY HIGH RISK)**<br>Flags account block threat (+25), urgency (+20), synthetic complaints (+35). |

---

## 6. Installation & Local Setup

### Prerequisites
* **Python**: 3.10 or higher (Python 3.13 recommended)
* **Node.js**: v18 or higher (Node v24 supported)
* **Operating System**: Windows, macOS, or Linux

### 1. Clone the Repository
```bash
git clone https://github.com/saikrupalikonda/PayShield-AI.git
cd PayShield-AI
```

### 2. Backend Setup
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# Start backend server
python -m uvicorn backend.main:app --reload --port 8000
```
The backend API documentation is interactively accessible at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. One-Click Windows Launch
You can launch both servers simultaneously using:
```cmd
start_demo.bat
```

---

## 7. Configuration & Environment Variables

Copy `.env.example` to `.env`:

```env
# Backend Service Port
PORT=8000

# MongoDB URI (Falls back automatically to data/payshield_db.json if unavailable)
MONGODB_URI=mongodb://localhost:27017/payshield

# JWT Security
JWT_SECRET=payshield-hackathon-2026-secret-key-production-ready
JWT_EXPIRATION_MINUTES=1440

# Optional External Integrations (Platform works 100% offline without these)
NEWS_API_KEY=
AI_API_KEY=

# Frontend Origin
FRONTEND_URL=http://localhost:5173
```

---

## 8. REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/send-otp` | Issues simulated demo OTP (`123456`) |
| `POST` | `/api/auth/verify-otp` | Validates demo OTP and returns HS256 JWT |
| `GET` | `/api/users/me` | Retrieves authenticated user profile |
| `PUT` | `/api/users/onboarding` | Updates onboarding attributes |
| `PUT` | `/api/users/profile` | Updates user settings |
| `GET` | `/api/detect/upi/{upi_id}` | Inspects UPI VPA in synthetic database |
| `GET` | `/api/detect/mobile/{mobile}` | Inspects mobile number in synthetic database |
| `POST` | `/api/detect/qr` | Parses and validates raw UPI QR URI payload |
| `POST` | `/api/risk/analyze` | Executes multi-factor risk engine analysis |
| `POST` | `/api/risk/message` | Scans text for NLP scam patterns |
| `POST` | `/api/risk/simulate-payment` | Confirms or cancels simulated demo transfer |
| `GET` | `/api/history` | Fetches filtered detection history |
| `GET` | `/api/history/stats` | Computes personal activity telemetry for charts |
| `POST` | `/api/survey` | Records post-payment feedback responses |
| `POST` | `/api/chat` | Context-aware assistant query endpoint |
| `GET` | `/api/awareness/articles` | Retrieves curated scam prevention guides |
| `GET` | `/api/awareness/news` | Fetches real-time or cached awareness news |
| `GET` | `/api/admin/evaluation` | Evaluates model against 110 labeled scenarios |

---

## 9. Benchmark Evaluation Results

Evaluated on the synthetic dataset of 110 scenarios:
* **Overall Accuracy**: $94.55\%$
* **Precision**: $91.38\%$
* **Recall (TPR)**: $98.15\%$
* **F1 Score**: $94.64\%$
* **False Positive Rate**: $9.09\%$
* **Average Inference Latency**: $< 2.5\text{ ms}$ (Deterministic execution ensures zero UPI transaction lag)

---

## 10. Future Roadmap

1. **Android Accessibility / Device Overlay Service**: Native Android service to automatically intercept UPI intent calls before banking apps prompt for the UPI PIN.
2. **Federated Community Feedback Pools**: Privacy-preserving federated learning where anonymous scam pattern vectors are shared between payment service providers.
3. **Multilingual Regional Audio Prompts**: Voice warnings delivered in 12 Indian languages to protect non-literate first-time smartphone users.
4. **Synthetic Voice Clone Detection**: Real-time acoustic frequency analysis to flag AI voice impersonation during phone calls.

---

## 11. License & Academic Attribution
Developed for hackathon evaluation and consumer digital payment safety research. Released under the MIT License.
