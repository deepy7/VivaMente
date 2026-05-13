import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Logo } from "../components/Logo";
import {
  getPasswordValidationMessage,
  isPasswordValid,
  PasswordInput,
  PasswordStrengthHint,
} from "../components/PasswordInput";
import { authApi } from "../../lib/api";
import { toast } from "sonner";

interface RegisterFormData {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch("password") || "";

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await authApi.register({
        email: data.email,
        password: data.password,
        nombre: data.nombre,
        apellidos: data.apellidos,
      });

      toast.success("¡Cuenta creada exitosamente! Ya puedes iniciar sesión.");
      navigate("/login");
    } catch (error: any) {
      console.error("Error en registro:", error);
      toast.error(error.message || "Error al crear la cuenta. Por favor intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-3 sm:mb-4">
          <div className="flex justify-center mb-1">
            <Logo size={80} />
          </div>
          <h1 className="text-3xl sm:text-4xl mb-1.5" style={{ fontWeight: 700, color: "#1f2937" }}>
            Crear cuenta
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Completa el formulario para registrarte
          </p>
          <p className="text-sm text-gray-500 mt-1.5">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="hover:underline"
              style={{ color: "#12B8B2", fontWeight: 600 }}
            >
              Inicia sesión
            </Link>
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="bg-white rounded-3xl border-2 p-4 sm:p-5 shadow-xl"
          style={{ borderColor: "#E5ECEC" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm mb-1.5 text-gray-700"
                style={{ fontWeight: 600 }}
              >
                Nombre *
              </label>
              <input
                id="nombre"
                type="text"
                placeholder="Juan"
                {...register("nombre", {
                  required: "El nombre es obligatorio",
                  minLength: {
                    value: 2,
                    message: "Mínimo 2 caracteres",
                  },
                })}
                className="w-full border-2 rounded-xl px-4 py-2.5 text-base text-gray-700 outline-none transition-colors bg-white"
                style={{
                  borderColor: errors.nombre ? "#EF4444" : "#E5ECEC",
                }}
                onFocus={(e) => (e.target.style.borderColor = errors.nombre ? "#EF4444" : "#12B8B2")}
                onBlur={(e) => (e.target.style.borderColor = errors.nombre ? "#EF4444" : "#E5ECEC")}
              />
              {errors.nombre && (
                <p className="text-sm text-red-500 mt-2">{errors.nombre.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="apellidos"
                className="block text-sm mb-1.5 text-gray-700"
                style={{ fontWeight: 600 }}
              >
                Apellidos *
              </label>
              <input
                id="apellidos"
                type="text"
                placeholder="Pérez"
                {...register("apellidos", {
                  required: "Los apellidos son obligatorios",
                  minLength: {
                    value: 2,
                    message: "Mínimo 2 caracteres",
                  },
                })}
                className="w-full border-2 rounded-xl px-4 py-2.5 text-base text-gray-700 outline-none transition-colors bg-white"
                style={{
                  borderColor: errors.apellidos ? "#EF4444" : "#E5ECEC",
                }}
                onFocus={(e) => (e.target.style.borderColor = errors.apellidos ? "#EF4444" : "#12B8B2")}
                onBlur={(e) => (e.target.style.borderColor = errors.apellidos ? "#EF4444" : "#E5ECEC")}
              />
              {errors.apellidos && (
                <p className="text-sm text-red-500 mt-2">{errors.apellidos.message}</p>
              )}
            </div>
          </div>

          <div className="mb-3.5">
            <label
              htmlFor="email"
              className="block text-sm mb-1.5 text-gray-700"
              style={{ fontWeight: 600 }}
            >
              Correo electrónico *
            </label>
            <input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              {...register("email", {
                required: "El email es obligatorio",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/,
                  message: "Introduce un correo electrónico válido",
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm mb-1.5 text-gray-700"
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
                  validate: (value) => isPasswordValid(value) || getPasswordValidationMessage(),
                })}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-2">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm mb-1.5 text-gray-700"
                style={{ fontWeight: 600 }}
              >
                Confirmar *
              </label>
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                hasError={Boolean(errors.confirmPassword)}
                {...register("confirmPassword", {
                  required: "Confirma tu contraseña",
                  validate: (value) =>
                    value === password || "Las contraseñas no coinciden",
                })}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-2">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <PasswordStrengthHint password={password} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white rounded-xl py-2.5 text-base transition-all hover:scale-[1.02] shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            style={{
              background: "#12B8B2",
              fontWeight: 700,
            }}
          >
            {isLoading ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <div className="text-center border-t-2 border-gray-100 pt-3.5">
            <Link
              to="/login"
              className="text-sm hover:underline"
              style={{ color: "#12B8B2", fontWeight: 600 }}
            >
              ← Volver al inicio
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
