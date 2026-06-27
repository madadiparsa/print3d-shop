// =============================================================
//  storefront/src/components/ProductCard.jsx
//  Displays a single product in the catalog grid.
// =============================================================

import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

// ── Price formatter ───────────────────────────────────────────
const formatPrice = (price) =>
  Number(price).toLocaleString("fa-IR") + " تومان";

function ProductCard({ product }) {
  const navigate        = useNavigate();
  const { addToCart }   = useCart();

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // prevent navigating to detail page
    try {
      await addToCart(product, 1);
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  };

  const handleCardClick = () => {
    navigate(`/products/${product.slug}`);
  };

  return (
    <div
      className="card product-card h-100"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
    >
      {/* ── Thumbnail ───────────────────────────────────── */}
      <div
        style={{
          height: 200,
          overflow: "hidden",
          borderRadius: "var(--radius-md) var(--radius-md) 0 0",
          backgroundColor: "var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: "3rem" }}>🖨️</span>
        )}
      </div>

      {/* ── Body ────────────────────────────────────────── */}
      <div className="card-body d-flex flex-column">

        {/* Type + category badges */}
        <div className="d-flex gap-1 mb-2 flex-wrap">
          <span
            className={`badge badge-type ${
              product.product_type === "custom"
                ? "bg-warning text-dark"
                : "bg-success"
            }`}
          >
            {product.product_type === "custom" ? "سفارشی" : "آماده"}
          </span>
          {product.category_name && (
            <span className="badge bg-secondary badge-type">
              {product.category_name}
            </span>
          )}
        </div>

        {/* Name */}
        <h6
          className="card-title fw-bold mb-2"
          style={{
            color: "var(--color-text)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.name}
        </h6>

        {/* Price */}
        <p
          className="fw-bold mb-3 mt-auto"
          style={{ color: "var(--color-primary)" }}
        >
          {formatPrice(product.price)}
        </p>

        {/* Stock status + Add to cart */}
        {product.in_stock ? (
          <button
            className="btn btn-primary btn-sm w-100"
            onClick={handleAddToCart}
          >
            افزودن به سبد خرید
          </button>
        ) : (
          <button
            className="btn btn-outline-secondary btn-sm w-100"
            disabled
          >
            ناموجود
          </button>
        )}
      </div>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <div className="card h-100">
      <div
        className="skeleton"
        style={{ height: 200, borderRadius: "var(--radius-md) var(--radius-md) 0 0" }}
      />
      <div className="card-body">
        <div className="skeleton mb-2" style={{ height: 20, width: "40%" }} />
        <div className="skeleton mb-2" style={{ height: 24, width: "90%" }} />
        <div className="skeleton mb-3" style={{ height: 16, width: "60%" }} />
        <div className="skeleton mb-3" style={{ height: 20, width: "50%" }} />
        <div className="skeleton"     style={{ height: 34, width: "100%" }} />
      </div>
    </div>
  );
}

export default ProductCard;