
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Add a small delay before redirecting to make sure components are loaded
    const timer = setTimeout(() => {
      navigate("/admin");
    }, 100);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <h2 className="text-lg font-medium">Redirecionando para o sistema...</h2>
      </div>
    </div>
  );
};

export default Index;
