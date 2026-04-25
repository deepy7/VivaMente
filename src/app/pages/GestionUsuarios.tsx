import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Edit2,
  X,
  Save,
  ArrowUpDown,
  TrendingUp,
  Star,
} from "lucide-react";
import { caregiverApi } from "../../lib/api";
import { useAuth } from "../context/AuthContext";

interface ManagedUserForm {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  observaciones: string;
}

type OrderOption = "nombre" | "actividad";

function mapUserToForm(usuario: any): ManagedUserForm {
  return {
    nombre: usuario.nombre || "",
    apellidos: usuario.apellidos || "",
    email: usuario.email || "",
    telefono: usuario.telefono || "",
    fecha_nacimiento: usuario.fecha_nacimiento || "",
    observaciones: usuario.observaciones || "",
  };
}

function getEstadoUsuario(usuario: any) {
  if (typeof usuario.activoHoy === "boolean") {
    return usuario.activoHoy ? "Activo" : "Inactivo";
  }

  if (usuario.estado) return usuario.estado;
  return "Inactivo";
}

function getActivityOrderValue(usuario: any) {
  const estado = getEstadoUsuario(usuario);
  const progreso = Number(usuario.progreso ?? 0);

  if (estado === "Activo") return 1000 + progreso;
  return progreso;
}

function getFavoriteGames(usuario: any) {
  return Array.isArray(usuario.favoriteGames) ? usuario.favoriteGames : [];
}

export default function GestionUsuarios() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState<OrderOption>("nombre");

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<ManagedUserForm>({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    fecha_nacimiento: "",
    observaciones: "",
  });

  useEffect(() => {
    if (!accessToken) return;
    fetchUsuarios();
  }, [accessToken]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await caregiverApi.getAssignedUsers(accessToken);
      if (response.success) {
        setUsuarios(response.usuarios || []);
      }
    } catch (err: any) {
      console.error("Error cargando usuarios:", err);
      setError(err.message || "No se pudieron cargar los usuarios asignados");
    } finally {
      setLoading(false);
    }
  };

  const usuariosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = usuarios.filter((usuario) => {
      if (!term) return true;

      const fullName = `${usuario.nombre || ""} ${usuario.apellidos || ""} ${usuario.nombreCompleto || ""}`.toLowerCase();
      return fullName.includes(term) || (usuario.email || "").toLowerCase().includes(term);
    });

    return [...filtered].sort((a, b) => {
      if (orderBy === "actividad") {
        return getActivityOrderValue(b) - getActivityOrderValue(a);
      }

      const nombreA = (a.nombreCompleto || `${a.nombre || ""} ${a.apellidos || ""}`.trim()).toLowerCase();
      const nombreB = (b.nombreCompleto || `${b.nombre || ""} ${b.apellidos || ""}`.trim()).toLowerCase();
      return nombreA.localeCompare(nombreB);
    });
  }, [usuarios, search, orderBy]);

  const selectedUser = useMemo(
    () => usuarios.find((usuario) => usuario.id === editingUserId) || null,
    [usuarios, editingUserId]
  );

  const handleEdit = (usuario: any) => {
    setError("");
    setSuccessMessage("");
    setEditingUserId(usuario.id);
    setFormData(mapUserToForm(usuario));
  };

  const handleCancel = () => {
    setEditingUserId(null);
    setFormData({
      nombre: "",
      apellidos: "",
      email: "",
      telefono: "",
      fecha_nacimiento: "",
      observaciones: "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!editingUserId) return;

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const response = await caregiverApi.updateAssignedUser(editingUserId, formData, accessToken);

      if (response.success) {
        setSuccessMessage("Usuario actualizado correctamente");
        await fetchUsuarios();
        setEditingUserId(null);
      }
    } catch (err: any) {
      console.error("Error actualizando usuario:", err);
      setError(err.message || "No se pudo actualizar el usuario");
    } finally {
      setSaving(false);
    }
  };

  const activosHoy = usuarios.filter((u) => u.activoHoy).length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-gray-600">Cargando usuarios asignados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl text-gray-900 mb-2" style={{ fontWeight: 700 }}>
          Gestión de usuarios
        </h1>
        <p className="text-gray-600">
          Busca, consulta y edita únicamente los usuarios que ya tienes asignados.
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Usuarios asignados</p>
          <p className="text-3xl text-gray-900" style={{ fontWeight: 700 }}>
            {usuarios.length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Activos hoy</p>
          <p className="text-3xl text-gray-900" style={{ fontWeight: 700 }}>
            {activosHoy}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Progreso medio</p>
          <p className="text-3xl text-gray-900" style={{ fontWeight: 700 }}>
            {usuarios.length > 0
              ? `${Math.round(usuarios.reduce((sum, u) => sum + (u.progreso || 0), 0) / usuarios.length)}%`
              : "0%"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="text-xl text-gray-800" style={{ fontWeight: 700 }}>
                Usuarios asignados
              </h2>
              <span className="rounded-full px-3 py-1 text-sm" style={{ backgroundColor: "#EFFCFB", color: "#111827", fontWeight: 600 }}>
                {usuariosFiltrados.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o email"
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 outline-none focus:border-[#12B8B2]"
                />
              </div>

              <div className="relative">
                <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={orderBy}
                  onChange={(e) => setOrderBy(e.target.value as OrderOption)}
                  className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 outline-none focus:border-[#12B8B2] bg-white"
                >
                  <option value="nombre">Ordenar por nombre</option>
                  <option value="actividad">Ordenar por actividad</option>
                </select>
              </div>
            </div>

            {usuariosFiltrados.length === 0 ? (
              <div className="rounded-xl bg-gray-50 p-5">
                <p className="text-gray-600">No hay usuarios que coincidan con la búsqueda.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[700px] overflow-auto pr-1">
                {usuariosFiltrados.map((usuario) => {
                  const isSelected = editingUserId === usuario.id;
                  const estado = getEstadoUsuario(usuario);
                  const favoriteGames = getFavoriteGames(usuario);

                  return (
                    <div
                      key={usuario.id}
                      className="rounded-2xl border p-5 transition-all hover:shadow-md"
                      style={{
                        borderColor: isSelected ? "#12B8B2" : "#F3F4F6",
                        backgroundColor: isSelected ? "#F3FBFB" : "#FFFFFF",
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                              <User size={20} className="text-gray-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-base text-gray-800 truncate" style={{ fontWeight: 700 }}>
                                {usuario.nombreCompleto || `${usuario.nombre || ""} ${usuario.apellidos || ""}`.trim()}
                              </p>
                              <p className="text-sm text-gray-500 truncate">{usuario.email}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="rounded-xl bg-gray-50 p-3">
                              <p className="text-xs text-gray-500 uppercase mb-1">Estado</p>
                              <span
                                className="inline-flex items-center rounded-full px-2.5 py-1 text-xs"
                                style={{
                                  backgroundColor: estado === "Activo" ? "#EFFCFB" : "#F3F4F6",
                                  color: estado === "Activo" ? "#0F766E" : "#6B7280",
                                  fontWeight: 600,
                                }}
                              >
                                {estado}
                              </span>
                            </div>

                            <div className="rounded-xl bg-gray-50 p-3">
                              <p className="text-xs text-gray-500 uppercase mb-1">Última actividad</p>
                              <p className="text-sm text-gray-700" style={{ fontWeight: 600 }}>
                                {usuario.ultimaActividad || "Sin actividad"}
                              </p>
                            </div>

                            <div className="rounded-xl bg-gray-50 p-3">
                              <p className="text-xs text-gray-500 uppercase mb-1">Progreso</p>
                              <p className="text-sm text-gray-700" style={{ fontWeight: 600 }}>
                                {usuario.progreso ?? 0}%
                              </p>
                            </div>

                            <div className="rounded-xl bg-gray-50 p-3">
                              <p className="text-xs text-gray-500 uppercase mb-1">Evolución</p>
                              <button
                                type="button"
                                onClick={() => navigate(`/evolucion-cuidador?usuario=${usuario.id}`)}
                                className="inline-flex items-center gap-2 text-sm transition-colors cursor-pointer"
                                style={{ color: "#12B8B2", fontWeight: 700 }}
                              >
                                <TrendingUp size={14} />
                                Ver evolución
                              </button>
                            </div>
                          </div>

                          <div className="mt-3 rounded-xl bg-gray-50 p-3">
                            <div className="mb-2 flex items-center gap-2">
                              <Star size={14} style={{ color: "#12B8B2" }} />
                              <p className="text-xs text-gray-500 uppercase" style={{ fontWeight: 600 }}>
                                Juegos favoritos
                              </p>
                            </div>
                            {favoriteGames.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {favoriteGames.map((game: any) => (
                                  <span
                                    key={game.gameId}
                                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
                                    style={{
                                      backgroundColor: "#EFFCFB",
                                      color: "#0F766E",
                                      fontWeight: 700,
                                    }}
                                  >
                                    <span aria-hidden="true">{game.icon}</span>
                                    {game.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">Sin favoritos marcados</p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleEdit(usuario)}
                          className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                          style={{ fontWeight: 600 }}
                        >
                          <Edit2 size={14} />
                          {isSelected ? "Editando" : "Editar"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm min-h-[620px]">
            {!selectedUser ? (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Edit2 size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl text-gray-800 mb-2" style={{ fontWeight: 700 }}>
                    Selecciona un usuario
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    Elige un usuario de la lista para revisar sus datos y guardarlos desde esta misma pantalla.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl text-gray-800" style={{ fontWeight: 700 }}>
                      Editar usuario
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Estás editando a {selectedUser.nombreCompleto || `${selectedUser.nombre} ${selectedUser.apellidos}`.trim()}.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    style={{ fontWeight: 600 }}
                  >
                    <X size={14} />
                    Cancelar
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-500 uppercase mb-1">Estado</p>
                    <p className="text-sm text-gray-800" style={{ fontWeight: 700 }}>
                      {getEstadoUsuario(selectedUser)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-500 uppercase mb-1">Última actividad</p>
                    <p className="text-sm text-gray-800" style={{ fontWeight: 700 }}>
                      {selectedUser.ultimaActividad || "Sin actividad"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-500 uppercase mb-1">Progreso actual</p>
                    <p className="text-sm text-gray-800" style={{ fontWeight: 700 }}>
                      {selectedUser.progreso ?? 0}%
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-500 uppercase mb-1">Evolución</p>
                    <button
                      type="button"
                      onClick={() => navigate(`/evolucion-cuidador?usuario=${selectedUser.id}`)}
                      className="inline-flex items-center gap-2 text-sm transition-colors cursor-pointer"
                      style={{ color: "#12B8B2", fontWeight: 700 }}
                    >
                      <TrendingUp size={14} />
                      Ver evolución
                    </button>
                  </div>
                </div>

                <div className="mb-6 rounded-xl bg-gray-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Star size={16} style={{ color: "#12B8B2" }} />
                    <p className="text-xs text-gray-500 uppercase" style={{ fontWeight: 700 }}>
                      Juegos favoritos
                    </p>
                  </div>
                  {getFavoriteGames(selectedUser).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {getFavoriteGames(selectedUser).map((game: any) => (
                        <span
                          key={game.gameId}
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm"
                          style={{
                            backgroundColor: "#EFFCFB",
                            color: "#0F766E",
                            fontWeight: 700,
                          }}
                        >
                          <span aria-hidden="true">{game.icon}</span>
                          {game.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Este usuario todavÃ­a no ha marcado juegos favoritos.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                      Nombre *
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 outline-none focus:border-[#12B8B2]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#12B8B2]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                      Email *
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 outline-none focus:border-[#12B8B2]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                      Teléfono
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 outline-none focus:border-[#12B8B2]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                      Fecha de nacimiento
                    </label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        name="fecha_nacimiento"
                        value={formData.fecha_nacimiento}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 outline-none focus:border-[#12B8B2]"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-2" style={{ fontWeight: 600 }}>
                      Observaciones
                    </label>
                    <div className="relative">
                      <FileText size={16} className="absolute left-3 top-4 text-gray-400" />
                      <textarea
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleChange}
                        rows={6}
                        className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 outline-none focus:border-[#12B8B2] resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl px-6 py-3 text-white transition-all disabled:opacity-50 cursor-pointer"
                    style={{
                      background: "#12B8B2",
                      fontWeight: 700,
                    }}
                  >
                    <Save size={16} />
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
