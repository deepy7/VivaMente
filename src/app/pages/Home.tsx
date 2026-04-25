import { useAuth } from "../context/AuthContext";
import HomeUsuario from "./HomeUsuario";
import HomeCuidador from "./HomeCuidador";
import { Navigate } from "react-router";

/**
 * Home - Componente que decide qué página mostrar según el rol del usuario
 */
export default function Home() {
  const { userRole, isAuthenticated, isLoading } = useAuth();

  // Mientras carga la sesión
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "#12B8B2", borderTopColor: "transparent" }}
          />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Mostrar pantalla según el rol
  if (userRole === "cuidador") {
    return <HomeCuidador />;
  }

  return <HomeUsuario />;
}
