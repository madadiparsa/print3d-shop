// =============================================================
//  storefront/src/pages/NotFoundPage.jsx
//  Full 404 page with navigation options
// =============================================================

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function NotFoundPage() {
  const navigate          = useNavigate();
  const [countdown, setCountdown] = useState(10);

  // Auto-redirect to home after 10 seconds
  useEffect(() => {
    if (countdown <= 0) {
      navigate("/");
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "calc(100vh - var(--navbar-height))" }}
    >
      <div className="text-center px-3" style={{ maxWidth: 520 }}>

        {/* 404 number */}
        <div
          className="fw-bold"
          style={{
            fontSize: "clamp(5rem, 15vw, 9rem)",
            color: "var(--color-primary)",
            lineHeight: 1,
            opacity: 0.15,
            userSelect: "none",
          }}
        >
          ۴۰۴
        </div>

        <div style={{ marginTop: "-2rem" }}>
          <div style={{ fontSize: "3.5rem" }}>🔍</div>
          <h2
            className="fw-bold mt-3 mb-2"
            style={{ color: "var(--color-text)" }}
          >
            صفحه پیدا نشد
          </h2>
          <p
            className="text-muted mb-4"
            style={{ lineHeight: 1.8, fontSize: "0.95rem" }}
          >
            صفحه‌ای که دنبالش می‌گردید وجود ندارد، حذف شده یا آدرس آن
            تغییر کرده است.
          </p>
        </div>

        {/* Actions */}
        <div className="d-flex gap-3 justify-content-center flex-wrap mb-4">
          <Link to="/" className="btn btn-primary px-4">
            🏠 صفحه اصلی
          </Link>
          <Link to="/catalog" className="btn btn-outline-primary px-4">
            🛍️ مشاهده محصولات
          </Link>
          <button
            className="btn btn-outline-secondary px-4"
            onClick={() => navigate(-1)}
          >
            ← بازگشت
          </button>
        </div>

        {/* Auto-redirect countdown */}
        <p className="text-muted" style={{ fontSize: "0.82rem" }}>
          انتقال خودکار به صفحه اصلی در{" "}
          <strong style={{ color: "var(--color-primary)" }}>
            {countdown.toLocaleString("fa-IR")}
          </strong>{" "}
          ثانیه دیگر...
        </p>

      </div>
    </div>
  );
}

export default NotFoundPage;