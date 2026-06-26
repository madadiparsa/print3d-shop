// =============================================================
//  storefront/src/App.jsx
//  Root component — wraps all providers and defines routes
// =============================================================

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import CartPage          from "./pages/CartPage";
import CatalogPage       from "./pages/CatalogPage";
import CheckoutPage      from "./pages/CheckoutPage";
import HomePage          from "./pages/HomePage";
import LoginPage         from "./pages/LoginPage";
import NotFoundPage      from "./pages/NotFoundPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProfilePage       from "./pages/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path="/"                  element={<HomePage />} />
              <Route path="/catalog"           element={<CatalogPage />} />
              <Route path="/products/:slug"    element={<ProductDetailPage />} />
              <Route path="/cart"              element={<CartPage />} />
              <Route path="/checkout"          element={<CheckoutPage />} />
              <Route path="/login"             element={<LoginPage />} />
              <Route path="/profile"           element={<ProfilePage />} />
              <Route path="*"                  element={<NotFoundPage />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;