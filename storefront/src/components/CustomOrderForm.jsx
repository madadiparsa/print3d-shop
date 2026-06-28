// =============================================================
//  storefront/src/components/CustomOrderForm.jsx
//  Contact form for custom 3D print orders.
//  Submitted to /api/orders/contact/ — stored as ContactMessage.
//  Store follows up via Telegram or Instagram.
// =============================================================

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

function CustomOrderForm({ productName = "", productSlug = "" }) {
  const { user } = useAuth();

  const [form, setForm] = useState({
    full_name:      user?.full_name || "",
    phone:          user?.phone     || "",
    contact_method: "telegram",
    contact_id:     "",
    dimensions:     "",
    material:       "",
    quantity:       "1",
    description:    "",
    message:        "",
  });

  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState("");
  const [open, setOpen]         = useState(false);

  // ── Field change handler ──────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate phone
    const phone = form.phone.trim();
    if (!phone.startsWith("09") || phone.length !== 11) {
      setError("شماره تلفن معتبر نیست. مثال: ۰۹۱۲۳۴۵۶۷۸۹");
      return;
    }

    // Validate contact ID
    if (!form.contact_id.trim()) {
      setError("لطفاً شناسه تلگرام یا اینستاگرام خود را وارد کنید.");
      return;
    }

    // Build message body combining all fields
    const messageBody = [
      `📦 درخواست سفارش سفارشی`,
      `محصول: ${productName}`,
      `---`,
      form.dimensions  ? `ابعاد: ${form.dimensions}`         : null,
      form.material    ? `متریال: ${form.material}`          : null,
      form.quantity    ? `تعداد: ${form.quantity}`            : null,
      form.description ? `توضیحات: ${form.description}`      : null,
      `---`,
      `روش تماس: ${form.contact_method === "telegram" ? "تلگرام" : "اینستاگرام"}`,
      `شناسه تماس: @${form.contact_id}`,
      form.message ? `پیام اضافی: ${form.message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    setLoading(true);
    try {
      await api.post("/orders/contact/", {
        full_name: form.full_name || "کاربر",
        phone:     phone,
        message:   messageBody,
      });
      setSuccess(true);
      setOpen(false);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        Object.values(err.response?.data || {})[0]?.[0] ||
        "خطا در ارسال درخواست. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ─────────────────────────────────────────
  if (success) {
    return (
      <div className="card p-4 text-center">
        <div style={{ fontSize: "3rem" }}>✅</div>
        <h5 className="fw-bold mt-3 mb-2">درخواست شما ثبت شد!</h5>
        <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
          فروشگاه به زودی از طریق{" "}
          {form.contact_method === "telegram" ? "تلگرام" : "اینستاگرام"} با
          شناسه <strong dir="ltr">@{form.contact_id}</strong> با شما تماس
          می‌گیرد.
        </p>
        <button
          className="btn btn-outline-primary"
          onClick={() => {
            setSuccess(false);
            setForm((prev) => ({
              ...prev,
              contact_id:  "",
              dimensions:  "",
              material:    "",
              quantity:    "1",
              description: "",
              message:     "",
            }));
          }}
        >
          ارسال درخواست جدید
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ── Toggle button ─────────────────────────────────── */}
      {!open && (
        <button
          className="btn btn-warning w-100 btn-lg"
          onClick={() => setOpen(true)}
        >
          🎨 ثبت درخواست سفارشی
        </button>
      )}

      {/* ── Form ──────────────────────────────────────────── */}
      {open && (
        <div className="card p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">درخواست سفارش سفارشی</h5>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          <p className="text-muted mb-4" style={{ fontSize: "0.875rem" }}>
            مشخصات سفارش خود را وارد کنید. فروشگاه پس از بررسی با شما
            تماس گرفته و قیمت نهایی را اعلام می‌کند.
          </p>

          {error && (
            <div className="alert alert-danger py-2 mb-3">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row g-3">

              {/* Full name */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  نام کامل
                </label>
                <input
                  name="full_name"
                  type="text"
                  className="form-control"
                  placeholder="نام و نام خانوادگی"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Phone */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  شماره موبایل
                </label>
                <input
                  name="phone"
                  type="tel"
                  className="form-control"
                  placeholder="09123456789"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={11}
                  dir="ltr"
                  required
                />
              </div>

              {/* Contact method */}
              <div className="col-12">
                <label className="form-label fw-semibold">
                  روش تماس برای پیگیری
                </label>
                <div className="d-flex gap-2">
                  {[
                    { value: "telegram",  label: "✈️ تلگرام"    },
                    { value: "instagram", label: "📸 اینستاگرام" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`btn flex-fill ${
                        form.contact_method === opt.value
                          ? "btn-primary"
                          : "btn-outline-secondary"
                      }`}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          contact_method: opt.value,
                          contact_id: "",
                        }))
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact ID */}
              <div className="col-12">
                <label className="form-label fw-semibold">
                  {form.contact_method === "telegram"
                    ? "آیدی تلگرام"
                    : "آیدی اینستاگرام"}
                </label>
                <div className="input-group">
                  <span className="input-group-text">@</span>
                  <input
                    name="contact_id"
                    type="text"
                    className="form-control"
                    placeholder={
                      form.contact_method === "telegram"
                        ? "telegram_username"
                        : "instagram_username"
                    }
                    value={form.contact_id}
                    onChange={handleChange}
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="col-12">
                <div className="divider" />
                <p
                  className="text-muted mb-0"
                  style={{ fontSize: "0.8rem" }}
                >
                  مشخصات فنی سفارش
                </p>
              </div>

              {/* Dimensions */}
              <div className="col-md-6">
                <label className="form-label">
                  ابعاد (اختیاری)
                </label>
                <input
                  name="dimensions"
                  type="text"
                  className="form-control"
                  placeholder="مثال: ۱۰×۵×۳ سانتیمتر"
                  value={form.dimensions}
                  onChange={handleChange}
                />
              </div>

              {/* Material */}
              <div className="col-md-6">
                <label className="form-label">
                  متریال (اختیاری)
                </label>
                <select
                  name="material"
                  className="form-select"
                  value={form.material}
                  onChange={handleChange}
                >
                  <option value="">انتخاب متریال...</option>
                  <option value="PLA">PLA</option>
                  <option value="ABS">ABS</option>
                  <option value="PETG">PETG</option>
                  <option value="TPU">TPU (انعطاف‌پذیر)</option>
                  <option value="Resin">رزین</option>
                  <option value="other">سایر</option>
                </select>
              </div>

              {/* Quantity */}
              <div className="col-md-6">
                <label className="form-label">
                  تعداد
                </label>
                <input
                  name="quantity"
                  type="number"
                  className="form-control"
                  min="1"
                  max="1000"
                  value={form.quantity}
                  onChange={handleChange}
                  dir="ltr"
                />
              </div>

              {/* Description */}
              <div className="col-12">
                <label className="form-label">
                  توضیحات فنی (اختیاری)
                </label>
                <textarea
                  name="description"
                  className="form-control"
                  rows={2}
                  placeholder="جزئیات دقیق طرح، رنگ، کیفیت چاپ و..."
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              {/* Extra message */}
              <div className="col-12">
                <label className="form-label">
                  پیام اضافی (اختیاری)
                </label>
                <textarea
                  name="message"
                  className="form-control"
                  rows={2}
                  placeholder="هر چیز دیگری که باید بدانیم..."
                  value={form.message}
                  onChange={handleChange}
                />
              </div>

            </div>

            {/* Actions */}
            <div className="d-flex gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-primary flex-fill"
                disabled={loading}
              >
                {loading && (
                  <span className="spinner-border spinner-border-sm me-2" />
                )}
                {loading ? "در حال ارسال..." : "ارسال درخواست"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default CustomOrderForm;