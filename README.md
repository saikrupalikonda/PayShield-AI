# PayShield AI

PayShield AI is a synthetic fintech fraud-risk demo designed to showcase how real-time context from SMS messages, transaction behaviour, and historical payment signals can be combined into a pre-confirmation interlock for UPI-style payments.

## Overview

The system combines three detection layers:

- Transaction analysis: payee loyalty, history, transfer velocity and amount anomalies
- Behavioural scoring: deviation from a user’s normal spending baseline
- NLP scam detection: refund, urgency, and impersonation cues in SMS/chat content

These signals are aggregated into a unified risk score and surfaced through a mobile interlock experience and an analyst dashboard.

## Architecture

- Backend: FastAPI service with risk evaluation routes and signal engines
- Data layer: synthetic transaction and SMS datasets plus serialized model artifacts
- Frontend mobile: payment demo that simulates a scam-triggered SMS and presents a warning interlock
- Frontend dashboard: risk-monitoring admin panel for bank analysts

## Quick start

1. Create a Python environment and install dependencies:
   ```bash
   python -m venv .venv
   . .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Start the backend:
   ```bash
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```
3. Start the mobile frontend:
   ```bash
   cd frontend-mobile
   npm install
   npm start
   ```
4. Start the dashboard frontend:
   ```bash
   cd frontend-dashboard
   npm install
   npm start
   ```

## Risk logic summary

- Risk score range: 0-100
- High-risk pattern triggers interlock before transaction confirmation
- Explainability layer converts the score into plain-language user warnings

## Compliance note

This repo uses clearly synthetic data and is intended for demo, experimentation, and educational presentation only.
