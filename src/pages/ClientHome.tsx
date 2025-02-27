
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  slug: string;
  avatar_image_url: string;
  cover_image_url: string;
}

const ClientHome = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const { data: restaurants } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('name');
      
      if (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os restaurantes',
          variant: 'destructive',
        });
        throw error;
      }
      
      return data as Restaurant[];
    },
    onSettled: () => {
      setLoading(false);
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando restaurantes...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Bem-vindo ao MyFood</h1>
        <p className="text-gray-500 mt-2">Encontre os melhores restaurantes</p>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants?.map((restaurant) => (
          <Card key={restaurant.id} className="overflow-hidden">
            <div className="h-40 overflow-hidden">
              <img 
                src={restaurant.cover_image_url} 
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <img 
                  src={restaurant.avatar_image_url}
                  alt={restaurant.name}
                  className="w-12 h-12 rounded-full object-cover border"
                />
                <h2 className="text-xl font-bold">{restaurant.name}</h2>
              </div>
              <p className="text-gray-500 line-clamp-2 mb-4">{restaurant.description}</p>
              <Link to={`/restaurant/${restaurant.slug}/menu`}>
                <Button className="w-full">Ver Cardápio</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {restaurants?.length === 0 && (
        <div className="text-center p-10 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-medium">Nenhum restaurante encontrado</h3>
          <p className="text-gray-500 mt-2">Volte mais tarde para conferir novidades.</p>
        </div>
      )}

      <Separator className="my-6" />

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Acesso administrativo</h2>
        <Link to="/admin/dashboard">
          <Button variant="outline">Entrar como administrador</Button>
        </Link>
      </div>
    </div>
  );
};

export default ClientHome;
