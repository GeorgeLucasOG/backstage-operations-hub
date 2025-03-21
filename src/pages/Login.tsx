
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [isResetMode, setIsResetMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, using hardcoded credentials
    if (email === "admin@admin.com" && password === "admin") {
      localStorage.setItem("isAuthenticated", "true");
      navigate("/admin");
      toast({
        title: "Login successful",
        description: "Welcome to the admin panel",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
    setIsRegistering(true);

    try {
      if (password !== confirmPassword) {
        toast({
          title: "Erro no registro",
          description: "As senhas não correspondem",
          variant: "destructive",
        });
        return;
      }

      if (!businessName.trim()) {
        toast({
          title: "Erro no registro",
          description: "O nome do restaurante é obrigatório",
          variant: "destructive",
        });
        return;
      }

      // Chamar a função de registro do hook useAuth
      const success = await register(name, email, password, businessName);

      if (success) {
        // Limpar os campos do formulário
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setBusinessName("");

        // Mudar para a aba de login
        const loginTab = document.querySelector('[data-value="login"]');
        if (loginTab instanceof HTMLElement) {
          loginTab.click();
        }
      }
    } finally {
      setIsRegistering(false);
=======
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
>>>>>>> parent of c1b20d4 (Implementar autenticação e proteção de rotas com contexto de autenticação)
    }
    // Here you would typically make an API call to register the user
    toast({
      title: "Registration successful",
      description: "Please log in with your new account",
    });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to send a reset password email
    toast({
      title: "Password reset email sent",
      description: "Please check your email for further instructions",
    });
    setIsResetMode(false);
  };

  if (isResetMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
<<<<<<< HEAD
            <h2 className="text-2xl font-semibold text-center">
              Recuperar Senha
            </h2>
=======
            <h2 className="text-2xl font-semibold text-center">Reset Password</h2>
>>>>>>> parent of c1b20d4 (Implementar autenticação e proteção de rotas com contexto de autenticação)
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
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button type="submit" className="w-full">
                Send Reset Link
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsResetMode(false)}
                className="w-full"
              >
                Back to Login
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-center">Admin Panel</h2>
        </CardHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@admin.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="password">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-normal text-sm"
                  onClick={() => setIsResetMode(true)}
                >
                  Forgot password?
                </Button>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="register-name">
                    Name
                  </label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
<<<<<<< HEAD
                  <Label htmlFor="register-business">Nome do Restaurante</Label>
                  <Input
                    id="register-business"
                    type="text"
                    placeholder="Restaurante João's"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
=======
                  <label className="text-sm font-medium" htmlFor="register-email">
                    Email
                  </label>
>>>>>>> parent of c1b20d4 (Implementar autenticação e proteção de rotas com contexto de autenticação)
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="register-password">
                    Password
                  </label>
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
                  <label className="text-sm font-medium" htmlFor="confirm-password">
                    Confirm Password
                  </label>
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
                <Button type="submit" className="w-full">
                  Register
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Login;
