// =============================================================
//  admin-panel/src/components/AdminLayout.jsx
//  Wraps all admin pages with sidebar + topbar.
// =============================================================

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "./Sidebar";

function AdminLayout({ children, title = "" }) {
  const { user }                      = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* Sidebar */}
      <Sidebar
        collapsed={!sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div
        className="admin-main"
        style={{
          marginRight: "var(--sidebar-width)",
        }}
      >
        {/* ── Topbar ──────────────────────────────────── */}
        <header className="admin-topbar">

          {/* Mobile hamburger */}
          <button
            className="btn btn-sm btn-outline-secondary d-lg-none"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          {/* Page title */}
          <h5
            className="fw-bold mb-0 flex-grow-1"
            style={{ color: "var(--color-text)" }}
          >
            {title}
          </h5>

          {/* User badge */}
          {user && (
            <span
              className="badge"
              style={{
                backgroundColor: "var(--color-primary)",
                fontSize: "0.8rem",
              }}
            >
              👤 {user.full_name || user.phone}
            </span>
          )}
        </header>

        {/* ── Page content ────────────────────────────── */}
        <div className="p-4">
          {children}
        </div>
      </div>

      {/* Fix sidebar on desktop — always visible */}
      <style>{`
        @media (min-width: 992px) {
          .admin-sidebar { transform: translateX(0) !important; }
        }
        @media (max-width: 991px) {
          .admin-main { margin-right: 0 !important; }
          .admin-sidebar { transform: translateX(100%); }
          .admin-sidebar:not(.collapsed) { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

export default AdminLayout;