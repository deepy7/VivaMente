import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-ae96b5cd`;

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  token?: string;
  suppressErrorLog?: boolean;
}

async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, token, suppressErrorLog = false } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || publicAnonKey}`,
  };

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const rawText = await response.text();

    let data: any = null;

    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
          rawText ||
          `Error ${response.status}: ${response.statusText}`
      );
    }

    return data ?? {};
  } catch (error) {
    if (!suppressErrorLog) {
      console.error(`API Error [${endpoint}]:`, error);
    }
    throw error;
  }
}

// ============================================
// AUTH API
// ============================================

export interface RegisterUserData {
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  register: async (data: RegisterUserData) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: data,
    });
  },

  login: async (data: LoginData) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: data,
    });
  },

  forgotPassword: async (email: string) => {
    return apiCall('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  verifySession: async (token: string) => {
    return apiCall('/auth/verify', {
      method: 'GET',
      token,
    });
  },

  logout: async (token: string) => {
    return apiCall('/auth/logout', {
      method: 'POST',
      token,
    });
  },
};

// ============================================
// GAME API
// ============================================

export interface GameResultData {
  gameId: string;
  score: number;
  aciertos: number;
  errores: number;
  tiempo: number;
}

export interface UserGameStat {
  gameId: string;
  name: string;
  icon: string;
  partidas: number;
  puntosTotal: number;
  promedioScore: number;
  estrellas: number;
}

export interface UserStatsResponse {
  success: boolean;
  stats: {
    totalJuegos: number;
    puntosTotal: number;
    aciertosTotales: number;
    rachaActual: number;
    statsPorJuego: UserGameStat[];
    favoriteGames?: UserGameStat[];
    avatar?: string;
  };
}

export interface FavoritesResponse {
  success: boolean;
  favoritos: string[];
}

export interface UserProfileResponse {
  success: boolean;
  user: {
    id: string;
    nombre: string;
    apellidos: string;
    email: string;
    avatar: string;
    fechaRegistro?: string | null;
  };
}

function getUserIdFromToken(token: string) {
  try {
    const payload = token.split(".")[1];
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(atob(normalizedPayload));
    return decodedPayload.sub || "anon";
  } catch {
    return "anon";
  }
}

function getLocalFavoritesKey(token: string) {
  return `vivamente:favoritos:${getUserIdFromToken(token)}`;
}

function getLocalFavorites(token: string) {
  try {
    const rawFavorites = localStorage.getItem(getLocalFavoritesKey(token));
    const parsedFavorites = rawFavorites ? JSON.parse(rawFavorites) : [];
    return Array.isArray(parsedFavorites) ? parsedFavorites : [];
  } catch {
    return [];
  }
}

function setLocalFavorites(token: string, favoritos: string[]) {
  localStorage.setItem(getLocalFavoritesKey(token), JSON.stringify(favoritos));
}

export const gameApi = {
  saveResult: async (data: GameResultData, token: string) => {
    return apiCall('/game/result', {
      method: 'POST',
      body: data,
      token,
    });
  },

  getUserStats: async (token: string): Promise<UserStatsResponse> => {
    return apiCall('/user/stats', {
      method: 'GET',
      token,
    });
  },

  getFavorites: async (token: string): Promise<FavoritesResponse> => {
    try {
      const response = await apiCall('/user/favorites', {
        method: 'GET',
        token,
        suppressErrorLog: true,
      });

      const favoritos = Array.isArray(response.favoritos) ? response.favoritos : [];
      setLocalFavorites(token, favoritos);
      return { success: true, favoritos };
    } catch (error) {
      console.warn("Usando favoritos locales porque el backend no los devolvió:", error);
      return { success: true, favoritos: getLocalFavorites(token) };
    }
  },

  toggleFavorite: async (gameId: string, token: string): Promise<FavoritesResponse> => {
    const localFavorites = getLocalFavorites(token);
    const nextFavorites = localFavorites.includes(gameId)
      ? localFavorites.filter((favoriteId) => favoriteId !== gameId)
      : [...localFavorites, gameId];

    setLocalFavorites(token, nextFavorites);

    try {
      const response = await apiCall('/user/favorites/toggle', {
        method: 'POST',
        body: { gameId },
        token,
        suppressErrorLog: true,
      });

      const favoritos = Array.isArray(response.favoritos) ? response.favoritos : nextFavorites;
      setLocalFavorites(token, favoritos);
      return { success: true, favoritos };
    } catch (error) {
      console.warn("Favorito guardado localmente porque el backend no lo aceptó:", error);
      return { success: true, favoritos: nextFavorites };
    }
  },
};

export const userApi = {
  getProfile: async (token: string): Promise<UserProfileResponse> => {
    return apiCall('/user/profile', {
      method: 'GET',
      token,
    });
  },

  updateAvatar: async (avatar: string, token: string): Promise<UserProfileResponse & { message: string }> => {
    return apiCall('/user/profile/avatar', {
      method: 'PUT',
      body: { avatar },
      token,
    });
  },
};

// ============================================
// CAREGIVER API
// ============================================

export interface CaregiverUserGameStat {
  gameId: string;
  name: string;
  icon: string;
  partidas: number;
  puntosTotal: number;
  promedioScore: number;
  estrellas: number;
}

export interface CaregiverAssignedUser {
  id: string;
  nombre: string;
  apellidos: string;
  nombreCompleto: string;
  email: string;
  fechaRegistro: string;
  ultimaActividad: string;
  ultimaActividadISO: string | null;
  progreso: number;
  activoHoy: boolean;
  sesionesHoy: number;
  totalJuegos: number;
  puntosTotal: number;
  aciertosTotales: number;
  erroresTotales: number;
  tiempoTotal: number;
  rachaActual: number;
  statsPorJuego: CaregiverUserGameStat[];
}

export interface CaregiverSummary {
  totalUsuarios: number;
  sesionesHoy: number;
  usuariosActivosHoy: number;
  promedioProgreso: number;
  ejerciciosCompletados: number;
}

export interface CaregiverData {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  avatar?: string;
  especialidad: string;
  experiencia: number;
  fechaRegistro?: string | null;
  usuarios_asociados?: number;
}

export interface CaregiverDashboardResponse {
  success: boolean;
  caregiver: CaregiverData;
  summary: CaregiverSummary;
  usuarios: CaregiverAssignedUser[];
}

export interface CaregiverProfileResponse {
  success: boolean;
  caregiver: CaregiverData;
  usuarios: CaregiverAssignedUser[];
}

export interface CaregiverEvolutionDayPoint {
  fecha: string;
  label: string;
  media: number | null;
  sesiones: number;
}

export interface CaregiverEvolutionUser {
  id: string;
  nombre: string;
  ultimaActividad: string;
  promedio: number;
  tendencia: string;
  estado: string;
  juegos: number;
  activoHoy: boolean;
  sesionesHoy: number;
  statsPorJuego: CaregiverUserGameStat[];
  evolucion7Dias: CaregiverEvolutionDayPoint[];
}

export interface CaregiverEvolutionResponse {
  success: boolean;
  usuarios: CaregiverEvolutionUser[];
}

export interface CaregiverManagedUser {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  fecha_nacimiento?: string;
  observaciones?: string;
  rol: 'usuario';
  cuidador_asignado: string | null;
  fecha_registro: string;
  fecha_actualizacion?: string;
}

export interface CaregiverManagedUsersResponse {
  success: boolean;
  usuarios: CaregiverAssignedUser[];
}

export interface CaregiverManagedUserResponse {
  success: boolean;
  usuario: CaregiverManagedUser;
}

export interface UpdateCaregiverUserData {
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  fecha_nacimiento?: string;
  observaciones?: string;
}

export interface UpdateCaregiverProfileData {
  nombre: string;
  apellidos: string;
  email: string;
  avatar?: string;
  especialidad?: string;
  experiencia?: number;
}

export interface CaregiverProfileUpdateResponse {
  success: boolean;
  caregiver: CaregiverData;
  message: string;
}

export const caregiverApi = {
  getDashboard: async (token: string): Promise<CaregiverDashboardResponse> => {
    return apiCall('/caregiver/dashboard', {
      method: 'GET',
      token,
    });
  },

  getProfile: async (token: string): Promise<CaregiverProfileResponse> => {
    return apiCall('/caregiver/profile', {
      method: 'GET',
      token,
    });
  },

  updateProfile: async (
    data: UpdateCaregiverProfileData,
    token: string,
  ): Promise<CaregiverProfileUpdateResponse> => {
    return apiCall('/caregiver/profile', {
      method: 'PUT',
      body: data,
      token,
    });
  },

  getEvolution: async (token: string): Promise<CaregiverEvolutionResponse> => {
    return apiCall('/caregiver/evolution', {
      method: 'GET',
      token,
    });
  },

  getAssignedUsers: async (token: string): Promise<CaregiverManagedUsersResponse> => {
    return apiCall('/caregiver/users', {
      method: 'GET',
      token,
    });
  },

  getAssignedUserById: async (
    userId: string,
    token: string,
  ): Promise<CaregiverManagedUserResponse> => {
    return apiCall(`/caregiver/users/${userId}`, {
      method: 'GET',
      token,
    });
  },

  updateAssignedUser: async (
    userId: string,
    data: UpdateCaregiverUserData,
    token: string,
  ): Promise<CaregiverManagedUserResponse> => {
    return apiCall(`/caregiver/users/${userId}`, {
      method: 'PUT',
      body: data,
      token,
    });
  },
};

export { API_BASE };
