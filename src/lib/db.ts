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
import { audienciaDeTarea } from "./market-story";
import { hashDemoPassword, hashPassword } from "./passwords";
import { randomUUID } from "crypto";
import type {
  ActividadItem,
  AgendaEvent,
  Colegio,
  Envio,
  Lead,
  MetasCohorte,
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
  agendaEvents: AgendaEvent[];
  metasCohorte: MetasCohorte;
};

export const PROGRAMAS_META_CANONICOS = [
  "Maestría en Educación",
  "Maestría en Pedagogía",
  "Maestría en Dirección y Gestión",
  "Maestría en Desarrollo Infantil",
] as const;

function normalizeProgramaMeta(raw: Partial<MetasCohorte["programas"][number]> & { programa?: string }): MetasCohorte["programas"][number] {
  const ingresos =
    raw.metaIngresosCop === null || raw.metaIngresosCop === undefined
      ? null
      : Math.max(0, Math.round(Number(raw.metaIngresosCop) || 0));
  const cupos =
    raw.cuposEquilibrio === null || raw.cuposEquilibrio === undefined
      ? null
      : Math.max(0, Math.round(Number(raw.cuposEquilibrio) || 0));
  return {
    programa: String(raw.programa || "").trim(),
    metaInscritos: Math.max(0, Math.round(Number(raw.metaInscritos) || 0)),
    metaIngresosCop: ingresos,
    cuposEquilibrio: cupos,
  };
}

/** Asegura las 4 maestrías en orden canónico (merge por nombre flexible). */
export function ensureCuatroProgramas(
  programas: MetasCohorte["programas"] | undefined | null
): MetasCohorte["programas"] {
  const defaults: Record<string, MetasCohorte["programas"][number]> = {
    "Maestría en Educación": {
      programa: "Maestría en Educación",
      metaInscritos: 20,
      metaIngresosCop: null,
      cuposEquilibrio: 10,
    },
    "Maestría en Pedagogía": {
      programa: "Maestría en Pedagogía",
      metaInscritos: 20,
      metaIngresosCop: null,
      cuposEquilibrio: 10,
    },
    "Maestría en Dirección y Gestión": {
      programa: "Maestría en Dirección y Gestión",
      metaInscritos: 20,
      metaIngresosCop: null,
      cuposEquilibrio: 10,
    },
    "Maestría en Desarrollo Infantil": {
      programa: "Maestría en Desarrollo Infantil",
      metaInscritos: 20,
      metaIngresosCop: null,
      cuposEquilibrio: 10,
    },
  };

  const byKey = new Map<string, MetasCohorte["programas"][number]>();
  for (const pr of programas || []) {
    const n = normalizeProgramaMeta(pr);
    const key = n.programa.toLowerCase();
    byKey.set(key, n);
    // aliases from older seeds
    if (key.includes("pedagog")) byKey.set("maestría en pedagogía", n);
    if (key.includes("dirección") || key.includes("direccion") || key.includes("gestión") || key.includes("gestion"))
      byKey.set("maestría en dirección y gestión", { ...n, programa: "Maestría en Dirección y Gestión" });
    if (key.includes("desarrollo infantil") || key === "di")
      byKey.set("maestría en desarrollo infantil", { ...n, programa: "Maestría en Desarrollo Infantil" });
    if (key.includes("educación") || key.includes("educacion"))
      byKey.set("maestría en educación", { ...n, programa: "Maestría en Educación" });
  }

  return PROGRAMAS_META_CANONICOS.map((nombre) => {
    const found = byKey.get(nombre.toLowerCase());
    if (found) {
      return {
        ...defaults[nombre],
        ...normalizeProgramaMeta({ ...found, programa: nombre }),
        programa: nombre,
      };
    }
    return defaults[nombre];
  });
}

export function defaultMetasCohorte(): MetasCohorte {
  return {
    cohorte: "2027-1",
    programas: ensureCuatroProgramas(null),
    fechaCierreCohorte: "2026-10-26",
    updatedAt: null,
    updatedByName: null,
    updatedByUserId: null,
  };
}

export function totalesMetas(metas: MetasCohorte) {
  const metaInscritosTotal = metas.programas.reduce(
    (s, p) => s + (p.metaInscritos || 0),
    0
  );
  const metaIngresosCop = metas.programas.reduce(
    (s, p) => s + (p.metaIngresosCop || 0),
    0
  );
  const puntoEquilibrioCupos = metas.programas.reduce(
    (s, p) => s + (p.cuposEquilibrio || 0),
    0
  );
  return { metaInscritosTotal, metaIngresosCop, puntoEquilibrioCupos };
}

let cache: Store | null = null;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}


function mapLeadFromSeed(l: (typeof LEADS)[number]): Lead {
  const extended = l as typeof l & {
    owner?: string;
    nextTouch?: string | null;
    canalOrigen?: string;
    opened?: boolean;
    visitado?: boolean;
    postVisita?: Lead["postVisita"];
  };
  const pv = extended.postVisita;
  return {
    id: l.id,
    colegioId: l.colegioId,
    nombre: l.nombre,
    cargo: l.cargo,
    email: l.email,
    telefonoWa: l.telefonoWa,
    etapaFunnel: l.etapaFunnel,
    programaInteres: l.programaInteres,
    tags: parseJsonArray(l.tags as string | string[]),
    createdAt: l.createdAt,
    owner: extended.owner || "Laura Natalia",
    nextTouch: extended.nextTouch ?? null,
    canalOrigen: extended.canalOrigen || "email",
    opened: Boolean(extended.opened),
    visitado: Boolean(extended.visitado),
    postVisita: pv
      ? {
          docs: Boolean(pv.docs),
          pago: Boolean(pv.pago),
          beca: Boolean(pv.beca),
          reminderD1: Boolean(pv.reminderD1),
          reminderD3: Boolean(pv.reminderD3),
          visitaAt: pv.visitaAt ?? null,
          notas: pv.notas || "",
        }
      : null,
  };
}

function normalizeLead(raw: Partial<Lead> & { id: string }): Lead {
  return {
    id: raw.id,
    colegioId: raw.colegioId || "",
    nombre: raw.nombre || "",
    cargo: raw.cargo || "",
    email: raw.email ?? null,
    telefonoWa: raw.telefonoWa ?? null,
    etapaFunnel: raw.etapaFunnel || "contacto",
    programaInteres: raw.programaInteres ?? null,
    tags: Array.isArray(raw.tags)
      ? raw.tags
      : parseJsonArray((raw.tags as unknown as string) || "[]"),
    createdAt: raw.createdAt || new Date().toISOString(),
    owner: raw.owner || "Laura Natalia",
    nextTouch: raw.nextTouch ?? null,
    canalOrigen: raw.canalOrigen || "email",
    opened: Boolean(raw.opened),
    visitado: Boolean(raw.visitado),
    postVisita: raw.postVisita
      ? {
          docs: Boolean(raw.postVisita.docs),
          pago: Boolean(raw.postVisita.pago),
          beca: Boolean(raw.postVisita.beca),
          reminderD1: Boolean(raw.postVisita.reminderD1),
          reminderD3: Boolean(raw.postVisita.reminderD3),
          visitaAt: raw.postVisita.visitaAt ?? null,
          notas: raw.postVisita.notas || "",
        }
      : null,
  };
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
    users: USERS.map((u) => {
      const row = u as typeof u & { displayName?: string };
      return {
        id: u.id,
        nombre: u.nombre,
        displayName: row.displayName || u.nombre,
        email: u.email.toLowerCase(),
        rol: u.rol,
        activo: Boolean(u.activo),
        passwordHash: hashDemoPassword(),
        createdAt: u.createdAt,
      };
    }),
    colegios: COLEGIOS.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      ciudadZona: c.ciudadZona,
      programasFoco: parseJsonArray(c.programasFoco),
      contactoPreferido: c.contactoPreferido as Colegio["contactoPreferido"],
      notas: c.notas,
      ultimoContactoAt: c.ultimoContactoAt,
    })),
    leads: LEADS.map((l) => mapLeadFromSeed(l)),
    tareas: TAREAS.map((t) => {
      const row = t as typeof t & { audiencia?: TareaHoy["audiencia"] };
      return {
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
        audiencia: audienciaDeTarea({
          audiencia: row.audiencia,
          canal: t.canal,
          tipo: t.tipo,
        }),
      };
    }),
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
    agendaEvents: [],
    metasCohorte: defaultMetasCohorte(),
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
        // Keep persona names in sync with seed
        // audiencia backfill for older store.json
        if (Array.isArray(parsed.tareas)) {
          parsed.tareas = parsed.tareas.map((t) => ({
            ...t,
            audiencia: audienciaDeTarea(t),
          }));
        }
        if (Array.isArray(parsed.users)) {
          const byId = new Map(USERS.map((u) => [u.id, u]));
          parsed.users = parsed.users.map((u) => {
            const seed = byId.get(u.id);
            const base = {
              ...u,
              displayName: u.displayName || u.nombre,
              email: (u.email || "").toLowerCase(),
              activo: u.activo !== false,
              passwordHash: u.passwordHash || hashDemoPassword(),
            };
            if (!seed) return base as User;
            return {
              ...base,
              // keep displayName if customized; sync email/rol from seed personas
              nombre: u.nombre || seed.nombre,
              displayName: u.displayName || u.nombre || seed.nombre,
              email: (u.email || seed.email).toLowerCase(),
              rol: seed.rol,
              passwordHash: u.passwordHash || hashDemoPassword(),
            } as User;
          });
          // Ensure seed personas exist
          for (const seed of USERS) {
            if (!parsed.users.some((u) => u.id === seed.id)) {
              const row = seed as typeof seed & { displayName?: string };
              parsed.users.push({
                id: seed.id,
                nombre: seed.nombre,
                displayName: row.displayName || seed.nombre,
                email: seed.email.toLowerCase(),
                rol: seed.rol,
                activo: Boolean(seed.activo),
                passwordHash: hashDemoPassword(),
                createdAt: seed.createdAt,
              });
            }
          }
        }
        // Refresh colegios/leads from seed when demo CRM expanded
        if (
          !Array.isArray(parsed.leads) ||
          parsed.leads.length < LEADS.length ||
          parsed.leads.some((l) => l.owner === undefined)
        ) {
          parsed.colegios = COLEGIOS.map((c) => ({
            id: c.id,
            nombre: c.nombre,
            ciudadZona: c.ciudadZona,
            programasFoco: parseJsonArray(c.programasFoco),
            contactoPreferido: c.contactoPreferido as Colegio["contactoPreferido"],
            notas: c.notas,
            ultimoContactoAt: c.ultimoContactoAt,
          }));
          parsed.leads = LEADS.map((l) => mapLeadFromSeed(l));
        } else {
          parsed.leads = parsed.leads.map((l) => normalizeLead(l));
        }
        if (!Array.isArray(parsed.agendaEvents)) {
          parsed.agendaEvents = [];
        }
        if (
          !parsed.metasCohorte ||
          !Array.isArray(parsed.metasCohorte.programas)
        ) {
          parsed.metasCohorte = defaultMetasCohorte();
        } else {
          const d = defaultMetasCohorte();
          parsed.metasCohorte = {
            cohorte: parsed.metasCohorte.cohorte || d.cohorte,
            programas: ensureCuatroProgramas(parsed.metasCohorte.programas),
            fechaCierreCohorte:
              parsed.metasCohorte.fechaCierreCohorte ||
              d.fechaCierreCohorte,
            updatedAt: parsed.metasCohorte.updatedAt ?? null,
            updatedByName: parsed.metasCohorte.updatedByName ?? null,
            updatedByUserId: parsed.metasCohorte.updatedByUserId ?? null,
          };
        }
        cache = parsed;
        persist(cache);
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


export async function listColegios(): Promise<Colegio[]> {
  const store = loadStore();
  return [...store.colegios].sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function listLeads(): Promise<Lead[]> {
  const store = loadStore();
  return store.leads.map((l) => normalizeLead(l));
}

export async function getLead(id: string): Promise<Lead | null> {
  const store = loadStore();
  const lead = store.leads.find((l) => l.id === id);
  return lead ? normalizeLead(lead) : null;
}

export async function updateLead(
  id: string,
  patch: Partial<Lead>
): Promise<Lead | null> {
  const store = loadStore();
  const idx = store.leads.findIndex((l) => l.id === id);
  if (idx < 0) return null;
  const next = normalizeLead({ ...store.leads[idx], ...patch, id });
  store.leads[idx] = next;
  saveStore(store);
  return next;
}

export async function updatePostVisita(
  id: string,
  checklist: NonNullable<Lead["postVisita"]>
): Promise<Lead | null> {
  return updateLead(id, { postVisita: checklist, etapaFunnel: "post-visita", visitado: true });
}


export async function listAgendaEvents(): Promise<AgendaEvent[]> {
  const store = loadStore();
  return [...(store.agendaEvents || [])].sort((a, b) =>
    a.startIso < b.startIso ? -1 : 1
  );
}

export async function createAgendaEvent(
  event: Omit<AgendaEvent, "id"> & { id?: string }
): Promise<AgendaEvent> {
  const store = loadStore();
  if (!store.agendaEvents) store.agendaEvents = [];
  const id =
    event.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const row: AgendaEvent = {
    id,
    subject: event.subject,
    startIso: event.startIso,
    endIso: event.endIso,
    location: event.location,
    attendeeEmail: event.attendeeEmail ?? null,
    attendeeName: event.attendeeName ?? null,
    tareaHoyId: event.tareaHoyId ?? null,
    mode: event.mode,
    graphEventId: event.graphEventId ?? null,
    webLink: event.webLink ?? null,
    createdAt: event.createdAt,
    createdBy: event.createdBy,
  };
  store.agendaEvents.unshift(row);
  saveStore(store);
  return row;
}

export async function findLeadEmailForDest(dest: string): Promise<{
  email: string | null;
  nombre: string | null;
}> {
  const store = loadStore();
  const lower = (dest || "").toLowerCase();
  const emailMatch = dest.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (emailMatch) {
    return { email: emailMatch[0], nombre: null };
  }
  for (const lead of store.leads) {
    if (!lead.email) continue;
    const col = store.colegios.find((c) => c.id === lead.colegioId);
    if (col && lower.includes(col.nombre.toLowerCase().slice(0, 8))) {
      return { email: lead.email, nombre: lead.nombre };
    }
    if (lower.includes(lead.nombre.toLowerCase().slice(0, 8))) {
      return { email: lead.email, nombre: lead.nombre };
    }
  }
  return { email: null, nombre: null };
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

export function publicUser(u: User) {
  return {
    id: u.id,
    nombre: u.nombre,
    displayName: u.displayName || u.nombre,
    email: u.email,
    rol: u.rol,
    activo: u.activo,
    createdAt: u.createdAt,
  };
}

export async function listUsers(): Promise<ReturnType<typeof publicUser>[]> {
  const store = loadStore();
  return store.users.map(publicUser);
}

export async function findUserById(id: string): Promise<User | null> {
  const store = loadStore();
  return store.users.find((u) => u.id === id) ?? null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const store = loadStore();
  const e = email.trim().toLowerCase();
  return store.users.find((u) => u.email.toLowerCase() === e) ?? null;
}

export async function createUser(input: {
  nombre: string;
  email: string;
  rol: User["rol"];
  tempPassword: string;
}): Promise<ReturnType<typeof publicUser> | { error: string }> {
  const store = loadStore();
  const email = input.email.trim().toLowerCase();
  if (!input.nombre.trim() || !email || !input.tempPassword) {
    return { error: "Nombre, correo y contraseña temporal son obligatorios" };
  }
  if (store.users.some((u) => u.email.toLowerCase() === email)) {
    return { error: "Ya existe un usuario con ese correo" };
  }
  const user: User = {
    id: `u-${randomUUID().slice(0, 8)}`,
    nombre: input.nombre.trim(),
    displayName: input.nombre.trim(),
    email,
    rol: input.rol,
    activo: true,
    passwordHash: hashPassword(input.tempPassword),
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  saveStore(store);
  return publicUser(user);
}

export async function setUserActive(
  id: string,
  activo: boolean
): Promise<ReturnType<typeof publicUser> | null> {
  const store = loadStore();
  const idx = store.users.findIndex((u) => u.id === id);
  if (idx < 0) return null;
  store.users[idx] = { ...store.users[idx], activo };
  saveStore(store);
  return publicUser(store.users[idx]);
}

export async function resetUserPassword(
  id: string,
  tempPassword: string
): Promise<ReturnType<typeof publicUser> | null> {
  const store = loadStore();
  const idx = store.users.findIndex((u) => u.id === id);
  if (idx < 0) return null;
  store.users[idx] = {
    ...store.users[idx],
    passwordHash: hashPassword(tempPassword),
  };
  saveStore(store);
  return publicUser(store.users[idx]);
}

/** Pasa leads pendientes (owner) de un mercadeo a otro. No toca historial de actividad. */
export async function reassignPendingOwnership(opts: {
  fromUserId: string;
  toUserId: string;
}): Promise<{ leadsMoved: number; fromName: string; toName: string }> {
  const store = loadStore();
  const from = store.users.find((u) => u.id === opts.fromUserId);
  const to = store.users.find((u) => u.id === opts.toUserId);
  if (!from || !to) {
    return { leadsMoved: 0, fromName: "", toName: "" };
  }
  const fromNames = new Set(
    [from.nombre, from.displayName].filter(Boolean).map((s) => s.trim())
  );
  let leadsMoved = 0;
  store.leads = store.leads.map((l) => {
    if (fromNames.has((l.owner || "").trim())) {
      leadsMoved += 1;
      return { ...l, owner: to.displayName || to.nombre };
    }
    return l;
  });
  saveStore(store);
  return {
    leadsMoved,
    fromName: from.displayName || from.nombre,
    toName: to.displayName || to.nombre,
  };
}


export async function getMetasCohorte(): Promise<MetasCohorte> {
  const store = loadStore();
  if (!store.metasCohorte) {
    store.metasCohorte = defaultMetasCohorte();
    saveStore(store);
  } else {
    const fixed = {
      ...store.metasCohorte,
      programas: ensureCuatroProgramas(store.metasCohorte.programas),
    };
    store.metasCohorte = fixed;
  }
  return {
    ...store.metasCohorte,
    programas: store.metasCohorte.programas.map((p) => ({ ...p })),
  };
}

export async function updateMetasCohorte(
  patch: {
    programas?: {
      programa: string;
      metaInscritos: number;
      metaIngresosCop?: number | null;
      cuposEquilibrio?: number | null;
    }[];
    fechaCierreCohorte?: string;
    cohorte?: string;
  },
  actor: { id: string; displayName: string }
): Promise<MetasCohorte> {
  const store = loadStore();
  const current = store.metasCohorte || defaultMetasCohorte();
  const next: MetasCohorte = {
    cohorte: patch.cohorte?.trim() || current.cohorte,
    programas: ensureCuatroProgramas(
      patch.programas
        ? patch.programas.map((pr) => normalizeProgramaMeta(pr))
        : current.programas
    ),
    fechaCierreCohorte:
      patch.fechaCierreCohorte?.trim() || current.fechaCierreCohorte,
    updatedAt: new Date().toISOString(),
    updatedByName: actor.displayName,
    updatedByUserId: actor.id,
  };
  store.metasCohorte = next;
  saveStore(store);
  return next;
}
