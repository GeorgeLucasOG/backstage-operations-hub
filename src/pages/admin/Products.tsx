import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, X, Loader2, Store } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUploadField from "@/components/ImageUploadField";
import { useAuth } from "@/hooks/useAuth";
import { Product, useDataService } from "@/services/dataService";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const Products = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const dataService = useDataService();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    category: "",
    isAvailable: true,
  });
  const [newIngredient, setNewIngredient] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  const { data: restaurantsData } = useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      console.log("Consultando restaurantes disponíveis...");

      const { data, error } = await supabase
        .from("Restaurant")
        .select("id, name")
        .limit(10);

      if (error) {
        console.error("Erro ao consultar restaurantes:", error);
        return [];
      }

      console.log("Restaurantes disponíveis:", data);
      return data || [];
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      console.log(
        "Consultando categorias do banco de dados na página de Products..."
      );
      const { data, error } = await supabase
        .from("MenuCategory")
        .select("*, Restaurant:restaurantId(name)");

      if (error) {
        console.error("Erro ao consultar categorias:", error);
        return [];
      }

      console.log("Categorias obtidas na página de Products:", data);
      return data || [];
    },
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const productsData = await dataService.products.getAll();
        setProducts(productsData);

        // Extrair categorias únicas dos produtos
        const uniqueCategories = [
          ...new Set(productsData.map((product) => product.category)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os produtos",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [toast, dataService]);

  const updateMutation = useMutation({
    mutationFn: async (updatedProduct: {
      id: string;
      name: string;
      description: string;
      price: number;
      imageUrl: string;
      menuCategoryId: string | null;
      ingredients: string[]; // Array de ingredientes
    }) => {
      console.log("Iniciando atualização do produto:", updatedProduct);

      const now = new Date().toISOString();

      // Alguns bancos de dados podem exigir que arrays sejam armazenados como JSON strings
      // Por padrão, vamos manter como array, pois o Supabase geralmente suporta arrays diretamente
      console.log("Ingredientes que serão salvos:", updatedProduct.ingredients);

      const { data, error } = await supabase
        .from("Product")
        .update({
          name: updatedProduct.name,
          description: updatedProduct.description,
          price: updatedProduct.price,
          imageUrl: updatedProduct.imageUrl,
          menuCategoryId: updatedProduct.menuCategoryId,
          ingredients: updatedProduct.ingredients, // Salvando os ingredientes
          updatedAt: now,
        })
        .eq("id", updatedProduct.id)
        .select();

      if (error) {
        console.error("Erro ao atualizar produto:", error);
        throw new Error(`Erro ao atualizar produto: ${error.message}`);
      }

      console.log("Produto atualizado com sucesso:", data);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsEditOpen(false);
      setEditingProduct(null);
      toast({
        title: "Sucesso",
        description:
          "Produto atualizado com sucesso! Os ingredientes foram salvos.",
      });
    },
    onError: (error) => {
      console.error("Erro na atualização:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao atualizar produto",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Iniciando exclusão do produto:", id);

      const { error } = await supabase.from("Product").delete().eq("id", id);

      if (error) {
        console.error("Erro ao excluir produto:", error);
        throw new Error(`Erro ao excluir produto: ${error.message}`);
      }

      console.log("Produto excluído com sucesso");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro na exclusão:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao excluir produto",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "price") {
      // Converter para número, e garantir que é positivo
      const numValue = parseFloat(value);
      setNewProduct((prev) => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : Math.max(0, numValue),
      }));
    } else {
      setNewProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!editingProduct) return;

    const { name, value } = e.target;

    if (name === "price") {
      // Converter para número, e garantir que é positivo
      const numValue = parseFloat(value);
      setEditingProduct((prev) => ({
        ...prev!,
        [name]: isNaN(numValue) ? 0 : Math.max(0, numValue),
      }));
    } else {
      setEditingProduct((prev) => ({ ...prev!, [name]: value }));
    }
  };

  const handleEditSelectChange = (name: string, value: string) => {
    if (!editingProduct) return;
    setEditingProduct((prev) => ({ ...prev!, [name]: value }));
  };

  const handleUpdateImageUrl = (url: string) => {
    setNewProduct((prev) => ({ ...prev, imageUrl: url }));
  };

  const handleUpdateEditImageUrl = (url: string) => {
    if (editingProduct) {
      setEditingProduct((prev) => ({ ...prev!, imageUrl: url }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        imageUrl: newProduct.imageUrl,
        category: newProduct.category,
        isAvailable: newProduct.isAvailable,
      };

      await dataService.products.create(productData);

      // Recarregar produtos
      const updatedProducts = await dataService.products.getAll();
      setProducts(updatedProducts);

      // Extrair categorias únicas dos produtos
      const uniqueCategories = [
        ...new Set(updatedProducts.map((product) => product.category)),
      ];
      setCategories(uniqueCategories);

      // Limpar formulário e fechar modal
      setNewProduct({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        category: "",
        isAvailable: true,
      });

      setIsOpen(false);

      toast({
        title: "Sucesso",
        description: "Produto criado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o produto",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProduct) return;

    setIsSubmitting(true);

    try {
      const productData = {
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        imageUrl: editingProduct.imageUrl,
        category: editingProduct.category,
        isAvailable: editingProduct.isAvailable,
      };

      await dataService.products.update(editingProduct.id, productData);

      // Recarregar produtos
      const updatedProducts = await dataService.products.getAll();
      setProducts(updatedProducts);

      // Extrair categorias únicas dos produtos
      const uniqueCategories = [
        ...new Set(updatedProducts.map((product) => product.category)),
      ];
      setCategories(uniqueCategories);

      // Limpar formulário e fechar modal
      setEditingProduct(null);
      setIsEditOpen(false);

      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o produto",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await dataService.products.remove(id);

      // Recarregar produtos
      const updatedProducts = await dataService.products.getAll();
      setProducts(updatedProducts);

      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o produto",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie os produtos do seu restaurante
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Store className="h-3 w-3" />
            <span>{user?.businessName}</span>
          </Badge>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Produto</DialogTitle>
                <DialogDescription>
                  Preencha os dados para adicionar um novo produto ao seu
                  cardápio.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newProduct.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    name="category"
                    value={newProduct.category}
                    onValueChange={(value) =>
                      handleSelectChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category, index) => (
                        <SelectItem key={index} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                      <SelectItem value="nova">+ Nova Categoria</SelectItem>
                    </SelectContent>
                  </Select>

                  {newProduct.category === "nova" && (
                    <Input
                      className="mt-2"
                      placeholder="Digite o nome da nova categoria"
                      onChange={(e) =>
                        handleSelectChange("category", e.target.value)
                      }
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Imagem do Produto</Label>
                  <ImageUploadField
                    currentUrl={newProduct.imageUrl}
                    onUrlChange={handleUpdateImageUrl}
                    folder="products"
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Produto"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mt-4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium">Nenhum produto cadastrado</h3>
          <p className="text-muted-foreground mt-1">
            Comece adicionando seu primeiro produto ao cardápio
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover mr-3"
                        />
                      )}
                      <div>
                        <p>{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.description.length > 50
                            ? `${product.description.substring(0, 50)}...`
                            : product.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog de edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Edite os dados do produto selecionado.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome do Produto</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={editingProduct.name}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={editingProduct.description}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-price">Preço (R$)</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingProduct.price}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Categoria</Label>
                <Select
                  name="category"
                  value={editingProduct.category}
                  onValueChange={(value) =>
                    handleEditSelectChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category, index) => (
                      <SelectItem key={index} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="nova">+ Nova Categoria</SelectItem>
                  </SelectContent>
                </Select>

                {editingProduct.category === "nova" && (
                  <Input
                    className="mt-2"
                    placeholder="Digite o nome da nova categoria"
                    onChange={(e) =>
                      handleEditSelectChange("category", e.target.value)
                    }
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Imagem do Produto</Label>
                <ImageUploadField
                  currentUrl={editingProduct.imageUrl}
                  onUrlChange={handleUpdateEditImageUrl}
                  folder="products"
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Atualizar Produto"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
