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
import ImageUploadField from "@/components/ImageUploadField";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

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

function generateUUID() {
  let dt = new Date().getTime();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const RestaurantForm = ({
  onSubmit,
  initialData = null,
  isSubmitting,
  onCancel,
}: {
  onSubmit: (data: RestaurantFormData) => void;
  initialData?: Restaurant | null;
  isSubmitting: boolean;
  onCancel: () => void;
}) => {
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

  const handleAvatarUpload = (url: string) => {
    setFormData({ ...formData, avatarImageUrl: url });
  };

  const handleCoverUpload = (url: string) => {
    setFormData({ ...formData, coverImageUrl: url });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-2 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Nome
          </label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1"
          >
            Descrição
          </label>
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
          <label htmlFor="slug" className="block text-sm font-medium mb-1">
            Slug
          </label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) =>
              setFormData({
                ...formData,
                slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
              })
            }
            required
          />
        </div>
      </div>
      <div className="space-y-2 col-span-1 md:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Avatar do Restaurante</Label>
            <div className="flex items-center gap-3">
              {formData.avatarImageUrl && (
                <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 border flex-shrink-0">
                  <img
                    src={formData.avatarImageUrl}
                    alt="Avatar do restaurante"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex-grow">
                <ImageUploadField
                  id="avatarImage"
                  label=""
                  onUrlChange={handleAvatarUpload}
                  currentUrl={formData.avatarImageUrl}
                  folder="restaurant"
                  purpose="restaurant-avatar"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Imagem de Capa</Label>
            <div className="flex items-center gap-3">
              {formData.coverImageUrl && (
                <div className="h-16 w-24 rounded overflow-hidden bg-gray-100 border flex-shrink-0">
                  <img
                    src={formData.coverImageUrl}
                    alt="Capa do restaurante"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex-grow">
                <ImageUploadField
                  id="coverImage"
                  label=""
                  onUrlChange={handleCoverUpload}
                  currentUrl={formData.coverImageUrl}
                  folder="restaurant"
                  purpose="restaurant-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 pt-4 pb-2 bg-white border-t mt-4 flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  );
};

const Restaurant = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (newRestaurant: RestaurantFormData) => {
      console.log("Iniciando criação do restaurante:", newRestaurant);

      const id = generateUUID();
      const now = new Date().toISOString();

      const restaurantData = {
        id,
        name: newRestaurant.name,
        description: newRestaurant.description,
        slug:
          newRestaurant.slug ||
          newRestaurant.name.toLowerCase().replace(/\s+/g, "-"),
        avatarImageUrl: newRestaurant.avatarImageUrl,
        coverImageUrl: newRestaurant.coverImageUrl,
        createdAt: now,
        updatedAt: now,
      };

      const { error } = await supabase
        .from("Restaurant")
        .insert([restaurantData]);

      if (error) {
        console.error("Erro ao criar restaurante:", error);
        throw new Error(`Erro ao criar restaurante: ${error.message}`);
      }

      console.log("Restaurante criado com sucesso!");
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast({
        title: "Sucesso",
        description: "Restaurante criado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro na criação:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao criar restaurante",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      ...updateData
    }: RestaurantFormData & { id: string }) => {
      console.log("Iniciando atualização do restaurante:", id, updateData);

      const now = new Date().toISOString();

      const { error } = await supabase
        .from("Restaurant")
        .update({
          ...updateData,
          updatedAt: now,
        })
        .eq("id", id);

      if (error) {
        console.error("Erro ao atualizar restaurante:", error);
        throw new Error(`Erro ao atualizar restaurante: ${error.message}`);
      }

      console.log("Restaurante atualizado com sucesso!");
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast({
        title: "Sucesso",
        description: "Restaurante atualizado com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro na atualização:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Erro ao atualizar restaurante",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Iniciando exclusão do restaurante:", id);

      const { error } = await supabase.from("Restaurant").delete().eq("id", id);

      if (error) {
        console.error("Erro ao excluir restaurante:", error);
        throw new Error(`Erro ao excluir restaurante: ${error.message}`);
      }

      console.log("Restaurante excluído com sucesso!");
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast({
        title: "Sucesso",
        description: "Restaurante excluído com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro na exclusão:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Erro ao excluir restaurante",
        variant: "destructive",
      });
    },
  });

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      console.log("Consultando restaurantes...");

      const { data, error } = await supabase
        .from("Restaurant")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Erro ao consultar restaurantes:", error);
        throw new Error("Não foi possível carregar os restaurantes");
      }

      console.log("Dados de restaurantes obtidos:", data);
      return data as Restaurant[];
    },
  });

  const handleSubmit = async (data: RestaurantFormData) => {
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
      setIsOpen(false);
    }
  };

  const handleEditSubmit = async (data: RestaurantFormData) => {
    if (!editingRestaurant) return;

    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({
        ...data,
        id: editingRestaurant.id,
      });
    } finally {
      setIsSubmitting(false);
      setIsEditOpen(false);
    }
  };

  const confirmDelete = () => {
    if (!editingRestaurant) return;

    deleteMutation.mutate(editingRestaurant.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Restaurantes</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Restaurante
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Adicionar Restaurante
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Preencha os campos para adicionar um novo restaurante ao
                sistema.
              </DialogDescription>
            </DialogHeader>
            <RestaurantForm
              onSubmit={handleSubmit}
              initialData={null}
              isSubmitting={isSubmitting}
              onCancel={() => setIsOpen(false)}
            />
            {isSubmitting && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
                    <h3 className="text-lg font-medium">
                      Salvando restaurante...
                    </h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Isso pode levar alguns segundos, principalmente se estiver
                      enviando imagens.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Carregando restaurantes...</p>
        </div>
      ) : restaurants && restaurants.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restaurants.map((restaurant) => (
                <TableRow key={restaurant.id}>
                  <TableCell className="font-medium">
                    {restaurant.name}
                  </TableCell>
                  <TableCell>
                    {restaurant.description.length > 100
                      ? `${restaurant.description.substring(0, 100)}...`
                      : restaurant.description}
                  </TableCell>
                  <TableCell>
                    {format(new Date(restaurant.createdAt), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingRestaurant(restaurant);
                          setIsEditOpen(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setEditingRestaurant(restaurant);
                          setIsDeleteDialogOpen(true);
                        }}
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
      ) : (
        <div className="text-center py-10 border rounded-lg">
          <p className="text-muted-foreground">
            Nenhum restaurante encontrado. Clique em "Novo Restaurante" para
            adicionar.
          </p>
        </div>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Editar Restaurante: {editingRestaurant?.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Atualize as informações do restaurante conforme necessário.
            </DialogDescription>
          </DialogHeader>
          {!editingRestaurant ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="flex flex-col items-center text-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p>Carregando dados do restaurante...</p>
              </div>
            </div>
          ) : (
            <RestaurantForm
              onSubmit={handleEditSubmit}
              initialData={editingRestaurant}
              isSubmitting={isSubmitting}
              onCancel={() => setIsEditOpen(false)}
            />
          )}
          {isSubmitting && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
                  <h3 className="text-lg font-medium">
                    Atualizando restaurante...
                  </h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Isso pode levar alguns segundos, principalmente se estiver
                    enviando imagens.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este restaurante? Esta ação não
              pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Restaurant;
