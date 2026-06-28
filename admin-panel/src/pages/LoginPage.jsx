// =============================================================
//  admin-panel/src/pages/LoginPage.jsx
//  Two-step OTP login — staff only.
// =============================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function LoginPage() {
  const { requestOTP, verifyOTP, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]           = useState("phone");
  const [phone, setPhone]         = useState("");
  const [code, setCode]           = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [countdown, setCountdown] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const formatCountdown = (s) => {
    const m   = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

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
      setCountdown(120);
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
      await verifyOTP(phone.trim(), code.trim());
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.message ||
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
        err.response?.data?.detail || "خطا در ارسال مجدد کد."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-bg)",
      }}
    >
      <div className="w-100" style={{ maxWidth: 420, padding: "0 1rem" }}>

        {/* Header */}
        <div className="text-center mb-4">
          <div style={{ fontSize: "3rem" }}>🖨️</div>
          <h3
            className="fw-bold mt-2"
            style={{ color: "var(--color-text)" }}
          >
            پنل مدیریت
          </h3>
          <p className="text-muted" style={{ fontSize: "0.9rem" }}>
            ورود مخصوص کارمندان
          </p>
        </div>

        <div className="card p-4">

          {/* Step indicator */}
          <div className="d-flex align-items-center gap-2 mb-4">
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                backgroundColor:
                  step === "phone"
                    ? "var(--color-primary)"
                    : "var(--color-border)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              ۱
            </div>
            <div
              style={{
                flex: 1,
                height: 2,
                backgroundColor:
                  step === "code"
                    ? "var(--color-primary)"
                    : "var(--color-border)",
              }}
            />
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                backgroundColor:
                  step === "code"
                    ? "var(--color-primary)"
                    : "var(--color-border)",
                color: step === "code" ? "#fff" : "var(--color-text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              ۲
            </div>
          </div>

          <h5
            className="fw-bold mb-1"
            style={{ color: "var(--color-text)" }}
          >
            {step === "phone" ? "شماره موبایل" : "کد تایید"}
          </h5>
          <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
            {step === "phone"
              ? "شماره موبایل ادمین را وارد کنید"
              : `کد ۶ رقمی ارسال شده به ${phone} را وارد کنید`}
          </p>

          {/* Demo notice */}
          {step === "code" && (
            <div
              className="alert alert-info mb-3"
              style={{ fontSize: "0.82rem" }}
            >
              🛠️ حالت دمو: کد تایید در ترمینال سرور چاپ شده است.
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="alert alert-danger mb-3"
              style={{ fontSize: "0.85rem" }}
            >
              {error}
            </div>
          )}

          {/* ── Step 1 ──────────────────────────────────── */}
          {step === "phone" && (
            <form onSubmit={handleRequestOTP}>
              <div className="mb-3">
                <input
                  type="tel"
                  className="form-control form-control-lg text-center"
                  placeholder="09123456789"
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
                {loading && (
                  <span className="spinner-border spinner-border-sm me-2" />
                )}
                {loading ? "در حال ارسال..." : "دریافت کد تایید"}
              </button>
            </form>
          )}

          {/* ── Step 2 ──────────────────────────────────── */}
          {step === "code" && (
            <form onSubmit={handleVerifyOTP}>
              <div className="mb-3">
                <input
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
                {loading && (
                  <span className="spinner-border spinner-border-sm me-2" />
                )}
                {loading ? "در حال بررسی..." : "ورود به پنل"}
              </button>

              <div className="d-flex justify-content-between">
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

        <p
          className="text-center text-muted mt-3"
          style={{ fontSize: "0.78rem" }}
        >
          دسترسی به این پنل فقط برای کارمندان مجاز است.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;