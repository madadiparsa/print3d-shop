import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider }  from "./contexts/AuthContext";
import ProtectedRoute    from "./components/ProtectedRoute";

import LoginPage     from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage  from "./pages/ProductsPage";
import OrdersPage    from "./pages/OrdersPage";
import MessagesPage  from "./pages/MessagesPage";
import NotFoundPage  from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;