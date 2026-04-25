import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import {
  Activity,
  BarChart3,
  Brain,
  Calendar,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart as RechartsBarChart,
} from "recharts";
import { caregiverApi, CaregiverEvolutionResponse } from "../../lib/api";
import { useAuth } from "../context/AuthContext";

type ChartMode = "global" | "individual";

const CHART_COLORS = [
  "#12B8B2",
  "#0A3F84",
  "#7C3AED",
  "#F59E0B",
  "#E88F7A",
  "#2563EB",
  "#0F766E",
  "#64748B",
];
const SHORT_GAME_LABELS: Record<string, string> = {
  "memoria-visual": "Memoria",
  memoria: "Memoria",
  "memoria visual": "Memoria",
  "asociacion-imagen-palabra": "Asociación",
  "asociacion imagen palabra": "Asociación",
  asociacion: "Asociación",
  "asociación": "Asociación",
  atención: "Atención",
  atencion: "Atención",
  "atencion-selectiva": "Atención",
  "atencion selectiva": "Atención",
  "atención selectiva": "Atención",
  emparejar: "Emparejar",
  emparejamiento: "Emparejar",
  "emparejamiento-objetos": "Emparejar",
  reconocimiento: "Reconocimiento",
  "reconocimiento-imagenes": "Reconocimiento",
  "reconocimiento-de-imagenes": "Reconocimiento",
  "reconocimiento de imagenes": "Reconocimiento",
  "reconocimiento de imágenes": "Reconocimiento",
  secuencia: "Secuencia",
  "secuencia-visual": "Secuencia",
  "secuencia visual": "Secuencia",
};

const GAME_ORDER = ["Memoria", "Asociación", "Atención", "Emparejar", "Reconocimiento", "Secuencia"];

function getProgressColor(value: number) {
  if (value >= 80) return "#12B8B2";
  if (value >= 60) return "#12B8B2";
  if (value >= 40) return "#6FC7C1";
  return "#E88F7A";
}

function getTrendValue(tendencia: string | undefined) {
  if (!tendencia) return null;
  const match = tendencia.match(/-?\d+([.,]\d+)?%/);
  if (!match) return null;
  return Number(match[0].replace(",", "."));
}

function getStreakValue(usuario: any) {
  if (usuario.racha !== undefined && usuario.racha !== null) {
    const dias = Number(usuario.racha);
    if (!Number.isNaN(dias) && dias > 0) return `${dias} día${dias === 1 ? "" : "s"}`;
  }

  const tendencia = String(usuario.tendencia || "");
  const streakMatch = tendencia.match(/racha\s*(\d+)/i);
  if (streakMatch) {
    const dias = Number(streakMatch[1]);
    return `${dias} día${dias === 1 ? "" : "s"}`;
  }

  return "Sin racha";
}

function getDisplayTrend(usuario: any) {
  if (typeof usuario.cambioUltimaSesion === "number") {
    const value = usuario.cambioUltimaSesion;
    return `${value > 0 ? "+" : ""}${value}%`;
  }
  return "No disp.";
}

function normalizeGameLabel(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getGameLabel(game: any) {
  const rawLabel = String(game.name || game.nombre || game.gameId || "Juego");
  const normalized = normalizeGameLabel(rawLabel);
  return SHORT_GAME_LABELS[normalized] || rawLabel;
}

function getGameAverage(game: any) {
  return Number(game.promedioScore ?? game.promedio ?? game.score ?? 0);
}

function getGameSessions(game: any) {
  return Number(game.partidas ?? game.sesiones ?? 0);
}

function hasRecentActivity(usuario: any) {
  const value = String(usuario.ultimaActividad || "").trim().toLowerCase();
  if (!value || value === "sin datos") return false;
  return true;
}

function getUserColor(index: number) {
  return CHART_COLORS[index % CHART_COLORS.length];
}

function sortChartRows(rows: Array<Record<string, string | number>>) {
  return [...rows].sort((a, b) => {
    const labelA = String(a.label || "");
    const labelB = String(b.label || "");
    const indexA = GAME_ORDER.indexOf(labelA);
    const indexB = GAME_ORDER.indexOf(labelB);

    if (indexA === -1 && indexB === -1) return labelA.localeCompare(labelB, "es");
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
}

function buildLast7DaysSeries(users: any[]) {
  const daysMap = new Map<string, Record<string, string | number | null>>();

  users.forEach((usuario) => {
    (usuario.evolucion7Dias || []).forEach((point: any) => {
      if (!daysMap.has(point.fecha)) {
        daysMap.set(point.fecha, {
          fecha: point.fecha,
          label: point.label,
        });
      }

      daysMap.get(point.fecha)![usuario.nombre] =
        typeof point.media === "number" ? point.media : null;
    });
  });

  return Array.from(daysMap.values()).sort((a, b) =>
    String(a.fecha).localeCompare(String(b.fecha))
  );
}

function formatLineTooltipLabel(value: string | number) {
  return `Día ${value}`;
}

function formatLineTooltipValue(value: number | null, name: string) {
  if (typeof value !== "number") {
    return ["Sin sesiones", name];
  }

  return [`${value}%`, name];
}

function hasAnyLast7DaysData(users: any[]) {
  return users.some((usuario) =>
    (usuario.evolucion7Dias || []).some((point: any) => typeof point.media === "number")
  );
}

function BarComparisonChart({
  data,
  mode,
  selectedLabel,
}: {
  data: Array<Record<string, string | number>>;
  mode: ChartMode;
  selectedLabel?: string;
}) {
  const dataKeys = useMemo(() => {
    return Array.from(
      new Set(
        data.flatMap((item) =>
          Object.keys(item).filter((key) => key !== "label" && !key.startsWith("__sessions__"))
        )
      )
    );
  }, [data]);

  const legendItems = useMemo(
    () =>
      dataKeys.map((key, index) => ({
        name: key,
        color: mode === "individual" ? CHART_COLORS[0] : getUserColor(index),
      })),
    [dataKeys, mode]
  );

  if (!data.length || !dataKeys.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-500">Todavía no hay datos suficientes para mostrar esta gráfica.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={{ top: 12, right: 12, left: 0, bottom: 16 }}
            barCategoryGap={mode === "individual" ? "35%" : "20%"}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              formatter={(value: number, name: string) => [`${value}%`, name]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              }}
            />

            {dataKeys.map((key, index) => {
              const color = mode === "individual" ? CHART_COLORS[0] : getUserColor(index);

              return (
                <Bar
                  key={key}
                  dataKey={key}
                  name={key}
                  fill={color}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={mode === "individual" ? 52 : 26}
                >
                  {data.map((_, cellIndex) => (
                    <Cell key={`${key}-${cellIndex}`} fill={color} />
                  ))}
                </Bar>
              );
            })}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {legendItems.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-sm text-gray-700">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.name}</span>
          </div>
        ))}
      </div>

      {mode === "individual" && selectedLabel && (
        <p className="mt-4 text-center text-xs text-gray-500">
          Comparativa mostrada para <span style={{ fontWeight: 700 }}>{selectedLabel}</span>
        </p>
      )}
    </div>
  );
}

function Last7DaysComparisonChart({
  users,
  selectedUserIds,
}: {
  users: any[];
  selectedUserIds: string[];
}) {
  const last7DaysData = useMemo(() => buildLast7DaysSeries(users), [users]);

  if (!users.length || !hasAnyLast7DaysData(users)) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-500">Todavía no hay datos suficientes para mostrar esta gráfica.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={last7DaysData} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              formatter={formatLineTooltipValue}
              labelFormatter={formatLineTooltipLabel}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              }}
            />

            {users.map((usuario, index) => {
              const color = getUserColor(index);

              return (
                <Line
                  key={usuario.id}
                  type="monotone"
                  dataKey={usuario.nombre}
                  stroke={color}
                  strokeWidth={3}
                  dot={{ r: 4, fill: color, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  connectNulls={true}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {users.map((usuario, index) => {
          const color = getUserColor(index);

          return (
            <div key={usuario.id} className="flex items-center gap-2 text-sm text-gray-700">
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span>{usuario.nombre}</span>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-gray-500">
        {selectedUserIds.length > 0
          ? "Vista de los últimos 7 días basada en los usuarios seleccionados."
          : "Vista global de los últimos 7 días para todos los usuarios."}
      </p>
    </div>
  );
}

export default function EvolutionCuidador() {
  const { accessToken } = useAuth();
  const [searchParams] = useSearchParams();
  const initialUserId = searchParams.get("usuario");

  const [data, setData] = useState<CaregiverEvolutionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(initialUserId ? [initialUserId] : []);

  useEffect(() => {
    const fetchEvolution = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        setError("");
        const response = await caregiverApi.getEvolution(accessToken);
        setData(response);
      } catch (err: any) {
        console.error("Error cargando evolución del cuidador:", err);
        setError(err.message || "No se pudo cargar la evolución");
      } finally {
        setLoading(false);
      }
    };

    fetchEvolution();
  }, [accessToken]);

  const usuarios = data?.usuarios || [];

  const selectedUsers = useMemo(() => {
    if (!selectedUserIds.length) return [];
    return usuarios.filter((u) => selectedUserIds.includes(u.id));
  }, [usuarios, selectedUserIds]);

  const selectedUser = selectedUsers.length === 1 ? selectedUsers[0] : null;
  const usersForComparison = selectedUserIds.length ? selectedUsers : usuarios;

  const summary = useMemo(() => {
    const totalUsuarios = usuarios.length;
    const totalJuegos = usuarios.reduce((sum, u) => sum + Number(u.juegos || 0), 0);
    const promedioGlobal =
      totalUsuarios > 0
        ? Math.round(usuarios.reduce((sum, u) => sum + Number(u.promedio || 0), 0) / totalUsuarios)
        : 0;

    const usuariosActividadReciente = usuarios.filter((u) => hasRecentActivity(u)).length;

    return {
      totalUsuarios,
      totalJuegos,
      promedioGlobal,
      usuariosActividadReciente,
    };
  }, [usuarios]);

  const chartData = useMemo(() => {
    if (selectedUsers.length === 1 && selectedUsers[0]?.statsPorJuego?.length) {
      const user = selectedUsers[0];
      return {
        mode: "individual" as ChartMode,
        selectedLabel: user.nombre,
        data: sortChartRows(
          user.statsPorJuego.map((game: any) => ({
            label: getGameLabel(game),
            [user.nombre]: getGameAverage(game),
          }))
        ),
      };
    }

    const gamesMap = new Map<string, Record<string, string | number>>();

    usersForComparison.forEach((usuario) => {
      (usuario.statsPorJuego || []).forEach((game: any) => {
        const gameLabel = getGameLabel(game);
        if (!gamesMap.has(gameLabel)) {
          gamesMap.set(gameLabel, { label: gameLabel });
        }
        gamesMap.get(gameLabel)![usuario.nombre] = getGameAverage(game);
      });
    });

    return {
      mode: "global" as ChartMode,
      selectedLabel: undefined,
      data: sortChartRows(Array.from(gamesMap.values())),
    };
  }, [selectedUsers, usersForComparison]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "#E5ECEC" }}>
          <p className="text-gray-600">Cargando evolución del cuidador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl text-gray-800 mb-1" style={{ fontWeight: 700 }}>
          Evolución de usuarios
        </h1>
        <p className="text-sm text-gray-400">
          Seguimiento del uso y rendimiento cognitivo de las personas asignadas
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border bg-red-50 p-4" style={{ borderColor: "#FECACA" }}>
          <p className="text-sm text-red-700" style={{ fontWeight: 600 }}>
            {error}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "#E5ECEC" }}>
          <div className="flex items-center justify-between mb-3">
            <Users size={22} style={{ color: "#12B8B2" }} />
            <span className="text-xs text-gray-400">Usuarios</span>
          </div>
          <p className="text-3xl text-gray-800" style={{ fontWeight: 700 }}>
            {summary.totalUsuarios}
          </p>
          <p className="text-sm text-gray-500 mt-1">Personas asignadas</p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "#E5ECEC" }}>
          <div className="flex items-center justify-between mb-3">
            <Calendar size={22} style={{ color: "#12B8B2" }} />
            <span className="text-xs text-gray-400">Sesiones</span>
          </div>
          <p className="text-3xl text-gray-800" style={{ fontWeight: 700 }}>
            {summary.totalJuegos}
          </p>
          <p className="text-sm text-gray-500 mt-1">Ejercicios registrados</p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "#E5ECEC" }}>
          <div className="flex items-center justify-between mb-3">
            <TrendingUp size={22} style={{ color: "#12B8B2" }} />
            <span className="text-xs text-gray-400">Media</span>
          </div>
          <p className="text-3xl text-gray-800" style={{ fontWeight: 700 }}>
            {summary.promedioGlobal}%
          </p>
          <p className="text-sm text-gray-500 mt-1">Puntuación media global</p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: "#E5ECEC" }}>
          <div className="flex items-center justify-between mb-3">
            <Activity size={22} style={{ color: "#12B8B2" }} />
            <span className="text-xs text-gray-400">Actividad</span>
          </div>
          <p className="text-3xl text-gray-800" style={{ fontWeight: 700 }}>
            {summary.usuariosActividadReciente}
          </p>
          <p className="text-sm text-gray-500 mt-1">Usuarios con actividad reciente</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden mb-8" style={{ borderColor: "#E5ECEC" }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-5 border-b" style={{ borderColor: "#E5ECEC" }}>
          <div className="flex items-center gap-2">
            <BarChart3 size={18} style={{ color: "#12B8B2" }} />
            <h2 className="text-lg text-gray-800" style={{ fontWeight: 700 }}>
              Lista de usuarios
            </h2>
          </div>

          {selectedUserIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedUserIds([])}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              style={{ fontWeight: 600 }}
            >
              <X size={14} />
              Quitar selección
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-gray-50 border-b" style={{ borderColor: "#E5ECEC" }}>
              <p className="text-xs text-gray-500 uppercase" style={{ fontWeight: 600 }}>Usuario</p>
              <p className="text-xs text-gray-500 uppercase" style={{ fontWeight: 600 }}>Última sesión</p>
              <p className="text-xs text-gray-500 uppercase" style={{ fontWeight: 600 }}>Puntuación media</p>
              <p className="text-xs text-gray-500 uppercase" style={{ fontWeight: 600 }}>Cambio vs última sesión</p>
              <p className="text-xs text-gray-500 uppercase" style={{ fontWeight: 600 }}>Racha</p>
              <p className="text-xs text-gray-500 uppercase" style={{ fontWeight: 600 }}>Sesiones</p>
            </div>

            {usuarios.map((usuario) => {
              const selected = selectedUserIds.includes(usuario.id);
              const avg = Number(usuario.promedio || 0);
              const trend = getDisplayTrend(usuario);
              const trendIsPositive = trend.startsWith("+");
              const trendIsNegative = trend.startsWith("-");
              const streak = getStreakValue(usuario);

              return (
                <button
                  key={usuario.id}
                  type="button"
                  onClick={() => toggleUserSelection(usuario.id)}
                  className={`w-full grid grid-cols-6 gap-4 px-6 py-4 border-b text-left transition-colors ${
                    selected ? "bg-[#EFFCFB]" : "hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <p className="text-sm text-gray-800 truncate" style={{ fontWeight: 700 }}>
                      {usuario.nombre}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <p className="text-sm text-gray-600">{usuario.ultimaActividad || "Sin datos"}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${avg}%`,
                          backgroundColor: getProgressColor(avg),
                        }}
                      />
                    </div>
                    <span className="text-sm" style={{ color: getProgressColor(avg), fontWeight: 700 }}>
                      {avg}%
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs"
                      style={{
                        backgroundColor: trendIsPositive
                          ? "#EFFCFB"
                          : trendIsNegative
                            ? "#FEF2F2"
                            : "#F3F4F6",
                        color: trendIsPositive
                          ? "#0F766E"
                          : trendIsNegative
                            ? "#DC2626"
                            : "#6B7280",
                        fontWeight: 700,
                      }}
                    >
                      {trend}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs"
                      style={{
                        backgroundColor: streak === "Sin racha" ? "#F3F4F6" : "#EFFCFB",
                        color: streak === "Sin racha" ? "#6B7280" : "#0F766E",
                        fontWeight: 700,
                      }}
                    >
                      {streak}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <p className="text-sm text-gray-700" style={{ fontWeight: 700 }}>
                      {usuario.juegos || 0}
                    </p>
                  </div>
                </button>
              );
            })}

            {usuarios.length === 0 && (
              <div className="px-6 py-10 text-center">
                <p className="text-gray-500">No hay usuarios con datos de evolución todavía.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E5ECEC" }}>
          <div className="flex items-center gap-2 px-6 py-5 border-b" style={{ borderColor: "#E5ECEC" }}>
            <TrendingUp size={18} style={{ color: "#12B8B2" }} />
            <h2 className="text-lg text-gray-800" style={{ fontWeight: 700 }}>
              Evolución últimos 7 días
            </h2>
          </div>

          <div className="p-6">
            <Last7DaysComparisonChart
              users={usersForComparison}
              selectedUserIds={selectedUserIds}
            />
          </div>
        </div>

        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E5ECEC" }}>
          <div className="flex items-center gap-2 px-6 py-5 border-b" style={{ borderColor: "#E5ECEC" }}>
            <Brain size={18} style={{ color: "#12B8B2" }} />
            <h2 className="text-lg text-gray-800" style={{ fontWeight: 700 }}>
              Rendimiento por tipo de juego
            </h2>
          </div>

          <div className="p-6">
            <BarComparisonChart
              data={chartData.data}
              mode={chartData.mode}
              selectedLabel={chartData.selectedLabel}
            />
          </div>
        </div>
      </div>

      {selectedUser && (
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden" style={{ borderColor: "#E5ECEC" }}>
          <div className="flex items-center gap-2 px-6 py-5 border-b" style={{ borderColor: "#E5ECEC" }}>
            <Target size={18} style={{ color: "#12B8B2" }} />
            <h2 className="text-lg text-gray-800" style={{ fontWeight: 700 }}>
              Detalle de análisis: {selectedUser.nombre}
            </h2>
          </div>

          <div className="p-6">
            {selectedUser.statsPorJuego?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {selectedUser.statsPorJuego.map((game: any) => (
                  <div
                    key={game.gameId || getGameLabel(game)}
                    className="rounded-2xl border p-5"
                    style={{ backgroundColor: "#FCFCFC", borderColor: "#E5ECEC" }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg">{game.icon || "🧠"}</span>
                        <p className="text-sm text-gray-800 truncate" style={{ fontWeight: 700 }}>
                          {getGameLabel(game)}
                        </p>
                      </div>

                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: "#EFFCFB",
                          color: "#111827",
                          fontWeight: 600,
                        }}
                      >
                        {getGameSessions(game)} sesiones
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Puntuación media</span>
                        <span className="text-gray-800" style={{ fontWeight: 700 }}>
                          {getGameAverage(game)}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Puntos acumulados</span>
                        <span className="text-gray-800" style={{ fontWeight: 700 }}>
                          {Number(game.puntosTotal || 0)}
                        </span>
                      </div>

                      <div className="pt-1">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${getGameAverage(game)}%`,
                              backgroundColor: getProgressColor(getGameAverage(game)),
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Este usuario todavía no tiene estadísticas por juego.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
