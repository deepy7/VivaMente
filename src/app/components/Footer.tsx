import { Link } from "react-router";
import { Logo } from "./Logo";
import { Heart, Mail, Github, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-8">
          {/* Branding */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <Logo size={44} />
              <div>
                <span
                  className="text-lg text-white block leading-tight"
                  style={{ fontWeight: 700 }}
                >
                  VivaMente
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  Ejercicios cognitivos
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Cuidando la mente, paso a paso.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-white text-sm mb-3" style={{ fontWeight: 700 }}>
              NAVEGACIÓN
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Inicio", path: "/inicio" },
                { label: "Juegos", path: "/juegos" },
                { label: "Evolución", path: "/evolucion" },
                { label: "Ayuda", path: "/ayuda" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info adicional */}
          <div>
            <h3 className="text-white text-sm mb-3" style={{ fontWeight: 700 }}>
              INFORMACIÓN
            </h3>
            <ul className="space-y-2">
              <li>
                <button className="text-sm text-gray-400 hover:text-white transition-colors text-left">
                  Acerca de
                </button>
              </li>
              <li>
                <button className="text-sm text-gray-400 hover:text-white transition-colors text-left">
                  Privacidad
                </button>
              </li>
              <li>
                <button className="text-sm text-gray-400 hover:text-white transition-colors text-left">
                  Términos de uso
                </button>
              </li>
              <li>
                <button className="text-sm text-gray-400 hover:text-white transition-colors text-left">
                  Accesibilidad
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} VivaMente
            </p>

            {/* Social links (opcionales - puedes personalizarlos) */}
            <div className="flex items-center gap-4">
              <button className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                <Mail size={16} className="text-gray-400" />
              </button>
              <button className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                <Github size={16} className="text-gray-400" />
              </button>
              <button className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                <Linkedin size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
