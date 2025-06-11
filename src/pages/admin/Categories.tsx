
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
  Restaurant?: { name: string };
}

interface CategoryFormData {
  name: string;
  restaurantId: string;
}

// Função para gerar UUID v4
function generateUUID() {
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
  console.log("CategoryForm - initialData:", initialData);
  console.log("CategoryForm - restaurants:", restaurants);

  const getInitialFormData = () => {
    if (initialData) {
      return {
        name: initialData.name,
        restaurantId: initialData.restaurantId,
      };
    } else if (restaurants && restaurants.length > 0) {
      return {
        name: "",
        restaurantId: restaurants[0].id,
      };
    } else {
      return {
        name: "",
        restaurantId: "",
      };
    }
  };

  const [formData, setFormData] = useState<CategoryFormData>(getInitialFormData());
  const hasRestaurants = restaurants && restaurants.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
          onValueChange={(value) => setFormData({ ...formData, restaurantId: value })}
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
      console.log("Fetching categories...");
      const { data, error } = await supabase
        .from("MenuCategory")
        .select("*, Restaurant(name)")
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }

      console.log("Categories fetched:", data);
      return data as Category[];
    },
  });

  const { data: restaurants, isLoading: isLoadingRestaurants } = useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      console.log("Fetching restaurants...");
      const { data, error } = await supabase
        .from("Restaurant")
        .select("id, name")
        .order("name");

      if (error) {
        console.error("Error fetching restaurants:", error);
        throw error;
      }

      console.log("Restaurants fetched:", data);
      return data as Restaurant[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newCategory: CategoryFormData) => {
      console.log("Creating category:", newCategory);
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
      console.error("Error creating category:", error);
      toast({
        title: "Erro",
        description: `Erro ao criar categoria: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: CategoryFormData & { id: string }) => {
      console.log("Updating category:", id, updateData);
      
      const updatedCategory = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("MenuCategory")
        .update(updatedCategory)
        .eq("id", id)
        .select();

      if (error) throw error;
      return data[0];
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
      console.error("Error updating category:", error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar categoria: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting category:", id);
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
      console.error("Error deleting category:", error);
      toast({
        title: "Erro",
        description: `Erro ao excluir categoria: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoadingCategories || isLoadingRestaurants) {
    return <div className="py-8 text-center">Carregando...</div>;
  }

  if (isError) {
    return (
      <div className="py-8 rounded-lg border-red-200 border p-4 bg-red-50 text-red-700 flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <div>
          <p className="font-medium">Erro ao carregar categorias</p>
          <p className="text-sm">
            {error instanceof Error ? error.message : "Erro desconhecido"}
          </p>
        </div>
      </div>
    );
  }

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

      {categories && categories.length === 0 ? (
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
                                onSubmit={(data) => {
                                  updateMutation.mutate({
                                    ...data,
                                    id: editingCategory.id,
                                  });
                                }}
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
