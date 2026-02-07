---
name: daily-summary-generator
description: Genera y envía resumen diario de operaciones al admin
project: GymTime
area: reports
triggers: [cron-daily-9pm]
dependencies: [supabase, twilio]
priority: P1
---

# Daily Summary Generator

## 🎯 Objetivo

Proporcionar al administrador un resumen ejecutivo diario con las métricas clave del negocio, eliminando la necesidad de revisar múltiples reportes.

---

## ⚡ Triggers

| Trigger | Frecuencia | Descripción |
|---------|------------|-------------|
| Cron Job | Diario 9:00 PM | Fin del día operativo |

---

## 📋 Acciones

1. **Recopilar métricas del día**

   **Asistencia:**
   ```sql
   SELECT COUNT(*) as total_checkins,
          COUNT(DISTINCT member_id) as unique_members
   FROM attendance
   WHERE tenant_id = {tenant_id}
   AND DATE(check_in_at) = CURRENT_DATE
   ```

   **Ingresos:**
   ```sql
   SELECT 
     SUM(CASE WHEN type = 'membership' THEN amount ELSE 0 END) as memberships,
     SUM(CASE WHEN type = 'product' THEN amount ELSE 0 END) as products,
     SUM(amount) as total
   FROM payments
   WHERE tenant_id = {tenant_id}
   AND DATE(created_at) = CURRENT_DATE
   AND status = 'completed'
   ```

   **Nuevos miembros:**
   ```sql
   SELECT COUNT(*) as new_members
   FROM members
   WHERE tenant_id = {tenant_id}
   AND DATE(created_at) = CURRENT_DATE
   ```

   **Membresías vencidas:**
   ```sql
   SELECT COUNT(*) as expired_today
   FROM memberships
   WHERE tenant_id = {tenant_id}
   AND DATE(end_date) = CURRENT_DATE
   AND status = 'EXPIRED'
   ```

2. **Comparar con día anterior y semana anterior**
   ```typescript
   const comparison = {
     checkins_vs_yesterday: ((today.checkins - yesterday.checkins) / yesterday.checkins * 100).toFixed(1),
     revenue_vs_last_week: ((today.revenue - lastWeek.revenue) / lastWeek.revenue * 100).toFixed(1)
   };
   ```

3. **Generar y enviar resumen**
   ```
   📊 *Resumen del Día* - {fecha}
   ━━━━━━━━━━━━━━━━━━━
   
   👥 *Asistencia*
   • Check-ins: {total} ({diff}% vs ayer)
   • Miembros únicos: {unique}
   • Hora pico: {peak_hour}
   
   💰 *Ingresos*
   • Membresías: {currency}{memberships}
   • Productos: {currency}{products}
   • Total: {currency}{total} ({diff}% vs semana pasada)
   
   📈 *Crecimiento*
   • Nuevos miembros: {new_members}
   • Vencimientos hoy: {expired}
   • Renovaciones: {renewals}
   
   ⚠️ *Alertas*
   {alerts_list}
   
   ¡Buen trabajo hoy! 💪
   ```

4. **Guardar en historial**
   ```sql
   INSERT INTO daily_summaries (tenant_id, date, data)
   VALUES ({tenant_id}, CURRENT_DATE, {json_data})
   ```

---

## 🗃️ Datos Requeridos

| Tabla | Campos |
|-------|--------|
| `attendance` | member_id, tenant_id, check_in_at |
| `payments` | tenant_id, amount, type, status, created_at |
| `members` | tenant_id, created_at |
| `memberships` | tenant_id, end_date, status |
| `daily_summaries` | tenant_id, date, data |

---

## ⚙️ Configuración por Tenant

| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `daily_summary_enabled` | Activar reporte | true |
| `daily_summary_time` | Hora de envío | 21:00 |
| `daily_summary_channel` | whatsapp/email/push | whatsapp |
| `daily_summary_recipients` | Teléfonos/emails | admin principal |

---

## 🔌 Integraciones

| Servicio | Uso |
|----------|-----|
| **Supabase** | Queries de métricas |
| **Twilio** | Envío WhatsApp |
| **Vercel Cron** | Scheduler |

---

## 🚫 Restricciones

1. ✅ Solo enviar si hubo actividad (>0 check-ins)
2. ✅ Respetar timezone del tenant
3. ✅ No enviar duplicados
4. ✅ Incluir comparación solo si hay datos históricos

---

## 📁 Endpoint Sugerido

```
POST /api/jobs/daily-summary
GET  /api/reports/daily/:date
```

---

## 📊 Estructura del JSON guardado

```json
{
  "date": "2026-02-07",
  "attendance": {
    "total_checkins": 145,
    "unique_members": 98,
    "peak_hour": "18:00"
  },
  "revenue": {
    "memberships": 3500,
    "products": 450,
    "total": 3950
  },
  "growth": {
    "new_members": 3,
    "expired": 2,
    "renewals": 5
  }
}
```
