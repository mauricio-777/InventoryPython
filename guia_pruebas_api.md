Header	Value
X-User-Role	admin
X-User-Id	system

# Guía de Pruebas de API (Backend InventoryApp)

Esta guía documenta los principales servicios (APIs) del sistema, los métodos HTTP requeridos y ejemplos del cuerpo (Body JSON) necesarios para realizar pruebas usando herramientas como Postman, Insomnia, Thunder Client o cURL.

**🔹 URL Base:** `http://localhost:8000/api/v1`

**🔹 Autenticación y Autorización (Headers MVP):** 
Para probar los endpoints protegidos, debes enviar estos encabezados HTTP simulando que ya iniciaste sesión (hasta que se implementen los JWT):
- `X-User-Id`: `(UUID del usuario mock)` o `system`.
- `X-User-Role`: `admin`, `gestor`, `consultor`, `picker`, o `driver`.

---

## 1. 🔐 Autenticación (`/auth`)

### Iniciar Sesión
- **Ruta:** `http://localhost:8000/api/v1/auth/login`
- **Method:** `POST`
- **Headers Requeridos:** Ninguno
- **Body JSON:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

### Solicitar Recuperación de Contraseña
- **Ruta:** `http://localhost:8000/api/v1/auth/forgot-password`
- **Method:** `POST`
- **Body JSON:**
```json
{
  "username": "admin"
}
```

---

## 2. 👤 Usuarios (`/users`)

### Crear Nuevo Usuario
- **Ruta:** `http://localhost:8000/api/v1/users/`
- **Method:** `POST`
- **Headers Requeridos:** `X-User-Role: admin`
- **Body JSON:**
```json
{
  "username": "nuevo_almacenero",
  "email": "almacen@empresa.com",
  "password": "Password123!",
  "role_id": 4
}
```
*(Roles: 1=Admin, 2=Gestor, 3=Consultor, 4=Picker/Almacenero, 5=Driver/Repartidor)*

### Listar Usuarios
- **Ruta:** `http://localhost:8000/api/v1/users/`
- **Method:** `GET`

---

## 3. 📦 Catálogo de Productos (`/products`)

### Crear Producto
- **Ruta:** `http://localhost:8000/api/v1/products/`
- **Method:** `POST`
- **Headers Requeridos:** `X-User-Role: gestor` o `admin`
- **Body JSON:**
```json
{
  "name": "Aceite Lubricante 5W-30",
  "category": "Insumos",
  "unit_measure": "LITRO",
  "sku": "ACE-5W30-01",
  "unit_value": 45.0,
  "is_perishable": true,
  "expiration_date": "2027-12-31T00:00:00",
  "suggested_price": 55.0
}
```

### Listar Productos
- **Ruta:** `http://localhost:8000/api/v1/products/`
- **Method:** `GET`

---

## 4. 🏢 Mapa del Almacén (`/locations`)

### Crear Ubicación Física (Rack/Zona)
- **Ruta:** `http://localhost:8000/api/v1/locations/`
- **Method:** `POST`
- **Headers Requeridos:** `X-User-Role: admin` o `gestor`
- **Body JSON:**
```json
{
  "zone": "A",
  "aisle": "01",
  "rack": "02",
  "level": "1"
}
```
*Generará automáticamente código estructurado ej. `Z:A-A:01-R:02-L:1`*

---

## 5. 👥 Contactos (Stakeholders)

### Crear Cliente (`/customers`)
- **Ruta:** `http://localhost:8000/api/v1/customers/`
- **Method:** `POST`
- **Body JSON:**
```json
{
  "nombre": "Empresa Cliente S.A.C.",
  "tipo_documento": "RUC",
  "numero_documento": "20123456789",
  "direccion": "Av. Principal 123",
  "telefono": "987654321",
  "email": "contacto@empresacliente.com",
  "condicion_pago": "CREDITO 30 DIAS"
}
```

### Crear Proveedor (`/suppliers`)
- **Ruta:** `http://localhost:8000/api/v1/suppliers/`
- **Method:** `POST`
- **Body JSON:**
```json
{
  "nombre": "Distribuidora Mayorista S.R.L.",
  "tipo_documento": "RUC",
  "numero_documento": "20987654321",
  "direccion": "Calle Los Industriales 456"
}
```

---

## 6. 📥 Entradas de Inventario (Compras/Stock Activo)

### Recibir Lote (Abastecimiento)
- **Ruta:** `http://localhost:8000/api/v1/batches/receive`
- **Method:** `POST`
- **Headers Requeridos:** `X-User-Role: gestor` o `admin`
- **Body JSON:**
```json
{
  "product_id": "uuid-del-producto-aqui",
  "location_id": "uuid-de-la-ubicacion-aqui",
  "supplier_id": "uuid-del-proveedor-aqui",
  "quantity": 100,
  "unit_cost": 45.0,
  "expiration_date": "2027-12-31T00:00:00"
}
```

---

## 7. 📤 Gestión de Pedidos y Repartos (`/orders`)

### 7.1. Crear un Pedido (Venta/Salida)
- **Ruta:** `http://localhost:8000/api/v1/orders/`
- **Method:** `POST`
- **Headers Requeridos:** `X-User-Role: gestor` o `admin`
- **Body JSON:**
```json
{
  "customer_id": "uuid-del-cliente-aqui",
  "shipping_address": "Av. Entrega Domicilio 456",
  "notes": "Entregar solo por la mañana",
  "items": [
    {
      "product_id": "uuid-del-producto-aqui",
      "quantity": 10,
      "unit_price": 55.0
    }
  ]
}
```

### 7.2. Asignar Personal (Picker y Repartidor)
- **Ruta:** `http://localhost:8000/api/v1/orders/<order_id>/assign`
- **Method:** `PUT`
- **Body JSON:**
```json
{
  "picker_id": "uuid-del-usuario-almacenero",
  "driver_id": "uuid-del-usuario-repartidor"
}
```

### 7.3. Recolección de Ítem (Panel Picking)
- **Ruta:** `http://localhost:8000/api/v1/orders/items/<item_id>/pick`
- **Method:** `POST`
- **Headers Requeridos:** `X-User-Role: picker`
- **Body JSON:**
```json
{
  "batch_id": "uuid-del-lote-aqui",
  "quantity": 10
}
```
*(Nota: Si no se envía batch_id, el backend asigna automáticamente el lote más antiguo FIFO. En ese caso se envia un JSON vacío `{}` ya que el `quantity` se recalcula en backend).*

### 7.4. Cambiar Estado del Pedido
- **Ruta:** `http://localhost:8000/api/v1/orders/<order_id>/status`
- **Method:** `PUT`
- **Body JSON:**
```json
{
  "status": "EN_ROUTE" 
}
```
*(Estados válidos: `PENDING`, `PICKING`, `READY_TO_SHIP`, `EN_ROUTE`, `DELIVERED`, `CANCELED`)*

---

## 8. 📊 Reportes y Dashboards (`/reports`)

### Métricas Generales del Dashboard
- **Ruta:** `http://localhost:8000/api/v1/reports/dashboard`
- **Method:** `GET`

### Valorización del Inventario
- **Ruta:** `http://localhost:8000/api/v1/reports/valorization`
- **Method:** `GET`

### Historial de Movimientos de un Producto
- **Ruta:** `http://localhost:8000/api/v1/movements/product/<product_id>`
- **Method:** `GET`
