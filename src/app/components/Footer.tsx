import { Link } from "react-router";
import { Logo } from "./Logo";
import { useAuth } from "../context/AuthContext";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { userRole } = useAuth();

  const navigationLinks =
    userRole === "cuidador"
      ? [
          { label: "Inicio", path: "/inicio" },
          { label: "Usuarios", path: "/gestion-usuarios" },
          { label: "Evolución", path: "/evolucion-cuidador" },
          { label: "Ayuda", path: "/ayuda-cuidador" },
          { label: "Perfil", path: "/perfil-cuidador" },
        ]
      : [
          { label: "Inicio", path: "/inicio" },
          { label: "Juegos", path: "/juegos" },
          { label: "Evolución", path: "/evolucion" },
          { label: "Ayuda", path: "/ayuda" },
          { label: "Perfil", path: "/perfil" },
        ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-3">
            <Logo size={40} variant="white" />
            <div>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                <span
                  className="text-lg text-white leading-tight"
                  style={{ fontWeight: 700 }}
                >
                  VivaMente
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  Ejercicios cognitivos
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mt-1">
                Cuidando la mente, paso a paso.
              </p>
            </div>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-white text-xs mb-1.5" style={{ fontWeight: 700 }}>
              NAVEGACIÓN
            </h3>
            <nav className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 lg:gap-x-7 gap-y-2">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-5 pt-4">
          <p className="text-xs text-gray-500 text-center md:text-left">
            © {currentYear} VivaMente
          </p>
        </div>
      </div>
    </footer>
  );
}