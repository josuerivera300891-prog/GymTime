---
name: gymtime-skill-builder
description: Skill constructor para crear futuras habilidades del proyecto GymTime siguiendo el estándar oficial de Antigravity Skills
project: GymTime
scope: internal
version: 1.0.0
author: GymTime Team
---

# GymTime Skill Builder

## 🎯 Objetivo

Este Skill sirve como **constructor interno** para diseñar y estandarizar nuevas habilidades dentro del ecosistema GymTime.

### Propósitos principales:
1. **Diseñar nuevas habilidades** del sistema GymTime de manera estructurada
2. **Mantener consistencia técnica y funcional** entre todos los Skills del proyecto
3. **Convertir necesidades del negocio** (membresías, pagos, recordatorios, check-in, etc.) en Skills bien documentados
4. **Garantizar reutilización y escalabilidad** de cada habilidad creada

---

## 📥 Inputs Esperados

Al solicitar la creación de un nuevo Skill, **siempre proporcionar**:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `nombre` | Nombre del Skill en kebab-case | `membership-expiration-reminder` |
| `problema` | Problema específico que resuelve dentro de GymTime | "Los miembros olvidan renovar su membresía" |
| `area` | Área del sistema afectada | membresías, pagos, notificaciones, entrenadores, clientes, reportes, check-in, tienda |
| `acciones` | Lista de acciones que ejecuta el Skill | ["Consultar membresías próximas a vencer", "Enviar recordatorio por WhatsApp"] |
| `triggers` | Eventos que activan el Skill | ["Cron diario a las 8am", "3 días antes de vencimiento"] |
| `restricciones` | Reglas de negocio o limitaciones | ["Solo enviar a miembros con WhatsApp verificado", "Máximo 1 recordatorio por día"] |

---

## ⚙️ Proceso Interno

El constructor sigue estos pasos para generar un nuevo Skill:

### Paso 1: Análisis del Requerimiento
```
1. Validar que todos los inputs requeridos estén presentes
2. Identificar dependencias con otros módulos de GymTime
3. Verificar que no exista un Skill duplicado
4. Determinar el nivel de complejidad (simple, medio, complejo)
```

### Paso 2: Traducción a Habilidad
```
1. Definir el nombre siguiendo convención: área-acción-objeto
2. Mapear acciones a funciones/endpoints existentes
3. Identificar datos necesarios (tablas de Supabase)
4. Determinar integraciones requeridas (Twilio, Stripe, etc.)
```

### Paso 3: Generación de Estructura
```
/skills/
└── {nombre-del-skill}/
    ├── SKILL.md           # Documentación principal
    ├── scripts/           # (Opcional) Scripts de automatización
    │   └── execute.ts
    ├── examples/          # (Opcional) Ejemplos de uso
    │   └── sample-input.json
    └── resources/         # (Opcional) Recursos adicionales
        └── templates/
```

### Paso 4: Construcción del SKILL.md
```yaml
---
name: {nombre}
description: {descripción breve}
project: GymTime
area: {área del sistema}
triggers: [{lista de triggers}]
dependencies: [{dependencias}]
---

# {Nombre del Skill}

## Objetivo
{Descripción detallada del problema que resuelve}

## Triggers
{Cuándo se activa}

## Acciones
{Qué hace paso a paso}

## Datos Requeridos
{Tablas y campos de Supabase}

## Integraciones
{Servicios externos utilizados}

## Restricciones
{Reglas de negocio}

## Ejemplos
{Casos de uso reales}
```

---

## 📤 Output Esperado

El resultado **SIEMPRE** debe incluir:

1. ✅ **Carpeta del Skill** en `/skills/{nombre-del-skill}/`
2. ✅ **Archivo SKILL.md** completamente formateado
3. ✅ **Lenguaje claro** e instrucciones accionables
4. ✅ **Sin funcionalidades inventadas** fuera de GymTime
5. ✅ **Código reutilizable** si aplica (en `/scripts/`)

---

## 📚 Ejemplos (Few-shot)

### Ejemplo 1: `membership-expiration-reminder`

**Input recibido:**
```json
{
  "nombre": "membership-expiration-reminder",
  "problema": "Los miembros no renuevan a tiempo porque olvidan cuándo vence su membresía",
  "area": "membresías",
  "acciones": [
    "Consultar membresías que vencen en 3 días",
    "Filtrar miembros con WhatsApp verificado",
    "Enviar mensaje personalizado con fecha de vencimiento",
    "Registrar envío en historial"
  ],
  "triggers": ["Cron diario a las 8:00 AM"],
  "restricciones": [
    "Solo membresías activas",
    "Máximo 1 recordatorio por membresía",
    "Respetar horario del tenant (timezone)"
  ]
}
```

**Estructura generada:**
```
/skills/membership-expiration-reminder/
├── SKILL.md
└── scripts/
    └── check-expirations.ts
```

**Fragmento del SKILL.md:**
```markdown
---
name: membership-expiration-reminder
description: Envía recordatorios automáticos de vencimiento de membresía por WhatsApp
project: GymTime
area: membresías
triggers: [cron-daily-8am]
dependencies: [twilio, supabase]
---

# Membership Expiration Reminder

## Objetivo
Reducir la tasa de abandono enviando recordatorios proactivos a los miembros 
cuya membresía está próxima a vencer.

## Datos Requeridos
- `memberships` (status, end_date, member_id, tenant_id)
- `members` (phone, whatsapp_verified, name)
- `tenants` (timezone, whatsapp_number)

## Flujo de Ejecución
1. Query: Membresías con `end_date = NOW() + 3 days` y `status = 'ACTIVE'`
2. Join: Obtener datos del miembro y tenant
3. Filter: Solo miembros con `whatsapp_verified = true`
4. Send: Mensaje via Twilio WhatsApp API
5. Log: Insertar registro en `whatsapp_outbox`
```

---

### Ejemplo 2: `monthly-payment-failure-handler`

**Input recibido:**
```json
{
  "nombre": "monthly-payment-failure-handler",
  "problema": "Los pagos recurrentes fallan y el admin no se entera hasta que es tarde",
  "area": "pagos",
  "acciones": [
    "Detectar pagos fallidos de Stripe",
    "Marcar membresía como 'payment_failed'",
    "Notificar al admin",
    "Enviar mensaje al miembro con link de pago"
  ],
  "triggers": ["Webhook de Stripe: payment_intent.payment_failed"],
  "restricciones": [
    "No suspender membresía inmediatamente",
    "Dar 3 días de gracia",
    "Limitar reintentos a 3"
  ]
}
```

**Estructura generada:**
```
/skills/monthly-payment-failure-handler/
├── SKILL.md
└── scripts/
    └── webhook-handler.ts
```

**Fragmento del SKILL.md:**
```markdown
---
name: monthly-payment-failure-handler
description: Maneja fallos de pago recurrentes y notifica a las partes
project: GymTime
area: pagos
triggers: [stripe-webhook-payment-failed]
dependencies: [stripe, twilio, supabase]
---

# Monthly Payment Failure Handler

## Objetivo
Gestionar proactivamente los fallos de pago para evitar pérdida de ingresos
y mantener informados tanto a admins como a miembros.

## Webhook Endpoint
`POST /api/webhooks/stripe`

## Flujo de Ejecución
1. Recibir webhook `payment_intent.payment_failed`
2. Extraer `customer_id` y `payment_intent_id`
3. Buscar membresía asociada en Supabase
4. Actualizar estado: `payment_status = 'failed'`
5. Enviar notificación push al admin
6. Enviar WhatsApp al miembro con link de pago manual
7. Programar reintento en 24h (máx 3 veces)
```

---

## 🚫 Reglas Estrictas

1. **NO** crear Skills genéricos fuera del proyecto GymTime
2. **NO** romper el formato estándar de Antigravity Skills
3. **NO** mezclar lógica de otros proyectos
4. **NO** inventar funcionalidades que no existan en GymTime
5. **SIEMPRE** verificar que las tablas/campos referenciados existan
6. **SIEMPRE** respetar multi-tenancy (`tenant_id` en todas las queries)
7. **SIEMPRE** documentar restricciones de seguridad y permisos

---

## 🏗️ Áreas Válidas de GymTime

| Área | Descripción | Tablas Principales |
|------|-------------|-------------------|
| `memberships` | Gestión de membresías | `memberships`, `membership_plans` |
| `payments` | Pagos y facturación | `payments`, `invoices` |
| `notifications` | Alertas y mensajería | `whatsapp_outbox`, `push_subscriptions` |
| `check-in` | Registro de asistencia | `attendance`, `shifts` |
| `members` | Gestión de socios | `members`, `member_tiers` |
| `staff` | Personal y entrenadores | `staff_users`, `trainers` |
| `store` | Tienda y productos | `products`, `product_sales` |
| `reports` | Reportes y analytics | `analytics_*` |
| `rewards` | Puntos y recompensas | `points`, `points_transactions`, `rewards` |
| `bookings` | Reservaciones | `bookings`, `services` |

---

## 🔧 Cómo Usar Este Skill

Para crear un nuevo Skill, proporciona un prompt con el siguiente formato:

```
Usando el skill gymtime-skill-builder, crea un nuevo skill con estos datos:

- Nombre: {nombre-en-kebab-case}
- Problema: {descripción del problema}
- Área: {área del sistema}
- Acciones: 
  1. {acción 1}
  2. {acción 2}
- Triggers: {cuándo se activa}
- Restricciones: {reglas de negocio}
```

---

## 📁 Ubicación de Skills Generados

Todos los Skills creados deben ubicarse en:

```
/Users/josuerivera/Desktop/gymTime/skills/{nombre-del-skill}/SKILL.md
```

---

*Este Skill fue creado siguiendo el estándar de Antigravity Skills para el proyecto GymTime.*
