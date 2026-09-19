# BD PowerCast

**BD PowerCast** is a Bangladesh-focused electricity demand forecasting system that provides daily and monthly demand forecasts together with a historical load-shedding risk indicator.

🌐 **Live Website:** https://bdpowercast.netlify.app/  
⚙️ **Backend API:** https://bd-powercast-api.onrender.com  
📘 **API Docs:** https://bd-powercast-api.onrender.com/docs

---

## Overview

BD PowerCast was developed as a forecasting and planning tool for Bangladesh's electricity system. The project combines machine-learning research with a web-based deployment layer so users can select a future date or month and receive electricity-demand estimates through a simple dashboard.

The system supports:

- Daily electricity-demand forecasting
- Monthly electricity-demand forecasting
- Predicted average demand in MW
- Predicted peak demand in MW
- Estimated daily and monthly energy in MWh
- Highest-demand date identification
- Lowest-demand date identification
- Historical monthly load-shedding risk indication
- Interactive demand visualization
- Model-performance reporting

---

## Live Application

Visit the deployed application here:

**https://bdpowercast.netlify.app/**

The frontend is deployed on **Netlify**, while the FastAPI backend is deployed separately and serves the forecasting models through REST API endpoints.

---

## Main Features

### Daily Forecast

Users can select a date and receive:

- Average electricity demand
- Peak electricity demand
- Daily energy requirement
- Historical load-shedding risk score
- Risk level: Low, Medium, or High

### Monthly Forecast

Users can select a month and receive:

- Monthly total energy requirement
- Monthly average demand
- Highest predicted peak demand
- Expected peak-demand date
- Lowest-demand date
- Historical monthly load-shedding risk
- Daily forecast table
- Interactive demand chart

### Model Performance

The application also includes a model-performance page that presents the final evaluation results of the best hourly research model.

Final hourly research model results:

| Metric | Result |
|---|---:|
| MAE | 206.39 MW |
| RMSE | 287.70 MW |
| MAPE | 1.83% |
| R² | 0.9845 |

The best hourly research architecture is the **Adaptive Gated Ramp-Aware Model B**.

> The hourly research model and the date-based deployment model are separate. The 1.83% MAPE belongs to the hourly research model and should not be interpreted as the accuracy of arbitrary future-date forecasts.

---

## Technology Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Recharts
- CSS
- Netlify

### Backend

- Python
- FastAPI
- Uvicorn
- Pandas
- NumPy
- Scikit-learn
- Joblib
- Render

### Machine Learning

The research phase included:

- Seasonal Naive forecasting
- Linear Regression
- Random Forest
- XGBoost
- LightGBM
- Custom PyTorch forecasting models
- Adaptive Gated Ramp-Aware Model B

For arbitrary future dates, the deployed planning model uses date-based trend and seasonal information.

---

## Project Structure

```text
bd-powercast/
│
├── backend/
│   ├── __init__.py
│   ├── main.py
│   └── prediction.py
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── DailyForecast.jsx
│   │   │   └── MonthlyForecast.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── models/
│   ├── daily_avg_trend_model.pkl
│   ├── daily_avg_residual_model.pkl
│   ├── daily_peak_trend_model.pkl
│   ├── daily_peak_residual_model.pkl
│   ├── daily_model_config.json
│   └── load_shedding_monthly_risk.csv
│
├── data/
├── results/
├── figures/
├── notebooks/
├── requirements.txt
└── README.md
```

---

## API Endpoints

### Health Check

```http
GET /health
```

Example response:

```json
{
  "status": "ok"
}
```

### Daily Forecast

```http
POST /predict/day
```

Example request:

```json
{
  "date": "2026-08-10"
}
```

Example response:

```json
{
  "date": "2026-08-10",
  "average_demand_mw": 13972.52,
  "peak_demand_mw": 15694.35,
  "daily_energy_mwh": 335340.36,
  "load_shedding_risk_score": 98.33,
  "load_shedding_risk_level": "High",
  "risk_basis": "Recent historical monthly load-shedding rate"
}
```

### Monthly Forecast

```http
POST /predict/month
```

Example request:

```json
{
  "year": 2026,
  "month": 1
}
```

The response contains:

- Monthly summary values
- Peak-demand date
- Lowest-demand date
- Load-shedding risk indicator
- Daily forecasts for the complete month

---

## Local Setup

### 1. Clone the repository

```bash
git clone <your-github-repository-url>
cd bd-powercast
```

### 2. Create a Python virtual environment

Windows:

```powershell
python -m venv .venv
.venv\Scripts\activate
```

macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the FastAPI backend

From the project root:

```bash
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

### 5. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### 6. Configure the frontend API URL

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_URL=http://127.0.0.1:8000
```

### 7. Start React

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## Deployment

### Frontend

The React frontend is deployed with **Netlify**.

Recommended Netlify settings:

```text
Base directory: frontend
Build command: npm run build
Publish directory: dist
```

Environment variable:

```env
VITE_API_URL=https://bd-powercast-api.onrender.com
```

### Backend

The FastAPI backend is deployed with **Render**.

Build command:

```bash
pip install -r requirements.txt
```

Start command:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

---

## Load-Shedding Risk

The load-shedding value shown by BD PowerCast is a **historical monthly risk indicator** based on recent load-shedding frequency.

It should not be interpreted as a calibrated probability that load shedding will occur on a specific future date.

---

## Units

- **Demand:** MW
- **Daily Energy:** MWh
- **Monthly Energy:** MWh
- **Load-Shedding Risk Score:** %

---

## Research Note

The project contains two forecasting layers:

1. **Hourly research forecasting model**  
   Designed for high-accuracy short-term electricity-demand forecasting using historical demand, temporal lags, rolling statistics, calendar information, and ramp-aware features.

2. **Date-based deployment model**  
   Designed to support arbitrary future dates and months in the public web application when future lagged demand values are not available.

This separation allows the research model to remain technically valid while providing a practical web-based planning interface.

---

## Disclaimer

BD PowerCast is intended for research, demonstration, and planning purposes. Forecasts depend on historical patterns and model assumptions and should not be treated as guaranteed future electricity-system outcomes.

---

## Project

**BD PowerCast — Bangladesh Electricity Demand Forecasting & Load-Shedding Risk Prediction**

Live application: **https://bdpowercast.netlify.app/**
