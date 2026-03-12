# Control de Acceso para Usuarios Externos

Cuando el sistema de usuarios es gestionado por un sistema externo (ERP, CRM, etc.), G.D.O.M. actua como capa de permisos sobre ese sistema. Los usuarios no se autentican en G.D.O.M. — se identifican mediante un header y la plataforma decide que pueden ver y hacer.

---

## Conceptos Clave

| Concepto | Descripcion |
|----------|-------------|
| **Integracion** | Configuracion de conexion a un sistema externo (URL base, tipo de autenticacion, credenciales) |
| **Usuario Externo** | Registro local que referencia a un usuario del sistema externo por su `externalId` |
| **Recurso** | Endpoint registrado en G.D.O.M. vinculado a una integracion |
| **Response Filter** | Filtro que restringe los datos visibles en la respuesta del sistema externo |

---

## Flujo de una Peticion Externa

```
Cliente (iframe/embed)
    │  x-external-user-id: "123"
    ▼
GET /ext/clients/1/projects
    │
    ▼
┌─────────────────────────┐
│   ExternalAuthGuard     │
│                         │
│ 1. Buscar recurso       │
│ 2. ¿Requiere auth?     │──── No ──→ Permitir
│ 3. ¿Integracion activa? │──── No ──→ Permitir
│ 4. ¿Gestiona usuarios?  │──── No ──→ Permitir
│ 5. ¿Permisos internos?  │──── No ──→ Permitir
│ 6. ¿Header presente?    │──── No ──→ 403
│ 7. Verificar acceso     │──── Si ──→ Permitir + responseFilter
│ 8. Fallback a modulo    │──── Si ──→ Permitir
│ 9. Denegar              │
└─────────────────────────┘
    │
    ▼
┌─────────────────────────┐
│   ExternalProxyService  │
│                         │
│ • Autenticar con        │
│   sistema externo       │
│ • Reenviar peticion     │
│ • Aplicar responseFilter│
│ • Retornar respuesta    │
└─────────────────────────┘
```

---

## Dos Vias de Asignacion de Permisos

### Via Directa

Se otorga acceso individual a un usuario externo sobre un recurso especifico.

- Tabla: `external_user_resource_access`
- Permite especificar un metodo HTTP concreto o `null` (wildcard = todos los metodos)
- Soporta fecha de expiracion (`expiresAt`)
- Se verifica primero (mayor prioridad)

### Via Pool

Se agrega al usuario externo como miembro de un pool y hereda los permisos del grupo.

- Tabla: `external_pool_members` → `user_pools` → `pool_resource_access`
- El usuario hereda la **union** de permisos de todos sus pools activos
- Se verifica como fallback si no hay acceso directo

```
Usuario Externo
    ├── Acceso directo (recurso + metodo + filtro)     ← se verifica primero
    └── Miembro de Pool
            └── Pool Resource Access (recurso + metodo + filtro)  ← fallback
```

---

## Response Filter

Permite restringir que datos del sistema externo puede ver cada usuario o pool. Se almacena como JSONB en la tabla de acceso.

```json
{
  "field": "organization.code",
  "type": "include",
  "values": ["ORG-001", "ORG-002"]
}
```

| Campo | Descripcion |
|-------|-------------|
| `field` | Ruta del campo en la respuesta (soporta notacion con punto: `organization.code`) |
| `type` | `include` = solo mostrar coincidencias, `exclude` = ocultar coincidencias |
| `values` | Lista de valores a comparar |

El filtro se aplica automaticamente sobre tres formatos de respuesta:
- Array directo: `[{...}, {...}]`
- Paginado: `{ data: [{...}, {...}] }`
- Objeto individual: `{...}`

---

## Estrategias de Autenticacion con el Sistema Externo

G.D.O.M. se autentica con el sistema externo de forma transparente al usuario. La estrategia se configura por integracion:

| Estrategia | Descripcion |
|------------|-------------|
| `NONE` | Sin autenticacion |
| `BEARER` | Token Bearer en header Authorization |
| `BASIC` | HTTP Basic (usuario:contraseña en base64) |
| `API_KEY` | API key en un header personalizado |
| `DEVISE_TOKEN_AUTH` | Autenticacion con devise_token_auth (login + cache de tokens) |

---

## Permisos a Nivel de Modulo (Fallback)

Si un usuario externo no tiene acceso directo ni por pool a un **recurso**, el guard verifica como ultimo recurso si tiene permisos a nivel de **modulo** (`external_user_permissions`). Esto permite otorgar acceso amplio a un modulo sin configurar recurso por recurso.

---

## Tablas Involucradas

```
external_users ──────────┬──→ external_user_resource_access ──→ resources
                         │
                         ├──→ external_user_permissions ──→ module_permissions
                         │
                         └──→ external_pool_members ──→ user_pools
                                                           ├──→ pool_resource_access ──→ resources
                                                           └──→ pool_permissions ──→ module_permissions
```

---

## Configuracion Requerida

Para habilitar el control de acceso externo sobre un recurso:

1. **Crear la integracion** con `managesUsers: true` e `internalPermissions: true`
2. **Registrar el recurso** con su `templateUrl` y vincularlo a la integracion
3. **Registrar usuarios externos** asociados a la integracion
4. **Asignar permisos** via directa o via pool (con response filters opcionales)
