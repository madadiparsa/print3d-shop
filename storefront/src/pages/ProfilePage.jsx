// =============================================================
//  storefront/src/pages/ProfilePage.jsx
//  User profile — edit full name, manage delivery addresses,
//  view order history.
// =============================================================

import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

// ── Helpers ───────────────────────────────────────────────────
const formatPrice = (price) =>
  Number(price).toLocaleString("fa-IR") + " تومان";

const STATUS_MAP = {
  pending:      { label: "در انتظار تایید", color: "warning" },
  confirmed:    { label: "تایید شده",       color: "info"    },
  in_production:{ label: "در حال تولید",    color: "primary" },
  shipped:      { label: "ارسال شده",        color: "success" },
  delivered:    { label: "تحویل داده شده",   color: "success" },
  cancelled:    { label: "لغو شده",          color: "danger"  },
};

// =============================================================
//  Sub-component: Profile Info
// =============================================================
function ProfileInfo({ user, onUpdate }) {
  const [fullName, setFullName]   = useState(user.full_name || "");
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await onUpdate({ full_name: fullName });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("خطا در بروزرسانی پروفایل.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 mb-4">
      <h5 className="fw-bold mb-4">اطلاعات حساب</h5>

      <div className="mb-3">
        <label className="form-label text-muted" style={{ fontSize: "0.85rem" }}>
          شماره موبایل
        </label>
        <input
          type="text"
          className="form-control"
          value={user.phone}
          disabled
          dir="ltr"
        />
        <div className="form-text">شماره موبایل قابل تغییر نیست.</div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="fullName" className="form-label fw-semibold">
            نام کامل
          </label>
          <input
            id="fullName"
            type="text"
            className="form-control"
            placeholder="نام و نام خانوادگی"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        {error   && <div className="alert alert-danger py-2">{error}</div>}
        {success && <div className="alert alert-success py-2">پروفایل با موفقیت بروزرسانی شد.</div>}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading && (
            <span className="spinner-border spinner-border-sm me-2" />
          )}
          ذخیره تغییرات
        </button>
      </form>
    </div>
  );
}

// =============================================================
//  Sub-component: Address Card
// =============================================================
function AddressCard({ address, onDelete, onSetDefault }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("آیا از حذف این آدرس مطمئن هستید؟")) return;
    setDeleting(true);
    try {
      await onDelete(address.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={`card p-3 mb-3 ${
        address.is_default ? "border-primary" : ""
      }`}
    >
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <strong>{address.title}</strong>
            {address.is_default && (
              <span className="badge bg-primary" style={{ fontSize: "0.7rem" }}>
                پیش‌فرض
              </span>
            )}
          </div>
          <p className="text-muted mb-1" style={{ fontSize: "0.9rem" }}>
            {address.province}، {address.city}
          </p>
          <p className="mb-1" style={{ fontSize: "0.85rem" }}>
            {address.address_line}
          </p>
          <p className="text-muted" style={{ fontSize: "0.8rem" }}>
            کد پستی: {address.postal_code}
          </p>
        </div>

        <div className="d-flex flex-column gap-1">
          {!address.is_default && (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => onSetDefault(address.id)}
              style={{ fontSize: "0.75rem" }}
            >
              پیش‌فرض
            </button>
          )}
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleDelete}
            disabled={deleting}
            style={{ fontSize: "0.75rem" }}
          >
            {deleting ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              "حذف"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================
//  Sub-component: Address Form
// =============================================================
function AddressForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    title: "",
    province: "",
    city: "",
    address_line: "",
    postal_code: "",
    is_default: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.postal_code.length !== 10 || !/^\d+$/.test(form.postal_code)) {
      setError("کد پستی باید ۱۰ رقم عددی باشد.");
      return;
    }

    setLoading(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        Object.values(err.response?.data || {})[0]?.[0] ||
        "خطا در ذخیره آدرس."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 mb-3 border-primary">
      <h6 className="fw-bold mb-3">افزودن آدرس جدید</h6>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label">عنوان آدرس</label>
            <input
              name="title"
              type="text"
              className="form-control"
              placeholder="مثال: خانه، محل کار"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">استان</label>
            <input
              name="province"
              type="text"
              className="form-control"
              placeholder="تهران"
              value={form.province}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">شهر</label>
            <input
              name="city"
              type="text"
              className="form-control"
              placeholder="تهران"
              value={form.city}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label">آدرس کامل</label>
            <textarea
              name="address_line"
              className="form-control"
              rows={2}
              placeholder="خیابان، کوچه، پلاک، واحد"
              value={form.address_line}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">کد پستی</label>
            <input
              name="postal_code"
              type="text"
              className="form-control"
              placeholder="۱۰ رقم"
              value={form.postal_code}
              onChange={handleChange}
              maxLength={10}
              dir="ltr"
              required
            />
          </div>

          <div className="col-md-6 d-flex align-items-end">
            <div className="form-check">
              <input
                id="isDefault"
                name="is_default"
                type="checkbox"
                className="form-check-input"
                checked={form.is_default}
                onChange={handleChange}
              />
              <label htmlFor="isDefault" className="form-check-label">
                تنظیم به عنوان پیش‌فرض
              </label>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2 mt-3">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading && (
              <span className="spinner-border spinner-border-sm me-2" />
            )}
            ذخیره آدرس
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancel}
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}

// =============================================================
//  Sub-component: Orders List
// =============================================================
function OrdersList() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/");
        setOrders(res.data.results || res.data);
      } catch {
        // Silent fail — orders section is non-critical
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="card p-4">
        <h5 className="fw-bold mb-4">سفارش‌های من</h5>
        {[1, 2].map((i) => (
          <div key={i} className="skeleton mb-3" style={{ height: 80 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h5 className="fw-bold mb-4">سفارش‌های من</h5>

      {orders.length === 0 ? (
        <div className="text-center py-4">
          <div style={{ fontSize: "2.5rem" }}>📦</div>
          <p className="text-muted mt-2">هنوز سفارشی ثبت نکرده‌اید.</p>
        </div>
      ) : (
        orders.map((order) => {
          const status = STATUS_MAP[order.status] || {
            label: order.status,
            color: "secondary",
          };
          return (
            <div key={order.id} className="card p-3 mb-3">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <strong>سفارش #{order.id}</strong>
                    <span className={`badge bg-${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                    {order.items?.length || 0} محصول
                  </p>
                  <p className="text-muted" style={{ fontSize: "0.8rem" }}>
                    {new Date(order.created_at).toLocaleDateString("fa-IR")}
                  </p>
                </div>
                <strong style={{ color: "var(--color-primary)" }}>
                  {formatPrice(order.total_price)}
                </strong>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// =============================================================
//  Main ProfilePage
// =============================================================
function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [addresses, setAddresses]     = useState([]);
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [showForm, setShowForm]       = useState(false);

  // ── Fetch addresses ───────────────────────────────────────
  const fetchAddresses = async () => {
    setLoadingAddr(true);
    try {
      const res = await api.get("/auth/addresses/");
      setAddresses(res.data);
    } catch {
      // Silent fail
    } finally {
      setLoadingAddr(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // ── Address handlers ──────────────────────────────────────
  const handleSaveAddress = async (form) => {
    await api.post("/auth/addresses/", form);
    setShowForm(false);
    fetchAddresses();
  };

  const handleDeleteAddress = async (id) => {
    await api.delete(`/auth/addresses/${id}/`);
    fetchAddresses();
  };

  const handleSetDefault = async (id) => {
    await api.patch(`/auth/addresses/${id}/`, { is_default: true });
    fetchAddresses();
  };

  return (
    <div className="container py-4">
      <h4 className="fw-bold mb-4">پروفایل من</h4>

      <div className="row g-4">

        {/* ── Right column: profile info + addresses ─── */}
        <div className="col-lg-7">

          {/* Profile info */}
          <ProfileInfo user={user} onUpdate={updateProfile} />

          {/* Addresses */}
          <div className="card p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">آدرس‌های من</h5>
              {!showForm && (
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowForm(true)}
                >
                  + افزودن آدرس
                </button>
              )}
            </div>

            {/* Add address form */}
            {showForm && (
              <AddressForm
                onSave={handleSaveAddress}
                onCancel={() => setShowForm(false)}
              />
            )}

            {/* Address list */}
            {loadingAddr ? (
              <div className="skeleton" style={{ height: 80 }} />
            ) : addresses.length === 0 && !showForm ? (
              <div className="text-center py-3">
                <p className="text-muted">هنوز آدرسی اضافه نکرده‌اید.</p>
              </div>
            ) : (
              addresses.map((addr) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  onDelete={handleDeleteAddress}
                  onSetDefault={handleSetDefault}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Left column: orders ───────────────────── */}
        <div className="col-lg-5">
          <OrdersList />
        </div>

      </div>
    </div>
  );
}

export default ProfilePage;