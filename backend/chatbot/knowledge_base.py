"""
PayShield Assistant Dedicated Knowledge Base
Contains authoritative, structured knowledge regarding:
1. PAYSHIELD_BASICS (What it is, does, does not do, risk scoring, limitations, synthetic data)
2. SCAM_KNOWLEDGE_BASE (Authorised push payment fraud, refund scams, fake support, KYC, OTP, QR, rewards, investments, delivery, impersonation)
3. CYBERCRIME_RESOURCES (1930 Helpline, cybercrime.gov.in, incident response, evidence preservation)
"""

PAYSHIELD_BASICS = {
    "name": "PayShield",
    "assistant_name": "PayShield Assistant",
    "tagline": "Understand the risk. Verify before you pay.",
    "mission": (
        "PayShield is a pre-transaction fraud prevention and risk intelligence platform designed to "
        "protect consumers from Authorised Push Payment (APP) fraud, social-engineering lures, and deceptive UPI payment requests."
    ),
    "what_it_does": [
        "Analyzes recipient UPI IDs (VPAs) for syntax validity and historical synthetic complaint records.",
        "Decodes UPI QR codes to extract payee parameters (pa, pn, am, cu, tn, mc, tr) and detects hidden payment instructions or pre-set debit amounts.",
        "Evaluates mobile numbers against Indian telecommunication formats and synthetic fraud reports.",
        "Applies explainable 10-category NLP to analyze SMS, WhatsApp messages, and emails for social-engineering coercion, manufactured panic, and credential theft.",
        "Calculates an itemized Scam-Pattern Risk Score (0–100) with transparent score contribution cards.",
        "Imposes a cooling-off interlock period for high-risk transfers (scores >= 60) to prevent impulsive transfers under psychological pressure.",
        "Provides interactive simulations and cyber awareness guides to educate users on payment safety."
    ],
    "what_it_does_not_do": [
        "PayShield DOES NOT connect to your private bank account, credit card, or savings balance.",
        "PayShield DOES NOT process, store, or ever ask for your UPI PIN, OTP, NetBanking password, or CVV.",
        "PayShield IS NOT connected to NPCI production banking switches or real-time police surveillance networks.",
        "PayShield DOES NOT execute or reverse real monetary transactions; it is an intelligence and safety verification layer.",
        "PayShield DOES NOT guarantee 100% safety; absence of complaints in demonstration data does not prove an unfamiliar recipient is legitimate."
    ],
    "risk_score_model": {
        "definition": (
            "PayShield calculates a Scam-Pattern Risk Score from 0 to 100 based on the presence and weight of deceptive signals. "
            "It is NOT a statistical percentage or probability of fraud (e.g. a score of 78 does NOT mean '78% chance of fraud'). "
            "Rather, it measures how strongly the transaction characteristics align with known scam patterns."
        ),
        "tiers": [
            {
                "range": "0–29",
                "label": "LOW RISK SIGNAL",
                "meaning": "Typical everyday commerce behaviour. No known complaints or red flags found in available data.",
                "action": "Always verify recipient name and amount before confirming."
            },
            {
                "range": "30–59",
                "label": "MODERATE RISK SIGNAL",
                "meaning": "Contains novelty or contextual warning signs (such as a first-time recipient, unusual communication channel, or unverified merchant code).",
                "action": "Pause and double check recipient details before transferring funds."
            },
            {
                "range": "60–79",
                "label": "HIGH RISK SIGNAL",
                "meaning": "Significant scam-pattern signals detected (manufactured urgency, refund context, or synthetic complaint matches).",
                "action": "Mandatory cooling-off delay triggered. Strongly advised not to proceed without independent verification."
            },
            {
                "range": "80–100",
                "label": "VERY HIGH RISK SIGNAL",
                "meaning": "Multiple acute deceptive triggers or matched known complaint clusters (OTP solicitation, fake authority threat, unverified refund desk).",
                "action": "Immediate danger. Do NOT authorize payment or share any credentials."
            }
        ]
    },
    "qr_analysis_mechanics": (
        "PayShield decodes the raw URI payload (upi://pay?...) embedded in the QR image or camera frame. "
        "It extracts the Payee VPA (pa), Payee Name (pn), Embedded Amount (am), Currency (cu), Note (tn), Merchant Code (mc), and Reference (tr). "
        "It flags anomalies such as pre-set amounts or misleading notes (e.g. 'Refund Reversal' when the QR will actually DEBIT your account). "
        "It then queries the synthetic intelligence database for known complaint records."
    ),
    "sms_analysis_mechanics": (
        "PayShield utilizes a 10-category NLP engine and calibrated TF-IDF text classifier to inspect messages for linguistic coercion. "
        "It highlights exact matched phrases using character offsets, evaluates countdown and panic triggers, checks safe negation patterns "
        "(e.g. 'I never share my OTP' is recognized as safe), and breaks down score contributions by category."
    ),
    "synthetic_data_transparency": (
        "All complaint histories, merchant names (e.g., scammer123@demo, quick.refund99@paytm), and test scenarios in PayShield "
        "are drawn from curated, synthetic demonstration datasets designed for educational and evaluation purposes. "
        "No real-world personally identifiable information (PII) or confidential banking telemetry is stored or utilized."
    )
}

SCAM_KNOWLEDGE_BASE = {
    "authorised_push_payment_fraud": {
        "title": "Authorised Push Payment (APP) Fraud",
        "summary": (
            "Authorised Push Payment (APP) fraud occurs when a victim is deceived or manipulated into authorizing a payment themselves. "
            "Because the user legitimately approves the transaction with their own UPI PIN or biometrics, traditional bank fraud filters "
            "often fail to flag it as unauthorized. PayShield focuses on identifying psychological and contextual warning signals before confirmation."
        ),
        "key_takeaway": "Scammers don't hack your bank account; they hack your trust and panic response."
    },
    "refund_scam": {
        "title": "Accidental Refund / Overpayment Scam",
        "description": (
            "Someone contacts you claiming they accidentally transferred money to your UPI ID or bank account (often citing an emergency, hospital bill, or wrong number). "
            "They display fake screenshots or spoofed SMS alerts and plead with you to 'return' or 'refund' the money immediately to an alternate UPI ID."
        ),
        "why_it_works": "Manipulates human honesty, goodwill, and urgency to prevent you from checking your actual bank statement.",
        "golden_rules": [
            "Never transfer money back based on SMS notifications or caller claims.",
            "Open your official banking app and check your actual updated account ledger.",
            "If genuine excess money arrived, let the bank handle official inter-bank reversal requests.",
            "Never send funds to an 'alternate' UPI ID or phone number."
        ]
    },
    "fake_customer_support": {
        "title": "Fake Customer Support & Tech Support Impersonation",
        "description": (
            "Scammers post fake helpline numbers on Google Maps, social media, or search engines for banks, e-commerce apps (Amazon, Flipkart), "
            "or courier services. When you call, they pose as customer care executives and instruct you to download remote screen-sharing apps "
            "(AnyDesk, TeamViewer, RustDesk) or make a 'token' payment of ₹1, ₹5, or ₹10 to register a complaint."
        ),
        "golden_rules": [
            "Never search for customer support phone numbers on public search engines; only use verified numbers within the official app.",
            "Legitimate customer support will NEVER ask you to install screen-sharing software or make a verification payment.",
            "Never trust an incoming caller merely because they know your name or recent order."
        ]
    },
    "kyc_scam": {
        "title": "KYC & Account Suspension Threat Scam",
        "description": (
            "Fraudsters send urgent SMS or WhatsApp messages claiming your bank account, PAN card, SIM card, or electricity service "
            "will be suspended or disconnected within 2 to 24 hours due to incomplete KYC. They provide an unverified link or phone number to 'update KYC'."
        ),
        "golden_rules": [
            "Banks and utilities NEVER terminate services via casual SMS links with a short countdown deadline.",
            "Never click on unverified bit.ly, apk download, or third-party web forms for KYC updates.",
            "Visit your official bank branch or log in securely through the bank's verified netbanking portal."
        ]
    },
    "otp_scam": {
        "title": "OTP & Credential Harvesting",
        "description": (
            "An OTP (One-Time Password) is a secondary authentication secret designed exclusively for your eyes. "
            "Scammers invent convincing scenarios (approving a refund, verifying identity, cancelling a fraudulent order) to trick you into reading out the OTP."
        ),
        "golden_rules": [
            "NEVER share an OTP with ANYONE, including bank staff, police, or delivery agents.",
            "Read the OTP SMS carefully: does it say 'debit of ₹...' or 'transfer authorized'?",
            "Never enter your UPI PIN to 'receive' money or 'verify' an identity."
        ]
    },
    "qr_scam": {
        "title": "UPI QR Code Deception Scam",
        "description": (
            "Scammers on marketplace platforms (OLX, Quikr, Facebook Marketplace) pose as buyers and send a QR code claiming: "
            "'Scan this QR code to receive payment for your item.' In reality, scanning a QR code and entering your UPI PIN is exclusively "
            "an instruction to DEBIT funds from your account, never to receive money."
        ),
        "golden_rules": [
            "RECEIVING money on UPI NEVER requires scanning a QR code.",
            "RECEIVING money on UPI NEVER requires entering your UPI PIN.",
            "If someone tells you to scan a QR to receive payment or claim a refund, it is 100% a scam."
        ]
    },
    "reward_cashback_scam": {
        "title": "Reward, Lottery & Cashback Lure",
        "description": (
            "Messages promising unexpected cash prizes, lucky draw winnings, scratch-card bonuses, or massive cashback (e.g. 'Pay ₹500 to unlock ₹15,000'). "
            "Scammers require an upfront 'registration fee', 'processing tax', or 'activation token' before the non-existent reward can be released."
        ),
        "golden_rules": [
            "You never have to pay money to receive a legitimate prize or reward.",
            "Real cashback is credited directly to your linked account or merchant wallet without pre-payments.",
            "Ignore unsolicited lottery or lucky draw claims from unknown numbers."
        ]
    },
    "investment_job_scam": {
        "title": "Part-Time Task & High-Return Investment Scam",
        "description": (
            "Unsolicited job offers via WhatsApp or Telegram promising ₹2,000–₹10,000 daily for simple tasks like 'liking YouTube videos', "
            "'rating hotels on Google', or 'crypto arbitrage'. Victims are paid small initial rewards (₹150–₹500) to build trust, then coerced into "
            "depositing large 'pre-paid task' funds that can never be withdrawn."
        ),
        "golden_rules": [
            "Legitimate employers do not recruit through unsolicited Telegram groups or demand advance deposits.",
            "Guaranteed high daily returns (e.g. 20% to 100% per week) are the hallmark of Ponzi and task fraud.",
            "Never deposit money to unlock earned task commissions."
        ]
    },
    "delivery_scam": {
        "title": "Parcel Delivery & Address Verification Scam",
        "description": (
            "SMS or WhatsApp messages claiming your parcel from India Post, Blue Dart, or FedEx cannot be delivered due to an incomplete address. "
            "You are instructed to click a link and pay a nominal re-delivery fee of ₹5 or ₹25, which leads to a phishing page capturing your card and OTP."
        ),
        "golden_rules": [
            "Postal and courier services do not request address updates or minor fee payments via casual SMS links.",
            "Always track parcels exclusively on the official courier tracking website using your consignment number."
        ]
    },
    "impersonation_scam": {
        "title": "Authority & Emotional Impersonation Scam",
        "description": (
            "Scammers pretend to be trusted figures: police officers (threatening 'digital arrest'), CBI/ED investigators, "
            "electricity board engineers, army personnel on OLX, or friends/family in distress. They use fear or sympathy to rush payments."
        ),
        "golden_rules": [
            "Indian law enforcement and judicial courts NEVER conduct 'digital arrests' over WhatsApp video calls.",
            "Government agencies and banks never demand instant UPI transfers to private accounts to avoid arrest or penalties.",
            "If a friend or relative texts asking for urgent money, call them directly on their known phone number to verify."
        ]
    },
    "social_engineering": {
        "title": "Social Engineering & Psychological Manipulation",
        "description": (
            "The psychological manipulation of individuals into divulging confidential information or executing irreversible financial actions. "
            "Common vectors include: Manufactured Urgency (countdown timers), Fear & Intimidation (legal/police threats), Greed (unearned wealth), "
            "and Sympathy (emergency medical pleas)."
        ),
        "golden_rules": [
            "Whenever you feel an intense emotional urge to pay immediately, STOP. Take a 5-minute pause.",
            "Discuss the payment with a trusted family member, colleague, or friend.",
            "Scammers rely on panic to bypass your logical scrutiny."
        ]
    }
}

CYBERCRIME_RESOURCES = {
    "helpline_1930": {
        "number": "1930",
        "name": "National Cyber Financial Fraud Reporting Helpline",
        "details": (
            "Managed by the Indian Cyber Crime Coordination Centre (I4C), Ministry of Home Affairs. "
            "Dialing 1930 within the 'golden hour' (first 2 hours after a fraudulent transfer) enables law enforcement "
            "and participating banks to initiate a temporary freeze on the beneficiary's receiving account before the fraudster withdraws the money."
        )
    },
    "portal_url": "https://cybercrime.gov.in",
    "incident_response_steps": [
        "1. Contact your bank immediately: Call your bank's 24x7 fraud helpline to block your UPI ID, netbanking access, and debit card.",
        "2. Call 1930: Dial the National Cyber Financial Fraud Helpline and provide your transaction reference (UTR) and recipient details.",
        "3. Lodge an official complaint: Visit https://cybercrime.gov.in and file a formal financial fraud report.",
        "4. Preserve all evidence: Save unedited screenshots of chat logs, SMS alerts, call logs, recipient UPI IDs/QR codes, and transaction receipts.",
        "5. Beware recovery scams: Never pay money to third-party 'ethical hackers', Instagram recovery accounts, or private agents claiming they can retrieve your lost money."
    ]
}
