import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const helpFaqs = [
  {
    id: 1,
    icon: "🎮",
    title: "¿Cómo juego?",
    description: "Toca el botón de Juegos y elige el que más te guste. Después, sigue las instrucciones que aparecen en la pantalla. Son muy sencillas.",
  },
  {
    id: 2,
    icon: "⭐",
    title: "¿Dónde veo mi progreso?",
    description: "Toca Evolución para ver tus estrellas y puntos. Allí podrás ver cuántos días seguidos has jugado y qué juegos te gustan más.",
  },
  {
    id: 3,
    icon: "👤",
    title: "¿Dónde está mi información?",
    description: "Toca Perfil para ver tu nombre y foto. También puedes cambiar tu foto si quieres una diferente.",
  },
  {
    id: 4,
    icon: "🔄",
    title: "¿Puedo repetir un juego?",
    description: "¡Claro que sí! Puedes jugar las veces que quieras. Después de terminar un juego, toca 'Jugar de nuevo' para repetirlo.",
  },
  {
    id: 5,
    icon: "❤️",
    title: "¿Puedo marcar juegos favoritos?",
    description: "Sí. En la pantalla de Juegos, toca la estrella en cada juego que te guste. Así podrás encontrarlos fácilmente.",
  },
  {
    id: 6,
    icon: "🏆",
    title: "¿Cómo funcionan las estrellas?",
    description: "Cada vez que completas un juego, ganas estrellas según tus aciertos. ¡Cuantas más estrellas, mejor lo estás haciendo!",
  },
];

export default function HelpUsuario() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl text-gray-900 mb-3" style={{ fontWeight: 700 }}>
        Ayuda
      </h1>
      <p className="text-lg text-gray-600 mb-12">¿Necesitas ayuda? Aquí encontrarás respuestas</p>

      {/* FAQs expandibles - TODOS con el mismo color púrpura */}
      <div className="space-y-5 mb-12">
        {helpFaqs.map((faq) => {
          const isOpen = openFaq === faq.id;
          
          return (
            <div
              key={faq.id}
              className="rounded-3xl border-2 bg-white overflow-hidden shadow-lg transition-all hover:shadow-xl"
              style={{ borderColor: "#E5ECEC" }}
            >
              {/* Botón expandible */}
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full flex items-center justify-between p-8 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-5">
                  <div className="text-6xl">{faq.icon}</div>
                  <h3 className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>
                    {faq.title}
                  </h3>
                </div>
                <div className="shrink-0 ml-4">
                  {isOpen ? (
                    <ChevronUp size={32} style={{ color: "#12B8B2" }} />
                  ) : (
                    <ChevronDown size={32} style={{ color: "#12B8B2" }} />
                  )}
                </div>
              </button>

              {/* Respuesta - se expande al hacer clic */}
              {isOpen && (
                <div 
                  className="px-8 pb-8 pt-0"
                  style={{ backgroundColor: "#F7F8FA" }}
                >
                  <p className="text-xl text-gray-700 leading-relaxed">
                    {faq.description}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mensaje de ánimo */}
      <div
        className="rounded-3xl border-2 bg-white p-12 text-center shadow-xl"
        style={{ borderColor: "#E5ECEC" }}
      >
        <div className="text-7xl mb-6">💙</div>
        <h2 className="text-3xl mb-4 text-gray-900" style={{ fontWeight: 700 }}>
          ¡Sigue así!
        </h2>
        <p className="text-xl text-gray-600 leading-relaxed">
          Cada día que juegas estás ejercitando tu mente.<br />
          ¡Lo estás haciendo muy bien!
        </p>
      </div>
    </div>
  );
}