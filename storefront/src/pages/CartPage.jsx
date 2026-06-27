// =============================================================
//  storefront/src/pages/CartPage.jsx
//  Full cart page — item list, quantity controls, totals.
// =============================================================

import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

const formatPrice = (price) =>
  Number(price).toLocaleString("fa-IR") + " تومان";

// ── Single cart item row ──────────────────────────────────────
function CartItem({ item, onUpdateQuantity, onRemove }) {
  const [updating, setUpdating] = useState(false);

  const handleQuantity = async (newQty) => {
    if (newQty < 1) return;
    setUpdating(true);
    try {
      await onUpdateQuantity(item.id, newQty);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    setUpdating(true);
    try {
      await onRemove(item.id);
    } finally {
      setUpdating(false);
    }
  };

  const product  = item.product || item;
  const name     = product.name     || item.product_name;
  const price    = product.price    || item.unit_price;
  const thumb    = product.thumbnail;
  const stock    = product.stock    ?? 999;
  const quantity = item.quantity;
  const total    = item.line_total  || price * quantity;

  return (
    <div
      className="card p-3 mb-3"
      style={{ opacity: updating ? 0.6 : 1, transition: "opacity 0.2s" }}
    >
      <div className="d-flex gap-3 align-items-start">

        {/* Thumbnail */}
        <div
          style={{
            width: 80,
            height: 80,
            flexShrink: 0,
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {thumb ? (
            <img
              src={thumb}
              alt={name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: "1.8rem" }}>🖨️</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-grow-1">
          <h6 className="fw-bold mb-1" style={{ color: "var(--color-text)" }}>
            {name}
          </h6>
          <p
            className="mb-2"
            style={{ color: "var(--color-primary)", fontWeight: 600 }}
          >
            {formatPrice(price)}
          </p>

          {/* Quantity controls */}
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              style={{ width: 32, height: 32, padding: 0 }}
              onClick={() => handleQuantity(quantity - 1)}
              disabled={updating || quantity <= 1}
            >
              −
            </button>

            <span
              className="fw-bold"
              style={{ minWidth: 24, textAlign: "center" }}
            >
              {quantity}
            </span>

            <button
              className="btn btn-outline-secondary btn-sm"
              style={{ width: 32, height: 32, padding: 0 }}
              onClick={() => handleQuantity(quantity + 1)}
              disabled={updating || quantity >= stock}
            >
              +
            </button>

            <button
              className="btn btn-outline-danger btn-sm me-auto"
              style={{ fontSize: "0.75rem" }}
              onClick={handleRemove}
              disabled={updating}
            >
              حذف
            </button>
          </div>
        </div>

        {/* Line total */}
        <div className="text-end" style={{ flexShrink: 0 }}>
          <strong style={{ color: "var(--color-primary)" }}>
            {formatPrice(total)}
          </strong>
        </div>
      </div>
    </div>
  );
}

// ── Main CartPage ─────────────────────────────────────────────
import { useState } from "react";

function CartPage() {
  const {
    cartItems,
    totalPrice,
    totalItems,
    loading,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const navigate = useNavigate();

  const [clearing, setClearing] = useState(false);

  const handleClear = async () => {
    if (!window.confirm("آیا از خالی کردن سبد خرید مطمئن هستید؟")) return;
    setClearing(true);
    try {
      await clearCart();
    } finally {
      setClearing(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container py-5">
        <h4 className="fw-bold mb-4">سبد خرید</h4>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton mb-3" style={{ height: 100 }} />
        ))}
      </div>
    );
  }

  // Empty cart
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <div style={{ fontSize: "4rem" }}>🛒</div>
          <h4 className="mt-3 mb-2">سبد خرید خالی است</h4>
          <p className="text-muted mb-4">
            هنوز محصولی به سبد خرید اضافه نکرده‌اید.
          </p>
          <Link to="/catalog" className="btn btn-primary px-4">
            مشاهده محصولات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h4 className="fw-bold mb-0">
          سبد خرید
          <span className="text-muted fw-normal fs-6 me-2">
            ({totalItems} محصول)
          </span>
        </h4>
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={handleClear}
          disabled={clearing}
        >
          {clearing ? (
            <span className="spinner-border spinner-border-sm me-1" />
          ) : null}
          خالی کردن سبد
        </button>
      </div>

      <div className="row g-4">

        {/* Cart items */}
        <div className="col-lg-8">
          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}

          <Link
            to="/catalog"
            className="btn btn-outline-secondary mt-2"
          >
            ← ادامه خرید
          </Link>
        </div>

        {/* Order summary */}
        <div className="col-lg-4">
          <div
            className="card p-4"
            style={{ position: "sticky", top: "calc(var(--navbar-height) + 1rem)" }}
          >
            <h5 className="fw-bold mb-3">خلاصه سفارش</h5>

            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">تعداد محصولات</span>
              <span>{totalItems.toLocaleString("fa-IR")}</span>
            </div>

            <div className="divider" />

            <div className="d-flex justify-content-between mb-3">
              <span className="fw-bold">مبلغ کل</span>
              <span
                className="fw-bold"
                style={{ color: "var(--color-primary)" }}
              >
                {formatPrice(totalPrice)}
              </span>
            </div>

            <div
              className="alert alert-warning mb-3"
              style={{ fontSize: "0.8rem" }}
            >
              💬 پرداخت از طریق تلگرام یا اینستاگرام انجام می‌شود.
            </div>

            <button
              className="btn btn-primary w-100 btn-lg"
              onClick={() => navigate("/checkout")}
            >
              ادامه و ثبت سفارش
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;