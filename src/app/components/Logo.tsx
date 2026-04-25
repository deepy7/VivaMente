import logoVivaMente from "../../logo_vivamente_sin_fondo.png";

export function Logo({ size = 120 }: { size?: number }) {
  return (
    <img
      src={logoVivaMente}
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