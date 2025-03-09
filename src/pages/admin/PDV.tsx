import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import "./pdv-scrollbar.css";
import { useToast } from "@/components/ui/use-toast";
import { ProductType } from "@/types/product";
import { CategoryType } from "@/types/category";
import { useQuery } from "@tanstack/react-query";

const PDV = () => {
  const [cart, setCart] = useState<ProductType[]>([]);
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Use environment variable with a default fallback
  const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["menu-categories"],
    queryFn: async () => {
      const response = await fetch(`${apiBaseUrl}/categories`);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      return response.json();
    },
  });

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["products", activeCategory],
    queryFn: async () => {
      let endpoint = `${apiBaseUrl}/products`;
      if (activeCategory) {
        endpoint += `?category=${activeCategory}`;
      }
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
  });

  const addToCart = (product: ProductType) => {
    setCart((prevCart) => [...prevCart, product]);
    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao carrinho.`,
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      newCart.splice(index, 1);
      return newCart;
    });
    toast({
      title: "Produto removido",
      description: `Produto removido do carrinho.`,
    });
  };

  const checkout = () => {
    // Implementar lógica de checkout aqui
    toast({
      title: "Pedido finalizado",
      description: "O pedido foi finalizado com sucesso!",
    });
    setCart([]);
    setTableNumber("");
    setCustomerName("");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">PDV - Ponto de Venda</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Produtos</CardTitle>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loadingCategories ? (
                <div>Carregando categorias...</div>
              ) : (
                <Tabs
                  defaultValue="all"
                  className="w-full"
                  onValueChange={(value) =>
                    setActiveCategory(value === "all" ? null : value)
                  }
                >
                  <TabsList className="w-full overflow-x-auto flex-wrap justify-start h-auto py-1">
                    <TabsTrigger value="all" className="mb-1">
                      Todos
                    </TabsTrigger>
                    {categories?.map((category: CategoryType) => (
                      <TabsTrigger
                        key={category.id}
                        value={category.id}
                        className="mb-1"
                      >
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="all" className="mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {loadingProducts ? (
                        <div>Carregando produtos...</div>
                      ) : (
                        products
                          ?.filter((product: ProductType) =>
                            product.name
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                          )
                          .map((product: ProductType) => (
                            <Button
                              key={product.id}
                              variant="outline"
                              className="h-auto flex flex-col p-4 items-center justify-between text-center hover:bg-gray-100"
                              onClick={() => addToCart(product)}
                            >
                              <div className="w-16 h-16 bg-gray-200 rounded-md mb-2 overflow-hidden">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    Sem imagem
                                  </div>
                                )}
                              </div>
                              <span className="font-medium">{product.name}</span>
                              <Badge className="mt-1" variant="secondary">
                                R${" "}
                                {product.price.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </Badge>
                            </Button>
                          ))
                      )}
                    </div>
                  </TabsContent>

                  {categories?.map((category: CategoryType) => (
                    <TabsContent key={category.id} value={category.id}>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {loadingProducts ? (
                          <div>Carregando produtos...</div>
                        ) : (
                          products
                            ?.filter((product: ProductType) =>
                              product.name
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                            )
                            .map((product: ProductType) => (
                              <Button
                                key={product.id}
                                variant="outline"
                                className="h-auto flex flex-col p-4 items-center justify-between text-center hover:bg-gray-100"
                                onClick={() => addToCart(product)}
                              >
                                <div className="w-16 h-16 bg-gray-200 rounded-md mb-2 overflow-hidden">
                                  {product.image ? (
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      Sem imagem
                                    </div>
                                  )}
                                </div>
                                <span className="font-medium">
                                  {product.name}
                                </span>
                                <Badge className="mt-1" variant="secondary">
                                  R${" "}
                                  {product.price.toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                  })}
                                </Badge>
                              </Button>
                            ))
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Carrinho</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="table">Mesa</Label>
                  <Input
                    id="table"
                    placeholder="Número da mesa"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="customer">Cliente</Label>
                  <Input
                    id="customer"
                    placeholder="Nome do cliente"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    Carrinho vazio
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item, index) => (
                      <div
                        key={`${item.id}-${index}`}
                        className="flex justify-between items-center border-b pb-2"
                      >
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            R${" "}
                            {item.price.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(index)}
                          className="text-red-500 h-auto py-1 px-2"
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="payment">Método de Pagamento</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger id="payment">
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="credit">Cartão de Crédito</SelectItem>
                      <SelectItem value="debit">Cartão de Débito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>
                    R${" "}
                    {cart
                      .reduce((sum, item) => sum + item.price, 0)
                      .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={checkout}
                  disabled={cart.length === 0}
                >
                  Finalizar Pedido
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PDV;
