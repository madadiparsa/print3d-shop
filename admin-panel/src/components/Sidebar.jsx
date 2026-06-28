// =============================================================
//  admin-panel/src/components/Sidebar.jsx
//  Fixed right-side navigation sidebar.
// =============================================================

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const NAV_ITEMS = [
  { to: "/",         icon: "📊", label: "داشبورد"       },
  { to: "/products", icon: "🖨️", label: "محصولات"       },
  { to: "/orders",   icon: "📦", label: "سفارش‌ها"      },
  { to: "/messages", icon: "✉️", label: "پیام‌ها"        },
];

function Sidebar({ collapsed, onClose }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile backdrop */}
      {!collapsed && (
        <div
          className="sidebar-overlay visible d-lg-none"
          onClick={onClose}
        />
      )}

      <aside
        className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}
      >
        {/* ── Logo ──────────────────────────────────────── */}
        <div
          className="d-flex align-items-center justify-content-between px-3 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: "1.4rem" }}>🖨️</span>
            <span
              className="fw-bold"
              style={{ color: "#fff", fontSize: "1rem" }}
            >
              پنل مدیریت
            </span>
          </div>
          <button
            className="btn btn-sm d-lg-none"
            style={{ color: "rgba(255,255,255,0.6)", background: "none" }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* ── Nav items ─────────────────────────────────── */}
        <nav className="flex-grow-1 py-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={onClose}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ── User info + logout ─────────────────────────── */}
        <div
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
          className="p-3"
        >
          {user && (
            <div className="mb-2">
              <p
                className="mb-0 fw-semibold"
                style={{ color: "#fff", fontSize: "0.85rem" }}
              >
                {user.full_name || "ادمین"}
              </p>
              <p
                className="mb-0"
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.75rem",
                }}
                dir="ltr"
              >
                {user.phone}
              </p>
            </div>
          )}
          <button
            className="btn btn-sm btn-outline-danger w-100"
            onClick={handleLogout}
          >
            خروج
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;