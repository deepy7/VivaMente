import {
  Flower2,
  HeartPulse,
  Leaf,
  Smile,
  Sparkles,
  Star,
  Sun,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export const AVATAR_OPTIONS: Array<{
  id: string;
  label: string;
  Icon: LucideIcon;
}> = [
  { id: "avatar-1", label: "Persona", Icon: UserRound },
  { id: "avatar-2", label: "Sonrisa", Icon: Smile },
  { id: "avatar-3", label: "Calma", Icon: Leaf },
  { id: "avatar-4", label: "Luz", Icon: Sun },
  { id: "avatar-5", label: "Logro", Icon: Star },
  { id: "avatar-6", label: "Cuidado", Icon: Flower2 },
  { id: "avatar-7", label: "Energía", Icon: Sparkles },
  { id: "avatar-8", label: "Bienestar", Icon: HeartPulse },
];

export function getAvatarOption(avatarId?: string) {
  return AVATAR_OPTIONS.find((option) => option.id === avatarId) || AVATAR_OPTIONS[0];
}

export function AvatarIcon({
  avatarId,
  size = 24,
  color = "#12B8B2",
  strokeWidth = 2.2,
}: {
  avatarId?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const { Icon } = getAvatarOption(avatarId);

  return <Icon size={size} color={color} strokeWidth={strokeWidth} aria-hidden="true" />;
}

export function getInitials(nombre?: string, apellidos?: string, email?: string) {
  const parts = [nombre, apellidos]
    .map((part) => part?.trim())
    .filter(Boolean) as string[];

  if (parts.length > 0) {
    return parts
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }

  return email?.trim().charAt(0).toUpperCase() || "U";
}

export function AvatarBadge({
  avatarId,
  nombre,
  apellidos,
  email,
  sizeClass = "w-11 h-11",
  iconSize = 23,
  textSizeClass = "text-sm",
  preferInitials = false,
}: {
  avatarId?: string;
  nombre?: string;
  apellidos?: string;
  email?: string;
  sizeClass?: string;
  iconSize?: number;
  textSizeClass?: string;
  preferInitials?: boolean;
}) {
  const shouldUseInitials = preferInitials && (!avatarId || avatarId === "avatar-1");

  return (
    <div
      className={`${sizeClass} rounded-full border flex items-center justify-center shadow-sm`}
      style={{ backgroundColor: "#EFFCFB", borderColor: "#CDECEA" }}
    >
      {shouldUseInitials ? (
        <span className={textSizeClass} style={{ color: "#0F766E", fontWeight: 800 }}>
          {getInitials(nombre, apellidos, email)}
        </span>
      ) : (
        <AvatarIcon avatarId={avatarId} size={iconSize} />
      )}
    </div>
  );
}
