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
import { Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploadField from "@/components/ImageUploadField";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
}

function generateUUID() {
  let dt = new Date().getTime();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// Update the ProductForm component to include image purpose
const ProductForm = ({
  onSubmit,
  initialData = null,
  categories,
}: {
  onSubmit: (data: ProductFormData) => void;
  initialData?: Product | null;
  categories: Category[];
}) => {
  const [formData, setFormData] = useState<ProductFormData>(
    initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          price: initialData.price,
          categoryId: initialData.categoryId,
          imageUrl: initialData.imageUrl,
        }
      : {
          name: "",
          description: "",
          price: 0,
          categoryId: "",
          imageUrl: "",
        }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: url }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" className="block text-sm font-medium mb-1">
          Nome
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description" className="block text-sm font-medium mb-1">
          Descrição
        </Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </div>
      <div>
        <Label htmlFor="price" className="block text-sm font-medium mb-1">
          Preço
        </Label>
        <Input
          id="price"
          type="number"
          value={formData.price.toString()}
          onChange={(e) =>
            setFormData({ ...formData, price: parseFloat(e.target.value) })
          }
          required
        />
      </div>
      <div>
        <Label htmlFor="categoryId" className="block text-sm font-medium mb-1">
          Categoria
        </Label>
        <Select
          onValueChange={(value) =>
            setFormData({ ...formData, categoryId: value })
          }
          defaultValue={formData.categoryId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <ImageUploadField
        id="productImage"
        label="Imagem do Produto"
        onUpload={handleImageUpload}
        currentImageUrl={formData.imageUrl}
        folder="products"
        purpose="products"
      />
      
      <Button type="submit" className="w-full">
        {initialData ? "Atualizar" : "Criar"} Produto
      </Button>
    </form>
  );
};

const Products = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      console.log("Iniciando busca de produtos...");
      const { data, error } = await supabase
        .from("Product")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Erro ao buscar produtos:", error);
        throw error;
      }

      console.log("Produtos encontrados:", data);
      return data as Product[];
    },
  });

  const { data: categories, isLoading: isCategoriesLoading, error: categoriesError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      console.log("Iniciando busca de categorias...");
      const { data, error } = await supabase
        .from("Category")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Erro ao buscar categorias:", error);
        throw error;
      }

      console.log("Categorias encontradas:", data);
      return data as Category[];
    },
  });

  if (error) {
    console.error("Erro na query:", error);
    return <div>Erro ao carregar produtos: {(error as Error).message}</div>;
  }

  if (categoriesError) {
    console.error("Erro na query de categorias:", categoriesError);
    return <div>Erro ao carregar categorias: {(categoriesError as Error).message}</div>;
  }

  const createMutation = useMutation({
    mutationFn: async (newProduct: ProductFormData) => {
      console.log("Iniciando criação do produto:", newProduct);

      const id = generateUUID();
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("Product")
        .insert([
          {
            id,
            ...newProduct,
            createdAt: now,
            updatedAt: now,
          },
        ])
        .select();

      if (error) {
        console.error("Erro ao criar produto:", error);
        throw error;
      }

      console.log("Produto criado com sucesso:", data);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "Sucesso",
        description: "Produto criado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro na mutation de criação:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar produto: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      ...updateData
    }: ProductFormData & { id: string }) => {
      console.log("Iniciando atualização do produto:", id, updateData);

      const { data, error } = await supabase
        .from("Product")
        .update({
          ...updateData,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Erro ao atualizar produto:", error);
        throw error;
      }

      console.log("Produto atualizado com sucesso:", data);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditingProduct(null);
      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro na mutation de atualização:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto: " + error.message,
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
        throw error;
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
      console.error("Erro na mutation de exclusão:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir produto: " + error.message,
        variant: "destructive",
      });
    },
  });

<<<<<<< HEAD
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

=======
>>>>>>> 64795e36aa737e06290efcb6b485fb7d34545b32
  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Novo Produto</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              {categories ? (
                <ProductForm
                  categories={categories}
                  onSubmit={(data) => createMutation.mutate(data)}
                />
<<<<<<< HEAD
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
                  value={newProduct.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">URL da Imagem</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  value={newProduct.image_url}
                  onChange={handleInputChange}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category_id">Categoria</Label>
                <select
                  id="category_id"
                  name="category_id"
                  className="w-full p-2 border rounded"
                  value={newProduct.category_id}
                  onChange={(e) => handleInputChange(e)}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories?.map(
                    (category: {
                      id: string;
                      name: string;
                      Restaurant?: { name: string };
                    }) => (
                    <option key={category.id} value={category.id}>
                        {category.name}{" "}
                        {category.Restaurant
                          ? `(${category.Restaurant.name})`
                          : ""}
                    </option>
                    )
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Ingredientes</Label>
                <div className="text-xs text-gray-500 mb-2">
                  Adicione os ingredientes deste produto para melhor informação
                  ao cliente.
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    placeholder="Digite um ingrediente"
                    className="flex-grow"
                  />
                  <Button
                    type="button"
                    onClick={handleAddIngredient}
                    variant="outline"
                    size="sm"
                  >
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newProduct.ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"
                    >
                      <span>{ingredient}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
=======
              ) : (
                <div>Carregando categorias...</div>
              )}
            </div>
          </SheetContent>
        </Sheet>
>>>>>>> 64795e36aa737e06290efcb6b485fb7d34545b32
      </div>

      {isLoading || isCategoriesLoading ? (
        <div>Carregando...</div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products && products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {product.description}
                    </TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingProduct(product)}
                            >
                              Editar
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle>Editar Produto</SheetTitle>
                            </SheetHeader>
                            <div className="mt-4">
                              {categories ? (
                                <ProductForm
                                  initialData={product}
                                  categories={categories}
                                  onSubmit={(data) =>
                                    updateMutation.mutate({
                                      ...data,
                                      id: product.id,
                                    })
                                  }
                                />
                              ) : (
                                <div>Carregando categorias...</div>
                              )}
                            </div>
                          </SheetContent>
                        </Sheet>
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
                  <TableCell colSpan={5} className="text-center py-4">
                    Nenhum produto encontrado. Clique em "Adicionar Produto"
                    para criar um.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Products;
