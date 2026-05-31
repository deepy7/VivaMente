import { useLocation, useNavigate, Link } from "react-router";
import { RotateCcw, ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { gameApi } from "../../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  
  // Obtener los datos del resultado desde el estado de navegación
  const { gameId, score, aciertos, errores, tiempo } = location.state || {
    gameId: "memoria-visual",
    score: 85,
    aciertos: 4,
    errores: 1,
    tiempo: 45
  };

  // Guardar resultado en la base de datos al cargar la página
  useEffect(() => {
    const saveResult = async () => {
      if (accessToken && gameId) {
        try {
          console.log("Guardando resultado:", { gameId, score, aciertos, errores, tiempo });
          const response = await gameApi.saveResult(
            { gameId, score, aciertos, errores, tiempo },
            accessToken
          );
          console.log("✅ Resultado guardado exitosamente:", response);
        } catch (error) {
          console.error("❌ Error al guardar resultado:", error);
        }
      } else {
        console.warn("⚠️ No se puede guardar resultado - accessToken o gameId faltante:", { accessToken: !!accessToken, gameId });
      }
    };

    saveResult();
  }, [gameId, score, aciertos, errores, tiempo, accessToken]);

  const handlePlayAgain = () => {
    navigate(`/ejercicio/${gameId}`);
  };

  // Determinar mensaje según la puntuación
  const getMessage = () => {
    if (score >= 90) return { emoji: "🌟", text: "¡Excelente trabajo!", color: "#12B8B2" };
    if (score >= 70) return { emoji: "😊", text: "¡Muy bien hecho!", color: "#12B8B2" };
    if (score >= 50) return { emoji: "👍", text: "¡Buen intento!", color: "#12B8B2" };
    return { emoji: "💪", text: "¡Sigue intentándolo!", color: "#12B8B2" };
  };

  const message = getMessage();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-8">
      {/* Título */}
      <h1 className="text-3xl sm:text-4xl text-center text-gray-900 mb-5 sm:mb-6" style={{ fontWeight: 700 }}>
        Resultado del Ejercicio
      </h1>

      {/* Tarjeta principal de resultados */}
      <div 
        className="rounded-3xl border-2 bg-white p-5 sm:p-6 lg:p-8 mb-5 sm:mb-6 text-center shadow-2xl" 
        style={{ borderColor: "#E5ECEC" }}
      >
        <p className="text-base text-gray-600 mb-2 uppercase tracking-wider" style={{ fontWeight: 700 }}>
          Tu puntuación
        </p>
        <p className="text-6xl sm:text-7xl lg:text-8xl mb-3 sm:mb-4" style={{ fontWeight: 700, color: "#12B8B2" }}>
          {score}
        </p>
        <p className="text-lg sm:text-xl text-gray-500 mb-4 sm:mb-5">de 100 puntos</p>

        {/* Mensaje */}
        <div className="py-3 sm:py-4 mb-3 sm:mb-4">
          <p className="text-5xl sm:text-6xl lg:text-7xl mb-3 sm:mb-4">{message.emoji}</p>
          <p className="text-2xl sm:text-3xl lg:text-4xl" style={{ fontWeight: 700, color: message.color }}>
            {message.text}
          </p>
        </div>

        {/* Detalles de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 pt-5 border-t-2 border-gray-200 mt-3 sm:mt-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border-2" style={{ borderColor: "#E5ECEC" }}>
            <p className="text-sm text-gray-600 mb-2" style={{ fontWeight: 600 }}>Aciertos</p>
            <p className="text-3xl sm:text-4xl" style={{ fontWeight: 700, color: "#12B8B2" }}>
              {aciertos}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border-2" style={{ borderColor: "#E5ECEC" }}>
            <p className="text-sm text-gray-600 mb-2" style={{ fontWeight: 600 }}>Errores</p>
            <p className="text-3xl sm:text-4xl" style={{ fontWeight: 700, color: "#E88F7A" }}>
              {errores}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border-2" style={{ borderColor: "#E5ECEC" }}>
            <p className="text-sm text-gray-600 mb-2" style={{ fontWeight: 600 }}>Tiempo</p>
            <p className="text-3xl sm:text-4xl text-gray-700" style={{ fontWeight: 700 }}>
              {tiempo}s
            </p>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <button
          onClick={handlePlayAgain}
          className="w-full flex items-center justify-center gap-3 text-white text-lg sm:text-xl px-6 sm:px-10 py-4 sm:py-5 lg:py-6 rounded-2xl transition-all hover:scale-[1.02] shadow-xl"
          style={{ 
            background: "#12B8B2",
            fontWeight: 700 
          }}
        >
          <RotateCcw size={28} />
          Jugar otra vez
        </button>

        <Link
          to="/juegos"
          className="w-full flex items-center justify-center gap-3 border-2 hover:bg-gray-50 text-gray-800 text-lg sm:text-xl px-6 sm:px-10 py-4 sm:py-5 lg:py-6 rounded-2xl transition-all hover:scale-[1.02]"
          style={{ borderColor: "#12B8B2", fontWeight: 700 }}
        >
          <ArrowLeft size={28} />
          Otros juegos
        </Link>
      </div>
    </div>
  );
}