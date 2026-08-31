from pathlib import Path
import calendar
import json

import joblib
import numpy as np
import pandas as pd


# ============================================================
# PATHS
# ============================================================

BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
MODEL_DIR = PROJECT_ROOT / "models"


# ============================================================
# LOAD DAILY FORECAST MODELS
# ============================================================

avg_trend_model = joblib.load(
    MODEL_DIR / "daily_avg_trend_model.pkl"
)

avg_residual_model = joblib.load(
    MODEL_DIR / "daily_avg_residual_model.pkl"
)

peak_trend_model = joblib.load(
    MODEL_DIR / "daily_peak_trend_model.pkl"
)

peak_residual_model = joblib.load(
    MODEL_DIR / "daily_peak_residual_model.pkl"
)


# ============================================================
# LOAD MODEL CONFIGURATION
# ============================================================

with open(
    MODEL_DIR / "daily_model_config.json",
    "r"
) as f:
    config = json.load(f)


reference_date = pd.Timestamp(
    config["reference_date"]
)

trend_feature = config[
    "trend_feature"
]

seasonal_features = config[
    "seasonal_features"
]


# ============================================================
# LOAD LOAD-SHEDDING RISK TABLE
# ============================================================

risk_table = pd.read_csv(
    MODEL_DIR
    / "load_shedding_monthly_risk.csv"
)


# ============================================================
# DATE FEATURE ENGINEERING
# ============================================================

def create_date_features(input_date):

    date = pd.Timestamp(input_date)

    dow = date.dayofweek
    month = date.month
    doy = date.dayofyear

    days_since_start = (
        date - reference_date
    ).days

    trend_years = (
        days_since_start / 365.25
    )

    return {

        "trend_years":
            trend_years,

        "is_friday":
            int(dow == 4),

        "is_weekend":
            int(dow in [4, 5]),

        "dow_sin":
            np.sin(
                2 * np.pi
                * dow / 7
            ),

        "dow_cos":
            np.cos(
                2 * np.pi
                * dow / 7
            ),

        "month_sin":
            np.sin(
                2 * np.pi
                * (month - 1)
                / 12
            ),

        "month_cos":
            np.cos(
                2 * np.pi
                * (month - 1)
                / 12
            ),

        "year_sin":
            np.sin(
                2 * np.pi
                * doy
                / 365.25
            ),

        "year_cos":
            np.cos(
                2 * np.pi
                * doy
                / 365.25
            ),

        "year_sin_2":
            np.sin(
                4 * np.pi
                * doy
                / 365.25
            ),

        "year_cos_2":
            np.cos(
                4 * np.pi
                * doy
                / 365.25
            )
    }


# ============================================================
# LOAD-SHEDDING HISTORICAL RISK
# ============================================================

def get_load_shedding_risk(input_date):

    date = pd.Timestamp(
        input_date
    )

    month = date.month

    row = risk_table[
        risk_table["month"] == month
    ]

    if row.empty:

        return {
            "risk_score": None,
            "risk_level": "Unknown"
        }

    row = row.iloc[0]

    return {

        "risk_score":
            round(
                float(
                    row["risk_score"]
                ),
                2
            ),

        "risk_level":
            str(
                row["risk_level"]
            )
    }


# ============================================================
# SINGLE-DAY FORECAST
# ============================================================

def predict_date(input_date):

    date = pd.Timestamp(
        input_date
    )

    features = create_date_features(
        date
    )


    # --------------------------------------------------------
    # TREND INPUT
    # --------------------------------------------------------

    trend_input = pd.DataFrame(
        [[
            features[
                trend_feature[0]
            ]
        ]],
        columns=trend_feature
    )


    # --------------------------------------------------------
    # SEASONAL INPUT
    # --------------------------------------------------------

    seasonal_input = pd.DataFrame(
        [[
            features[f]
            for f
            in seasonal_features
        ]],
        columns=seasonal_features
    )


    # --------------------------------------------------------
    # AVERAGE DEMAND
    # --------------------------------------------------------

    average_demand = (

        avg_trend_model.predict(
            trend_input
        )[0]

        +

        avg_residual_model.predict(
            seasonal_input
        )[0]

    )


    # --------------------------------------------------------
    # PEAK DEMAND
    # --------------------------------------------------------

    peak_demand = (

        peak_trend_model.predict(
            trend_input
        )[0]

        +

        peak_residual_model.predict(
            seasonal_input
        )[0]

    )


    # --------------------------------------------------------
    # DAILY ENERGY
    # --------------------------------------------------------

    daily_energy = (
        average_demand * 24
    )


    # --------------------------------------------------------
    # LOAD-SHEDDING RISK
    # --------------------------------------------------------

    risk = get_load_shedding_risk(
        date
    )


    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {

        "date":
            str(date.date()),

        "average_demand_mw":
            round(
                float(
                    average_demand
                ),
                2
            ),

        "peak_demand_mw":
            round(
                float(
                    peak_demand
                ),
                2
            ),

        "daily_energy_mwh":
            round(
                float(
                    daily_energy
                ),
                2
            ),

        "load_shedding_risk_score":
            risk[
                "risk_score"
            ],

        "load_shedding_risk_level":
            risk[
                "risk_level"
            ],

        "risk_basis":
            (
                "Recent historical monthly "
                "load-shedding rate"
            )
    }


# ============================================================
# MONTHLY FORECAST
# ============================================================

def predict_month(
    year,
    month
):

    year = int(year)
    month = int(month)

    # Validate month
    if month < 1 or month > 12:
        raise ValueError(
            "Month must be between 1 and 12."
        )

    # Optional year validation
    if year < 2015:
        raise ValueError(
            "Year must be 2015 or later."
        )


    # --------------------------------------------------------
    # NUMBER OF DAYS IN MONTH
    # --------------------------------------------------------

    days_in_month = (
        calendar.monthrange(
            year,
            month
        )[1]
    )


    # --------------------------------------------------------
    # DAILY FORECASTS
    # --------------------------------------------------------

    daily_forecasts = []

    for day in range(
        1,
        days_in_month + 1
    ):

        forecast_date = pd.Timestamp(
            year=year,
            month=month,
            day=day
        )

        result = predict_date(
            forecast_date
        )

        daily_forecasts.append(
            result
        )


    # --------------------------------------------------------
    # MONTHLY ENERGY
    # --------------------------------------------------------

    monthly_energy = sum(
        row[
            "daily_energy_mwh"
        ]
        for row
        in daily_forecasts
    )


    # --------------------------------------------------------
    # AVERAGE DEMAND
    # --------------------------------------------------------

    average_monthly_demand = (
        np.mean(
            [
                row[
                    "average_demand_mw"
                ]
                for row
                in daily_forecasts
            ]
        )
    )


    # --------------------------------------------------------
    # PEAK DEMAND DAY
    # --------------------------------------------------------

    peak_day = max(
        daily_forecasts,
        key=lambda row:
            row[
                "peak_demand_mw"
            ]
    )


    # --------------------------------------------------------
    # LOWEST DEMAND DAY
    # --------------------------------------------------------

    lowest_day = min(
        daily_forecasts,
        key=lambda row:
            row[
                "average_demand_mw"
            ]
    )


    # --------------------------------------------------------
    # MONTHLY LOAD-SHEDDING RISK
    # --------------------------------------------------------

    risk_scores = [
        row[
            "load_shedding_risk_score"
        ]
        for row
        in daily_forecasts
        if row[
            "load_shedding_risk_score"
        ] is not None
    ]

    if risk_scores:

        monthly_risk_score = (
            float(
                np.mean(
                    risk_scores
                )
            )
        )

    else:

        monthly_risk_score = None


    if monthly_risk_score is None:

        monthly_risk_level = (
            "Unknown"
        )

    elif monthly_risk_score < 40:

        monthly_risk_level = (
            "Low"
        )

    elif monthly_risk_score < 70:

        monthly_risk_level = (
            "Medium"
        )

    else:

        monthly_risk_level = (
            "High"
        )


    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {

        "year":
            year,

        "month":
            month,

        "month_name":
            calendar.month_name[
                month
            ],

        "days":
            days_in_month,

        "monthly_energy_mwh":
            round(
                float(
                    monthly_energy
                ),
                2
            ),

        "average_demand_mw":
            round(
                float(
                    average_monthly_demand
                ),
                2
            ),

        "highest_peak_demand_mw":
            round(
                float(
                    peak_day[
                        "peak_demand_mw"
                    ]
                ),
                2
            ),

        "peak_demand_date":
            peak_day[
                "date"
            ],

        "lowest_average_demand_mw":
            round(
                float(
                    lowest_day[
                        "average_demand_mw"
                    ]
                ),
                2
            ),

        "lowest_demand_date":
            lowest_day[
                "date"
            ],

        "load_shedding_risk_score":
            (
                round(
                    monthly_risk_score,
                    2
                )
                if
                monthly_risk_score
                is not None
                else None
            ),

        "load_shedding_risk_level":
            monthly_risk_level,

        "risk_basis":
            (
                "Recent historical monthly "
                "load-shedding rate"
            ),

        "daily_forecasts":
            daily_forecasts
    }