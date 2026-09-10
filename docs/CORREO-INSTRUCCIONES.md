# Borrador de correo — Ivan → Laura Lucía

> **No enviar desde el sistema.** Copia/pega en Outlook cuando Ivan lo decida.
> Destinataria principal: Laura Lucía · CC opcional: Laura Natalia.

---

**De:** Ivan Auli  
**Para:** Laura Lucía  
**CC:** Laura Natalia *(opcional)*  
**Asunto:** Demo Matrícula Ops · Facultad de Educación · cohorte 2027-1

---

Hola Laura Lucía,

Te comparto el enlace al demo de **Matrícula Ops** (operación de matrícula de maestrías, Facultad de Educación · Unisabana):

**https://matricula-ops-sabana.vercel.app**

## Quién es quién en el login

En la pantalla de entrada hay dos botones:

1. **Laura Natalia · Mercadeo** → entra a **Hoy** (cola del día: aprobar, editar, enviar, agendar) + CRM, post-visita, biblioteca, capacidad, sala de guerra.
2. **Laura Lucía · Dirección** → entra al **Dashboard** (embudo, $ vs meta, CAC EJEMPLO, potencial por canal, estrategia) + sala de guerra / capacidad.

Son roles demo por persona; no hace falta contraseña.

## Qué hacen los agentes (6)

Los agentes **proponen** craft e insights. **Nadie envía solo** — siempre hay aprobación humana.

| Agente | Qué hace |
|--------|----------|
| **Captación** | Outreach a colegios: email frío, WhatsApp, borradores LinkedIn, guion de llamada 90 s. |
| **Admisiones** | Visitas campus Chía (agenda 2 h), cupos sábados, show-up, puente a inscripción / post-visita. |
| **Inteligencia** | Segmentación por zona/programa, prioridades, lectura del embudo (cifras EJEMPLO). |
| **Orquestadora** | Ordena la cola de Hoy, secuencias D+3 / D+7 / D+14, **brief semanal** (Sala de guerra). |
| **Región** | Convenios territoriales: cartas a secretarías / alcaldías / gobernaciones para cohortes regionales (la entidad financia maestrías de docentes en su jurisdicción). |
| **Guardian** | 6.º agente: revisa craft antes de enviar → **OK** o **BLOQUEAR** (tono, `[CONFIRMAR]`, claims). En Hoy hay «Pasar por Guardian» al enviar / simular. |

Pueden chatear con cada uno en **Agentes** (`/agentes`). Sin API key el chat usa respuestas demo locales; con `OPENAI_API_KEY` / `XAI_API_KEY` / `GROQ_API_KEY` usa LLM real.

## Páginas nuevas (equipo de admisiones)

| Página | Para quién | Qué ver |
|--------|------------|---------|
| `/crm` | Mercadeo (+ Dirección) | Colegios + leads (12), etapa funnel, owner Laura Natalia, próximo toque, canal origen, score **caliente/tibio/frío**, detalle al clic. |
| `/post-visita` | Mercadeo | Checklist docs / pago / beca / reminders D+1 y D+3 · 2 leads seed en post-visita. |
| `/sala-guerra` | Ambas | Brief semanal: embudo, top 10 acciones, territorios, costo-por-matrícula EJEMPLO · botón **Generar brief de la semana** (voz Orquestadora). |
| `/biblioteca` | Ambas | Ofertas one-pager (Educación, Pedagogía, Dirección, DI), early bird, convenio regional, visita 2 h · copiar markdown · **aprobada por Dirección**. |
| `/capacidad` | Ambas | Cupos por programa × sede (Chía + Neiva) · «Faltan N para abrir cohorte regional». |
| `/agenda` | Ambas | Eventos Outlook / DEMO de visitas agendadas. |
| `/hoy` | Mercadeo | Score badges en tareas + checkbox Guardian al enviar. |
| `/direccion` | Dirección | Panel **CAC / costo por visita / costo por matrícula EJEMPLO**. |

## Qué hace Laura Natalia cada día (Hoy)

1. Revisa el panel **Canales** (Outlook, **Agenda Outlook**, WhatsApp, LinkedIn, Llamada IA, Visita campus, Región/Convenios).
2. Aprueba / edita / envía las tareas de la cola (email, WA, llamada, LinkedIn borrador, visita, carta a Secretaría).
3. Opcional: **Pasar por Guardian** antes de Enviar / Simular (veredicto OK o BLOQUEAR demo).
4. En la tarea **Reunión / visita campus**, usa **«Agendar visita»**: si la agenda está conectada, crea el evento en Outlook (2 h Chía); si no, con Demo queda **DEMO: bloqueado en agenda** en Actividad. Lista en `/agenda`.
5. Trabaja el **CRM** y **post-visita** para leads calientes.
6. Resuelve marcas **`[CONFIRMAR]`** (precios, fechas, descuentos) antes de un envío real.
7. Si aún no hay credenciales Azure/Meta: activa **Demo** (`?demo=1` o botón Demo) y usa **«Simular envío (DEMO)»** / agendar en DEMO para la presentación.

## Qué mira Laura Lucía (Dirección)

- KPIs e embudo (números **EJEMPLO**).
- Panel **CAC / costo por visita / costo por matrícula EJEMPLO**.
- **Sala de guerra** semanal con Natalia (brief Orquestadora).
- **Capacidad** Chía + Neiva (apertura de cohorte regional).
- Sección **«Potencial del sistema · Cómo llenamos la cohorte»**: canal → visitas → matrículas, live vs piloto (incluye **Agenda Outlook** y cohortes regionales vía Región).
- Ingresos vs meta, mix por programa, estrategia 30 días.
- Puede abrir Vista Hoy, CRM, Biblioteca, Agenda y Agentes (incl. Guardian).

## Canales — estado actual

| Canal | Estado |
|-------|--------|
| **Outlook (email)** | Listo en producto; falta que TI / Ivan carguen credenciales Azure (ver `docs/SETUP-OAUTH.md`). |
| **Agenda Outlook** | Mismo OAuth + `Calendars.ReadWrite`. «Agendar visita» → evento Graph o **DEMO: bloqueado en agenda**. Ver `/agenda`. |
| **WhatsApp Business** | Listo en producto; falta token Meta Cloud API de la facultad. |
| **LinkedIn** | Solo **borradores** — no hay auto-envío. |
| **Llamada IA** | **Piloto**: guion 90 s + «Simular llamada» (sin telefonía real). |
| **Visita campus** | Agenda 2 h en seed; cupos sábados con `[CONFIRMAR]`. |
| **Región / Convenios** | **Piloto**: carta a Secretaría para convenio territorial. |

## Regla de oro

**Nada sale sin aprobación humana.** Los agentes preparan (Guardian revisa); Mercadeo da el OK; Dirección vigila el embudo, costos EJEMPLO y excepciones.

Cuando tengan Azure/Meta, el mismo botón «Enviar» usa Graph / Cloud API de verdad. Hasta entonces, el modo DEMO permite mostrar el potencial completo.

Quedo atento para el walkthrough.

Saludos,  
Ivan

---

*Archivo solo para copia. No automatizar el envío desde Matrícula Ops.*
