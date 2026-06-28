// =============================================================
//  admin-panel/src/pages/DashboardPage.jsx
//  Overview dashboard with stat cards and recent orders.
// =============================================================

import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

// ── Stat card component ───────────────────────────────────────
function StatCard({ icon, label, value, loading, color = "var(--color-primary)" }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      {loading ? (
        <div className="skeleton mt-1" style={{ height: 36, width: "60%" }} />
      ) : (
        <div className="stat-value" style={{ color }}>
          {value}
        </div>
      )}
      <div className="stat-label mt-1">{label}</div>
    </div>
  );
}

// ── Recent orders table ───────────────────────────────────────
const STATUS_MAP = {
  pending:       { label: "در انتظار",    color: "warning" },
  confirmed:     { label: "تایید شده",    color: "info"    },
  in_production: { label: "در تولید",     color: "primary" },
  shipped:       { label: "ارسال شده",    color: "success" },
  delivered:     { label: "تحویل داده",   color: "success" },
  cancelled:     { label: "لغو شده",      color: "danger"  },
};

function RecentOrders({ orders, loading }) {
  if (loading) {
    return (
      <div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="skeleton mb-2"
            style={{ height: 48 }}
          />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-4">
        <div style={{ fontSize: "2rem" }}>📦</div>
        <p className="text-muted mt-2 mb-0">هنوز سفارشی ثبت نشده.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover mb-0">
        <thead>
          <tr>
            <th style={{ fontSize: "0.85rem" }}>#</th>
            <th style={{ fontSize: "0.85rem" }}>کاربر</th>
            <th style={{ fontSize: "0.85rem" }}>روش تماس</th>
            <th style={{ fontSize: "0.85rem" }}>مبلغ</th>
            <th style={{ fontSize: "0.85rem" }}>وضعیت</th>
            <th style={{ fontSize: "0.85rem" }}>تاریخ</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const status = STATUS_MAP[order.status] || {
              label: order.status,
              color: "secondary",
            };
            return (
              <tr key={order.id}>
                <td style={{ fontSize: "0.85rem" }}>
                  <strong>#{order.id}</strong>
                </td>
                <td style={{ fontSize: "0.85rem" }}>
                  {order.user || "—"}
                </td>
                <td style={{ fontSize: "0.85rem" }}>
                  {order.contact_method === "telegram"
                    ? "✈️ تلگرام"
                    : "📸 اینستاگرام"}
                </td>
                <td style={{ fontSize: "0.85rem" }}>
                  {Number(order.total_price).toLocaleString("fa-IR")} ت
                </td>
                <td>
                  <span
                    className={`badge bg-${status.color}`}
                    style={{ fontSize: "0.75rem" }}
                  >
                    {status.label}
                  </span>
                </td>
                <td style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                  {new Date(order.created_at).toLocaleDateString("fa-IR")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main DashboardPage ────────────────────────────────────────
function DashboardPage() {
  const [stats, setStats]     = useState(null);
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch orders list (staff sees all)
        const ordersRes = await api.get("/orders/");
        const allOrders = ordersRes.data.results || ordersRes.data;

        // Fetch products count
        const productsRes = await api.get("/products/");
        const productCount = productsRes.data.count ?? productsRes.data.length;

        // Fetch messages
        const messagesRes = await api.get("/orders/contact/").catch(() => ({
          data: { count: 0, results: [] },
        }));
        const messageCount =
          messagesRes.data.count ?? messagesRes.data.length ?? 0;

        // Build stats
        const pendingCount = allOrders.filter(
          (o) => o.status === "pending"
        ).length;

        setStats({
          totalOrders:   allOrders.length,
          pendingOrders: pendingCount,
          totalProducts: productCount,
          totalMessages: messageCount,
        });

        // Show 5 most recent orders
        setOrders(allOrders.slice(0, 5));
      } catch (err) {
        setError("خطا در بارگذاری داده‌ها.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <AdminLayout title="داشبورد">

      {error && (
        <div className="alert alert-danger mb-4">{error}</div>
      )}

      {/* ── Stat cards ──────────────────────────────────── */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard
            icon="📦"
            label="کل سفارش‌ها"
            value={stats?.totalOrders?.toLocaleString("fa-IR")}
            loading={loading}
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard
            icon="⏳"
            label="در انتظار تایید"
            value={stats?.pendingOrders?.toLocaleString("fa-IR")}
            loading={loading}
            color="#f59e0b"
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard
            icon="🖨️"
            label="محصولات فعال"
            value={stats?.totalProducts?.toLocaleString("fa-IR")}
            loading={loading}
            color="#10b981"
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard
            icon="✉️"
            label="پیام‌های دریافتی"
            value={stats?.totalMessages?.toLocaleString("fa-IR")}
            loading={loading}
            color="#3b82f6"
          />
        </div>
      </div>

      {/* ── Recent orders ────────────────────────────────── */}
      <div className="card p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="fw-bold mb-0">آخرین سفارش‌ها</h6>
          <a
            href="/orders"
            className="btn btn-sm btn-outline-primary"
            style={{ fontSize: "0.8rem" }}
          >
            مشاهده همه
          </a>
        </div>
        <RecentOrders orders={orders} loading={loading} />
      </div>

    </AdminLayout>
  );
}

export default DashboardPage;