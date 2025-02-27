
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase, DEFAULT_RESTAURANT_ID } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Restaurant {
  id: string;
  name: string;
}

const Checkout = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Simulated cart data (in a real application, this would be from a context or state management)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    cpf: '',
    tableNumber: '',
  });
  
  const [consumptionMethod, setConsumptionMethod] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // In a real app, you'd fetch the cart from a context or state management
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Fetch restaurant
  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name')
        .eq('slug', slug)
        .single();
      
      if (error) {
        toast({
          title: 'Erro',
          description: 'Restaurante não encontrado',
          variant: 'destructive',
        });
        throw error;
      }
      
      return data as Restaurant;
    }
  });

  const getTotalPrice = () => {
    return cart.reduce((total: number, item: any) => 
      total + (item.product.price * item.quantity), 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restaurant) {
      toast({
        title: 'Erro',
        description: 'Restaurante não encontrado',
        variant: 'destructive',
      });
      return;
    }
    
    if (cart.length === 0) {
      toast({
        title: 'Erro',
        description: 'Seu carrinho está vazio',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerInfo.name,
          customer_cpf: customerInfo.cpf,
          table_number: consumptionMethod === 'DINE_IN' ? parseInt(customerInfo.tableNumber) : null,
          consumption_method: consumptionMethod,
          total: getTotalPrice(),
          restaurant_id: restaurant.id,
          status: 'PENDING'
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Create order items
      const orderItems = cart.map((item: any) => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }));
      
      const { error: itemsError } = await supabase
        .from('order_products')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      toast({
        title: 'Pedido realizado',
        description: 'Seu pedido foi enviado com sucesso!',
      });
      
      // Clear cart and redirect
      localStorage.removeItem('cart');
      navigate(`/restaurant/${slug}/confirmation/${orderData.id}`);
      
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível finalizar seu pedido. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Finalizar Pedido</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-2">Seus Dados</h2>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                name="name"
                value={customerInfo.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                value={customerInfo.cpf}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Como deseja consumir?</Label>
              <RadioGroup
                value={consumptionMethod}
                onValueChange={(value) => setConsumptionMethod(value as 'DINE_IN' | 'TAKEAWAY')}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="DINE_IN" id="dine-in" />
                  <Label htmlFor="dine-in">No local</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="TAKEAWAY" id="takeaway" />
                  <Label htmlFor="takeaway">Para viagem</Label>
                </div>
              </RadioGroup>
            </div>
            
            {consumptionMethod === 'DINE_IN' && (
              <div className="space-y-2">
                <Label htmlFor="tableNumber">Número da Mesa</Label>
                <Input
                  id="tableNumber"
                  name="tableNumber"
                  type="number"
                  value={customerInfo.tableNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}
          </div>
          
          {/* Order Summary */}
          <div>
            <h2 className="text-xl font-bold mb-2">Resumo do Pedido</h2>
            <Card className="p-4">
              <div className="space-y-3 mb-4">
                {cart.length > 0 ? (
                  cart.map((item: any) => (
                    <div key={item.id} className="flex justify-between">
                      <span>
                        {item.quantity}x {item.product.name}
                      </span>
                      <span>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">Seu carrinho está vazio</p>
                )}
              </div>
              
              {cart.length > 0 && (
                <>
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between font-bold mb-4">
                    <span>Total:</span>
                    <span>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(getTotalPrice())}
                    </span>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
        
        <div className="mt-6 flex flex-col md:flex-row justify-between gap-4">
          <Link to={`/restaurant/${slug}/menu`}>
            <Button variant="outline" type="button" className="w-full md:w-auto">
              Voltar ao Menu
            </Button>
          </Link>
          
          <Button 
            type="submit" 
            disabled={isSubmitting || cart.length === 0} 
            className="w-full md:w-auto"
          >
            {isSubmitting ? 'Processando...' : 'Confirmar Pedido'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
