import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Tipos
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  categoryId: string;
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

// Dados de exemplo para produtos
const exampleProducts: Product[] = [
  {
    id: "p1",
    name: "X-Burger",
    price: 19.9,
    description: "Hambúrguer com queijo, alface e tomate",
    categoryId: "c1",
    imageUrl: "https://picsum.photos/200",
    active: true,
  },
  {
    id: "p2",
    name: "X-Salada",
    price: 22.9,
    description: "Hambúrguer com queijo, alface, tomate e maionese",
    categoryId: "c1",
    imageUrl: "https://picsum.photos/200",
    active: true,
  },
  {
    id: "p3",
    name: "X-Bacon",
    price: 24.9,
    description: "Hambúrguer com queijo, bacon, alface e tomate",
    categoryId: "c1",
    imageUrl: "https://picsum.photos/200",
    active: true,
  },
  {
    id: "p4",
    name: "Refrigerante Lata",
    price: 5.5,
    description: "Lata 350ml",
    categoryId: "c2",
    imageUrl: "https://picsum.photos/200",
    active: true,
  },
  {
    id: "p5",
    name: "Batata Frita",
    price: 12.9,
    description: "Porção pequena",
    categoryId: "c3",
    imageUrl: "https://picsum.photos/200",
    active: true,
  },
];

// Categorias de exemplo
const categories = [
  { id: "c1", name: "Hambúrgueres" },
  { id: "c2", name: "Bebidas" },
  { id: "c3", name: "Acompanhamentos" },
];

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

  // Produtos filtrados
  const filteredProducts = exampleProducts.filter(
    (product) =>
      (activeCategory ? product.categoryId === activeCategory : true) &&
      (searchTerm
        ? product.name.toLowerCase().includes(searchTerm.toLowerCase())
        : true) &&
      product.active
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

      toast({
        title: "Venda finalizada com sucesso!",
        description: `Total: ${formatCurrency(calculateTotal())}`,
      });

      clearCart();
      setCurrentTab("products");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold flex items-center mb-6">
        <ShoppingCart className="mr-2 h-8 w-8" />
        Ponto de Venda (PDV)
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Produtos e Categorias */}
        <div className="md:col-span-2">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="products">Produtos</TabsTrigger>
              <TabsTrigger value="checkout">Finalizar Venda</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Produtos</CardTitle>
                    <div className="relative w-full max-w-sm">
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

                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button
                      variant={activeCategory === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveCategory(null)}
                    >
                      Todos
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={
                          activeCategory === category.id ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setActiveCategory(category.id)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <Card key={product.id} className="overflow-hidden">
                        <div
                          className="h-32 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${product.imageUrl})`,
                          }}
                        />
                        <CardContent className="p-4">
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
                          <Button
                            className="w-full mt-2"
                            size="sm"
                            onClick={() => addToCart(product)}
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            Adicionar
                          </Button>
                        </CardContent>
                      </Card>
                    ))}

                    {filteredProducts.length === 0 && (
                      <div className="col-span-full py-8 text-center">
                        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                        <p className="mt-2 text-lg font-medium">
                          Nenhum produto encontrado
                        </p>
                        <p className="text-muted-foreground">
                          Tente ajustar sua busca ou selecione outra categoria.
                        </p>
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
                          "Processando..."
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
          <Card>
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
                <div className="space-y-4">
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

                  <div className="pt-4 border-t flex justify-between font-medium text-lg">
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
