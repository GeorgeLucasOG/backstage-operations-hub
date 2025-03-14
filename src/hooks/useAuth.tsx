import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (
    name: string,
    email: string,
    password: string,
    restaurant: string,
    profile: string
  ) => Promise<boolean>;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  restaurant?: string; // ID do restaurante associado ao usuário
}

// Interface para usuários que estão hardcoded para compatibilidade temporária
interface UserCredential {
  email: string;
  password: string;
  name: string;
  role: string;
  id: string;
  restaurant?: string; // ID do restaurante associado ao usuário
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provedor de autenticação que gerencia o estado de autenticação do usuário
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Lista de usuários do sistema (hardcoded)
  // Mantido apenas como fallback para administradores padrão, não para persistência de dados
  const getDefaultUsers = (): UserCredential[] => {
    return [
      {
        id: "1",
        name: "Administrador",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
      },
      {
        id: "2",
        name: "Admin",
        email: "admin@admin.com",
        password: "admin",
        role: "admin",
      },
    ];
  };

  /**
   * Função para converter o perfil para o formato armazenado no banco de dados
   * @param profile Perfil do usuário (admin, manager, pdv, monitor)
   * @returns Perfil como armazenado no banco de dados (admin, manager, pos, monitor)
   */
  const normalizeProfile = (profile: string): string => {
    // Converter 'pdv' (na interface) para 'pos' (no banco)
    if (profile.toLowerCase() === "pdv") return "pos";
    return profile.toLowerCase();
  };

  /**
   * Função para exibir o perfil na interface a partir do valor do banco
   * @param dbProfile Perfil como armazenado no banco (admin, manager, pos, monitor)
   * @returns Perfil formatado para a interface (admin, manager, pdv, monitor)
   */
  const formatProfileForUI = (dbProfile: string | null): string => {
    if (!dbProfile) return "desconhecido";
    // Converter 'pos' (no banco) para 'pdv' (na interface)
    if (dbProfile.toLowerCase() === "pos") return "pdv";
    return dbProfile.toLowerCase();
  };

  // Verificar se o usuário já está autenticado ao carregar a aplicação
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      }
    };

    checkAuth();
  }, []);

  /**
   * Função para verificar se um usuário exists no banco
   * @param email Email do usuário para verificar
   */
  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("User")
        .select("email")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows found
        console.error("Erro ao verificar usuário:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Erro ao verificar existência do usuário:", error);
      return false;
    }
  };

  /**
   * Função para registrar um novo usuário no Supabase
   * @param name Nome do usuário
   * @param email Email do usuário
   * @param password Senha do usuário
   * @param restaurant ID do restaurante ao qual o usuário está vinculado
   * @param profile Perfil/role do usuário (admin, manager, pdv, monitor)
   */
  const register = async (
    name: string,
    email: string,
    password: string,
    restaurant: string,
    profile: string
  ): Promise<boolean> => {
    try {
      // Normalizar o perfil para o formato do banco (converte 'pdv' para 'pos')
      const dbProfile = normalizeProfile(profile);

      console.log("Iniciando registro de usuário:", {
        name,
        email,
        profile,
        dbProfile,
        restaurant: restaurant || "nenhum",
      });

      // Verificar conexão com Supabase
      try {
        // Tentativa simples de consulta para verificar se o Supabase está respondendo
        const { data: pingTest, error: pingError } = await supabase
          .from("Restaurant")
          .select("id")
          .limit(1);

        if (pingError && pingError.code !== "PGRST116") {
          console.error("Erro de conexão com Supabase:", pingError);
          toast({
            title: "Erro de conexão",
            description:
              "Não foi possível conectar ao banco de dados. Verifique sua conexão com a internet.",
            variant: "destructive",
          });
          return false;
        }

        console.log("Conexão com Supabase OK");
      } catch (connError) {
        console.error("Erro ao verificar conexão:", connError);
      }

      // Verificar nos usuários padrão
      const defaultUsers = getDefaultUsers();
      if (defaultUsers.some((user) => user.email === email)) {
        toast({
          title: "Erro no registro",
          description:
            "Este email já está sendo utilizado por um usuário do sistema",
          variant: "destructive",
        });
        return false;
      }

      // Verificar se a tabela User existe
      try {
        const { count, error: tableCheckError } = await supabase
          .from("User")
          .select("*", { count: "exact", head: true });

        if (tableCheckError) {
          console.error("Erro verificando tabela User:", tableCheckError);
          if (tableCheckError.code === "PGRST301") {
            // Relação não existe
            toast({
              title: "Erro de estrutura do banco",
              description:
                "A tabela 'User' não foi encontrada. Execute o script SQL para criar as tabelas.",
              variant: "destructive",
            });
            return false;
          }
        }

        console.log("Tabela User verificada com sucesso");
      } catch (tableError) {
        console.error("Erro ao verificar tabela User:", tableError);
        toast({
          title: "Erro no registro",
          description:
            "Erro ao verificar tabela de usuários: " +
            (tableError instanceof Error
              ? tableError.message
              : String(tableError)),
          variant: "destructive",
        });
        return false;
      }

      // Obter o role_id correspondente ao perfil selecionado
      let roleId = null;
      try {
        // Buscar o ID do perfil na tabela roles
        const { data: roleData, error: roleError } = await supabase
          .from("roles")
          .select("id")
          .eq("name", dbProfile) // Usar o perfil normalizado
          .single();

        if (roleError) {
          console.error("Erro ao buscar role_id:", roleError);
          if (roleError.code === "PGRST116") {
            toast({
              title: "Erro no registro",
              description: `O perfil "${dbProfile}" não está cadastrado no sistema. Perfis válidos devem estar na tabela 'roles'.`,
              variant: "destructive",
            });
            return false;
          } else {
            throw new Error(`Erro ao buscar role_id: ${roleError.message}`);
          }
        }

        if (roleData) {
          roleId = roleData.id;
          console.log(`Role "${dbProfile}" encontrada com ID: ${roleId}`);
        } else {
          toast({
            title: "Erro no registro",
            description: `Não foi possível encontrar o perfil "${dbProfile}" na tabela 'roles'.`,
            variant: "destructive",
          });
          return false;
        }
      } catch (roleError) {
        console.error("Erro ao buscar role_id:", roleError);
        toast({
          title: "Erro no registro",
          description:
            "Erro ao buscar o ID do perfil: " +
            (roleError instanceof Error
              ? roleError.message
              : String(roleError)),
          variant: "destructive",
        });
        return false;
      }

      // Verificar se a tabela Restaurant existe (necessária para a foreign key)
      if (restaurant) {
        try {
          const { count, error: restaurantTableError } = await supabase
            .from("Restaurant")
            .select("*", { count: "exact", head: true });

          if (restaurantTableError) {
            console.error(
              "Erro verificando tabela Restaurant:",
              restaurantTableError
            );
            if (restaurantTableError.code === "PGRST301") {
              toast({
                title: "Erro de estrutura do banco",
                description:
                  "A tabela 'Restaurant' não foi encontrada. Esta tabela é necessária para vincular usuários a restaurantes.",
                variant: "destructive",
              });
              return false;
            }
          }

          console.log("Tabela Restaurant verificada com sucesso");
        } catch (tableError) {
          console.error("Erro ao verificar tabela Restaurant:", tableError);
        }
      }

      // Verificar no banco de dados se o usuário já existe
      const userExists = await checkUserExists(email);
      if (userExists) {
        toast({
          title: "Erro no registro",
          description: "Este email já está sendo utilizado",
          variant: "destructive",
        });
        return false;
      }

      // Validar se perfis restritos têm um restaurante associado
      if (
        (dbProfile === "manager" ||
          dbProfile === "pos" ||
          dbProfile === "monitor") &&
        !restaurant
      ) {
        toast({
          title: "Erro no registro",
          description:
            "Usuários com este perfil precisam estar associados a um restaurante",
          variant: "destructive",
        });
        return false;
      }

      // Gerar ID único para o usuário
      const userId = uuidv4();
      const now = new Date().toISOString();

      console.log("Tentando inserir usuário com ID:", userId);

      // 1. Inserir o usuário na tabela User - agora usando role_id diretamente
      const { data: userData, error: userError } = await supabase
        .from("User")
        .insert([
          {
            id: userId,
            name,
            email,
            password,
            role_id: roleId, // Usar role_id em vez de role
            created_at: now,
            updated_at: now,
          },
        ])
        .select("id")
        .single();

      if (userError) {
        console.error("Erro detalhado ao criar usuário:", {
          código: userError.code,
          mensagem: userError.message,
          detalhes: userError.details,
          hint: userError.hint,
        });

        // Mensagens de erro específicas com base no código
        let errorMessage = "Erro ao criar usuário";

        if (userError.code === "23505") {
          // Violação de chave única
          errorMessage = "Este email já está sendo utilizado por outro usuário";
        } else if (userError.code === "42P01") {
          // Relação não existe
          errorMessage =
            "Tabela de usuários não encontrada. Execute o script SQL para criar/renomear as tabelas.";
        } else if (userError.code === "23503") {
          // Violação de chave estrangeira
          if (userError.message.includes("role_id")) {
            errorMessage = "O perfil selecionado não existe na tabela 'roles'.";
          } else {
            errorMessage =
              "Erro de referência. Verifique se o restaurante selecionado existe";
          }
        } else if (userError.code === "23514") {
          // Violação de constraint
          errorMessage =
            "Dados inválidos. Verifique se o perfil selecionado é válido";
        } else if (userError.code === "42501" || userError.code === "42P10") {
          // Erro de permissão
          errorMessage =
            "Erro de permissão. Verifique as políticas de segurança (RLS) no Supabase para a tabela User";
        } else {
          // Erro genérico - incluir mais detalhes
          errorMessage = `Erro ao criar usuário: ${userError.message} (Código: ${userError.code})`;
        }

        toast({
          title: "Erro no registro",
          description: errorMessage,
          variant: "destructive",
        });

        throw new Error(`Erro ao criar usuário: ${userError.message}`);
      }

      console.log(
        `Usuário ${email} registrado com sucesso no Supabase com ID: ${userId}`
      );

      // 2. Se houver um restaurante associado, criar a relação
      if (restaurant) {
        console.log("Verificando existência do restaurante:", restaurant);

        // Verificar primeiro se o restaurante existe
        const { data: restaurantCheck, error: restaurantCheckError } =
          await supabase
            .from("Restaurant")
            .select("id")
            .eq("id", restaurant)
            .single();

        if (restaurantCheckError) {
          console.error("Erro ao verificar restaurante:", restaurantCheckError);

          // Se o restaurante não existe, excluir o usuário e retornar erro
          if (restaurantCheckError.code === "PGRST116") {
            console.log(
              "Restaurante não encontrado. Excluindo usuário criado:",
              userId
            );
            await supabase.from("User").delete().eq("id", userId);
            toast({
              title: "Erro no registro",
              description: "O restaurante selecionado não existe",
              variant: "destructive",
            });
            return false;
          }
        }

        console.log("Criando relação usuário-restaurante");

        // Verificar se a tabela UserRestaurant existe
        try {
          const { count, error: userRestTableError } = await supabase
            .from("UserRestaurant")
            .select("*", { count: "exact", head: true });

          if (userRestTableError) {
            console.error(
              "Erro verificando tabela UserRestaurant:",
              userRestTableError
            );
            if (userRestTableError.code === "PGRST301") {
              // Excluir o usuário criado
              await supabase.from("User").delete().eq("id", userId);

              toast({
                title: "Erro de estrutura do banco",
                description:
                  "A tabela 'UserRestaurant' não foi encontrada. Execute o script SQL para criar/renomear as tabelas.",
                variant: "destructive",
              });
              return false;
            }
          }
        } catch (tableError) {
          console.error("Erro ao verificar tabela UserRestaurant:", tableError);
        }

        const { error: relationError } = await supabase
          .from("UserRestaurant")
          .insert([
            {
              user_id: userId,
              restaurant_id: restaurant,
              created_at: now,
              updated_at: now,
            },
          ]);

        if (relationError) {
          console.error("Erro detalhado ao associar usuário ao restaurante:", {
            código: relationError.code,
            mensagem: relationError.message,
            detalhes: relationError.details,
            hint: relationError.hint,
          });

          // Tentar excluir o usuário criado para evitar inconsistências
          await supabase.from("User").delete().eq("id", userId);

          let errorMessage = "Erro ao associar usuário ao restaurante";

          if (relationError.code === "42P01") {
            errorMessage =
              "Tabela 'UserRestaurant' não encontrada. Execute o script SQL para criar/renomear as tabelas.";
          } else if (relationError.code === "23503") {
            errorMessage = "O restaurante selecionado não existe";
          } else if (
            relationError.code === "42501" ||
            relationError.code === "42P10"
          ) {
            errorMessage =
              "Erro de permissão. Verifique as políticas de segurança (RLS) no Supabase para a tabela UserRestaurant";
          } else {
            errorMessage = `Erro ao associar usuário ao restaurante: ${relationError.message} (Código: ${relationError.code})`;
          }

          toast({
            title: "Erro no registro",
            description: errorMessage,
            variant: "destructive",
          });

          throw new Error(
            `Erro ao associar usuário ao restaurante: ${relationError.message}`
          );
        }
      }

      toast({
        title: "Registro realizado com sucesso",
        description: "Agora você pode fazer login com suas credenciais",
        variant: "default",
      });

      return true;
    } catch (error) {
      console.error("Erro completo ao registrar usuário:", error);

      // Verificar se é um erro já tratado (que já mostrou toast)
      if (
        error instanceof Error &&
        error.message.startsWith("Erro ao criar usuário:")
      ) {
        // Já mostrou toast específico
        return false;
      }

      // Erro genérico
      let errorMessage = "Ocorreu um erro ao tentar registrar o usuário.";
      if (error instanceof Error) {
        errorMessage += " Detalhes: " + error.message;
      }

      toast({
        title: "Erro no registro",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * Função para autenticar o usuário
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // 1. Verificar nos usuários padrão (hardcoded)
      const defaultUsers = getDefaultUsers();
      const defaultUser = defaultUsers.find(
        (user) => user.email === email && user.password === password
      );

      if (defaultUser) {
        // Criar objeto de usuário autenticado (sem a senha)
        const authenticatedUser = {
          id: defaultUser.id,
          name: defaultUser.name,
          email: defaultUser.email,
          role: defaultUser.role,
          restaurant: defaultUser.restaurant,
        };

        // Armazenar dados de autenticação
        localStorage.setItem("token", "jwt-token-" + defaultUser.id);
        localStorage.setItem("user", JSON.stringify(authenticatedUser));

        setIsAuthenticated(true);
        setUser(authenticatedUser);

        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo, ${defaultUser.name}!`,
          variant: "default",
        });

        return true;
      }

      // 2. Verificar no banco de dados
      const { data: userData, error: userError } = await supabase
        .from("User")
        .select(
          `
          id, 
          name, 
          email, 
          role_id,
          roles:role_id (name)
        `
        )
        .eq("email", email)
        .eq("password", password)
        .single();

      if (userError) {
        if (userError.code === "PGRST116") {
          // Nenhum registro encontrado
          toast({
            title: "Falha no login",
            description: "Email ou senha incorretos",
            variant: "destructive",
          });
        } else {
          console.error("Erro ao buscar usuário:", userError);
          toast({
            title: "Erro no login",
            description: "Ocorreu um erro ao tentar fazer login",
            variant: "destructive",
          });
        }
        return false;
      }

      // 3. Buscar restaurante associado ao usuário (se houver)
      let restaurant = undefined;
      // Extrair o nome do role do objeto aninhado e converter para o formato da interface
      const roleName = userData.roles
        ? formatProfileForUI(userData.roles.name)
        : null;

      if (roleName !== "admin") {
        const { data: restaurantData, error: restaurantError } = await supabase
          .from("UserRestaurant")
          .select("restaurant_id")
          .eq("user_id", userData.id)
          .single();

        if (restaurantError && restaurantError.code !== "PGRST116") {
          console.error(
            "Erro ao buscar restaurante do usuário:",
            restaurantError
          );
        }

        if (restaurantData) {
          restaurant = restaurantData.restaurant_id;
        }
      }

      // 4. Criar objeto de usuário autenticado
      const authenticatedUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: roleName || "desconhecido", // Usar o nome do role formatado para a interface
        restaurant,
      };

      console.log(
        `Usuário ${email} autenticado com sucesso via Supabase (ID: ${userData.id}, Perfil: ${roleName})`
      );

      // 5. Armazenar dados de autenticação
      localStorage.setItem("token", "jwt-token-" + userData.id);
      localStorage.setItem("user", JSON.stringify(authenticatedUser));

      setIsAuthenticated(true);
      setUser(authenticatedUser);

      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${userData.name}!`,
        variant: "default",
      });

      return true;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao tentar fazer login",
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * Função para deslogar o usuário
   */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);

    // Redirecionar para a página de login
    navigate("/login");

    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para acessar o contexto de autenticação
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
};
