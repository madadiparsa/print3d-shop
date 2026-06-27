// =============================================================
//  storefront/src/pages/LoginPage.jsx
//  Two-step OTP login:
//  Step 1 — enter phone number → request OTP
//  Step 2 — enter 6-digit code → verify and receive JWT
// =============================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function LoginPage() {
  const { requestOTP, verifyOTP, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // ── Steps: "phone" | "code" ───────────────────────────────
  const [step, setStep]         = useState("phone");
  const [phone, setPhone]       = useState("");
  const [code, setCode]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [countdown, setCountdown] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate("/profile");
  }, [isAuthenticated, navigate]);

  // ── Countdown timer for OTP resend ────────────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ── Step 1: Request OTP ───────────────────────────────────
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError("");

    const cleaned = phone.trim();
    if (!cleaned.startsWith("09") || cleaned.length !== 11) {
      setError("شماره تلفن معتبر نیست. مثال: ۰۹۱۲۳۴۵۶۷۸۹");
      return;
    }

    setLoading(true);
    try {
      await requestOTP(cleaned);
      setStep("code");
      setCountdown(120); // 2 minute resend cooldown
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "خطا در ارسال کد. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (code.trim().length !== 6) {
      setError("کد تایید باید ۶ رقم باشد.");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOTP(phone.trim(), code.trim());
      // Navigate to profile or back to where they came from
      navigate(result.created ? "/profile" : "/");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "کد تایید اشتباه یا منقضی شده است."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return;
    setError("");
    setCode("");
    setLoading(true);
    try {
      await requestOTP(phone.trim());
      setCountdown(120);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "خطا در ارسال مجدد کد."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Format countdown as mm:ss ─────────────────────────────
  const formatCountdown = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "calc(100vh - var(--navbar-height))" }}
    >
      <div className="w-100" style={{ maxWidth: 420, padding: "0 1rem" }}>
        <div className="card p-4 p-md-5">

          {/* Header */}
          <div className="text-center mb-4">
            <div style={{ fontSize: "2.5rem" }}>🖨️</div>
            <h4 className="fw-bold mt-2" style={{ color: "var(--color-text)" }}>
              {step === "phone" ? "ورود به حساب" : "کد تایید"}
            </h4>
            <p className="text-muted" style={{ fontSize: "0.9rem" }}>
              {step === "phone"
                ? "شماره موبایل خود را وارد کنید"
                : `کد ۶ رقمی ارسال شده به ${phone} را وارد کنید`}
            </p>
          </div>

          {/* Demo mode notice */}
          {step === "code" && (
            <div
              className="alert alert-info mb-3"
              style={{ fontSize: "0.85rem" }}
            >
              🛠️ حالت دمو: کد تایید در ترمینال سرور چاپ شده است.
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="alert alert-danger mb-3" style={{ fontSize: "0.85rem" }}>
              {error}
            </div>
          )}

          {/* ── Step 1: Phone form ─────────────────────── */}
          {step === "phone" && (
            <form onSubmit={handleRequestOTP}>
              <div className="mb-3">
                <label
                  htmlFor="phone"
                  className="form-label fw-semibold"
                >
                  شماره موبایل
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="form-control form-control-lg text-center"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={11}
                  dir="ltr"
                  autoFocus
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 btn-lg"
                disabled={loading}
              >
                {loading ? (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                ) : null}
                {loading ? "در حال ارسال..." : "دریافت کد تایید"}
              </button>
            </form>
          )}

          {/* ── Step 2: OTP code form ──────────────────── */}
          {step === "code" && (
            <form onSubmit={handleVerifyOTP}>
              <div className="mb-3">
                <label
                  htmlFor="code"
                  className="form-label fw-semibold"
                >
                  کد تایید
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  className="form-control form-control-lg text-center"
                  placeholder="● ● ● ● ● ●"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  dir="ltr"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 btn-lg mb-3"
                disabled={loading || code.length !== 6}
              >
                {loading ? (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                ) : null}
                {loading ? "در حال بررسی..." : "ورود"}
              </button>

              {/* Resend + back */}
              <div className="d-flex justify-content-between align-items-center">
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-muted"
                  onClick={() => {
                    setStep("phone");
                    setCode("");
                    setError("");
                  }}
                >
                  ← تغییر شماره
                </button>

                <button
                  type="button"
                  className={`btn btn-link btn-sm p-0 ${
                    countdown > 0 ? "text-muted" : "text-primary-brand"
                  }`}
                  onClick={handleResend}
                  disabled={countdown > 0 || loading}
                >
                  {countdown > 0
                    ? `ارسال مجدد (${formatCountdown(countdown)})`
                    : "ارسال مجدد کد"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;