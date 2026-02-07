---
name: qr-checkin-validator
description: Valida códigos QR de miembros y registra entrada/salida
project: GymTime
area: check-in
triggers: [api-call, scan-event]
dependencies: [supabase]
priority: P0
---

# QR Check-in Validator

## 🎯 Objetivo

Validar la identidad del miembro mediante código QR único, verificar estado de membresía, registrar asistencia y controlar acceso al gimnasio.

---

## ⚡ Triggers

| Trigger | Descripción |
|---------|-------------|
| API Call | `POST /api/checkin/validate` |
| Scan Event | Al escanear QR en terminal |

---

## 📋 Acciones

1. **Decodificar QR**
   ```typescript
   // QR contiene: member_id + tenant_id + signature
   const { member_id, tenant_id, sig } = decodeQR(qr_data);
   ```

2. **Validar firma**
   ```typescript
   const isValid = verifySignature(member_id, tenant_id, sig, SECRET_KEY);
   if (!isValid) throw new Error('QR inválido o manipulado');
   ```

3. **Verificar estado del miembro**
   ```sql
   SELECT m.*, ms.status as membership_status, ms.end_date
   FROM members m
   LEFT JOIN memberships ms ON m.id = ms.member_id AND ms.status = 'ACTIVE'
   WHERE m.id = {member_id}
   AND m.tenant_id = {tenant_id}
   ```

4. **Validar condiciones**
   - ✅ Miembro existe
   - ✅ Membresía activa
   - ✅ No vencida
   - ✅ No ya registrado hoy (si check-out no requerido)

5. **Registrar asistencia**
   ```sql
   INSERT INTO attendance (member_id, tenant_id, check_in_at, shift_id)
   VALUES ({member_id}, {tenant_id}, NOW(), {current_shift_id})
   RETURNING *;
   ```

6. **Responder al terminal**
   ```json
   {
     "success": true,
     "member": {
       "name": "Juan Pérez",
       "photo": "url",
       "tier": "Gold",
       "streak": 15
     },
     "message": "¡Bienvenido, Juan! 💪",
     "access": "GRANTED"
   }
   ```

---

## 🗃️ Datos Requeridos

| Tabla | Campos |
|-------|--------|
| `members` | id, name, photo_url, tenant_id, qr_code |
| `memberships` | id, member_id, status, end_date |
| `attendance` | id, member_id, check_in_at, check_out_at, shift_id |
| `shifts` | id, tenant_id, started_at, staff_user_id |
| `member_tiers` | member_id, tier_name |

---

## 🔒 Seguridad

| Aspecto | Implementación |
|---------|----------------|
| Firma QR | HMAC-SHA256 con secret por tenant |
| Expiración | QR válido por 24h (regenerable) |
| Rate limit | Max 1 check-in por 30 min |
| Logging | Registro de intentos fallidos |

---

## 🔌 Integraciones

| Servicio | Uso |
|----------|-----|
| **Supabase** | Validación y registro |
| **PWA** | Mostrar QR al miembro |
| **Terminal** | Escaneo y feedback visual |

---

## 🚫 Restricciones

1. ✅ Verificar tenant_id coincide con ubicación
2. ✅ Membresía debe estar ACTIVE
3. ✅ Membresía no vencida
4. ✅ No permitir check-in duplicado en < 30 min
5. ✅ Registrar intentos fallidos para auditoría

---

## 📤 Respuestas del API

| Código | Caso | Mensaje |
|--------|------|---------|
| 200 | Éxito | "¡Bienvenido, {name}!" |
| 400 | QR inválido | "Código QR no reconocido" |
| 403 | Membresía vencida | "Tu membresía venció el {date}" |
| 403 | Membresía inactiva | "Contacta a recepción" |
| 429 | Rate limited | "Ya registraste entrada recientemente" |

---

## 📁 Endpoints

```
POST /api/checkin/validate     # Validar y registrar
POST /api/checkin/checkout     # Registrar salida
GET  /api/checkin/status/:id   # Ver estado actual
```

---

## 📊 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Tiempo de validación | < 500ms |
| Tasa de éxito | > 99% |
| Intentos fraudulentos detectados | 100% |
