
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Order {
  id: number;
  customer_name: string;
  status: string;
  created_at: string;
  table_number: number | null;
  consumption_method: 'DINE_IN' | 'TAKEAWAY';
  total: number;
}

const OrderConfirmation = () => {
  const { slug, orderId } = useParams<{ slug: string; orderId: string }>();
  const { toast } = useToast();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (error) {
        toast({
          title: 'Erro',
          description: 'Pedido não encontrado',
          variant: 'destructive',
        });
        throw error;
      }
      
      return data as Order;
    }
  });

  const { data: orderItems, isLoading: isLoadingItems } = useQuery({
    queryKey: ['order-items', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_products')
        .select(`
          id,
          quantity,
          price,
          product:products (
            id,
            name,
            description
          )
        `)
        .eq('order_id', orderId);
      
      if (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os itens do pedido',
          variant: 'destructive',
        });
        throw error;
      }
      
      return data;
    },
    enabled: !!orderId
  });

  if (isLoading || isLoadingItems) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando detalhes do pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-4 max-w-3xl text-center">
        <h1 className="text-2xl font-bold mb-4">Pedido não encontrado</h1>
        <Link to="/">
          <Button>Voltar para a página inicial</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="text-center mb-8">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold">Pedido Realizado com Sucesso!</h1>
        <p className="text-gray-500 mt-2">
          Seu pedido foi enviado para o restaurante e está sendo preparado.
        </p>
      </div>
      
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h2 className="text-sm text-gray-500">Número do Pedido</h2>
            <p className="font-bold">#{order.id}</p>
          </div>
          <div>
            <h2 className="text-sm text-gray-500">Data</h2>
            <p className="font-bold">
              {new Date(order.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div>
            <h2 className="text-sm text-gray-500">Cliente</h2>
            <p className="font-bold">{order.customer_name}</p>
          </div>
          <div>
            <h2 className="text-sm text-gray-500">Forma de Consumo</h2>
            <p className="font-bold">
              {order.consumption_method === 'DINE_IN' 
                ? `No local (Mesa ${order.table_number})` 
                : 'Para viagem'}
            </p>
          </div>
          <div>
            <h2 className="text-sm text-gray-500">Status</h2>
            <p className="font-bold">
              {order.status === 'PENDING' 
                ? 'Aguardando confirmação' 
                : order.status === 'IN_PREPARATION' 
                  ? 'Em preparação' 
                  : 'Finalizado'}
            </p>
          </div>
          <div>
            <h2 className="text-sm text-gray-500">Total</h2>
            <p className="font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(order.total)}
            </p>
          </div>
        </div>
        
        <h3 className="font-bold mb-2">Itens do Pedido</h3>
        <div className="space-y-2 mb-4">
          {orderItems?.map((item: any) => (
            <div key={item.id} className="flex justify-between">
              <span>
                {item.quantity}x {item.product.name}
              </span>
              <span>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </Card>
      
      <div className="flex justify-center mb-6">
        <Link to={`/restaurant/${slug}/menu`}>
          <Button>Voltar para o Menu</Button>
        </Link>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        <p>
          Agradecemos por escolher nosso serviço! Em caso de dúvidas, entre em contato com o restaurante.
        </p>
      </div>
    </div>
  );
};

export default OrderConfirmation;
