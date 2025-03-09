import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
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
import { Skeleton } from "@/components/ui/skeleton";
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
  ReceiptText,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Estilos globais para scrollbar (adicionados ao componente)
import "./pdv-scrollbar.css";

// Criar cliente Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Definição de estilos CSS inline para scrollbar
const scrollbarStyles = {
  categoriesScrollbar: `
    scrollbar-thin 
    scrollbar-thumb-rounded-md 
    scrollbar-track-transparent
    hover:scrollbar-thumb-slate-300
    scrollbar-thumb-slate-200/50
    transition-colors
    duration-200
  `,
};

// Tipos
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  menuCategoryId: string;
  imageUrl: string;
  active?: boolean;
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

interface Category {
  id: string;
  name: string;
}

// Funções para buscar dados do Supabase
const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("Product")
    .select("*")
    .order("name");

  if (error) {
    console.error("Erro ao buscar produtos:", error);
    throw new Error(error.message);
  }

  return data || [];
};

const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("MenuCategory")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("Erro ao buscar categorias:", error);
    throw new Error(error.message);
  }

  return data || [];
};

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
  { id: "pix", name: "PIX", icon: <ReceiptText className="w-4 h-4" /> },
];

// Componente principal do PDV
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

  // Buscar produtos usando React Query
  const {
    data: products = [],
    isLoading: isLoadingProducts,
    error: productsError,
  } = useQuery({
    queryKey: ["supabase-products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });

  // Buscar categorias usando React Query
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["supabase-categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });

  // Exibir toast de erro se houver falha na carga de produtos
  useEffect(() => {
    if (productsError) {
      toast({
        title: "Erro ao carregar produtos",
        description:
          "Não foi possível carregar os produtos. Por favor, tente novamente.",
        variant: "destructive",
      });
      console.error("Erro detalhado:", productsError);
    }
  }, [productsError, toast]);

  // Produtos filtrados
  const filteredProducts = products.filter(
    (product) =>
      (activeCategory ? product.menuCategoryId === activeCategory : true) &&
      (searchTerm
        ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true)
  );

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

      // Aqui você pode registrar a venda no Supabase
      // supabase.from('Orders').insert([saleData])...

      toast({
        title: "Venda finalizada com sucesso!",
        description: `Total: ${formatCurrency(calculateTotal())}`,
      });

      clearCart();
      setCurrentTab("products");
      setLoading(false);
    }, 1500);
  };

  // Componente de carregamento
  if (isLoadingProducts && filteredProducts.length === 0) {
    return (
      <div className="container py-6">
        <h1 className="text-3xl font-bold flex items-center mb-6">
          <ShoppingCart className="mr-2 h-8 w-8" />
          Ponto de Venda (PDV)
        </h1>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mensagem de erro caso não encontre produtos
  if (!isLoadingProducts && products.length === 0) {
    return (
      <div className="container py-6">
        <h1 className="text-3xl font-bold flex items-center mb-6">
          <ShoppingCart className="mr-2 h-8 w-8" />
          Ponto de Venda (PDV)
        </h1>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500" />
            <h2 className="text-xl font-semibold">Nenhum produto encontrado</h2>
            <p className="text-muted-foreground max-w-md">
              Não há produtos cadastrados no sistema. Por favor, cadastre
              produtos na seção de Produtos para usar o PDV.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl md:text-3xl font-bold flex items-center mb-4 md:mb-6">
        <ShoppingCart className="mr-2 h-6 w-6 md:h-8 md:w-8" />
        Ponto de Venda (PDV)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Produtos e Categorias */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="products" className="flex-1">
                Produtos
              </TabsTrigger>
              <TabsTrigger value="checkout" className="flex-1">
                Finalizar Venda
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <Card>
                <CardHeader className="pb-3 space-y-3">
                  <CardTitle>Produtos</CardTitle>
                  <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar produtos..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="border rounded-md">
                    <div
                      className={cn(
                        "overflow-x-auto",
                        scrollbarStyles.categoriesScrollbar
                      )}
                    >
                      <div className="flex space-x-2 p-2">
                        <Button
                          variant={
                            activeCategory === null ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setActiveCategory(null)}
                          className="flex-shrink-0"
                        >
                          Todos
                        </Button>
                        {isLoadingCategories
                          ? Array(3)
                              .fill(0)
                              .map((_, i) => (
                                <Skeleton
                                  key={i}
                                  className="h-9 w-24 flex-shrink-0"
                                />
                              ))
                          : categories.map((category) => (
                              <Button
                                key={category.id}
                                variant={
                                  activeCategory === category.id
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => setActiveCategory(category.id)}
                                className="flex-shrink-0"
                              >
                                {category.name}
                              </Button>
                            ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {!isLoadingProducts &&
                      filteredProducts.map((product) => (
                        <Card
                          key={product.id}
                          className="overflow-hidden flex flex-col h-full"
                        >
                          <div
                            className="h-32 bg-cover bg-center bg-gray-100"
                            style={{
                              backgroundImage: product.imageUrl
                                ? `url(${product.imageUrl})`
                                : "none",
                            }}
                          >
                            {!product.imageUrl && (
                              <div className="h-full flex items-center justify-center text-gray-400">
                                <ShoppingCart className="h-12 w-12 opacity-20" />
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4 flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium">{product.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {product.description}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {formatCurrency(product.price)}
                              </Badge>
                            </div>
                          </CardContent>
                          <CardFooter className="p-4 pt-0">
                            <Button
                              className="w-full"
                              size="sm"
                              onClick={() => addToCart(product)}
                            >
                              <Plus className="mr-1 h-4 w-4" />
                              Adicionar
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}

                    {isLoadingProducts &&
                      Array(6)
                        .fill(0)
                        .map((_, i) => (
                          <Card key={i} className="overflow-hidden">
                            <Skeleton className="h-32 w-full" />
                            <CardContent className="p-4">
                              <Skeleton className="h-6 w-3/4 mb-2" />
                              <Skeleton className="h-4 w-full mb-1" />
                              <Skeleton className="h-4 w-2/3 mb-4" />
                              <Skeleton className="h-9 w-full" />
                            </CardContent>
                          </Card>
                        ))}

                    {!isLoadingProducts && filteredProducts.length === 0 && (
                      <div className="col-span-full py-8 text-center">
                        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                        <p className="mt-2 text-lg font-medium">
                          Nenhum produto encontrado
                        </p>
                        <p className="text-muted-foreground">
                          Tente ajustar sua busca ou selecione outra categoria.
                        </p>
                        {activeCategory && (
                          <Button
                            className="mt-4"
                            variant="outline"
                            onClick={() => setActiveCategory(null)}
                          >
                            Mostrar todos os produtos
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
                          <span className="ml-2 text-sm md:text-base">
                            {method.name}
                          </span>
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
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Processando...
                          </>
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
        <div className="order-1 lg:order-2">
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

            <CardContent className="pb-6">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="mt-2 text-muted-foreground">Carrinho vazio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <ScrollArea className="h-[calc(100vh-25rem)] pr-3">
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-start pb-4 border-b"
                        >
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">
                                  {item.product.name}
                                </p>
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
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity - 1
                                  )
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
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity + 1
                                  )
                                }
                              >
                                +
                              </Button>
                              <span className="ml-auto font-medium">
                                {formatCurrency(
                                  item.product.price * item.quantity
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="pt-4 border-t flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => setCurrentTab("checkout")}
                    disabled={cart.length === 0}
                  >
                    Finalizar Compra
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PDV;
