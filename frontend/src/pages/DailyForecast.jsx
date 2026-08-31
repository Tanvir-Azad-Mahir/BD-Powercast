import { useState } from "react";
import { predictDay } from "../services/api";


function DailyForecast() {
  const [date, setDate] = useState("");
  const [result, setResult] = useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const handlePredict = async () => {
    if (!date) {
      setError(
        "Please select a forecast date."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data =
        await predictDay(date);

      setResult(data);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Prediction failed. Check the API server."
      );

    } finally {

      setLoading(false);
    }
  };


  const riskClass = () => {
    const level =
      result?.load_shedding_risk_level
        ?.toLowerCase();

    if (level === "high")
      return "risk-high";

    if (level === "medium")
      return "risk-medium";

    if (level === "low")
      return "risk-low";

    return "risk-unknown";
  };


  const formatNumber = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "—";
    }

    return Number(value)
      .toLocaleString(
        undefined,
        {
          maximumFractionDigits: 2,
        }
      );
  };


  return (
    <main className="daily-page">

      <div className="daily-layout">

        {/* ======================================
            HERO
        ======================================= */}

        <section
          className="daily-hero glass"
        >

          <div className="hero-top">

            <div className="hero-chip">

              <span
                className="hero-chip-dot"
              />

              Daily Forecast

            </div>


            <h1 className="hero-title">

              Bangladesh
              <br />

              <span
                className="hero-title-soft"
              >
                Electricity Demand
              </span>

            </h1>


            <p
              className="hero-description"
            >
              Estimate future electricity
              demand, peak demand and daily
              energy consumption using the
              BD PowerCast deployment model.
            </p>


            <div
              className="forecast-control"
            >

              <input
                className="date-field"
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(
                    e.target.value
                  )
                }
              />


              <button
                className="predict-button"
                onClick={
                  handlePredict
                }
                disabled={loading}
              >

                {loading
                  ? "Forecasting..."
                  : "Generate Forecast"}

              </button>

            </div>


            {error && (
              <div
                className="forecast-error"
              >
                {error}
              </div>
            )}

          </div>


          <div className="hero-result">

            <p
              className="hero-result-label"
            >
              Predicted Peak Demand
            </p>


            <div
              className="hero-number-row"
            >

              <h2
                className="hero-number"
              >
                {formatNumber(
                  result
                    ?.peak_demand_mw
                )}
              </h2>

              <span
                className="hero-unit"
              >
                MW
              </span>

            </div>


            <div
              className="hero-result-meta"
            >
              {result
                ? `Forecast for ${result.date}`
                : "Select a date to generate a forecast"}
            </div>

          </div>

        </section>


        {/* ======================================
            RIGHT RAIL
        ======================================= */}

        <aside className="daily-rail">

          <RailCard
            label="Average Demand"
            value={formatNumber(
              result
                ?.average_demand_mw
            )}
            unit="MW"
            sub="Estimated average system demand"
          />


          <RailCard
            label="Daily Energy"
            value={formatNumber(
              result
                ?.daily_energy_mwh
            )}
            unit="MWh"
            sub="Estimated total energy demand for the day"
          />


          <section
            className="rail-card glass"
          >

            <p
              className="rail-label"
            >
              Load-Shedding Risk
            </p>


            <div
              className="risk-row"
            >

              <p
                className="risk-value"
              >
                {result
                  ?.load_shedding_risk_score
                  ?? "—"}

                {result
                  ?.load_shedding_risk_score
                  !== undefined &&
                 result
                  ?.load_shedding_risk_score
                  !== null
                  ? "%"
                  : ""}
              </p>


              <span
                className={
                  `risk-badge ${riskClass()}`
                }
              >
                {result
                  ?.load_shedding_risk_level
                  || "Unknown"}
              </span>

            </div>


            <p className="rail-sub">
              Historical risk score based
              on recent monthly
              load-shedding frequency.
            </p>

          </section>


          <section
            className="rail-card glass"
          >

            <p
              className="rail-label"
            >
              Forecast Status
            </p>

            <p
              className="rail-value"
            >
              {result
                ? "Ready"
                : "Waiting"}
            </p>

            <p className="rail-sub">
              {result
                ? result.risk_basis
                : "Choose a date to run the prediction model."}
            </p>

          </section>

        </aside>

      </div>


      {/* ======================================
          BOTTOM INFORMATION
      ======================================= */}

      <div className="daily-bottom">

        <section
          className="info-panel glass"
        >

          <p className="info-title">
            Forecast Interpretation
          </p>

          <p className="info-copy">
            Peak demand represents the
            estimated maximum electricity
            demand for the selected day.
            Average demand represents the
            expected mean system demand
            across the day.
          </p>

        </section>


        <section
          className="info-panel glass"
        >

          <p className="info-title">
            Planning Indicator
          </p>

          <p className="info-copy">
            The load-shedding value is a
            historical monthly risk score,
            not a calibrated probability of
            a load-shedding event occurring
            on the selected date.
          </p>


          {result && (
            <div className="info-date">
              Selected date:{" "}
              {result.date}
            </div>
          )}

        </section>

      </div>

    </main>
  );
}


function RailCard({
  label,
  value,
  unit,
  sub,
}) {

  return (
    <section
      className="rail-card glass"
    >

      <p className="rail-label">
        {label}
      </p>

      <p className="rail-value">

        {value}

        <span className="rail-unit">
          {unit}
        </span>

      </p>

      <p className="rail-sub">
        {sub}
      </p>

    </section>
  );
}


export default DailyForecast;