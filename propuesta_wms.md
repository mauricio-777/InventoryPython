# Propuesta Arquitectónica: Sistema de Gestión de Pedidos y Almacén (WMS)

Esta propuesta detalla la transformación del módulo "Punto de Venta" hacia un sistema profesional de **Gestión de Pedidos y Almacén (Warehouse Management System - WMS)**, respondiendo a las preguntas sobre el ciclo de vida del pedido, la sectorización del almacén y la verificación de entregas.

---

## 1. El Ciclo de Vida del Pedido (Workflow)

El "Punto de Venta" asume que el cliente se lleva el producto inmediatamente. Un sistema de pedidos requiere estados transicionales. El flujo profesional sería:

1. **Nuevo (Pendiente de Aprobación):** El pedido ingresa al sistema (ya sea insertado manualmente por un "Gestor de Ventas", o a través de una integración/formulario web automático). El sistema reserva el stock temporalmente.
2. **En Picking (Recolección):** El pedido pasa a la cola de trabajo del almacén. Un operario toma su dispositivo, ve la "Lista de Picking" y va físicamente a buscar los productos.
3. **Empaquetado (Ready to Ship):** Los productos fueron recolectados, verificados, puestos en su caja y están en la zona de despacho esperando al transportista.
4. **En Ruta (Enviado):** El pedido sale del almacén con un repartidor.
5. **Entregado (Firmado/Cerrado):** El cliente recibe el producto y se confirma la entrega.

---

## 2. Sectorización del Almacén (Para Almacenes Grandes)

Si el almacén es grande, no basta con saber que tenemos "50 Coca-Colas". Necesitamos saber *dónde* están. Para esto, introduciremos el concepto de **Ubicaciones Físicas (Zoning)**.

### Estructura Propuesta de Ubicación:
Se usa código alfanumérico estandarizado: `[Zona]-[Pasillo]-[Estante]-[Nivel]`
- **Zona:** P. ej. `A` (Secos), `B` (Refrigerados), `C` (Peligrosos).
- **Pasillo:** P. ej. `01`, `02`.
- **Estante:** P. ej. `A`, `B`.
- **Nivel:** P. ej. `01` (Suelo), `02` (Medio), `03` (Alto).
- *Ejemplo de Código:* `A-02-B-01` (Zona de Secos, Pasillo 2, Estante B, Nivel 1).

### ¿Cómo funciona la recolección lógica?
Al imprimir o enviar la "Lista de Picking" al operario, **el sistema ordena la lista por Ubicación**.
- Si el operario tiene que recoger 5 productos diferentes, el sistema le traza el "camino más corto" (ej. pasa primero por el Pasillo 1, luego al 2). Evitamos que el operario camine en zigzag de ida y vuelta.
- Se mantiene la regla **FIFO** (Primero en Entrar, Primero en Salir): el sistema le indica al operario exactamente qué lote específico debe tomar (ej. "Toma la Coca-Cola del pasillo A, que vence el 10 de Marzo").

---

## 3. ¿Cómo se verifica la Entrega?

Para evitar reclamos y cerrar el ciclo correctamente:
1. **Prueba de Entrega (Proof of Delivery - POD):** Cuando el repartidor llega al destino, el sistema debe permitirle subir una foto del remito firmado o del paquete en la puerta.
2. **Coordenadas GPS (Opcional):** Registrar la ubicación en el momento de apretar el botón "Entregado".
3. **Firma Digital:** Si el repartidor tiene tablet/celular, el cliente firma en la pantalla.
4. **Estados de Fallo:** Si no hay nadie en casa, el pedido pasa a estado "Devuelto a Almacén" o "Reintento de Entrega".

---

## 4. Nuevos Roles y Cambios Necesarios en Módulos

Para que esto funcione de forma segura, necesitamos especializar los roles.

### Nuevos Roles Sugeridos:
- **Gestor de Ventas / Atención al Cliente:** Ingresa los pedidos, atiende reclamos de clientes. (No entra al almacén).
- **Almacenero / Picker (NUEVO):** Su pantalla solo le muestra órdenes en estado "Pendiente". Su único trabajo es ver su lista, caminar al estante, marcar los productos como "Recolectados" y pasarlos a despacho. No ve precios, ni puede crear productos.
- **Repartidor / Logística (NUEVO):** Su pantalla solo le muestra órdenes "Listas para Envío". Selecciona las que carga en su camión y cambia su estado a "Entregado" subiendo la prueba de entrega.

### ¿Qué módulos deben cambiar profunda o totalmente?
1. **Nuevo Módulo: "Ubicaciones"**: Para dar de alta los pasillos y estantes.
2. **Modificación en "Catálogo" y "Comprar Lote"**: Al ingresar un lote nuevo, el gestor *debe* asignarle una ubicación física obligatoria.
3. **Módulo "Punto de Venta" -> Cambia a "Gestión de Pedidos"**: Se convierte en un panel Kanban (Trello-style) o una tabla de estados (Pendiente, Picking, Ruta, Entregado).
4. **Módulo "Usuarios"**: Agregar los nuevos roles operativos.

---

## Conclusión y Siguientes Pasos

Si estás de acuerdo con esta visión profesional y escalable:
1. Empezaremos creando las tablas en backend para **Pedidos (Orders)** y **Detalles de Pedido (OrderItems)** con sus estados lógicos.
2. Agregaremos la **Ubicación Físico (Location)** a nivel base de datos (para los Lotes).
3. Reemplazaremos en frontend toda la interfaz de "Venta Inmediata" por un "Dashboard de Pedidos" con cambio de estados paso a paso.

**¿Estás de acuerdo con este enfoque o quisieras que el sistema sea un poco más simple?**
