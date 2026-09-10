# Setup OAuth · Outlook (email + agenda) + WhatsApp

Guía para **Ivan / TI** antes de conectar canales reales en Matrícula Ops  
(app: `https://matricula-ops-sabana.vercel.app`).

No se inventan secretos aquí: hay que crearlos en Azure y Meta y pegarlos en Vercel.

---

## 1. Outlook / Microsoft 365 (Graph Mail.Send + Calendars.ReadWrite)

### En Azure Portal (Entra ID)

1. **App registrations** → *New registration*
   - Nombre sugerido: `Matricula Ops Sabana`
   - Supported account types: *Accounts in this organizational directory only* (o *Multitenant* si aplica)
   - Redirect URI (Web):
     ```
     https://matricula-ops-sabana.vercel.app/api/oauth/outlook/callback
     ```
   - Para desarrollo local también puedes agregar:
     ```
     http://localhost:3000/api/oauth/outlook/callback
     ```

2. **Certificates & secrets** → *New client secret* → copiar el valor (solo se muestra una vez).

3. **API permissions** → *Microsoft Graph* → *Delegated*:
   - `User.Read`
   - `Mail.Send`
   - `Calendars.ReadWrite` ← **agenda / visitas** (mismo OAuth que el correo)
   - `offline_access` (aparece al pedir consentimiento / scope; también se pide en el authorize URL)
   - Grant admin consent si la política de la universidad lo exige.

   Un solo flujo OAuth (`/api/oauth/outlook/start`) pide correo **y** calendario.
   En la UI hay tarjeta **Agenda Outlook** («Conectar agenda»); si el correo
   ya estaba conectado sin `Calendars.ReadWrite`, hay que **reconectar** para
   conceder el permiso extra.

4. Anotar:
   - **Application (client) ID** → `AZURE_CLIENT_ID`
   - **Directory (tenant) ID** → `AZURE_TENANT_ID`  
     (o usar `common` / `organizations` si el registro es multi-tenant)
   - **Client secret** → `AZURE_CLIENT_SECRET`

### Variables en Vercel

| Variable | Ejemplo / notas |
|----------|-----------------|
| `AZURE_CLIENT_ID` | GUID de la app |
| `AZURE_CLIENT_SECRET` | Secret value |
| `AZURE_TENANT_ID` | GUID del tenant, o `common` |
| `NEXT_PUBLIC_APP_URL` | `https://matricula-ops-sabana.vercel.app` |
| `CONNECTIONS_SECRET` | (opcional) clave para cifrar tokens en el store |
| `FORCE_MOCK_SEND` | Solo `1` en demos locales; **no** en producción real |
| `GRAPH_QUEUE_ONLY` | `1` para encolar sin llamar a Graph |

Tras desplegar: Mercadeo (Laura Natalia) → **Conectar Outlook** → OAuth Microsoft.

Si faltan variables, la UI muestra:

> *Faltan credenciales de Azure — pedir a TI / Ivan*

con checklist (App registration, redirect URI, Mail.Send + Calendars.ReadWrite + offline_access + User.Read).

Los tokens se guardan cifrados en el store JSON bajo `/tmp` (mismo patrón que `store.json` en Vercel).

---


### Agenda / visitas (Graph calendar)

- Scope: `Calendars.ReadWrite` (incluido en el authorize URL junto a Mail.Send).
- Flag en store: `calendarConnected` si el token trae ese scope.
- «Agendar visita» en Hoy:
  - Con agenda conectada → `POST /me/events` (plantilla 2 h campus Chía, sábados 9:00–11:00 America/Bogota; attendee = email del lead si existe).
  - Sin Azure / modo DEMO → simula y deja en Actividad: **DEMO: bloqueado en agenda**.
  - Sin conexión y sin DEMO → abre modal «Conectar Agenda Outlook».
- Lista local: `/agenda` + `GET /api/agenda`.

## 2. WhatsApp Business Cloud API (Meta)

### En Meta Business

1. Usar **Meta Business Manager de la Facultad** (no cuenta personal).
2. Crear / vincular **WhatsApp Business Platform · Cloud API**.
3. Agregar el **número de la facultad** (no un celular personal).
4. Generar un **Permanent Access Token** (o System User token) con permisos de mensajería.
5. Anotar:
   - Access Token → `WHATSAPP_TOKEN`
   - Phone Number ID → `WHATSAPP_PHONE_NUMBER_ID`
   - WhatsApp Business Account ID → `WHATSAPP_BUSINESS_ACCOUNT_ID`

### Variables en Vercel (o UI)

| Variable | Notas |
|----------|--------|
| `WHATSAPP_TOKEN` | Token permanente / system user |
| `WHATSAPP_PHONE_NUMBER_ID` | ID del número Cloud API |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | WABA ID (opcional pero recomendado) |
| `WA_QUEUE_ONLY` | `1` para encolar sin llamar a Meta |

Alternativa: en la app, **Conectar WhatsApp** permite pegar token + Phone Number ID + WABA ID; se guardan cifrados en el store.

Si faltan credenciales, la UI muestra checklist (Meta Business, número facultad, no personal).

---

## 3. Comportamiento de envío

| Canal | Sin conexión | Con conexión | `FORCE_MOCK_SEND=1` |
|-------|--------------|--------------|---------------------|
| Email | Bloquea: *Conecta Outlook primero* | Graph `sendMail` (o cola si no hay email en destino) | Mock |
| Agenda / visita | Modal conectar o DEMO | Graph `me/events` (Calendars.ReadWrite) | DEMO: bloqueado en agenda |
| WhatsApp | Bloquea: *Conecta WhatsApp primero* | Cloud API (o cola si no hay teléfono) | Mock |
| Teléfono | Marca lista | Marca lista | Mock |

**No se finge envío real** sin tokens.

---

## 4. Redirect URIs a registrar

```
https://matricula-ops-sabana.vercel.app/api/oauth/outlook/callback
http://localhost:3000/api/oauth/outlook/callback
```

Endpoints de la app:

- `GET /api/oauth/outlook/start` (scopes: Mail.Send + Calendars.ReadWrite + …)
- `GET /api/oauth/outlook/callback`
- `GET /api/connections`
- `GET /api/agenda`
- `POST /api/connections/whatsapp`
- `DELETE /api/connections/whatsapp`
- `POST /api/connections/outlook/disconnect`

---

## 5. Checklist rápido para Ivan / TI

- [ ] App registration Azure + secret
- [ ] Redirect URI de producción en Azure
- [ ] Permisos Graph: Mail.Send, Calendars.ReadWrite, User.Read, offline_access (+ admin consent si aplica)
- [ ] Env vars Azure + `NEXT_PUBLIC_APP_URL` en Vercel
- [ ] Meta Business facultad + número Cloud API
- [ ] Env vars WhatsApp en Vercel (o pegarlas en la UI de Mercadeo)
- [ ] Redeploy Vercel
- [ ] Probar login Laura Natalia → Conectar Outlook / Agenda / WhatsApp → badges *Conectado*
- [ ] Probar «Agendar visita» en Hoy → evento en `/agenda` (real o DEMO)
- [ ] **No** poner `FORCE_MOCK_SEND=1` en producción si se quiere envío real
