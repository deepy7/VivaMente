import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { Logo } from "../components/Logo";
import { authApi } from "../../lib/api";
import { toast } from "sonner";

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
      toast.success("Instrucciones enviadas. Revisa tu correo.");
    } catch (error: any) {
      console.error("Error en recuperación de contraseña:", error);
      toast.error(error.message || "Error al enviar el correo de recuperación.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 sm:px-6 py-4 sm:py-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-5">
          <div className="flex justify-center mb-1.5 sm:mb-2">
            <Logo size={88} />
          </div>
          <h1 className="text-3xl sm:text-4xl mb-2" style={{ fontWeight: 700, color: "#1f2937" }}>
            Recuperar contraseña
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Introduce tu correo electrónico y te enviaremos instrucciones
          </p>
        </div>

        {/* Card */}
        <div
          className="bg-white rounded-3xl border-2 p-5 sm:p-6 shadow-xl"
          style={{ borderColor: "#E5ECEC" }}
        >
          {!sent ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Email */}
              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="block text-sm mb-2 text-gray-700"
                  style={{ fontWeight: 600 }}
                >
                  Correo electrónico *
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="usuario@mail.com"
                  {...register("email", {
                    required: "El email es obligatorio",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Formato de email inválido",
                    },
                  })}
                  className="w-full border-2 rounded-xl px-4 py-2.5 text-base text-gray-700 outline-none transition-colors bg-white"
                  style={{
                    borderColor: errors.email ? "#EF4444" : "#E5ECEC",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = errors.email ? "#EF4444" : "#12B8B2")}
                  onBlur={(e) => (e.target.style.borderColor = errors.email ? "#EF4444" : "#E5ECEC")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-2">{errors.email.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full text-white rounded-xl py-3 text-base transition-all hover:scale-[1.02] shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-5"
                style={{
                  background: "#12B8B2",
                  fontWeight: 700,
                }}
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar instrucciones"}
              </button>

              {/* Volver al inicio - integrado en el recuadro */}
              <div className="text-center border-t-2 border-gray-100 pt-4">
                <Link
                  to="/login"
                  className="text-sm hover:underline"
                  style={{ color: "#12B8B2", fontWeight: 600 }}
                >
                  ← Volver al inicio
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="text-5xl mb-3">✉️</div>
              <p className="text-xl mb-3" style={{ fontWeight: 700, color: "#1f2937" }}>
                ¡Email enviado!
              </p>
              <p className="text-base text-gray-600 mb-5">
                Revisa tu bandeja de entrada para continuar con la recuperación de tu contraseña.
              </p>
              <Link
                to="/login"
                className="inline-block text-white rounded-xl py-3 px-6 text-base transition-all hover:scale-[1.02] shadow-lg cursor-pointer"
                style={{
                  background: "#12B8B2",
                  fontWeight: 700,
                }}
              >
                Volver al inicio
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
