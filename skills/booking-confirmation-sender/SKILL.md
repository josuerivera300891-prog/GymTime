---
name: booking-confirmation-sender
description: Envía confirmación de reserva por WhatsApp al crear una cita
project: GymTime
area: bookings
triggers: [booking-created]
dependencies: [twilio, supabase]
priority: P0
---

# Booking Confirmation Sender

## 🎯 Objetivo

Confirmar inmediatamente las reservas de clases, citas con entrenadores o servicios, proporcionando todos los detalles necesarios y reduciendo no-shows.

---

## ⚡ Triggers

| Trigger | Descripción |
|---------|-------------|
| Booking Created | Al insertar en tabla `bookings` |
| Manual | Admin reenvía confirmación |

---

## 📋 Acciones

1. **Detectar nueva reserva**
   ```sql
   -- Trigger en Supabase o listener
   SELECT 
     b.*,
     m.name as member_name,
     m.phone,
     s.name as service_name,
     s.duration_minutes,
     tr.name as trainer_name,
     t.name as gym_name,
     t.address
   FROM bookings b
   JOIN members m ON b.member_id = m.id
   JOIN services s ON b.service_id = s.id
   LEFT JOIN trainers tr ON b.trainer_id = tr.id
   JOIN tenants t ON b.tenant_id = t.id
   WHERE b.id = {new_booking_id}
   ```

2. **Formatear fecha y hora**
   ```typescript
   const formattedDate = format(booking.date, 'EEEE d MMMM', { locale: es });
   const formattedTime = format(booking.time, 'h:mm a');
   ```

3. **Enviar confirmación**
   ```
   ✅ *Reserva Confirmada*
   ━━━━━━━━━━━━━━━━━━━
   
   👤 {member_name}
   📍 {gym_name}
   
   📅 {dia_semana}, {fecha}
   🕐 {hora} ({duracion} min)
   🏋️ {servicio}
   👨‍🏫 Entrenador: {trainer_name}
   
   📍 {direccion}
   
   ⚠️ Llega 10 min antes.
   Para cancelar, responde CANCELAR.
   
   ¡Te esperamos! 💪
   ```

4. **Actualizar booking**
   ```sql
   UPDATE bookings
   SET confirmation_sent = true,
       confirmation_sent_at = NOW()
   WHERE id = {booking_id}
   ```

5. **Agregar a calendar (opcional)**
   - Generar link de Google Calendar
   - Incluir en mensaje

---

## 🗃️ Datos Requeridos

| Tabla | Campos |
|-------|--------|
| `bookings` | id, member_id, service_id, trainer_id, date, time, status |
| `members` | id, name, phone, whatsapp_verified |
| `services` | id, name, duration_minutes, description |
| `trainers` | id, name |
| `tenants` | id, name, address, whatsapp_number |

---

## 🔌 Integraciones

| Servicio | Uso |
|----------|-----|
| **Twilio** | Envío WhatsApp |
| **Supabase** | Trigger/Queries |
| **Google Calendar** | Link de evento (opcional) |

---

## 🚫 Restricciones

1. ✅ Solo enviar si `whatsapp_verified = true`
2. ✅ No enviar duplicados (verificar `confirmation_sent`)
3. ✅ Incluir política de cancelación
4. ✅ Template aprobado por Meta

---

## 📤 Respuestas Automáticas

| Mensaje | Acción |
|---------|--------|
| "CANCELAR" | Cancela reserva y notifica |
| "CAMBIAR" | Envía opciones de horario |
| "AYUDA" | Envía contacto de recepción |

---

## 📁 Endpoints Sugeridos

```
POST /api/bookings              # Crea y dispara confirmación
POST /api/bookings/:id/resend   # Reenviar confirmación
POST /api/webhooks/booking-response  # Respuestas de usuario
```

---

## 📊 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Confirmaciones enviadas | 100% |
| No-shows reducidos | -40% |
| Satisfacción del cliente | +25% |
