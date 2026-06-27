// =============================================================
//  storefront/src/pages/ProductDetailPage.jsx
//  Full product detail — images, description, specs, add to cart.
// =============================================================

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import api from "../services/api";

const formatPrice = (price) =>
  Number(price).toLocaleString("fa-IR") + " تومان";

// ── Image gallery ─────────────────────────────────────────────
function ImageGallery({ thumbnail, images, name }) {
  const allImages = [
    ...(thumbnail ? [{ id: "thumb", image: thumbnail, alt_text: name }] : []),
    ...(images || []),
  ];

  const [active, setActive] = useState(0);

  if (allImages.length === 0) {
    return (
      <div
        className="d-flex align-items-center justify-content-center rounded"
        style={{
          height: 360,
          backgroundColor: "var(--color-border)",
          fontSize: "5rem",
        }}
      >
        🖨️
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <div
        style={{
          height: 360,
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          backgroundColor: "var(--color-border)",
          marginBottom: "0.75rem",
        }}
      >
        <img
          src={allImages[active].image}
          alt={allImages[active].alt_text || name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="d-flex gap-2 flex-wrap">
          {allImages.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActive(idx)}
              style={{
                width: 72,
                height: 72,
                padding: 0,
                border: `2px solid ${
                  active === idx
                    ? "var(--color-primary)"
                    : "var(--color-border)"
                }`,
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
                cursor: "pointer",
                background: "none",
                flexShrink: 0,
              }}
            >
              <img
                src={img.image}
                alt={img.alt_text || name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────
function ProductDetailSkeleton() {
  return (
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="skeleton" style={{ height: 360, borderRadius: "var(--radius-md)" }} />
          <div className="d-flex gap-2 mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ width: 72, height: 72 }} />
            ))}
          </div>
        </div>
        <div className="col-lg-6">
          <div className="skeleton mb-3" style={{ height: 36, width: "80%" }} />
          <div className="skeleton mb-2" style={{ height: 20, width: "40%" }} />
          <div className="skeleton mb-4" style={{ height: 32, width: "50%" }} />
          <div className="skeleton mb-2" style={{ height: 16, width: "100%" }} />
          <div className="skeleton mb-2" style={{ height: 16, width: "90%" }} />
          <div className="skeleton mb-2" style={{ height: 16, width: "80%" }} />
          <div className="skeleton mt-4" style={{ height: 48, width: "100%" }} />
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
function ProductDetailPage() {
  const { slug }        = useParams();
  const navigate        = useNavigate();
  const { addToCart }   = useCart();

  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding]     = useState(false);
  const [added, setAdded]       = useState(false);

  // ── Fetch product ─────────────────────────────────────────
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/products/${slug}/`);
        setProduct(res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError("محصول مورد نظر یافت نشد.");
        } else {
          setError("خطا در بارگذاری محصول. لطفاً دوباره تلاش کنید.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  // ── Add to cart ───────────────────────────────────────────
  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      console.error("Add to cart error:", err);
    } finally {
      setAdding(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────
  if (loading) return <ProductDetailSkeleton />;

  // ── Error ─────────────────────────────────────────────────
  if (error) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div style={{ fontSize: "4rem" }}>😕</div>
          <h4 className="mt-3 mb-2">{error}</h4>
          <div className="d-flex gap-3 justify-content-center mt-3">
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate(-1)}
            >
              بازگشت
            </button>
            <Link to="/catalog" className="btn btn-primary">
              مشاهده محصولات
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCustom  = product.product_type === "custom";
  const inStock   = product.in_stock;
  const maxQty    = product.stock || 1;

  return (
    <div className="container py-4">

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">خانه</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/catalog">محصولات</Link>
          </li>
          {product.category && (
            <li className="breadcrumb-item">
              <Link to={`/catalog?category_slug=${product.category.slug}`}>
                {product.category.name}
              </Link>
            </li>
          )}
          <li className="breadcrumb-item active" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="row g-4">

        {/* ── Images ──────────────────────────────────── */}
        <div className="col-lg-6">
          <ImageGallery
            thumbnail={product.thumbnail}
            images={product.images}
            name={product.name}
          />
        </div>

        {/* ── Info ────────────────────────────────────── */}
        <div className="col-lg-6">

          {/* Badges */}
          <div className="d-flex gap-2 mb-2 flex-wrap">
            <span
              className={`badge ${
                isCustom ? "bg-warning text-dark" : "bg-success"
              }`}
            >
              {isCustom ? "سفارشی" : "آماده"}
            </span>
            {product.category && (
              <span className="badge bg-secondary">
                {product.category.name}
              </span>
            )}
            {!inStock && (
              <span className="badge bg-danger">ناموجود</span>
            )}
          </div>

          {/* Name */}
          <h2
            className="fw-bold mb-2"
            style={{ color: "var(--color-text)" }}
          >
            {product.name}
          </h2>

          {/* Price */}
          <div className="mb-4">
            <span
              className="fs-3 fw-bold"
              style={{ color: "var(--color-primary)" }}
            >
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-4">
              <h6 className="fw-bold mb-2">توضیحات</h6>
              <p
                style={{
                  color: "var(--color-text-muted)",
                  lineHeight: 1.9,
                  whiteSpace: "pre-line",
                }}
              >
                {product.description}
              </p>
            </div>
          )}

          {/* Stock info */}
          {!isCustom && (
            <div className="mb-4">
              <span
                className={`badge ${inStock ? "bg-success" : "bg-danger"}`}
                style={{ fontSize: "0.85rem" }}
              >
                {inStock
                  ? `${product.stock.toLocaleString("fa-IR")} عدد موجود`
                  : "ناموجود"}
              </span>
            </div>
          )}

          {/* ── Ready-made: quantity + add to cart ─────── */}
          {!isCustom && (
            <div>
              {inStock && (
                <div className="d-flex align-items-center gap-3 mb-3">
                  <span className="fw-semibold">تعداد:</span>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-outline-secondary"
                      style={{ width: 36, height: 36, padding: 0 }}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span
                      className="fw-bold"
                      style={{ minWidth: 32, textAlign: "center" }}
                    >
                      {quantity}
                    </span>
                    <button
                      className="btn btn-outline-secondary"
                      style={{ width: 36, height: 36, padding: 0 }}
                      onClick={() =>
                        setQuantity((q) => Math.min(maxQty, q + 1))
                      }
                      disabled={quantity >= maxQty}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <button
                className={`btn btn-lg w-100 ${
                  added
                    ? "btn-success"
                    : inStock
                    ? "btn-primary"
                    : "btn-secondary"
                }`}
                onClick={handleAddToCart}
                disabled={!inStock || adding || added}
              >
                {adding && (
                  <span className="spinner-border spinner-border-sm me-2" />
                )}
                {added
                  ? "✓ به سبد اضافه شد"
                  : inStock
                  ? "افزودن به سبد خرید"
                  : "ناموجود"}
              </button>

              {added && (
                <div className="d-flex gap-2 mt-2">
                  <Link
                    to="/cart"
                    className="btn btn-outline-primary flex-fill"
                  >
                    مشاهده سبد خرید
                  </Link>
                  <Link
                    to="/checkout"
                    className="btn btn-primary flex-fill"
                  >
                    ثبت سفارش
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ── Custom product: contact notice ──────────── */}
          {isCustom && (
            <div>
              <div
                className="alert alert-warning mb-3"
                style={{ fontSize: "0.9rem", lineHeight: 1.7 }}
              >
                <strong>🎨 محصول سفارشی</strong>
                <br />
                این محصول بر اساس مشخصات شما ساخته می‌شود. برای ثبت
                سفارش و دریافت قیمت نهایی، از طریق تلگرام یا اینستاگرام
                با فروشگاه تماس بگیرید.
              </div>

              <div className="d-flex gap-2">
                <a
                  href="https://t.me/print3d_shop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary flex-fill"
                >
                  ✈️ تلگرام
                </a>
                <a
                  href="https://instagram.com/print3d.shop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary flex-fill"
                >
                  📸 اینستاگرام
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;