// =============================================================
//  storefront/src/components/LoadingSpinner.jsx
//  Reusable full-page and inline loading spinners
// =============================================================

// Full page spinner — used while auth is initializing
export function FullPageSpinner({ message = "در حال بارگذاری..." }) {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: "60vh", gap: "1rem" }}
    >
      <div
        className="spinner-border"
        role="status"
        style={{
          width: 48,
          height: 48,
          color: "var(--color-primary)",
          borderWidth: 3,
        }}
      >
        <span className="visually-hidden">بارگذاری...</span>
      </div>
      <p
        className="text-muted mb-0"
        style={{ fontSize: "0.9rem" }}
      >
        {message}
      </p>
    </div>
  );
}

// Inline spinner — used inside buttons and small areas
export function InlineSpinner({ size = "sm" }) {
  return (
    <span
      className={`spinner-border spinner-border-${size}`}
      role="status"
      style={{ color: "var(--color-primary)" }}
    >
      <span className="visually-hidden">بارگذاری...</span>
    </span>
  );
}

// Section spinner — used inside cards while data loads
export function SectionSpinner({ message = "در حال بارگذاری..." }) {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center py-5"
      style={{ gap: "0.75rem" }}
    >
      <div
        className="spinner-border"
        role="status"
        style={{
          color: "var(--color-primary)",
          width: 32,
          height: 32,
          borderWidth: 2,
        }}
      >
        <span className="visually-hidden">بارگذاری...</span>
      </div>
      <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
        {message}
      </p>
    </div>
  );
}

export default FullPageSpinner;