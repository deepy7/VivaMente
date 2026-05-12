import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { AvatarIcon, AVATAR_OPTIONS } from "../components/AvatarIcon";
import { useAuth } from "../context/AuthContext";
import { gameApi, userApi } from "../../lib/api";

export default function ProfileUsuario() {
  const navigate = useNavigate();
  const { user, accessToken, logout, updateUserAvatar } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        setError("");
        const [statsResponse, profileResponse] = await Promise.all([
          gameApi.getUserStats(accessToken),
          userApi.getProfile(accessToken),
        ]);

        if (statsResponse.success) {
          setStats(statsResponse.stats);
        }

        if (profileResponse.success) {
          setProfile(profileResponse.user);
        }
      } catch (error: any) {
        console.error("Error al obtener perfil del usuario:", error);
        setError(error.message || "No se pudo cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleAvatarChange = async (avatarId: string) => {
    if (!accessToken || savingAvatar) return;

    try {
      setSavingAvatar(true);
      setSuccessMessage("");
      setError("");
      const response = await userApi.updateAvatar(avatarId, accessToken);
      if (response.success) {
        setProfile(response.user);
        updateUserAvatar(response.user.avatar || avatarId);
        setSuccessMessage("Avatar actualizado correctamente");
      }
    } catch (error: any) {
      console.error("Error al actualizar avatar:", error);
      setError(error.message || "No se pudo actualizar el avatar");
    } finally {
      setSavingAvatar(false);
    }
  };

  const fechaRegistro = profile?.fechaRegistro || user?.fecha_registro
    ? new Date(profile?.fechaRegistro || user?.fecha_registro).toLocaleDateString("es-ES", { month: "long", year: "numeric" })
    : "Enero 2024";

  const daysStreak = stats?.rachaActual || 0;
  const totalPoints = stats?.puntosTotal || 0;
  const totalJuegos = stats?.totalJuegos || 0;
  const avatarId = profile?.avatar || stats?.avatar || user?.avatar || "avatar-1";

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="rounded-3xl border-2 bg-white p-6 sm:p-8 text-center shadow-lg" style={{ borderColor: "#E5ECEC" }}>
          <p className="text-gray-500 text-xl">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
      {error && (
        <div className="mb-6 rounded-2xl border bg-red-50 p-4" style={{ borderColor: "#FECACA" }}>
          <p className="text-sm text-red-700" style={{ fontWeight: 600 }}>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-2xl border bg-green-50 p-4" style={{ borderColor: "#BBF7D0" }}>
          <p className="text-sm text-green-700" style={{ fontWeight: 600 }}>{successMessage}</p>
        </div>
      )}

      <div className="mb-6 sm:mb-8">
        <div
          className="rounded-3xl border-2 bg-white p-8 sm:p-10 lg:p-12 text-center shadow-lg"
          style={{ borderColor: "#E5ECEC" }}
        >
          <div className="mb-5 sm:mb-6">
            <div
              className="inline-flex w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full border items-center justify-center shadow-sm"
              style={{ backgroundColor: "#EFFCFB", borderColor: "#CDECEA" }}
            >
              <AvatarIcon avatarId={avatarId} size={72} strokeWidth={1.8} />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4" style={{ fontWeight: 700, color: "#111827" }}>
            {profile?.nombre && profile?.apellidos
              ? `${profile.nombre} ${profile.apellidos}`
              : user?.nombre && user?.apellidos
                ? `${user.nombre} ${user.apellidos}`
                : "Usuario"}
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600">
            Usuario desde {fechaRegistro}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border-2 bg-white p-6 sm:p-8 shadow-lg mb-6 sm:mb-8" style={{ borderColor: "#E5ECEC" }}>
        <h2 className="text-2xl mb-6" style={{ fontWeight: 700, color: "#111827" }}>Elige tu avatar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {AVATAR_OPTIONS.map((option) => {
            const selected = avatarId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                disabled={savingAvatar}
                onClick={() => handleAvatarChange(option.id)}
                className="rounded-2xl border p-4 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  borderColor: selected ? "#12B8B2" : "#E5E7EB",
                  backgroundColor: selected ? "#F3FBFB" : "#FFFFFF",
                }}
              >
                <div
                  className="w-14 h-14 rounded-full border mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: "#EFFCFB", borderColor: "#CDECEA" }}
                >
                  <AvatarIcon avatarId={option.id} size={28} />
                </div>
                <div className="text-sm" style={{ fontWeight: 600, color: "#4B5563" }}>{option.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="rounded-2xl border-2 bg-white p-6 sm:p-8 text-center shadow-lg" style={{ borderColor: "#E5ECEC" }}>
          <p className="text-base text-gray-600 mb-2" style={{ fontWeight: 600 }}>Días consecutivos</p>
          <p className="text-4xl sm:text-5xl" style={{ fontWeight: 700, color: "#111827" }}>{daysStreak}</p>
        </div>
        <div className="rounded-2xl border-2 bg-white p-6 sm:p-8 text-center shadow-lg" style={{ borderColor: "#E5ECEC" }}>
          <p className="text-base text-gray-600 mb-2" style={{ fontWeight: 600 }}>Puntos totales</p>
          <p className="text-4xl sm:text-5xl" style={{ fontWeight: 700, color: "#111827" }}>{totalPoints}</p>
        </div>
        <div className="rounded-2xl border-2 bg-white p-6 sm:p-8 text-center shadow-lg" style={{ borderColor: "#E5ECEC" }}>
          <p className="text-base text-gray-600 mb-2" style={{ fontWeight: 600 }}>Juegos jugados</p>
          <p className="text-4xl sm:text-5xl" style={{ fontWeight: 700, color: "#111827" }}>{totalJuegos}</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-3 border-2 rounded-2xl py-4 sm:py-5 text-lg sm:text-xl transition-all shadow-md cursor-pointer hover:bg-[#F1FAFA] hover:border-[#12B8B2] hover:text-[#12B8B2]"
        style={{ borderColor: "#E5ECEC", color: "#111827", fontWeight: 700 }}
      >
        <LogOut size={28} style={{ color: "#12B8B2" }} />
        Cerrar sesión
      </button>
    </div>
  );
}
