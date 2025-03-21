import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserCredential {
  email: string;
  password: string;
  name: string;
  role: string;
  id: string;
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

  // Lista de usuários do sistema (hardcoded + localStorage)
  const getUsers = (): UserCredential[] => {
    // Usuários padrão do sistema
    const defaultUsers: UserCredential[] = [
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

    // Verificar se há usuários adicionais no localStorage
    const storedUsers = localStorage.getItem("registeredUsers");
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers) as UserCredential[];
        return [...defaultUsers, ...parsedUsers];
      } catch (error) {
        console.error("Erro ao parsear usuários armazenados:", error);
      }
    }

    return defaultUsers;
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
   * Função para registrar um novo usuário
   */
  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      // Verificar se o email já está em uso
      const users = getUsers();
      if (users.some((user) => user.email === email)) {
        toast({
          title: "Erro no registro",
          description: "Este email já está sendo utilizado",
          variant: "destructive",
        });
        return false;
      }

      // Criação de um novo usuário
      const newUser: UserCredential = {
        id: Date.now().toString(), // ID único baseado no timestamp
        name,
        email,
        password,
        role: "user", // Novos usuários recebem a role "user" por padrão
      };

      // Salvar o novo usuário no localStorage
      const storedUsers = localStorage.getItem("registeredUsers");
      const registeredUsers = storedUsers ? JSON.parse(storedUsers) : [];
      registeredUsers.push(newUser);
      localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

      toast({
        title: "Registro realizado com sucesso",
        description: "Agora você pode fazer login com suas credenciais",
        variant: "default",
      });

      return true;
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      toast({
        title: "Erro no registro",
        description: "Ocorreu um erro ao tentar registrar o usuário",
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
      // Buscar usuário na lista de usuários (padrão + registrados)
      const users = getUsers();
      const foundUser = users.find(
        (user) => user.email === email && user.password === password
      );

      if (foundUser) {
        // Criar objeto de usuário autenticado (sem a senha)
        const authenticatedUser = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
        };

        // Armazenar dados de autenticação
        localStorage.setItem("token", "jwt-token-" + foundUser.id); // Simular um token JWT
        localStorage.setItem("user", JSON.stringify(authenticatedUser));

        setIsAuthenticated(true);
        setUser(authenticatedUser);

        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo, ${foundUser.name}!`,
          variant: "default",
        });

        return true;
      } else {
        toast({
          title: "Falha no login",
          description: "Email ou senha incorretos",
          variant: "destructive",
        });
        return false;
      }
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
