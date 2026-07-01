// =============================================================
//  storefront/src/components/ErrorBoundary.jsx
//  Catches unexpected React errors and shows a friendly page.
// =============================================================

import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ minHeight: "60vh" }}
        >
          <div className="text-center px-3">
            <div style={{ fontSize: "4rem" }}>⚠️</div>
            <h3
              className="fw-bold mt-3 mb-2"
              style={{ color: "var(--color-text)" }}
            >
              خطای غیرمنتظره
            </h3>
            <p
              className="text-muted mb-4"
              style={{ maxWidth: 400, margin: "0 auto 1.5rem" }}
            >
              متأسفیم، مشکلی پیش آمده است. لطفاً صفحه را رفرش کنید یا به
              صفحه اصلی برگردید.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                🔄 رفرش صفحه
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = "/";
                }}
              >
                🏠 صفحه اصلی
              </button>
            </div>

            {/* Show error in development only */}
            {import.meta.env.DEV && this.state.error && (
              <details
                className="mt-4 text-start"
                style={{ maxWidth: 600, margin: "1.5rem auto 0" }}
              >
                <summary
                  className="text-muted"
                  style={{ cursor: "pointer", fontSize: "0.85rem" }}
                >
                  جزئیات خطا (فقط در حالت توسعه)
                </summary>
                <pre
                  className="mt-2 p-3 rounded"
                  style={{
                    fontSize: "0.75rem",
                    backgroundColor: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                    overflow: "auto",
                    direction: "ltr",
                    textAlign: "left",
                    color: "var(--color-text)",
                  }}
                >
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;