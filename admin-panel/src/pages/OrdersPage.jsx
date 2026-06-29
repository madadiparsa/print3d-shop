// =============================================================
//  admin-panel/src/pages/OrdersPage.jsx
//  Full order list with status update and filtering.
// =============================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

const formatPrice = (p) => Number(p).toLocaleString("fa-IR") + " ت";

const STATUS_OPTIONS = [
  { value: "",             label: "همه وضعیت‌ها"    },
  { value: "pending",      label: "در انتظار تایید" },
  { value: "confirmed",    label: "تایید شده"       },
  { value: "in_production",label: "در حال تولید"    },
  { value: "shipped",      label: "ارسال شده"       },
  { value: "delivered",    label: "تحویل داده شده"  },
  { value: "cancelled",    label: "لغو شده"         },
];

const STATUS_MAP = {
  pending:       { label: "در انتظار",   color: "warning" },
  confirmed:     { label: "تایید شده",   color: "info"    },
  in_production: { label: "در تولید",    color: "primary" },
  shipped:       { label: "ارسال شده",   color: "success" },
  delivered:     { label: "تحویل داده",  color: "success" },
  cancelled:     { label: "لغو شده",     color: "danger"  },
};

// ── Inline status updater ─────────────────────────────────────
function StatusBadge({ order, onUpdate }) {
  const [open, setOpen]       = useState(false);
  const [saving, setSaving]   = useState(false);
  const status                = STATUS_MAP[order.status] || { label: order.status, color: "secondary" };

  const handleSelect = async (newStatus) => {
    if (newStatus === order.status) { setOpen(false); return; }
    setSaving(true);
    try {
      await api.patch(`/orders/${order.id}/status/`, { status: newStatus });
      onUpdate();
    } catch {
      alert("خطا در تغییر وضعیت.");
    } finally {
      setSaving(false);
      setOpen(false);
    }
  };

  return (
    <div className="position-relative d-inline-block">
      <span
        className={`badge bg-${status.color}`}
        style={{ cursor: "pointer", fontSize: "0.78rem" }}
        onClick={() => setOpen((o) => !o)}
        title="کلیک برای تغییر وضعیت"
      >
        {saving ? "..." : status.label} ▾
      </span>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            right: 0,
            backgroundColor: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            zIndex: 200,
            minWidth: 160,
            boxShadow: "0 4px 16px var(--color-shadow)",
            overflow: "hidden",
          }}
        >
          {STATUS_OPTIONS.filter((s) => s.value).map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              style={{
                display: "block",
                width: "100%",
                padding: "0.5rem 1rem",
                textAlign: "right",
                background: order.status === opt.value
                  ? "var(--color-primary)"
                  : "none",
                color: order.status === opt.value ? "#fff" : "var(--color-text)",
                border: "none",
                fontSize: "0.85rem",
                cursor: "pointer",
                fontFamily: "var(--font-primary)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main OrdersPage ───────────────────────────────────────────
function OrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders]   = useState([]);
  const [count, setCount]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const [filterStatus, setFilterStatus]   = useState("");
  const [filterMethod, setFilterMethod]   = useState("");
  const [page, setPage]                   = useState(1);

  const PAGE_SIZE  = 10;
  const totalPages = Math.ceil(count / PAGE_SIZE);

  // ── Fetch orders ──────────────────────────────────────────
  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page };
      if (filterStatus) params.status         = filterStatus;
      if (filterMethod) params.contact_method = filterMethod;

      const res = await api.get("/orders/", { params });
      setOrders(res.data.results || res.data);
      setCount(res.data.count   || 0);
    } catch {
      setError("خطا در بارگذاری سفارش‌ها.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, filterMethod, page]);

  return (
    <AdminLayout title="مدیریت سفارش‌ها">

      {/* ── Toolbar ───────────────────────────────────────── */}
      <div className="d-flex flex-wrap gap-2 align-items-center mb-4">
        <select
          className="form-select"
          style={{ maxWidth: 200 }}
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ maxWidth: 180 }}
          value={filterMethod}
          onChange={(e) => { setFilterMethod(e.target.value); setPage(1); }}
        >
          <option value="">همه روش‌های تماس</option>
          <option value="telegram">✈️ تلگرام</option>
          <option value="instagram">📸 اینستاگرام</option>
        </select>

        <span className="text-muted ms-auto" style={{ fontSize: "0.85rem" }}>
          {count.toLocaleString("fa-IR")} سفارش
        </span>
      </div>

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      {/* ── Orders table ──────────────────────────────────── */}
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>کاربر</th>
                <th>روش تماس</th>
                <th>شناسه تماس</th>
                <th>مبلغ کل</th>
                <th>وضعیت</th>
                <th>تاریخ</th>
                <th style={{ width: 80 }}>جزئیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j}>
                        <div className="skeleton" style={{ height: 20 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    سفارشی یافت نشد.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong style={{ color: "var(--color-primary)" }}>
                        #{order.id}
                      </strong>
                    </td>
                    <td style={{ fontSize: "0.85rem" }} dir="ltr">
                      {order.user || "—"}
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>
                      {order.contact_method === "telegram"
                        ? "✈️ تلگرام"
                        : "📸 اینستاگرام"}
                    </td>
                    <td style={{ fontSize: "0.85rem" }} dir="ltr">
                      @{order.contact_id}
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>
                      {formatPrice(order.total_price)}
                    </td>
                    <td>
                      <StatusBadge order={order} onUpdate={fetchOrders} />
                    </td>
                    <td
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {new Date(order.created_at).toLocaleDateString("fa-IR")}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => navigate(`/orders/${order.id}`)}
                        title="مشاهده جزئیات"
                      >
                        👁️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center p-3">
            <small className="text-muted">
              صفحه {page.toLocaleString("fa-IR")} از{" "}
              {totalPages.toLocaleString("fa-IR")}
            </small>
            <div className="d-flex gap-1">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                قبلی
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                بعدی
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default OrdersPage;