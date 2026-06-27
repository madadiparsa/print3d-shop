// =============================================================
//  storefront/src/pages/OrderConfirmationPage.jsx
//  Shown after a successful order submission.
//  Displays order details and contact instructions.
// =============================================================

import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const formatPrice = (price) =>
  Number(price).toLocaleString("fa-IR") + " تومان";

const STATUS_LABEL = {
  pending:       "در انتظار تایید",
  confirmed:     "تایید شده",
  in_production: "در حال تولید",
  shipped:       "ارسال شده",
  delivered:     "تحویل داده شده",
  cancelled:     "لغو شده",
};

const CONTACT_INFO = {
  telegram: {
    icon:    "✈️",
    label:   "تلگرام",
    prefix:  "https://t.me/",
    store:   "print3d_shop",   // ← replace with real Telegram username
  },
  instagram: {
    icon:    "📸",
    label:   "اینستاگرام",
    prefix:  "https://instagram.com/",
    store:   "print3d.shop",   // ← replace with real Instagram username
  },
};

function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Order data passed from CheckoutPage via router state
  const order = location.state?.order;

  // If someone navigates here directly without an order, redirect
  useEffect(() => {
    if (!order) navigate("/catalog", { replace: true });
  }, [order, navigate]);

  if (!order) return null;

  const contact = CONTACT_INFO[order.contact_method] || CONTACT_INFO.telegram;
  const storeUrl = `${contact.prefix}${contact.store}`;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-7">

          {/* ── Success header ─────────────────────────── */}
          <div className="text-center mb-5">
            <div
              style={{
                fontSize: "4rem",
                animation: "bounceIn 0.6s ease",
              }}
            >
              ✅
            </div>
            <h3
              className="fw-bold mt-3 mb-2"
              style={{ color: "var(--color-text)" }}
            >
              سفارش شما ثبت شد!
            </h3>
            <p className="text-muted">
              شماره سفارش:{" "}
              <strong style={{ color: "var(--color-primary)" }}>
                #{order.id}
              </strong>
            </p>
          </div>

          {/* ── Contact instruction card ───────────────── */}
          <div
            className="card p-4 mb-4"
            style={{ borderColor: "var(--color-primary)", borderWidth: 2 }}
          >
            <h5 className="fw-bold mb-3">
              {contact.icon} مرحله بعد — تماس با فروشگاه
            </h5>
            <p className="mb-3" style={{ lineHeight: 1.8 }}>
              سفارش شما با موفقیت ثبت شد. برای نهایی کردن پرداخت و هماهنگی
              ارسال، لطفاً از طریق{" "}
              <strong>{contact.label}</strong> با فروشگاه تماس بگیرید و
              شماره سفارش خود را ذکر کنید.
            </p>

            {/* Store contact button */}
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg w-100 mb-3"
            >
              {contact.icon} تماس با فروشگاه در {contact.label}
            </a>

            {/* Customer contact ID */}
            <div
              className="alert alert-info mb-0"
              style={{ fontSize: "0.875rem" }}
            >
              <strong>شناسه تماس شما:</strong>{" "}
              <span dir="ltr">@{order.contact_id}</span>
              <br />
              <small className="text-muted">
                فروشگاه از طریق همین آیدی با شما تماس خواهد گرفت.
              </small>
            </div>
          </div>

          {/* ── Order summary card ─────────────────────── */}
          <div className="card p-4 mb-4">
            <h5 className="fw-bold mb-3">جزئیات سفارش</h5>

            {/* Items */}
            <div className="mb-3">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="d-flex justify-content-between mb-2"
                  style={{ fontSize: "0.9rem" }}
                >
                  <span>
                    <span className="text-muted me-1">
                      ×{item.quantity}
                    </span>
                    {item.product_name}
                  </span>
                  <span>{formatPrice(item.line_total)}</span>
                </div>
              ))}
            </div>

            <div className="divider" />

            {/* Total */}
            <div className="d-flex justify-content-between mb-3">
              <span className="fw-bold">مبلغ کل</span>
              <span
                className="fw-bold"
                style={{ color: "var(--color-primary)" }}
              >
                {formatPrice(order.total_price)}
              </span>
            </div>

            {/* Delivery address */}
            {order.delivery_address && (
              <>
                <div className="divider" />
                <div className="mb-3">
                  <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                    آدرس تحویل:
                  </span>
                  <p className="mb-0 mt-1" style={{ fontSize: "0.9rem" }}>
                    {order.delivery_address}
                  </p>
                </div>
              </>
            )}

            {/* Notes */}
            {order.notes && (
              <>
                <div className="divider" />
                <div>
                  <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                    توضیحات:
                  </span>
                  <p className="mb-0 mt-1" style={{ fontSize: "0.9rem" }}>
                    {order.notes}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* ── What happens next ──────────────────────── */}
          <div className="card p-4 mb-4">
            <h5 className="fw-bold mb-3">مراحل بعدی</h5>
            <ol
              className="mb-0"
              style={{ lineHeight: 2, paddingRight: "1.2rem" }}
            >
              <li>
                از طریق {contact.label} با فروشگاه تماس بگیرید و شماره
                سفارش <strong>#{order.id}</strong> را ذکر کنید.
              </li>
              <li>
                جزئیات پرداخت توسط فروشگاه اعلام می‌شود.
              </li>
              <li>
                پس از تایید پرداخت، سفارش وارد مرحله تولید می‌شود.
              </li>
              <li>
                پس از آماده شدن، سفارش ارسال و کد پیگیری اعلام می‌شود.
              </li>
            </ol>
          </div>

          {/* ── Actions ────────────────────────────────── */}
          <div className="d-flex gap-3 flex-wrap">
            <Link
              to="/profile"
              className="btn btn-outline-primary flex-fill"
            >
              مشاهده سفارش‌هایم
            </Link>
            <Link
              to="/catalog"
              className="btn btn-outline-secondary flex-fill"
            >
              ادامه خرید
            </Link>
          </div>

        </div>
      </div>

      {/* Bounce animation */}
      <style>{`
        @keyframes bounceIn {
          0%   { transform: scale(0.3); opacity: 0; }
          50%  { transform: scale(1.1); }
          70%  { transform: scale(0.9); }
          100% { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default OrderConfirmationPage;