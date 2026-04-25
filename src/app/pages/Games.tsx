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
    <div className="max-w-6xl mx-auto px-8 py-12">
      {/* Header mejorado */}
      <div className="mb-12">
        <h1 className="text-4xl text-gray-900 mb-3" style={{ fontWeight: 700 }}>
          Juegos Disponibles
        </h1>
        <p className="text-xl text-gray-600">
          Selecciona un ejercicio para comenzar a entrenar tu mente
        </p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {games.map((game) => {
          const isFavorite = favorites.has(game.id);
          
          return (
            <div
              key={game.id}
              className="rounded-3xl border-2 bg-white overflow-hidden hover:shadow-2xl transition-all relative group"
              style={{ borderColor: "#E5ECEC" }}
            >
              {/* Botón de favorito */}
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  await toggleFavorite(game.id);
                }}
                className="absolute top-5 right-5 w-14 h-14 rounded-full flex items-center justify-center transition-all z-10 hover:scale-110 shadow-lg"
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
              <Link to={`/ejercicio/${game.id}`} className="block p-10 flex flex-col items-center gap-5 hover:bg-gray-50 transition-colors">
                <span className="text-7xl mb-3">{game.icon}</span>
                <p
                  className="text-lg tracking-wide uppercase text-center"
                  style={{ color: "#12B8B2", fontWeight: 700 }}
                >
                  {game.label}
                </p>
                <p className="text-base text-gray-600 text-center leading-relaxed">{game.desc}</p>
                
                {/* Indicador visual de "Jugar" al hacer hover */}
                <div 
                  className="mt-4 px-6 py-3 rounded-xl text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity"
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