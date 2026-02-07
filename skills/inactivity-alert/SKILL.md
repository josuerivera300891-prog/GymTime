---
name: inactivity-alert
description: Detecta miembros inactivos y envía mensajes de reactivación
project: GymTime
area: notifications
triggers: [cron-weekly]
dependencies: [twilio, supabase]
priority: P1
---

# Inactivity Alert

## 🎯 Objetivo

Identificar miembros que no han asistido al gimnasio en un período determinado y enviar mensajes personalizados para motivar su regreso, reduciendo la tasa de abandono.

---

## ⚡ Triggers

| Trigger | Frecuencia | Descripción |
|---------|------------|-------------|
| Cron Job | Semanal (Lunes 9AM) | Analiza inactividad |
| Umbrales | 7, 14, 30 días | Diferentes mensajes según tiempo |

---

## 📋 Acciones

1. **Consultar miembros inactivos**
   ```sql
   SELECT m.*, 
          t.name as gym_name,
          COALESCE(MAX(a.check_in_at), m.created_at) as last_visit,
          CURRENT_DATE - COALESCE(MAX(a.check_in_at)::date, m.created_at::date) as days_inactive
   FROM members m
   JOIN tenants t ON m.tenant_id = t.id
   LEFT JOIN attendance a ON m.id = a.member_id
   WHERE m.status = 'ACTIVE'
   AND m.whatsapp_verified = true
   GROUP BY m.id, t.id
   HAVING CURRENT_DATE - COALESCE(MAX(a.check_in_at)::date, m.created_at::date) >= 7
   ```

2. **Clasificar por nivel de inactividad**
   - 7-13 días → Mensaje suave
   - 14-29 días → Mensaje motivacional
   - 30+ días → Mensaje con incentivo

3. **Enviar mensaje personalizado**

   **7 días:**
   ```
   ¡Hola {nombre}! 👋
   
   Te extrañamos en {gym_name}. 
   ¡Han pasado {dias} días desde tu última visita!
   
   ¿Todo bien? Tu próximo entrenamiento te espera 💪
   ```

   **14 días:**
   ```
   ¡Hey {nombre}! 🏋️
   
   Sabemos que la vida puede ser intensa, pero no olvides que el gym te ayuda a manejar el estrés.
   
   ¡Te esperamos para retomar tu rutina!
   ```

   **30+ días:**
   ```
   {nombre}, te regalamos {puntos} puntos 🎁
   
   Ha pasado un tiempo desde que te vimos. 
   Vuelve esta semana y reclama tu regalo.
   
   ¡El equipo de {gym_name} te espera! 💪
   ```

4. **Registrar y no repetir**
   - Guardar fecha de último mensaje de reactivación
   - No enviar más de 1 mensaje por semana

---

## 🗃️ Datos Requeridos

| Tabla | Campos |
|-------|--------|
| `members` | id, name, phone, status, whatsapp_verified, tenant_id |
| `attendance` | id, member_id, check_in_at |
| `tenants` | id, name, whatsapp_number |
| `reactivation_messages` | member_id, sent_at, message_type |

---

## ⚙️ Configuración por Tenant

| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `inactivity_threshold_soft` | Días para mensaje suave | 7 |
| `inactivity_threshold_medium` | Días para mensaje medio | 14 |
| `inactivity_threshold_hard` | Días para incentivo | 30 |
| `inactivity_bonus_points` | Puntos de regalo | 25 |

---

## 🔌 Integraciones

| Servicio | Uso |
|----------|-----|
| **Twilio** | Envío de WhatsApp |
| **Supabase** | Análisis de asistencia |
| **Vercel Cron** | Scheduler semanal |

---

## 🚫 Restricciones

1. ✅ Solo miembros activos con membresía vigente
2. ✅ Solo con `whatsapp_verified = true`
3. ✅ Máximo 1 mensaje de reactivación por semana
4. ✅ No enviar si ya visitó esta semana
5. ✅ Respetar opt-out de marketing

---

## 📁 Endpoint Sugerido

```
POST /api/jobs/inactivity-alerts
```

---

## 📊 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Tasa de reactivación en 7 días | > 30% |
| Reducción de churn | -20% |
| Click rate en incentivos | > 15% |
