// =============================================================
//  admin-panel/src/pages/ProductFormPage.jsx
//  Add new product or edit existing one.
//  Route: /products/new  OR  /products/:slug/edit
// =============================================================

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

function ProductFormPage() {
  const { slug }  = useParams();   // undefined when creating new
  const navigate  = useNavigate();
  const isEditing = Boolean(slug);

  // ── Form state ────────────────────────────────────────────
  const [form, setForm] = useState({
    name:         "",
    category:     "",
    product_type: "ready",
    description:  "",
    price:        "",
    stock:        "0",
    is_active:    true,
  });

  const [thumbnail, setThumbnail]     = useState(null);   // File object
  const [preview, setPreview]         = useState(null);   // Data URL
  const [currentThumb, setCurrentThumb] = useState(null); // Existing URL

  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(false);
  const [fetching, setFetching]       = useState(isEditing);
  const [error, setError]             = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Fetch categories ──────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/products/categories/");
        setCategories(res.data.results || res.data);
      } catch {
        // Non-critical — category field will be empty
      }
    };
    fetchCategories();
  }, []);

  // ── Fetch existing product for editing ────────────────────
  useEffect(() => {
    if (!isEditing) return;

    const fetchProduct = async () => {
      setFetching(true);
      try {
        const res = await api.get(`/products/${slug}/`);
        const p   = res.data;
        setForm({
          name:         p.name         || "",
          category:     p.category?.id || "",
          product_type: p.product_type || "ready",
          description:  p.description  || "",
          price:        p.price        || "",
          stock:        p.stock        ?? "0",
          is_active:    p.is_active    ?? true,
        });
        setCurrentThumb(p.thumbnail || null);
      } catch {
        setError("خطا در بارگذاری اطلاعات محصول.");
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [slug, isEditing]);

  // ── Field change handler ──────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear field error on change
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ── Thumbnail change ──────────────────────────────────────
  const handleThumbnail = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
    setThumbnail(file);
  };

  // ── Client-side validation ────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name.trim())    errs.name  = "نام محصول الزامی است.";
    if (!form.price)          errs.price = "قیمت الزامی است.";
    if (Number(form.price) < 0) errs.price = "قیمت نمی‌تواند منفی باشد.";
    if (Number(form.stock) < 0) errs.stock = "موجودی نمی‌تواند منفی باشد.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      // Use FormData so image upload works
      const data = new FormData();
      data.append("name",         form.name.trim());
      data.append("product_type", form.product_type);
      data.append("description",  form.description.trim());
      data.append("price",        form.price);
      data.append("stock",        form.stock);
      data.append("is_active",    form.is_active);
      if (form.category) data.append("category", form.category);
      if (thumbnail)     data.append("thumbnail", thumbnail);

      if (isEditing) {
        await api.patch(`/products/${slug}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/products/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate("/products");
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        // Map DRF field errors
        const errs = {};
        Object.entries(data).forEach(([key, val]) => {
          errs[key] = Array.isArray(val) ? val[0] : val;
        });
        setFieldErrors(errs);
        setError("لطفاً خطاهای فرم را برطرف کنید.");
      } else {
        setError("خطا در ذخیره محصول. لطفاً دوباره تلاش کنید.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Loading skeleton ──────────────────────────────────────
  if (fetching) {
    return (
      <AdminLayout title={isEditing ? "ویرایش محصول" : "افزودن محصول"}>
        <div className="card p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="skeleton mb-3"
              style={{ height: 48 }}
            />
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEditing ? "ویرایش محصول" : "افزودن محصول"}>
      <div className="row justify-content-center">
        <div className="col-xl-9">
          <form onSubmit={handleSubmit}>

            {error && (
              <div className="alert alert-danger mb-4">{error}</div>
            )}

            <div className="row g-4">

              {/* ── Left column: main info ──────────────── */}
              <div className="col-lg-8">

                {/* Basic info card */}
                <div className="card p-4 mb-4">
                  <h6 className="fw-bold mb-3">اطلاعات اصلی</h6>

                  {/* Name */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      نام محصول <span className="text-danger">*</span>
                    </label>
                    <input
                      name="name"
                      type="text"
                      className={`form-control ${
                        fieldErrors.name ? "is-invalid" : ""
                      }`}
                      placeholder="نام محصول را وارد کنید"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                    {fieldErrors.name && (
                      <div className="invalid-feedback">
                        {fieldErrors.name}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      توضیحات
                    </label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows={4}
                      placeholder="توضیحات کامل محصول..."
                      value={form.description}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Pricing card */}
                <div className="card p-4 mb-4">
                  <h6 className="fw-bold mb-3">قیمت و موجودی</h6>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        قیمت (تومان) <span className="text-danger">*</span>
                      </label>
                      <input
                        name="price"
                        type="number"
                        className={`form-control ${
                          fieldErrors.price ? "is-invalid" : ""
                        }`}
                        placeholder="0"
                        value={form.price}
                        onChange={handleChange}
                        min="0"
                        dir="ltr"
                        required
                      />
                      {fieldErrors.price && (
                        <div className="invalid-feedback">
                          {fieldErrors.price}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        موجودی
                      </label>
                      <input
                        name="stock"
                        type="number"
                        className={`form-control ${
                          fieldErrors.stock ? "is-invalid" : ""
                        }`}
                        placeholder="0"
                        value={form.stock}
                        onChange={handleChange}
                        min="0"
                        dir="ltr"
                      />
                      {fieldErrors.stock && (
                        <div className="invalid-feedback">
                          {fieldErrors.stock}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* ── Right column: meta ──────────────────── */}
              <div className="col-lg-4">

                {/* Thumbnail card */}
                <div className="card p-4 mb-4">
                  <h6 className="fw-bold mb-3">تصویر اصلی</h6>

                  {/* Preview */}
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden",
                      backgroundColor: "var(--color-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "3rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {preview || currentThumb ? (
                      <img
                        src={preview || currentThumb}
                        alt="پیش‌نمایش"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      "🖨️"
                    )}
                  </div>

                  <input
                    type="file"
                    className="form-control form-control-sm"
                    accept="image/*"
                    onChange={handleThumbnail}
                  />
                  <div className="form-text">
                    JPG، PNG یا WebP — حداکثر ۵ مگابایت
                  </div>
                </div>

                {/* Category & type card */}
                <div className="card p-4 mb-4">
                  <h6 className="fw-bold mb-3">دسته‌بندی و نوع</h6>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      دسته‌بندی
                    </label>
                    <select
                      name="category"
                      className="form-select"
                      value={form.category}
                      onChange={handleChange}
                    >
                      <option value="">بدون دسته‌بندی</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      نوع محصول
                    </label>
                    <select
                      name="product_type"
                      className="form-select"
                      value={form.product_type}
                      onChange={handleChange}
                    >
                      <option value="ready">آماده</option>
                      <option value="custom">سفارشی</option>
                    </select>
                  </div>

                  {/* Active toggle */}
                  <div className="form-check form-switch">
                    <input
                      id="isActive"
                      name="is_active"
                      type="checkbox"
                      className="form-check-input"
                      checked={form.is_active}
                      onChange={handleChange}
                    />
                    <label
                      htmlFor="isActive"
                      className="form-check-label fw-semibold"
                    >
                      محصول فعال باشد
                    </label>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Actions ─────────────────────────────────── */}
            <div className="d-flex gap-3 mt-2">
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={loading}
              >
                {loading && (
                  <span className="spinner-border spinner-border-sm me-2" />
                )}
                {loading
                  ? "در حال ذخیره..."
                  : isEditing
                  ? "ذخیره تغییرات"
                  : "افزودن محصول"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={() => navigate("/products")}
                disabled={loading}
              >
                انصراف
              </button>
            </div>

          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

export default ProductFormPage;