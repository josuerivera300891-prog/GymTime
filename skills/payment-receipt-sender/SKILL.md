---
name: payment-receipt-sender
description: Envía recibos de pago automáticamente por WhatsApp después de cada transacción
project: GymTime
area: payments
triggers: [webhook-payment-success, manual]
dependencies: [twilio, stripe, supabase]
priority: P0
---

# Payment Receipt Sender

## 🎯 Objetivo

Enviar comprobantes de pago profesionales inmediatamente después de cada transacción exitosa, mejorando la experiencia del cliente y cumpliendo con requisitos fiscales.

---

## ⚡ Triggers

| Trigger | Descripción |
|---------|-------------|
| Stripe Webhook | `payment_intent.succeeded` |
| Pago en efectivo | Al registrar pago manual |
| Manual | Admin solicita reenvío |

---

## 📋 Acciones

1. **Detectar pago exitoso**
   - Webhook de Stripe o inserción en tabla `payments`

2. **Generar datos del recibo**
   ```typescript
   {
     receipt_number: 'REC-2026-00001',
     member_name: 'Juan Pérez',
     concept: 'Membresía Mensual',
     amount: 'Q350.00',
     payment_method: 'Tarjeta ****1234',
     date: '07/02/2026',
     gym_name: 'GYM NICA',
     next_due: '07/03/2026'
   }
   ```

3. **Enviar WhatsApp**
   ```
   🧾 *Recibo de Pago*
   
   {gym_name}
   ─────────────
   📋 No.: {receipt_number}
   👤 Cliente: {member_name}
   💳 Concepto: {concept}
   💰 Monto: {currency}{amount}
   📅 Fecha: {date}
   
   ¡Gracias por tu pago! 💪
   ```

4. **Actualizar registro**
   - Marcar `receipt_sent = true`
   - Guardar en `whatsapp_outbox`

---

## 🗃️ Datos Requeridos

| Tabla | Campos |
|-------|--------|
| `payments` | id, member_id, tenant_id, amount, payment_method, created_at |
| `members` | id, name, phone, whatsapp_verified |
| `tenants` | id, name, currency_symbol, whatsapp_number |
| `memberships` | id, plan_id, end_date |
| `membership_plans` | id, name, price |

---

## 🔌 Integraciones

| Servicio | Uso |
|----------|-----|
| **Stripe** | Webhooks de pagos |
| **Twilio** | Envío de WhatsApp |
| **Supabase** | Almacenamiento |

---

## 🚫 Restricciones

1. ✅ Solo enviar a miembros con `whatsapp_verified = true`
2. ✅ No enviar duplicados (verificar `receipt_sent`)
3. ✅ Respetar moneda del tenant
4. ✅ Incluir número de recibo único
5. ✅ Template aprobado por Meta

---

## 📁 Endpoints Sugeridos

```
POST /api/webhooks/stripe         # Webhook de Stripe
POST /api/receipts/send           # Envío manual
```

---

## 📊 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Recibos enviados | 100% de pagos |
| Tiempo de envío | < 30 segundos |
| Satisfacción cliente | +20% |
