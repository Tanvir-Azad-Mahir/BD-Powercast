import { useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";

import { predictMonth } from "../services/api";


function MonthlyForecast() {
  const [monthInput, setMonthInput] = useState("");
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handlePredict = async () => {
    if (!monthInput) {
      setError("Please select a forecast month.");
      return;
    }

    const [year, month] = monthInput.split("-");

    try {
      setLoading(true);
      setError("");

      const data = await predictMonth(
        Number(year),
        Number(month)
      );

      setResult(data);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Monthly forecast failed. Check the API server."
      );

    } finally {
      setLoading(false);
    }
  };


  const formatNumber = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "—";
    }

    return Number(value).toLocaleString(
      undefined,
      {
        maximumFractionDigits: 2,
      }
    );
  };


  const getRiskClass = () => {
    const level =
      result?.load_shedding_risk_level
        ?.toLowerCase();

    if (level === "high") {
      return "risk-high";
    }

    if (level === "medium") {
      return "risk-medium";
    }

    if (level === "low") {
      return "risk-low";
    }

    return "risk-unknown";
  };


  const chartData =
    result?.daily_forecasts?.map(
      (item) => ({
        date: item.date,
        day: Number(
          item.date.substring(8, 10)
        ),
        average:
          item.average_demand_mw,
        peak:
          item.peak_demand_mw,
        energy:
          item.daily_energy_mwh,
      })
    ) || [];


  return (
    <main className="monthly-page">

      {/* =====================================================
          TOP LAYOUT
      ====================================================== */}

      <div className="monthly-top">

        {/* HERO */}

        <section className="monthly-hero glass">

          <div>

            <div className="hero-chip">

              <span className="hero-chip-dot" />

              Monthly Forecast

            </div>


            <h1 className="monthly-title">

              Electricity
              <br />

              <span className="hero-title-soft">
                Demand Outlook
              </span>

            </h1>


            <p className="monthly-description">
              Explore predicted electricity demand
              throughout an entire month and identify
              the expected peak-demand period,
              total energy requirement and historical
              load-shedding risk.
            </p>


            <div className="forecast-control monthly-control">

              <input
                type="month"
                className="date-field"
                value={monthInput}
                onChange={(e) =>
                  setMonthInput(
                    e.target.value
                  )
                }
              />


              <button
                className="predict-button"
                onClick={handlePredict}
                disabled={loading}
              >

                {loading
                  ? "Forecasting..."
                  : "Generate Forecast"}

              </button>

            </div>


            {error && (
              <div className="forecast-error">
                {error}
              </div>
            )}

          </div>


          <div className="monthly-hero-result">

            <p className="hero-result-label">
              Highest Peak Demand
            </p>


            <div className="hero-number-row">

              <h2 className="monthly-main-number">
                {formatNumber(
                  result
                    ?.highest_peak_demand_mw
                )}
              </h2>

              <span className="hero-unit">
                MW
              </span>

            </div>


            <p className="hero-result-meta">

              {result
                ? `${result.month_name} ${result.year} • Peak expected on ${result.peak_demand_date}`
                : "Select a month to generate the forecast"}

            </p>

          </div>

        </section>


        {/* =================================================
            RIGHT RAIL
        ================================================== */}

        <aside className="monthly-rail">

          <MonthlyMetricCard
            label="Monthly Energy"
            value={formatNumber(
              result?.monthly_energy_mwh
            )}
            unit="MWh"
            sub="Estimated total electricity energy requirement"
          />


          <MonthlyMetricCard
            label="Average Demand"
            value={formatNumber(
              result?.average_demand_mw
            )}
            unit="MW"
            sub="Predicted mean demand across the month"
          />


          <section className="rail-card glass">

            <p className="rail-label">
              Load-Shedding Risk
            </p>


            <div className="risk-row">

              <p className="risk-value">

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
                  `risk-badge ${getRiskClass()}`
                }
              >
                {result
                  ?.load_shedding_risk_level
                  || "Unknown"}
              </span>

            </div>


            <p className="rail-sub">
              Historical monthly risk indicator
              based on recent load-shedding
              frequency.
            </p>

          </section>

        </aside>

      </div>


      {/* =====================================================
          CHART
      ====================================================== */}

      <section className="monthly-chart-panel glass">

        <div className="chart-header">

          <div>

            <p className="chart-eyebrow">
              MONTHLY DEMAND PROFILE
            </p>

            <h2 className="chart-title">

              {result
                ? `${result.month_name} ${result.year}`
                : "Daily Demand Forecast"}

            </h2>

          </div>


          <div className="chart-legend">

            <div className="legend-item">

              <span className="legend-dot average-dot" />

              Average Demand

            </div>


            <div className="legend-item">

              <span className="legend-dot peak-dot" />

              Peak Demand

            </div>

          </div>

        </div>


        {result ? (

          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <ComposedChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 12,
                  left: 0,
                  bottom: 5,
                }}
              >

                <defs>

                  <linearGradient
                    id="averageFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="0%"
                      stopColor="#8deee2"
                      stopOpacity={0.23}
                    />

                    <stop
                      offset="100%"
                      stopColor="#8deee2"
                      stopOpacity={0}
                    />

                  </linearGradient>


                  <linearGradient
                    id="peakLine"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >

                    <stop
                      offset="0%"
                      stopColor="#ffffff"
                    />

                    <stop
                      offset="100%"
                      stopColor="#a8fff1"
                    />

                  </linearGradient>

                </defs>


                <CartesianGrid
                  vertical={false}
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="4 8"
                />


                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill:
                      "rgba(255,255,255,0.45)",
                    fontSize: 11,
                  }}
                  interval={2}
                />


                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill:
                      "rgba(255,255,255,0.45)",
                    fontSize: 11,
                  }}
                  width={72}
                  tickFormatter={(value) =>
                    `${Math.round(
                      value / 1000
                    )}k`
                  }
                />


                <Tooltip
                  content={
                    <CustomTooltip />
                  }
                />


                <Area
                  type="monotone"
                  dataKey="average"
                  fill="url(#averageFill)"
                  stroke="#8deee2"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 5,
                  }}
                  animationDuration={1200}
                />


                <Line
                  type="monotone"
                  dataKey="peak"
                  stroke="url(#peakLine)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 5,
                  }}
                  animationDuration={1500}
                />

              </ComposedChart>

            </ResponsiveContainer>

          </div>

        ) : (

          <div className="chart-empty">

            <div className="chart-placeholder-wave">

              <span />
              <span />
              <span />
              <span />
              <span />

            </div>


            <p>
              Generate a monthly forecast to
              visualize the predicted demand profile.
            </p>

          </div>

        )}

      </section>


      {/* =====================================================
          MONTHLY DETAIL CARDS
      ====================================================== */}

      {result && (

        <div className="monthly-detail-grid">

          <section className="monthly-detail-card glass">

            <p className="detail-label">
              Peak Demand Date
            </p>

            <h3 className="detail-value">
              {result.peak_demand_date}
            </h3>

            <p className="detail-helper">
              Expected day with the highest
              maximum system demand.
            </p>

          </section>


          <section className="monthly-detail-card glass">

            <p className="detail-label">
              Lowest Demand Date
            </p>

            <h3 className="detail-value">
              {result.lowest_demand_date}
            </h3>

            <p className="detail-helper">
              Average demand of{" "}
              {formatNumber(
                result
                  .lowest_average_demand_mw
              )}{" "}
              MW.
            </p>

          </section>


          <section className="monthly-detail-card glass">

            <p className="detail-label">
              Forecast Days
            </p>

            <h3 className="detail-value">
              {result.days}
            </h3>

            <p className="detail-helper">
              Individual daily forecasts
              included in this monthly outlook.
            </p>

          </section>

        </div>

      )}


      {/* =====================================================
          TABLE
      ====================================================== */}

      {result && (

        <section className="monthly-table-panel glass">

          <div className="table-heading">

            <div>

              <p className="chart-eyebrow">
                DAILY BREAKDOWN
              </p>

              <h2 className="chart-title">
                Forecast Details
              </h2>

            </div>


            <div className="table-count">
              {result.days} days
            </div>

          </div>


          <div className="monthly-table-wrapper">

            <table className="monthly-table">

              <thead>

                <tr>

                  <th>Date</th>

                  <th>
                    Average Demand
                  </th>

                  <th>
                    Peak Demand
                  </th>

                  <th>
                    Daily Energy
                  </th>

                  <th>
                    Risk
                  </th>

                </tr>

              </thead>


              <tbody>

                {result.daily_forecasts.map(
                  (item) => (

                    <tr key={item.date}>

                      <td>
                        {item.date}
                      </td>


                      <td>
                        {formatNumber(
                          item.average_demand_mw
                        )}{" "}
                        <span className="table-unit">
                          MW
                        </span>
                      </td>


                      <td>
                        {formatNumber(
                          item.peak_demand_mw
                        )}{" "}
                        <span className="table-unit">
                          MW
                        </span>
                      </td>


                      <td>
                        {formatNumber(
                          item.daily_energy_mwh
                        )}{" "}
                        <span className="table-unit">
                          MWh
                        </span>
                      </td>


                      <td>

                        <span
                          className={
                            `mini-risk ${
                              getMiniRiskClass(
                                item
                                  .load_shedding_risk_level
                              )
                            }`
                          }
                        >
                          {
                            item
                              .load_shedding_risk_level
                          }
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

      )}


      {/* =====================================================
          MODEL NOTE
      ====================================================== */}

      <section className="monthly-note glass">

        <div className="note-indicator" />

        <div>

          <h3>
            Forecast Interpretation
          </h3>

          <p>
            Monthly values are produced by
            generating an individual forecast
            for every calendar day and then
            aggregating those predictions.
            The load-shedding value shown here
            is a historical monthly risk
            indicator rather than a calibrated
            event probability.
          </p>

        </div>

      </section>

    </main>
  );
}


function MonthlyMetricCard({
  label,
  value,
  unit,
  sub,
}) {

  return (
    <section className="rail-card glass">

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


function CustomTooltip({
  active,
  payload,
  label,
}) {

  if (
    !active ||
    !payload ||
    !payload.length
  ) {
    return null;
  }


  const average =
    payload.find(
      (entry) =>
        entry.dataKey === "average"
    )?.value;


  const peak =
    payload.find(
      (entry) =>
        entry.dataKey === "peak"
    )?.value;


  return (
    <div className="custom-tooltip">

      <p className="tooltip-date">
        Day {label}
      </p>

      <div className="tooltip-row">
        <span>Average</span>

        <strong>
          {Number(
            average
          ).toLocaleString()} MW
        </strong>
      </div>

      <div className="tooltip-row">
        <span>Peak</span>

        <strong>
          {Number(
            peak
          ).toLocaleString()} MW
        </strong>
      </div>

    </div>
  );
}


function getMiniRiskClass(level) {

  if (!level) {
    return "mini-risk-unknown";
  }


  const normalized =
    level.toLowerCase();


  if (normalized === "high") {
    return "mini-risk-high";
  }


  if (normalized === "medium") {
    return "mini-risk-medium";
  }


  if (normalized === "low") {
    return "mini-risk-low";
  }


  return "mini-risk-unknown";
}


export default MonthlyForecast;