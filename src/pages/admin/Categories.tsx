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

const CategoryForm = ({
  onSubmit,
  initialData = null,
  restaurants,
}: {
  onSubmit: (data: CategoryFormData) => void;
  initialData?: Category | null;
  restaurants: Restaurant[];
}) => {
  const [formData, setFormData] = useState<CategoryFormData>(
    initialData || {
      name: "",
      restaurantId: "",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

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
          onValueChange={(value) =>
            setFormData({ ...formData, restaurantId: value })
          }
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
      const now = new Date().toISOString();
      const completeCategory = {
        ...newCategory,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };

      const { data, error } = await supabase
        .from("MenuCategory")
        .insert([completeCategory])
        .select()
        .single();

      if (error) throw error;
      return data;
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
        description: "Erro ao criar categoria: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      ...updateData
    }: CategoryFormData & { id: string }) => {
      const { data, error } = await supabase
        .from("MenuCategory")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
        description: "Erro ao atualizar categoria: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("MenuCategory")
        .delete()
        .eq("id", id);

      if (error) throw error;
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
        description: "Erro ao excluir categoria: " + error.message,
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
                    {/*!category.Restaurant?.name && (
                      <span className="text-xs text-red-500 block">
                        (ID: {category.restaurantId || "não definido"})
                      </span>
                    )*/}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCategory(category)}
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
                                onSubmit={(data) =>
                                  updateMutation.mutate({
                                    ...data,
                                    id: category.id,
                                  })
                                }
                                restaurants={restaurants}
                              />
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
