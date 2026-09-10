export type Rol = "mercadeo" | "direccion";

export type Audiencia = "financiador" | "estudiante";

export type Canal =
  | "email"
  | "whatsapp"
  | "telefono"
  | "email_wa"
  | "linkedin"
  | "visita"
  | "region";

export type EstadoTarea =
  | "pendiente"
  | "aprobada"
  | "editada"
  | "enviada"
  | "agendada"
  | "descartada";

export type TipoTarea =
  | "email_frio"
  | "wa_followup"
  | "email_segmento"
  | "guion_llamada"
  | "llamada"
  | "invitacion_visita"
  | "secuencia_d"
  | "wa_programa"
  | "linkedin_borrador"
  | "carta_secretaria"
  | "convenio_region";

export type EstadoEnvio =
  | "queued"
  | "sent_mock"
  | "sent"
  | "failed"
  | "blocked_stub"
  | "demo";

export interface User {
  id: string;
  nombre: string;
  /** Alias visible en UI (mismo que nombre por defecto) */
  displayName: string;
  email: string;
  rol: Rol;
  activo: boolean;
  /** scrypt salt:hash — nunca devolver al cliente */
  passwordHash: string;
  createdAt: string;
}

export interface Colegio {
  id: string;
  nombre: string;
  ciudadZona: string;
  programasFoco: string[];
  contactoPreferido: Canal;
  notas: string;
  ultimoContactoAt: string | null;
}

export interface PostVisitaChecklist {
  docs: boolean;
  pago: boolean;
  beca: boolean;
  reminderD1: boolean;
  reminderD3: boolean;
  visitaAt: string | null;
  notas: string;
}

export interface Lead {
  id: string;
  colegioId: string;
  nombre: string;
  cargo: string;
  email: string | null;
  telefonoWa: string | null;
  etapaFunnel: string;
  programaInteres: string | null;
  tags: string[];
  createdAt: string;
  owner: string;
  nextTouch: string | null;
  canalOrigen: string;
  opened: boolean;
  visitado: boolean;
  postVisita: PostVisitaChecklist | null;
}

export interface TareaHoy {
  id: string;
  fecha: string;
  orden: number;
  tipo: TipoTarea;
  canal: Canal;
  titulo: string;
  programaFoco: string;
  dest: string;
  asunto: string;
  cuerpo: string;
  estado: EstadoTarea;
  creadoPorAgente: string;
  aprobadaPorUserId: string | null;
  enviadaAt: string | null;
  acciones: string[];
  /** financiador = paga cupos; estudiante = docente interesado */
  audiencia?: Audiencia;
}

export interface Envio {
  id: string;
  tareaHoyId: string;
  canal: string;
  destinatario: string;
  payload: string;
  estado: EstadoEnvio;
  enviadoPorUserId: string;
  createdAt: string;
}

export interface ActividadItem {
  id: string;
  time: string;
  actor: string;
  text: string;
  kind: "agente" | "human";
  createdAt: string;
}

export interface AgendaEvent {
  id: string;
  subject: string;
  startIso: string;
  endIso: string;
  location: string;
  attendeeEmail?: string | null;
  attendeeName?: string | null;
  tareaHoyId?: string | null;
  mode: "graph" | "demo" | "queued";
  graphEventId?: string | null;
  webLink?: string | null;
  createdAt: string;
  createdBy: string;
}

export interface MetricaDiaria {
  fecha: string;
  colegiosContactados: number;
  respuestas: number;
  visitasAgendadas: number;
  visitasRealizadas: number;
  inscritos: number;
  matriculas: number;
  ingresoProyectadoCop: number;
  notasAgente: string | null;
}

export const CANAL_LABEL: Record<string, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  telefono: "Llamada",
  email_wa: "Email+WA",
  linkedin: "LinkedIn",
  visita: "Invitación a desayuno",
  region: "Convenio / financiador",
};

export const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  editada: "Editada",
  enviada: "Enviada",
  agendada: "Desayuno agendado",
  descartada: "Descartada",
};


/** Metas de cohorte — las define Dirección; Mercadeo solo lectura */
export interface MetaPrograma {
  programa: string;
  /** Meta de inscritos del programa (obligatoria) */
  metaInscritos: number;
  /** Meta de ingresos COP del programa (opcional) */
  metaIngresosCop: number | null;
  /** Cupos de equilibrio del programa (opcional) */
  cuposEquilibrio: number | null;
}

export interface MetasCohorte {
  cohorte: string;
  /** Siempre las 4 maestrías */
  programas: MetaPrograma[];
  fechaCierreCohorte: string; // YYYY-MM-DD
  updatedAt: string | null;
  updatedByName: string | null;
  updatedByUserId: string | null;
}
