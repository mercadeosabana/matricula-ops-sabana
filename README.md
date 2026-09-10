# Matrícula Ops · Universidad de La Sabana

MVP de operaciones de matrícula (maestrías) para la Facultad de Educación.  
**Cohorte foco:** 2027-1 · UI en español.

Los agentes proponen craft (email / WhatsApp / guion / visita). Mercadeo aprueba, edita, envía (mock) o agenda. Dirección ve embudo, $ vs meta (datos **EJEMPLO**) y estrategia 30 días.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- Persistencia SQLite vía `sql.js` (archivo en `data/matricula.sqlite`)
- Auth demo por cookie de rol (Mercadeo / Dirección) — sin SSO real
- Envíos mock solamente; Outlook / WhatsApp = stubs OAuth “próximamente”

## Requisitos

- Node.js 20+
- npm

## Cómo correr

```bash
cd /workspace/matricula-ops-sabana
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

- **Entrar como Mercadeo** → `/hoy`
- **Entrar como Dirección** → `/direccion`
- Log unificado → `/actividad`

Producción local:

```bash
npm run build
npm start
```

## Rutas

| Ruta | Rol | Qué hace |
|------|-----|----------|
| `/` | — | Login demo |
| `/hoy` | Mercadeo (+ lectura Dirección) | Cola del día, Aprobar/Editar/Enviar/Agendar, feed agentes, mini funnel |
| `/direccion` | Dirección | KPIs, funnel, revenue EJEMPLO, WoW, estrategia 30d, mix programas |
| `/actividad` | ambos | Audit log agentes + humanos |

## API (mínima)

- `POST /api/auth/login` `{ rol: "mercadeo" \| "direccion" }`
- `POST /api/auth/logout`
- `GET /api/tareas`
- `PATCH /api/tareas/:id` `{ action: "aprobar" \| "editar" \| "enviar" \| "agendar", ... }`
- `GET /api/actividad?kind=all\|agente\|human`
- `GET /api/metricas`
- `POST /api/reset` — reinicia seed demo

## Datos seed

Alineados con:

- `semana-ejemplo.md` (7 tareas Hoy)
- `dashboard-direccion.md` (funnel 420→6, meta 40, $1.100M)

La DB se crea automáticamente en el primer request.

## Notas v1

- Nada se envía por Outlook/WA real.
- Marcas `[CONFIRMAR]` bloquean el envío hasta editarlas.
- Secuencia D+3/7/14: al **Aprobar** tarea #6 se encolan 3 envíos `queued`.
- No hacer `git push` hasta cambiar auth a mercadeosabana.

## Specs de origen

Prototipo HTML y specs en `/workspace/matricula-mvp/` (`SPEC.md`, `SCREENS.md`).
