import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  supabase,
  DEFAULT_RESTAURANT_ID,
} from "@/integrations/supabase/client";
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

// Função para gerar UUID v4
function generateUUID() {
  // Implementação simples de UUID v4
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
  imageUrl: string; // Changing to match the actual column name in database
  menuCategoryId: string | null; // Changing to match the actual column name
  restaurantId: string; // Changing to match the actual column name
  ingredients: string[] | null;
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
  });

  // Consultando restaurantes disponíveis para obter IDs válidos
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

  // Consulta principal de produtos
  const {
    data: products,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      // Consultar produtos
      const { data, error } = await supabase
        .from("Product") // Corrigindo o nome da tabela para "Product" (com P maiúsculo)
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Erro ao consultar produtos:", error);
        throw new Error("Não foi possível carregar os produtos");
      }

      console.log("Dados de produtos obtidos:", data);
      return data as Product[];
    },
  });

  // Consulta de categorias
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      // Consultar categorias
      console.log(
        "Consultando categorias do banco de dados na página de Products..."
      );
      const { data, error } = await supabase
        .from("MenuCategory") // Nome correto da tabela em PascalCase
        .select("*, Restaurant:restaurantId(name)"); // Adicionando a relação com Restaurant

      if (error) {
        console.error("Erro ao consultar categorias:", error);
        return [];
      }

      console.log("Categorias obtidas na página de Products:", data);
      return data || [];
    },
  });

  // Mutação para atualizar um produto
  const updateMutation = useMutation({
    mutationFn: async (updatedProduct: {
      id: string;
      name: string;
      description: string;
      price: number;
      imageUrl: string;
      menuCategoryId: string | null;
    }) => {
      console.log("Iniciando atualização do produto:", updatedProduct);

      const { data, error } = await supabase
        .from("Product")
        .update({
          name: updatedProduct.name,
          description: updatedProduct.description,
          price: updatedProduct.price,
          imageUrl: updatedProduct.imageUrl,
          menuCategoryId: updatedProduct.menuCategoryId,
          updatedAt: new Date().toISOString(),
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
        description: "Produto atualizado com sucesso!",
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

  // Mutação para excluir um produto
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("Iniciando adição de produto com dados:", newProduct);

      // Validações básicas
      if (!newProduct.name.trim()) {
        throw new Error("O nome do produto é obrigatório");
      }

      if (!newProduct.price || isNaN(parseFloat(newProduct.price))) {
        throw new Error("O preço deve ser um número válido");
      }

      // Verificar se temos restaurantes disponíveis
      if (!restaurantsData || restaurantsData.length === 0) {
        throw new Error(
          "Não há restaurantes disponíveis. Crie um restaurante primeiro."
        );
      }

      // Obter o ID do primeiro restaurante disponível ou usar o restaurante selecionado na categoria
      let validRestaurantId = restaurantsData[0]?.id;

      // Se uma categoria foi selecionada e ela tem um restaurante associado, tente usar esse restaurante
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

      console.log("Usando ID de restaurante válido:", validRestaurantId);

      // Gerando um ID único para o novo produto
      const id = generateUUID(); // Usando nossa função personalizada
      const now = new Date().toISOString();

      // Tratamento seguro para nulos e strings vazias
      const name = newProduct.name.trim();
      const description = newProduct.description?.trim() || "";
      const price = parseFloat(newProduct.price) || 0;
      const imageUrl =
        newProduct.image_url?.trim() || "https://via.placeholder.com/150";
      const menuCategoryId = newProduct.category_id || null;

      // Verificar estrutura da tabela no banco (apenas para debug)
      console.log("Verificando estrutura da tabela Product...");
      const { data: tableInfo, error: tableError } = await supabase
        .from("Product")
        .select("*")
        .limit(1);

      // Preparar o payload com base no exemplo do banco, se disponível
      let productPayload = {
        id,
        name,
        description,
        price,
        imageUrl,
        menuCategoryId,
        restaurantId: validRestaurantId, // Usando o ID de restaurante válido
        createdAt: now,
        updatedAt: now,
      } as Product;

      // Incluir ingredients apenas se existir na estrutura da tabela
      if (tableInfo && tableInfo.length > 0) {
        const firstRecord = tableInfo[0];
        console.log("Campos detectados no banco:", Object.keys(firstRecord));

        if ("ingredients" in firstRecord) {
          console.log("Campo ingredients detectado, adicionando ao payload");
          productPayload = {
            ...productPayload,
            ingredients: null,
          } as Product; // Forçando o tipo para Product que inclui ingredients
        }
      }

      console.log(
        "Enviando produto para o banco:",
        JSON.stringify(productPayload, null, 2)
      );

      // Tentativa de inserção
      const { data, error } = await supabase
        .from("Product")
        .insert([productPayload])
        .select();

      if (error) {
        console.error(
          "Erro detalhado do Supabase:",
          JSON.stringify(error, null, 2)
        );

        // Analisar o erro para determinar se é um problema de formato de dados
        const errorMessage = error.message || "";
        const errorDetails = error.details || "";
        const errorCode = error.code || "";

        // Log detalhado para diagnóstico
        console.log(
          `Análise do erro: Código=${errorCode}, Mensagem=${errorMessage}, Detalhes=${errorDetails}`
        );

        // Tentar uma abordagem alternativa se parecer ser um problema de formato
        if (
          errorCode === "23502" ||
          errorMessage.includes("violates") ||
          errorMessage.includes("constraint")
        ) {
          throw new Error(
            `Erro na validação de dados: ${errorMessage}. Verifique se todos os campos obrigatórios estão preenchidos corretamente.`
          );
        }

        throw new Error(
          `Erro ao inserir produto: ${errorMessage} (Código: ${errorCode})`
        );
      }

      console.log("Produto adicionado com sucesso:", data);

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
      });

      refetch(); // Atualiza a lista de produtos
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

  // Função auxiliar para obter URL da imagem
  const getImageUrl = (product: Product): string => {
    return product.imageUrl || "https://via.placeholder.com/150"; // Atualizado para o nome correto da propriedade
  };

  // Função auxiliar para obter o preço formatado
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  // Função para lidar com a edição de um produto
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsEditOpen(true);
  };

  // Função para lidar com a exclusão de um produto
  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      deleteMutation.mutate(id);
    }
  };

  // Função para lidar com a submissão do formulário de edição
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProduct) return;

    setIsSubmitting(true);

    try {
      // Validações básicas
      if (!editingProduct.name.trim()) {
        throw new Error("O nome do produto é obrigatório");
      }

      if (isNaN(editingProduct.price) || editingProduct.price <= 0) {
        throw new Error("O preço deve ser um número válido maior que zero");
      }

      // Atualizar o produto
      updateMutation.mutate({
        id: editingProduct.id,
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        imageUrl: editingProduct.imageUrl || "https://via.placeholder.com/150",
        menuCategoryId: editingProduct.menuCategoryId,
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

  // Atualizar valores do formulário de edição
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Produto</DialogTitle>
              <DialogDescription>
                Preencha os campos para adicionar um novo produto ao cardápio.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
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
      </div>

      {/* Dialog for editing product */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Edite os campos para atualizar o produto.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome</Label>
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
                  value={editingProduct.price}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image_url">URL da Imagem</Label>
                <Input
                  id="edit-image_url"
                  name="image_url"
                  value={editingProduct.imageUrl}
                  onChange={handleEditInputChange}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category_id">Categoria</Label>
                <select
                  id="edit-category_id"
                  name="category_id"
                  className="w-full p-2 border rounded"
                  value={editingProduct.menuCategoryId || ""}
                  onChange={handleEditInputChange}
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
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {isLoading ? (
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
                  <TableCell colSpan={5} className="text-center py-4">
                    Nenhum produto encontrado
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
