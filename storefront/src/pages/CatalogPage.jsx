// =============================================================
//  storefront/src/pages/CatalogPage.jsx
//  Product catalog with live search, filtering and pagination.
// =============================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Pagination from "../components/Pagination";
import ProductCard, { ProductCardSkeleton } from "../components/ProductCard";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const PAGE_SIZE = 12;

// ── Debounce hook ─────────────────────────────────────────────
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Read filters from URL ─────────────────────────────────
  const urlSearch      = searchParams.get("search")        || "";
  const urlCategory    = searchParams.get("category_slug") || "";
  const urlMinPrice    = searchParams.get("min_price")     || "";
  const urlMaxPrice    = searchParams.get("max_price")     || "";
  const urlInStock     = searchParams.get("in_stock")      === "true";
  const urlProductType = searchParams.get("product_type")  || "";
  const urlPage        = parseInt(searchParams.get("page") || "1", 10);

  // ── Local state ───────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [count, setCount]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  // Debounce the search query so we don't hit API on every keystroke
  const debouncedSearch = useDebounce(urlSearch, 400);

  // ── Build API params from URL state ───────────────────────
  const apiParams = useMemo(() => {
    const params = { page: urlPage };
    if (debouncedSearch) params.search        = debouncedSearch;
    if (urlCategory)     params.category_slug = urlCategory;
    if (urlMinPrice)     params.min_price      = urlMinPrice;
    if (urlMaxPrice)     params.max_price      = urlMaxPrice;
    if (urlInStock)      params.in_stock        = "true";
    if (urlProductType)  params.product_type    = urlProductType;
    return params;
  }, [
    debouncedSearch,
    urlCategory,
    urlMinPrice,
    urlMaxPrice,
    urlInStock,
    urlProductType,
    urlPage,
  ]);

  // ── Fetch products ────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/products/", { params: apiParams });
      setProducts(res.data.results);
      setCount(res.data.count);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "خطا در بارگذاری محصولات. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setLoading(false);
    }
  }, [apiParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (urlPage !== 1) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("page", "1");
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch,
    urlCategory,
    urlMinPrice,
    urlMaxPrice,
    urlInStock,
    urlProductType,
  ]);

  // ── Handlers ──────────────────────────────────────────────
  const handlePageChange = (page) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(page));
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Active filter count (for badge on mobile button) ─────
  const activeFilterCount = [
    urlCategory,
    urlMinPrice,
    urlMaxPrice,
    urlInStock,
    urlProductType,
  ].filter(Boolean).length;

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="container-fluid px-3 py-4">
      <div className="row g-0">

        {/* ── Desktop Sidebar ──────────────────────────── */}
        <div
          className="col-lg-3 col-xl-2 d-none d-lg-block"
          style={{ minHeight: "calc(100vh - var(--navbar-height))" }}
        >
          <div className="sticky-top" style={{ top: "calc(var(--navbar-height) + 1rem)" }}>
            <Sidebar />
          </div>
        </div>

        {/* ── Mobile Sidebar Drawer ────────────────────── */}
        {showSidebar && (
          <div
            className="d-lg-none"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1050,
              display: "flex",
            }}
          >
            {/* Backdrop */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
              onClick={() => setShowSidebar(false)}
            />
            {/* Drawer panel — slides in from right (RTL) */}
            <div
              style={{
                position: "relative",
                width: "280px",
                marginRight: "auto",
                height: "100%",
                overflowY: "auto",
                zIndex: 1,
              }}
            >
              <Sidebar onClose={() => setShowSidebar(false)} />
            </div>
          </div>
        )}

        {/* ── Main content ─────────────────────────────── */}
        <div className="col-lg-9 col-xl-10 px-lg-3">

          {/* Header row */}
          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
            <div>
              <h4 className="fw-bold mb-0" style={{ color: "var(--color-text)" }}>
                محصولات
              </h4>
              {!loading && (
                <small className="text-muted">
                  {count.toLocaleString("fa-IR")} محصول
                </small>
              )}
            </div>

            {/* Mobile filter button */}
            <button
              className="btn btn-outline-primary d-lg-none position-relative"
              onClick={() => setShowSidebar(true)}
            >
              🎛️ فیلتر
              {activeFilterCount > 0 && (
                <span
                  className="position-absolute top-0 start-0 translate-middle badge rounded-pill bg-primary"
                  style={{ fontSize: "0.65rem" }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* ── Error state ────────────────────────────── */}
          {error && (
            <div className="alert alert-danger text-center" role="alert">
              {error}
              <button
                className="btn btn-sm btn-outline-danger me-2"
                onClick={fetchProducts}
              >
                تلاش مجدد
              </button>
            </div>
          )}

          {/* ── Loading skeletons ───────────────────────── */}
          {loading && (
            <div className="row g-3">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="col-6 col-md-4 col-xl-3">
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          )}

          {/* ── Empty state ─────────────────────────────── */}
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-5">
              <div style={{ fontSize: "4rem" }}>🔍</div>
              <h5 className="mt-3 mb-2">محصولی یافت نشد</h5>
              <p className="text-muted">
                فیلترها یا عبارت جستجو را تغییر دهید.
              </p>
            </div>
          )}

          {/* ── Product grid ────────────────────────────── */}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="row g-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="col-6 col-md-4 col-xl-3"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                count={count}
                pageSize={PAGE_SIZE}
                currentPage={urlPage}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CatalogPage;