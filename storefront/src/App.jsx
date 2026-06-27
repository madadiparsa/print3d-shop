// =============================================================
//  storefront/src/App.jsx
//  Root component — providers, router, protected routes
// =============================================================

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider }  from "./contexts/AuthContext";
import { CartProvider }  from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import Navbar         from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import CartPage              from "./pages/CartPage";
import CatalogPage           from "./pages/CatalogPage";
import CheckoutPage          from "./pages/CheckoutPage";
import HomePage              from "./pages/HomePage";
import LoginPage             from "./pages/LoginPage";
import NotFoundPage          from "./pages/NotFoundPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import ProductDetailPage     from "./pages/ProductDetailPage";
import ProfilePage           from "./pages/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>

            {/* Navbar shown on all pages */}
            <Navbar />

            {/* Main content pushed below fixed navbar */}
            <main className="page-wrapper">
              <Routes>

                {/* ── Public routes ─────────────────────── */}
                <Route path="/"               element={<HomePage />} />
                <Route path="/catalog"        element={<CatalogPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/login"          element={<LoginPage />} />

                {/* ── Protected routes ──────────────────── */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-confirmation"
                  element={
                    <ProtectedRoute>
                      <OrderConfirmationPage />
                    </ProtectedRoute>
                  }
                />

                {/* ── 404 ───────────────────────────────── */}
                <Route path="*" element={<NotFoundPage />} />

              </Routes>
            </main>

          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;