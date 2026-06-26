// =============================================================
//  storefront/src/contexts/AuthContext.jsx
//  Manages authentication state — JWT tokens and user profile.
//
//  Token storage note:
//  For the demo version tokens are stored in localStorage.
//  In production upgrade to httpOnly cookies for security.
// =============================================================

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api";

const AuthContext = createContext(null);

// localStorage keys
const ACCESS_KEY  = "access_token";
const REFRESH_KEY = "refresh_token";

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Helpers ──────────────────────────────────────────────

  const saveTokens = (access, refresh) => {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    // Attach token to all future axios requests
    api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
  };

  const clearTokens = () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    delete api.defaults.headers.common["Authorization"];
  };

  // ── Load user on mount ────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem(ACCESS_KEY);
      if (!token) {
        setLoading(false);
        return;
      }

      // Attach saved token to axios
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        const res = await api.get("/auth/me/");
        setUser(res.data);
      } catch {
        // Token may be expired — try to refresh
        await attemptRefresh();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ── Refresh token ─────────────────────────────────────────

  const attemptRefresh = useCallback(async () => {
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (!refresh) {
      clearTokens();
      setUser(null);
      return false;
    }

    try {
      const res = await api.post("/auth/token/refresh/", { refresh });
      saveTokens(res.data.access, null);
      const profile = await api.get("/auth/me/");
      setUser(profile.data);
      return true;
    } catch {
      clearTokens();
      setUser(null);
      return false;
    }
  }, []);

  // ── Auth actions ──────────────────────────────────────────

  const requestOTP = async (phone) => {
    await api.post("/auth/otp/request/", { phone });
  };

  const verifyOTP = async (phone, code) => {
    const res = await api.post("/auth/otp/verify/", { phone, code });
    saveTokens(res.data.access, res.data.refresh);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.patch("/auth/me/", data);
    setUser(res.data);
    return res.data;
  };

  // ── Expose ────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        requestOTP,
        verifyOTP,
        logout,
        updateProfile,
        attemptRefresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}