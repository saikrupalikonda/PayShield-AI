@echo off
title PayShield AI - Full-Stack Demonstration Launcher
echo ==============================================================================
echo                      PAYSHIELD AI DEMONSTRATION PLATFORM                      
echo                         "Pause. Verify. Pay Safely."                          
echo ==============================================================================
echo.
echo Starting PayShield Backend (FastAPI on http://localhost:8000)...
start "PayShield Backend (FastAPI)" cmd /k "cd /d %~dp0 && .venv\Scripts\python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"

echo Starting PayShield Frontend (Vite on http://localhost:5173)...
start "PayShield Frontend (Vite)" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo.
echo ==============================================================================
echo Services launched!
echo - Backend API Docs:   http://localhost:8000/docs
echo - Frontend Web App:   http://localhost:5173
echo.
echo For Judge Evaluation, open http://localhost:5173 and use the 1-Click Demo Bar!
echo ==============================================================================
