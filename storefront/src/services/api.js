// =============================================================
//  storefront/src/services/api.js
//  Axios instance pre-configured for the Django backend.
// =============================================================

import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor ───────────────────────────────────────
// Attach JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────
// If a 401 is returned, clear tokens and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;