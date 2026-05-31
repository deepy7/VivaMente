import { createBrowserRouter, Navigate } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Root from "./pages/Root";
import Home from "./pages/Home";
import Games from "./pages/Games";
import Exercise from "./pages/Exercise";
import Results from "./pages/Results";
import EvolutionUsuario from "./pages/EvolutionUsuario";
import HelpUsuario from "./pages/HelpUsuario";
import ProfileUsuario from "./pages/ProfileUsuario";
import HomeCuidador from "./pages/HomeCuidador";
import EvolutionCuidador from "./pages/EvolutionCuidador";
import HelpCuidador from "./pages/HelpCuidador";
import ProfileCuidador from "./pages/ProfileCuidador";
import GestionUsuarios from "./pages/GestionUsuarios";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import { useAuth } from "./context/AuthContext";

function getAuthenticatedHomePath(userRole: "usuario" | "cuidador" | null) {
  return userRole === "cuidador" ? "/inicio-cuidador" : "/inicio";
}

function RootRedirect() {
  const { isAuthenticated, isLoading, userRole } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
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

  return <Navigate to={isAuthenticated ? getAuthenticatedHomePath(userRole) : "/login"} replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    children: [
      {
        index: true,
        element: <RootRedirect />,
      },

      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <Root />,
            children: [
              {
                path: "inicio",
                element: <Home />,
              },

              {
                element: <RoleRoute allowedRoles={["usuario"]} />,
                children: [
                  {
                    path: "juegos",
                    element: <Games />,
                  },
                  {
                    path: "ejercicio/:gameId",
                    element: <Exercise />,
                  },
                  {
                    path: "resultados",
                    element: <Results />,
                  },
                  {
                    path: "evolucion",
                    element: <EvolutionUsuario />,
                  },
                  {
                    path: "ayuda",
                    element: <HelpUsuario />,
                  },
                  {
                    path: "perfil",
                    element: <ProfileUsuario />,
                  },
                ],
              },

              {
                element: <RoleRoute allowedRoles={["cuidador"]} />,
                children: [
                  {
                    path: "inicio-cuidador",
                    element: <HomeCuidador />,
                  },
                  {
                    path: "evolucion-cuidador",
                    element: <EvolutionCuidador />,
                  },
                  {
                    path: "ayuda-cuidador",
                    element: <HelpCuidador />,
                  },
                  {
                    path: "perfil-cuidador",
                    element: <ProfileCuidador />,
                  },
                  {
                    path: "gestion-usuarios",
                    element: <GestionUsuarios />,
                  },
                ],
              },
            ],
          },
        ],
      },

      {
        path: "*",
        element: <Navigate to="/login" replace />,
      },
    ],
  },
]);