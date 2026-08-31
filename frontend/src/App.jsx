import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";

import DailyForecast from "./pages/DailyForecast";
import MonthlyForecast from "./pages/MonthlyForecast";

import "./App.css";


function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">

        <Navbar />

        <Routes>
          <Route
            path="/"
            element={<DailyForecast />}
          />

          <Route
            path="/monthly"
            element={<MonthlyForecast />}
          />

          <Route
            path="/performance"
            element={<ModelPerformance />}
          />

          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>

      </div>
    </BrowserRouter>
  );
}


/* ============================================================
   NAVBAR
============================================================ */

function Navbar() {
  return (
    <nav className="navbar">

      <div className="navbar-inner">

        {/* BRAND */}

        <NavLink
          to="/"
          className="brand"
        >

          <div className="brand-icon">
            <PowerLogo />
          </div>


          <div className="brand-text">

            <span className="brand-title">
              BD PowerCast
            </span>

            <span className="brand-subtitle">
              Bangladesh Electricity Forecasting
            </span>

          </div>

        </NavLink>


        {/* NAVIGATION */}

        <div className="nav-links">

          <NavigationItem
            to="/"
            label="Daily Forecast"
          />

          <NavigationItem
            to="/monthly"
            label="Monthly Forecast"
          />

          <NavigationItem
            to="/performance"
            label="Model Performance"
          />

        </div>

      </div>

    </nav>
  );
}


/* ============================================================
   NAV ITEM
============================================================ */

function NavigationItem({
  to,
  label,
}) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        isActive
          ? "nav-link active"
          : "nav-link"
      }
    >
      {label}
    </NavLink>
  );
}


/* ============================================================
   LOGO
============================================================ */

function PowerLogo() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >

      <path
        d="M13.6 2.8L6.8 13h4.6l-1 8.2L17.2 11h-4.6l1-8.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

    </svg>
  );
}


/* ============================================================
   MODEL PERFORMANCE PAGE
============================================================ */

function ModelPerformance() {
  return (
    <main className="page">

      <div className="page-container">

        {/* HEADER */}

        <header className="page-header">

          <p className="page-eyebrow">
            Research Evaluation
          </p>

          <h1 className="page-title">
            Model Performance
          </h1>

          <p className="page-description">
            Final test-set performance of the best
            hourly electricity-demand forecasting
            architecture developed for BD PowerCast.
          </p>

        </header>


        {/* PERFORMANCE METRICS */}

        <section className="metric-grid">

          <PerformanceMetric
            label="Mean Absolute Error"
            value="206.39 MW"
            helper="Average absolute difference between predicted and actual demand."
          />


          <PerformanceMetric
            label="Root Mean Square Error"
            value="287.70 MW"
            helper="Measures forecast error while giving more weight to larger errors."
          />


          <PerformanceMetric
            label="Mean Absolute Percentage Error"
            value="1.83%"
            helper="Average percentage error on the final hourly test dataset."
          />


          <PerformanceMetric
            label="R² Score"
            value="0.9845"
            helper="Approximately 98.45% of test-set demand variation was explained."
          />

        </section>


        {/* BEST MODEL */}

        <section className="panel performance-panel">

          <p className="page-eyebrow">
            Best Research Model
          </p>


          <h2 className="performance-model-name">
            Adaptive Gated Ramp-Aware Model B
          </h2>


          <p className="performance-model-description">
            The final research architecture combines
            recent demand behavior, daily patterns,
            weekly patterns, ramp-aware features and
            calendar information. Adaptive gating
            determines how strongly each temporal
            information branch contributes to the
            final hourly demand prediction.
          </p>


          <div className="performance-note">
            The 1.83% MAPE shown above belongs to the
            hourly research model. The Daily Forecast
            and Monthly Forecast pages use a separate
            date-based deployment model so that the
            system can produce estimates for arbitrary
            future dates without requiring unavailable
            future lag values.
          </div>

        </section>


        {/* MODEL ARCHITECTURE SUMMARY */}

        <section
          className="panel performance-panel"
        >

          <p className="page-eyebrow">
            Model Inputs
          </p>


          <h2 className="performance-model-name">
            Multi-Temporal Demand Signals
          </h2>


          <p className="performance-model-description">
            Model B learns from several temporal
            perspectives instead of relying on a
            single sequence of historical values.
          </p>


          <div
            className="model-feature-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              marginTop: "22px",
            }}
          >

            <FeatureBlock
              title="Recent"
              text="Short-term demand lags and rolling statistics."
            />

            <FeatureBlock
              title="Daily"
              text="Previous-day patterns and 24-hour demand behavior."
            />

            <FeatureBlock
              title="Weekly"
              text="Seven-day and multi-week demand patterns."
            />

            <FeatureBlock
              title="Ramp-Aware"
              text="Short-term increases, decreases and demand variability."
            />

            <FeatureBlock
              title="Calendar"
              text="Hour, weekday and seasonal calendar information."
            />

          </div>

        </section>


        {/* DEPLOYMENT NOTE */}

        <section
          className="monthly-note glass"
          style={{
            marginTop: "24px",
          }}
        >

          <div className="note-indicator" />

          <div>

            <h3>
              Deployment Model
            </h3>

            <p>
              For arbitrary dates such as 10 August
              2026, BD PowerCast uses a calendar-based
              trend and seasonal forecasting layer.
              Monthly forecasts are generated by
              predicting every day individually and
              aggregating those daily forecasts.
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}


/* ============================================================
   PERFORMANCE METRIC
============================================================ */

function PerformanceMetric({
  label,
  value,
  helper,
}) {
  return (
    <article className="metric-card">

      <p className="metric-label">
        {label}
      </p>


      <p className="metric-value">
        {value}
      </p>


      <p className="metric-helper">
        {helper}
      </p>

    </article>
  );
}


/* ============================================================
   FEATURE BLOCK
============================================================ */

function FeatureBlock({
  title,
  text,
}) {
  return (
    <div
      style={{
        padding: "17px",
        borderRadius: "16px",
        background:
          "rgba(255,255,255,0.055)",
        border:
          "1px solid rgba(255,255,255,0.08)",
      }}
    >

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >

        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#8deee2",
            boxShadow:
              "0 0 10px rgba(141,238,226,.5)",
          }}
        />


        <strong
          style={{
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          {title}
        </strong>

      </div>


      <p
        style={{
          margin: "9px 0 0",
          color:
            "rgba(255,255,255,.40)",
          fontSize: "11px",
          lineHeight: "1.55",
        }}
      >
        {text}
      </p>

    </div>
  );
}


/* ============================================================
   404 PAGE
============================================================ */

function NotFound() {
  return (
    <main className="page">

      <div
        className="page-container"
        style={{
          maxWidth: "700px",
        }}
      >

        <section
          className="glass"
          style={{
            padding: "45px",
            borderRadius: "28px",
          }}
        >

          <p className="page-eyebrow">
            BD PowerCast
          </p>


          <h1 className="page-title">
            Page Not Found
          </h1>


          <p className="page-description">
            The requested page does not exist.
          </p>


          <NavLink
            to="/"
            className="predict-button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              textDecoration: "none",
              marginTop: "20px",
            }}
          >
            Return to Forecast
          </NavLink>

        </section>

      </div>

    </main>
  );
}


export default App;