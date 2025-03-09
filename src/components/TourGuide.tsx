
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface TourStep {
  title: string;
  description: string;
  path: string;
}

const TourGuide = () => {
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  // Tour steps configuration
  const tourSteps: TourStep[] = [
    {
      title: "Bem-vindo ao Sistema",
      description:
        "Este é um tour guiado para conhecer todas as principais funcionalidades do sistema de gestão de restaurantes.",
      path: "/admin",
    },
    {
      title: "Gestão de Restaurantes",
      description:
        "Aqui você pode adicionar, editar e excluir restaurantes. Cada restaurante possui informações como nome, descrição, slug e imagens.",
      path: "/admin/restaurants",
    },
    {
      title: "Gestão de Produtos",
      description:
        "Nesta seção você gerencia todos os produtos do seu cardápio, incluindo nome, descrição, preço e imagem.",
      path: "/admin/products",
    },
    {
      title: "Categorias do Menu",
      description:
        "Organize seus produtos em categorias para facilitar a navegação no cardápio do seu restaurante.",
      path: "/admin/menu",
    },
    {
      title: "Gestão de Pedidos",
      description:
        "Acompanhe todos os pedidos realizados, seus status e detalhes dos clientes.",
      path: "/admin/orders",
    },
    {
      title: "PDV (Ponto de Venda)",
      description:
        "Registre vendas diretamente no sistema com esta interface de ponto de venda fácil de usar.",
      path: "/admin/pdv",
    },
    {
      title: "Contas a Receber",
      description:
        "Controle todas as receitas pendentes e já recebidas do seu estabelecimento.",
      path: "/admin/accounts-receivable",
    },
    {
      title: "Contas a Pagar",
      description:
        "Gerencie todas as despesas e pagamentos pendentes do seu negócio.",
      path: "/admin/accounts-payable",
    },
    {
      title: "Configurações de API",
      description:
        "Configure integrações e APIs externas para expandir as funcionalidades do sistema.",
      path: "/admin/api-settings",
    },
  ];

  useEffect(() => {
    // Check if the tour has been seen before
    const tourSeen = localStorage.getItem("tourSeen");
    if (!tourSeen) {
      setShowTour(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      navigate(tourSteps[nextStep].path);
    } else {
      // End of tour
      handleCloseTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      navigate(tourSteps[prevStep].path);
    }
  };

  const handleCloseTour = () => {
    setShowTour(false);
    localStorage.setItem("tourSeen", "true");
  };

  const handleStartTour = () => {
    setCurrentStep(0);
    setShowTour(true);
    navigate(tourSteps[0].path);
    localStorage.removeItem("tourSeen");
  };

  const currentTourStep = tourSteps[currentStep];

  return (
    <>
      {/* Tour Dialog */}
      <Dialog open={showTour} onOpenChange={setShowTour}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentTourStep.title}</DialogTitle>
            <DialogDescription>
              {currentTourStep.description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="text-sm text-muted-foreground">
              Passo {currentStep + 1} de {tourSteps.length}
            </div>
            <div className="mt-2 w-full bg-gray-200 h-1 rounded-full">
              <div
                className="bg-primary h-1 rounded-full"
                style={{
                  width: `${((currentStep + 1) / tourSteps.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between mt-4">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseTour}
              >
                <X className="mr-1 h-4 w-4" />
                Pular Tour
              </Button>
            </div>
            <Button onClick={handleNext}>
              {currentStep === tourSteps.length - 1 ? (
                "Finalizar"
              ) : (
                <>
                  Próximo
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Button to start tour */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={handleStartTour} size="sm">
          Tour Guiado
        </Button>
      </div>
    </>
  );
};

export default TourGuide;
