import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { User, LogOut, Settings, Save, X } from "lucide-react";
import {
  caregiverApi,
  CaregiverProfileResponse,
  UpdateCaregiverProfileData,
} from "../../lib/api";
import { AvatarBadge, AvatarIcon, AVATAR_OPTIONS } from "../components/AvatarIcon";
import { useAuth } from "../context/AuthContext";

export default function ProfileCuidador() {
  const { accessToken, logout, updateUserAvatar } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<CaregiverProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [formData, setFormData] = useState<UpdateCaregiverProfileData>({
    nombre: "",
    apellidos: "",
    email: "",
    avatar: "avatar-1",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        setError("");
        const response = await caregiverApi.getProfile(accessToken);
        setProfile(response);
        setFormData({
          nombre: response.caregiver.nombre || "",
          apellidos: response.caregiver.apellidos || "",
          email: response.caregiver.email || "",
          avatar: response.caregiver.avatar || "avatar-1",
        });
      } catch (err: any) {
        console.error("Error cargando perfil del cuidador:", err);
        setError(err.message || "No se pudo cargar el perfil del cuidador");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [accessToken]);

  const caregiver = profile?.caregiver;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setSuccessMessage("");
    setError("");
    setEditingProfile(true);
  };

  const handleCancel = () => {
    if (caregiver) {
      setFormData({
        nombre: caregiver.nombre || "",
        apellidos: caregiver.apellidos || "",
        email: caregiver.email || "",
        avatar: caregiver.avatar || "avatar-1",
      });
    }
    setError("");
    setSuccessMessage("");
    setEditingProfile(false);
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      setError("");
      setSuccessMessage("");

      const response = await caregiverApi.updateProfile(
        {
          ...formData,
          especialidad: caregiver?.especialidad,
          experiencia: caregiver?.experiencia,
        },
        accessToken,
      );

      if (response.success && caregiver) {
        setProfile({
          ...profile!,
          caregiver: {
            ...caregiver,
            ...response.caregiver,
          },
        });
        updateUserAvatar(response.caregiver.avatar || formData.avatar || "avatar-1");
        setSuccessMessage("Perfil actualizado correctamente");
        setEditingProfile(false);
      }
    } catch (err: any) {
      console.error("Error actualizando perfil del cuidador:", err);
      setError(err.message || "No se pudo actualizar el perfil");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "#E5ECEC" }}>
          <p style={{ color: "#4B5563" }}>Cargando perfil del cuidador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl mb-2" style={{ fontWeight: 700, color: "#111827" }}>
          Mi perfil
        </h1>
        <p style={{ color: "#4B5563" }}>
          Aquí puedes revisar y actualizar únicamente la información de tu perfil como cuidador.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border bg-red-50 p-4" style={{ borderColor: "#FECACA" }}>
          <p className="text-sm text-red-700" style={{ fontWeight: 600 }}>
            {error}
          </p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-2xl border bg-green-50 p-4" style={{ borderColor: "#BBF7D0" }}>
          <p className="text-sm text-green-700" style={{ fontWeight: 600 }}>
            {successMessage}
          </p>
        </div>
      )}

      <div className="rounded-2xl border bg-white p-5 sm:p-8 shadow-sm" style={{ borderColor: "#E5ECEC" }}>
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8 pb-6 sm:pb-8 border-b" style={{ borderColor: "#E5ECEC" }}>
          <div className="mb-4">
            <AvatarBadge
              avatarId={caregiver?.avatar}
              nombre={caregiver?.nombre}
              apellidos={caregiver?.apellidos}
              email={caregiver?.email}
              sizeClass="w-24 h-24"
              iconSize={46}
              textSizeClass="text-3xl"
              preferInitials
            />
          </div>
          <p className="text-2xl" style={{ fontWeight: 700, color: "#111827" }}>
            {caregiver ? `${caregiver.nombre} ${caregiver.apellidos}`.trim() : "Cuidador"}
          </p>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>Perfil de cuidador</p>
        </div>

        {!editingProfile ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mb-6 sm:mb-8">
              <div>
                <label className="block text-xs uppercase mb-2" style={{ color: "#6B7280" }}>Nombre</label>
                <p className="text-base" style={{ fontWeight: 600, color: "#243B53" }}>
                  {caregiver?.nombre || "No disponible"}
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase mb-2" style={{ color: "#6B7280" }}>Apellidos</label>
                <p className="text-base" style={{ fontWeight: 600, color: "#243B53" }}>
                  {caregiver?.apellidos || "No disponible"}
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase mb-2" style={{ color: "#6B7280" }}>Correo electrónico</label>
                <p className="text-base" style={{ fontWeight: 600, color: "#243B53" }}>
                  {caregiver?.email || "No disponible"}
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase mb-2" style={{ color: "#6B7280" }}>Avatar</label>
                <AvatarBadge
                  avatarId={caregiver?.avatar}
                  nombre={caregiver?.nombre}
                  apellidos={caregiver?.apellidos}
                  email={caregiver?.email}
                  sizeClass="w-12 h-12"
                  iconSize={24}
                  preferInitials
                />
              </div>

              <div>
                <label className="block text-xs uppercase mb-2" style={{ color: "#6B7280" }}>Usuarios asignados</label>
                <p className="text-base" style={{ fontWeight: 600, color: "#243B53" }}>
                  {caregiver?.usuarios_asociados ?? 0}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-col gap-4">
              <button
                type="button"
                onClick={handleEdit}
                className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-white transition-all hover:opacity-90 cursor-pointer"
                style={{
                  background: "#12B8B2",
                  fontWeight: 700,
                }}
              >
                <Settings size={16} />
                Editar perfil
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 rounded-xl border px-6 py-3 transition-all cursor-pointer hover:bg-[#F1FAFA] hover:border-[#12B8B2]"
                style={{ fontWeight: 700, borderColor: "#E5ECEC", color: "#111827" }}
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 600, color: "#243B53" }}>
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleProfileChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#12B8B2]"
                />
              </div>

              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 600, color: "#243B53" }}>
                  Apellidos *
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleProfileChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#12B8B2]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm mb-2" style={{ fontWeight: 600, color: "#243B53" }}>
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleProfileChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#12B8B2]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-3" style={{ fontWeight: 600 }}>
                  Elige tu avatar
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {AVATAR_OPTIONS.map((option) => {
                    const selected = formData.avatar === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, avatar: option.id }))}
                        className="rounded-2xl border px-3 py-4 transition-all hover:bg-[#F7FAFA] cursor-pointer"
                        style={{
                          borderColor: selected ? "#12B8B2" : "#E5E7EB",
                          backgroundColor: selected ? "#F3FBFB" : "#FFFFFF",
                        }}
                      >
                        <div
                          className="w-12 h-12 rounded-full border mx-auto mb-2 flex items-center justify-center"
                          style={{ backgroundColor: "#EFFCFB", borderColor: "#CDECEA" }}
                        >
                          <AvatarIcon avatarId={option.id} size={24} />
                        </div>
                        <div className="text-xs" style={{ fontWeight: 600, color: "#4B5563" }}>{option.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="flex flex-col sm:flex-col gap-4">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-white transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
                style={{
                  background: "#12B8B2",
                  fontWeight: 700,
                }}
              >
                <Save size={16} />
                {savingProfile ? "Guardando..." : "Guardar cambios"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center justify-center gap-2 rounded-xl border px-6 py-3 transition-all cursor-pointer hover:bg-[#F7FAFA] hover:border-[#12B8B2] hover:text-[#12B8B2]"
                style={{ fontWeight: 700, borderColor: "#E5ECEC", color: "#243B53" }}
              >
                <X size={16} />
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}