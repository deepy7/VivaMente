import logoVivaMente from "../../logo_vivamente_sin_fondo_v2.png";
import logoVivaMenteBlanco from "../../logo_blanco.png";

type LogoVariant = "default" | "white";

export function Logo({
  size = 120,
  variant = "default",
}: {
  size?: number;
  variant?: LogoVariant;
}) {
  const logoSrc = variant === "white" ? logoVivaMenteBlanco : logoVivaMente;

  return (
    <img
      src={logoSrc}
      alt="VivaMente"
      width={size}
      height={size}
      className="block object-contain"
      style={{
        width: "auto",
        height: `${size}px`,
      }}
    />
  );
}
