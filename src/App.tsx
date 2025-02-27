
import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
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

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="restaurants" element={<Restaurant />} />
        <Route path="products" element={<Products />} />
        <Route path="menu" element={<Categories />} />
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
