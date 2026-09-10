import { hasUnresolvedConfirm } from "./utils";

export type GuardianVerdict = {
  status: "OK" | "BLOQUEAR";
  summary: string;
  detail: string;
};

/** Demo Guardian: BLOQUEAR si hay [CONFIRMAR] sin resolver o claims riesgosos */
export function reviewCraft(asunto: string, cuerpo: string): GuardianVerdict {
  const text = `${asunto}\n${cuerpo}`;
  const risky =
    /admisi[oó]n garantizada|cupo asegurado|100% beca|sin costo|gratis total/i.test(
      text
    );
  const unresolved = hasUnresolvedConfirm(text);

  if (risky) {
    return {
      status: "BLOQUEAR",
      summary: "BLOQUEAR · claim no aprobado",
      detail:
        "Guardian (demo): lenguaje de garantía / beca total sin OK de Dirección. Reescribe y vuelve a pasar por Guardian.",
    };
  }
  if (unresolved) {
    return {
      status: "BLOQUEAR",
      summary: "BLOQUEAR · [CONFIRMAR] pendientes",
      detail:
        "Guardian (demo): hay marcas [CONFIRMAR] sin resolver. Edita precios/fechas antes de enviar, o usa DEMO consciente del riesgo.",
    };
  }
  return {
    status: "OK",
    summary: "OK · listo para envío",
    detail:
      "Guardian (demo): tono profesional, sin claims prohibidos, sin [CONFIRMAR] abiertos. Puedes proceder.",
  };
}
