// =============================================================
//  storefront/src/components/EmptyState.jsx
//  Reusable empty state component used across all pages
// =============================================================

import { Link } from "react-router-dom";

function EmptyState({
  icon       = "📭",
  title      = "موردی یافت نشد",
  description = "",
  actionLabel = "",
  actionTo    = "",
  onAction    = null,
}) {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-center py-5"
      style={{ minHeight: 280, gap: "0.75rem" }}
    >
      <div style={{ fontSize: "3.5rem", lineHeight: 1 }}>{icon}</div>

      <h5
        className="fw-bold mb-1 mt-2"
        style={{ color: "var(--color-text)" }}
      >
        {title}
      </h5>

      {description && (
        <p
          className="text-muted mb-0"
          style={{
            fontSize: "0.9rem",
            maxWidth: 340,
            lineHeight: 1.7,
          }}
        >
          {description}
        </p>
      )}

      {/* Action button */}
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="btn btn-primary mt-2 px-4"
        >
          {actionLabel}
        </Link>
      )}

      {/* Callback action */}
      {actionLabel && onAction && !actionTo && (
        <button
          className="btn btn-primary mt-2 px-4"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;