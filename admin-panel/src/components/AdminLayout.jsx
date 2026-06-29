// =============================================================
//  admin-panel/src/components/AdminLayout.jsx
// =============================================================

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "./Sidebar";

function AdminLayout({ children, title = "" }) {
  const { user }                      = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SIDEBAR_WIDTH = 240;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)" }}>

      {/* ── Fixed sidebar ───────────────────────────────── */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Mobile backdrop ─────────────────────────────── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1015,
          }}
        />
      )}

      {/* ── Main area — offset from sidebar ─────────────── */}
      <div
        style={{
          marginRight: SIDEBAR_WIDTH,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
        className="admin-main-content"
      >
        {/* Topbar */}
        <header
          style={{
            height: 60,
            backgroundColor: "var(--color-bg-card)",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            padding: "0 1.5rem",
            position: "sticky",
            top: 0,
            zIndex: 100,
            gap: "1rem",
          }}
        >
          {/* Mobile hamburger */}
          <button
            className="btn btn-sm btn-outline-secondary d-lg-none"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          <h5
            className="fw-bold mb-0 flex-grow-1"
            style={{ color: "var(--color-text)" }}
          >
            {title}
          </h5>

          {user && (
            <span
              className="badge"
              style={{
                backgroundColor: "var(--color-primary)",
                fontSize: "0.8rem",
                padding: "0.4rem 0.75rem",
              }}
            >
              👤 {user.full_name || user.phone}
            </span>
          )}
        </header>

        {/* Page content */}
        <div style={{ padding: "1.5rem", flexGrow: 1 }}>
          {children}
        </div>
      </div>

      {/* Responsive: remove margin on mobile */}
      <style>{`
        @media (max-width: 991.98px) {
          .admin-main-content {
            margin-right: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminLayout;