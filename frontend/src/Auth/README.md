# Sistema de Roles en Frontend

## Estructura

```
Auth/
├── Adapters/
│   └── ApiAuthRepository.js       # API wrapper con headers de rol
├── Application/
│   └── useAuth.js                 # Hook para gestión de usuarios
└── UI/
    ├── components/
    │   ├── LoginForm.jsx           # Formulario de autenticación (selección de rol)
    │   ├── UserForm.jsx            # Formulario CRUD de usuarios
    │   └── RoleGuard.jsx           # Protección de vistas por rol
    └── pages/
        ├── LoginPage.jsx           # Página de login
        ├── UsersPage.jsx           # Página de gestión de usuarios (admin only)
        └── PasswordRecoveryPage.jsx
```

## Componentes Clave

### 1. `useUserRole` Hook

**Ubicación:** `CommonLayer/hooks/useUserRole.js`

Gestiona el rol del usuario globalmente:
```javascript
const { 
  userRole,          // Rol actual del usuario
  userName,          // Nombre del usuario
  setUserRole,       // Actualizar rol
  setUserName,       // Actualizar nombre
  clearUserData,     // Limpiar sesión
  hasRole,           // Verificar si tiene role(s)
  canAccess,         // Verificar si puede acceder
} = useUserRole();
```

**Almacenamiento:**
- localStorage.userRole
- localStorage.userName

### 2. `LoginForm` Component

**Props:**
```javascript
<LoginForm 
  onLoginSuccess={(userData) => {}}  // Callback después de login exitoso
  loading={false}                     // Estado de carga
/>
```

**Funcionalidades:**
- Ingreso de nombre de usuario
- Selección visual de rol (admin, gestor, consultor)
- Almacenamiento automático en localStorage
- Validaciones básicas

### 3. `RoleGuard` Component

Protege vistas según el rol del usuario:

```javascript
<RoleGuard allowedRoles={['admin']}>
  <AdminPanel />
</RoleGuard>
```

Si el usuario no tiene los permisos:
- Muestra mensaje de acceso denegado
- O muestra el contenido del prop `fallback`

**Props:**
```javascript
{
  allowedRoles: string[]        // Roles permitidos
  children: ReactNode           // Contenido a proteger
  fallback?: ReactNode          // Contenido alternativo
}
```

### 4. `UserForm` Component

Formulario CRUD para usuarios (admin only):

**Props:**
```javascript
{
  initialData?: User        // Usuario a editar (null = crear)
  roles: Role[]            // Roles disponibles
  onSave: (data) => void   // Callback guardar
  onCancel: () => void     // Callback cancelar
  loading?: boolean         // Estado de carga
}
```

**Campos:**
- Username (requerido)
- Email (validado)
- Contraseña (requerida en creación)
- Rol (selector)
- Estado activo/inactivo (solo edición)

### 5. `UsersPage` Component

Página de gestión de usuarios (admin only):

**Funcionalidades:**
- Listado de usuarios con búsqueda
- Estadísticas: Total, Activos, Inactivos, Admins
- Crear usuario (modal)
- Editar usuario (modal)
- Desactivar usuario (confirmación)
- Filtrado dinámico

## Flujo de Autenticación

```
App.jsx
  ↓
useUserRole() → localStorage
  ↓
LoginForm (selección de rol)
  ↓
setUserRole() + setUserName()
  ↓
MainLayout (menú filtrado por rol)
  ↓
RoleGuard (protección de vistas)
  ↓
ApiAuthRepository (header X-User-Role)
  ↓
Backend (validación)
```

## Colores y Diseño

Los roles usan una paleta de colores consistente:

| Rol | Color Primario | Color Secundario |
|-----|---|---|
| admin | Purple | `from-purple-500 to-purple-600` |
| gestor | Green/Emerald | `from-green-500 to-emerald-600` |
| consultor | Blue/Cyan | `from-blue-500 to-cyan-600` |

## Integración con API

### ApiAuthRepository

Envía automáticamente el rol en cada petición:

```javascript
// Obtiene el rol del localStorage
function getUserRole() {
    return localStorage.getItem('userRole') || 'consultor';
}

// Agrega el header en cada request
async function apiFetch(method, url, body = null) {
    const opts = {
        headers: { 
            'Content-Type': 'application/json',
            'X-User-Role': getUserRole()  // ← Header automático
        }
    };
    // ...
}
```

### useUserManager Hook

Gestiona operaciones CRUD de usuarios:

```javascript
const { 
  users,                    // Lista de usuarios
  roles,                    // Roles disponibles
  loading,                  // Estado de carga
  error,                    // Mensaje de error
  fetchUsers,              // Obtener usuarios
  fetchRoles,              // Obtener roles
  createUser,              // Crear usuario
  updateUser,              // Editar usuario
  deactivateUser,          // Desactivar usuario
} = useUserManager();
```

## Rutas Protegidas

En `App.jsx`, las rutas se protegen con `RoleGuard`:

```jsx
{currentView === 'users' && (
  <RoleGuard allowedRoles={['admin']}>
    <UsersPage />
  </RoleGuard>
)}

{currentView === 'purchases' && (
  <RoleGuard allowedRoles={['admin', 'gestor']}>
    <PurchaseEntryPage />
  </RoleGuard>
)}
```

## MainLayout Actualizado

Muestra:
1. **Logo y Menú filtrado** según el rol
2. **Sección de usuario** en el footer lateral:
   - Avatar con inicial del nombre
   - Nombre del usuario
   - Rol en mayúsculas (Administrador, Gestor, Consultor)
   - Botón "Cerrar sesión"

## Ejemplo de Uso

### Crear un componente con protección de rol

```jsx
import { RoleGuard } from './Auth/UI/components/RoleGuard.jsx';
import { useUserRole } from './CommonLayer/hooks/useUserRole.js';

export const AdminPanelPage = () => {
  const { userRole } = useUserRole();

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div>
        <h1>Panel de Administrador</h1>
        <p>Bienvenido, {userRole}</p>
      </div>
    </RoleGuard>
  );
};
```

### Verificar permisos en componentes

```jsx
const { hasRole, canAccess } = useUserRole();

if (hasRole('admin')) {
  // Mostrar opciones de admin
}

if (canAccess(['admin', 'gestor'])) {
  // Mostrar para admin y gestor
}
```

## Próximos Pasos

- [ ] Integrar LoginForm con backend real (endpoints de login)
- [ ] Implementar JWT en lugar de header X-User-Role
- [ ] Agregar refresh token
- [ ] Implementar logout en backend
- [ ] Validar expiración de sesión
- [ ] Agregar permisos granulares (por acción)
- [ ] Registrar intentos de acceso denegado

---

Implementación completada en marzo 2026.
