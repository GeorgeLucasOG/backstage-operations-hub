import { useState } from "react";
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
import { Plus, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import ImageUploadField from "@/components/ImageUploadField";

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  menuCategoryId: string | null;
  restaurantId: string;
  ingredients: string[];
  createdAt: string;
  updatedAt: string;
}

const Products = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category_id: "",
    ingredients: [] as string[],
  });
  const [newIngredient, setNewIngredient] = useState("");

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

  const {
    data: products,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      console.log("Consultando produtos...");
      const { data, error } = await supabase
        .from("Product")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Erro ao consultar produtos:", error);
        throw new Error("Não foi possível carregar os produtos");
      }

      console.log("Dados de produtos obtidos:", data);
      if (data && data.length > 0) {
        console.log(
          "Exemplo de ingredientes do primeiro produto:",
          data[0].ingredients
        );
        console.log("Tipo dos ingredientes:", typeof data[0].ingredients);
      }

      return data as Product[];
    },
  });

  const { data: categories } = useQuery({
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
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddIngredient = () => {
    if (!newIngredient.trim()) return;

    if (isEditOpen && editingProduct) {
      const ingredientToAdd = newIngredient.trim();
      console.log(
        `Adicionando ingrediente "${ingredientToAdd}" ao produto em edição`
      );

      // Garantir que ingredients é sempre um array
      const currentIngredients = Array.isArray(editingProduct.ingredients)
        ? editingProduct.ingredients
        : [];

      setEditingProduct({
        ...editingProduct,
        ingredients: [...currentIngredients, ingredientToAdd],
      });
    } else {
      setNewProduct({
        ...newProduct,
        ingredients: [...newProduct.ingredients, newIngredient.trim()],
      });
    }
    setNewIngredient("");
  };

  const handleRemoveIngredient = (index: number) => {
    if (isEditOpen && editingProduct) {
      // Garantir que ingredients é sempre um array
      const currentIngredients = Array.isArray(editingProduct.ingredients)
        ? [...editingProduct.ingredients]
        : [];

      console.log(
        `Removendo ingrediente "${currentIngredients[index]}" do produto em edição`
      );

      currentIngredients.splice(index, 1);
      setEditingProduct({
        ...editingProduct,
        ingredients: currentIngredients,
      });
    } else {
      const updatedIngredients = [...newProduct.ingredients];
      updatedIngredients.splice(index, 1);
      setNewProduct({
        ...newProduct,
        ingredients: updatedIngredients,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Iniciando adição de produto com dados:", newProduct);

      if (!newProduct.name.trim()) {
        throw new Error("O nome do produto é obrigatório");
      }

      if (!newProduct.price || isNaN(parseFloat(newProduct.price))) {
        throw new Error("O preço deve ser um número válido");
      }

      if (!restaurantsData || restaurantsData.length === 0) {
        throw new Error(
          "Não há restaurantes disponíveis. Crie um restaurante primeiro."
        );
      }

      let validRestaurantId = restaurantsData[0]?.id;

      if (newProduct.category_id && categories) {
        const selectedCategory = categories.find(
          (cat: { id: string; restaurantId?: string }) =>
            cat.id === newProduct.category_id
        );
        if (selectedCategory && selectedCategory.restaurantId) {
          console.log(
            "Usando restaurante da categoria selecionada:",
            selectedCategory.restaurantId
          );
          validRestaurantId = selectedCategory.restaurantId;
        }
      }

      if (!validRestaurantId) {
        throw new Error(
          "Não foi possível determinar um restaurante válido para este produto."
        );
      }

      const id = generateUUID();
      const now = new Date().toISOString();

      const productPayload = {
        id,
        name: newProduct.name.trim(),
        description: newProduct.description?.trim() || "",
        price: parseFloat(newProduct.price) || 0,
        imageUrl:
          newProduct.image_url?.trim() || "https://via.placeholder.com/150",
        menuCategoryId: newProduct.category_id || null,
        restaurantId: validRestaurantId,
        ingredients: newProduct.ingredients,
        createdAt: now,
        updatedAt: now,
      };

      const { data, error } = await supabase
        .from("Product")
        .insert([productPayload])
        .select();

      if (error) throw error;

      toast({
        title: "Produto adicionado",
        description: "O produto foi adicionado com sucesso",
      });

      setIsOpen(false);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        image_url: "",
        category_id: "",
        ingredients: [],
      });

      refetch();
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível adicionar o produto",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageUrl = (product: Product): string => {
    return product.imageUrl || "https://via.placeholder.com/150";
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handleEdit = (product: Product) => {
    console.log("Editando produto:", product);

    // Garantir que os ingredientes estejam no formato correto
    let normalizedIngredients: string[] = [];

    // Verificar se há ingredientes e convertê-los para array se necessário
    if (product.ingredients) {
      if (Array.isArray(product.ingredients)) {
        normalizedIngredients = product.ingredients;
      } else if (typeof product.ingredients === "string") {
        // Tenta converter de JSON se for uma string
        try {
          normalizedIngredients = JSON.parse(product.ingredients);
        } catch (e) {
          console.warn("Erro ao converter ingredients de JSON:", e);
          // Se falhar, trata como uma string única
          normalizedIngredients = [product.ingredients];
        }
      }
    }

    console.log("Ingredientes normalizados:", normalizedIngredients);

    // Atualizar o produto com ingredients normalizados
    setEditingProduct({
      ...product,
      ingredients: normalizedIngredients,
    });
    setIsEditOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProduct) return;

    setIsSubmitting(true);

    try {
      if (!editingProduct.name.trim()) {
        throw new Error("O nome do produto é obrigatório");
      }

      if (isNaN(editingProduct.price) || editingProduct.price <= 0) {
        throw new Error("O preço deve ser um número válido maior que zero");
      }

      // Certificar-se de que ingredients é um array não-nulo
      const ingredients = Array.isArray(editingProduct.ingredients)
        ? editingProduct.ingredients
        : [];

      console.log(
        "Enviando produto para atualização com ingredientes:",
        ingredients
      );
      console.log("Detalhes completos do produto:", editingProduct);

      updateMutation.mutate({
        id: editingProduct.id,
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        imageUrl: editingProduct.imageUrl || "https://via.placeholder.com/150",
        menuCategoryId: editingProduct.menuCategoryId,
        ingredients: ingredients, // Garantindo que é um array válido
      });

      // Mensagem visual temporária
      toast({
        title: "Processando...",
        description: "Salvando produto e seus ingredientes...",
      });
    } catch (error) {
      console.error("Erro ao processar edição:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao atualizar produto",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (!editingProduct) return;

    setEditingProduct((prev) => {
      if (!prev) return prev;

      if (name === "price") {
        return { ...prev, [name]: parseFloat(value) || 0 };
      } else if (name === "category_id") {
        return { ...prev, menuCategoryId: value || null };
      } else if (name === "image_url") {
        return { ...prev, imageUrl: value };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  const handleAddEditIngredient = () => {
    if (!newIngredient.trim() || !editingProduct) return;

    setEditingProduct({
      ...editingProduct,
      ingredients: [...(editingProduct.ingredients || []), newIngredient],
    });
    setNewIngredient("");
  };

  const handleRemoveEditIngredient = (index: number) => {
    if (!editingProduct) return;

    const newIngredients = [...editingProduct.ingredients];
    newIngredients.splice(index, 1);

    setEditingProduct({
      ...editingProduct,
      ingredients: newIngredients,
    });
  };

  const handleUpdateImageUrl = (url: string) => {
    if (!editingProduct) return;

    setEditingProduct({
      ...editingProduct,
      imageUrl: url,
    });
  };

  const getIngredientsDisplay = (
    ingredients: string[] | string | null | undefined
  ): string => {
    if (!ingredients) return "Nenhum ingrediente";

    try {
      if (Array.isArray(ingredients)) {
        return ingredients.join(", ");
      } else if (typeof ingredients === "string") {
        try {
          // Tenta converter de JSON se for uma string
          const parsed = JSON.parse(ingredients);
          if (Array.isArray(parsed)) {
            return parsed.join(", ");
          }
          return ingredients;
        } catch (e) {
          // Se não for um JSON válido, retorna a string como está
          return ingredients;
        }
      }
      // Se não for nem array nem string, converte para string
      return String(ingredients);
    } catch (error) {
      console.error("Erro ao formatar ingredientes:", error, ingredients);
      return "Erro ao exibir ingredientes";
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Produtos</h1>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Adicionar Novo Produto
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Preencha todos os campos obrigatórios e adicione ingredientes
                para melhor informação ao cliente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Pizza Margherita"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={handleInputChange}
                    placeholder="Ex: 29.90"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newProduct.description}
                  onChange={handleInputChange}
                  placeholder="Descreva o produto..."
                  className="w-full min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Categoria</Label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={newProduct.category_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input text-sm"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} - {category.Restaurant?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Imagem do Produto</Label>
                  <div className="mt-1">
                    <ImageUploadField
                      id="productImage"
                      label=""
                      onUpload={(url) => {
                        setNewProduct({ ...newProduct, image_url: url });
                      }}
                      currentImageUrl={newProduct.image_url}
                      folder="products"
                      purpose="product-image"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ingredients">Ingredientes</Label>
                  <span className="text-xs text-muted-foreground">
                    Adicione os ingredientes para informar ao cliente
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    id="newIngredient"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    placeholder="Ex: Tomate"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddIngredient}
                    disabled={!newIngredient.trim()}
                  >
                    Adicionar
                  </Button>
                </div>

                <div className="mt-2">
                  {newProduct.ingredients.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2 p-2 bg-muted/20 rounded">
                      {newProduct.ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full"
                        >
                          <span className="text-sm">{ingredient}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(index)}
                            className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-muted-foreground/20 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Nenhum ingrediente adicionado
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    setNewProduct({
                      name: "",
                      description: "",
                      price: "",
                      image_url: "",
                      category_id: "",
                      ingredients: [],
                    });
                  }}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto order-1 sm:order-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>Salvar Produto</>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-white rounded-md shadow overflow-hidden">
          {/* Versão para desktop - escondida em telas pequenas */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Ingredientes</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={getImageUrl(product)}
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {product.description}
                      </TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell>
                        {product.ingredients &&
                        Array.isArray(product.ingredients) &&
                        product.ingredients.length > 0 ? (
                          <div className="max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {product.ingredients
                                .slice(0, 3)
                                .map((ingredient, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                  >
                                    {ingredient}
                                  </span>
                                ))}
                              {product.ingredients.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted">
                                  +{product.ingredients.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Sem ingredientes
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Nenhum produto encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Layout responsivo para mobile - visível apenas em telas pequenas */}
          <div className="md:hidden">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 p-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-muted/20 p-4 rounded-lg shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={getImageUrl(product)}
                        alt={product.name}
                        className="h-16 w-16 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{product.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                        <div className="mt-1 text-sm font-medium">
                          {formatPrice(product.price)}
                        </div>
                      </div>
                    </div>

                    {product.ingredients &&
                      Array.isArray(product.ingredients) &&
                      product.ingredients.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-xs font-medium text-muted-foreground mb-1">
                            Ingredientes:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {product.ingredients
                              .slice(0, 3)
                              .map((ingredient, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                >
                                  {ingredient}
                                </span>
                              ))}
                            {product.ingredients.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted">
                                +{product.ingredients.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                    <div className="mt-3 flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="text-xs px-2.5 py-1 h-8"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="text-xs px-2.5 py-1 h-8"
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4">
                <p className="text-muted-foreground">
                  Nenhum produto encontrado
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dialog para editar produto - tornando mais responsivo */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl">Editar Produto</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Atualize as informações do produto, incluindo ingredientes.
            </DialogDescription>
          </DialogHeader>
          {!editingProduct && (
            <div className="h-[300px] flex items-center justify-center">
              <div className="flex flex-col items-center text-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p>Carregando detalhes do produto...</p>
              </div>
            </div>
          )}
          {editingProduct && (
            <form onSubmit={handleEditSubmit} className="space-y-6 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome do Produto *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={editingProduct.name}
                    onChange={handleEditInputChange}
                    placeholder="Nome do produto"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-price">Preço (R$) *</Label>
                  <Input
                    id="edit-price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingProduct.price}
                    onChange={handleEditInputChange}
                    placeholder="0.00"
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={editingProduct.description}
                  onChange={handleEditInputChange}
                  placeholder="Descrição do produto"
                  className="w-full min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoria</Label>
                  <select
                    id="edit-category"
                    name="menuCategoryId"
                    value={editingProduct.menuCategoryId || ""}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input text-sm"
                  >
                    <option value="">Sem categoria</option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} - {category.Restaurant?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-image">Imagem do Produto</Label>
                  <div className="mt-1 flex items-center gap-3">
                    {editingProduct.imageUrl && (
                      <div className="relative w-16 h-16 group">
                        <img
                          src={editingProduct.imageUrl}
                          alt={editingProduct.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                          <button
                            type="button"
                            onClick={() => handleUpdateImageUrl("")}
                            className="bg-destructive text-white p-1 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                    <ImageUploadField
                      id="editProductImage"
                      label=""
                      onUpload={handleUpdateImageUrl}
                      currentImageUrl={editingProduct.imageUrl}
                      folder="products"
                      purpose="product-image"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-ingredients">Ingredientes</Label>
                  <span className="text-xs text-muted-foreground">
                    Atualize os ingredientes para informar ao cliente
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    id="edit-new-ingredient"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    placeholder="Novo ingrediente"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddEditIngredient}
                    disabled={!newIngredient.trim()}
                  >
                    Adicionar
                  </Button>
                </div>

                <div className="mt-2">
                  {editingProduct.ingredients &&
                  editingProduct.ingredients.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2 p-2 bg-muted/20 rounded">
                      {editingProduct.ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full"
                        >
                          <span className="text-sm">{ingredient}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEditIngredient(index)}
                            className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-muted-foreground/20 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Nenhum ingrediente adicionado
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingProduct(null);
                  }}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto order-1 sm:order-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>Atualizar Produto</>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
