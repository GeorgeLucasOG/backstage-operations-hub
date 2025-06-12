import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { Plus, ShieldAlert } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";

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
                  onUpload={handleAvatarUpload}
                  currentImageUrl={formData.avatarImageUrl}
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
                  onUpload={handleCoverUpload}
                  currentImageUrl={formData.coverImageUrl}
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
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] =
    useState<Restaurant | null>(null);

  const isRestrictedUser =
    user?.role === "manager" ||
    user?.role === "pdv" ||
    user?.role === "monitor";
  const canEditOrDelete = user?.role === "admin" || user?.role === "manager";
  const canCreateRestaurant =
    user?.role === "admin" || user?.role === "manager";

  useEffect(() => {
    fetchRestaurants();
  }, [user]);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);

      let query = supabase.from("Restaurant").select("*");

      if (isRestrictedUser && user?.restaurant) {
        query = query.eq("id", user.restaurant);
      }

      query = query.order("name");

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setRestaurants(data || []);
    } catch (error) {
      console.error("Erro ao buscar restaurantes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os restaurantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: RestaurantFormData) => {
    if (!canCreateRestaurant) {
      toast({
        title: "Acesso negado",
        description:
          "Apenas administradores e gerentes podem criar restaurantes",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const id = generateUUID();
      const now = new Date().toISOString();

      const restaurantData = {
        id,
        name: data.name,
        description: data.description,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
        avatarImageUrl: data.avatarImageUrl,
        coverImageUrl: data.coverImageUrl,
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
      toast({
        title: "Sucesso",
        description: "Restaurante criado com sucesso!",
      });
      await fetchRestaurants(); // Recarrega a lista de restaurantes após a criação
    } finally {
      setIsSubmitting(false);
      setIsFormOpen(false);
    }
  };

  const handleEditSubmit = async (data: RestaurantFormData) => {
    if (!editingRestaurant) return;

    if (isRestrictedUser && user?.restaurant !== editingRestaurant.id) {
      toast({
        title: "Acesso negado",
        description: "Você só pode editar o restaurante ao qual pertence",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("Restaurant")
        .update({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", editingRestaurant.id);

      if (error) {
        console.error("Erro ao atualizar restaurante:", error);
        throw new Error(`Erro ao atualizar restaurante: ${error.message}`);
      }

      console.log("Restaurante atualizado com sucesso!");
      toast({
        title: "Sucesso",
        description: "Restaurante atualizado com sucesso!",
      });
      await fetchRestaurants(); // Recarrega a lista de restaurantes após a atualização
    } finally {
      setIsSubmitting(false);
      setIsEditFormOpen(false);
    }
  };

  const confirmDelete = async () => {
    if (!restaurantToDelete) return;

    if (user?.role !== "admin") {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem excluir restaurantes",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("Restaurant")
        .delete()
        .eq("id", restaurantToDelete.id);

      if (error) {
        throw error;
      }

      console.log("Restaurante excluído com sucesso!");
      toast({
        title: "Sucesso",
        description: "Restaurante excluído com sucesso!",
      });

      // Atualiza a listagem após excluir
      await fetchRestaurants();
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    if (isRestrictedUser && user?.restaurant !== restaurant.id) {
      toast({
        title: "Acesso negado",
        description: "Você só pode editar o restaurante ao qual pertence",
        variant: "destructive",
      });
      return;
    }

    if (!canEditOrDelete) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para editar restaurantes",
        variant: "destructive",
      });
      return;
    }

    setEditingRestaurant(restaurant);
    setIsEditFormOpen(true);
  };

  const handleDelete = (restaurant: Restaurant) => {
    if (user?.role !== "admin") {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem excluir restaurantes",
        variant: "destructive",
      });
      return;
    }

    setRestaurantToDelete(restaurant);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      {isRestrictedUser && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-center gap-2 text-blue-800">
          <ShieldAlert className="h-5 w-5" />
          <span>
            Você está visualizando apenas o restaurante ao qual você pertence:{" "}
            <strong>
              {restaurants.find((r) => r.id === user?.restaurant)?.name ||
                user?.restaurant}
            </strong>
          </span>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Restaurantes</h1>
        {canCreateRestaurant && (
          <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Restaurante
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Novo Restaurante</SheetTitle>
              </SheetHeader>
              <RestaurantForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                onCancel={() => setIsFormOpen(false)}
              />
            </SheetContent>
          </Sheet>
        )}
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
                    {restaurant.name || "Sem nome"}
                  </TableCell>
                  <TableCell>
                    {restaurant.description
                      ? restaurant.description.length > 100
                        ? `${restaurant.description.substring(0, 100)}...`
                        : restaurant.description
                      : "Sem descrição"}
                  </TableCell>
                  <TableCell>
                    {restaurant.createdAt
                      ? format(new Date(restaurant.createdAt), "dd/MM/yyyy")
                      : "Data desconhecida"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {canEditOrDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(restaurant)}
                        >
                          Editar
                        </Button>
                      )}
                      {user?.role === "admin" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(restaurant)}
                        >
                          Excluir
                        </Button>
                      )}
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

      <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
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
              onCancel={() => setIsEditFormOpen(false)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o restaurante "
              {restaurantToDelete?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Restaurant;
