---
name: membership-expiration-reminder
description: Envía recordatorios automáticos de vencimiento de membresía por WhatsApp
project: GymTime
area: memberships
triggers: [cron-daily-8am]
dependencies: [twilio, supabase]
priority: P0
status: IMPLEMENTED ✅
endpoint: /api/jobs/daily
---

# Membership Expiration Reminder

## 🎯 Objetivo

Reducir la tasa de abandono enviando recordatorios proactivos a los miembros cuya membresía está próxima a vencer, dándoles tiempo para renovar antes de perder acceso.

---

## ✅ Estado: IMPLEMENTADO

**Archivo:** `/src/app/api/jobs/daily/route.ts`
**Cron:** Diario a las 8:00 AM (configurado en `vercel.json`)

---

## ⚡ Triggers Implementados

| Trigger | Frecuencia | Descripción |
|---------|------------|-------------|
| Cron Job | Diario 8:00 AM | Ejecuta verificación de vencimientos |
| 5 días antes | `REMINDER_5D` | Recordatorio temprano |
| 2 días antes | `REMINDER_2D` | Recordatorio de urgencia |
| Día de vencimiento | `DUE_TODAY` | Aviso del día |
| 3 días después | `RECOVERY_3D` | Mensaje de recuperación |

---

## 📋 Flujo Implementado

1. **Consulta membresías** con relación a `members` y `tenants`
2. **Calcula estado** (ACTIVE, EXPIRING, EXPIRED)
3. **Actualiza** el status del miembro
4. **Genera notificaciones** según los días restantes
5. **Registra en `reminders_log`** para evitar duplicados
6. **Inserta en `push_outbox`** para notificaciones push
7. **Inserta en `whatsapp_outbox`** para mensajes WhatsApp

---

## 🗃️ Tablas Utilizadas

| Tabla | Uso |
|-------|-----|
| `memberships` | Obtener fechas de vencimiento |
| `members` | Datos del miembro (nombre, teléfono) |
| `tenants` | Nombre del gym |
| `reminders_log` | Control de duplicados |
| `push_outbox` | Cola de push notifications |
| `whatsapp_outbox` | Cola de WhatsApp |

---

## 🔐 Seguridad

- Requiere header `Authorization: Bearer {CRON_SECRET}`
- Solo Vercel Cron puede ejecutar

---

## 📊 Verificación

```bash
# Test manual (con CRON_SECRET)
curl -X POST http://localhost:3000/api/jobs/daily \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 📈 Mejoras Futuras

- [ ] Agregar link de renovación en mensaje
- [ ] Incluir racha de asistencia en mensaje
- [ ] Personalizar mensajes por plan de membresía
