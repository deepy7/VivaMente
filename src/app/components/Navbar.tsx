import { Link, useLocation } from "react-router";
import { Logo } from "./Logo";
import { AvatarBadge } from "./AvatarIcon";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const location = useLocation();
  const { userRole, user } = useAuth();

  const profilePath = userRole === "cuidador" ? "/perfil-cuidador" : "/perfil";
  const evolutionPath = userRole === "cuidador" ? "/evolucion-cuidador" : "/evolucion";
  const helpPath = userRole === "cuidador" ? "/ayuda-cuidador" : "/ayuda";

  const navItems =
    userRole === "cuidador"
      ? [
          { label: "Inicio", path: "/inicio" },
          { label: "Usuarios", path: "/gestion-usuarios" },
          { label: "Evolución", path: evolutionPath },
          { label: "Ayuda", path: helpPath },
        ]
      : [
          { label: "Inicio", path: "/inicio" },
          { label: "Juegos", path: "/juegos" },
          { label: "Evolución", path: evolutionPath },
          { label: "Ayuda", path: helpPath },
        ];

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 sm:min-h-[4.5rem] flex flex-wrap sm:flex-nowrap items-center gap-x-4 gap-y-2 py-2">
        <Link to="/inicio" className="flex items-center gap-2 sm:gap-3 shrink-0 group">
          <div className="transition-transform group-hover:scale-110">
            <Logo size={48} />
          </div>
          <div className="min-w-0">
            <span
              className="text-base sm:text-lg text-gray-900 block leading-tight"
              style={{ fontWeight: 700, letterSpacing: "0.02em" }}
            >
              VivaMente
            </span>
            <span className="hidden sm:block text-xs text-gray-400 uppercase tracking-wider">
              Ejercicios cognitivos
            </span>
          </div>
        </Link>

        <nav className="order-3 w-full sm:order-none sm:w-auto flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6 lg:gap-x-8 sm:ml-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative shrink-0 pb-1 text-sm sm:text-base transition-colors group"
                style={{ color: isActive ? "#111" : "#9ca3af" }}
              >
                <span style={{ fontWeight: isActive ? 700 : 500 }}>{item.label}</span>

                {isActive && (
                  <span
                    className="absolute -bottom-[1px] left-0 w-full h-[3px] rounded-full"
                    style={{ backgroundColor: "#12B8B2" }}
                  />
                )}

                {!isActive && (
                  <span
                    className="absolute -bottom-[1px] left-0 w-0 h-[3px] rounded-full transition-all group-hover:w-full"
                    style={{ backgroundColor: "#12B8B2" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto sm:ml-2 lg:ml-4 shrink-0">
          <Link to={profilePath} aria-label="Ir al perfil">
            <div
              className="hover:scale-110 transition-transform"
            >
              <AvatarBadge
                avatarId={user?.avatar}
                nombre={user?.nombre}
                apellidos={user?.apellidos}
                email={user?.email}
                preferInitials={userRole === "cuidador"}
              />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
