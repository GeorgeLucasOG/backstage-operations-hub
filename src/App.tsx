import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Restaurant from "./pages/admin/Restaurant";
import Categories from "./pages/admin/Categories";
import Orders from "./pages/admin/Orders";
import AccountsPayable from "./pages/admin/AccountsPayable";
import AccountsReceivable from "./pages/admin/AccountsReceivable";
import PDV from "./pages/admin/PDV";
import NotFound from "./pages/NotFound";
import ApiSettings from "./pages/admin/ApiSettings";

// Create a client with error handling configurado para compatibilidade com aplicativos cliente
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutos de cache para melhor desempenho
    },
  },
});

// Make App a proper React component with explicit return
const App: React.FC = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="restaurants" element={<Restaurant />} />
                <Route path="products" element={<Products />} />
                <Route path="menu" element={<Categories />} />
                <Route path="orders" element={<Orders />} />
                <Route path="accounts-payable" element={<AccountsPayable />} />
                <Route
                  path="accounts-receivable"
                  element={<AccountsReceivable />}
                />
                <Route path="pdv" element={<PDV />} />
                <Route path="api-settings" element={<ApiSettings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
