// =============================================================
//  storefront/src/components/ProtectedRoute.jsx
//  Wraps routes that require authentication.
//  Redirects unauthenticated users to /login and saves
//  the intended destination so they land there after login.
// =============================================================

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // While AuthContext is checking localStorage / fetching profile
  // show a full-page spinner so there's no flash of redirect
  if (loading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "calc(100vh - var(--navbar-height))" }}
      >
        <div className="text-center">
          <div
            className="spinner-border mb-3"
            role="status"
            style={{ color: "var(--color-primary)", width: 48, height: 48 }}
          >
            <span className="visually-hidden">در حال بارگذاری...</span>
          </div>
          <p className="text-muted">در حال بررسی حساب کاربری...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect to login and save the
  // intended URL in location state so we can return after login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Authenticated — render the protected content
  return children;
}

export default ProtectedRoute;