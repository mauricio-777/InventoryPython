# Sistema de Gestión de Usuarios y Control de Roles

## Objetivo
Proveer un sistema seguro de acceso con roles bien definidos que permitan controlar las funcionalidades según el perfil del usuario.

## Roles Definidos

### 1. **Administrador (admin)**
- **Acceso:** Total a todas las funcionalidades
- **Permisos:**
  - Gestión completa de usuarios (crear, editar, desactivar)
  - Acceso a auditoría del sistema
  - Acceso a todos los módulos sin restricción
  - Gestión de inventario con permiso de escritura
  - Acceso a reportes
  
### 2. **Gestor de Inventario (gestor)**
- **Acceso:** Gestión de productos, lotes, movimientos y reportes
- **Permisos:**
  - ✅ Gestionar productos (crear, editar, ver)
  - ✅ Gestionar lotes (entrada y salida de stock)
  - ✅ Procesar movimientos (compras, ventas)
  - ✅ Ver reportes de inventario
  - ❌ NO puede administrar usuarios
  - ❌ NO puede acceder a auditoría
  
### 3. **Consultor (consultor)**
- **Acceso:** Solo lectura en todas las secciones
- **Permisos:**
  - ✅ Ver productos y stock disponible
  - ✅ Ver reportes de inventario
  - ✅ Ver historial de movimientos
  - ✅ Ver información de clientes y proveedores
  - ❌ NO puede crear ni modificar datos
  - ❌ NO puede administrar usuarios
  - ❌ NO puede acceder a auditoría

---

## Implementación

### Backend

#### Modelos (Domain Layer)

**User Entity**
```python
class User(Base):
    id: String (UUID)
    username: String (unique)
    email: String (unique)
    password_hash: String
    active: Boolean (default: True)
    role_id: Integer (ForeignKey -> Role)
    role: Relationship (lazy="joined")
```

**Role Entity**
```python
class Role(Base):
    id: Integer (autoincrement)
    name: String (unique) - admin, gestor, consultor
    description: String
```

#### Controlador de Usuarios (user_controller.py)

Endpoints protegidos con `@require_role('admin')`:

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/api/v1/users/` | Listar usuarios | admin |
| GET | `/api/v1/users/roles` | Listar roles disponibles | admin |
| POST | `/api/v1/users/` | Crear nuevo usuario | admin |
| GET | `/api/v1/users/<user_id>` | Obtener usuario | admin |
| PUT | `/api/v1/users/<user_id>` | Editar usuario | admin |
| PATCH | `/api/v1/users/<user_id>/deactivate` | Desactivar usuario | admin |

#### Middleware de Autenticación

El decorador `@require_role()` implementa control de acceso basado en el header HTTP:
```python
@router.route('/some-endpoint', methods=['GET'])
@require_role('admin', 'gestor')
def protected_endpoint():
    # Solo admin y gestor pueden acceder
    pass
```

Validación del header `X-User-Role` (temporal hasta implementar JWT):
- Si el header no está presente → 401 Unauthorized
- Si el rol no coincide → 403 Forbidden
- Si el rol está permitido → Continuar

#### Endpoints Protegidos por Rol

**Productos (Product)**
- CREATE: admin, gestor ✅
- READ: admin, gestor, consultor ✅
- UPDATE (precios): admin, gestor ✅

**Movimientos (Movements/Batches)**
- CREATE: admin, gestor ✅
- READ: admin, gestor, consultor ✅

**Reportes (Reports)**
- READ: admin, gestor, consultor ✅

**Auditoría (Audit)**
- READ: admin ✅
- CREATE: admin ✅

**Clientes y Proveedores (Stakeholders)**
- CREATE: admin, gestor ✅
- READ: admin, gestor, consultor ✅
- UPDATE: admin, gestor ✅

---

### Frontend

#### Hook `useUserRole`

Gestiona el rol del usuario en la aplicación:
```javascript
const { userRole, userName, setUserRole, setUserName, hasRole, canAccess } = useUserRole();

// Almacena el rol en localStorage para persistencia entre sesiones
```

#### Componente `LoginForm`

Interfaz de autenticación con selección de rol:
- Formulario simplificado para POC
- Selección visual de roles con colores distintivos
- Almacena rol y nombre en localStorage
- Emite evento `onLoginSuccess` para notificar al App

#### Componente `RoleGuard`

Protege vistas según el rol del usuario:
```jsx
<RoleGuard allowedRoles={['admin']}>
  <AdminPanel />
</RoleGuard>
```

Si el usuario no tiene permisos, muestra mensaje de acceso denegado.

#### Actualización de `MainLayout`

Muestra:
- Información del usuario (nombre y rol)
- Filtrado de menú según roles permitidos
- Botón de cierre de sesión (clear user data)

#### Rutas Protegidas en App.jsx

| Vista | Roles Permitidos |
|-------|-----------------|
| users | admin |
| audit, audit-history, audit-logs | admin |
| purchases, pos | admin, gestor |
| products, dashboard, reports | admin, gestor, consultor |
| customers, suppliers | admin, gestor, consultor |

#### Integración API

El `ApiAuthRepository` envía automáticamente el rol en el header:
```javascript
// Header incluido en todas las peticiones
'X-User-Role': localStorage.getItem('userRole')
```

---

## Inicialización del Sistema

### Roles Preestablecidos

Al iniciar la aplicación, se crean automáticamente los 3 roles:
```python
PREDEFINED_ROLES = [
    {
        "name": "admin",
        "description": "Acceso total: gestión de usuarios, auditoría y todas las funcionalidades."
    },
    {
        "name": "gestor",
        "description": "Gestiona productos, lotes, entradas, salidas y reportes. Sin administración de usuarios."
    },
    {
        "name": "consultor",
        "description": "Solo lectura en todas las secciones del sistema."
    }
]
```

### Usuario Admin Inicial

Se crea automáticamente un usuario administrador:
- **Usuario:** admin
- **Email:** admin@inventoryapp.com
- **Contraseña:** Admin1234!
- **Rol:** admin

---

## Flujo de Autenticación (POC)

1. Usuario entra a la aplicación
2. Se muestra `LoginForm` si no hay sesión activa
3. Usuario ingresa nombre y selecciona rol
4. Se almacenan en localStorage
5. `MainLayout` filtra navegación según rol
6. Cada petición API incluye el role como header `X-User-Role`
7. Backend valida el rol y autoriza/deniega acceso

**Nota:** Este es un mecanismo temporal. En producción (Epic 3.2) se implementará JWT.

---

## Próximos Pasos (Epic 3.2)

- [ ] Implementar autenticación JWT
- [ ] Reemplazar header `X-User-Role` por claims del token
- [ ] Agregar sistema de permisos granulares (permisos por acción)
- [ ] Implementar refreshToken y logout en backend
- [ ] Auditoría de intentos de acceso denegado
- [ ] Roles y permisos dinámicos desde BD

---

## Archivo de Configuración

Ubicación: `backend/requirements.txt`

Dependencias necesarias:
- Flask
- Flask-CORS
- SQLAlchemy
- Werkzeug (para password hashing)

---

## Testing

Para probar el sistema:

1. **Admin:**
   - Acceder a `/users` (gestión de usuarios)
   - Acceder a `/audit` (auditoría del sistema)
   
2. **Gestor:**
   - Acceder a `/products`, `/purchases`
   - NO puede acceder a `/users`
   
3. **Consultor:**
   - Acceder a reportes y visualización
   - NO puede crear/modificar datos
   - NO puede acceder a `/users` o `/audit`

---

Implementación completada en marzo 2026.
