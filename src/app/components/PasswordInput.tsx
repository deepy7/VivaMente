import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { CheckCircle2, Circle, Eye, EyeOff } from "lucide-react";

export function getPasswordRequirements(password = "") {
  return [
    { label: "8 caracteres", valid: password.length >= 8 },
    { label: "Mayúscula", valid: /[A-ZÁÉÍÓÚÜÑ]/.test(password) },
    { label: "Minúscula", valid: /[a-záéíóúüñ]/.test(password) },
    { label: "Número", valid: /\d/.test(password) },
  ];
}

export function isPasswordValid(password = "") {
  return getPasswordRequirements(password).every((requirement) => requirement.valid);
}

export function getPasswordValidationMessage() {
  return "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.";
}

function getPasswordStrength(password = "") {
  const completed = getPasswordRequirements(password).filter((requirement) => requirement.valid).length;

  if (completed >= 4) {
    return { label: "Segura", completed };
  }

  if (completed === 3) {
    return { label: "Media", completed };
  }

  return { label: "Débil", completed };
}

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ hasError = false, className = "", onBlur, onFocus, style, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <input
          ref={ref}
          {...props}
          type={showPassword ? "text" : "password"}
          className={`w-full border-2 rounded-xl px-4 py-2.5 pr-12 text-base text-gray-700 outline-none transition-colors bg-white ${className}`}
          style={{
            ...style,
            borderColor: hasError ? "#EF4444" : "#E5ECEC",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = hasError ? "#EF4444" : "#12B8B2";
            onFocus?.(e);
          }}
          onBlur={(e) => {
            onBlur?.(e);
            e.currentTarget.style.borderColor = hasError ? "#EF4444" : "#E5ECEC";
          }}
        />
        <button
          type="button"
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          onClick={() => setShowPassword((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export function PasswordStrengthHint({ password = "" }: { password?: string }) {
  const requirements = getPasswordRequirements(password);
  const strength = getPasswordStrength(password);

  return (
    <div className="mt-2 w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
      <p className="text-xs text-gray-600 mb-2" style={{ fontWeight: 700 }}>
        Fortaleza: {strength.label}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
        {requirements.map((requirement) => (
          <div
            key={requirement.label}
            className="flex min-w-0 items-center gap-2 text-xs"
          >
            {requirement.valid ? (
              <CheckCircle2 size={15} className="shrink-0" style={{ color: "#16A34A" }} />
            ) : (
              <Circle size={15} className="shrink-0 text-gray-400" />
            )}
            <span className={requirement.valid ? "text-green-700" : "text-gray-500"}>
              {requirement.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}