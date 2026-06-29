// =============================================================
//  admin-panel/src/components/Sidebar.jsx
// =============================================================

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const NAV_ITEMS = [
  { to: "/",         icon: "📊", label: "داشبورد"  },
  { to: "/products", icon: "🖨️", label: "محصولات"  },
  { to: "/orders",   icon: "📦", label: "سفارش‌ها" },
  { to: "/messages", icon: "✉️", label: "پیام‌ها"   },
];

const SIDEBAR_WIDTH = 240;

function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: SIDEBAR_WIDTH,
        height: "100vh",
        backgroundColor: "#1a1a2e",
        display: "flex",
        flexDirection: "column",
        zIndex: 1020,
        transform: "translateX(0)",
        transition: "transform 0.25s ease",
        overflowY: "auto",
      }}
      className={`admin-sidebar-inner ${open ? "sidebar-open" : ""}`}
    >
      {/* Logo */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.4rem" }}>🖨️</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>
            پنل مدیریت
          </span>
        </div>
        <button
          className="d-lg-none"
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.6)",
            fontSize: "1.1rem",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ flexGrow: 1, padding: "0.5rem 0" }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onClose}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.65rem 1.25rem",
              margin: "2px 8px",
              borderRadius: 6,
              color: isActive ? "#fff" : "#c8c8e0",
              backgroundColor: isActive
                ? "var(--color-primary, #6c3eb3)"
                : "transparent",
              textDecoration: "none",
              fontSize: "0.9rem",
              transition: "background-color 0.15s ease",
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains("active")) {
                e.currentTarget.style.backgroundColor =
                  "rgba(255,255,255,0.08)";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains("active")) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div
        style={{
          padding: "1rem",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {user && (
          <div style={{ marginBottom: "0.5rem" }}>
            <p
              style={{
                color: "#fff",
                fontSize: "0.85rem",
                fontWeight: 600,
                margin: 0,
              }}
            >
              {user.full_name || "ادمین"}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: "0.75rem",
                margin: 0,
                direction: "ltr",
                textAlign: "right",
              }}
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

      {/* Mobile hide when closed */}
      <style>{`
        @media (max-width: 991.98px) {
          .admin-sidebar-inner {
            transform: translateX(100%) !important;
          }
          .admin-sidebar-inner.sidebar-open {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Sidebar;