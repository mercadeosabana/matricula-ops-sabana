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
| `/estudio` | Ambas | Estudio de mercadeo · torta · mapa · 12 semanas · competencia |
| `/hoy` | Mercadeo | Visión global + semana · financiadores / interesados |
| `/direccion` | Dirección | KPIs + visión global + mapa + embudos (liga a /estudio) |
| `/equipo` | Dirección (Lucía, Ivan) | Usuarios, invitaciones, desactivar, pasar pendientes |
| `/crm` | Ambas | Colegios + leads · data de la org |
| `/post-visita` | Mercadeo | Checklist docs / pago / beca |
| `/sala-guerra` | Ambas | Brief semanal |
| `/biblioteca` | Ambas | Ofertas one-pager |
| `/capacidad` | Ambas | Cupos Chía + Neiva |
| `/agenda` | Ambas | Desayunos / eventos |
| `/agentes` | Ambas | Chat con agentes + Guardian |

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

## Regla de oro

**Nada sale sin aprobación humana.** Los agentes preparan (Guardian revisa); Mercadeo da el OK; Dirección vigila equilibrio, programas y costos EJEMPLO.

Quedo atento para el walkthrough.

Saludos,  
Ivan

---

*Archivo solo para copia. No automatizar el envío desde Matrícula Ops.*
