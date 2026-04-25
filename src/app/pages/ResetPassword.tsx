import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Logo } from "../components/Logo";
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

  const passwordValue = watch("password");

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
      <div className="flex items-center justify-center px-6 py-12" style={{ minHeight: "100vh" }}>
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-4">
            <Logo size={140} />
          </div>
          <p className="text-xl text-gray-600">Comprobando enlace de recuperación...</p>
        </div>
      </div>
    );
  }

  if (!isRecoverySession) {
    return (
      <div className="flex items-center justify-center px-6 py-12" style={{ minHeight: "100vh" }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <Logo size={140} />
            </div>
            <h1 className="text-4xl mb-3" style={{ fontWeight: 700, color: "#1f2937" }}>
              Enlace no válido
            </h1>
            <p className="text-lg text-gray-600">
              El enlace de recuperación no es válido o ha caducado.
            </p>
          </div>

          <div
            className="bg-white rounded-3xl border-2 p-10 shadow-xl text-center"
            style={{ borderColor: "#E5ECEC" }}
          >
            <p className="text-base text-gray-600 mb-8">
              Solicita un nuevo correo de recuperación para volver a intentarlo.
            </p>

            <Link
              to="/forgot-password"
              className="inline-block text-white rounded-xl py-3 px-8 text-base transition-all hover:scale-[1.02] shadow-lg cursor-pointer"
              style={{
                background: "#12B8B2",
                fontWeight: 700,
              }}
            >
              Solicitar nuevo enlace
            </Link>

            <div className="text-center border-t-2 border-gray-100 pt-6 mt-8">
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
    <div className="flex items-center justify-center px-6 py-12" style={{ minHeight: "100vh" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Logo size={140} />
          </div>
          <h1 className="text-4xl mb-3" style={{ fontWeight: 700, color: "#1f2937" }}>
            Restablecer contraseña
          </h1>
          <p className="text-lg text-gray-600">
            Introduce tu nueva contraseña para continuar
          </p>
        </div>

        <div
          className="bg-white rounded-3xl border-2 p-10 shadow-xl"
          style={{ borderColor: "#E5ECEC" }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm mb-2 text-gray-700"
                style={{ fontWeight: 600 }}
              >
                Nueva contraseña *
              </label>
              <input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                {...register("password", {
                  required: "La contraseña es obligatoria",
                  minLength: {
                    value: 6,
                    message: "La contraseña debe tener al menos 6 caracteres",
                  },
                })}
                className="w-full border-2 rounded-xl px-4 py-3.5 text-base text-gray-700 outline-none transition-colors bg-white"
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

            <div className="mb-8">
              <label
                htmlFor="confirmPassword"
                className="block text-sm mb-2 text-gray-700"
                style={{ fontWeight: 600 }}
              >
                Confirmar contraseña *
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Repite la contraseña"
                {...register("confirmPassword", {
                  required: "Debes confirmar la contraseña",
                  validate: (value) =>
                    value === passwordValue || "Las contraseñas no coinciden",
                })}
                className="w-full border-2 rounded-xl px-4 py-3.5 text-base text-gray-700 outline-none transition-colors bg-white"
                style={{
                  borderColor: errors.confirmPassword ? "#EF4444" : "#E5ECEC",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = errors.confirmPassword ? "#EF4444" : "#12B8B2")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = errors.confirmPassword ? "#EF4444" : "#E5ECEC")
                }
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-2">{errors.confirmPassword.message}</p>
              )}
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
              {isLoading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
