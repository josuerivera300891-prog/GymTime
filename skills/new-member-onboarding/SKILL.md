---
name: new-member-onboarding
description: Secuencia de bienvenida automatizada para nuevos miembros
project: GymTime
area: members
triggers: [member-created, membership-activated]
dependencies: [twilio, supabase]
priority: P0
---

# New Member Onboarding

## 🎯 Objetivo

Dar la bienvenida a nuevos miembros con una secuencia de mensajes que los guíe en sus primeros días, aumentando la retención temprana y el engagement.

---

## ⚡ Triggers

| Trigger | Momento | Descripción |
|---------|---------|-------------|
| Día 0 | Al crear cuenta | Bienvenida + descarga PWA |
| Día 1 | 24h después | Recordatorio primera visita |
| Día 3 | 72h después | Tips del gym + tour |
| Día 7 | 1 semana | Check-in de satisfacción |

---

## 📋 Secuencia de Mensajes

### Día 0: Bienvenida Inmediata
```
¡Bienvenido/a a {gym_name}, {nombre}! 🎉

Tu membresía {plan_name} ya está activa.

📱 Descarga nuestra app para:
- Check-in con QR
- Ver tu progreso
- Acumular puntos

🔗 Instalar: {pwa_link}

¿Dudas? Escríbenos aquí mismo.
```

### Día 1: Primera Visita
```
¡Hola {nombre}! 👋

¿Ya diste tu primera vuelta por {gym_name}?

Recuerda que el staff está para ayudarte con:
- Orientación de equipos
- Rutinas iniciales
- Cualquier duda

¡Te esperamos! 💪
```

### Día 3: Tips y Tour
```
{nombre}, ¿cómo va todo? 🏋️

Algunos tips para aprovechar al máximo:

✅ Las horas menos llenas: 6-8am y 2-4pm
✅ Toallas disponibles en recepción
✅ Casilleros: usa tu candado

¿Quieres un tour guiado? Pregunta en recepción 😊
```

### Día 7: Check-in
```
¡1 semana en {gym_name}! 🎊

¿Cómo ha sido tu experiencia?

⭐⭐⭐⭐⭐

Responde con un número del 1 al 5.
Tu feedback nos ayuda a mejorar.
```

---

## 🗃️ Datos Requeridos

| Tabla | Campos |
|-------|--------|
| `members` | id, name, phone, created_at, onboarding_step |
| `memberships` | id, member_id, plan_id, start_date |
| `membership_plans` | id, name |
| `tenants` | id, name, pwa_url, whatsapp_number |
| `onboarding_messages` | member_id, step, sent_at, response |

---

## ⚙️ Configuración por Tenant

| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `onboarding_enabled` | Activar secuencia | true |
| `onboarding_day1_delay` | Horas para día 1 | 24 |
| `onboarding_day3_delay` | Horas para día 3 | 72 |
| `onboarding_day7_delay` | Horas para día 7 | 168 |

---

## 🔌 Integraciones

| Servicio | Uso |
|----------|-----|
| **Twilio** | Envío de WhatsApp |
| **Supabase** | Tracking de pasos |
| **Supabase Edge** | Scheduled functions |

---

## 🚫 Restricciones

1. ✅ Solo miembros con `whatsapp_verified = true`
2. ✅ Respetar horario (no enviar de noche)
3. ✅ No repetir mensaje si ya se envió
4. ✅ Pausar si miembro responde negativamente
5. ✅ Detener si membresía se cancela

---

## 📁 Endpoints Sugeridos

```
POST /api/jobs/onboarding-sequence  # Cron diario
POST /api/onboarding/trigger/:step  # Trigger manual
```

---

## 📊 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Tasa de instalación PWA | > 60% |
| Primera visita en 7 días | > 80% |
| NPS semana 1 | > 8.0 |
