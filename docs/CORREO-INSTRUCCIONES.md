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

1. **Laura Natalia · Mercadeo** → entra a **Hoy** (cola del día: aprobar, editar, enviar, agendar).
2. **Laura Lucía · Dirección** → entra al **Dashboard** (embudo, $ vs meta, potencial por canal, estrategia).

Son roles demo por persona; no hace falta contraseña.

## Qué hacen los agentes (5)

Los agentes **proponen** craft e insights. **Nadie envía solo** — siempre hay aprobación humana.

| Agente | Qué hace |
|--------|----------|
| **Captación** | Outreach a colegios: email frío, WhatsApp, borradores LinkedIn, guion de llamada 90 s. |
| **Admisiones** | Visitas campus Chía (agenda 2 h), cupos sábados, show-up, puente a inscripción. |
| **Inteligencia** | Segmentación por zona/programa, prioridades, lectura del embudo (cifras EJEMPLO). |
| **Orquestadora** | Ordena la cola de Hoy, secuencias D+3 / D+7 / D+14, handoffs entre agentes. |
| **Región** | Convenios territoriales: cartas a secretarías / alcaldías / gobernaciones para cohortes regionales (la entidad financia maestrías de docentes en su jurisdicción). |

Pueden chatear con cada uno en **Agentes** (`/agentes`): eligen el agente, escriben un pedido y reciben un borrador en su voz. Sin API key el chat usa respuestas demo locales; con `OPENAI_API_KEY` / `XAI_API_KEY` / `GROQ_API_KEY` usa LLM real.

## Qué hace Laura Natalia cada día (Hoy)

1. Revisa el panel **Canales** (Outlook, WhatsApp, LinkedIn, Llamada IA, Visita campus, Región/Convenios).
2. Aprueba / edita / envía las tareas de la cola (email, WA, llamada, LinkedIn borrador, visita, carta a Secretaría).
3. Resuelve marcas **`[CONFIRMAR]`** (precios, fechas, descuentos) antes de un envío real.
4. Si aún no hay credenciales Azure/Meta: activa **Demo** (`?demo=1` o botón Demo) y usa **«Simular envío (DEMO)»** para recorrer el flujo completo en la presentación.

## Qué mira Laura Lucía (Dirección)

- KPIs e embudo (números **EJEMPLO**).
- Sección **«Potencial del sistema · Cómo llenamos la cohorte»**: canal → visitas → matrículas, con estado live vs piloto (incluye cohortes regionales vía Región).
- Ingresos vs meta, mix por programa, estrategia 30 días.
- Puede abrir Vista Hoy y Agentes en modo lectura / exploración.

## Canales — estado actual

| Canal | Estado |
|-------|--------|
| **Outlook (email)** | Listo en producto; falta que TI / Ivan carguen credenciales Azure (ver `docs/SETUP-OAUTH.md`). |
| **WhatsApp Business** | Listo en producto; falta token Meta Cloud API de la facultad. |
| **LinkedIn** | Solo **borradores** — no hay auto-envío. |
| **Llamada IA** | **Piloto**: guion 90 s + «Simular llamada» (sin telefonía real). |
| **Visita campus** | Agenda 2 h en seed; cupos sábados con `[CONFIRMAR]`. |
| **Región / Convenios** | **Piloto**: carta a Secretaría para convenio territorial. |

## Regla de oro

**Nada sale sin aprobación humana.** Los agentes preparan; Mercadeo da el OK; Dirección vigila el embudo y excepciones.

Cuando tengan Azure/Meta, el mismo botón «Enviar» usa Graph / Cloud API de verdad. Hasta entonces, el modo DEMO permite mostrar el potencial completo.

Quedo atento para el walkthrough.

Saludos,  
Ivan

---

*Archivo solo para copia. No automatizar el envío desde Matrícula Ops.*
