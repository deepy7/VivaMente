import { Link } from "react-router";
import { Brain, Waypoints, Handshake, Eye, Search, List } from "lucide-react";

export default function HomeUsuario() {
  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16 flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
        {/* Left - Content */}
        <div className="flex-1 w-full">
          <div className="inline-block px-4 py-2 rounded-full mb-4 sm:mb-5" style={{ backgroundColor: "#EFFCFB", border: "1px solid #CDECEA" }}>
            <p className="text-sm" style={{ color: "#111827", fontWeight: 600 }}>
              🧠 Estimulación cognitiva accesible
            </p>
          </div>
          
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl text-gray-900 leading-tight mb-4 sm:mb-5"
            style={{ fontWeight: 700 }}
          >
            Cuida tu mente,<br />
            <span style={{ color: "#12B8B2" }}>conecta recuerdos</span>
          </h1>
          
          <p className="text-gray-600 text-lg sm:text-xl leading-relaxed mb-6 sm:mb-8 max-w-lg">
            Ejercicios sencillos y accesibles para mantener tu mente activa y saludable.
          </p>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Link
              to="/juegos"
              className="inline-flex items-center justify-center gap-2 text-white text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl transition-all hover:scale-105 shadow-lg cursor-pointer"
              style={{ fontWeight: 700, backgroundColor: "#12B8B2" }}
            >
              Comenzar ahora
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            
            <Link
              to="/ayuda"
              className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-gray-300 text-gray-700 text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl transition-all hover:scale-105"
              style={{ fontWeight: 600 }}
            >
              Más información
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-10 pt-6 border-t border-gray-100">
            <div>
              <p className="text-3xl mb-1" style={{ fontWeight: 700, color: "#12B8B2" }}>6</p>
              <p className="text-sm text-gray-500">Tipos de ejercicios</p>
            </div>
            <div>
              <p className="text-3xl mb-1" style={{ fontWeight: 700, color: "#12B8B2" }}>100%</p>
              <p className="text-sm text-gray-500">Gratuita</p>
            </div>
            <div>
              <p className="text-3xl mb-1" style={{ fontWeight: 700, color: "#12B8B2" }}>∞</p>
              <p className="text-sm text-gray-500">Sin límites</p>
            </div>
          </div>
        </div>

        {/* Right - Visual Preview */}
        <div className="flex-1 w-full flex justify-center">
          <div className="relative w-full max-w-[420px]">
            {/* Main card */}
            <div 
              className="w-full aspect-[21/25] min-h-[380px] rounded-3xl p-5 sm:p-7 lg:p-8 flex flex-col shadow-2xl"
              style={{ 
                background: "#12B8B2",
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Brain size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-xl sm:text-2xl" style={{ fontWeight: 700 }}>Ejercicios disponibles</p>
                  <p className="text-white text-sm opacity-90">Empieza cuando quieras</p>
                </div>
              </div>

              {/* Game cards grid */}
              <div className="grid grid-cols-2 gap-3 flex-1">
                {[
                  { icon: "🧠", label: "Memoria Visual" },
                  { icon: "🔗", label: "Asociación" },
                  { icon: "👁️", label: "Atención" },
                  { icon: "🃏", label: "Emparejar" },
                  { icon: "🎯", label: "Reconocimiento" },
                  { icon: "🔢", label: "Secuencia" },
                ].map((game, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border-2 bg-white p-3 flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105"
                    style={{ borderColor: "#12B8B2" }}
                  >
                    <span className="text-3xl">{game.icon}</span>
                    <p className="text-xs text-gray-700 text-center" style={{ fontWeight: 600 }}>
                      {game.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Start button */}
              <Link
                to="/juegos"
                className="mt-4 w-full bg-white text-gray-900 py-4 rounded-xl text-center transition-transform hover:scale-105 block"
                style={{ fontWeight: 700 }}
              >
                Jugar ahora
              </Link>
            </div>

            {/* Decorative elements */}
            <div 
              className="absolute -top-4 -right-4 w-20 h-20 rounded-full"
              style={{ background: "#12B8B2", opacity: 0.3 }}
            />
            <div 
              className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full"
              style={{ background: "#12B8B2", opacity: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-10 sm:py-14 lg:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl text-gray-900 mb-3" style={{ fontWeight: 700 }}>
              ¿Qué ejercicios puedo hacer?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Actividades diseñadas para fortalecer memoria, atención y capacidad cognitiva.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
            {[
              {
                icon: <Brain size={32} />,
                title: "Memoria Visual",
                description: "Recuerda patrones y ubicaciones de elementos para entrenar tu memoria a corto plazo."
              },
              {
                icon: <Waypoints size={32} />,
                title: "Asociación de Conceptos",
                description: "Conecta palabras relacionadas para fortalecer vínculos entre ideas y conceptos."
              },
              {
                icon: <Eye size={32} />,
                title: "Atención Selectiva",
                description: "Identifica elementos diferentes en un grupo para mejorar concentración y observación."
              },
              {
                icon: <Handshake size={32} />,
                title: "Emparejamiento",
                description: "Encuentra parejas de objetos relacionados ejercitando memoria y lógica."
              },
              {
                icon: <Search size={32} />,
                title: "Reconocimiento",
                description: "Identifica objetos y lugares para estimular la memoria visual."
              },
              {
                icon: <List size={32} />,
                title: "Secuencia",
                description: "Completa la serie siguiendo el orden correcto."
              }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="rounded-3xl border-2 bg-white p-6 lg:p-8 transition-all hover:shadow-xl hover:-translate-y-1"
                style={{ borderColor: "#E5ECEC" }}
              >
                <div 
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-6"
                  style={{ backgroundColor: "#EFFCFB" }}
                >
                  <div style={{ color: "#12B8B2" }}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl text-gray-900 mb-2 sm:mb-3" style={{ fontWeight: 700 }}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
