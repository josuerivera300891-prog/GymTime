---
name: streak-tracker
description: Rastrea rachas de asistencia y otorga recompensas por consistencia
project: GymTime
area: check-in
triggers: [checkin-registered]
dependencies: [supabase]
priority: P1
---

# Streak Tracker

## 🎯 Objetivo

Motivar la asistencia constante rastreando días consecutivos de visita, celebrando hitos y otorgando puntos bonus por mantener rachas.

---

## ⚡ Triggers

| Trigger | Descripción |
|---------|-------------|
| Check-in | Al registrar entrada |
| Cron Nocturno | Resetear rachas rotas |

---

## 📋 Acciones

1. **Al registrar check-in**
   ```sql
   -- Obtener racha actual
   SELECT streak_current, streak_best, last_checkin_date
   FROM member_streaks
   WHERE member_id = {member_id}
   ```

2. **Evaluar continuidad**
   ```typescript
   const today = new Date();
   const lastVisit = new Date(streak.last_checkin_date);
   const daysDiff = differenceInCalendarDays(today, lastVisit);
   
   if (daysDiff === 0) {
     // Ya visitó hoy, no contar
   } else if (daysDiff === 1) {
     // Día consecutivo, incrementar
     newStreak = streak.streak_current + 1;
   } else {
     // Racha rota, reiniciar
     newStreak = 1;
   }
   ```

3. **Celebrar hitos**
   | Racha | Recompensa | Mensaje |
   |-------|------------|---------|
   | 7 días | +50 pts | 🔥 ¡1 semana sin fallar! |
   | 14 días | +100 pts | 💪 ¡2 semanas de disciplina! |
   | 30 días | +200 pts | 🏆 ¡1 mes imparable! |
   | 60 días | +400 pts | 🌟 ¡Leyenda del gym! |
   | 100 días | +1000 pts | 👑 ¡CENTURIÓN! |

4. **Actualizar registro**
   ```sql
   UPDATE member_streaks
   SET streak_current = {new_streak},
       streak_best = GREATEST(streak_best, {new_streak}),
       last_checkin_date = CURRENT_DATE
   WHERE member_id = {member_id}
   ```

5. **Otorgar puntos por hito**
   ```sql
   INSERT INTO points_transactions (member_id, points, type, description)
   VALUES ({member_id}, {bonus_points}, 'streak', 'Racha de {days} días')
   ```

---

## 🗃️ Datos Requeridos

| Tabla | Campos |
|-------|--------|
| `member_streaks` | member_id, streak_current, streak_best, last_checkin_date |
| `attendance` | member_id, check_in_at |
| `points_transactions` | member_id, points, type, description |

---

## ⚙️ Configuración por Tenant

| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `streak_7_bonus` | Puntos por 7 días | 50 |
| `streak_14_bonus` | Puntos por 14 días | 100 |
| `streak_30_bonus` | Puntos por 30 días | 200 |
| `streak_notifications` | Enviar notificación | true |

---

## 🔌 Integraciones

| Servicio | Uso |
|----------|-----|
| **Supabase** | Almacenamiento de rachas |
| **PWA** | Mostrar racha en dashboard |
| **Twilio** | Notificar hitos (opcional) |

---

## 🚫 Restricciones

1. ✅ Contar solo 1 check-in por día calendario
2. ✅ Respetar timezone del tenant
3. ✅ No resetear por días de cierre del gym
4. ✅ Considerar días de descanso configurables

---

## 📤 Respuesta al Check-in

```json
{
  "streak": {
    "current": 15,
    "best": 23,
    "milestone_reached": true,
    "bonus_earned": 100,
    "message": "💪 ¡2 semanas seguidas! +100 puntos"
  }
}
```

---

## 📊 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Miembros con racha >7 | > 40% |
| Promedio de racha | > 5 días |
| Retención +30% por gamificación | Sí |
