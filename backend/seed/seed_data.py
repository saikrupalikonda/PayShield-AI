"""
Synthetic demonstration data for PayShield.
All data is strictly synthetic for hackathon evaluation and educational demonstration.
"""

SYNTHETIC_REPORTS = [
    {
        "identifier": "scammer123@demo",
        "identifier_type": "upi",
        "name": "Demo Merchant (Reported)",
        "report_count": 5,
        "risk_level": "HIGH RISK SIGNAL",
        "categories": ["Refund scam", "Fake customer support"],
        "first_reported": "2026-08-14",
        "last_reported": "2026-09-18",
        "details": "PayShield found 5 synthetic reports associated with this identifier in demonstration dataset.",
        "risk_signals": [
            "Refund-related payment requests",
            "Urgency language",
            "Unfamiliar recipient"
        ],
        "is_demo_data": True,
        "is_synthetic": True
    },
    {
        "identifier": "refund_support@okhdfcbank",
        "identifier_type": "upi",
        "name": "Refund Reversal Support Desk",
        "report_count": 28,
        "risk_level": "HIGH RISK SIGNAL",
        "categories": ["Refund scam", "Fake customer support"],
        "first_reported": "2026-08-10",
        "last_reported": "2026-09-17",
        "details": "Associated with fake refund callback SMS claiming accidental money transfers.",
        "is_synthetic": True
    },
    {
        "identifier": "quick.refund99@paytm",
        "identifier_type": "upi",
        "name": "Quick Refund Desk",
        "report_count": 42,
        "risk_level": "VERY HIGH RISK SIGNAL",
        "categories": ["Refund scam", "Social engineering"],
        "first_reported": "2026-07-22",
        "last_reported": "2026-09-18",
        "details": "Reported in 42 synthetic complaints where victims were instructed to return accidental deposits.",
        "is_synthetic": True
    },
    {
        "identifier": "sbi.kyc.update@sbi",
        "identifier_type": "upi",
        "name": "SBI Netbanking KYC Unit",
        "report_count": 67,
        "risk_level": "VERY HIGH RISK SIGNAL",
        "categories": ["KYC scam", "Impersonation"],
        "first_reported": "2026-06-01",
        "last_reported": "2026-09-18",
        "details": "Impersonating public sector bank for urgent account unblocking fees.",
        "is_synthetic": True
    },
    {
        "identifier": "electricity.bill.desk@axisbank",
        "identifier_type": "upi",
        "name": "Power Distribution Helpline",
        "report_count": 35,
        "risk_level": "HIGH RISK SIGNAL",
        "categories": ["Electricity bill scam", "Impersonation"],
        "first_reported": "2026-08-04",
        "last_reported": "2026-09-16",
        "details": "Fake power cutoff threat asking for instant token settlement.",
        "is_synthetic": True
    },
    {
        "identifier": "workfromhome.earn@ybl",
        "identifier_type": "upi",
        "name": "Global Freelance Hiring",
        "report_count": 51,
        "risk_level": "VERY HIGH RISK SIGNAL",
        "categories": ["Investment scam", "Job scam"],
        "first_reported": "2026-05-18",
        "last_reported": "2026-09-15",
        "details": "Task-based Telegram investment scheme demanding deposit for payout unlock.",
        "is_synthetic": True
    },
    {
        "identifier": "customercare.amazon.order@icici",
        "identifier_type": "upi",
        "name": "E-Commerce Courier Desk",
        "report_count": 19,
        "risk_level": "HIGH RISK SIGNAL",
        "categories": ["Fake delivery scam", "Fake customer support"],
        "first_reported": "2026-08-25",
        "last_reported": "2026-09-17",
        "details": "Demands address re-confirmation fee for undelivered high-value packages.",
        "is_synthetic": True
    },
    {
        "identifier": "crypto.daily100x@okaxis",
        "identifier_type": "upi",
        "name": "Daily Alpha Yield Pool",
        "report_count": 63,
        "risk_level": "VERY HIGH RISK SIGNAL",
        "categories": ["Investment scam", "Ponzi scheme"],
        "first_reported": "2026-04-12",
        "last_reported": "2026-09-14",
        "details": "Synthetic complaints regarding Ponzi crypto trading channels.",
        "is_synthetic": True
    },
    {
        "identifier": "lottery.winner.rbi@ibl",
        "identifier_type": "upi",
        "name": "Central Reserve Clearance",
        "report_count": 82,
        "risk_level": "VERY HIGH RISK SIGNAL",
        "categories": ["Impersonation", "Cashback scam"],
        "first_reported": "2026-03-20",
        "last_reported": "2026-09-18",
        "details": "Claiming victim won government cashback or lottery requiring processing fee.",
        "is_synthetic": True
    },
    # Synthetic Mobile Numbers
    {
        "identifier": "+919876543210",
        "identifier_type": "mobile",
        "name": "Unknown Caller (Claimed Axis Support)",
        "report_count": 31,
        "risk_level": "HIGH RISK SIGNAL",
        "categories": ["Fake customer support", "Refund scam"],
        "first_reported": "2026-08-01",
        "last_reported": "2026-09-17",
        "details": "Reported in 31 synthetic logs for automated robocalls claiming accidental credit.",
        "is_synthetic": True
    },
    {
        "identifier": "9876543210",
        "identifier_type": "mobile",
        "name": "Unknown Caller (Claimed Axis Support)",
        "report_count": 31,
        "risk_level": "HIGH RISK SIGNAL",
        "categories": ["Fake customer support", "Refund scam"],
        "first_reported": "2026-08-01",
        "last_reported": "2026-09-17",
        "details": "Reported in 31 synthetic logs for automated robocalls claiming accidental credit.",
        "is_synthetic": True
    },
    {
        "identifier": "+919123456789",
        "identifier_type": "mobile",
        "name": "Disconnection Cell (Claimed Power Dept)",
        "report_count": 46,
        "risk_level": "VERY HIGH RISK SIGNAL",
        "categories": ["Electricity bill scam", "Urgency fraud"],
        "first_reported": "2026-07-15",
        "last_reported": "2026-09-16",
        "details": "Sends SMS threatening night-time power disconnection.",
        "is_synthetic": True
    },
    {
        "identifier": "+919988776655",
        "identifier_type": "mobile",
        "name": "Recruitment Executive HR",
        "report_count": 24,
        "risk_level": "HIGH RISK SIGNAL",
        "categories": ["Job scam", "Investment scam"],
        "first_reported": "2026-08-12",
        "last_reported": "2026-09-18",
        "details": "Contacted targets via WhatsApp with YouTube video liking schemes.",
        "is_synthetic": True
    },
    # Verified Clean Synthetic Merchants
    {
        "identifier": "verifiedmerchant@demo",
        "identifier_type": "upi",
        "name": "Metro Retail Mart Ltd",
        "report_count": 0,
        "risk_level": "LOW RISK SIGNAL",
        "categories": [],
        "first_reported": None,
        "last_reported": None,
        "details": "Simulated registered merchant with verified business PAN and 0 negative reports.",
        "is_synthetic": True
    },
    {
        "identifier": "swiggy@icici",
        "identifier_type": "upi",
        "name": "Swiggy Bundl Technologies",
        "report_count": 0,
        "risk_level": "LOW RISK SIGNAL",
        "categories": [],
        "first_reported": None,
        "last_reported": None,
        "details": "Simulated high-reputation food delivery merchant.",
        "is_synthetic": True
    },
    {
        "identifier": "tatapower@billdesk",
        "identifier_type": "upi",
        "name": "Tata Power Utility",
        "report_count": 0,
        "risk_level": "LOW RISK SIGNAL",
        "categories": [],
        "first_reported": None,
        "last_reported": None,
        "details": "Simulated official utility biller.",
        "is_synthetic": True
    }
]

AWARENESS_ARTICLES = [
    {
        "id": "art_01",
        "title": "Anatomy of the 'Accidental Money Sent' Refund Scam",
        "short_description": "How scammers send fake SMS or small deposits, claim an emergency error, and trick victims into sending thousands to a different UPI ID.",
        "content": """The 'Accidental Transfer' scam is one of the fastest-growing social-engineering authorised push payment scams in India.

### How the Scam Operates
1. **The Bait**: You receive an SMS notification resembling a bank credit (or occasionally a small unsolicited credit of ₹10 or ₹50 to your account).
2. **The Panic Call**: Moments later, an agitated caller calls you claiming they were attempting to pay for hospital treatment or their child's fees and accidentally punched in your mobile number/UPI ID.
3. **The Switch**: The caller begs you to return ₹5,000 or ₹10,000 immediately, but specifies a **different UPI ID** or QR code rather than the source account.
4. **The Loss**: When you check your balance later, you realize the original SMS was fake or sent from an external bulk SMS gateway, and your transfer was a real, irreversible authorized payment.

### How to Protect Yourself
- **Check Your Actual Bank App**: Never rely on an incoming SMS or screenshot. Open your mobile banking app directly to confirm actual available balance.
- **Never Pay to a Different Identifier**: If an accidental payment genuinely arrived, tell the sender to contact their bank for official dispute resolution.
- **Take 10 Minutes**: Scammers rely entirely on manufactured urgency. A 5-10 minute cooling off period breaks their psychological manipulation.""",
        "category": "Refund Scams",
        "published_date": "16 Sep 2026",
        "read_time": "4 min read",
        "icon": "RotateCcw",
        "is_local": True
    },
    {
        "id": "art_02",
        "title": "Fake Customer Support & Search Engine SEO Poisoning",
        "short_description": "Why Googling customer support numbers for airlines, courier services, and banks leads straight to cybercriminals.",
        "content": """When transactions fail or couriers delay, our first instinct is often to Google 'Customer Care Number'. Fraudsters exploit this through SEO ad hijacking.

### The Attack Vector
- Fraudsters purchase Google Ads or edit public business locations on Google Maps, placing their own phone numbers as official toll-free lines.
- When victims dial, the fraudster impersonates an executive and claims they are processing an instant refund.
- They then instruct the victim to download screen-sharing tools (AnyDesk, TeamViewer, RustDesk) or scan a 'refund QR code' to approve money receipt.

### Critical Safety Rule
- **Scanning a QR Code ALWAYS sends money, NEVER receives money.**
- Real customer support will never ask you to install remote-desktop software or enter your UPI PIN to claim a refund.""",
        "category": "Fake Support",
        "published_date": "14 Sep 2026",
        "read_time": "3 min read",
        "icon": "Headphones",
        "is_local": True
    },
    {
        "id": "art_03",
        "title": "Urgent KYC Suspension & Account Threat Phishing",
        "short_description": "Understanding deceptive messages threatening SIM deactivation, pan linking blocks, or electricity disconnections.",
        "content": """Fear of losing access to basic utilities or bank accounts causes victims to bypass rational verification checks.

### Deceptive Patterns
- *"Dear Customer, Your electricity will be disconnected tonight at 9:30 PM due to unpaid previous month bill. Contact Officer on 9876543210."*
- *"SBI Alert: Your Netbanking has been suspended due to pending PAN KYC. Click here to verify within 2 hours."*

### What You Must Know
- Utility departments never use personal 10-digit mobile numbers for official disconnection notices.
- Official bank KYC procedures never demand instant UPI transfers or credential entry on unverified web links.
- When threatened with urgency, pause immediately and call the official customer care number on your physical credit/debit card or utility bill.""",
        "category": "KYC & Phishing",
        "published_date": "10 Sep 2026",
        "read_time": "5 min read",
        "icon": "FileWarning",
        "is_local": True
    },
    {
        "id": "art_04",
        "title": "Work-From-Home & Telegram Investment Traps",
        "short_description": "From 'like YouTube videos for ₹50' to losing lakhs in fake cryptocurrency and task investment schemes.",
        "content": """Task and investment fraud preys on the desire for secondary income.

### The Progression
1. **Micro-Reward**: You receive a WhatsApp message offering ₹50-₹150 for liking 3 Google Maps places or subscribing to YouTube channels. You actually receive this first payment via UPI, establishing trust.
2. **The VIP Group**: You are added to a Telegram channel with dozens of fake participants sharing screenshots of massive earnings.
3. **The Prepaid Task**: You are asked to deposit ₹2,000 for a 30% yield, which reflects on a fake web dashboard.
4. **The Freeze**: When you try to withdraw larger profits, the system locks up, demanding 'tax clearance fees', 'margin deposits', and 'unlock levies'.

### Protective Measures
- Legitimate global companies do not recruit via unsolicited WhatsApp messages.
- Any scheme that requires paying money in order to unlock earned income is an APP scam.""",
        "category": "Investment Fraud",
        "published_date": "05 Sep 2026",
        "read_time": "4 min read",
        "icon": "TrendingUp",
        "is_local": True
    },
    {
        "id": "art_05",
        "title": "Payment Requests & QR Code Deceptions: The 'Scan to Receive' Myth",
        "short_description": "The fundamental mechanics of UPI: You only enter your UPI PIN to transfer money OUT of your bank account.",
        "content": """Many first-time digital payment users and marketplace sellers (OLX, Facebook Marketplace) are manipulated with fake QR codes.

### The Olx Seller Scenario
- A scammer poses as an eager buyer for furniture or electronics you listed online.
- They claim: *"I am an army officer and cannot visit. I am sending a QR code. Just open GPay/PhonePe and scan it, then enter your PIN to receive the advance payment."*
- When scanned, the QR code is actually a Payment Request (`upi://pay?am=15000&pa=scammer@upi`).
- As soon as the victim enters their UPI PIN, the funds are instantly deducted.

### Universal UPI Golden Rule
- **Receiving money NEVER requires entering your UPI PIN.**
- **Scanning a QR code NEVER deposits money into your bank account.**
- If any party asks you to enter your PIN or scan their code to receive money, break contact immediately.""",
        "category": "QR & Payment Scams",
        "published_date": "01 Sep 2026",
        "read_time": "3 min read",
        "icon": "QrCode",
        "is_local": True
    }
]

# 100+ Synthetic Labeled Evaluation Scenarios for the Admin Benchmark
# Balanced across refund, impersonation, fake customer support, urgency, investment, and genuine everyday transactions.
EVALUATION_DATASET = [
    # --- REFUND SCAM SCENARIOS (Label: SCAM) ---
    {"id": 1, "text": "Your refund of ₹5,000 has been processed by mistake. Return it immediately to quick.refund99@paytm", "channel": "SMS", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Refund Scam"},
    {"id": 2, "text": "We accidentally credited ₹12,000 to your GPay. Please transfer back immediately to refund_support@okhdfcbank or legal action will follow.", "channel": "WhatsApp", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Refund Scam"},
    {"id": 3, "text": "Sir, I sent money to your UPI by error. My sister is hospitalized. Please send it back to 9876543210 urgently.", "channel": "Phone call", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Refund Scam"},
    {"id": 4, "text": "Payment reversal request: We sent ₹4,500 extra cashback. Kindly return the excess to reversal@ybl now.", "channel": "SMS", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Refund Scam"},
    {"id": 5, "text": "Urgent refund: Transfer ₹8,000 to account refund.desk@paytm within 15 minutes to clear your account hold.", "channel": "SMS", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Refund Scam"},
    {"id": 6, "text": "Bank refund notification: accidental deposit of 15000 in your account. Return immediately to avoid freeze.", "channel": "WhatsApp", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Refund Scam"},
    {"id": 7, "text": "Mistaken transaction of 3500 INR. Transfer urgently back to alternate UPI ID helpdesk@axis.", "channel": "SMS", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Refund Scam"},
    {"id": 8, "text": "Refund desk error: extra payment sent. Return to merchant.refund@icici right now.", "channel": "Unknown", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Refund Scam"},
    {"id": 9, "text": "Accidentally sent 6200 to your number instead of doctor. Please send back right now to 9876543210.", "channel": "Phone call", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Refund Scam"},
    {"id": 10, "text": "Refund approval required. Pay reversal fee of 500 to unlock your 10000 refund on paytm.", "channel": "SMS", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Refund Scam"},

    # --- FAKE SUPPORT & IMPERSONATION (Label: SCAM) ---
    {"id": 11, "text": "URGENT SBI ALERT: Your account will be blocked today. Contact support agent and verify immediately.", "channel": "SMS", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Fake Support"},
    {"id": 12, "text": "HDFC Security: Suspicious transaction detected. Transfer security deposit of ₹9,999 to secure your vault.", "channel": "SMS", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Fake Support"},
    {"id": 13, "text": "This is Customer Care executive calling regarding your failed Amazon order. Pay 1 rupee verification fee via QR.", "channel": "Phone call", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Fake Support"},
    {"id": 14, "text": "Electricity officer speaking: Your power will be disconnected at 9:30 PM. Pay ₹1,200 token to 9123456789 now.", "channel": "Phone call", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Impersonation"},
    {"id": 15, "text": "RBI Fraud Department: Your pan is linked to illegal transfer. Clear penalty fee of ₹25,000 immediately.", "channel": "WhatsApp", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Impersonation"},
    {"id": 16, "text": "Telecom Regulatory Authority: Your SIM card will be deactivated within 2 hours. Pay verification charge.", "channel": "SMS", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Impersonation"},
    {"id": 17, "text": "Paytm KYC Team: Update KYC in 1 hour or wallet funds will be permanently confiscated. Pay ₹10 verification.", "channel": "SMS", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "KYC Scam"},
    {"id": 18, "text": "Courier delivery boy: Your parcel is on hold due to missing address fee of ₹50. Scan code to pay.", "channel": "Phone call", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Fake Delivery"},
    {"id": 19, "text": "GooglePay Executive: You won Diwali Scratch Card ₹10,000. Pay GST clearance fee ₹999 to claim.", "channel": "Social media", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Cashback Scam"},
    {"id": 20, "text": "Police Cyber Cell notice: Case registered against your UPI ID. Settle settlement fee immediately.", "channel": "WhatsApp", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Impersonation"},

    # --- INVESTMENT & TASK SCAMS (Label: SCAM) ---
    {"id": 21, "text": "Part-time job: Earn ₹3,000 daily reviewing hotels. Deposit ₹1,500 VIP task registration to earn ₹5,000.", "channel": "WhatsApp", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Job Scam"},
    {"id": 22, "text": "Crypto arbitrage bot: Guaranteed 200% return in 24 hours. Send ₹10,000 to pool manager wallet now.", "channel": "Social media", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Investment Scam"},
    {"id": 23, "text": "Telegram Trading Club: Level 2 task unlocked. Deposit ₹20,000 now to withdraw total profits ₹65,000.", "channel": "Social media", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Investment Scam"},
    {"id": 24, "text": "Instant pre-approved personal loan ₹5,00,000 at 2% interest. Transfer processing charge ₹4,999 to disburse.", "channel": "SMS", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Loan Scam"},
    {"id": 25, "text": "Stock market insider tip: Deposit ₹50,000 for guaranteed circuit breaker upper limit stock.", "channel": "WhatsApp", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Investment Scam"},
    {"id": 26, "text": "Work from home data entry: Pay ₹999 software license fee to receive assignments.", "channel": "Social media", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Job Scam"},
    {"id": 27, "text": "Double your money in 3 days with government certified micro-credit scheme. Send funds to agent.", "channel": "WhatsApp", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Investment Scam"},
    {"id": 28, "text": "Gold bullion token offer: purchase high grade gold vouchers at 50% discount today only.", "channel": "Social media", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Investment Scam"},
    {"id": 29, "text": "Exclusive forex signals VIP channel fee. Send payment to telegram admin ID.", "channel": "Social media", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Investment Scam"},
    {"id": 30, "text": "YouTube subscriber task: Pay ₹3,000 prepaid security to unlock high payout task 4.", "channel": "WhatsApp", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Job Scam"},

    # --- QR / OLX / MARKETPLACE SCAMS (Label: SCAM) ---
    {"id": 31, "text": "I am buying your sofa on OLX. Scan this QR code and type PIN to receive the advance payment.", "channel": "WhatsApp", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "QR Scam"},
    {"id": 32, "text": "Scan QR to get ₹2,000 instant cashback credited into your bank account immediately.", "channel": "Social media", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "QR Scam"},
    {"id": 33, "text": "Army officer buying your car: I sent you receipt QR code. Approve the request to collect funds.", "channel": "Phone call", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "QR Scam"},
    {"id": 34, "text": "Payment gateway refund link: Tap link and enter UPI PIN to receive your train cancellation refund.", "channel": "SMS", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Refund Scam"},
    {"id": 35, "text": "Scan merchant receiver barcode on phone to accept merchant compensation settlement.", "channel": "Unknown", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "QR Scam"},
    {"id": 36, "text": "Rent agreement token: scan this QR code from prospective tenant to verify bank credentials.", "channel": "WhatsApp", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "QR Scam"},
    {"id": 37, "text": "Scan voucher QR code to instantly claim 5000 Amazon shopping festival bonus.", "channel": "Social media", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Cashback Scam"},
    {"id": 38, "text": "Used bike sale: approve payment collection request to receive 15000 down payment.", "channel": "Phone call", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "QR Scam"},
    {"id": 39, "text": "Tap collect request to receive lottery award from KBC head office.", "channel": "WhatsApp", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Cashback Scam"},
    {"id": 40, "text": "Scan QR code to authorize automatic deposit into your savings account.", "channel": "SMS", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "QR Scam"},

    # --- MORE DIVERSE SCAM PATTERNS (Label: SCAM 41-55) ---
    {"id": 41, "text": "Emergency hospital bill: Send ₹18,000 immediately to friend's new UPI id, please do not ask questions.", "channel": "SMS", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Social Engineering"},
    {"id": 42, "text": "Your Netflix subscription payment failed. Account terminated unless verified on this UPI link.", "channel": "SMS", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Fake Support"},
    {"id": 43, "text": "Gas pipeline connection subsidy: Pay ₹250 registration fee to receive ₹2,000 direct benefit.", "channel": "Social media", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Impersonation"},
    {"id": 44, "text": "Tax authority: Pending penalty of ₹14,500 under section 143. Pay to designated tax desk today.", "channel": "SMS", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Impersonation"},
    {"id": 45, "text": "Customs clearance: Foreign parcel containing gold seized at airport. Pay penalty to release parcel.", "channel": "Phone call", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Impersonation"},
    {"id": 46, "text": "Traffic police e-challan unpaid: Pay ₹1,000 fine immediately or vehicle RC will be blacklisted.", "channel": "SMS", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Impersonation"},
    {"id": 47, "text": "Hospital admission deposit for mutual colleague. Transfer urgently to unverified ward boy UPI.", "channel": "Phone call", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Social Engineering"},
    {"id": 48, "text": "Urgent refund: We accidentally transferred salary twice. Return excess 30000 to HR UPI now.", "channel": "WhatsApp", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Refund Scam"},
    {"id": 49, "text": "Credit card rewards point expiring today. Redeem 5000 cash by entering UPI details.", "channel": "SMS", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Cashback Scam"},
    {"id": 50, "text": "Aadhaar biometrics locked due to suspicious login. Pay verification fee to unlock immediately.", "channel": "SMS", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "KYC Scam"},
    {"id": 51, "text": "Instant grocery delivery refund: transfer return fee 100 to process grocery balance refund.", "channel": "Phone call", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Refund Scam"},
    {"id": 52, "text": "Water board meter disconnection warning. Clear pending arrears immediately via alternate phone number.", "channel": "SMS", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Impersonation"},
    {"id": 53, "text": "Airline ticket cancellation refund pending: share OTP and initiate reverse UPI transaction.", "channel": "WhatsApp", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Fake Support"},
    {"id": 54, "text": "Fastag recharge failed: account blacklisted. Pay 500 penalty to clear toll barrier.", "channel": "SMS", "new_recipient": True, "amount_spike": False, "label": "SCAM", "category": "Impersonation"},
    {"id": 55, "text": "Overseas visa processing clearance deposit: transfer 45000 immediately to guarantee appointment.", "channel": "Phone call", "new_recipient": True, "amount_spike": True, "label": "SCAM", "category": "Social Engineering"},

    # --- GENUINE / SAFE SCENARIOS (Label: GENUINE 56-110) ---
    {"id": 56, "text": "Monthly grocery payment at Metro Retail Mart.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Everyday Commerce"},
    {"id": 57, "text": "Swiggy food order dinner delivery ₹450.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Food Delivery"},
    {"id": 58, "text": "Zomato lunch order ₹320.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Food Delivery"},
    {"id": 59, "text": "Electricity bill payment to official Tata Power biller.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Utilities"},
    {"id": 60, "text": "Mobile postpaid recharge Airtel ₹719.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Recharge"},
    {"id": 61, "text": "Transfer ₹2,000 to mom for monthly household groceries.", "channel": "Friend/family", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Family"},
    {"id": 62, "text": "Dinner bill split with roommate Amit ₹650.", "channel": "Friend/family", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Friends"},
    {"id": 63, "text": "Local bakery bread and milk payment ₹140.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Groceries"},
    {"id": 64, "text": "Uber cab ride fare payment ₹280.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Transport"},
    {"id": 65, "text": "Ola auto ride settlement ₹95.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Transport"},
    {"id": 66, "text": "Medicine purchase at Apollo Pharmacy counter ₹850.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Healthcare"},
    {"id": 67, "text": "Fuel refill at Indian Oil petrol pump ₹1,500.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Fuel"},
    {"id": 68, "text": "Book store novel purchase ₹499.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Retail"},
    {"id": 69, "text": "Monthly milk vendor subscription ₹1,200.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Subscription"},
    {"id": 70, "text": "House rent transfer to verified landlord ₹18,000.", "channel": "Friend/family", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Rent"},
    {"id": 71, "text": "Coffee and sandwich at Starbucks ₹380.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Dining"},
    {"id": 72, "text": "Movie tickets booking on BookMyShow ₹520.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Entertainment"},
    {"id": 73, "text": "Broadband internet renewal to ACT Fibernet ₹825.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Utilities"},
    {"id": 74, "text": "Vegetable vendor weekly purchase at local mandi ₹350.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Groceries"},
    {"id": 75, "text": "Society maintenance quarterly charges ₹4,500.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Housing"},
    {"id": 76, "text": "Sending birthday gift money to sister ₹2,500.", "channel": "Friend/family", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Family"},
    {"id": 77, "text": "Dry cleaning payment at local laundry ₹400.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Services"},
    {"id": 78, "text": "Gym monthly membership renewal ₹1,800.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Fitness"},
    {"id": 79, "text": "Office stationery printout shop ₹80.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Stationery"},
    {"id": 80, "text": "Car wash and interior vacuuming ₹600.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Automotive"},
    {"id": 81, "text": "Pet clinic vaccination fee ₹1,100.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Healthcare"},
    {"id": 82, "text": "Dentist routine dental cleaning payment ₹1,500.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Healthcare"},
    {"id": 83, "text": "Weekend badminton court rental split ₹250.", "channel": "Friend/family", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Sports"},
    {"id": 84, "text": "Purchase kitchenware at D-Mart ₹1,850.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Retail"},
    {"id": 85, "text": "Payment to colleague for lunch takeout ₹220.", "channel": "Friend/family", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Colleagues"},
    {"id": 86, "text": "College textbook purchase from campus store ₹750.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Education"},
    {"id": 87, "text": "Haircut and salon service ₹450.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Personal Care"},
    {"id": 88, "text": "Water can delivery payment ₹160.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Utilities"},
    {"id": 89, "text": "Monthly newspaper subscription ₹250.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Subscription"},
    {"id": 90, "text": "Gas cylinder refill payment to Indane agency ₹903.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Utilities"},
    {"id": 91, "text": "Plant nursery garden flower pots ₹680.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Home"},
    {"id": 92, "text": "Donation to verified blind relief trust ₹1,000.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Charity"},
    {"id": 93, "text": "Metro smart card recharge kiosk ₹500.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Transport"},
    {"id": 94, "text": "Repairs for home plumbing tap ₹450.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Maintenance"},
    {"id": 95, "text": "Eyeglasses lens cleaning kit from Lenskart ₹350.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Healthcare"},
    {"id": 96, "text": "Fruit stall mangoes and bananas ₹270.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Groceries"},
    {"id": 97, "text": "Guitar strings replacement set ₹550.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Hobbies"},
    {"id": 98, "text": "Courier dispatch fee at DTDC office ₹180.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Logistics"},
    {"id": 99, "text": "Ice cream parlor dessert with friends ₹340.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Dining"},
    {"id": 100, "text": "School bus transport monthly fee for nephew ₹2,200.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Education"},
    {"id": 101, "text": "Tea stall payment for morning chai ₹40.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Daily Expense"},
    {"id": 102, "text": "Coconut water vendor ₹60.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Daily Expense"},
    {"id": 103, "text": "Pooja flowers from vendor ₹50.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Daily Expense"},
    {"id": 104, "text": "Parking lot ticket fee ₹30.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Transport"},
    {"id": 105, "text": "Shoe repair and polishing ₹120.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Services"},
    {"id": 106, "text": "Key duplication service ₹80.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Services"},
    {"id": 107, "text": "Tailor alterations for trousers ₹150.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Services"},
    {"id": 108, "text": "Photocopy and document spiral binding ₹90.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Stationery"},
    {"id": 109, "text": "Fresh tender coconut ₹80.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Daily Expense"},
    {"id": 110, "text": "Public bicycle rental unlock ₹25.", "channel": "Merchant", "new_recipient": False, "amount_spike": False, "label": "GENUINE", "category": "Transport"}
]

DEMO_MESSAGES = [
    {
        "id": "demo_refund",
        "title": "Demo 1 – Accidental Refund Error",
        "text": "I accidentally sent ₹20,000 to your account. Please return it immediately to this UPI ID.",
        "expected_category": "REFUND / MONEY-RETURN SCAM",
        "expected_risk": "HIGH RISK SIGNAL",
        "description": "Claims mistaken transfer and manufactures panic to force reverse payment."
    },
    {
        "id": "demo_kyc",
        "title": "Demo 2 – KYC Suspension Threat",
        "text": "Your KYC has expired. Verify your account immediately or your account will be suspended.",
        "expected_category": "KYC / ACCOUNT VERIFICATION SCAM",
        "expected_risk": "HIGH RISK SIGNAL",
        "description": "Mimics bank KYC deadline threatening account freeze."
    },
    {
        "id": "demo_otp",
        "title": "Demo 3 – Credential / OTP Phishing",
        "text": "I am calling from customer care. Please provide the OTP you received to process your refund.",
        "expected_category": "OTP / CREDENTIAL REQUEST SCAM",
        "expected_risk": "VERY HIGH RISK SIGNAL",
        "description": "Solitary aim is harvesting OTP or banking authorization codes."
    },
    {
        "id": "demo_reward",
        "title": "Demo 4 – Reward / Cashback Lure",
        "text": "Congratulations! Pay ₹500 now to unlock your ₹5,000 cashback reward.",
        "expected_category": "REWARD / CASHBACK SCAM",
        "expected_risk": "HIGH RISK SIGNAL",
        "description": "Demands advance payment or fee to release a non-existent cash reward."
    },
    {
        "id": "demo_bank",
        "title": "Demo 5 – Fake Bank Impersonation",
        "text": "I am calling from your bank. Your account will be blocked unless you complete a verification payment immediately.",
        "expected_category": "FAKE BANK / AUTHORITY IMPERSONATION",
        "expected_risk": "VERY HIGH RISK SIGNAL",
        "description": "Combines bank authority coercion, account threat, and urgent transfer pressure."
    },
    {
        "id": "demo_genuine",
        "title": "Demo 6 – Genuine / Normal Context",
        "text": "I called my bank customer care today to ask about updating my KYC.",
        "expected_category": "GENUINE / SAFE CONTEXT",
        "expected_risk": "LOW RISK SIGNAL",
        "description": "Contains 'bank' and 'KYC' keywords in everyday conversational inquiry context without scam pressure."
    },
    {
        "id": "demo_negation_otp",
        "title": "Demo 7 – Safe Negation (OTP Warning)",
        "text": "I never share my OTP with anyone.",
        "expected_category": "GENUINE / SAFE CONTEXT",
        "expected_risk": "LOW RISK SIGNAL",
        "description": "Negation rule prevents OTP keyword alone from falsely triggering a scam alarm."
    },
    {
        "id": "demo_cashback_double",
        "title": "Demo 8 – Cashback Promotion Trap",
        "text": "Pay now and enjoy ₹5,000 cashback later.",
        "expected_category": "REWARD / CASHBACK SCAM",
        "expected_risk": "HIGH RISK SIGNAL",
        "description": "Offers delayed massive cashback on condition of immediate payment."
    }
]

