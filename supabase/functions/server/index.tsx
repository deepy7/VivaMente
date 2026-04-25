import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const GAME_NAMES: Record<string, string> = {
  "memoria-visual": "Memoria Visual",
  asociacion: "Asociación",
  atencion: "Atención Selectiva",
  emparejar: "Emparejar",
  reconocimiento: "Reconocimiento",
  secuencia: "Secuencia Visual",
};

const GAME_ICONS: Record<string, string> = {
  "memoria-visual": "🧠",
  asociacion: "🔗",
  atencion: "👁️",
  emparejar: "🃏",
  reconocimiento: "🔍",
  secuencia: "📋",
};

const APP_TIMEZONE = "Atlantic/Canary";
const DEFAULT_AVATAR = "avatar-1";

function getTimeZoneDateParts(dateInput: string | Date, timeZone = APP_TIMEZONE) {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    weekday: map.weekday,
  };
}

function formatDateKeyInTimeZone(dateInput: string | Date, timeZone = APP_TIMEZONE) {
  const { year, month, day } = getTimeZoneDateParts(dateInput, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getTodayDateKey(timeZone = APP_TIMEZONE) {
  return formatDateKeyInTimeZone(new Date(), timeZone);
}

function buildDateFromDateKey(dateKey: string) {
  return new Date(`${dateKey}T12:00:00.000Z`);
}

app.use("*", logger(console.log));

app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

async function getAuthenticatedUser(c: any) {
  const accessToken = c.req.header("Authorization")?.split(" ")[1];

  if (!accessToken) {
    return { error: "Token no proporcionado", status: 401, user: null };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return { error: "Sesión inválida", status: 401, user: null };
  }

  return { user, accessToken, error: null, status: 200 };
}

async function requireCaregiver(c: any) {
  const auth = await getAuthenticatedUser(c);

  if (!auth.user) {
    return { ok: false, response: c.json({ error: auth.error }, auth.status as 401) };
  }

  const role = auth.user.user_metadata?.rol || "usuario";
  if (role !== "cuidador") {
    return { ok: false, response: c.json({ error: "Acceso denegado" }, 403) };
  }

  return { ok: true, auth };
}

async function getRoleData(userId: string, role: string) {
  const key = role === "cuidador" ? `cuidador:${userId}` : `usuario:${userId}`;
  return await kv.get(key);
}

async function getUserResults(userId: string) {
  const resultadosIds = (await kv.get(`resultados_usuario:${userId}`)) || [];
  const resultados = [];

  for (const id of resultadosIds) {
    const resultado = await kv.get(`resultado:${id}`);
    if (resultado) {
      resultados.push(resultado);
    }
  }

  return resultados;
}

async function getUserFavorites(userId: string) {
  const favoritos = (await kv.get(`favoritos_usuario:${userId}`)) || [];
  return Array.isArray(favoritos) ? favoritos : [];
}

function buildFavoriteGameStats(favoritos: string[], statsPorJuego: any[]) {
  const statsByGame = new Map(statsPorJuego.map((game) => [game.gameId, game]));

  return favoritos.map((gameId) => {
    const gameStats = statsByGame.get(gameId);

    return {
      gameId,
      name: gameStats?.name || GAME_NAMES[gameId] || gameId,
      icon: gameStats?.icon || GAME_ICONS[gameId] || "🎮",
      partidas: gameStats?.partidas || 0,
      puntosTotal: gameStats?.puntosTotal || 0,
      promedioScore: gameStats?.promedioScore || 0,
      estrellas: gameStats?.estrellas || 0,
    };
  });
}

function calculateStatsFromResults(resultados: any[]) {
  const totalJuegos = resultados.length;
  const puntosTotal = resultados.reduce((sum, r) => sum + (r.score || 0), 0);
  const aciertosTotales = resultados.reduce((sum, r) => sum + (r.aciertos || 0), 0);
  const erroresTotales = resultados.reduce((sum, r) => sum + (r.errores || 0), 0);
  const tiempoTotal = resultados.reduce((sum, r) => sum + (r.tiempo || 0), 0);

  const fechasKeys = resultados
    .map((r) => r.fecha)
    .filter(Boolean)
    .map((fecha) => formatDateKeyInTimeZone(fecha));

  const fechasUnicas = [...new Set(fechasKeys)].sort();

  let rachaActual = 0;
  if (fechasUnicas.length > 0) {
    const fechasSet = new Set(fechasUnicas);
    const hoyKey = getTodayDateKey();
    let fechaCursor = buildDateFromDateKey(hoyKey);

    for (let i = 0; i < 365; i++) {
      const fechaKey = formatDateKeyInTimeZone(fechaCursor);
      if (fechasSet.has(fechaKey)) {
        rachaActual++;
        fechaCursor.setUTCDate(fechaCursor.getUTCDate() - 1);
      } else {
        break;
      }
    }
  }

  const statsPorJuego: Record<string, any> = {};

  for (const resultado of resultados) {
    if (!statsPorJuego[resultado.game_id]) {
      statsPorJuego[resultado.game_id] = {
        gameId: resultado.game_id,
        name: GAME_NAMES[resultado.game_id] || resultado.game_id,
        icon: GAME_ICONS[resultado.game_id] || "🎮",
        partidas: 0,
        puntosTotal: 0,
        promedioScore: 0,
        estrellas: 0,
      };
    }

    statsPorJuego[resultado.game_id].partidas++;
    statsPorJuego[resultado.game_id].puntosTotal += resultado.score || 0;
  }

  for (const gameId in statsPorJuego) {
    const stats = statsPorJuego[gameId];
    stats.promedioScore = Math.round(stats.puntosTotal / stats.partidas);

    if (stats.promedioScore >= 90) stats.estrellas = 5;
    else if (stats.promedioScore >= 75) stats.estrellas = 4;
    else if (stats.promedioScore >= 60) stats.estrellas = 3;
    else if (stats.promedioScore >= 45) stats.estrellas = 2;
    else if (stats.promedioScore >= 30) stats.estrellas = 1;
    else stats.estrellas = 0;
  }

  const promedioGeneral = totalJuegos > 0 ? Math.round(puntosTotal / totalJuegos) : 0;

  const fechasISO = resultados
    .map((r) => r.fecha)
    .filter(Boolean)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const ultimaActividadISO = fechasISO.length > 0 ? fechasISO[fechasISO.length - 1] : null;
  const hoyKey = getTodayDateKey();
  const sesionesHoy = resultados.filter((resultado) => {
    if (!resultado?.fecha) return false;
    return formatDateKeyInTimeZone(resultado.fecha) === hoyKey;
  }).length;

  return {
    totalJuegos,
    puntosTotal,
    aciertosTotales,
    erroresTotales,
    tiempoTotal,
    rachaActual,
    promedioGeneral,
    ultimaActividadISO,
    sesionesHoy,
    activoHoy: sesionesHoy > 0,
    statsPorJuego: Object.values(statsPorJuego),
  };
}


function getLast7DaysLabels() {
  const dayNames: Record<string, string> = {
    Sun: "D",
    Mon: "L",
    Tue: "M",
    Wed: "X",
    Thu: "J",
    Fri: "V",
    Sat: "S",
  };

  const todayParts = getTimeZoneDateParts(new Date());
  const baseDate = new Date(Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day, 12, 0, 0));
  const days = [];

  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date(baseDate);
    date.setUTCDate(baseDate.getUTCDate() - offset);

    const dateKey = formatDateKeyInTimeZone(date);
    const weekday = getTimeZoneDateParts(date).weekday;

    days.push({
      iso: dateKey,
      label: dayNames[weekday] || weekday,
    });
  }

  return days;
}

function calculateLast7DaysSeries(resultados: any[]) {
  const last7Days = getLast7DaysLabels();
  const groupedScores = new Map<string, number[]>();

  for (const resultado of resultados) {
    if (!resultado?.fecha) continue;

    const date = new Date(resultado.fecha);
    if (Number.isNaN(date.getTime())) continue;

    const dateKey = formatDateKeyInTimeZone(date);
    if (!groupedScores.has(dateKey)) {
      groupedScores.set(dateKey, []);
    }

    groupedScores.get(dateKey)!.push(Number(resultado.score || 0));
  }

  return last7Days.map(({ iso, label }) => {
    const scores = groupedScores.get(iso) || [];
    const media = scores.length
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : null;

    return {
      fecha: iso,
      label,
      media,
      sesiones: scores.length,
    };
  });
}

function formatRelativeActivity(fechaISO?: string | null) {
  if (!fechaISO) {
    return "Sin actividad";
  }

  const fecha = new Date(fechaISO);
  const ahora = new Date();
  const diffMs = ahora.getTime() - fecha.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return diffMinutes <= 1 ? "Hace 1 minuto" : `Hace ${diffMinutes} minutos`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? "Hace 1 hora" : `Hace ${diffHours} horas`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return "Hace 1 día";
  }

  return `Hace ${diffDays} días`;
}

async function syncAuthUsersToKV() {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw new Error(error.message);
  }

  const authUsers = data?.users || [];

  for (const authUser of authUsers) {
    const metadata = authUser.user_metadata || {};
    const role = metadata.rol;

    if (role === "usuario") {
      const existing = await kv.get(`usuario:${authUser.id}`);

      const usuarioData = {
        id: authUser.id,
        email: authUser.email || existing?.email || "",
        nombre: metadata.nombre || existing?.nombre || "",
        apellidos: metadata.apellidos || existing?.apellidos || "",
        rol: "usuario",
        avatar: metadata.avatar || existing?.avatar || DEFAULT_AVATAR,
        cuidador_asignado: existing?.cuidador_asignado ?? null,
        fecha_registro:
          existing?.fecha_registro ||
          authUser.created_at ||
          new Date().toISOString(),
      };

      await kv.set(`usuario:${authUser.id}`, usuarioData);
    }

    if (role === "cuidador") {
      const existing = await kv.get(`cuidador:${authUser.id}`);

      const cuidadorData = {
        id: authUser.id,
        email: authUser.email || existing?.email || "",
        nombre: metadata.nombre || existing?.nombre || "",
        apellidos: metadata.apellidos || existing?.apellidos || "",
        rol: "cuidador",
        avatar: metadata.avatar || existing?.avatar || DEFAULT_AVATAR,
        especialidad: metadata.especialidad || existing?.especialidad || "",
        experiencia: metadata.experiencia ?? existing?.experiencia ?? 0,
        usuarios_asociados: Array.isArray(existing?.usuarios_asociados)
          ? existing.usuarios_asociados
          : [],
        fecha_registro:
          existing?.fecha_registro ||
          authUser.created_at ||
          new Date().toISOString(),
      };

      await kv.set(`cuidador:${authUser.id}`, cuidadorData);
    }
  }
}

function normalizeAssignedIds(values: any[] = []) {
  return values
    .map((value) => {
      if (typeof value === "string") return value;
      if (value && typeof value === "object") {
        return value.id || value.usuario_id || value.userId || value.user_id || null;
      }
      return null;
    })
    .filter(Boolean);
}

async function getAssignedUsersDetailed(cuidadorId: string) {
  const todosLosUsuarios = await kv.getByPrefix("usuario:");
  const cuidadorData = await kv.get(`cuidador:${cuidadorId}`);
  const usuariosAsociadosIds = normalizeAssignedIds(
    Array.isArray(cuidadorData?.usuarios_asociados) ? cuidadorData.usuarios_asociados : [],
  );

  const usuariosFiltrados = todosLosUsuarios.filter((usuario: any) => {
    return usuario?.cuidador_asignado === cuidadorId || usuariosAsociadosIds.includes(usuario?.id);
  });

  const usuariosDetallados = [];

  for (const usuario of usuariosFiltrados) {
    const resultados = await getUserResults(usuario.id);
    const stats = calculateStatsFromResults(resultados);

    usuariosDetallados.push({
      id: usuario.id,
      nombre: usuario.nombre || "",
      apellidos: usuario.apellidos || "",
      nombreCompleto: `${usuario.nombre || ""} ${usuario.apellidos || ""}`.trim(),
      email: usuario.email || "",
      telefono: usuario.telefono || "",
      fecha_nacimiento: usuario.fecha_nacimiento || "",
      observaciones: usuario.observaciones || "",
      cuidador_asignado: usuario.cuidador_asignado ?? null,
      rol: usuario.rol || "usuario",
      fechaRegistro: usuario.fecha_registro || null,
      ultimaActividad: formatRelativeActivity(stats.ultimaActividadISO),
      ultimaActividadISO: stats.ultimaActividadISO,
      activoHoy: stats.activoHoy,
      sesionesHoy: stats.sesionesHoy,
      progreso: stats.promedioGeneral,
      totalJuegos: stats.totalJuegos,
      puntosTotal: stats.puntosTotal,
      aciertosTotales: stats.aciertosTotales,
      erroresTotales: stats.erroresTotales,
      tiempoTotal: stats.tiempoTotal,
      rachaActual: stats.rachaActual,
      statsPorJuego: stats.statsPorJuego,
      resultados,
    });
  }

  usuariosDetallados.sort((a, b) => {
    if (!a.ultimaActividadISO && !b.ultimaActividadISO) {
      return a.nombreCompleto.localeCompare(b.nombreCompleto);
    }
    if (!a.ultimaActividadISO) return 1;
    if (!b.ultimaActividadISO) return -1;
    return new Date(b.ultimaActividadISO).getTime() - new Date(a.ultimaActividadISO).getTime();
  });

  return usuariosDetallados;
}

function calculateCaregiverSummary(usuarios: any[]) {
  const totalUsuarios = usuarios.length;
  const ejerciciosCompletados = usuarios.reduce((sum, u) => sum + (u.totalJuegos || 0), 0);

  const promedioProgreso =
    totalUsuarios > 0
      ? Math.round(usuarios.reduce((sum, u) => sum + (u.progreso || 0), 0) / totalUsuarios)
      : 0;

  const sesionesHoy = usuarios.reduce((sum, usuario) => sum + Number(usuario.sesionesHoy || 0), 0);
  const usuariosActivosHoy = usuarios.reduce((sum, usuario) => sum + (usuario.activoHoy ? 1 : 0), 0);

  return {
    totalUsuarios,
    sesionesHoy,
    usuariosActivosHoy,
    promedioProgreso,
    ejerciciosCompletados,
  };
}

app.get("/make-server-ae96b5cd/health", (c) => {
  return c.json({ status: "ok" });
});

// ============================================
// AUTH ENDPOINTS
// ============================================

app.post("/make-server-ae96b5cd/auth/register", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, nombre, apellidos } = body;

    if (!email || !password || !nombre || !apellidos) {
      return c.json({ error: "Todos los campos son obligatorios" }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: "Formato de email inválido" }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: "La contraseña debe tener al menos 6 caracteres" }, 400);
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nombre,
        apellidos,
        rol: "usuario",
        avatar: DEFAULT_AVATAR,
      },
    });

    if (authError) {
      console.error("Error al crear usuario en Supabase Auth:", authError);
      return c.json({ error: authError.message }, 400);
    }

    const usuarioData = {
      id: authData.user.id,
      email,
      nombre,
      apellidos,
      rol: "usuario",
      avatar: DEFAULT_AVATAR,
      cuidador_asignado: null,
      fecha_registro: new Date().toISOString(),
    };

    await kv.set(`usuario:${authData.user.id}`, usuarioData);

    return c.json({
      success: true,
      message: "Usuario registrado exitosamente",
      userId: authData.user.id,
    });
  } catch (error) {
    console.error("Error en registro de usuario:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});

app.post("/make-server-ae96b5cd/auth/admin/register-cuidador", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, nombre, apellidos, especialidad, experiencia } = body;

    if (!email || !password || !nombre || !apellidos) {
      return c.json({ error: "Todos los campos obligatorios deben estar completos" }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: "Formato de email inválido" }, 400);
    }

    if (password.length < 8) {
      return c.json({ error: "La contraseña debe tener al menos 8 caracteres" }, 400);
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nombre,
        apellidos,
        rol: "cuidador",
        especialidad: especialidad || "",
        experiencia: experiencia || 0,
        avatar: DEFAULT_AVATAR,
      },
    });

    if (authError) {
      console.error("Error al crear cuidador en Supabase Auth:", authError);
      return c.json({ error: authError.message }, 400);
    }

    const cuidadorData = {
      id: authData.user.id,
      email,
      nombre,
      apellidos,
      rol: "cuidador",
      especialidad: especialidad || "",
      experiencia: experiencia || 0,
      avatar: DEFAULT_AVATAR,
      usuarios_asociados: [],
      fecha_registro: new Date().toISOString(),
    };

    await kv.set(`cuidador:${authData.user.id}`, cuidadorData);

    return c.json({
      success: true,
      message: "Cuidador registrado exitosamente",
      userId: authData.user.id,
      email,
      password,
    });
  } catch (error) {
    console.error("Error en registro de cuidador:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});

app.post("/make-server-ae96b5cd/auth/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: "Email y contraseña son obligatorios" }, 400);
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error("Error al hacer login:", signInError);
      return c.json({ error: "Credenciales incorrectas" }, 401);
    }

    const userId = signInData.user.id;
    const userMetadata = signInData.user.user_metadata;
    const userRole = userMetadata.rol || "usuario";

    await syncAuthUsersToKV();
    const userData = await getRoleData(userId, userRole);

    return c.json({
      success: true,
      access_token: signInData.session.access_token,
      user: {
        id: userId,
        email: signInData.user.email,
        nombre: userMetadata.nombre,
        apellidos: userMetadata.apellidos,
        rol: userRole,
        especialidad: userMetadata.especialidad,
        experiencia: userMetadata.experiencia,
        ...userData,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});

app.post("/make-server-ae96b5cd/auth/forgot-password", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ error: "El email es obligatorio" }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: "Formato de email inválido" }, 400);
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${c.req.header("origin")}/reset-password`,
    });

    if (error) {
      console.error("Error al enviar email de recuperación:", error);
    }

    return c.json({
      success: true,
      message: "Si el email existe, recibirás instrucciones para recuperar tu contraseña",
    });
  } catch (error) {
    console.error("Error en recuperación de contraseña:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});

app.get("/make-server-ae96b5cd/auth/verify", async (c) => {
  try {
    const auth = await getAuthenticatedUser(c);

    if (!auth.user) {
      return c.json({ error: auth.error }, auth.status as 401);
    }

    await syncAuthUsersToKV();

    const role = auth.user.user_metadata?.rol || "usuario";
    const userData = await getRoleData(auth.user.id, role);

    return c.json({
      success: true,
      user: {
        id: auth.user.id,
        email: auth.user.email,
        ...auth.user.user_metadata,
        ...userData,
      },
    });
  } catch (error) {
    console.error("Error verificando sesión:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});

app.post("/make-server-ae96b5cd/auth/logout", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];

    if (!accessToken) {
      return c.json({ error: "Token no proporcionado" }, 401);
    }

    const { error } = await supabase.auth.admin.signOut(accessToken);

    if (error) {
      console.error("Error al cerrar sesión:", error);
      return c.json({ error: "Error al cerrar sesión" }, 400);
    }

    return c.json({ success: true, message: "Sesión cerrada exitosamente" });
  } catch (error) {
    console.error("Error en logout:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});

// ============================================
// RESULTADOS DE JUEGOS
// ============================================

app.post("/make-server-ae96b5cd/game/result", async (c) => {
  try {
    const auth = await getAuthenticatedUser(c);

    if (!auth.user) {
      console.error("❌ Guardar resultado:", auth.error);
      return c.json({ error: auth.error }, auth.status as 401);
    }

    const body = await c.req.json();
    const { gameId, score, aciertos, errores, tiempo } = body;

    console.log(`📝 Guardando resultado para usuario ${auth.user.id}:`, {
      gameId,
      score,
      aciertos,
      errores,
      tiempo,
    });

    if (
      !gameId ||
      score === undefined ||
      aciertos === undefined ||
      errores === undefined ||
      tiempo === undefined
    ) {
      console.error("❌ Guardar resultado: Campos faltantes", {
        gameId,
        score,
        aciertos,
        errores,
        tiempo,
      });
      return c.json({ error: "Todos los campos son obligatorios" }, 400);
    }

    const resultado = {
      id: crypto.randomUUID(),
      usuario_id: auth.user.id,
      game_id: gameId,
      score,
      aciertos,
      errores,
      tiempo,
      fecha: new Date().toISOString(),
    };

    await kv.set(`resultado:${resultado.id}`, resultado);
    console.log(`✅ Resultado guardado con ID: ${resultado.id}`);

    const resultadosKey = `resultados_usuario:${auth.user.id}`;
    const resultadosExistentes = (await kv.get(resultadosKey)) || [];

    resultadosExistentes.push(resultado.id);
    await kv.set(resultadosKey, resultadosExistentes);

    return c.json({
      success: true,
      message: "Resultado guardado exitosamente",
      resultadoId: resultado.id,
    });
  } catch (error) {
    console.error("❌ Error al guardar resultado del juego:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});

app.get("/make-server-ae96b5cd/user/stats", async (c) => {
  try {
    const auth = await getAuthenticatedUser(c);

    if (!auth.user) {
      console.error("❌ Stats:", auth.error);
      return c.json({ error: auth.error }, auth.status as 401);
    }

    const resultados = await getUserResults(auth.user.id);
    const stats = calculateStatsFromResults(resultados);
    const favoritos = await getUserFavorites(auth.user.id);
    const favoriteGames = buildFavoriteGameStats(favoritos, stats.statsPorJuego);

    return c.json({
      success: true,
      stats: {
        totalJuegos: stats.totalJuegos,
        puntosTotal: stats.puntosTotal,
        aciertosTotales: stats.aciertosTotales,
        rachaActual: stats.rachaActual,
        statsPorJuego: stats.statsPorJuego,
        favoriteGames,
        avatar: (await kv.get(`usuario:${auth.user.id}`))?.avatar || DEFAULT_AVATAR,
      },
    });
  } catch (error) {
    console.error("Error al obtener estadísticas del usuario:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});

app.get("/make-server-ae96b5cd/user/favorites", async (c) => {
  try {
    const auth = await getAuthenticatedUser(c);

    if (!auth.user) {
      console.error("Favoritos:", auth.error);
      return c.json({ error: auth.error }, auth.status as 401);
    }

    const favoritos = await getUserFavorites(auth.user.id);

    return c.json({
      success: true,
      favoritos,
    });
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});

app.post("/make-server-ae96b5cd/user/favorites/toggle", async (c) => {
  try {
    const auth = await getAuthenticatedUser(c);

    if (!auth.user) {
      console.error("Actualizar favorito:", auth.error);
      return c.json({ error: auth.error }, auth.status as 401);
    }

    const body = await c.req.json();
    const { gameId } = body;

    if (!gameId || typeof gameId !== "string") {
      return c.json({ error: "El juego es obligatorio" }, 400);
    }

    const favoritosActuales = await getUserFavorites(auth.user.id);
    const favoritos = favoritosActuales.includes(gameId)
      ? favoritosActuales.filter((favoriteId) => favoriteId !== gameId)
      : [...favoritosActuales, gameId];

    await kv.set(`favoritos_usuario:${auth.user.id}`, favoritos);

    return c.json({
      success: true,
      favoritos,
    });
  } catch (error) {
    console.error("Error al actualizar favorito:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});

app.get("/make-server-ae96b5cd/user/profile", async (c) => {
  try {
    const auth = await getAuthenticatedUser(c);

    if (!auth.user) {
      return c.json({ error: auth.error }, auth.status as 401);
    }

    await syncAuthUsersToKV();

    const usuario = await kv.get(`usuario:${auth.user.id}`);

    return c.json({
      success: true,
      user: {
        id: auth.user.id,
        nombre: usuario?.nombre || auth.user.user_metadata?.nombre || "",
        apellidos: usuario?.apellidos || auth.user.user_metadata?.apellidos || "",
        email: usuario?.email || auth.user.email || "",
        avatar: usuario?.avatar || auth.user.user_metadata?.avatar || DEFAULT_AVATAR,
        fechaRegistro: usuario?.fecha_registro || null,
      },
    });
  } catch (error) {
    console.error("Error al obtener perfil del usuario:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});

app.put("/make-server-ae96b5cd/user/profile/avatar", async (c) => {
  try {
    const auth = await getAuthenticatedUser(c);

    if (!auth.user) {
      return c.json({ error: auth.error }, auth.status as 401);
    }

    await syncAuthUsersToKV();

    const { avatar } = await c.req.json();

    if (!avatar || typeof avatar !== "string") {
      return c.json({ error: "Avatar inválido" }, 400);
    }

    const usuarioActual = await kv.get(`usuario:${auth.user.id}`);
    const { data: existingAuthUser, error: getUserError } = await supabase.auth.admin.getUserById(auth.user.id);

    if (getUserError || !existingAuthUser?.user) {
      return c.json({ error: "No se pudo obtener el usuario en Auth" }, 400);
    }

    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(auth.user.id, {
      user_metadata: {
        ...existingAuthUser.user.user_metadata,
        avatar,
      },
    });

    if (authUpdateError) {
      return c.json({ error: authUpdateError.message }, 400);
    }

    const usuarioActualizado = {
      ...usuarioActual,
      id: auth.user.id,
      email: usuarioActual?.email || auth.user.email || "",
      nombre: usuarioActual?.nombre || auth.user.user_metadata?.nombre || "",
      apellidos: usuarioActual?.apellidos || auth.user.user_metadata?.apellidos || "",
      rol: "usuario",
      avatar,
      cuidador_asignado: usuarioActual?.cuidador_asignado ?? null,
      fecha_registro:
        usuarioActual?.fecha_registro ||
        existingAuthUser.user.created_at ||
        new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
    };

    await kv.set(`usuario:${auth.user.id}`, usuarioActualizado);

    return c.json({
      success: true,
      message: "Avatar actualizado correctamente",
      user: {
        id: auth.user.id,
        nombre: usuarioActualizado.nombre,
        apellidos: usuarioActualizado.apellidos,
        email: usuarioActualizado.email,
        avatar: usuarioActualizado.avatar,
        fechaRegistro: usuarioActualizado.fecha_registro || null,
      },
    });
  } catch (error) {
    console.error("Error al actualizar avatar del usuario:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});

// ============================================
// CUIDADOR
// ============================================

app.get("/make-server-ae96b5cd/caregiver/dashboard", async (c) => {
  try {
    const guard = await requireCaregiver(c);
    if (!guard.ok) return guard.response;

    await syncAuthUsersToKV();

    const auth = guard.auth;
    const cuidador = await getRoleData(auth.user.id, "cuidador");
    const usuarios = await getAssignedUsersDetailed(auth.user.id);
    const resumen = calculateCaregiverSummary(usuarios);

    return c.json({
      success: true,
      caregiver: {
        id: auth.user.id,
        nombre: cuidador?.nombre || auth.user.user_metadata?.nombre || "",
        apellidos: cuidador?.apellidos || auth.user.user_metadata?.apellidos || "",
        email: auth.user.email,
        avatar: cuidador?.avatar || auth.user.user_metadata?.avatar || DEFAULT_AVATAR,
        especialidad: cuidador?.especialidad || auth.user.user_metadata?.especialidad || "",
        experiencia: cuidador?.experiencia || auth.user.user_metadata?.experiencia || 0,
        fechaRegistro: cuidador?.fecha_registro || null,
      },
      summary: resumen,
      usuarios,
    });
  } catch (error) {
    console.error("Error al obtener dashboard del cuidador:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});

app.get("/make-server-ae96b5cd/caregiver/profile", async (c) => {
  try {
    const guard = await requireCaregiver(c);
    if (!guard.ok) return guard.response;

    await syncAuthUsersToKV();

    const auth = guard.auth;
    const cuidador = await getRoleData(auth.user.id, "cuidador");
    const usuarios = await getAssignedUsersDetailed(auth.user.id);

    return c.json({
      success: true,
      caregiver: {
        id: auth.user.id,
        nombre: cuidador?.nombre || auth.user.user_metadata?.nombre || "",
        apellidos: cuidador?.apellidos || auth.user.user_metadata?.apellidos || "",
        email: auth.user.email,
        avatar: cuidador?.avatar || auth.user.user_metadata?.avatar || DEFAULT_AVATAR,
        especialidad: cuidador?.especialidad || auth.user.user_metadata?.especialidad || "",
        experiencia: cuidador?.experiencia || auth.user.user_metadata?.experiencia || 0,
        usuarios_asociados: usuarios.length,
        fechaRegistro: cuidador?.fecha_registro || null,
      },
      usuarios,
    });
  } catch (error) {
    console.error("Error al obtener perfil del cuidador:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});

app.put("/make-server-ae96b5cd/caregiver/profile", async (c) => {
  try {
    const guard = await requireCaregiver(c);
    if (!guard.ok) return guard.response;

    await syncAuthUsersToKV();

    const auth = guard.auth;
    const body = await c.req.json();

    const {
      nombre,
      apellidos,
      email,
      especialidad,
      experiencia,
      avatar,
    } = body;

    if (!nombre || !apellidos || !email) {
      return c.json({ error: "Nombre, apellidos y email son obligatorios" }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: "Formato de email inválido" }, 400);
    }

    const cuidadorActual = await getRoleData(auth.user.id, "cuidador");
    const { data: existingAuthUser, error: getUserError } = await supabase.auth.admin.getUserById(auth.user.id);

    if (getUserError || !existingAuthUser?.user) {
      console.error("Error obteniendo cuidador en Auth:", getUserError);
      return c.json({ error: "No se pudo obtener el cuidador en Auth" }, 400);
    }

    const experienciaNormalizada =
      typeof experiencia === "number" && !Number.isNaN(experiencia) && experiencia >= 0
        ? experiencia
        : 0;

    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(auth.user.id, {
      email,
      user_metadata: {
        ...existingAuthUser.user.user_metadata,
        nombre,
        apellidos,
        especialidad: especialidad || "",
        experiencia: experienciaNormalizada,
        avatar: avatar || cuidadorActual?.avatar || DEFAULT_AVATAR,
      },
    });

    if (authUpdateError) {
      console.error("Error actualizando cuidador en Auth:", authUpdateError);
      return c.json({ error: authUpdateError.message }, 400);
    }

    const cuidadorActualizado = {
      ...cuidadorActual,
      id: auth.user.id,
      email,
      nombre,
      apellidos,
      rol: "cuidador",
      especialidad: especialidad || "",
      experiencia: experienciaNormalizada,
      avatar: avatar || cuidadorActual?.avatar || DEFAULT_AVATAR,
      usuarios_asociados: Array.isArray(cuidadorActual?.usuarios_asociados)
        ? cuidadorActual.usuarios_asociados
        : [],
      fecha_registro:
        cuidadorActual?.fecha_registro ||
        existingAuthUser.user.created_at ||
        new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString(),
    };

    await kv.set(`cuidador:${auth.user.id}`, cuidadorActualizado);

    return c.json({
      success: true,
      message: "Perfil actualizado correctamente",
      caregiver: {
        id: auth.user.id,
        nombre,
        apellidos,
        email,
        avatar: cuidadorActualizado.avatar || DEFAULT_AVATAR,
        especialidad: especialidad || "",
        experiencia: experienciaNormalizada,
        usuarios_asociados: Array.isArray(cuidadorActualizado.usuarios_asociados)
          ? cuidadorActualizado.usuarios_asociados.length
          : 0,
        fechaRegistro: cuidadorActualizado.fecha_registro || null,
      },
    });
  } catch (error) {
    console.error("Error al actualizar perfil del cuidador:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});

app.get("/make-server-ae96b5cd/caregiver/evolution", async (c) => {
  try {
    const guard = await requireCaregiver(c);
    if (!guard.ok) return guard.response;

    await syncAuthUsersToKV();

    const auth = guard.auth;
    const usuarios = await getAssignedUsersDetailed(auth.user.id);

    const comparison = usuarios.map((usuario) => ({
      id: usuario.id,
      nombre: usuario.nombreCompleto,
      ultimaActividad: usuario.ultimaActividad,
      promedio: usuario.progreso,
      tendencia: usuario.rachaActual > 0 ? `Racha ${usuario.rachaActual}d` : "Sin racha",
      estado: usuario.activoHoy ? "Activo hoy" : usuario.ultimaActividad === "Sin actividad" ? "Sin actividad" : "Inactivo",
      juegos: usuario.totalJuegos,
      activoHoy: usuario.activoHoy,
      sesionesHoy: usuario.sesionesHoy,
      statsPorJuego: usuario.statsPorJuego,
      evolucion7Dias: calculateLast7DaysSeries(
        usuario.resultados || [],
      ),
    }));

    return c.json({
      success: true,
      usuarios: comparison,
    });
  } catch (error) {
    console.error("Error al obtener evolución del cuidador:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});

// ============================================
// GESTIÓN DE USUARIOS DEL CUIDADOR
// ============================================

async function getAssignedUserForCaregiver(cuidadorId: string, usuarioId: string) {
  const cuidador = await kv.get(`cuidador:${cuidadorId}`);
  if (!cuidador) {
    return null;
  }

  let usuario = await kv.get(`usuario:${usuarioId}`);

  if (!usuario) {
    const todosLosUsuarios = await kv.getByPrefix("usuario:");
    usuario = todosLosUsuarios.find((item: any) => item?.id === usuarioId) || null;
  }

  if (!usuario) {
    return null;
  }

  const usuariosAsociados = normalizeAssignedIds(
    Array.isArray(cuidador.usuarios_asociados) ? cuidador.usuarios_asociados : [],
  );

  const pertenecePorUsuario = usuario.cuidador_asignado === cuidadorId;
  const pertenecePorCuidador = usuariosAsociados.includes(usuarioId);

  if (!pertenecePorUsuario && !pertenecePorCuidador) {
    const usuariosDetallados = await getAssignedUsersDetailed(cuidadorId);
    const existeEnDetalle = usuariosDetallados.some((item: any) => item.id === usuarioId);
    if (!existeEnDetalle) {
      return null;
    }
  }

  if (usuario.cuidador_asignado !== cuidadorId) {
    usuario = {
      ...usuario,
      cuidador_asignado: cuidadorId,
    };
    await kv.set(`usuario:${usuarioId}`, usuario);
  }

  if (!usuariosAsociados.includes(usuarioId)) {
    await kv.set(`cuidador:${cuidadorId}`, {
      ...cuidador,
      usuarios_asociados: [...usuariosAsociados, usuarioId],
    });
  }

  return usuario;
}

app.get("/make-server-ae96b5cd/caregiver/users", async (c) => {
  try {
    const guard = await requireCaregiver(c);
    if (!guard.ok) return guard.response;

    await syncAuthUsersToKV();

    const auth = guard.auth;
    const usuarios = await getAssignedUsersDetailed(auth.user.id);

    return c.json({
      success: true,
      usuarios,
    });
  } catch (error) {
    console.error("Error al listar usuarios asignados al cuidador:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});

app.get("/make-server-ae96b5cd/caregiver/users/:id", async (c) => {
  try {
    const guard = await requireCaregiver(c);
    if (!guard.ok) return guard.response;

    await syncAuthUsersToKV();

    const auth = guard.auth;
    const usuarioId = c.req.param("id");
    const usuario = await getAssignedUserForCaregiver(auth.user.id, usuarioId);

    if (!usuario) {
      return c.json({ error: "Usuario no encontrado o no asignado a este cuidador" }, 404);
    }

    return c.json({
      success: true,
      usuario,
    });
  } catch (error) {
    console.error("Error al obtener usuario asignado:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});

app.put("/make-server-ae96b5cd/caregiver/users/:id", async (c) => {
  try {
    const guard = await requireCaregiver(c);
    if (!guard.ok) return guard.response;

    await syncAuthUsersToKV();

    const auth = guard.auth;
    const usuarioId = c.req.param("id");
    const body = await c.req.json();

    const usuarioActual = await getAssignedUserForCaregiver(auth.user.id, usuarioId);

    if (!usuarioActual) {
      return c.json({ error: "Usuario no encontrado o no asignado a este cuidador" }, 404);
    }

    const {
      nombre,
      apellidos,
      email,
      telefono,
      fecha_nacimiento,
      observaciones,
    } = body;

    if (!nombre || !apellidos || !email) {
      return c.json({ error: "Nombre, apellidos y email son obligatorios" }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: "Formato de email inválido" }, 400);
    }

    const { data: existingAuthUser, error: getUserError } = await supabase.auth.admin.getUserById(usuarioId);

    if (getUserError || !existingAuthUser?.user) {
      console.error("Error obteniendo usuario en Auth:", getUserError);
      return c.json({ error: "No se pudo obtener el usuario en Auth" }, 400);
    }

    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(usuarioId, {
      email,
      user_metadata: {
        ...existingAuthUser.user.user_metadata,
        nombre,
        apellidos,
      },
    });

    if (authUpdateError) {
      console.error("Error actualizando usuario en Auth:", authUpdateError);
      return c.json({ error: authUpdateError.message }, 400);
    }

    const usuarioActualizado = {
      ...usuarioActual,
      nombre,
      apellidos,
      email,
      telefono: telefono || "",
      fecha_nacimiento: fecha_nacimiento || "",
      observaciones: observaciones || "",
      fecha_actualizacion: new Date().toISOString(),
    };

    await kv.set(`usuario:${usuarioId}`, usuarioActualizado);

    return c.json({
      success: true,
      message: "Usuario actualizado correctamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar usuario asignado:", error);
    return c.json({ error: "Error interno del servidor" }, 500);
  }
});

Deno.serve(app.fetch);
