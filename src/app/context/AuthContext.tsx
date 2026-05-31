import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "../../lib/api";

type UserRole = "usuario" | "cuidador";

interface User {
  id: string;
  email: string;
  nombre: string;
  apellidos: string;
  rol: UserRole;
  especialidad?: string;
  experiencia?: number;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  setUserRole: (role: UserRole | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserAvatar: (avatar: string) => void;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Cargar el usuario guardado en localStorage al iniciar la aplicación
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem("access_token");
  });

  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (!savedUser) return null;
      const parsedUser: User = JSON.parse(savedUser);
      return parsedUser.rol ?? null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  const clearSession = () => {
    setUser(null);
    setUserRole(null);
    setAccessToken(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  };

  const setSession = (token: string, userData: User) => {
    setUser(userData);
    setUserRole(userData.rol);
    setAccessToken(token);
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const updateUserAvatar = (avatar: string) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;

      const updatedUser = {
        ...currentUser,
        avatar,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("access_token");
      const savedUser = localStorage.getItem("user");

      // Si no hay nada guardado, no hay sesión
      if (!token || !savedUser) {
        clearSession();
        setIsLoading(false);
        return;
      }

      try {
        const parsedUser: User = JSON.parse(savedUser);

        // Mantener sesión local mientras se verifica
        setUser(parsedUser);
        setUserRole(parsedUser.rol);
        setAccessToken(token);

        const response = await authApi.verifySession(token);

        if (!response.success) {
          clearSession();
        }
      } catch (error) {
        console.error("Error verificando sesión:", error);

      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });

      if (response.success) {
        setSession(response.access_token, response.user);
        return;
      }

      throw new Error("No se pudo iniciar sesión");
    } catch (error: any) {
      console.error("Error en login:", error);
      throw new Error(error.message || "Error al iniciar sesión");
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await authApi.logout(accessToken);
      }
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      clearSession();
    }
  };

  const isAuthenticated = !!user && !!accessToken;

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        setUserRole,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUserAvatar,
        accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}