// =============================================================
//  storefront/src/pages/CheckoutPage.jsx
//  Order submission — customer enters Telegram or Instagram ID.
//  No payment gateway — store contacts customer manually.
// =============================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import api from "../services/api";

const formatPrice = (price) =>
  Number(price).toLocaleString("fa-IR") + " تومان";

function CheckoutPage() {
  const { user }                          = useAuth();
  const { cartItems, totalPrice, totalItems } = useCart();
  const navigate                          = useNavigate();

  // ── Form state ────────────────────────────────────────────
  const [contactMethod, setContactMethod] = useState("telegram");
  const [contactId, setContactId]         = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");

  // ── Empty cart guard ──────────────────────────────────────
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div style={{ fontSize: "4rem" }}>🛒</div>
          <h4 className="mt-3 mb-2">سبد خرید خالی است</h4>
          <p className="text-muted mb-4">
            برای ثبت سفارش ابتدا محصولی به سبد خرید اضافه کنید.
          </p>
          <Link to="/catalog" className="btn btn-primary px-4">
            مشاهده محصولات
          </Link>
        </div>
      </div>
    );
  }

  // ── Submit order ──────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanId = contactId.trim();
    if (!cleanId) {
      setError("لطفاً شناسه تلگرام یا اینستاگرام خود را وارد کنید.");
      return;
    }
    if (cleanId.length < 3) {
      setError("شناسه تماس باید حداقل ۳ کاراکتر باشد.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/orders/create/", {
        contact_method:   contactMethod,
        contact_id:       cleanId,
        delivery_address: deliveryAddress.trim(),
        notes:            notes.trim(),
      });

      // Navigate to confirmation page with order data
      navigate("/order-confirmation", {
        state: { order: res.data },
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "خطا در ثبت سفارش. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4">تکمیل سفارش</h4>

      <div className="row g-4">

        {/* ── Left: Order form ──────────────────────────── */}
        <div className="col-lg-7">
          <form onSubmit={handleSubmit}>

            {/* Contact method */}
            <div className="card p-4 mb-4">
              <h5 className="fw-bold mb-3">روش تماس برای هماهنگی</h5>
              <p
                className="text-muted mb-3"
                style={{ fontSize: "0.9rem" }}
              >
                پس از ثبت سفارش، فروشگاه از طریق پیام‌رسان انتخابی شما
                برای هماهنگی پرداخت و ارسال با شما تماس می‌گیرد.
              </p>

              {/* Method selector */}
              <div className="d-flex gap-3 mb-3">
                {[
                  { value: "telegram",  label: "تلگرام",    icon: "✈️" },
                  { value: "instagram", label: "اینستاگرام", icon: "📸" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`btn flex-fill ${
                      contactMethod === opt.value
                        ? "btn-primary"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => {
                      setContactMethod(opt.value);
                      setContactId("");
                    }}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>

              {/* Contact ID input */}
              <div className="mb-2">
                <label htmlFor="contactId" className="form-label fw-semibold">
                  {contactMethod === "telegram"
                    ? "آیدی تلگرام"
                    : "آیدی اینستاگرام"}
                </label>
                <div className="input-group">
                  <span className="input-group-text">@</span>
                  <input
                    id="contactId"
                    type="text"
                    className="form-control"
                    placeholder={
                      contactMethod === "telegram"
                        ? "username"
                        : "instagram_username"
                    }
                    value={contactId}
                    onChange={(e) => setContactId(e.target.value)}
                    dir="ltr"
                    required
                  />
                </div>
                <div className="form-text">
                  {contactMethod === "telegram"
                    ? "آیدی تلگرام خود را بدون @ وارد کنید."
                    : "نام کاربری اینستاگرام خود را بدون @ وارد کنید."}
                </div>
              </div>
            </div>

            {/* Delivery address */}
            <div className="card p-4 mb-4">
              <h5 className="fw-bold mb-3">آدرس تحویل</h5>
              <textarea
                className="form-control"
                rows={3}
                placeholder="استان، شهر، خیابان، کوچه، پلاک، کد پستی"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
              <div className="form-text">
                آدرس دقیق برای هماهنگی ارسال الزامی نیست — می‌توانید
                هنگام تماس با فروشگاه ارائه دهید.
              </div>
            </div>

            {/* Notes */}
            <div className="card p-4 mb-4">
              <h5 className="fw-bold mb-3">توضیحات سفارش</h5>
              <textarea
                className="form-control"
                rows={2}
                placeholder="هرگونه توضیح اضافه برای سفارش..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-danger">{error}</div>
            )}

            {/* Actions */}
            <div className="d-flex gap-3">
              <Link
                to="/cart"
                className="btn btn-outline-secondary flex-fill"
              >
                ← بازگشت به سبد
              </Link>
              <button
                type="submit"
                className="btn btn-primary flex-fill btn-lg"
                disabled={loading}
              >
                {loading && (
                  <span className="spinner-border spinner-border-sm me-2" />
                )}
                {loading ? "در حال ثبت..." : "ثبت سفارش"}
              </button>
            </div>
          </form>
        </div>

        {/* ── Right: Order summary ──────────────────────── */}
        <div className="col-lg-5">
          <div
            className="card p-4"
            style={{
              position: "sticky",
              top: "calc(var(--navbar-height) + 1rem)",
            }}
          >
            <h5 className="fw-bold mb-3">خلاصه سفارش</h5>

            {/* Item list */}
            <div className="mb-3">
              {cartItems.map((item) => {
                const product = item.product || item;
                const name    = product.name  || item.product_name;
                const price   = product.price || item.unit_price;
                const total   = item.line_total || price * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="d-flex justify-content-between mb-2"
                    style={{ fontSize: "0.9rem" }}
                  >
                    <span className="text-muted">
                      {name}
                      <span className="me-1 text-muted">
                        ×{item.quantity}
                      </span>
                    </span>
                    <span>{formatPrice(total)}</span>
                  </div>
                );
              })}
            </div>

            <div className="divider" />

            {/* Totals */}
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">تعداد کل</span>
              <span>{totalItems.toLocaleString("fa-IR")} عدد</span>
            </div>

            <div className="d-flex justify-content-between mb-3">
              <span className="fw-bold">مبلغ کل</span>
              <span
                className="fw-bold"
                style={{ color: "var(--color-primary)" }}
              >
                {formatPrice(totalPrice)}
              </span>
            </div>

            {/* Payment notice */}
            <div
              className="alert alert-warning mb-0"
              style={{ fontSize: "0.82rem" }}
            >
              <strong>نحوه پرداخت:</strong>
              <br />
              پس از ثبت سفارش، فروشگاه از طریق{" "}
              {contactMethod === "telegram" ? "تلگرام" : "اینستاگرام"}{" "}
              با شما تماس گرفته و جزئیات پرداخت و ارسال را هماهنگ می‌کند.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;