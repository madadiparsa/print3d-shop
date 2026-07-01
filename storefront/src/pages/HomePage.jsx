// =============================================================
//  storefront/src/pages/HomePage.jsx
//  Landing page — hero, features, featured products
// =============================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard, { ProductCardSkeleton } from "../components/ProductCard";
import api from "../services/api";

// ── Feature card ──────────────────────────────────────────────
function FeatureCard({ icon, title, description }) {
  return (
    <div className="card p-4 h-100 text-center">
      <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
        {icon}
      </div>
      <h6 className="fw-bold mb-2">{title}</h6>
      <p
        className="text-muted mb-0"
        style={{ fontSize: "0.875rem", lineHeight: 1.7 }}
      >
        {description}
      </p>
    </div>
  );
}

function HomePage() {
  const [featured, setFeatured]   = useState([]);
  const [loading, setLoading]     = useState(true);

  // Fetch a few featured products
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/products/", {
          params: { page_size: 4, ordering: "-created_at" },
        });
        setFeatured(res.data.results || []);
      } catch {
        // Silent fail — featured section just won't show
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      {/* ── Hero section ────────────────────────────────── */}
      <section
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 50%, var(--color-primary-light) 100%)",
          padding: "5rem 0",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <div className="container">
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🖨️</div>
          <h1
            className="fw-bold mb-3"
            style={{ color: "#fff", fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
          >
            پرینت سه‌بعدی با کیفیت برتر
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              opacity: 0.9,
              maxWidth: 520,
              margin: "0 auto 2rem",
              lineHeight: 1.8,
            }}
          >
            از فیگورهای دقیق تا قطعات صنعتی سفارشی — همه را با بهترین
            کیفیت می‌سازیم.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link
              to="/catalog"
              className="btn btn-light btn-lg px-4 fw-bold"
              style={{ color: "var(--color-primary)" }}
            >
              مشاهده محصولات
            </Link>
            <Link
              to="/catalog?product_type=custom"
              className="btn btn-outline-light btn-lg px-4"
            >
              سفارش سفارشی
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section className="container py-5">
        <h2 className="text-center fw-bold mb-4">چرا ما؟</h2>
        <div className="row g-3">
          {[
            {
              icon: "🎯",
              title: "دقت بالا",
              description:
                "چاپ سه‌بعدی با دقت لایه‌ای ۰.۱ میلیمتر برای بهترین کیفیت.",
            },
            {
              icon: "⚡",
              title: "تحویل سریع",
              description:
                "سفارش‌های آماده در کمترین زمان ممکن آماده و ارسال می‌شوند.",
            },
            {
              icon: "🎨",
              title: "سفارشی‌سازی",
              description:
                "هر طرحی که داشته باشید را با مواد و رنگ دلخواه چاپ می‌کنیم.",
            },
            {
              icon: "💬",
              title: "پشتیبانی",
              description:
                "از طریق تلگرام و اینستاگرام همیشه در دسترس هستیم.",
            },
          ].map((f) => (
            <div key={f.title} className="col-md-6 col-lg-3">
              <FeatureCard {...f} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured products ────────────────────────────── */}
      <section
        style={{ backgroundColor: "var(--color-bg-card)", padding: "3rem 0" }}
      >
        <div className="container">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h2 className="fw-bold mb-0">محصولات جدید</h2>
            <Link to="/catalog" className="btn btn-outline-primary btn-sm">
              مشاهده همه ←
            </Link>
          </div>

          <div className="row g-3">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="col-6 col-md-3">
                    <ProductCardSkeleton />
                  </div>
                ))
              : featured.map((product) => (
                  <div key={product.id} className="col-6 col-md-3">
                    <ProductCard product={product} />
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="container py-5 text-center">
        <h3 className="fw-bold mb-3">آماده سفارش هستید؟</h3>
        <p className="text-muted mb-4" style={{ fontSize: "1rem" }}>
          برای سفارش سفارشی یا مشاوره، از طریق پیام‌رسان‌های زیر با ما
          تماس بگیرید.
        </p>
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <a
            href="https://t.me/print3d_shop"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary px-4"
          >
            ✈️ تلگرام
          </a>
          <a
            href="https://instagram.com/print3d.shop"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-primary px-4"
          >
            📸 اینستاگرام
          </a>
        </div>
      </section>
    </div>
  );
}

export default HomePage;