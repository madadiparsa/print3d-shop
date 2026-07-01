// =============================================================
//  storefront/src/components/ProtectedRoute.jsx
//  Auth guard — uses FullPageSpinner for consistent loading UX
// =============================================================

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FullPageSpinner } from "./LoadingSpinner";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageSpinner message="در حال بررسی حساب کاربری..." />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;