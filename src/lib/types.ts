export type Rol = "mercadeo" | "direccion";

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
  email: string;
  rol: Rol;
  activo: boolean;
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
  visita: "Visita campus",
  region: "Región / Convenios",
};

export const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  editada: "Editada",
  enviada: "Enviada",
  agendada: "Visita agendada",
  descartada: "Descartada",
};
