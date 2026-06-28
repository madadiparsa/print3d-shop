// =============================================================
//  admin-panel/src/contexts/AuthContext.jsx
//  Admin-only authentication — requires is_staff = true.
//  Uses the same OTP endpoints as the storefront but
//  rejects login if the user is not a staff member.
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

const ACCESS_KEY  = "admin_access_token";
const REFRESH_KEY = "admin_refresh_token";

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Token helpers ─────────────────────────────────────────

  const saveTokens = (access, refresh) => {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
  };

  const clearTokens = () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    delete api.defaults.headers.common["Authorization"];
  };

  // ── Attempt token refresh ─────────────────────────────────

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
      if (!profile.data.is_staff) {
        clearTokens();
        setUser(null);
        return false;
      }
      setUser(profile.data);
      return true;
    } catch {
      clearTokens();
      setUser(null);
      return false;
    }
  }, []);

  // ── Load user on mount ────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem(ACCESS_KEY);
      if (!token) {
        setLoading(false);
        return;
      }
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      try {
        const res = await api.get("/auth/me/");
        // Reject non-staff users immediately
        if (!res.data.is_staff) {
          clearTokens();
          setUser(null);
        } else {
          setUser(res.data);
        }
      } catch {
        await attemptRefresh();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [attemptRefresh]);

  // ── OTP request ───────────────────────────────────────────

  const requestOTP = async (phone) => {
    await api.post("/auth/otp/request/", { phone });
  };

  // ── OTP verify — staff check ──────────────────────────────

  const verifyOTP = async (phone, code) => {
    const res = await api.post("/auth/otp/verify/", { phone, code });

    // Reject login if the user is not staff
    if (!res.data.user.is_staff) {
      throw new Error("دسترسی ادمین ندارید. این پنل فقط برای کارمندان است.");
    }

    saveTokens(res.data.access, res.data.refresh);
    setUser(res.data.user);
    return res.data;
  };

  // ── Logout ────────────────────────────────────────────────

  const logout = () => {
    clearTokens();
    setUser(null);
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