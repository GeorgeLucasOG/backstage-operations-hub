import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// Interface para os dados de restaurantes
interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

/**
 * Página de login da aplicação
 */
const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [restaurant, setRestaurant] = useState("");
  const [profile, setProfile] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
  const [isCreateRestaurantOpen, setIsCreateRestaurantOpen] = useState(false);
  const [newRestaurantName, setNewRestaurantName] = useState("");
  const [newRestaurantSlug, setNewRestaurantSlug] = useState("");
  const [isCreatingRestaurant, setIsCreatingRestaurant] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Obtém o caminho de origem, se existir
  const from = location.state?.from || "/admin";

  // Efeito para buscar os restaurantes existentes
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setIsLoadingRestaurants(true);
        const { data, error } = await supabase
          .from("Restaurant")
          .select("id, name, slug")
          .order("name");

        if (error) {
          throw error;
        }

        setRestaurants(data || []);
      } catch (error) {
        console.error("Erro ao buscar restaurantes:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de restaurantes",
          variant: "destructive",
        });
      } finally {
        setIsLoadingRestaurants(false);
      }
    };

    fetchRestaurants();
  }, [toast]);

  // Efeito para verificar se o perfil selecionado requer um restaurante
  useEffect(() => {
    // Se o perfil for Gerente, PDV ou Monitor, restaurante é obrigatório
    if (profile === "manager" || profile === "pdv" || profile === "monitor") {
      if (!restaurant) {
        toast({
          title: "Atenção",
          description: "Para este perfil, selecione um restaurante",
          variant: "default",
        });
      }
    }
  }, [profile, toast]);

  // Função para criar um novo restaurante (apenas para gerentes)
  const handleCreateRestaurant = async () => {
    if (!newRestaurantName || !newRestaurantSlug) {
      toast({
        title: "Campos incompletos",
        description: "Nome e slug do restaurante são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingRestaurant(true);

    try {
      // Verificar se o slug já existe
      const { data: existingSlug, error: slugError } = await supabase
        .from("Restaurant")
        .select("id")
        .eq("slug", newRestaurantSlug)
        .single();

      if (existingSlug) {
        toast({
          title: "Slug já em uso",
          description:
            "Este slug já está sendo utilizado por outro restaurante",
          variant: "destructive",
        });
        return;
      }

      // Gerar ID único
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      // Criar o restaurante com informações básicas
      const { data, error } = await supabase
        .from("Restaurant")
        .insert([
          {
            id,
            name: newRestaurantName,
            slug: newRestaurantSlug,
            description: "",
            avatarImageUrl: "",
            coverImageUrl: "",
            createdAt: now,
            updatedAt: now,
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      // Atualizar a lista de restaurantes
      setRestaurants([...(data || []), ...restaurants]);

      // Selecionar o novo restaurante
      if (data && data.length > 0) {
        setRestaurant(data[0].id);
      }

      toast({
        title: "Restaurante criado",
        description: "O restaurante foi criado com sucesso",
      });

      setIsCreateRestaurantOpen(false);
      setNewRestaurantName("");
      setNewRestaurantSlug("");
    } catch (error) {
      console.error("Erro ao criar restaurante:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o restaurante",
        variant: "destructive",
      });
    } finally {
      setIsCreatingRestaurant(false);
    }
  };

  // Função para gerar slug a partir do nome
  const generateSlug = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setNewRestaurantSlug(slug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        // Redireciona para a página de origem ou para o dashboard
        navigate(from, { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);

    try {
      if (password !== confirmPassword) {
        toast({
          title: "Erro no registro",
          description: "As senhas não correspondem",
          variant: "destructive",
        });
        setIsRegistering(false);
        return;
      }

      if (!profile) {
        toast({
          title: "Erro no registro",
          description: "Selecione um perfil",
          variant: "destructive",
        });
        setIsRegistering(false);
        return;
      }

      // Validar que perfis restritos (não admin) precisam ter um restaurante
      if (
        (profile === "manager" || profile === "pdv" || profile === "monitor") &&
        !restaurant
      ) {
        toast({
          title: "Erro no registro",
          description:
            "Para perfis de Gerente, PDV e Monitor, é obrigatório selecionar um restaurante",
          variant: "destructive",
        });
        setIsRegistering(false);
        return;
      }

      // Chamar a função de registro do hook useAuth
      const success = await register(
        name,
        email,
        password,
        restaurant,
        profile
      );

      if (success) {
        // Limpar os campos do formulário
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setRestaurant("");
        setProfile("");

        // Mudar para a aba de login
        const loginTab = document.querySelector('[data-value="login"]');
        if (loginTab instanceof HTMLElement) {
          loginTab.click();
        }
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você implementaria a lógica para resetar a senha
    toast({
      title: "Email de recuperação enviado",
      description: "Verifique sua caixa de entrada para redefinir sua senha",
    });
    setIsResetMode(false);
  };

  if (isResetMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-center">
              Reset Password
            </h2>
          </CardHeader>
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="reset-email">
                  Email
                </label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button type="submit" className="w-full">
                Enviar link de recuperação
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsResetMode(false)}
                className="w-full"
              >
                Voltar para o login
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Admin Food</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o painel administrativo
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" data-value="login">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" data-value="register">
              Cadastro
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <a
                      href="#"
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsResetMode(true);
                      }}
                    >
                      Esqueceu a senha?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nome</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="João Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="joao@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-profile">Perfil</Label>
                  <Select
                    value={profile}
                    onValueChange={(value) => {
                      setProfile(value);
                      // Se mudar para admin, limpa o restaurante pois não é obrigatório
                      if (value === "admin") {
                        setRestaurant("");
                      }
                    }}
                    required
                  >
                    <SelectTrigger id="register-profile">
                      <SelectValue placeholder="Selecione um perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="pdv">PDV</SelectItem>
                      <SelectItem value="monitor">Monitor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Campo de seleção de restaurante para perfis restritos */}
                {(profile === "manager" ||
                  profile === "pdv" ||
                  profile === "monitor") && (
                  <div className="space-y-2">
                    <Label htmlFor="register-restaurant">
                      Restaurante <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Select
                        value={restaurant}
                        onValueChange={setRestaurant}
                        required
                      >
                        <SelectTrigger
                          id="register-restaurant"
                          className="flex-1"
                        >
                          <SelectValue
                            placeholder={
                              isLoadingRestaurants
                                ? "Carregando restaurantes..."
                                : "Selecione um restaurante"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {restaurants.length === 0 ? (
                            <SelectItem value="" disabled>
                              Nenhum restaurante disponível
                            </SelectItem>
                          ) : (
                            restaurants.map((r) => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.name} ({r.slug})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>

                      {/* Botão para criar restaurante (apenas para gerentes) */}
                      {profile === "manager" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setIsCreateRestaurantOpen(true)}
                          title="Criar novo restaurante"
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Um usuário de perfil não-administrador só pode pertencer a
                      um restaurante
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="register-password">Senha</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isRegistering}
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    "Cadastrar"
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Dialog para criar novo restaurante */}
      <Dialog
        open={isCreateRestaurantOpen}
        onOpenChange={setIsCreateRestaurantOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Restaurante</DialogTitle>
            <DialogDescription>
              Preencha as informações básicas do restaurante. Você poderá editar
              os detalhes completos depois.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-restaurant-name">Nome do Restaurante</Label>
              <Input
                id="new-restaurant-name"
                value={newRestaurantName}
                onChange={(e) => {
                  setNewRestaurantName(e.target.value);
                  generateSlug(e.target.value);
                }}
                placeholder="Restaurante Exemplo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-restaurant-slug">
                Slug (identificador único)
              </Label>
              <Input
                id="new-restaurant-slug"
                value={newRestaurantSlug}
                onChange={(e) => setNewRestaurantSlug(e.target.value)}
                placeholder="restaurante-exemplo"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                O slug é usado como identificador único do restaurante e não
                pode ser alterado facilmente depois.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateRestaurantOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateRestaurant}
              disabled={
                isCreatingRestaurant || !newRestaurantName || !newRestaurantSlug
              }
            >
              {isCreatingRestaurant ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Restaurante"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
