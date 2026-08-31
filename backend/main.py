from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.prediction import (
    predict_date,
    predict_month,
)


app = FastAPI(
    title="BD PowerCast API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DateRequest(BaseModel):
    date: str


class MonthRequest(BaseModel):
    year: int
    month: int


@app.get("/")
def root():
    return {
        "message": "BD PowerCast API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.post("/predict/day")
def predict_day(request: DateRequest):
    try:
        return predict_date(request.date)

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@app.post("/predict/month")
def predict_month_endpoint(
    request: MonthRequest
):
    try:
        return predict_month(
            request.year,
            request.month,
        )

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )