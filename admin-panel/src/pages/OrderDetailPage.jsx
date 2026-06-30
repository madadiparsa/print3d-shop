// =============================================================
//  admin-panel/src/pages/OrderDetailPage.jsx
//  Full order detail — items, status update, admin notes.
// =============================================================

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

const formatPrice = (p) => Number(p).toLocaleString("fa-IR") + " تومان";

const STATUS_OPTIONS = [
  { value: "pending",       label: "در انتظار تایید",  color: "warning" },
  { value: "confirmed",     label: "تایید شده",         color: "info"    },
  { value: "in_production", label: "در حال تولید",      color: "primary" },
  { value: "shipped",       label: "ارسال شده",          color: "success" },
  { value: "delivered",     label: "تحویل داده شده",    color: "success" },
  { value: "cancelled",     label: "لغو شده",            color: "danger"  },
];

function OrderDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // Status update form
  const [newStatus, setNewStatus]     = useState("");
  const [adminNotes, setAdminNotes]   = useState("");
  const [saving, setSaving]           = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Fetch order ───────────────────────────────────────────
  const fetchOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/orders/${id}/`);
      setOrder(res.data);
      setNewStatus(res.data.status);
      setAdminNotes(res.data.admin_notes || "");
    } catch (err) {
      if (err.response?.status === 404) {
        setError("سفارش یافت نشد.");
      } else {
        setError("خطا در بارگذاری سفارش.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // ── Save status + notes ───────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.patch(`/orders/${id}/status/`, {
        status:      newStatus,
        admin_notes: adminNotes,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchOrder();
    } catch {
      alert("خطا در ذخیره تغییرات.");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <AdminLayout title="جزئیات سفارش">
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton mb-3" style={{ height: 48 }} />
              ))}
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton mb-3" style={{ height: 36 }} />
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ── Error ─────────────────────────────────────────────────
  if (error) {
    return (
      <AdminLayout title="جزئیات سفارش">
        <div className="alert alert-danger">{error}</div>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/orders")}
        >
          ← بازگشت به سفارش‌ها
        </button>
      </AdminLayout>
    );
  }

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === order.status);

  return (
    <AdminLayout title={`سفارش #${order.id}`}>

      {/* Back button */}
      <button
        className="btn btn-outline-secondary btn-sm mb-4"
        onClick={() => navigate("/orders")}
      >
        ← بازگشت به لیست سفارش‌ها
      </button>

      <div className="row g-4">

        {/* ── Left column: order info ──────────────────── */}
        <div className="col-lg-8">

          {/* Order items */}
          <div className="card p-4 mb-4">
            <h6 className="fw-bold mb-3">
              آیتم‌های سفارش
              <span className="badge bg-secondary me-2" style={{ fontSize: "0.75rem" }}>
                {order.items?.length || 0} محصول
              </span>
            </h6>

            <div className="table-responsive">
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th style={{ fontSize: "0.85rem" }}>محصول</th>
                    <th style={{ fontSize: "0.85rem" }}>قیمت واحد</th>
                    <th style={{ fontSize: "0.85rem" }}>تعداد</th>
                    <th style={{ fontSize: "0.85rem" }}>جمع</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontSize: "0.9rem" }}>
                        {item.product_name}
                      </td>
                      <td style={{ fontSize: "0.85rem" }}>
                        {formatPrice(item.unit_price)}
                      </td>
                      <td style={{ fontSize: "0.85rem" }}>
                        {item.quantity.toLocaleString("fa-IR")}
                      </td>
                      <td
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "var(--color-primary)",
                        }}
                      >
                        {formatPrice(item.line_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colSpan={3}
                      className="fw-bold text-end"
                      style={{ fontSize: "0.9rem" }}
                    >
                      مبلغ کل:
                    </td>
                    <td
                      className="fw-bold"
                      style={{
                        fontSize: "1rem",
                        color: "var(--color-primary)",
                      }}
                    >
                      {formatPrice(order.total_price)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Customer info */}
          <div className="card p-4 mb-4">
            <h6 className="fw-bold mb-3">اطلاعات مشتری</h6>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: "0.8rem" }}>
                  شماره تلفن
                </label>
                <p className="fw-semibold mb-0" dir="ltr">
                  {order.user || "—"}
                </p>
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: "0.8rem" }}>
                  روش تماس
                </label>
                <p className="fw-semibold mb-0">
                  {order.contact_method === "telegram"
                    ? "✈️ تلگرام"
                    : "📸 اینستاگرام"}
                </p>
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: "0.8rem" }}>
                  شناسه تماس
                </label>
                <p className="fw-semibold mb-0" dir="ltr">
                  @{order.contact_id}
                </p>
              </div>

              <div className="col-md-6">
                <label className="form-label text-muted" style={{ fontSize: "0.8rem" }}>
                  تاریخ ثبت
                </label>
                <p className="fw-semibold mb-0">
                  {new Date(order.created_at).toLocaleDateString("fa-IR")}
                </p>
              </div>

              {order.delivery_address && (
                <div className="col-12">
                  <label className="form-label text-muted" style={{ fontSize: "0.8rem" }}>
                    آدرس تحویل
                  </label>
                  <p className="mb-0" style={{ fontSize: "0.9rem", lineHeight: 1.7 }}>
                    {order.delivery_address}
                  </p>
                </div>
              )}

              {order.notes && (
                <div className="col-12">
                  <label className="form-label text-muted" style={{ fontSize: "0.8rem" }}>
                    یادداشت مشتری
                  </label>
                  <p
                    className="mb-0"
                    style={{
                      fontSize: "0.9rem",
                      lineHeight: 1.7,
                      backgroundColor: "var(--color-bg)",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── Right column: status management ─────────── */}
        <div className="col-lg-4">

          {/* Current status */}
          <div className="card p-4 mb-4">
            <h6 className="fw-bold mb-3">وضعیت فعلی</h6>

            {/* Status timeline */}
            <div className="mb-3">
              {STATUS_OPTIONS.map((s, idx) => {
                const currentIdx = STATUS_OPTIONS.findIndex(
                  (x) => x.value === order.status
                );
                const isDone    = idx < currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div
                    key={s.value}
                    className="d-flex align-items-center gap-2 mb-2"
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        flexShrink: 0,
                        backgroundColor: isCurrent
                          ? `var(--bs-${s.color})`
                          : isDone
                          ? "#10b981"
                          : "var(--color-border)",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: isCurrent ? 700 : 400,
                        color: isCurrent
                          ? "var(--color-text)"
                          : isDone
                          ? "#10b981"
                          : "var(--color-text-muted)",
                        textDecoration:
                          s.value === "cancelled" && !isCurrent
                            ? "none"
                            : "none",
                      }}
                    >
                      {s.label}
                    </span>
                    {isCurrent && (
                      <span
                        className={`badge bg-${s.color} me-auto`}
                        style={{ fontSize: "0.65rem" }}
                      >
                        فعلی
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Update status */}
          <div className="card p-4 mb-4">
            <h6 className="fw-bold mb-3">بروزرسانی وضعیت</h6>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                وضعیت جدید
              </label>
              <select
                className="form-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                یادداشت ادمین
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="یادداشت داخلی برای این سفارش..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
              <div className="form-text">
                این یادداشت فقط برای ادمین نمایش داده می‌شود.
              </div>
            </div>

            {saveSuccess && (
              <div className="alert alert-success py-2 mb-3">
                تغییرات با موفقیت ذخیره شد.
              </div>
            )}

            <button
              className="btn btn-primary w-100"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && (
                <span className="spinner-border spinner-border-sm me-2" />
              )}
              {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </div>

          {/* Quick contact */}
          <div className="card p-4">
            <h6 className="fw-bold mb-3">تماس سریع</h6>
            <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
              برای هماهنگی با مشتری:
            </p>
            {order.contact_method === "telegram" ? (
              <a
                href={`https://t.me/${order.contact_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-100"
              >
                ✈️ تماس در تلگرام
              </a>
            ) : (
              <a
                href={`https://instagram.com/${order.contact_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary w-100"
              >
                📸 تماس در اینستاگرام
              </a>
            )}
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}

export default OrderDetailPage;