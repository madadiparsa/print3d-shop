// =============================================================
//  storefront/src/components/Navbar.jsx
//  Top navigation bar — logo, search, cart, auth, theme toggle
// =============================================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";

function Navbar() {
  const { theme, toggleTheme }      = useTheme();
  const { isAuthenticated, logout } = useAuth();
  const { totalItems }              = useCart();
  const navigate                    = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav
      className="navbar navbar-expand-lg fixed-top"
      style={{
        backgroundColor: "var(--color-bg-navbar)",
        borderBottom: "1px solid var(--color-border)",
        height: "var(--navbar-height)",
        zIndex: 1030,
        transition: "background-color var(--transition-base)",
      }}
    >
      <div className="container">

        {/* ── Logo ─────────────────────────────────────────── */}
        <Link
          className="navbar-brand fw-bold fs-4"
          to="/"
          style={{ color: "var(--color-primary)" }}
        >
          🖨️ پرینت سه‌بعدی
        </Link>

        {/* ── Mobile toggle ────────────────────────────────── */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* ── Collapsible content ───────────────────────────── */}
        <div className="collapse navbar-collapse" id="navbarMain">

          {/* Search */}
          <form
            className="d-flex mx-auto"
            style={{ width: "100%", maxWidth: 400 }}
            onSubmit={handleSearch}
          >
            <div className="input-group">
              <input
                type="search"
                className="form-control"
                placeholder="جستجوی محصول..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                🔍
              </button>
            </div>
          </form>

          {/* Right actions */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-center gap-2 mt-3 mt-lg-0">

            <li className="nav-item">
              <Link
                className="nav-link"
                to="/catalog"
                style={{ color: "var(--color-text)" }}
              >
                محصولات
              </Link>
            </li>

            {/* Theme toggle */}
            <li className="nav-item">
              <button
                className="btn btn-sm"
                onClick={toggleTheme}
                style={{
                  backgroundColor: "var(--color-bg-card)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                  borderRadius: "var(--radius-sm)",
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title={theme === "light" ? "حالت تاریک" : "حالت روشن"}
              >
                {theme === "light" ? "🌙" : "☀️"}
              </button>
            </li>

            {/* Cart */}
            <li className="nav-item">
              <Link
                className="nav-link position-relative"
                to="/cart"
                style={{ color: "var(--color-text)" }}
              >
                🛒
                {totalItems > 0 && (
                  <span className="cart-badge">{totalItems}</span>
                )}
              </Link>
            </li>

            {/* Auth */}
            {isAuthenticated ? (
              <li className="nav-item dropdown">
                <button
                  className="btn btn-sm btn-outline-primary dropdown-toggle"
                  data-bs-toggle="dropdown"
                >
                  👤 حساب من
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end"
                  style={{
                    backgroundColor: "var(--color-bg-card)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <li>
                    <Link
                      className="dropdown-item"
                      to="/profile"
                      style={{ color: "var(--color-text)" }}
                    >
                      پروفایل
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      خروج
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item">
                <Link className="btn btn-primary btn-sm" to="/login">
                  ورود
                </Link>
              </li>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;