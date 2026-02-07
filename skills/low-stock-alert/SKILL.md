---
name: low-stock-alert
description: Alerta cuando el inventario de productos está bajo
project: GymTime
area: store
triggers: [product-sale, cron-daily]
dependencies: [supabase, push-notifications]
priority: P1
---

# Low Stock Alert

## 🎯 Objetivo

Prevenir pérdida de ventas alertando al admin cuando un producto está por agotarse, permitiendo reabastecer a tiempo.

---

## ⚡ Triggers

| Trigger | Descripción |
|---------|-------------|
| Al vender | Verifica stock después de cada venta |
| Cron Diario | Reporte matutino de stock bajo |

---

## 📋 Acciones

1. **Verificar stock post-venta**
   ```sql
   SELECT p.id, p.name, p.stock_quantity, p.low_stock_threshold
   FROM products p
   WHERE p.id = {sold_product_id}
   AND p.stock_quantity <= p.low_stock_threshold
   AND p.tenant_id = {tenant_id}
   ```

2. **Generar alerta si aplica**
   ```typescript
   if (product.stock_quantity <= product.low_stock_threshold) {
     await sendLowStockAlert({
       product_name: product.name,
       current_stock: product.stock_quantity,
       threshold: product.low_stock_threshold,
       tenant_id: product.tenant_id
     });
   }
   ```

3. **Reporte diario**
   ```sql
   SELECT p.name, p.stock_quantity, p.low_stock_threshold,
          (p.low_stock_threshold - p.stock_quantity) as deficit
   FROM products p
   WHERE p.stock_quantity <= p.low_stock_threshold
   AND p.tenant_id = {tenant_id}
   AND p.is_active = true
   ORDER BY deficit DESC
   ```

4. **Enviar notificación Push al Admin**
   ```json
   {
     "title": "⚠️ Stock Bajo",
     "body": "Proteína Whey: quedan solo 3 unidades",
     "action": "/admin/products",
     "urgency": "high"
   }
   ```

5. **Enviar resumen diario por WhatsApp (opcional)**
   ```
   📦 Reporte de Stock Bajo - {fecha}
   
   ⚠️ {count} productos por agotarse:
   
   • Proteína Whey: 3 unidades
   • Barras energéticas: 5 unidades
   • Guantes talla M: 2 unidades
   
   👉 Revisar inventario
   ```

---

## 🗃️ Datos Requeridos

| Tabla | Campos |
|-------|--------|
| `products` | id, name, stock_quantity, low_stock_threshold, tenant_id |
| `product_sales` | product_id, quantity, created_at |
| `tenants` | id, admin_phone, whatsapp_number |
| `push_subscriptions` | user_id, subscription_data |

---

## ⚙️ Configuración por Tenant

| Parámetro | Descripción | Default |
|-----------|-------------|---------|
| `low_stock_threshold_default` | Umbral por defecto | 5 |
| `low_stock_alert_push` | Enviar push | true |
| `low_stock_alert_whatsapp` | Enviar WhatsApp diario | false |
| `low_stock_report_time` | Hora del reporte | 8:00 AM |

---

## 🔌 Integraciones

| Servicio | Uso |
|----------|-----|
| **Supabase** | Queries de inventario |
| **Push API** | Notificaciones al admin |
| **Twilio** | Reporte WhatsApp (opcional) |

---

## 🚫 Restricciones

1. ✅ Solo productos activos (`is_active = true`)
2. ✅ No alertar duplicado en mismo día
3. ✅ Respetar horario del admin (no notificar de noche)
4. ✅ Agrupar alertas si hay múltiples productos

---

## 📁 Endpoints Sugeridos

```
POST /api/jobs/stock-check       # Cron diario
POST /api/stock/alert            # Trigger post-venta
```

---

## 📊 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Productos agotados | 0 |
| Tiempo respuesta a alerta | < 24h |
| Pérdida de ventas por stock | < 2% |
