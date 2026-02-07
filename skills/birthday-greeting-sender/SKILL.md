---
name: birthday-greeting-sender
description: Envía felicitaciones de cumpleaños automáticas a los miembros
project: GymTime
area: notifications
triggers: [cron-daily-7am]
dependencies: [twilio, supabase]
priority: P1
---

# Birthday Greeting Sender

## 🎯 Objetivo

Fidelizar a los miembros enviando felicitaciones personalizadas el día de su cumpleaños, opcionalmente con un beneficio especial (puntos, descuento, día gratis).

---

## ⚡ Triggers

| Trigger | Frecuencia | Descripción |
|---------|------------|-------------|
| Cron Job | Diario 7:00 AM | Verifica cumpleaños del día |

---

## 📋 Acciones

1. **Consultar cumpleaños del día**
   ```sql
   SELECT m.*, t.name as gym_name, t.whatsapp_number
   FROM members m
   JOIN tenants t ON m.tenant_id = t.id
   WHERE EXTRACT(MONTH FROM m.birthdate) = EXTRACT(MONTH FROM CURRENT_DATE)
   AND EXTRACT(DAY FROM m.birthdate) = EXTRACT(DAY FROM CURRENT_DATE)
   AND m.status = 'ACTIVE'
   AND m.whatsapp_verified = true
   ```

2. **Asignar beneficio (opcional)**
   ```sql
   INSERT INTO points_transactions (member_id, points, type, description)
   VALUES ({member_id}, {birthday_bonus}, 'birthday', 'Bonus de Cumpleaños 🎂')
   ```

3. **Enviar felicitación**
   ```
   🎂 ¡Feliz Cumpleaños, {nombre}! 🎉
   
   Todo el equipo de {gym_name} te desea un día increíble.
   
   🎁 Como regalo, te hemos añadido {points} puntos a tu cuenta.
   
   ¡Disfruta tu día y te esperamos pronto! 💪
   ```

4. **Registrar envío**
   - Insertar en `whatsapp_outbox`
   - Marcar `birthday_greeting_sent_{year} = true`

---

## 🗃️ Datos Requeridos

| Tabla | Campos |
|-------|--------|
| `members` | id, name, birthdate, phone, whatsapp_verified, tenant_id |
| `tenants` | id, name, whatsapp_number |
| `points_transactions` | member_id, points, type, description |
| `whatsapp_outbox` | tenant_id, phone, body, status |

---

## ⚙️ Configuración por Tenant

| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `birthday_bonus_points` | Puntos de regalo | 50 |
| `birthday_message_template` | Mensaje personalizado | Template default |
| `birthday_greeting_enabled` | Activo/Inactivo | true |

---

## 🔌 Integraciones

| Servicio | Uso |
|----------|-----|
| **Twilio** | Envío de WhatsApp |
| **Supabase** | Queries y transacciones de puntos |
| **Vercel Cron** | Scheduler |

---

## 🚫 Restricciones

1. ✅ Solo miembros activos
2. ✅ Solo con `whatsapp_verified = true`
3. ✅ Una vez por año por miembro
4. ✅ Respetar timezone del tenant
5. ✅ No enviar a menores de edad sin consentimiento

---

## 📁 Endpoint Sugerido

```
POST /api/jobs/birthday-greetings
```

---

## 📊 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Felicitaciones enviadas | 100% de cumpleañeros |
| Engagement post-felicitación | +25% visitas esa semana |
| NPS mejora | +10 puntos |
