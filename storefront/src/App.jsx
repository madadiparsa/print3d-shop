// =============================================================
//  storefront/src/App.jsx
//  Root — providers, error boundary, router, layout
// =============================================================

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider }  from "./contexts/AuthContext";
import { CartProvider }  from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import ErrorBoundary  from "./components/ErrorBoundary";
import Footer         from "./components/Footer";
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
            <ErrorBoundary>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "100vh",
                }}
              >
                {/* Navbar on all pages */}
                <Navbar />

                {/* Main content */}
                <main className="page-wrapper" style={{ flex: 1 }}>
                  <ErrorBoundary>
                    <Routes>

                      {/* ── Public ──────────────────────── */}
                      <Route path="/"               element={<HomePage />} />
                      <Route path="/catalog"        element={<CatalogPage />} />
                      <Route path="/products/:slug" element={<ProductDetailPage />} />
                      <Route path="/login"          element={<LoginPage />} />

                      {/* ── Protected ───────────────────── */}
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute><ProfilePage /></ProtectedRoute>
                        }
                      />
                      <Route
                        path="/cart"
                        element={
                          <ProtectedRoute><CartPage /></ProtectedRoute>
                        }
                      />
                      <Route
                        path="/checkout"
                        element={
                          <ProtectedRoute><CheckoutPage /></ProtectedRoute>
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

                      {/* ── 404 ─────────────────────────── */}
                      <Route path="*" element={<NotFoundPage />} />

                    </Routes>
                  </ErrorBoundary>
                </main>

                {/* Footer on all pages */}
                <Footer />
              </div>
            </ErrorBoundary>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;