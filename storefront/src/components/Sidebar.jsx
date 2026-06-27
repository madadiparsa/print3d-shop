// =============================================================
//  storefront/src/components/Sidebar.jsx
//  Filtering sidebar — categories, price range, stock, type.
//  Filled with real data in Phase 6.
// =============================================================

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

function Sidebar({ onClose }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate                        = useNavigate();

  // ── Filter state ──────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category_slug") || ""
  );
  const [minPrice, setMinPrice] = useState(
    searchParams.get("min_price") || ""
  );
  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("max_price") || ""
  );
  const [inStock, setInStock] = useState(
    searchParams.get("in_stock") === "true"
  );
  const [productType, setProductType] = useState(
    searchParams.get("product_type") || ""
  );

  // ── Fetch categories ──────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/products/categories/tree/");
        setCategories(res.data);
      } catch (err) {
        console.error("Category fetch error:", err);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCategories();
  }, []);

  // ── Apply filters ─────────────────────────────────────────
  const applyFilters = () => {
    const params = {};
    if (selectedCategory) params.category_slug = selectedCategory;
    if (minPrice)         params.min_price      = minPrice;
    if (maxPrice)         params.max_price      = maxPrice;
    if (inStock)          params.in_stock        = "true";
    if (productType)      params.product_type    = productType;

    // Navigate to catalog with filters as query params
    navigate({ pathname: "/catalog", search: new URLSearchParams(params).toString() });

    // Close sidebar on mobile after applying
    if (onClose) onClose();
  };

  // ── Reset filters ─────────────────────────────────────────
  const resetFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    setProductType("");
    navigate("/catalog");
    if (onClose) onClose();
  };

  return (
    <aside
      className="sidebar p-3"
      style={{ minHeight: "100%", overflowY: "auto" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0">فیلتر محصولات</h6>
        {onClose && (
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={onClose}
            aria-label="بستن"
          >
            ✕
          </button>
        )}
      </div>

      <div className="divider" />

      {/* ── Categories ───────────────────────────────────── */}
      <div className="mb-4">
        <h6 className="fw-semibold mb-2 text-muted" style={{ fontSize: "0.8rem" }}>
          دسته‌بندی
        </h6>

        {loadingCats ? (
          <>
            <div className="skeleton mb-2" style={{ height: 20, width: "80%" }} />
            <div className="skeleton mb-2" style={{ height: 20, width: "60%" }} />
            <div className="skeleton mb-2" style={{ height: 20, width: "70%" }} />
          </>
        ) : (
          <ul className="list-unstyled mb-0">
            {/* All categories option */}
            <li className="mb-1">
              <button
                className={`btn btn-sm w-100 text-end ${
                  selectedCategory === ""
                    ? "btn-primary"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setSelectedCategory("")}
              >
                همه محصولات
              </button>
            </li>

            {categories.map((cat) => (
              <li key={cat.id} className="mb-1">
                {/* Parent category */}
                <button
                  className={`btn btn-sm w-100 text-end ${
                    selectedCategory === cat.slug
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => setSelectedCategory(cat.slug)}
                >
                  {cat.icon && <span className="me-1">{cat.icon}</span>}
                  {cat.name}
                  <span
                    className="badge bg-secondary ms-1"
                    style={{ fontSize: "0.65rem" }}
                  >
                    {cat.product_count}
                  </span>
                </button>

                {/* Child categories */}
                {cat.children && cat.children.length > 0 && (
                  <ul className="list-unstyled me-3 mt-1">
                    {cat.children.map((child) => (
                      <li key={child.id} className="mb-1">
                        <button
                          className={`btn btn-sm w-100 text-end ${
                            selectedCategory === child.slug
                              ? "btn-primary"
                              : "btn-outline-secondary"
                          }`}
                          style={{ fontSize: "0.8rem" }}
                          onClick={() => setSelectedCategory(child.slug)}
                        >
                          {child.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="divider" />

      {/* ── Price range ──────────────────────────────────── */}
      <div className="mb-4">
        <h6 className="fw-semibold mb-2 text-muted" style={{ fontSize: "0.8rem" }}>
          محدوده قیمت (تومان)
        </h6>
        <div className="row g-2">
          <div className="col-6">
            <input
              type="number"
              className="form-control form-control-sm"
              placeholder="از"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min="0"
            />
          </div>
          <div className="col-6">
            <input
              type="number"
              className="form-control form-control-sm"
              placeholder="تا"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* ── Stock ────────────────────────────────────────── */}
      <div className="mb-4">
        <h6 className="fw-semibold mb-2 text-muted" style={{ fontSize: "0.8rem" }}>
          موجودی
        </h6>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="inStockCheck"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="inStockCheck">
            فقط محصولات موجود
          </label>
        </div>
      </div>

      <div className="divider" />

      {/* ── Product type ─────────────────────────────────── */}
      <div className="mb-4">
        <h6 className="fw-semibold mb-2 text-muted" style={{ fontSize: "0.8rem" }}>
          نوع محصول
        </h6>
        <div className="d-flex gap-2 flex-column">
          {[
            { value: "",       label: "همه" },
            { value: "ready",  label: "آماده" },
            { value: "custom", label: "سفارشی" },
          ].map((opt) => (
            <button
              key={opt.value}
              className={`btn btn-sm ${
                productType === opt.value
                  ? "btn-primary"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setProductType(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* ── Actions ──────────────────────────────────────── */}
      <div className="d-flex gap-2 flex-column">
        <button
          className="btn btn-primary w-100"
          onClick={applyFilters}
        >
          اعمال فیلتر
        </button>
        <button
          className="btn btn-outline-secondary w-100"
          onClick={resetFilters}
        >
          حذف فیلترها
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;