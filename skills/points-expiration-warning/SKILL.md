---
name: points-expiration-warning
description: Avisa a miembros cuando sus puntos están por vencer
project: GymTime
area: rewards
triggers: [cron-weekly]
dependencies: [twilio, supabase]
priority: P1
---

# Points Expiration Warning

## 🎯 Objetivo

Evitar que los miembros pierdan puntos acumulados notificándoles antes del vencimiento, incentivando el canje y la visita al gym.

---

## ⚡ Triggers

| Trigger | Frecuencia | Descripción |
|---------|------------|-------------|
| Cron Job | Semanal (Miércoles) | Verifica puntos por vencer |
| Días antes | 30, 7, 1 | Diferentes niveles de urgencia |

---

## 📋 Acciones

1. **Consultar puntos por vencer**
   ```sql
   SELECT 
     m.id as member_id,
     m.name,
     m.phone,
     SUM(pt.points) as expiring_points,
     MIN(pt.expires_at) as first_expiration
   FROM members m
   JOIN points_transactions pt ON m.id = pt.member_id
   WHERE pt.expires_at BETWEEN NOW() AND NOW() + INTERVAL '30 days'
   AND pt.status = 'active'
   AND pt.points > 0
   AND m.whatsapp_verified = true
   GROUP BY m.id
   HAVING SUM(pt.points) > 0
   ```

2. **Clasificar urgencia**
   | Días restantes | Urgencia | Emoji |
   |----------------|----------|-------|
   | 30 días | Baja | 📅 |
   | 7 días | Media | ⚠️ |
   | 1-3 días | Alta | 🚨 |

3. **Enviar mensaje personalizado**

   **30 días:**
   ```
   📅 {nombre}, tienes {puntos} puntos que vencen el {fecha}.
   
   ¡Canjéalos por premios antes de perderlos!
   
   🎁 Ver catálogo: {link}
   ```

   **7 días:**
   ```
   ⚠️ ¡{puntos} puntos vencen en 7 días!
   
   No pierdas lo que ganaste, {nombre}.
   
   Pasa por el gym esta semana y canjea.
   
   🎁 Premios disponibles: {link}
   ```

   **1-3 días:**
   ```
   🚨 ¡ÚLTIMOS DÍAS!
   
   {nombre}, {puntos} puntos vencen el {fecha}.
   
   Visítanos HOY y no los pierdas.
   
   ⏰ Horario: {horario}
   ```

4. **Registrar notificación**
   ```sql
   INSERT INTO points_notifications (member_id, notified_at, expiring_points, days_remaining)
   VALUES ({member_id}, NOW(), {points}, {days})
   ```

---

## 🗃️ Datos Requeridos

| Tabla | Campos |
|-------|--------|
| `members` | id, name, phone, whatsapp_verified |
| `points_transactions` | member_id, points, expires_at, status |
| `points_notifications` | member_id, notified_at, days_remaining |
| `tenants` | id, name, whatsapp_number |

---

## ⚙️ Configuración por Tenant

| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `points_validity_days` | Días de validez | 365 |
| `points_warning_30` | Avisar a 30 días | true |
| `points_warning_7` | Avisar a 7 días | true |
| `points_warning_1` | Avisar a 1-3 días | true |

---

## 🔌 Integraciones

| Servicio | Uso |
|----------|-----|
| **Twilio** | Envío de WhatsApp |
| **Supabase** | Queries y tracking |
| **Vercel Cron** | Scheduler semanal |

---

## 🚫 Restricciones

1. ✅ Solo miembros con puntos > 0 por vencer
2. ✅ Solo `whatsapp_verified = true`
3. ✅ Máximo 1 notificación por nivel de urgencia
4. ✅ No notificar si ya canjeó esta semana
5. ✅ Respetar opt-out de marketing

---

## 📁 Endpoint Sugerido

```
POST /api/jobs/points-expiration-check
```

---

## 📊 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Puntos canjeados pre-expiración | > 70% |
| Puntos perdidos | < 10% |
| Visitas por notificación | +15% |
