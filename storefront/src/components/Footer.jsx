// =============================================================
//  storefront/src/components/Footer.jsx
//  Site footer — links, contact, social media
// =============================================================

import { Link } from "react-router-dom";

function Footer() {
  const year = new Date().getFullYear().toLocaleString("fa-IR");

  return (
    <footer
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderTop: "1px solid var(--color-border)",
        marginTop: "auto",
        transition: "background-color var(--transition-base)",
      }}
    >
      <div className="container py-5">
        <div className="row g-4">

          {/* ── Brand column ──────────────────────────── */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span style={{ fontSize: "1.5rem" }}>🖨️</span>
              <span
                className="fw-bold fs-5"
                style={{ color: "var(--color-primary)" }}
              >
                پرینت سه‌بعدی
              </span>
            </div>
            <p
              className="text-muted"
              style={{ fontSize: "0.9rem", lineHeight: 1.8 }}
            >
              ارائه محصولات آماده و سفارشی با کیفیت بالا در حوزه چاپ سه‌بعدی.
              از فیگور تا قطعات صنعتی، همه را می‌سازیم.
            </p>

            {/* Social links */}
            <div className="d-flex gap-3 mt-3">
              <a
                href="https://t.me/print3d_shop"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "1.4rem",
                  transition: "color var(--transition-fast)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--color-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--color-text-muted)")
                }
                title="تلگرام"
              >
                ✈️
              </a>
              <a
                href="https://instagram.com/print3d.shop"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "1.4rem",
                  transition: "color var(--transition-fast)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--color-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--color-text-muted)")
                }
                title="اینستاگرام"
              >
                📸
              </a>
            </div>
          </div>

          {/* ── Quick links ───────────────────────────── */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold mb-3">دسترسی سریع</h6>
            <ul className="list-unstyled">
              {[
                { to: "/",        label: "صفحه اصلی"  },
                { to: "/catalog", label: "محصولات"    },
                { to: "/cart",    label: "سبد خرید"   },
                { to: "/profile", label: "حساب کاربری" },
              ].map((item) => (
                <li key={item.to} className="mb-2">
                  <Link
                    to={item.to}
                    style={{
                      color: "var(--color-text-muted)",
                      fontSize: "0.9rem",
                      transition: "color var(--transition-fast)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--color-primary)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color =
                        "var(--color-text-muted)")
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Product types ─────────────────────────── */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold mb-3">محصولات</h6>
            <ul className="list-unstyled">
              {[
                { label: "فیگورها",       slug: "?product_type=ready"  },
                { label: "قطعات صنعتی",   slug: "?product_type=ready"  },
                { label: "سفارشی‌سازی",   slug: "?product_type=custom" },
              ].map((item) => (
                <li key={item.label} className="mb-2">
                  <Link
                    to={`/catalog${item.slug}`}
                    style={{
                      color: "var(--color-text-muted)",
                      fontSize: "0.9rem",
                      transition: "color var(--transition-fast)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--color-primary)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color =
                        "var(--color-text-muted)")
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ───────────────────────────────── */}
          <div className="col-lg-4 col-md-6">
            <h6 className="fw-bold mb-3">تماس با ما</h6>
            <p
              className="text-muted mb-2"
              style={{ fontSize: "0.9rem" }}
            >
              برای سفارش، مشاوره یا سوالات خود از طریق پیام‌رسان‌های زیر
              با ما در تماس باشید:
            </p>
            <div className="d-flex flex-column gap-2">
              <a
                href="https://t.me/print3d_shop"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-sm"
                style={{ width: "fit-content" }}
              >
                ✈️ تلگرام
              </a>
              <a
                href="https://instagram.com/print3d.shop"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-primary btn-sm"
                style={{ width: "fit-content" }}
              >
                📸 اینستاگرام
              </a>
            </div>
          </div>

        </div>

        {/* ── Bottom bar ──────────────────────────────── */}
        <div
          className="divider mt-4"
          style={{ margin: "1.5rem 0 1rem" }}
        />
        <div
          className="d-flex flex-wrap justify-content-between align-items-center gap-2"
        >
          <p
            className="text-muted mb-0"
            style={{ fontSize: "0.82rem" }}
          >
            © {year} پرینت سه‌بعدی — تمام حقوق محفوظ است.
          </p>
          <p
            className="text-muted mb-0"
            style={{ fontSize: "0.82rem" }}
          >
             ساخته شده با ❤️  
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;