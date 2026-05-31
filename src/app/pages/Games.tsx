import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Star } from "lucide-react";
import { gameApi } from "../../lib/api";
import { useAuth } from "../context/AuthContext";

const games = [
  { id: "memoria-visual",  label: "Memoria Visual",  icon: "🧠", desc: "Recuerda y asocia imágenes" },
  { id: "asociacion",      label: "Asociación",       icon: "🔗", desc: "Relaciona conceptos entre sí" },
  { id: "atencion",        label: "Atención",          icon: "👁️", desc: "Ejercita la concentración" },
  { id: "emparejar",       label: "Emparejar",         icon: "🃏", desc: "Encuentra los pares iguales" },
  { id: "reconocimiento",  label: "Reconocimiento",    icon: "🔍", desc: "Identifica objetos y lugares" },
  { id: "secuencia",       label: "Secuencia",         icon: "📋", desc: "Completa la serie" }
];

export default function Games() {
  const { accessToken } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!accessToken) return;

      try {
        const response = await gameApi.getFavorites(accessToken);
        setFavorites(new Set(response.favoritos || []));
      } catch (error) {
        console.error("❌ Error al cargar favoritos:", error);
      }
    };

    fetchFavorites();
  }, [accessToken]);

  const toggleFavorite = async (gameId: string) => {
    if (!accessToken) return;

    try {
      const response = await gameApi.toggleFavorite(gameId, accessToken);
      setFavorites(new Set(response.favoritos || []));
    } catch (error) {
      console.error("❌ Error al actualizar favorito:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
      {/* Header mejorado */}
      <div className="mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl text-gray-900 mb-2 sm:mb-3" style={{ fontWeight: 700 }}>
          Juegos Disponibles
        </h1>
        <p className="text-lg sm:text-xl text-gray-600">
          Selecciona un ejercicio para comenzar a entrenar tu mente
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
        {games.map((game) => {
          const isFavorite = favorites.has(game.id);
          
          return (
            <div
              key={game.id}
              className="rounded-3xl border-2 bg-white overflow-hidden hover:shadow-2xl transition-all relative group"
              style={{ borderColor: "#E5ECEC" }}
            >
              {/* Botón de favoritos */}
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  await toggleFavorite(game.id);
                }}
                className="absolute top-4 right-4 w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center transition-all z-10 hover:scale-110 shadow-lg"
                style={{
                  backgroundColor: isFavorite ? "#EFFCFB" : "#f9fafb",
                }}
                aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
              >
                <Star
                  size={26}
                  className={isFavorite ? "fill-[#12B8B2] text-[#12B8B2]" : "text-gray-300"}
                />
              </button>

              {/* Contenido del juego */}
              <Link to={`/ejercicio/${game.id}`} className="block p-6 sm:p-8 lg:p-10 flex flex-col items-center gap-4 sm:gap-5 hover:bg-gray-50 transition-colors">
                <span className="text-6xl sm:text-7xl mb-2 sm:mb-3">{game.icon}</span>
                <p
                  className="text-lg tracking-wide uppercase text-center"
                  style={{ color: "#12B8B2", fontWeight: 700 }}
                >
                  {game.label}
                </p>
                <p className="text-base text-gray-600 text-center leading-relaxed">{game.desc}</p>
                
                {/* Indicador visual de "Jugar" */}
                <div 
                  className="mt-2 sm:mt-4 px-6 py-3 rounded-xl text-white text-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: "#12B8B2", fontWeight: 700 }}
                >
                  Jugar ahora →
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}