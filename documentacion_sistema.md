# Documentación del Sistema de Inventario

¡Bienvenido a la documentación oficial del Sistema de Inventario! Este documento explica detalladamente cómo funciona el sistema, qué tipos de usuarios (roles) existen, y qué puede hacer cada uno de ellos. Está diseñado para que cualquier persona, sin importar su nivel técnico, pueda entender la estructura y el propósito de cada parte del sistema.

---

## 1. Roles del Sistema (Tipos de Usuario)

El sistema utiliza un modelo basado en roles para asegurar que cada persona solo tenga acceso a la información y a las herramientas que necesita para su trabajo. Existen **tres roles principales**:

### 👑 Administrador (`admin`)
Es el rol de mayor jerarquía. Tiene control total y absoluto sobre todo el sistema. 
- **Su propósito:** Supervisar todo el negocio, auditar cambios, administrar al personal que usa el sistema y configurar parámetros generales.
- **Accesos únicos:** Es el único que puede crear o desactivar otros usuarios, cambiar contraseñas, y ver el registro detallado de quién hizo qué y a qué hora (Auditoría).

### 💼 Gestor de Inventario (`gestor`)
Es el rol operativo principal. Se encarga de la gestión diaria del negocio.
- **Su propósito:** Mantener el inventario al día, registrar compras de nuevos productos a proveedores, y realizar ventas a clientes. 
- **Limitaciones:** No puede ver el historial de auditoría ni administrar las cuentas de otros usuarios.

### 👁️ Consultor (`consultor`)
Es un rol de solo lectura o revisión.
- **Su propósito:** Monitorear el estado del negocio, revisar qué hay en el almacén, ver precios y analizar reportes para la toma de decisiones.
- **Limitaciones:** No puede registrar compras, no puede hacer ventas, y no puede acceder a las configuraciones del sistema ni a la auditoría. Solo puede *ver* pero no *tocar* (modificar) el inventario.

---

## 2. Vista General de los Módulos del Sistema

A continuación, explicamos cada sección (módulo) del menú lateral, para qué sirve y quién puede entrar.

### 📦 Catálogo de Productos
**¿Para qué sirve?** 
Es la base de datos maestra de lo que la empresa vende. Aquí se definen los nombres de los productos, sus códigos únicos (SKU), a qué categoría pertenecen (ej. Bebidas, Lácteos) y cómo se miden (Litros, Cajas, Unidades). No maneja cantidades, solo define *qué cosas* existen en el negocio.
- **¿Quién puede acceder?** Administrador, Gestor y Consultor.

### 📥 Comprar Lote (Entradas)
**¿Para qué sirve?** 
Aquí es donde registras cuando llega nueva mercadería de tus proveedores. Funciona comprando "Lotes": seleccionas un producto (ej. Coca-Cola), el proveedor que te lo vendió, cuánto compraste, cuánto te costó cada unidad y su fecha de vencimiento (si aplica). 
**Importante:** Puedes comprar el mismo producto a diferentes proveedores y a diferentes precios. El sistema guarda cada lote por separado.
- **¿Quién puede acceder?** Administrador y Gestor.

### 🛒 Punto de Venta (Salidas)
**¿Para qué sirve?** 
Es la pantalla para vender productos a los clientes. Seleccionas el cliente, el producto y la cantidad a vender. 
**Importante (Lógica FIFO):** El sistema es inteligente. Funciona con el principio *FIFO (First In, First Out / Primero en Entrar, Primero en Salir)*. Cuando vendes 10 Coca-Colas, el sistema automáticamente las descuenta del lote más antiguo que tengas. Así tus productos no se vencen en el almacén.
- **¿Quién puede acceder?** Administrador y Gestor.

### 📊 Stock Activo
**¿Para qué sirve?** 
Es el "almacén virtual". Muestra exactamente cuántas unidades tienes de cada producto en este instante. Si haces clic en un producto (ej. Leche), te mostrará el detalle exacto de los lotes: cuántas cajas llegaron en qué fecha, cuáles están por vencer, y cuál fue el costo de cada lote.
- **¿Quién puede acceder?** Administrador, Gestor y Consultor.

### 👥 Clientes
**¿Para qué sirve?** 
Un directorio de todos los clientes a los que les vendes. Guarda información como su Razón Social, NIT/DNI, dirección, teléfono, su condición de pago habitual (Contado/Crédito) y cómo prefieren hacer sus pedidos (WhatsApp, Presencial, etc.) y entregas (Delivery, Recojo en tienda).
- **¿Quién puede acceder?** Administrador, Gestor y Consultor.

### 🚚 Proveedores
**¿Para qué sirve?** 
Un directorio de las empresas que te surten de mercadería. Guarda sus datos de contacto y detalles operativos como su plazo de entrega y condiciones de compra. Se usa al momento de registrar compras de lotes.
- **¿Quién puede acceder?** Administrador, Gestor y Consultor.

### 📈 Dashboard
**¿Para qué sirve?** 
Es la pantalla principal o el "Tablero de Control". Muestra gráficos visuales rápidos y tarjetas con resúmenes del negocio: cuántos productos hay en stock, alertas de productos que se están agotando, productos próximos a vencer, y un resumen financiero básico.
- **¿Quién puede acceder?** Administrador, Gestor y Consultor.

### 📑 Reportes (Valorización y Rotación)
**¿Para qué sirven?** 
- **Valorización:** Te dice "cuánto dinero tienes invertido en el almacén" multiplicando el stock actual por su costo de compra o precio de venta estimado.
- **Rotación:** Te muestra qué productos se venden rápido (alta rotación) y cuáles se están quedando estancados en el almacén (baja rotación).
- **¿Quién puede acceder?** Administrador, Gestor y Consultor.

### 🔐 Usuarios
**¿Para qué sirve?** 
Para crear cuentas personales para cada empleado. Aquí se asientan nombres de usuario, se definen contraseñas y, muy importante, se le asigna su Rol (Gestor, Consultor o Admin).
- **¿Quién puede acceder?** SOLO el Administrador.

### 🕵️ Auditoría (Pista de Auditoría, Movimientos, Historial)
**¿Para qué sirve?** 
Es la "caja negra" del sistema. Registra absolutamente todas las acciones que ocurren de manera silenciosa.
- Si un Gestor borra un producto, queda registrado.
- Si alguien inicia sesión a las 3:00 AM, queda registrado.
- Si se modifica el precio de un lote, queda guardado quién lo hizo, a qué hora, cuál era el dato viejo y cuál es el dato nuevo.
Esta herramienta es fundamental para evitar fraudes, robos o errores humanos.
- **¿Quién puede acceder?** SOLO el Administrador.

---

## 3. Resumen de Permisos por Rol

| Módulo / Acción | Administrador | Gestor | Consultor |
| :--- | :---: | :---: | :---: |
| **Ver catálogo, stock, clientes, proveedores** | ✅ | ✅ | ✅ |
| **Ver Dashboard y Reportes** | ✅ | ✅ | ✅ |
| **Registrar nuevas compras de mercadería** | ✅ | ✅ | ❌ |
| **Realizar ventas (Punto de Venta)** | ✅ | ✅ | ❌ |
| **Crear/Editar/Borrar clientes y proveedores** | ✅ | ✅ | ❌ (Solo lectura)* |
| **Crear y desactivar Usuarios** | ✅ | ❌ | ❌ |
| **Acceder a registros de Auditoría** | ✅ | ❌ | ❌ |

*(Nota: Actualmente, Gestor y Consultor ven la interfaz de Stakeholders, pero solo Admin y Gestor deberían modificar data crítica dependiendo de la política del negocio).*

## 4. Preguntas Frecuentes de Flujo

**¿Qué pasa si compro un producto a un precio y luego a otro?**
No hay problema. El módulo de **Catálogo** guarda el nombre del producto, pero el módulo **Comprar Lote** guarda el precio. Al comprar un segundo lote más caro/barato, el sistema lo almacena aparte. Tendrás dos lotes en el almacén (visibles en "Stock Activo").

**Cuando vendo un producto que tiene varios lotes de distintos precios, ¿cuál se vende primero?**
Se descuenta automáticamente del lote *más viejo* (el que compraste primero), aplicando la regla FIFO. Esto asegura que calcules bien tus ganancias y que los productos no caduquen en la bodega.

**¿Qué pasa si el sistema se cierra o un usuario se equivoca de contraseña?**
El sistema mostrará una notificación estilizada (Toast) en la esquina inferior derecha avisando del error ("Usuario o contraseña incorrecto" o "Acceso Denegado"). Si un Gestor intenta entrar a una pantalla de Admin usando un enlace directo, el sistema lo bloqueará automáticamente y lo devolverá a una sección segura.
