import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Logo } from "../components/Logo";
import { PasswordInput } from "../components/PasswordInput";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate("/inicio");
    } catch (error: any) {
      console.error("Error en login:", error);
      toast.error(error.message || "Credenciales incorrectas. Por favor, verifica tus datos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 sm:px-6 py-4 sm:py-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-4 sm:mb-5">
          <div className="flex justify-center mb-1.5 sm:mb-2">
            <Logo size={88} />
          </div>
          <h1 className="text-3xl sm:text-4xl mb-2" style={{ fontWeight: 700, color: "#1f2937" }}>
            Bienvenido
          </h1>
          <p className="text-base sm:text-lg text-gray-600">Inicia sesión para continuar</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="bg-white rounded-3xl border-2 p-5 sm:p-6 shadow-xl"
          style={{ borderColor: "#E5ECEC" }}
        >
          <div className="mb-4">
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
                  value: /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/,
                  message: "Introduce un correo electrónico válido",
                },
              })}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-base text-gray-700 outline-none transition-colors bg-white"
              style={{
                borderColor: errors.email ? "#EF4444" : "#E5ECEC",
              }}
              onFocus={(e) => (e.target.style.borderColor = errors.email ? "#EF4444" : "#12B8B2")}
              onBlur={(e) => (e.target.style.borderColor = errors.email ? "#EF4444" : "#E5ECEC")}
            />
            {errors.email && <p className="text-sm text-red-500 mt-2">{errors.email.message}</p>}
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm mb-2 text-gray-700"
              style={{ fontWeight: 600 }}
            >
              Contraseña *
            </label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              hasError={Boolean(errors.password)}
              {...register("password", {
                required: "La contraseña es obligatoria",
              })}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-2">{errors.password.message}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                style={{
                  accentColor: "#12B8B2",
                }}
              />
              <span className="text-sm text-gray-600">Recordarme</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm hover:underline"
              style={{ color: "#12B8B2", fontWeight: 600 }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white rounded-xl py-3 text-base transition-all hover:scale-[1.02] shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "#12B8B2",
              fontWeight: 700,
            }}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>

          <div className="my-5 border-t-2 border-gray-100"></div>

          <p className="text-center text-sm text-gray-600">
            ¿No tienes cuenta?{" "}
            <Link
              to="/register"
              className="hover:underline cursor-pointer"
              style={{ color: "#12B8B2", fontWeight: 600 }}
            >
              Crear cuenta
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
