import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Logo } from "../components/Logo";
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
    <div className="flex items-center justify-center px-6 py-12" style={{ minHeight: "100vh" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Logo size={140} />
          </div>
          <h1 className="text-4xl mb-3" style={{ fontWeight: 700, color: "#1f2937" }}>
            Bienvenido
          </h1>
          <p className="text-lg text-gray-600">Inicia sesión para continuar</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-3xl border-2 p-10 shadow-xl"
          style={{ borderColor: "#E5ECEC" }}
        >
          <div className="mb-6">
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
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-700 outline-none transition-colors bg-white"
              style={{
                borderColor: errors.email ? "#EF4444" : "#E5ECEC",
              }}
              onFocus={(e) => (e.target.style.borderColor = errors.email ? "#EF4444" : "#12B8B2")}
              onBlur={(e) => (e.target.style.borderColor = errors.email ? "#EF4444" : "#E5ECEC")}
            />
            {errors.email && <p className="text-sm text-red-500 mt-2">{errors.email.message}</p>}
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm mb-2 text-gray-700"
              style={{ fontWeight: 600 }}
            >
              Contraseña *
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: "La contraseña es obligatoria",
              })}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-700 outline-none transition-colors bg-white"
              style={{
                borderColor: errors.password ? "#EF4444" : "#E5ECEC",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = errors.password ? "#EF4444" : "#12B8B2")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = errors.password ? "#EF4444" : "#E5ECEC")
              }
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-2">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between mb-8">
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
            className="w-full text-white rounded-xl py-4 text-base transition-all hover:scale-[1.02] shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "#12B8B2",
              fontWeight: 700,
            }}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>

          <div className="my-8 border-t-2 border-gray-100"></div>

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
