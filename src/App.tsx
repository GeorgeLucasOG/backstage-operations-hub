
import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Restaurant from "./pages/admin/Restaurant";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Inventory from "./pages/admin/Inventory";
import Cash from "./pages/admin/Cash";
import Orders from "./pages/admin/Orders";
import AccountsPayable from "./pages/admin/AccountsPayable";
import AccountsReceivable from "./pages/admin/AccountsReceivable";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Login from "./pages/Login";

// Cliente pages
import ClientHome from "./pages/ClientHome";
import RestaurantMenu from "./pages/RestaurantMenu";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Cliente Routes */}
      <Route path="/" element={<ClientHome />} />
      <Route path="/restaurant/:slug/menu" element={<RestaurantMenu />} />
      <Route path="/restaurant/:slug/checkout" element={<Checkout />} />
      <Route path="/restaurant/:slug/confirmation/:orderId" element={<OrderConfirmation />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="restaurant" element={<Restaurant />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="cash" element={<Cash />} />
        <Route path="orders" element={<Orders />} />
        <Route path="accounts-payable" element={<AccountsPayable />} />
        <Route path="accounts-receivable" element={<AccountsReceivable />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
