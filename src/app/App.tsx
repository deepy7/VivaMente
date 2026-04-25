import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";

/**
 * Aplicación principal - Sistema de roles Alzheimer
 * - Usuario: Interfaz simplificada
 * - Cuidador: Interfaz completa con gestión
 */
export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster 
        position="top-right" 
        richColors 
        expand={false}
        closeButton
      />
    </AuthProvider>
  );
}