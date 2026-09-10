import fs from "fs";
import path from "path";
import initSqlJs, { Database, SqlJsStatic } from "sql.js";
import {
  ACTIVIDAD_SEED,
  COLEGIOS,
  LEADS,
  METRICA,
  TAREAS,
  USERS,
} from "./seed-data";
import type { ActividadItem, TareaHoy } from "./types";

const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "matricula-ops-data")
  : path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "matricula.sqlite");
const WASM_PATH = path.join(
  process.cwd(),
  "node_modules",
  "sql.js",
  "dist",
  "sql-wasm.wasm"
);

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function persist() {
  if (!db) return;
  ensureDir();
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function getSql(): Promise<SqlJsStatic> {
  if (SQL) return SQL;
  const wasmBinary = fs.readFileSync(WASM_PATH);
  SQL = await initSqlJs({ wasmBinary });
  return SQL;
}

function createSchema(database: Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL,
      rol TEXT NOT NULL,
      activo INTEGER NOT NULL,
      createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS colegios (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      ciudadZona TEXT NOT NULL,
      programasFoco TEXT NOT NULL,
      contactoPreferido TEXT NOT NULL,
      notas TEXT,
      ultimoContactoAt TEXT
    );
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      colegioId TEXT NOT NULL,
      nombre TEXT NOT NULL,
      cargo TEXT NOT NULL,
      email TEXT,
      telefonoWa TEXT,
      etapaFunnel TEXT NOT NULL,
      programaInteres TEXT,
      tags TEXT,
      createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tareas_hoy (
      id TEXT PRIMARY KEY,
      fecha TEXT NOT NULL,
      orden INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      canal TEXT NOT NULL,
      titulo TEXT NOT NULL,
      programaFoco TEXT NOT NULL,
      dest TEXT NOT NULL,
      asunto TEXT,
      cuerpo TEXT NOT NULL,
      estado TEXT NOT NULL,
      creadoPorAgente TEXT NOT NULL,
      aprobadaPorUserId TEXT,
      enviadaAt TEXT,
      acciones TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS envios (
      id TEXT PRIMARY KEY,
      tareaHoyId TEXT NOT NULL,
      canal TEXT NOT NULL,
      destinatario TEXT NOT NULL,
      payload TEXT NOT NULL,
      estado TEXT NOT NULL,
      enviadoPorUserId TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS actividad (
      id TEXT PRIMARY KEY,
      time TEXT NOT NULL,
      actor TEXT NOT NULL,
      text TEXT NOT NULL,
      kind TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS metrica_diaria (
      fecha TEXT PRIMARY KEY,
      colegiosContactados INTEGER,
      respuestas INTEGER,
      visitasAgendadas INTEGER,
      visitasRealizadas INTEGER,
      inscritos INTEGER,
      matriculas INTEGER,
      ingresoProyectadoCop REAL,
      notasAgente TEXT
    );
  `);
}

function seed(database: Database) {
  const count = database.exec("SELECT COUNT(*) as c FROM users");
  const n = count[0]?.values[0]?.[0] as number;
  if (n > 0) return;

  for (const u of USERS) {
    database.run(
      `INSERT INTO users (id,nombre,email,rol,activo,createdAt) VALUES (?,?,?,?,?,?)`,
      [u.id, u.nombre, u.email, u.rol, u.activo, u.createdAt]
    );
  }

  for (const c of COLEGIOS) {
    database.run(
      `INSERT INTO colegios (id,nombre,ciudadZona,programasFoco,contactoPreferido,notas,ultimoContactoAt) VALUES (?,?,?,?,?,?,?)`,
      [
        c.id,
        c.nombre,
        c.ciudadZona,
        c.programasFoco,
        c.contactoPreferido,
        c.notas,
        c.ultimoContactoAt,
      ]
    );
  }

  for (const l of LEADS) {
    database.run(
      `INSERT INTO leads (id,colegioId,nombre,cargo,email,telefonoWa,etapaFunnel,programaInteres,tags,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [
        l.id,
        l.colegioId,
        l.nombre,
        l.cargo,
        l.email,
        l.telefonoWa,
        l.etapaFunnel,
        l.programaInteres,
        l.tags,
        l.createdAt,
      ]
    );
  }

  for (const t of TAREAS) {
    database.run(
      `INSERT INTO tareas_hoy (id,fecha,orden,tipo,canal,titulo,programaFoco,dest,asunto,cuerpo,estado,creadoPorAgente,aprobadaPorUserId,enviadaAt,acciones) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        t.id,
        t.fecha,
        t.orden,
        t.tipo,
        t.canal,
        t.titulo,
        t.programaFoco,
        t.dest,
        t.asunto,
        t.cuerpo,
        t.estado,
        t.creadoPorAgente,
        t.aprobadaPorUserId,
        t.enviadaAt,
        t.acciones,
      ]
    );
  }

  for (const a of ACTIVIDAD_SEED) {
    database.run(
      `INSERT INTO actividad (id,time,actor,text,kind,createdAt) VALUES (?,?,?,?,?,?)`,
      [a.id, a.time, a.actor, a.text, a.kind, a.createdAt]
    );
  }

  database.run(
    `INSERT INTO metrica_diaria (fecha,colegiosContactados,respuestas,visitasAgendadas,visitasRealizadas,inscritos,matriculas,ingresoProyectadoCop,notasAgente) VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      METRICA.fecha,
      METRICA.colegiosContactados,
      METRICA.respuestas,
      METRICA.visitasAgendadas,
      METRICA.visitasRealizadas,
      METRICA.inscritos,
      METRICA.matriculas,
      METRICA.ingresoProyectadoCop,
      METRICA.notasAgente,
    ]
  );

  persist();
}

export async function getDb(): Promise<Database> {
  if (db) return db;
  ensureDir();
  const sql = await getSql();
  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    db = new sql.Database(buf);
  } else {
    db = new sql.Database();
  }
  createSchema(db);
  seed(db);
  persist();
  return db;
}

export async function resetDb() {
  if (db) {
    db.close();
    db = null;
  }
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
  await getDb();
}

function rowToTarea(row: Record<string, unknown>): TareaHoy {
  return {
    id: String(row.id),
    fecha: String(row.fecha),
    orden: Number(row.orden),
    tipo: row.tipo as TareaHoy["tipo"],
    canal: row.canal as TareaHoy["canal"],
    titulo: String(row.titulo),
    programaFoco: String(row.programaFoco),
    dest: String(row.dest),
    asunto: String(row.asunto || ""),
    cuerpo: String(row.cuerpo),
    estado: row.estado as TareaHoy["estado"],
    creadoPorAgente: String(row.creadoPorAgente),
    aprobadaPorUserId: row.aprobadaPorUserId
      ? String(row.aprobadaPorUserId)
      : null,
    enviadaAt: row.enviadaAt ? String(row.enviadaAt) : null,
    acciones: JSON.parse(String(row.acciones || "[]")),
  };
}

function queryAll(database: Database, sql: string, params: unknown[] = []) {
  const stmt = database.prepare(sql);
  stmt.bind(params as never[]);
  const rows: Record<string, unknown>[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as Record<string, unknown>);
  }
  stmt.free();
  return rows;
}

export async function listTareas(): Promise<TareaHoy[]> {
  const database = await getDb();
  const rows = queryAll(
    database,
    "SELECT * FROM tareas_hoy ORDER BY orden ASC"
  );
  return rows.map(rowToTarea);
}

export async function getTarea(id: string): Promise<TareaHoy | null> {
  const database = await getDb();
  const rows = queryAll(database, "SELECT * FROM tareas_hoy WHERE id = ?", [
    id,
  ]);
  return rows[0] ? rowToTarea(rows[0]) : null;
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
  const database = await getDb();
  const current = await getTarea(id);
  if (!current) return null;
  const next = { ...current, ...patch };
  database.run(
    `UPDATE tareas_hoy SET estado=?, asunto=?, cuerpo=?, aprobadaPorUserId=?, enviadaAt=? WHERE id=?`,
    [
      next.estado,
      next.asunto,
      next.cuerpo,
      next.aprobadaPorUserId,
      next.enviadaAt,
      id,
    ]
  );
  persist();
  return getTarea(id);
}

export async function listActividad(
  kind?: "agente" | "human" | "all"
): Promise<ActividadItem[]> {
  const database = await getDb();
  let rows: Record<string, unknown>[];
  if (kind && kind !== "all") {
    rows = queryAll(
      database,
      "SELECT * FROM actividad WHERE kind = ? ORDER BY createdAt DESC",
      [kind]
    );
  } else {
    rows = queryAll(
      database,
      "SELECT * FROM actividad ORDER BY createdAt DESC"
    );
  }
  return rows.map((r) => ({
    id: String(r.id),
    time: String(r.time),
    actor: String(r.actor),
    text: String(r.text),
    kind: r.kind as "agente" | "human",
    createdAt: String(r.createdAt),
  }));
}

export async function pushActividad(item: Omit<ActividadItem, "id"> & { id?: string }) {
  const database = await getDb();
  const id = item.id || `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  database.run(
    `INSERT INTO actividad (id,time,actor,text,kind,createdAt) VALUES (?,?,?,?,?,?)`,
    [id, item.time, item.actor, item.text, item.kind, item.createdAt]
  );
  persist();
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
  const database = await getDb();
  database.run(
    `INSERT INTO envios (id,tareaHoyId,canal,destinatario,payload,estado,enviadoPorUserId,createdAt) VALUES (?,?,?,?,?,?,?,?)`,
    [
      envio.id,
      envio.tareaHoyId,
      envio.canal,
      envio.destinatario,
      envio.payload,
      envio.estado,
      envio.enviadoPorUserId,
      envio.createdAt,
    ]
  );
  persist();
}

export async function getMetricas() {
  const database = await getDb();
  const rows = queryAll(
    database,
    "SELECT * FROM metrica_diaria ORDER BY fecha DESC LIMIT 1"
  );
  return rows[0] || null;
}

export async function updateLeadEtapa(colegioHint: string, etapa: string) {
  const database = await getDb();
  // Best-effort: update first lead matching dest context via colegio name fragment
  const leads = queryAll(database, "SELECT * FROM leads");
  const match = leads.find((l) =>
    String(l.nombre).toLowerCase().includes(colegioHint.toLowerCase().slice(0, 8))
  );
  if (match) {
    database.run(`UPDATE leads SET etapaFunnel = ? WHERE id = ?`, [
      etapa,
      match.id,
    ]);
    persist();
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
