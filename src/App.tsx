import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";
import ErrorBoundary from "./components/ErrorBoundary";

// Configuração do cliente de consulta
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      // Essas configurações ajudam a prevenir que erros de rede causem problemas
      staleTime: 5 * 60 * 1000, // Dados são considerados frescos por 5 minutos
      gcTime: 10 * 60 * 1000, // Tempo antes do garbage collector limpar os dados (substitui o cacheTime)
    },
  },
});

/**
 * Componente principal da aplicação
 * Configura o roteamento e os provedores globais
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Rotas públicas */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />

                {/* Rotas protegidas */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="restaurants" element={
                    <ErrorBoundary>
                      <Restaurant />
                    </ErrorBoundary>
                  } />
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

                {/* Rota para páginas não encontradas */}
                <Route
                  path="*"
                  element={
                    <ProtectedRoute>
                      <NotFound />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
