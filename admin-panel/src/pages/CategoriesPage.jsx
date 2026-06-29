// =============================================================
//  admin-panel/src/pages/CategoriesPage.jsx
//  Full category CRUD — add, edit, delete, toggle active.
// =============================================================

import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

// ── Category Form (Add / Edit) ────────────────────────────────
function CategoryForm({ initial, categories, onSave, onCancel }) {
  const [form, setForm] = useState({
    name:      initial?.name      || "",
    parent:    initial?.parent    || "",
    icon:      initial?.icon      || "",
    is_active: initial?.is_active ?? true,
    order:     initial?.order     ?? 0,
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

    if (!form.name.trim()) {
      setError("نام دسته‌بندی الزامی است.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name:      form.name.trim(),
        icon:      form.icon.trim(),
        is_active: form.is_active,
        order:     Number(form.order) || 0,
      };
      if (form.parent) payload.parent = form.parent;

      await onSave(payload);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        Object.values(err.response?.data || {})[0]?.[0] ||
        "خطا در ذخیره دسته‌بندی."
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter out the category being edited from parent options
  const parentOptions = categories.filter(
    (c) => !initial || c.id !== initial.id
  );

  return (
    <div className="card p-4 mb-4" style={{ borderColor: "var(--color-primary)", borderWidth: 2 }}>
      <h6 className="fw-bold mb-3">
        {initial ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}
      </h6>

      {error && (
        <div className="alert alert-danger py-2 mb-3">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-3">

          {/* Name */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">
              نام دسته‌بندی <span className="text-danger">*</span>
            </label>
            <input
              name="name"
              type="text"
              className="form-control"
              placeholder="مثال: فیگور"
              value={form.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          {/* Icon */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">
              آیکون (اختیاری)
            </label>
            <input
              name="icon"
              type="text"
              className="form-control"
              placeholder="مثال: 🖨️ یا نام کلاس CSS"
              value={form.icon}
              onChange={handleChange}
            />
          </div>

          {/* Parent */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">
              دسته‌بندی والد
            </label>
            <select
              name="parent"
              className="form-select"
              value={form.parent}
              onChange={handleChange}
            >
              <option value="">بدون والد (دسته اصلی)</option>
              {parentOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Order */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">
              ترتیب نمایش
            </label>
            <input
              name="order"
              type="number"
              className="form-control"
              placeholder="0"
              value={form.order}
              onChange={handleChange}
              min="0"
              dir="ltr"
            />
          </div>

          {/* Active toggle */}
          <div className="col-12">
            <div className="form-check form-switch">
              <input
                id="catActive"
                name="is_active"
                type="checkbox"
                className="form-check-input"
                checked={form.is_active}
                onChange={handleChange}
              />
              <label htmlFor="catActive" className="form-check-label">
                دسته‌بندی فعال باشد
              </label>
            </div>
          </div>

        </div>

        {/* Actions */}
        <div className="d-flex gap-2 mt-3">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading && (
              <span className="spinner-border spinner-border-sm me-2" />
            )}
            {loading ? "در حال ذخیره..." : initial ? "ذخیره تغییرات" : "افزودن"}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main CategoriesPage ───────────────────────────────────────
function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState(null); // category object

  // ── Fetch all categories ──────────────────────────────────
  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/products/categories/", {
        params: { page_size: 100 },
      });
      setCategories(res.data.results || res.data);
    } catch {
      setError("خطا در بارگذاری دسته‌بندی‌ها.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ── Save (create or update) ───────────────────────────────
  const handleSave = async (payload) => {
    if (editing) {
      await api.patch(`/products/categories/${editing.slug}/`, payload);
    } else {
      await api.post("/products/categories/", payload);
    }
    setShowForm(false);
    setEditing(null);
    fetchCategories();
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (cat) => {
    if (
      !window.confirm(
        `آیا از حذف دسته‌بندی «${cat.name}» مطمئن هستید؟\nمحصولات این دسته بدون دسته‌بندی می‌شوند.`
      )
    )
      return;
    try {
      await api.delete(`/products/categories/${cat.slug}/`);
      fetchCategories();
    } catch {
      alert("خطا در حذف دسته‌بندی.");
    }
  };

  // ── Toggle active ─────────────────────────────────────────
  const handleToggleActive = async (cat) => {
    try {
      await api.patch(`/products/categories/${cat.slug}/`, {
        is_active: !cat.is_active,
      });
      fetchCategories();
    } catch {
      alert("خطا در تغییر وضعیت.");
    }
  };

  // ── Start editing ─────────────────────────────────────────
  const handleEdit = (cat) => {
    setEditing(cat);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Cancel form ───────────────────────────────────────────
  const handleCancel = () => {
    setShowForm(false);
    setEditing(null);
  };

  return (
    <AdminLayout title="مدیریت دسته‌بندی‌ها">

      {/* ── Toolbar ───────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
          {categories.length.toLocaleString("fa-IR")} دسته‌بندی
        </p>
        {!showForm && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            + افزودن دسته‌بندی
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger mb-4">{error}</div>
      )}

      {/* ── Add / Edit form ───────────────────────────────── */}
      {showForm && (
        <CategoryForm
          initial={editing}
          categories={categories}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* ── Categories table ──────────────────────────────── */}
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>نام</th>
                <th>آیکون</th>
                <th>والد</th>
                <th>ترتیب</th>
                <th>محصولات</th>
                <th>وضعیت</th>
                <th style={{ width: 120 }}>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j}>
                        <div className="skeleton" style={{ height: 20 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    هیچ دسته‌بندی‌ای وجود ندارد.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => {
                  const parentName = cat.parent
                    ? categories.find((c) => c.id === cat.parent)?.name || "—"
                    : "—";

                  return (
                    <tr key={cat.id}>
                      {/* Name */}
                      <td>
                        <span
                          className="fw-semibold"
                          style={{ fontSize: "0.9rem" }}
                        >
                          {cat.name}
                        </span>
                      </td>

                      {/* Icon */}
                      <td style={{ fontSize: "1.2rem" }}>
                        {cat.icon || "—"}
                      </td>

                      {/* Parent */}
                      <td style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                        {parentName}
                      </td>

                      {/* Order */}
                      <td style={{ fontSize: "0.85rem" }}>
                        {cat.order ?? 0}
                      </td>

                      {/* Product count */}
                      <td style={{ fontSize: "0.85rem" }}>
                        <span className="badge bg-secondary">
                          {(cat.product_count ?? 0).toLocaleString("fa-IR")}
                        </span>
                      </td>

                      {/* Active toggle */}
                      <td>
                        <div className="form-check form-switch mb-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={cat.is_active}
                            onChange={() => handleToggleActive(cat)}
                            title={cat.is_active ? "غیرفعال کردن" : "فعال کردن"}
                          />
                        </div>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(cat)}
                            title="ویرایش"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(cat)}
                            title="حذف"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Note ─────────────────────────────────────────── */}
      <div
        className="alert alert-info mt-4"
        style={{ fontSize: "0.85rem" }}
      >
        💡 حذف یک دسته‌بندی باعث حذف محصولات نمی‌شود — محصولات فقط بدون
        دسته‌بندی می‌شوند.
      </div>

    </AdminLayout>
  );
}

export default CategoriesPage;