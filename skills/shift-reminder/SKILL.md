---
name: shift-reminder
description: Recordatorio automático de turno para personal del gym
project: GymTime
area: staff
triggers: [cron-6am]
dependencies: [twilio, supabase]
priority: P1
---

# Shift Reminder

## 🎯 Objetivo

Reducir ausencias y retrasos del personal enviando recordatorios de turno el día que corresponde, incluyendo detalles importantes.

---

## ⚡ Triggers

| Trigger | Frecuencia | Descripción |
|---------|------------|-------------|
| Cron Job | Diario 6:00 AM | Verifica turnos del día |

---

## 📋 Acciones

1. **Consultar turnos del día**
   ```sql
   SELECT 
     ss.id as shift_id,
     ss.start_time,
     ss.end_time,
     su.name as staff_name,
     su.phone,
     t.name as gym_name
   FROM scheduled_shifts ss
   JOIN staff_users su ON ss.staff_user_id = su.id
   JOIN tenants t ON ss.tenant_id = t.id
   WHERE DATE(ss.shift_date) = CURRENT_DATE
   AND ss.status = 'scheduled'
   AND su.whatsapp_verified = true
   ```

2. **Enviar recordatorio**
   ```
   ☀️ Buenos días, {nombre}!
   
   Recordatorio de tu turno en {gym_name}:
   
   📅 Hoy, {fecha}
   🕐 {hora_inicio} - {hora_fin}
   
   ¿Todo bien para asistir?
   Responde SÍ o NO.
   ```

3. **Registrar envío y respuesta**
   ```sql
   INSERT INTO shift_reminders (shift_id, sent_at, response)
   VALUES ({shift_id}, NOW(), NULL)
   ```

4. **Alertar al admin si responde NO**
   ```
   ⚠️ Alerta de Ausencia
   
   {staff_name} indicó que NO podrá asistir a su turno:
   
   📅 {fecha} {hora_inicio} - {hora_fin}
   
   Busca reemplazo o ajusta horarios.
   ```

---

## 🗃️ Datos Requeridos

| Tabla | Campos |
|-------|--------|
| `scheduled_shifts` | id, staff_user_id, tenant_id, shift_date, start_time, end_time, status |
| `staff_users` | id, name, phone, whatsapp_verified |
| `tenants` | id, name, admin_phone |
| `shift_reminders` | shift_id, sent_at, response |

---

## ⚙️ Configuración por Tenant

| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `shift_reminder_enabled` | Activar recordatorios | true |
| `shift_reminder_time` | Hora de envío | 6:00 AM |
| `shift_reminder_require_confirm` | Pedir confirmación | true |

---

## 🔌 Integraciones

| Servicio | Uso |
|----------|-----|
| **Twilio** | Envío WhatsApp |
| **Supabase** | Queries de turnos |
| **Vercel Cron** | Scheduler |

---

## 🚫 Restricciones

1. ✅ Solo turnos con `status = 'scheduled'`
2. ✅ Solo staff con `whatsapp_verified = true`
3. ✅ No enviar duplicados
4. ✅ Respetar timezone del tenant

---

## 📁 Endpoints Sugeridos

```
POST /api/jobs/shift-reminders
POST /api/shifts/confirm/:id
```

---

## 📊 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Tasa de confirmación | > 95% |
| Ausencias sin aviso | 0 |
| Tiempo de aviso de ausencia | > 2h antes |
