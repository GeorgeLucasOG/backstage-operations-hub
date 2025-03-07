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
              ) : (
                <div>Carregando categorias...</div>
              )}
            </div>
          </SheetContent>
        </Sheet>
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
