
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  slug: string;
  avatarImageUrl: string;
  coverImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface RestaurantFormData {
  name: string;
  description: string;
  slug: string;
  avatarImageUrl: string;
  coverImageUrl: string;
}

const RestaurantForm = ({ onSubmit, initialData = null }: { onSubmit: (data: RestaurantFormData) => void, initialData?: Restaurant | null }) => {
  const [formData, setFormData] = useState<RestaurantFormData>(
    initialData || {
      name: "",
      description: "",
      slug: "",
      avatarImageUrl: "",
      coverImageUrl: "",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">Nome</label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">Descrição</label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-1">Slug</label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
          required
        />
      </div>
      <div>
        <label htmlFor="avatarImageUrl" className="block text-sm font-medium mb-1">URL do Avatar</label>
        <Input
          id="avatarImageUrl"
          value={formData.avatarImageUrl}
          onChange={(e) => setFormData({ ...formData, avatarImageUrl: e.target.value })}
          required
        />
      </div>
      <div>
        <label htmlFor="coverImageUrl" className="block text-sm font-medium mb-1">URL da Capa</label>
        <Input
          id="coverImageUrl"
          value={formData.coverImageUrl}
          onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
          required
        />
      </div>
      <Button type="submit" className="w-full">
        {initialData ? "Atualizar" : "Criar"} Restaurante
      </Button>
    </form>
  );
};

const Restaurant = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

  const { data: restaurants, isLoading, error } = useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      console.log("Iniciando busca de restaurantes...");
      const { data, error } = await supabase
        .from("Restaurant") // Aqui corrigimos o nome da tabela para "Restaurant" (com R maiúsculo)
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Erro ao buscar restaurantes:", error);
        throw error;
      }

      console.log("Restaurantes encontrados:", data);
      return data as Restaurant[];
    },
  });

  if (error) {
    console.error("Erro na query:", error);
    return <div>Erro ao carregar restaurantes: {(error as Error).message}</div>;
  }

  const createMutation = useMutation({
    mutationFn: async (newRestaurant: RestaurantFormData) => {
      console.log("Iniciando criação do restaurante:", newRestaurant);
      
      const { data, error } = await supabase
        .from("Restaurant") // Aqui corrigimos o nome da tabela para "Restaurant" (com R maiúsculo)
        .insert([newRestaurant])
        .select();

      if (error) {
        console.error("Erro ao criar restaurante:", error);
        throw error;
      }
      
      console.log("Restaurante criado com sucesso:", data);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast({
        title: "Sucesso",
        description: "Restaurante criado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro na mutation de criação:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar restaurante: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: RestaurantFormData & { id: string }) => {
      console.log("Iniciando atualização do restaurante:", id, updateData);
      
      const { data, error } = await supabase
        .from("Restaurant") // Aqui corrigimos o nome da tabela para "Restaurant" (com R maiúsculo)
        .update(updateData)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Erro ao atualizar restaurante:", error);
        throw error;
      }
      
      console.log("Restaurante atualizado com sucesso:", data);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      setEditingRestaurant(null);
      toast({
        title: "Sucesso",
        description: "Restaurante atualizado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro na mutation de atualização:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar restaurante: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Iniciando exclusão do restaurante:", id);
      
      const { error } = await supabase
        .from("Restaurant") // Aqui corrigimos o nome da tabela para "Restaurant" (com R maiúsculo)
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao excluir restaurante:", error);
        throw error;
      }
      
      console.log("Restaurante excluído com sucesso");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast({
        title: "Sucesso",
        description: "Restaurante excluído com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro na mutation de exclusão:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir restaurante: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este restaurante?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Restaurantes</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Restaurante
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Novo Restaurante</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <RestaurantForm onSubmit={(data) => createMutation.mutate(data)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurants && restaurants.length > 0 ? (
                restaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell>
                      <img
                        src={restaurant.avatarImageUrl}
                        alt={restaurant.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>{restaurant.name}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {restaurant.description}
                    </TableCell>
                    <TableCell>{restaurant.slug}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingRestaurant(restaurant)}
                            >
                              Editar
                            </Button>
                          </SheetTrigger>
                          <SheetContent>
                            <SheetHeader>
                              <SheetTitle>Editar Restaurante</SheetTitle>
                            </SheetHeader>
                            <div className="mt-4">
                              <RestaurantForm
                                initialData={restaurant}
                                onSubmit={(data) =>
                                  updateMutation.mutate({ ...data, id: restaurant.id })
                                }
                              />
                            </div>
                          </SheetContent>
                        </Sheet>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(restaurant.id)}
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
                    Nenhum restaurante encontrado. Clique em "Adicionar Restaurante" para criar um.
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

export default Restaurant;
