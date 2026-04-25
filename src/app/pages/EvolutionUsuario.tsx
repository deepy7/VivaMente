import { Smile, Star, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { gameApi } from "../../lib/api";
import { useAuth } from "../context/AuthContext";

const GAME_INFO: Record<string, { name: string; icon: string }> = {
  "memoria-visual": { name: "Memoria Visual", icon: "🧠" },
  asociacion: { name: "Asociación", icon: "🔗" },
  atencion: { name: "Atención Selectiva", icon: "👁️" },
  emparejar: { name: "Emparejar", icon: "🃏" },
  reconocimiento: { name: "Reconocimiento", icon: "🔍" },
  secuencia: { name: "Secuencia Visual", icon: "📋" },
};

export default function EvolutionUsuario() {
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [favoriteGames, setFavoriteGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (accessToken) {
        try {
          console.log("📊 Obteniendo estadísticas del usuario...");
          const [response, favoritesResponse] = await Promise.all([
            gameApi.getUserStats(accessToken),
            gameApi.getFavorites(accessToken),
          ]);
          console.log("📊 Respuesta de estadísticas:", response);
          if (response.success) {
            setStats(response.stats);
            const favoriteIds = favoritesResponse.favoritos || [];
            const statsByGame = new Map(
              (response.stats.statsPorJuego || []).map((game: any) => [game.gameId, game]),
            );
            const nextFavoriteGames = favoriteIds.map((gameId) => {
              const gameStats: any = statsByGame.get(gameId);
              const gameInfo = GAME_INFO[gameId] || { name: gameId, icon: "🎮" };

              return {
                gameId,
                name: gameStats?.name || gameInfo.name,
                icon: gameStats?.icon || gameInfo.icon,
                estrellas: gameStats?.estrellas || 0,
              };
            });

            setFavoriteGames(nextFavoriteGames);
            console.log("✅ Estadísticas cargadas:", response.stats);
          }
        } catch (error) {
          console.error("❌ Error al obtener estadísticas:", error);
        } finally {
          setLoading(false);
        }
      } else {
        console.warn("⚠️ No hay accessToken disponible");
        setLoading(false);
      }
    };

    fetchStats();
  }, [accessToken]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-12 text-center">
        <p className="text-2xl text-gray-600">Cargando estadísticas...</p>
      </div>
    );
  }

  // Datos por defecto si no hay estadísticas
  const daysStreak = stats?.rachaActual || 0;
  const totalPoints = stats?.puntosTotal || 0;
  const gamesProgress = favoriteGames.length > 0 ? favoriteGames : stats?.favoriteGames || [];

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      {/* Header mejorado */}
      <div className="flex items-start justify-between mb-12">
        <div>
          <h1 className="text-4xl text-gray-900 mb-3" style={{ fontWeight: 700 }}>
            Mi Progreso
          </h1>
          <p className="text-xl text-gray-600">
            ¡Mira todo lo que has logrado!
          </p>
        </div>
      </div>

      {/* Tarjeta principal - simplificada */}
      <div className="rounded-3xl border-2 bg-white p-14 shadow-lg text-center mb-10"
        style={{ borderColor: "#E5ECEC" }}>
        
        {/* Ícono grande */}
        <div className="flex justify-center mb-8">
          <div className="w-36 h-36 rounded-full flex items-center justify-center"
            style={{ 
              background: "#12B8B2",
            }}>
            <Smile className="w-24 h-24 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Mensaje motivacional */}
        <h2 className="text-5xl mb-5" style={{ fontWeight: 700, color: "#1f2937" }}>
          ¡Lo estás haciendo genial!
        </h2>
        <p className="text-2xl text-gray-600 mb-12">
          Sigue así, cada día mejoras más
        </p>

        {/* Estadísticas en dos columnas */}
        <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Racha de días */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border-2" style={{ borderColor: "#E5ECEC" }}>
            <p className="text-lg text-gray-600 mb-4" style={{ fontWeight: 600 }}>
              Llevas jugando:
            </p>
            <div className="flex justify-center gap-1 mb-4">
              {Array.from({ length: Math.min(daysStreak, 5) }).map((_, i) => (
                <Star
                  key={i}
                  className="w-10 h-10"
                  style={{ color: "#12B8B2", fill: "#12B8B2" }}
                />
              ))}
            </div>
            <p className="text-6xl mb-2 text-gray-900" style={{ fontWeight: 700 }}>
              {daysStreak}
            </p>
            <p className="text-lg text-gray-600">días seguidos</p>
          </div>

          {/* Puntos totales */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border-2" style={{ borderColor: "#E5ECEC" }}>
            <p className="text-lg text-gray-600 mb-4" style={{ fontWeight: 600 }}>
              Puntos obtenidos:
            </p>
            <div className="flex justify-center mb-4">
              <TrendingUp size={48} style={{ color: "#12B8B2" }} />
            </div>
            <p className="text-6xl mb-2 text-gray-900" style={{ fontWeight: 700 }}>
              {totalPoints}
            </p>
            <p className="text-lg text-gray-600">puntos totales</p>
          </div>
        </div>
      </div>

      {/* Progreso de juegos - simplificado */}
      <div className="rounded-3xl border-2 bg-white p-12 shadow-lg"
        style={{ borderColor: "#E5ECEC" }}>
        
        <h3 className="text-3xl text-center mb-10" style={{ fontWeight: 700, color: "#1f2937" }}>
          Tus juegos favoritos
        </h3>

        {gamesProgress.length > 0 ? (
          <div className="space-y-8">
            {gamesProgress.map((game, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-8 p-6 rounded-2xl hover:bg-gray-50 transition-colors border-2"
                style={{ borderColor: "#E5ECEC" }}
              >
                {/* Icono */}
                <div 
                  className="text-6xl w-20 h-20 flex items-center justify-center rounded-2xl"
                  style={{ backgroundColor: "#EFFCFB" }}
                >
                  {game.icon}
                </div>
                
                {/* Nombre */}
                <div className="flex-1">
                  <p className="text-3xl text-gray-900" style={{ fontWeight: 700 }}>
                    {game.name}
                  </p>
                </div>

                {/* Estrellas */}
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-10 h-10"
                      style={{
                        color: i < game.estrellas ? "#12B8B2" : "#e5e7eb",
                        fill: i < game.estrellas ? "#12B8B2" : "#e5e7eb",
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-2xl text-gray-500 mb-3">
              Aún no has marcado juegos favoritos
            </p>
            <p className="text-xl text-gray-400">
              Marca la estrella en la pantalla de juegos para verlos aquí
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
