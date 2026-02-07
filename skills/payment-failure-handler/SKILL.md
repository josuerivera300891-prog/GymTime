---
name: payment-failure-handler
description: Maneja fallos de pago recurrentes, notifica y programa reintentos
project: GymTime
area: payments
triggers: [stripe-webhook-payment-failed]
dependencies: [stripe, twilio, supabase]
priority: P0
---

# Payment Failure Handler

## 🎯 Objetivo

Gestionar proactivamente los fallos de pago para evitar pérdida de ingresos, mantener informados a admins y miembros, y automatizar reintentos.

---

## ⚡ Triggers

| Trigger | Descripción |
|---------|-------------|
| Stripe Webhook | `payment_intent.payment_failed` |
| Stripe Webhook | `invoice.payment_failed` |

---

## 📋 Acciones

1. **Recibir webhook de fallo**
   ```typescript
   // Extraer datos
   const { payment_intent, customer, failure_code } = event.data.object;
   ```

2. **Identificar membresía afectada**
   ```sql
   SELECT m.*, mb.name, mb.phone, t.name as gym_name
   FROM memberships m
   JOIN members mb ON m.member_id = mb.id
   JOIN tenants t ON m.tenant_id = t.id
   WHERE m.stripe_subscription_id = {subscription_id}
   ```

3. **Actualizar estado**
   ```sql
   UPDATE memberships 
   SET payment_status = 'failed', 
       failed_attempts = failed_attempts + 1
   WHERE id = {membership_id}
   ```

4. **Notificar al miembro**
   ```
   ⚠️ Pago no procesado
   
   Hola {nombre}, tu pago de {monto} para {gym_name} no pudo procesarse.
   
   Motivo: {failure_reason}
   
   🔗 Actualiza tu método de pago: {link}
   
   Tienes 3 días antes de la suspensión temporal.
   ```

5. **Notificar al admin**
   - Push notification al dashboard
   - Email con resumen

6. **Programar reintento**
   - Día 1: Primer intento automático
   - Día 3: Segundo intento
   - Día 5: Último intento, luego suspender

---

## 🗃️ Datos Requeridos

| Tabla | Campos |
|-------|--------|
| `memberships` | id, member_id, payment_status, failed_attempts, stripe_subscription_id |
| `members` | id, name, phone, email |
| `tenants` | id, name, admin_email |
| `payment_failures` | id, membership_id, reason, created_at, retry_count |

---

## 🔌 Integraciones

| Servicio | Uso |
|----------|-----|
| **Stripe** | Webhooks y reintentos |
| **Twilio** | Notificación al miembro |
| **Push API** | Notificación al admin |

---

## 🚫 Restricciones

1. ✅ Máximo 3 reintentos
2. ✅ 3 días de gracia antes de suspender
3. ✅ No cobrar cargos por reintento
4. ✅ Mantener acceso durante periodo de gracia
5. ✅ Registrar cada intento en log

---

## 🔄 Flujo de Estados

```
ACTIVE → PAYMENT_FAILED → GRACE_PERIOD → SUSPENDED
                ↓
          (si paga)
                ↓
             ACTIVE
```

---

## 📁 Endpoints Sugeridos

```
POST /api/webhooks/stripe         # Webhook de Stripe
POST /api/payments/retry          # Reintento manual
```

---

## 📊 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Recuperación en 1er reintento | > 60% |
| Recuperación total | > 85% |
| Tiempo promedio resolución | < 48 horas |
