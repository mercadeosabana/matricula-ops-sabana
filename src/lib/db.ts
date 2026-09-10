import fs from "fs";
import path from "path";
import {
  ACTIVIDAD_SEED,
  COLEGIOS,
  LEADS,
  METRICA,
  TAREAS,
  USERS,
} from "./seed-data";
import type {
  ActividadItem,
  Colegio,
  Envio,
  Lead,
  MetricaDiaria,
  TareaHoy,
  User,
} from "./types";

const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "matricula-ops-data")
  : path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

type Store = {
  users: User[];
  colegios: Colegio[];
  leads: Lead[];
  tareas: TareaHoy[];
  envios: Envio[];
  actividad: ActividadItem[];
  metricas: MetricaDiaria[];
};

let cache: Store | null = null;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function parseJsonArray(value: string | string[]): string[] {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function seedStore(): Store {
  return {
    users: USERS.map((u) => ({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      activo: Boolean(u.activo),
      createdAt: u.createdAt,
    })),
    colegios: COLEGIOS.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      ciudadZona: c.ciudadZona,
      programasFoco: parseJsonArray(c.programasFoco),
      contactoPreferido: c.contactoPreferido as Colegio["contactoPreferido"],
      notas: c.notas,
      ultimoContactoAt: c.ultimoContactoAt,
    })),
    leads: LEADS.map((l) => ({
      id: l.id,
      colegioId: l.colegioId,
      nombre: l.nombre,
      cargo: l.cargo,
      email: l.email,
      telefonoWa: l.telefonoWa,
      etapaFunnel: l.etapaFunnel,
      programaInteres: l.programaInteres,
      tags: parseJsonArray(l.tags),
      createdAt: l.createdAt,
    })),
    tareas: TAREAS.map((t) => ({
      id: t.id,
      fecha: t.fecha,
      orden: t.orden,
      tipo: t.tipo as TareaHoy["tipo"],
      canal: t.canal as TareaHoy["canal"],
      titulo: t.titulo,
      programaFoco: t.programaFoco,
      dest: t.dest,
      asunto: t.asunto,
      cuerpo: t.cuerpo,
      estado: t.estado as TareaHoy["estado"],
      creadoPorAgente: t.creadoPorAgente,
      aprobadaPorUserId: t.aprobadaPorUserId,
      enviadaAt: t.enviadaAt,
      acciones: parseJsonArray(t.acciones),
    })),
    envios: [],
    actividad: ACTIVIDAD_SEED.map((a) => ({
      id: a.id,
      time: a.time,
      actor: a.actor,
      text: a.text,
      kind: a.kind as ActividadItem["kind"],
      createdAt: a.createdAt,
    })),
    metricas: [
      {
        fecha: METRICA.fecha,
        colegiosContactados: METRICA.colegiosContactados,
        respuestas: METRICA.respuestas,
        visitasAgendadas: METRICA.visitasAgendadas,
        visitasRealizadas: METRICA.visitasRealizadas,
        inscritos: METRICA.inscritos,
        matriculas: METRICA.matriculas,
        ingresoProyectadoCop: METRICA.ingresoProyectadoCop,
        notasAgente: METRICA.notasAgente,
      },
    ],
  };
}

function persist(store: Store) {
  ensureDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function loadStore(): Store {
  if (cache) return cache;
  ensureDir();
  if (fs.existsSync(STORE_PATH)) {
    try {
      const raw = fs.readFileSync(STORE_PATH, "utf8");
      const parsed = JSON.parse(raw) as Store;
      if (
        parsed &&
        Array.isArray(parsed.tareas) &&
        Array.isArray(parsed.actividad) &&
        Array.isArray(parsed.metricas)
      ) {
        cache = parsed;
        return cache;
      }
    } catch {
      // fall through to seed
    }
  }
  cache = seedStore();
  persist(cache);
  return cache;
}

function saveStore(store: Store) {
  cache = store;
  persist(store);
}

export async function resetDb() {
  cache = null;
  if (fs.existsSync(STORE_PATH)) fs.unlinkSync(STORE_PATH);
  // also clean legacy sqlite if present
  const legacySqlite = path.join(DATA_DIR, "matricula.sqlite");
  if (fs.existsSync(legacySqlite)) {
    try {
      fs.unlinkSync(legacySqlite);
    } catch {
      // ignore
    }
  }
  loadStore();
}

export async function listTareas(): Promise<TareaHoy[]> {
  const store = loadStore();
  return [...store.tareas].sort((a, b) => a.orden - b.orden);
}

export async function getTarea(id: string): Promise<TareaHoy | null> {
  const store = loadStore();
  return store.tareas.find((t) => t.id === id) ?? null;
}

export async function updateTarea(
  id: string,
  patch: Partial<{
    estado: string;
    asunto: string;
    cuerpo: string;
    aprobadaPorUserId: string | null;
    enviadaAt: string | null;
  }>
): Promise<TareaHoy | null> {
  const store = loadStore();
  const idx = store.tareas.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  const current = store.tareas[idx];
  const next: TareaHoy = {
    ...current,
    ...(patch.estado !== undefined
      ? { estado: patch.estado as TareaHoy["estado"] }
      : {}),
    ...(patch.asunto !== undefined ? { asunto: patch.asunto } : {}),
    ...(patch.cuerpo !== undefined ? { cuerpo: patch.cuerpo } : {}),
    ...(patch.aprobadaPorUserId !== undefined
      ? { aprobadaPorUserId: patch.aprobadaPorUserId }
      : {}),
    ...(patch.enviadaAt !== undefined ? { enviadaAt: patch.enviadaAt } : {}),
  };
  store.tareas[idx] = next;
  saveStore(store);
  return next;
}

export async function listActividad(
  kind?: "agente" | "human" | "all"
): Promise<ActividadItem[]> {
  const store = loadStore();
  let items = [...store.actividad];
  if (kind && kind !== "all") {
    items = items.filter((a) => a.kind === kind);
  }
  return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function pushActividad(
  item: Omit<ActividadItem, "id"> & { id?: string }
) {
  const store = loadStore();
  const id =
    item.id || `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  store.actividad.unshift({
    id,
    time: item.time,
    actor: item.actor,
    text: item.text,
    kind: item.kind,
    createdAt: item.createdAt,
  });
  saveStore(store);
  return id;
}

export async function createEnvio(envio: {
  id: string;
  tareaHoyId: string;
  canal: string;
  destinatario: string;
  payload: string;
  estado: string;
  enviadoPorUserId: string;
  createdAt: string;
}) {
  const store = loadStore();
  store.envios.push({
    id: envio.id,
    tareaHoyId: envio.tareaHoyId,
    canal: envio.canal,
    destinatario: envio.destinatario,
    payload: envio.payload,
    estado: envio.estado as Envio["estado"],
    enviadoPorUserId: envio.enviadoPorUserId,
    createdAt: envio.createdAt,
  });
  saveStore(store);
}

export async function getMetricas() {
  const store = loadStore();
  if (!store.metricas.length) return null;
  const sorted = [...store.metricas].sort((a, b) =>
    a.fecha < b.fecha ? 1 : -1
  );
  return sorted[0] || null;
}

export async function updateLeadEtapa(colegioHint: string, etapa: string) {
  const store = loadStore();
  const hint = colegioHint.toLowerCase().slice(0, 8);
  const match = store.leads.find((l) =>
    l.nombre.toLowerCase().includes(hint)
  );
  if (match) {
    match.etapaFunnel = etapa;
    saveStore(store);
  }
}

export function bogotaNow() {
  const d = new Date();
  const time = d.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Bogota",
  });
  const iso = d.toISOString();
  return { time, iso };
}

export function hasUnresolvedConfirm(text: string) {
  return /\[CONFIRMAR:[^\]]*\]/.test(text || "");
}
