// =============================================================
//  admin-panel/src/pages/ProductsPage.jsx
//  Product list with search, filter, toggle active, delete.
// =============================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

const formatPrice = (p) => Number(p).toLocaleString("fa-IR") + " ت";

function ProductsPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [count, setCount]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // Filters
  const [search, setSearch]           = useState("");
  const [filterType, setFilterType]   = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [page, setPage]               = useState(1);

  const PAGE_SIZE = 10;

  // ── Fetch products ────────────────────────────────────────
  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page };
      if (search)       params.search       = search;
      if (filterType)   params.product_type = filterType;
      if (filterActive !== "") params.is_active = filterActive;

      const res = await api.get("/products/", { params });
      setProducts(res.data.results || []);
      setCount(res.data.count || 0);
    } catch {
      setError("خطا در بارگذاری محصولات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, filterType, filterActive, page]);

  // ── Toggle active status ──────────────────────────────────
  const handleToggleActive = async (product) => {
    try {
      await api.patch(`/products/${product.slug}/`, {
        is_active: !product.is_active,
      });
      fetchProducts();
    } catch {
      alert("خطا در تغییر وضعیت محصول.");
    }
  };

  // ── Delete product ────────────────────────────────────────
  const handleDelete = async (product) => {
    if (
      !window.confirm(
        `آیا از حذف محصول «${product.name}» مطمئن هستید؟`
      )
    )
      return;
    try {
      await api.delete(`/products/${product.slug}/`);
      fetchProducts();
    } catch {
      alert("خطا در حذف محصول.");
    }
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <AdminLayout title="مدیریت محصولات">

      {/* ── Toolbar ───────────────────────────────────────── */}
      <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-4">
        <div className="d-flex gap-2 flex-wrap flex-grow-1">

          {/* Search */}
          <input
            type="search"
            className="form-control"
            style={{ maxWidth: 240 }}
            placeholder="جستجوی محصول..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />

          {/* Type filter */}
          <select
            className="form-select"
            style={{ maxWidth: 150 }}
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
          >
            <option value="">همه انواع</option>
            <option value="ready">آماده</option>
            <option value="custom">سفارشی</option>
          </select>

          {/* Active filter */}
          <select
            className="form-select"
            style={{ maxWidth: 150 }}
            value={filterActive}
            onChange={(e) => { setFilterActive(e.target.value); setPage(1); }}
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="true">فعال</option>
            <option value="false">غیرفعال</option>
          </select>
        </div>

        {/* Add product button */}
        <button
          className="btn btn-primary"
          onClick={() => navigate("/products/new")}
        >
          + افزودن محصول
        </button>
      </div>

      {error && (
        <div className="alert alert-danger mb-3">{error}</div>
      )}

      {/* ── Products table ────────────────────────────────── */}
      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th style={{ width: 60 }}>تصویر</th>
                <th>نام محصول</th>
                <th>دسته‌بندی</th>
                <th>نوع</th>
                <th>قیمت</th>
                <th>موجودی</th>
                <th>وضعیت</th>
                <th style={{ width: 140 }}>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j}>
                        <div
                          className="skeleton"
                          style={{ height: 20 }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    محصولی یافت نشد.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id}>
                    {/* Thumbnail */}
                    <td>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "var(--radius-sm)",
                          overflow: "hidden",
                          backgroundColor: "var(--color-border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.2rem",
                        }}
                      >
                        {p.thumbnail ? (
                          <img
                            src={p.thumbnail}
                            alt={p.name}
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
                    </td>

                    {/* Name */}
                    <td>
                      <span
                        className="fw-semibold"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {p.name}
                      </span>
                    </td>

                    {/* Category */}
                    <td style={{ fontSize: "0.85rem" }}>
                      {p.category_name || "—"}
                    </td>

                    {/* Type */}
                    <td>
                      <span
                        className={`badge ${
                          p.product_type === "custom"
                            ? "bg-warning text-dark"
                            : "bg-success"
                        }`}
                        style={{ fontSize: "0.75rem" }}
                      >
                        {p.product_type === "custom" ? "سفارشی" : "آماده"}
                      </span>
                    </td>

                    {/* Price */}
                    <td style={{ fontSize: "0.85rem" }}>
                      {formatPrice(p.price)}
                    </td>

                    {/* Stock */}
                    <td style={{ fontSize: "0.85rem" }}>
                      <span
                        className={
                          p.stock === 0 ? "text-danger fw-bold" : ""
                        }
                      >
                        {p.stock.toLocaleString("fa-IR")}
                      </span>
                    </td>

                    {/* Active toggle */}
                    <td>
                      <div className="form-check form-switch mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={p.is_active}
                          onChange={() => handleToggleActive(p)}
                          title={p.is_active ? "غیرفعال کردن" : "فعال کردن"}
                        />
                      </div>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() =>
                            navigate(`/products/${p.slug}/edit`)
                          }
                          title="ویرایش"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(p)}
                          title="حذف"
                        >
                          🗑️
                        </button>
                      </div>
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
              {count.toLocaleString("fa-IR")} محصول
            </small>
            <div className="d-flex gap-1">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                قبلی
              </button>
              <span
                className="btn btn-sm btn-primary"
                style={{ pointerEvents: "none" }}
              >
                {page.toLocaleString("fa-IR")}
              </span>
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

export default ProductsPage;