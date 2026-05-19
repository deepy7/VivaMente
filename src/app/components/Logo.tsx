import logoVivaMente from "../../assets/branding/logo_vivamente_sin_fondo_v2.png";
import logoVivaMenteBlanco from "../../assets/branding/logo_blanco.png";
import logoVivaMenteHorizontal from "../../assets/branding/logo_vivamente_horizontal.png";

type LogoVariant = "default" | "white" | "horizontal";

export function Logo({
  size = 120,
  variant = "default",
}: {
  size?: number;
  variant?: LogoVariant;
}) {
  const logoSrc =
    variant === "white"
      ? logoVivaMenteBlanco
      : variant === "horizontal"
        ? logoVivaMenteHorizontal
        : logoVivaMente;

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
