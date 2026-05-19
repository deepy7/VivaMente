import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Logo } from "../components/Logo";
import {
  getPasswordValidationMessage,
  isPasswordValid,
  PasswordInput,
  PasswordStrengthHint,
} from "../components/PasswordInput";
import { supabase } from "../../lib/supabase";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isRecoverySession, setIsRecoverySession] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const passwordValue = watch("password") || "";

  useEffect(() => {
    let mounted = true;

    const checkRecoverySession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error comprobando sesión de recuperación:", error);
        }

        if (!mounted) return;

        if (data.session) {
          setIsRecoverySession(true);
        } else {
          setIsRecoverySession(false);
        }
      } catch (error) {
        console.error("Error al comprobar sesión:", error);
        if (mounted) {
          setIsRecoverySession(false);
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" || session) {
        setIsRecoverySession(true);
        setCheckingSession(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw error;
      }

      toast.success("Contraseña actualizada correctamente");

      await supabase.auth.signOut();

      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      navigate("/login", { replace: true });
    } catch (error: any) {
      console.error("Error al actualizar contraseña:", error);
      toast.error(error.message || "No se pudo actualizar la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4 sm:px-6 py-4 sm:py-6">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-2">
            <Logo size={80} />
          </div>
          <p className="text-xl text-gray-600">Comprobando enlace de recuperación...</p>
        </div>
      </div>
    );
  }

  if (!isRecoverySession) {
    return (
      <div className="min-h-dvh flex items-center justify-center px-4 sm:px-6 py-4 sm:py-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-4 sm:mb-5">
            <div className="flex justify-center mb-2">
              <Logo size={80} />
            </div>
            <h1 className="text-3xl sm:text-4xl mb-2" style={{ fontWeight: 700, color: "#1f2937" }}>
              Enlace no válido
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              El enlace de recuperación no es válido o ha caducado.
            </p>
          </div>

          <div
            className="bg-white rounded-3xl border-2 p-5 sm:p-6 shadow-xl text-center"
            style={{ borderColor: "#E5ECEC" }}
          >
            <p className="text-base text-gray-600 mb-5">
              Solicita un nuevo correo de recuperación para volver a intentarlo.
            </p>

            <Link
              to="/forgot-password"
              className="inline-block text-white rounded-xl py-3 px-6 text-base transition-all hover:scale-[1.02] shadow-lg cursor-pointer"
              style={{
                background: "#12B8B2",
                fontWeight: 700,
              }}
            >
              Solicitar nuevo enlace
            </Link>

            <div className="text-center border-t-2 border-gray-100 pt-4 mt-5">
              <Link
                to="/login"
                className="text-sm hover:underline"
                style={{ color: "#12B8B2", fontWeight: 600 }}
              >
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 sm:px-6 py-4 sm:py-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-4 sm:mb-5">
          <div className="flex justify-center mb-2">
            <Logo size={80} />
          </div>
          <h1 className="text-3xl sm:text-4xl mb-2" style={{ fontWeight: 700, color: "#1f2937" }}>
            Restablecer contraseña
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Introduce tu nueva contraseña para continuar
          </p>
        </div>

        <div
          className="bg-white rounded-3xl border-2 p-5 sm:p-6 shadow-xl"
          style={{ borderColor: "#E5ECEC" }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm mb-2 text-gray-700"
                style={{ fontWeight: 600 }}
              >
                Nueva contraseña *
              </label>
              <PasswordInput
                id="password"
                placeholder="Mínimo 8 caracteres"
                hasError={Boolean(errors.password)}
                {...register("password", {
                  required: "La contraseña es obligatoria",
                  validate: (value) => isPasswordValid(value) || getPasswordValidationMessage(),
                })}
              />
              <PasswordStrengthHint password={passwordValue} />
              {errors.password && (
                <p className="text-sm text-red-500 mt-2">{errors.password.message}</p>
              )}
            </div>

            <div className="mb-5">
              <label
                htmlFor="confirmPassword"
                className="block text-sm mb-2 text-gray-700"
                style={{ fontWeight: 600 }}
              >
                Confirmar contraseña *
              </label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Repite la contraseña"
                hasError={Boolean(errors.confirmPassword)}
                {...register("confirmPassword", {
                  required: "Debes confirmar la contraseña",
                  validate: (value) =>
                    value === passwordValue || "Las contraseñas no coinciden",
                })}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-2">{errors.confirmPassword.message}</p>
              )}
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
              {isLoading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
