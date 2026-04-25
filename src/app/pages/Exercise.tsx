import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Trophy } from "lucide-react";
import { MemoriaVisual } from "../components/games/MemoriaVisual";
import { Asociacion } from "../components/games/Asociacion";
import { AtencionSelectiva } from "../components/games/AtencionSelectiva";
import { Emparejamiento } from "../components/games/Emparejamiento";
import { Reconocimiento } from "../components/games/Reconocimiento";
import { SecuenciaVisual } from "../components/games/SecuenciaVisual";

const gameComponents: Record<string, { component: React.ComponentType<any>; title: string; icon: string }> = {
  "memoria-visual": { component: MemoriaVisual, title: "Memoria Visual", icon: "🧠" },
  "asociacion": { component: Asociacion, title: "Asociación", icon: "🔗" },
  "atencion": { component: AtencionSelectiva, title: "Atención Selectiva", icon: "👁️" },
  "emparejar": { component: Emparejamiento, title: "Emparejar", icon: "🃏" },
  "reconocimiento": { component: Reconocimiento, title: "Reconocimiento", icon: "🔍" },
  "secuencia": { component: SecuenciaVisual, title: "Secuencia Visual", icon: "📋" },
};

export default function Exercise() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const game = gameId ? gameComponents[gameId] : null;

  if (!game) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-12 text-center">
        <p className="text-2xl text-gray-700">Juego no encontrado</p>
        <button
          onClick={() => navigate("/juegos")}
          className="mt-8 px-8 py-4 bg-gray-900 text-white rounded-2xl text-xl"
          style={{ fontWeight: 700 }}
        >
          Volver a juegos
        </button>
      </div>
    );
  }

  const GameComponent = game.component;

  const handleComplete = (aciertos: number, errores: number, tiempo: number) => {
    // Calcular puntuación basada en porcentaje de aciertos
    // Total de preguntas = aciertos + errores (lo que respondió o debió responder)
    const totalPreguntas = aciertos + errores;
    
    // Si no hay preguntas (caso edge), score = 0
    if (totalPreguntas === 0) {
      navigate("/resultados", {
        state: { gameId, score: 0, aciertos: 0, errores: 0, tiempo },
      });
      return;
    }
    
    // Calcular porcentaje: (aciertos / total) * 100
    const score = Math.round((aciertos / totalPreguntas) * 100);

    navigate("/resultados", {
      state: {
        gameId,
        score,
        aciertos,
        errores,
        tiempo,
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      {/* Header mejorado */}
      <div
        className="rounded-3xl border-2 bg-white px-12 py-10 shadow-xl"
        style={{ borderColor: "#E5ECEC" }}
      >
        {/* Header mejorado */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <span className="text-7xl">{game.icon}</span>
            <div>
              <p
                className="text-2xl tracking-wide uppercase"
                style={{ color: "#12B8B2", fontWeight: 700 }}
              >
                {game.title}
              </p>
              <p className="text-base text-gray-500 mt-2">
                Completa el ejercicio para obtener tu puntuación
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/juegos")}
            className="flex items-center gap-2 px-6 py-3 border-2 hover:bg-gray-50 rounded-xl text-base transition-colors text-gray-700 cursor-pointer"
            style={{ borderColor: "#12B8B2", fontWeight: 600 }}
          >
            <ArrowLeft size={20} />
            Volver
          </button>
        </div>

        {/* Divisor */}
        <div className="border-t-2 border-gray-100 mb-10"></div>

        {/* Game Component */}
        <div className="py-6">
          <GameComponent onComplete={handleComplete} />
        </div>
      </div>
    </div>
  );
}