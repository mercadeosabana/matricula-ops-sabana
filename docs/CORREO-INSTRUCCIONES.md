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

## Acceso (correo + contraseña)

La organización es dueña de CRM, actividad, embudo y gasto. Cada persona entra con su correo.

| Persona | Correo | Rol | Contraseña demo |
|---------|--------|-----|-----------------|
| **Laura Natalia** | `laura.natalia@unisabana.edu.co` | Mercadeo | `sabana2027` |
| **Laura Lucía** | `laura.lucia@unisabana.edu.co` | Dirección | `sabana2027` |
| **Ivan Auli** | `ivan.auli@unisabana.edu.co` | Dirección / admin | `sabana2027` |

También hay **«Entrar demo rápido»** en el login (sin tipear clave) para la presentación.

**Equipo (`/equipo`)** — solo Dirección (Lucía e Ivan): invitar personas (varias de Mercadeo en paralelo), desactivar/reactivar, reset de clave. Al desactivar Mercadeo aparece **«Pasar pendientes a…»** (recomendado al reemplazar). El historial conserva el nombre del actor original. Si no se pasan pendientes, la persona nueva igual ve toda la data de la facultad.

## Estudio de mercadeo (ambos roles)

**`/estudio`** — torta SAM, mapa Colombia (prioridad alta/media/baja), plan 12 semanas («cómo comemos el elefante»), inversión/ritmo, embudos duales, competencia IES por ciudad. Cifras oficiales con fuente (DANE EDUC 2023, SNIES/MEN); resto marcado **ESTIMADO**. Fuente única: `src/lib/estudio-mercado.ts`.

- **Natalia (`/hoy`)**: card **Visión global del mercado** (elefante + % abordado + link al estudio) **arriba**; debajo la rebanada semanal.
- **Lucía (`/direccion`)**: mismos datos + KPIs gerenciales ligados al estudio + mapa resumido.

## Metas (por programa · dueño: Dirección)

Las metas las define **Laura Lucía / Ivan** en `/direccion` → **Metas de la cohorte** (editables). Las 4 maestrías:

1. Maestría en Educación  
2. Maestría en Pedagogía  
3. Maestría en Dirección y Gestión  
4. Maestría en Desarrollo Infantil  

Por fila: **metaInscritos** (obligatoria), meta ingresos COP (opc.), cupos equilibrio (opc.). El portfolio es la **suma**. Natalia las ve en `/hoy` y `/estudio` en **solo lectura**.

**Seed / defaults (Ivan · cohorte 2027-1):** por maestría **metaInscritos = 20**, **cuposEquilibrio = 10** → portfolio **80 inscritos / 40 cupos equilibrio**. Ingresos COP quedan en blanco (`null`) para que Lucía los fije en `/direccion`. Fresh deploys (sin `store.json` o al reset) cargan estos valores vía `defaultMetasCohorte()` / `ensureCuatroProgramas` en `src/lib/db.ts`. Si un `store.json` ya tiene metas viejas (p. ej. 12/10/10/8), Lucía puede editarlas o borrar el store para re-seed.



## Playbook comercial (regla de oro · demo)

Encoded in product (`/playbook`, `/hoy`, `/crm`, `/sala-guerra`):

1. **Etapas CRM:** `barrido_nuevo` → `primer_acercamiento` → `esperando_respuesta` → `respondio` → `siguiente_paso` → `propuesta_brochure` → `seguimiento` → `cerrado_ganado` | `cerrado_frio`.
2. **Embudo dual:** Financiador vs Interesado. Mismos stages; **nextStep** distinto. `visita_financiador` solo financiadores; interesados → `video_llamada` o `desayuno_campus`.
3. **Barrido** (encontrar): LinkedIn search · correos en sitios colegio/secretaría/gobernación · landings form/pauta · base facultad. **Toque** (contactar): Outlook · borrador LinkedIn · WhatsApp. Llamada IA = soporte. Visita/desayuno = pasos posteriores.
4. **Plan 4 semanas · zona activa** (Neiva/Huila): S1–S2 financiadores hasta equilibrio ~10/programa; S2–S4 abren docentes. Link desde narrativa elefante en `/estudio`.
5. **Hoy:** **Respondieron hoy** arriba (resumen agente + botones next step); **Cola del playbook** debajo (origen + mensaje + Aprobar/Editar; tope ~15 nuevos/día). Una próxima acción + fecha por lead. Pauta/LinkedIn = mismas etapas.

Seed demo: financiador SE Huila (visita), docente Normal (desayuno), coordinación Neiva pauta (brochure). Sin emails reales inventados de más — solo `*.ejemplo.*`.

## Modelo de la semana (Hoy · Mercadeo)

**Hoy** = visión global + *rebanada semanal*:

1. **Visión global** — SAM ESTIMADO + % tocado + link a `/estudio`.
2. **Semana de mercado** — zona/segmento + meta. Demo: **Neiva / Huila**, cupos **12 / 20**.
3. **Financiadores** primero · **interesados** después (hasta equilibrio).
4. **Cómo toco hoy** — Outlook + WhatsApp; LinkedIn = borradores; desayuno solo leads calientes.
5. Palabras planas: programa, cohorte, sede, financiador, interesado.

## Qué mira Laura Lucía (Dirección)

Panel **gerencial** ligado al estudio:

- Por programa: meta vs real, gap, ritmo.
- Portfolio: tiempo, dinero, CAC / visita / matrícula (ESTIMADO).
- Cupos vs equilibrio (Neiva).
- Visión global + mapa + embudos · detalle en `/estudio`.
- **De dónde vienen** — conteo por origen, mini-embudo y spend/CAC pauta (**EJEMPLO**, sin Ads API); CRM exige `origen`.

## Quién es quién

1. **Mercadeo** → **Hoy** (visión global + ejecución semanal) + **Estudio** + CRM, post-visita, biblioteca, capacidad, sala de guerra.
2. **Dirección** → **Dashboard** + **Estudio** + Equipo + sala de guerra / capacidad.

## Qué hacen los agentes (6)

Los agentes **proponen** craft e insights. **Nadie envía solo** — siempre hay aprobación humana.

| Agente | Qué hace |
|--------|----------|
| **Captación** | Outreach: correo, WhatsApp, borradores LinkedIn, guion llamada 90 s. |
| **Admisiones** | Invitación a desayuno (leads calientes), agenda, show-up, post-visita. |
| **Inteligencia** | Segmentación por zona/programa, lectura del embudo (cifras EJEMPLO). |
| **Orquestadora** | Ordena la cola de Hoy (financiadores → interesados), brief semanal. |
| **Región** | Convenios: cartas a secretarías / alcaldías para cupos financiados. |
| **Guardian** | Revisa craft antes de enviar → OK o BLOQUEAR. |

## Páginas

| Página | Para quién | Qué ver |
|--------|------------|---------|
| `/estudio` | Ambas | Estudio de mercadeo · torta · mapa · resumen **De dónde vienen** · competencia |
| `/hoy` | Mercadeo | Visión global + **Respondieron** + cola playbook + semana |
| `/playbook` | Ambas | Regla de oro · dual funnel · plan 4 sem zona · canales |
| `/direccion` | Dirección | KPIs + **De dónde vienen** (origen/embudo/spend EJEMPLO) + mapa + embudos |
| `/equipo` | Dirección (Lucía, Ivan) | Usuarios, invitaciones, desactivar, pasar pendientes |
| `/crm` | Ambas | Colegios + leads · origen de adquisición (filtro/badge/editable) |
| `/post-visita` | Mercadeo | Checklist docs / pago / beca |
| `/sala-guerra` | Ambas | Brief semanal |
| `/biblioteca` | Ambas | Ofertas one-pager |
| `/capacidad` | Ambas | Cupos Chía + Neiva |
| `/agenda` | Ambas | Desayunos / eventos |
| `/agentes` | Ambas | Chat con agentes + Guardian |
| `/interesado` | Público (sin login) | Landing pauta Meta/LinkedIn → CRM lead Natalia |

## Canales

| Canal | Estado |
|-------|--------|
| **Correo (Outlook)** | Listo en producto; credenciales Azure (ver `docs/SETUP-OAUTH.md`). |
| **Agenda** | Mismo OAuth + Calendars.ReadWrite · agendar desayuno. |
| **WhatsApp** | Listo en producto; token Meta de la facultad. |
| **LinkedIn** | Solo borradores. |
| **Llamada IA** | Soporte / piloto · simulación. |
| **Invitación a desayuno** | Solo leads calientes. |
| **Convenio / financiador** | Carta a Secretaría · cupos vs equilibrio. |


## Landing pauta (Meta ads)

URL para ads Meta (demo): **https://matricula-ops-sabana.vercel.app/interesado**

- Variante LinkedIn: `https://matricula-ops-sabana.vercel.app/interesado?canal=linkedin`
- Alias: `/pauta` redirige a `/interesado`
- UTM opcionales: `utm_campaign` / `utm_source` (o `campaign` / `source`) se guardan en tags del lead
- Origen CRM: `pauta_meta` (default) o `pauta_linkedin`
- Owner: Laura Natalia · etapa `primer_acercamiento` · próxima acción «Primer contacto · Natalia»

## Regla de oro

**Nada sale sin aprobación humana.** Los agentes preparan (Guardian revisa); Mercadeo da el OK; Dirección vigila equilibrio, programas y costos EJEMPLO.

Quedo atento para el walkthrough.

Saludos,  
Ivan

---

*Archivo solo para copia. No automatizar el envío desde Matrícula Ops.*
