import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Trash2,
  Plus,
  CreditCard,
  Search,
  ShoppingCart,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Tipos
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  menuCategoryId?: string;
  imageUrl?: string;
  active?: boolean;
}

interface Category {
  id: string;
  name: string;
  restaurantId?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
}

// Métodos de pagamento
const paymentMethods: PaymentMethod[] = [
  {
    id: "credit",
    name: "Cartão de Crédito",
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    id: "debit",
    name: "Cartão de Débito",
    icon: <CreditCard className="w-4 h-4" />,
  },
  { id: "cash", name: "Dinheiro", icon: <DollarSign className="w-4 h-4" /> },
  { id: "pix", name: "PIX", icon: <DollarSign className="w-4 h-4" /> },
];

// Componente de imagem com fallback
const ProductImage = ({ product }: { product: Product }) => {
  const [error, setError] = useState(false);
  const fallbackUrl = `https://placehold.co/400x300?text=${encodeURIComponent(
    product.name || "Produto"
  )}`;

  // Se houver erro ou imageUrl não existir, usar fallback
  const imageUrl = error || !product.imageUrl ? fallbackUrl : product.imageUrl;

  return (
    <div className="relative w-full h-40 bg-gray-100">
      <img
        src={imageUrl}
        alt={product.name}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
};

const PDV = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [currentTab, setCurrentTab] = useState("products");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);

  // Buscar categorias
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["menu-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("MenuCategory")
        .select("*")
        .order("name");

      if (error) {
        throw new Error(error.message);
      }

      return data as Category[];
    },
  });

  // Buscar produtos
  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["products", activeCategory],
    queryFn: async () => {
      let query = supabase.from("Product").select("*");

      if (activeCategory) {
        query = query.eq("menuCategoryId", activeCategory);
      }

      const { data, error } = await query.order("name");

      if (error) {
        throw new Error(error.message);
      }

      return data.map((product) => {
        // Melhorar a detecção de URLs válidas
        const rawImgUrl =
          product.imageUrl ||
          (product as { image_url?: string }).image_url ||
          null;

        // Verificar se a URL é válida (não vazia e começa com http/https)
        const isValidImageUrl =
          typeof rawImgUrl === "string" &&
          rawImgUrl.trim() !== "" &&
          (rawImgUrl.startsWith("http://") || rawImgUrl.startsWith("https://"));

        return {
          ...product,
          price: product.price || 0,
          // Usar URL válida ou placeholder específico para o produto
          imageUrl: isValidImageUrl
            ? rawImgUrl
            : `https://placehold.co/400x300?text=${encodeURIComponent(
                product.name || "Produto"
              )}`,
          description: product.description || "Sem descrição",
          active: true,
        };
      }) as Product[];
    },
  });

  // Produtos filtrados
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) =>
      searchTerm
        ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    );
  }, [products, searchTerm]);

  // Adicionar item ao carrinho
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);

      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });

    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao carrinho.`,
    });
  };

  // Remover item do carrinho
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Alterar quantidade do item
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Calcular total do carrinho
  const calculateTotal = () => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  // Limpar carrinho
  const clearCart = () => {
    setCart([]);
    setCustomerName("");
    setSelectedPaymentMethod(null);
  };

  // Finalizar venda
  const finishSale = () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description:
          "Adicione produtos ao carrinho antes de finalizar a venda.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPaymentMethod) {
      toast({
        title: "Selecione um método de pagamento",
        description:
          "É necessário selecionar um método de pagamento para continuar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Simulando processamento
    setTimeout(() => {
      const saleData = {
        items: cart,
        total: calculateTotal(),
        paymentMethod: selectedPaymentMethod,
        customer: customerName || "Cliente não identificado",
        date: new Date().toISOString(),
      };

      console.log("Venda finalizada:", saleData);

      toast({
        title: "Venda finalizada com sucesso!",
        description: `Total: ${formatCurrency(calculateTotal())}`,
      });

      clearCart();
      setCurrentTab("products");
      setLoading(false);
    }, 1500);
  };

  // Componente de esqueleto para carregamento
  const ProductSkeleton = () => (
    <Card className="border shadow-sm">
      <Skeleton className="h-40 w-full" />
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="w-3/4">
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mt-1" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-10 w-full mt-3" />
      </CardContent>
    </Card>
  );

  return (
    <div className="container max-w-full py-6 px-4 md:px-6">
      <h1 className="text-2xl md:text-3xl font-bold flex items-center mb-6">
        <ShoppingCart className="mr-2 h-6 w-6 md:h-8 md:w-8" />
        Ponto de Venda (PDV)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Produtos e Categorias */}
        <div className="lg:col-span-2">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="products" className="flex-1">
                Produtos
              </TabsTrigger>
              <TabsTrigger value="checkout" className="flex-1">
                Finalizar Venda
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle>Produtos</CardTitle>
                    <div className="relative w-full md:max-w-sm">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Buscar produtos..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto pb-2">
                    <div className="flex flex-nowrap gap-2 min-w-max py-1">
                      <Button
                        variant={
                          activeCategory === null ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setActiveCategory(null)}
                      >
                        Todos
                      </Button>
                      {categoriesLoading ? (
                        <>
                          <Skeleton className="h-9 w-24" />
                          <Skeleton className="h-9 w-24" />
                          <Skeleton className="h-9 w-24" />
                        </>
                      ) : (
                        categories?.map((category) => (
                          <Button
                            key={category.id}
                            variant={
                              activeCategory === category.id
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => setActiveCategory(category.id)}
                          >
                            {category.name}
                          </Button>
                        ))
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {productsLoading || !products ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array(6)
                        .fill(0)
                        .map((_, i) => (
                          <ProductSkeleton key={i} />
                        ))}
                    </div>
                  ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredProducts.map((product) => (
                        <Card
                          key={product.id}
                          className="border shadow-sm hover:shadow-md transition-shadow"
                        >
                          <ProductImage product={product} />
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-medium text-lg">
                                  {product.name}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {product.description}
                                </p>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-base font-semibold"
                              >
                                {formatCurrency(product.price || 0)}
                              </Badge>
                            </div>
                            <Button
                              className="w-full mt-3"
                              onClick={() => addToCart(product)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Adicionar ao Carrinho
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="col-span-full py-8 text-center">
                      <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <p className="mt-2 text-lg font-medium">
                        Nenhum produto encontrado
                      </p>
                      <p className="text-muted-foreground">
                        Tente ajustar sua busca ou selecione outra categoria.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          setSearchTerm("");
                          setActiveCategory(null);
                          refetchProducts();
                        }}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Limpar filtros
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="checkout">
              <Card>
                <CardHeader>
                  <CardTitle>Finalizar Venda</CardTitle>
                  <CardDescription>
                    Selecione o método de pagamento e confirme os itens
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="customerName">
                      Nome do Cliente (opcional)
                    </Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Digite o nome do cliente"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Método de Pagamento</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {paymentMethods.map((method) => (
                        <Button
                          key={method.id}
                          variant={
                            selectedPaymentMethod === method.id
                              ? "default"
                              : "outline"
                          }
                          className="justify-start"
                          onClick={() => setSelectedPaymentMethod(method.id)}
                        >
                          {method.icon}
                          <span className="ml-2">{method.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between font-medium mb-4">
                      <span>Total</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentTab("products")}
                      >
                        Voltar
                      </Button>
                      <Button
                        onClick={finishSale}
                        disabled={
                          loading || cart.length === 0 || !selectedPaymentMethod
                        }
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Processando...
                          </span>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Finalizar Venda
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Carrinho */}
        <div>
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Carrinho
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground"
                  onClick={clearCart}
                  disabled={cart.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Limpar
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="mt-2 text-muted-foreground">Carrinho vazio</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-start pb-4 border-b"
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(item.product.price)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-muted-foreground"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                          >
                            +
                          </Button>
                          <span className="ml-auto font-medium">
                            {formatCurrency(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex-col pt-0">
              <div className="pt-4 border-t w-full flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>

              <Button
                className="w-full mt-4"
                onClick={() => setCurrentTab("checkout")}
                disabled={cart.length === 0}
              >
                Finalizar Compra
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PDV;
