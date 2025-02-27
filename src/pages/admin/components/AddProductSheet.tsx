
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase, DEFAULT_RESTAURANT_ID } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddProductSheetProps {
  children: React.ReactNode;
}

export function AddProductSheet({ children }: AddProductSheetProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    categoria_id: "",
    ingredients: [] as string[],
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!formData.name || !formData.price || !formData.categoria_id) {
        throw new Error("Por favor, preencha todos os campos obrigatórios");
      }

      const { data, error } = await supabase.from("products").insert({
        name: formData.name,
        description: formData.description || "",
        price: parseFloat(formData.price),
        image_url: formData.image_url || "https://via.placeholder.com/150",
        menu_category_id: formData.categoria_id,
        restaurant_id: DEFAULT_RESTAURANT_ID,
        ingredients: formData.ingredients,
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Produto adicionado com sucesso!",
      });

      // Reset form and refresh products list
      setFormData({
        name: "",
        description: "",
        price: "",
        image_url: "",
        categoria_id: "",
        ingredients: [],
      });
      
      queryClient.invalidateQueries({ queryKey: ["products"] });

    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao adicionar produto",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Adicionar Produto</SheetTitle>
          <SheetDescription>
            Preencha os dados do novo produto
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Nome do produto"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Descrição do produto"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">Preço *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, price: e.target.value }))
              }
              placeholder="0,00"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image">URL da Imagem</Label>
            <Input
              id="image"
              value={formData.image_url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, image_url: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select
              value={formData.categoria_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, categoria_id: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category1">Categoria 1</SelectItem>
                <SelectItem value="category2">Categoria 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Salvar produto"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
