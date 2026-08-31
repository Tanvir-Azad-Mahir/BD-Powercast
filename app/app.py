from pathlib import Path

import pandas as pd
import streamlit as st


# ============================================================
# PATHS
# ============================================================

APP_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = APP_DIR.parent

DATA_PATH = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "PGCB_hourly_preprocessed_stage6_continuous.csv"
)

RESULTS_DIR = PROJECT_ROOT / "results"
FIGURES_DIR = PROJECT_ROOT / "figures"
MODELS_DIR = PROJECT_ROOT / "models"

PREDICTIONS_PATH = (
    RESULTS_DIR
    / "final_test_predictions.csv"
)

COMPARISON_PATH = (
    RESULTS_DIR
    / "final_model_comparison.csv"
)


# ============================================================
# PAGE CONFIGURATION
# ============================================================

st.set_page_config(
    page_title="BD PowerCast",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)


# ============================================================
# DATA LOADING
# ============================================================

@st.cache_data
def load_dataset():

    if not DATA_PATH.exists():
        return None

    df = pd.read_csv(
        DATA_PATH,
        parse_dates=["datetime"]
    )

    df = df.sort_values(
        "datetime"
    ).reset_index(drop=True)

    return df


@st.cache_data
def load_predictions():

    if not PREDICTIONS_PATH.exists():
        return None

    df = pd.read_csv(
        PREDICTIONS_PATH,
        parse_dates=["datetime"]
    )

    return df


@st.cache_data
def load_model_comparison():

    if not COMPARISON_PATH.exists():
        return None

    return pd.read_csv(
        COMPARISON_PATH
    )


df = load_dataset()
prediction_df = load_predictions()
comparison_df = load_model_comparison()


# ============================================================
# SIDEBAR
# ============================================================

st.sidebar.title("⚡ BD PowerCast")

st.sidebar.caption(
    "Bangladesh Electricity Demand Forecasting"
)

page = st.sidebar.radio(
    "Navigation",
    [
        "Dashboard",
        "1-Hour Forecast",
        "24-Hour Forecast",
        "Model Performance",
        "About"
    ]
)

st.sidebar.divider()

st.sidebar.markdown(
    """
    **Final Model**

    Adaptive Gated  
    Ramp-Aware Temporal Network
    """
)

st.sidebar.metric(
    "Final Test MAPE",
    "1.8297%"
)

st.sidebar.caption(
    "Custom Model B"
)


# ============================================================
# HEADER
# ============================================================

st.title("⚡ BD PowerCast")

st.caption(
    "Machine Learning Based Bangladesh Electricity "
    "Demand Forecasting System"
)


# ============================================================
# DASHBOARD PAGE
# ============================================================

if page == "Dashboard":

    st.header("Power Demand Dashboard")

    if df is None:

        st.error(
            f"Dataset not found:\n{DATA_PATH}"
        )

        st.stop()

    valid_df = df[
        df["demand_mw_clean"].notna()
    ].copy()

    latest = valid_df.iloc[-1]

    latest_demand = latest[
        "demand_mw_clean"
    ]

    latest_time = latest[
        "datetime"
    ]

    average_demand = valid_df[
        "demand_mw_clean"
    ].mean()

    peak_demand = valid_df[
        "demand_mw_clean"
    ].max()


    # --------------------------------------------------------
    # METRICS
    # --------------------------------------------------------

    col1, col2, col3, col4 = st.columns(4)

    col1.metric(
        "Latest Recorded Demand",
        f"{latest_demand:,.0f} MW"
    )

    col2.metric(
        "Historical Average",
        f"{average_demand:,.0f} MW"
    )

    col3.metric(
        "Historical Peak",
        f"{peak_demand:,.0f} MW"
    )

    col4.metric(
        "Model Test MAPE",
        "1.8297%"
    )

    st.caption(
        f"Latest available data: "
        f"{latest_time}"
    )

    st.divider()


    # --------------------------------------------------------
    # RECENT DEMAND
    # --------------------------------------------------------

    st.subheader(
        "Recent Electricity Demand"
    )

    time_range = st.selectbox(
        "Display period",
        [
            "24 Hours",
            "7 Days",
            "30 Days"
        ],
        index=1
    )

    periods = {
        "24 Hours": 24,
        "7 Days": 24 * 7,
        "30 Days": 24 * 30
    }

    recent_rows = periods[
        time_range
    ]

    recent_df = valid_df.tail(
        recent_rows
    )

    chart_df = (
        recent_df[
            [
                "datetime",
                "demand_mw_clean"
            ]
        ]
        .set_index("datetime")
        .rename(
            columns={
                "demand_mw_clean":
                "Demand (MW)"
            }
        )
    )

    st.line_chart(
        chart_df,
        use_container_width=True
    )


    # --------------------------------------------------------
    # DATASET INFORMATION
    # --------------------------------------------------------

    st.subheader(
        "Dataset Overview"
    )

    c1, c2, c3 = st.columns(3)

    c1.metric(
        "Hourly Records",
        f"{len(valid_df):,}"
    )

    c2.metric(
        "Start Date",
        str(
            valid_df["datetime"]
            .min()
            .date()
        )
    )

    c3.metric(
        "End Date",
        str(
            valid_df["datetime"]
            .max()
            .date()
        )
    )


# ============================================================
# 1-HOUR FORECAST PAGE
# ============================================================

elif page == "1-Hour Forecast":

    st.header(
        "1-Hour Electricity Demand Forecast"
    )

    st.write(
        """
        This section uses the final **Adaptive Gated
        Ramp-Aware Temporal Network (Custom Model B)**
        to forecast electricity demand one hour ahead.
        """
    )

    st.info(
        "The prediction engine will be connected "
        "through `inference.py` in the next step."
    )


    # Model information

    col1, col2, col3, col4 = st.columns(4)

    col1.metric(
        "MAE",
        "206.39 MW"
    )

    col2.metric(
        "RMSE",
        "287.70 MW"
    )

    col3.metric(
        "MAPE",
        "1.8297%"
    )

    col4.metric(
        "R²",
        "0.9845"
    )

    st.divider()

    st.subheader(
        "Model Input Structure"
    )

    st.markdown(
        """
        The forecasting model uses five groups of
        temporal features:

        - **Recent:** immediate short-term demand behavior
        - **Daily:** 24–72 hour demand patterns
        - **Weekly:** weekly recurring patterns
        - **Calendar:** hour, weekday and seasonal information
        - **Ramp:** recent changes and demand transitions

        An adaptive gate dynamically determines how much
        each temporal branch contributes to the forecast.
        """
    )


# ============================================================
# 24-HOUR FORECAST PAGE
# ============================================================

elif page == "24-Hour Forecast":

    st.header(
        "24-Hour Electricity Demand Forecast"
    )

    st.write(
        """
        This section provides multi-horizon electricity
        demand forecasting for the next 24 hours.
        """
    )

    col1, col2, col3, col4 = st.columns(4)

    col1.metric(
        "Validation MAE",
        "481.94 MW"
    )

    col2.metric(
        "Validation RMSE",
        "684.36 MW"
    )

    col3.metric(
        "Validation MAPE",
        "4.6467%"
    )

    col4.metric(
        "Validation R²",
        "0.9082"
    )

    st.divider()

    st.info(
        "The direct 24-output forecasting model "
        "will be connected here after the "
        "1-hour inference pipeline."
    )

    st.markdown(
        """
        ### Forecasting Strategy

        Instead of recursively feeding predictions back
        into the one-hour model, the direct forecasting
        architecture predicts all **24 future demand
        values simultaneously**.

        This reduces recursive error accumulation.
        """
    )


# ============================================================
# MODEL PERFORMANCE PAGE
# ============================================================

elif page == "Model Performance":

    st.header(
        "Model Performance"
    )

    st.subheader(
        "Final One-Hour Forecasting Model"
    )

    col1, col2, col3, col4 = st.columns(4)

    col1.metric(
        "Test MAE",
        "206.39 MW"
    )

    col2.metric(
        "Test RMSE",
        "287.70 MW"
    )

    col3.metric(
        "Test MAPE",
        "1.8297%"
    )

    col4.metric(
        "Test R²",
        "0.9845"
    )

    st.divider()


    # --------------------------------------------------------
    # MODEL COMPARISON
    # --------------------------------------------------------

    st.subheader(
        "Model Comparison"
    )

    if comparison_df is not None:

        st.dataframe(
            comparison_df,
            use_container_width=True,
            hide_index=True
        )

    else:

        comparison = pd.DataFrame({
            "Model": [
                "Seasonal Naive",
                "Linear Regression",
                "Random Forest",
                "XGBoost",
                "LightGBM",
                "Custom Model B"
            ],
            "Test MAPE (%)": [
                10.76,
                2.51,
                2.72,
                2.92,
                2.74,
                1.8297
            ]
        })

        st.dataframe(
            comparison,
            use_container_width=True,
            hide_index=True
        )


    # --------------------------------------------------------
    # MODEL COMPARISON CHART
    # --------------------------------------------------------

    st.subheader(
        "Competitive Model Test MAPE"
    )

    competitive = pd.DataFrame({
        "Model": [
            "Linear Regression",
            "Random Forest",
            "XGBoost",
            "LightGBM",
            "Custom Model B"
        ],
        "MAPE (%)": [
            2.51,
            2.72,
            2.92,
            2.74,
            1.8297
        ]
    })

    st.bar_chart(
        competitive.set_index(
            "Model"
        )
    )


    # --------------------------------------------------------
    # ACTUAL VS PREDICTED
    # --------------------------------------------------------

    if prediction_df is not None:

        st.divider()

        st.subheader(
            "Actual vs Predicted Demand"
        )

        prediction_plot = (
            prediction_df[
                [
                    "datetime",
                    "actual_demand_mw",
                    "predicted_demand_mw"
                ]
            ]
            .head(24 * 7)
            .set_index("datetime")
            .rename(
                columns={
                    "actual_demand_mw":
                    "Actual Demand",

                    "predicted_demand_mw":
                    "Predicted Demand"
                }
            )
        )

        st.line_chart(
            prediction_plot,
            use_container_width=True
        )


# ============================================================
# ABOUT PAGE
# ============================================================

elif page == "About":

    st.header(
        "About BD PowerCast"
    )

    st.markdown(
        """
        **BD PowerCast** is a machine-learning based
        electricity demand forecasting system designed
        using historical Bangladesh power-grid data.

        ### Forecasting Pipeline

        Historical Electricity Demand  
        ↓  
        Data Cleaning & Preprocessing  
        ↓  
        Temporal Feature Engineering  
        ↓  
        Traditional ML Benchmarks  
        ↓  
        Multi-Branch Neural Network  
        ↓  
        Adaptive Gated Ramp-Aware Network  
        ↓  
        Electricity Demand Forecast

        ### Final One-Hour Model

        **Adaptive Gated Ramp-Aware Temporal Network**

        The model separately learns:

        - recent demand behavior,
        - daily periodicity,
        - weekly periodicity,
        - calendar patterns,
        - short-term demand ramps.

        An adaptive gating mechanism dynamically combines
        these representations before generating the final
        demand forecast.

        ### Final Held-Out Test Performance

        - **MAE:** 206.39 MW
        - **RMSE:** 287.70 MW
        - **MAPE:** 1.8297%
        - **R²:** 0.9845
        """
    )