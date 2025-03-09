
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const isAuth = localStorage.getItem("isAuthenticated");
    
    // Small delay to ensure the component is fully rendered before redirect
    const redirectTimer = setTimeout(() => {
      if (isAuth) {
        navigate("/admin");
      } else {
        navigate("/login");
      }
    }, 100);
    
    return () => clearTimeout(redirectTimer);
  }, [navigate]);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleDashboard = () => {
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sistema de Gestão de Restaurantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            Bem-vindo(a) ao sistema completo para gerenciamento de restaurantes.
          </p>
          <div className="flex flex-col space-y-2">
            <Button onClick={handleLogin} className="w-full">
              Entrar
            </Button>
            <Button onClick={handleDashboard} variant="outline" className="w-full">
              Acessar Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
