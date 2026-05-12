/**
 * Vista de Ayuda para CUIDADOR
 * Incluye FAQs específicas y formulario de contacto
 */
import { useState } from "react";
import { ChevronDown, ChevronUp, Mail, MessageSquare, Send } from "lucide-react";
import { caregiverApi } from "../../lib/api";
import { useAuth } from "../context/AuthContext";

const faqs = [
  {
    id: 1,
    q: "¿Cómo consulto la evolución de mis usuarios?",
    a: "Desde la sección Evolución puedes revisar el rendimiento general, la comparativa entre usuarios y el detalle individual cuando seleccionas una única persona.",
  },
  {
    id: 2,
    q: "¿Qué significa el cambio vs última sesión?",
    a: "Indica la diferencia entre la puntuación media del último día en que el usuario jugó y la del día anterior en que también tuvo actividad.",
  },
  {
    id: 3,
    q: "¿Cómo marco juegos favoritos?",
    a: "En la pantalla de Juegos puedes pulsar la estrella de cada actividad. Después aparecerán en la sección de favoritos dentro de Evolución del usuario.",
  },
  {
    id: 4,
    q: "¿Dónde cambio el avatar del perfil?",
    a: "Puedes cambiarlo desde tu perfil y también desde el perfil del usuario. El avatar seleccionado se guarda y se mantiene al volver a entrar.",
  },
  {
    id: 5,
    q: "¿Qué hago si un dato no parece correcto?",
    a: "Envíanos un mensaje desde este formulario indicando el usuario, el juego y una breve descripción del problema para poder revisarlo.",
  },
  {
    id: 6,
    q: "¿Cuándo debería revisar el progreso?",
    a: "Como referencia general, una revisión semanal suele ser suficiente para detectar cambios de uso, evolución y posibles necesidades de acompañamiento.",
  },
];

export default function HelpCuidador() {
  const { accessToken, user } = useAuth();
  const [open, setOpen] = useState<number | null>(1);
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const asuntoLimpio = asunto.trim();
    const mensajeLimpio = mensaje.trim();

    if (!asuntoLimpio || !mensajeLimpio) {
      setError("Debes completar el asunto y el mensaje.");
      setSuccess("");
      return;
    }

    if (asuntoLimpio.length < 4) {
      setError("El asunto debe tener al menos 4 caracteres.");
      setSuccess("");
      return;
    }

    if (mensajeLimpio.length < 10) {
      setError("El mensaje debe tener al menos 10 caracteres.");
      setSuccess("");
      return;
    }

    if (!accessToken) {
      setError("No se ha podido verificar la sesión. Vuelve a iniciar sesión e inténtalo de nuevo.");
      setSuccess("");
      return;
    }

    try {
      setSending(true);
      setError("");
      setSuccess("");

      await caregiverApi.sendHelpMessage(
        {
          asunto: asuntoLimpio,
          mensaje: mensajeLimpio,
        },
        accessToken,
      );

      setSuccess("Tu mensaje se ha enviado correctamente. Te responderemos lo antes posible.");
      setAsunto("");
      setMensaje("");
    } catch (err: any) {
      console.error("Error enviando mensaje de ayuda:", err);
      setError(err?.message || "No se pudo enviar el mensaje. Inténtalo de nuevo.");
      setSuccess("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl mb-1" style={{ fontWeight: 700, color: "#111827" }}>
          Ayuda
        </h1>
        <p className="text-sm" style={{ color: "#6B7280" }}>
          Resuelve dudas frecuentes y contacta con soporte cuando necesites ayuda.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-5 sm:gap-6">
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E5ECEC" }}>
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b flex items-center gap-3" style={{ borderColor: "#E5ECEC" }}>
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "#EFFCFB" }}
            >
              <MessageSquare size={18} style={{ color: "#12B8B2" }} />
            </div>
            <div>
              <h2 className="text-lg" style={{ fontWeight: 700, color: "#111827" }}>
                Preguntas frecuentes
              </h2>
              <p className="text-sm text-gray-500">
                Respuestas rápidas sobre el uso habitual de la app.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-3">
            {faqs.map((faq) => {
              const isOpen = open === faq.id;

              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border overflow-hidden transition-colors"
                  style={{
                    borderColor: isOpen ? "#12B8B2" : "#E5ECEC",
                    backgroundColor: isOpen ? "#F3FBFB" : "#FFFFFF",
                  }}
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 sm:px-5 py-4 text-left transition-colors hover:bg-[#F3FBFB] cursor-pointer"
                    onClick={() => setOpen(isOpen ? null : faq.id)}
                  >
                    <span className="text-sm pr-4" style={{ fontWeight: 600, color: "#243B53" }}>
                      {faq.q}
                    </span>
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: isOpen ? "#EFFCFB" : "#F7FAFA" }}
                    >
                      {isOpen ? (
                        <ChevronUp size={15} style={{ color: "#12B8B2" }} />
                      ) : (
                        <ChevronDown size={15} className="text-gray-400" />
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-0">
                      <p className="text-sm leading-relaxed" style={{ color: "#4B5563" }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden h-fit" style={{ borderColor: "#E5ECEC" }}>
          <div className="px-5 sm:px-6 py-4 sm:py-5 border-b flex items-center gap-3" style={{ borderColor: "#E5ECEC" }}>
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "#EFFCFB" }}
            >
              <Mail size={18} style={{ color: "#12B8B2" }} />
            </div>
            <div>
              <h2 className="text-lg" style={{ fontWeight: 700, color: "#111827" }}>
                Contacta con nosotros
              </h2>
              <p className="text-sm text-gray-500">
                Envíanos tu consulta y te responderemos lo antes posible.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div
              className="rounded-2xl border px-4 py-4 mb-5"
              style={{ backgroundColor: "#F7FAFA", borderColor: "#E5ECEC" }}
            >
              <p className="text-sm text-gray-600 leading-relaxed">
                Usa este formulario para incidencias, dudas funcionales o cualquier problema con la aplicación.
              </p>
              <p className="text-xs mt-2" style={{ color: "#6B7280" }}>
                Se enviará desde la cuenta del cuidador conectado{user?.email ? ` (${user.email})` : ""}.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1.5" style={{ fontWeight: 700 }}>
                  Asunto
                </label>
                <input
                  type="text"
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  placeholder="Describe brevemente tu consulta"
                  maxLength={120}
                  disabled={sending}
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-400"
                  style={{ borderColor: "#E5ECEC", color: "#243B53", boxShadow: "none" }}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1.5" style={{ fontWeight: 700 }}>
                  Mensaje
                </label>
                <textarea
                  rows={7}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Explica tu duda o problema con detalle..."
                  maxLength={2000}
                  disabled={sending}
                  className="w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors bg-white resize-none disabled:bg-gray-50 disabled:text-gray-400"
                  style={{ borderColor: "#E5ECEC", color: "#243B53" }}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-600" style={{ fontWeight: 600 }}>{error}</p>
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3">
                  <p className="text-sm text-green-700" style={{ fontWeight: 600 }}>{success}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 text-sm px-4 py-3 rounded-xl transition-all hover:opacity-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  fontWeight: 700,
                  color: "white",
                  background: "#12B8B2",
                  boxShadow: "0 10px 25px rgba(18, 184, 178, 0.22)",
                }}
              >
                <Send size={16} />
                {sending ? "Enviando..." : "Enviar mensaje"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
