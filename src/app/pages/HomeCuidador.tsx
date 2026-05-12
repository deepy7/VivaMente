import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Users, TrendingUp, Activity, Calendar, BarChart3, Settings, Edit2 } from "lucide-react";
import { caregiverApi, CaregiverDashboardResponse } from "../../lib/api";
import { useAuth } from "../context/AuthContext";

export default function HomeCuidador() {
  const { accessToken } = useAuth();
  const [dashboard, setDashboard] = useState<CaregiverDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        setError("");
        const response = await caregiverApi.getDashboard(accessToken);
        setDashboard(response);
      } catch (err: any) {
        console.error("Error cargando dashboard del cuidador:", err);
        setError(err.message || "No se pudo cargar la información del cuidador");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [accessToken]);

  const summary = dashboard?.summary;
  const caregiver = dashboard?.caregiver;
  const accentColor = "#12B8B2";
  const accentSoft = "#EFFCFB";
  const borderColor = "#E5ECEC";

  const estadisticas = [
    {
      icon: <Users size={28} />,
      label: "Usuarios asignados",
      value: `${summary?.totalUsuarios ?? 0}`,
    },
    {
      icon: <Activity size={28} />,
      label: "Sesiones hoy",
      value: `${summary?.sesionesHoy ?? 0}`,
    },
    {
      icon: <TrendingUp size={28} />,
      label: "Promedio progreso",
      value: `${summary?.promedioProgreso ?? 0}%`,
    },
    {
      icon: <Calendar size={28} />,
      label: "Ejercicios registrados",
      value: `${summary?.ejerciciosCompletados ?? 0}`,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="bg-white rounded-2xl border-2 p-8" style={{ borderColor }}>
            <p className="text-gray-600 text-lg">Cargando panel del cuidador...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="mb-8 sm:mb-10 lg:mb-12 flex flex-col sm:flex-row sm:items-start justify-between gap-5 sm:gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-2 sm:mb-3" style={{ fontWeight: 700 }}>
              Panel de <span style={{ color: accentColor }}>Cuidador</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              Gestiona a tus usuarios asignados y revisa su evolución general
            </p>
            {caregiver && (
              <p className="text-sm text-gray-500 mt-3">
                Sesión iniciada como {caregiver.nombre} {caregiver.apellidos}
              </p>
            )}
          </div>

          <Link
            to="/perfil-cuidador"
            className="inline-flex items-center justify-center gap-2 border-2 text-gray-700 px-5 sm:px-6 py-3 rounded-xl transition-all hover:scale-105 cursor-pointer hover:bg-[#EFFCFB]"
            style={{ fontWeight: 600, borderColor }}
          >
            <Settings size={20} />
            Mi perfil
          </Link>
        </div>

        {error && (
          <div
            className="mb-8 bg-red-50 border-2 rounded-2xl px-6 py-4"
            style={{ borderColor: "#FECACA" }}
          >
            <p className="text-red-700" style={{ fontWeight: 600 }}>
              {error}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6 mb-8 sm:mb-10 lg:mb-12">
          {estadisticas.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border-2 p-5 sm:p-6 transition-all hover:shadow-lg"
              style={{ borderColor }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: accentSoft }}
              >
                <div style={{ color: accentColor }}>{stat.icon}</div>
              </div>
              <p className="text-3xl mb-2 text-gray-900" style={{ fontWeight: 700 }}>
                {stat.value}
              </p>
              <p className="text-sm text-gray-600" style={{ fontWeight: 600 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-2xl text-gray-900 mb-6" style={{ fontWeight: 700 }}>
            Acciones rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            <Link
              to="/gestion-usuarios"
              className="bg-white rounded-2xl border-2 p-6 sm:p-8 transition-all hover:shadow-xl hover:-translate-y-1"
              style={{ borderColor }}
            >
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: accentSoft }}
              >
                <Edit2 size={32} style={{ color: accentColor }} />
              </div>
              <h3 className="text-xl text-gray-900 mb-2" style={{ fontWeight: 700 }}>
                Gestionar usuarios
              </h3>
              <p className="text-gray-600">
                Consulta, busca y edita los datos de los usuarios que ya tienes asignados
              </p>
            </Link>

            <Link
              to="/evolucion-cuidador"
              className="bg-white rounded-2xl border-2 p-6 sm:p-8 transition-all hover:shadow-xl hover:-translate-y-1"
              style={{ borderColor }}
            >
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: accentSoft }}
              >
                <BarChart3 size={32} style={{ color: accentColor }} />
              </div>
              <h3 className="text-xl text-gray-900 mb-2" style={{ fontWeight: 700 }}>
                Ver evolución
              </h3>
              <p className="text-gray-600">
                Analiza la actividad, el progreso y el uso general de los ejercicios
              </p>
            </Link>

            <Link
              to="/ayuda-cuidador"
              className="bg-white rounded-2xl border-2 p-6 sm:p-8 transition-all hover:shadow-xl hover:-translate-y-1"
              style={{ borderColor }}
            >
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: accentSoft }}
              >
                <Settings size={32} style={{ color: accentColor }} />
              </div>
              <h3 className="text-xl text-gray-900 mb-2" style={{ fontWeight: 700 }}>
                Ayuda y soporte
              </h3>
              <p className="text-gray-600">
                Consulta la ayuda disponible y accede al soporte cuando lo necesites
              </p>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 p-6 sm:p-8" style={{ borderColor }}>
          <h2 className="text-2xl text-gray-900 mb-3" style={{ fontWeight: 700 }}>
            Resumen del panel
          </h2>
          <p className="text-gray-600 max-w-3xl leading-7">
            Desde aquí puedes ir directamente a la gestión de usuarios, consultar la evolución de las
            personas asignadas y mantener actualizado tu propio perfil. La edición individual de cada
            usuario se realiza únicamente dentro del apartado de gestión.
          </p>
        </div>
      </div>
    </div>
  );
}
