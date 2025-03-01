
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, DEFAULT_RESTAURANT_ID } from "@/integrations/supabase/client";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null; // Tornando compatível com outras aplicações que podem ter campo nulo
  ingredients: string[] | null; // Tornando compatível com outras aplicações que podem ter campo nulo
  menu_category_id: string | null; // Tornando compatível com outras aplicações que podem ter campo nulo
  restaurant_id: string;
  created_at: string;
  updated_at: string;
}

const Products = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category_id: "",
  });

  // Consulta principal de produtos
  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      // Tentando consultar produtos através do nome 'products' (original)
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      // Se a consulta for bem-sucedida, retornamos os dados
      if (!productsError && productsData) {
        console.log("Consulta products bem-sucedida:", productsData);
        return productsData as Product[];
      }

      // Se houver erro na primeira consulta, tentamos com o nome alternativo 'produtos'
      const { data: produtosData, error: produtosError } = await supabase
        .from("produtos")
        .select("*")
        .order("created_at", { ascending: false });

      if (produtosError) {
        console.error("Erro ao consultar tabela produtos:", produtosError);
        throw new Error("Não foi possível carregar os produtos");
      }

      console.log("Consulta produtos bem-sucedida:", produtosData);
      return produtosData as Product[];
    },
  });

  // Consulta de categorias
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      // Tentando consultar categorias através do nome 'menu_categories' (original)
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("menu_categories")
        .select("*");

      // Se a consulta for bem-sucedida, retornamos os dados
      if (!categoriesError && categoriesData) {
        return categoriesData;
      }

      // Se houver erro na primeira consulta, tentamos com o nome alternativo 'categorias'
      const { data: categoriasData, error: categoriasError } = await supabase
        .from("categorias")
        .select("*");

      if (categoriasError) {
        console.error("Erro ao consultar categorias:", categoriasError);
        return []; // Retornamos array vazio para evitar erros
      }

      return categoriasData;
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Tentamos inserir na tabela 'products' primeiro
      const { data: productData, error: productError } = await supabase
        .from("products")
        .insert([
          {
            name: newProduct.name,
            description: newProduct.description,
            price: parseFloat(newProduct.price),
            image_url: newProduct.image_url || "https://via.placeholder.com/150",
            menu_category_id: newProduct.category_id || null,
            restaurant_id: DEFAULT_RESTAURANT_ID,
            ingredients: [], // Array vazio por padrão
          },
        ])
        .select()
        .single();

      // Se houver erro na primeira tentativa, tentamos com a tabela 'produtos'
      if (productError) {
        console.log("Erro ao inserir em 'products', tentando 'produtos':", productError);
        
        const { data: produtoData, error: produtoError } = await supabase
          .from("produtos")
          .insert([
            {
              name: newProduct.name,
              description: newProduct.description,
              price: parseFloat(newProduct.price),
              image_url: newProduct.image_url || "https://via.placeholder.com/150",
              menu_category_id: newProduct.category_id || null,
              restaurant_id: DEFAULT_RESTAURANT_ID,
              ingredients: [], // Array vazio por padrão
            },
          ])
          .select()
          .single();

        if (produtoError) {
          throw new Error("Não foi possível adicionar o produto");
        }
      }

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
        description: "Não foi possível adicionar o produto",
        variant: "destructive",
      });
    }
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
                  onChange={(e) => handleInputChange(e as any)}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories?.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
              {products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <img
                      src={product.image_url || "https://via.placeholder.com/150"}
                      alt={product.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {product.description}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(product.price)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm">
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

export default Products;
