
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Coffee, 
  ShoppingCart, 
  Store, 
  List, 
  Receipt, 
  DollarSign,
  Settings,
  HelpCircle 
} from "lucide-react";

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const TourGuide: React.FC = () => {
  const [showTour, setShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if it's the first visit
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      setShowTour(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);

  const tourSteps: TourStep[] = [
    {
      title: "Painel",
      description: "Visualize estatísticas e métricas importantes do seu negócio, como vendas, receitas e pedidos recentes.",
      icon: <LayoutDashboard className="h-8 w-8 text-primary mb-2" />,
    },
    {
      title: "Restaurantes",
      description: "Gerencie os dados do seu restaurante, incluindo informações de contato, endereço e horário de funcionamento.",
      icon: <Store className="h-8 w-8 text-primary mb-2" />,
    },
    {
      title: "Produtos",
      description: "Adicione, edite e gerencie todos os produtos do seu cardápio, com preços, descrições e imagens.",
      icon: <Coffee className="h-8 w-8 text-primary mb-2" />,
    },
    {
      title: "Categorias",
      description: "Organize seu cardápio em categorias para facilitar a navegação dos clientes.",
      icon: <List className="h-8 w-8 text-primary mb-2" />,
    },
    {
      title: "Pedidos",
      description: "Acompanhe e gerencie todos os pedidos realizados, com status, detalhes e histórico completo.",
      icon: <ShoppingCart className="h-8 w-8 text-primary mb-2" />,
    },
    {
      title: "PDV (Ponto de Venda)",
      description: "Registre vendas presenciais de forma rápida e eficiente, com suporte a diferentes métodos de pagamento.",
      icon: <ShoppingCart className="h-8 w-8 text-primary mb-2" />,
    },
    {
      title: "Contas a Receber",
      description: "Monitore valores a receber, com datas de vencimento, status de pagamento e relatórios.",
      icon: <Receipt className="h-8 w-8 text-primary mb-2" />,
    },
    {
      title: "Contas a Pagar",
      description: "Controle suas despesas e pagamentos pendentes, mantendo suas finanças organizadas.",
      icon: <DollarSign className="h-8 w-8 text-primary mb-2" />,
    },
    {
      title: "Configurações de API",
      description: "Configure integrações externas para processamento de imagens e outras funcionalidades.",
      icon: <Settings className="h-8 w-8 text-primary mb-2" />,
    },
  ];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowTour(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setShowTour(false);
  };

  const openTour = () => {
    setCurrentStep(0);
    setShowTour(true);
  };

  const currentTourStep = tourSteps[currentStep];

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={openTour}
        className="fixed bottom-4 right-4 z-50 rounded-full h-10 w-10 p-0"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      <Dialog open={showTour} onOpenChange={setShowTour}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentTourStep.icon}
              {currentTourStep.title}
            </DialogTitle>
            <DialogDescription className="pt-4">
              {currentTourStep.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between sm:justify-between">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Anterior
              </Button>
              <Button
                type="button"
                onClick={handleNext}
              >
                {currentStep === tourSteps.length - 1 ? "Concluir" : "Próximo"}
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
            >
              Pular tour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TourGuide;
