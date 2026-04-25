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
      <div className="max-w-6xl mx-auto px-8 h-20 flex items-center gap-10">
        <Link to="/inicio" className="flex items-center gap-3 shrink-0 group">
          <div className="transition-transform group-hover:scale-110">
            <Logo size={56} />
          </div>
          <div>
            <span
              className="text-lg text-gray-900 block leading-tight"
              style={{ fontWeight: 700, letterSpacing: "0.02em" }}
            >
              VivaMente
            </span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">
              Ejercicios cognitivos
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-8 ml-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative pb-1 text-base transition-colors group"
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

        <div className="ml-4">
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
