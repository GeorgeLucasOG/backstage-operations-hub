
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  avatar_image_url: string;
  cover_image_url: string;
}

interface Category {
  id: string;
  name: string;
  restaurant_id: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  menu_category_id: string;
  ingredients: string[];
}

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

const RestaurantMenu = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);

  // Fetch restaurant
  const { data: restaurant, isLoading: isLoadingRestaurant } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
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

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories', restaurant?.id],
    queryFn: async () => {
      if (!restaurant?.id) return [];
      
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('name');
      
      if (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as categorias',
          variant: 'destructive',
        });
        throw error;
      }
      
      return data as Category[];
    },
    enabled: !!restaurant?.id
  });

  // Fetch products
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', restaurant?.id],
    queryFn: async () => {
      if (!restaurant?.id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('restaurant_id', restaurant.id);
      
      if (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os produtos',
          variant: 'destructive',
        });
        throw error;
      }
      
      return data as Product[];
    },
    enabled: !!restaurant?.id
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prev, { id: crypto.randomUUID(), product, quantity: 1 }];
      }
    });

    toast({
      title: 'Produto adicionado',
      description: `${product.name} foi adicionado ao carrinho`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setCart(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const getProductsByCategory = (categoryId: string) => {
    return products?.filter(product => product.menu_category_id === categoryId) || [];
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const isLoading = isLoadingRestaurant || isLoadingCategories || isLoadingProducts;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando menu...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto p-4 max-w-6xl text-center">
        <h1 className="text-2xl font-bold mb-4">Restaurante não encontrado</h1>
        <Link to="/">
          <Button>Voltar para a página inicial</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Restaurant Header */}
      <div className="relative mb-6">
        <div className="h-48 overflow-hidden rounded-lg">
          <img 
            src={restaurant.cover_image_url} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -bottom-6 left-6 flex items-end">
          <div className="bg-white p-1 rounded-full shadow-lg">
            <img 
              src={restaurant.avatar_image_url}
              alt={restaurant.name}
              className="w-16 h-16 rounded-full object-cover border"
            />
          </div>
        </div>
      </div>
      
      <div className="mt-10 mb-6">
        <h1 className="text-3xl font-bold">{restaurant.name}</h1>
        <p className="text-gray-500 mt-2">{restaurant.description}</p>
      </div>
      
      <Separator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Section */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Cardápio</h2>
          
          {categories && categories.length > 0 ? (
            <Tabs defaultValue={categories[0]?.id}>
              <TabsList className="mb-4 flex flex-wrap">
                {categories.map(category => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {categories.map(category => (
                <TabsContent key={category.id} value={category.id}>
                  <div className="space-y-4">
                    {getProductsByCategory(category.id).length > 0 ? (
                      getProductsByCategory(category.id).map(product => (
                        <Card key={product.id} className="flex overflow-hidden">
                          <div className="flex-shrink-0 w-24 h-24">
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 p-4">
                            <div className="flex justify-between">
                              <h3 className="text-lg font-bold">{product.name}</h3>
                              <span className="font-bold">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                }).format(product.price)}
                              </span>
                            </div>
                            <p className="text-gray-500 text-sm line-clamp-2 mb-2">
                              {product.description}
                            </p>
                            <div className="flex justify-between items-center">
                              <div className="flex flex-wrap gap-1">
                                {product.ingredients.slice(0, 3).map((ingredient, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {ingredient}
                                  </Badge>
                                ))}
                                {product.ingredients.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{product.ingredients.length - 3}
                                  </Badge>
                                )}
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => addToCart(product)}
                              >
                                Adicionar
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center p-10 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Nenhum produto encontrado nesta categoria</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center p-10 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium">Nenhuma categoria encontrada</h3>
              <p className="text-gray-500 mt-2">O restaurante ainda não adicionou produtos ao cardápio.</p>
            </div>
          )}
        </div>
        
        {/* Cart Section */}
        <div>
          <div className="bg-gray-50 p-4 rounded-lg sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="h-5 w-5" />
              <h2 className="text-xl font-bold">Seu Pedido</h2>
            </div>
            
            {cart.length > 0 ? (
              <>
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="flex border rounded">
                          <button 
                            className="px-2 py-1 border-r"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="px-2 py-1">{item.quantity}</span>
                          <button 
                            className="px-2 py-1 border-l"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <span className="font-medium line-clamp-1">
                          {item.product.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(item.product.price * item.quantity)}
                        </span>
                        <button 
                          className="text-red-500 text-sm"
                          onClick={() => removeFromCart(item.id)}
                        >
                          x
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
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
                
                <Link to={`/restaurant/${slug}/checkout`}>
                  <Button className="w-full">Finalizar Pedido</Button>
                </Link>
              </>
            ) : (
              <div className="text-center p-6">
                <p className="text-gray-500 mb-4">Seu carrinho está vazio</p>
                <p className="text-sm text-gray-400">Adicione itens do menu para criar seu pedido</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="text-center">
        <Link to="/">
          <Button variant="outline">Voltar para a página inicial</Button>
        </Link>
      </div>
    </div>
  );
};

export default RestaurantMenu;
