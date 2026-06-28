// =============================================================
//  admin-panel/src/components/ProtectedRoute.jsx
//  Redirects unauthenticated or non-staff users to /login.
// =============================================================

import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <div
            className="spinner-border mb-3"
            role="status"
            style={{
              color: "var(--color-primary)",
              width: 48,
              height: 48,
            }}
          >
            <span className="visually-hidden">بارگذاری...</span>
          </div>
          <p className="text-muted">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;