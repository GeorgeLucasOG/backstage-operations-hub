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
import { Plus, AlertCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Restaurant {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryFormData {
  name: string;
  restaurantId: string;
}

// Função para gerar UUID v4
function generateUUID() {
  // Implementação simples de UUID v4
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const CategoryForm = ({
  onSubmit,
  initialData = null,
  restaurants,
}: {
  onSubmit: (data: CategoryFormData) => void;
  initialData?: Category | null;
  restaurants: Restaurant[];
}) => {
  console.log("Recebendo dados iniciais para o formulário:", initialData);

  // Se não tiver restaurantId e houver restaurantes disponíveis, seleciona o primeiro
  const getInitialFormData = () => {
    if (initialData) {
      console.log("Usando dados iniciais fornecidos:", initialData);
      return {
        name: initialData.name,
        restaurantId: initialData.restaurantId,
      };
    } else if (restaurants && restaurants.length > 0) {
      console.log(
        "Criando novo formulário com primeiro restaurante selecionado"
      );
      return {
        name: "",
        restaurantId: restaurants[0].id, // Seleciona o primeiro restaurante por padrão
      };
    } else {
      console.log("Criando formulário vazio");
      return {
        name: "",
        restaurantId: "",
      };
    }
  };

  const [formData, setFormData] = useState<CategoryFormData>(
    getInitialFormData()
  );

  // Verifica se há restaurantes disponíveis
  const hasRestaurants = restaurants && restaurants.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Enviando formulário com dados:", formData);

    // Validações adicionais antes de enviar
    if (!formData.name.trim()) {
      alert("O nome da categoria é obrigatório");
      return;
    }

    if (!formData.restaurantId && hasRestaurants) {
      alert("É necessário selecionar um restaurante");
      return;
    }

    onSubmit(formData);
  };

  const handleSelectRestaurant = (value: string) => {
    console.log("Restaurante selecionado:", value);
    setFormData({ ...formData, restaurantId: value });
  };

  // Se não houver restaurantes, mostra uma mensagem
  if (!hasRestaurants) {
    return (
      <div className="py-4 text-center">
        <p className="text-red-500">
          Não há restaurantes disponíveis. Crie um restaurante primeiro.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Nome da Categoria
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="restaurant" className="text-sm font-medium">
          Restaurante
        </label>
        <Select
          value={formData.restaurantId}
          onValueChange={handleSelectRestaurant}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um restaurante" />
          </SelectTrigger>
          <SelectContent>
            {restaurants.map((restaurant) => (
              <SelectItem key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        {initialData ? "Atualizar" : "Criar"} Categoria
      </Button>
    </form>
  );
};

const Categories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      console.log("Buscando categorias do banco de dados...");

      const { data, error } = await supabase
        .from("MenuCategory")
        .select("*, Restaurant:restaurantId(name)")
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Erro ao buscar categorias:", error);
        throw error;
      }

      console.log("Categorias encontradas:", data);
      if (data && data.length > 0) {
        console.log(
          "Detalhes da primeira categoria:",
          JSON.stringify(data[0], null, 2)
        );
        console.log("Restaurante vinculado:", data[0].Restaurant);
      }

      return data as (Category & { Restaurant: { name: string } })[];
    },
  });

  const { data: restaurants, isLoading: isLoadingRestaurants } = useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      console.log("Buscando restaurantes do banco de dados...");

      const { data, error } = await supabase
        .from("Restaurant")
        .select("id, name")
        .order("name");

      if (error) {
        console.error("Erro ao buscar restaurantes:", error);
        throw error;
      }

      console.log("Restaurantes encontrados:", data);
      return data as Restaurant[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newCategory: CategoryFormData) => {
      try {
        console.log("Criando nova categoria:", newCategory);
        const now = new Date().toISOString();
        const completeCategory = {
          ...newCategory,
          id: generateUUID(),
          createdAt: now,
          updatedAt: now,
        };

        const { data, error } = await supabase
          .from("MenuCategory")
          .insert([completeCategory])
          .select()
          .single();

        if (error) throw error;
        console.log("Categoria criada com sucesso:", data);
        return data;
      } catch (error) {
        console.error("Erro durante a criação da categoria:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro ao criar categoria:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? `Erro ao criar categoria: ${error.message}`
            : "Erro desconhecido ao criar categoria",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      ...updateData
    }: CategoryFormData & { id: string }) => {
      try {
        console.log("Atualizando categoria:", id, updateData);

        // Validações básicas
        if (!updateData.name || updateData.name.trim() === "") {
          throw new Error("O nome da categoria é obrigatório");
        }

        if (!updateData.restaurantId) {
          throw new Error("É necessário selecionar um restaurante");
        }

        // Adicionar o campo updatedAt
        const updatedCategory = {
          ...updateData,
          updatedAt: new Date().toISOString(),
        };

        console.log("Payload de atualização:", updatedCategory);

        const { data, error } = await supabase
          .from("MenuCategory")
          .update(updatedCategory)
          .eq("id", id)
          .select();

        if (error) {
          console.error(
            "Erro detalhado do Supabase:",
            JSON.stringify(error, null, 2)
          );
          throw new Error(`Erro ao atualizar categoria: ${error.message}`);
        }

        if (!data || data.length === 0) {
          throw new Error("Categoria não encontrada ou não foi atualizada");
        }

        console.log("Categoria atualizada com sucesso:", data[0]);
        return data[0];
      } catch (error) {
        console.error("Erro durante a atualização da categoria:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategory(null);
      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar categoria:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? `Erro ao atualizar categoria: ${error.message}`
            : "Erro desconhecido ao atualizar categoria",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        console.log("Excluindo categoria:", id);
        const { error } = await supabase
          .from("MenuCategory")
          .delete()
          .eq("id", id);

        if (error) throw error;
        console.log("Categoria excluída com sucesso");
      } catch (error) {
        console.error("Erro durante a exclusão da categoria:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro ao excluir categoria:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? `Erro ao excluir categoria: ${error.message}`
            : "Erro desconhecido ao excluir categoria",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Categoria
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Nova Categoria</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              {restaurants && (
                <CategoryForm
                  onSubmit={(data) => createMutation.mutate(data)}
                  restaurants={restaurants}
                />
              )}
              {createMutation.isPending && (
                <div className="mt-4 text-center text-gray-600">
                  <p>Criando categoria...</p>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {isLoadingCategories || isLoadingRestaurants ? (
        <div className="py-8 text-center">Carregando...</div>
      ) : isError ? (
        <div className="py-8 rounded-lg border-red-200 border p-4 bg-red-50 text-red-700 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <div>
            <p className="font-medium">Erro ao carregar categorias</p>
            <p className="text-sm">
              {error instanceof Error ? error.message : "Erro desconhecido"}
            </p>
          </div>
        </div>
      ) : categories && categories.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          Nenhuma categoria encontrada. Crie uma nova categoria para começar.
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Restaurante</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    {category.Restaurant?.name || "Sem restaurante"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              console.log(
                                "Categoria selecionada para edição:",
                                category
                              );
                              setEditingCategory({
                                id: category.id,
                                name: category.name,
                                restaurantId: category.restaurantId,
                                createdAt: category.createdAt,
                                updatedAt: category.updatedAt,
                              });
                            }}
                          >
                            Editar
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>Editar Categoria</SheetTitle>
                          </SheetHeader>
                          <div className="mt-4">
                            {restaurants && editingCategory && (
                              <CategoryForm
                                initialData={editingCategory}
                                onSubmit={(data) => {
                                  console.log(
                                    "Enviando dados de atualização:",
                                    { ...data, id: editingCategory.id }
                                  );
                                  updateMutation.mutate({
                                    ...data,
                                    id: editingCategory.id,
                                  });
                                }}
                                restaurants={restaurants}
                              />
                            )}
                            {updateMutation.isPending && (
                              <div className="mt-4 text-center text-gray-600">
                                <p>Atualizando categoria...</p>
                              </div>
                            )}
                            {updateMutation.isError && (
                              <div className="mt-4 p-2 bg-red-50 text-red-700 rounded border border-red-200">
                                <p className="font-medium">
                                  Erro ao atualizar categoria
                                </p>
                                <p className="text-sm">
                                  {updateMutation.error instanceof Error
                                    ? updateMutation.error.message
                                    : "Erro desconhecido"}
                                </p>
                              </div>
                            )}
                          </div>
                        </SheetContent>
                      </Sheet>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
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
    </div>
  );
};

export default Categories;
