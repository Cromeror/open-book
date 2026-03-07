# OpenBook

Sistema de gestión financiera transparente para copropiedades en Colombia.

## Requisitos Previos

| Requisito | Versión mínima |
|-----------|----------------|
| Node.js | 20.x |
| pnpm | 8.x |
| Docker | 20.x (para PostgreSQL) |

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd contabilidad-transparente
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

```bash
cp apps/api/.env.example apps/api/.env
```

Edita `apps/api/.env` con tus valores:

```env
# Base de datos
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=openbook
DATABASE_USER=postgres
DATABASE_PASSWORD=tu_password_seguro

# JWT (mínimo 32 caracteres)
JWT_SECRET=tu_clave_secreta_de_minimo_32_caracteres
```

### 4. Iniciar PostgreSQL con Docker

```bash
docker compose up -d postgres
```

### 5. Ejecutar migraciones

```bash
pnpm typeorm:run
```

### 6. Usuarios de prueba

Las migraciones crean usuarios por defecto para desarrollo:

| Email | Password | Rol |
|-------|----------|-----|
| `admin@test.com` | `Test123!` | SuperAdmin (acceso total) |
| `user@test.com` | `Test123!` | Usuario regular |

> **Importante**: Estos usuarios son solo para desarrollo. En produccion, eliminalos o cambia las credenciales inmediatamente despues del primer despliegue.

### 7. Iniciar el proyecto

```bash
pnpm dev
```

- **API**: http://localhost:3001
- **Web**: http://localhost:4200

## Scripts Disponibles

### Desarrollo

| Script | Descripción |
|--------|-------------|
| `pnpm dev` | Inicia API y Web en modo desarrollo |
| `pnpm dev:api` | Inicia solo la API |
| `pnpm dev:web` | Inicia solo la Web |

### Build

| Script | Descripción |
|--------|-------------|
| `pnpm build` | Compila API y Web |
| `pnpm build:api` | Compila solo la API |
| `pnpm build:web` | Compila solo la Web |

### Base de Datos

| Script | Descripción |
|--------|-------------|
| `pnpm typeorm:generate` | Genera migración desde cambios en entidades |
| `pnpm typeorm:run` | Ejecuta migraciones pendientes |
| `pnpm typeorm:revert` | Revierte la última migración |

### Calidad de Código

| Script | Descripción |
|--------|-------------|
| `pnpm lint` | Ejecuta ESLint |
| `pnpm lint:fix` | Corrige errores de lint automáticamente |
| `pnpm format` | Formatea código con Prettier |
| `pnpm format:check` | Verifica formato sin modificar |
| `pnpm test` | Ejecuta tests |

## Estructura del Proyecto

```
contabilidad-transparente/
├── apps/
│   ├── api/                 # Backend NestJS
│   │   ├── src/
│   │   │   ├── app/         # Módulo principal
│   │   │   ├── config/      # Configuración (env, database)
│   │   │   ├── entities/    # Entidades TypeORM
│   │   │   ├── migrations/  # Migraciones de BD
│   │   │   └── subscribers/ # Subscribers TypeORM
│   │   └── .env.example
│   ├── api-e2e/             # Tests E2E del API
│   ├── web/                 # Frontend Next.js
│   └── web-e2e/             # Tests E2E del Web
├── libs/                    # Librerías compartidas
├── docs/                    # Documentación
│   └── tickets/             # Sistema de tickets (epics/stories/tasks)
├── scripts/                 # Scripts de utilidad
├── docker-compose.yml       # Servicios Docker
└── nx.json                  # Configuración Nx
```

## Variables de Entorno

| Variable | Descripción | Requerida | Default |
|----------|-------------|-----------|---------|
| `NODE_ENV` | Entorno de ejecución | No | `development` |
| `PORT` | Puerto del API | No | `3001` |
| `DATABASE_HOST` | Host de PostgreSQL | Sí | - |
| `DATABASE_PORT` | Puerto de PostgreSQL | No | `5432` |
| `DATABASE_NAME` | Nombre de la base de datos | Sí | - |
| `DATABASE_USER` | Usuario de PostgreSQL | Sí | - |
| `DATABASE_PASSWORD` | Contraseña de PostgreSQL | Sí | - |
| `DATABASE_POOL_SIZE` | Tamaño del pool de conexiones | No | `10` |
| `DATABASE_SSL` | Habilitar SSL | No | `false` |
| `JWT_SECRET` | Clave secreta JWT (min 32 chars) | Sí | - |
| `JWT_EXPIRES_IN` | Expiración del token | No | `7d` |

## Docker

### Servicios disponibles

```bash
# PostgreSQL para desarrollo
docker compose up -d postgres

# PostgreSQL para tests (puerto 5433)
docker compose up -d postgres-test

# Todos los servicios
docker compose up -d
```

### Detener servicios

```bash
docker compose down
```

## Troubleshooting

### Error de conexión a PostgreSQL

1. Verifica que Docker esté corriendo: `docker ps`
2. Verifica que el contenedor esté activo: `docker compose ps`
3. Revisa los logs: `docker compose logs postgres`
4. Confirma que `.env` tenga las credenciales correctas

### Error "password authentication failed"

Las credenciales en `.env` deben coincidir con las del contenedor Docker o tu instalación local de PostgreSQL.

### Puerto en uso

Si el puerto 5432 está ocupado, puedes cambiar `DATABASE_PORT` en `.env` y actualizar `docker-compose.yml`.

## Tech Stack

| Componente | Tecnología |
|------------|------------|
| Monorepo | Nx |
| Backend | NestJS |
| Frontend | Next.js |
| Base de datos | PostgreSQL 16 |
| ORM | TypeORM |
| Validación | Zod |
| Estilos | Tailwind CSS |

## Convenciones de Recursos

### Carga de datos en formularios PATCH/PUT

Para los metodos `PATCH` y `PUT`, el frontend carga automaticamente los datos existentes haciendo un `GET` al mismo `href` del recurso antes de mostrar el formulario. Esto sigue la convencion REST donde la URL que identifica un recurso es la misma para leerlo y modificarlo.

**Ejemplo:** si el link HATEOAS apunta a `PATCH /api/condominiums/123/goals/456`, el formulario primero hace `GET /api/condominiums/123/goals/456` para prellenar los campos con los valores actuales.

**Implicaciones para nuevos recursos:**
- Todo recurso con `PATCH` o `PUT` debe tener un `GET` en la misma URL que retorne los datos del recurso
- Si el `GET` falla o no retorna datos, el formulario se muestra vacio (modo creacion)
- Los campos del formulario se generan a partir del `payloadMetadata` configurado en el `resource_http_methods`

### PayloadMetadata

El `payloadMetadata` (columna jsonb en `resource_http_methods`) describe la estructura del request body usando un formato OpenAPI-like. El frontend lo usa para:

1. **Generar campos automaticamente**: tipo de input, label, placeholder
2. **Validar en cliente**: schema Zod generado a partir de las propiedades

Formato esperado:
```json
{
  "method": "PATCH",
  "summary": "Titulo del formulario",
  "requestBody": {
    "required": false,
    "contentType": "application/json",
    "schema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "Label del campo",
          "minLength": 3,
          "maxLength": 200,
          "required": true,
          "example": "Placeholder del campo"
        },
        "amount": {
          "type": "number",
          "description": "Monto",
          "minimum": 0.01
        },
        "status": {
          "type": "string",
          "enum": ["active", "inactive"],
          "description": "Estado"
        }
      }
    }
  }
}
```

Mapeo de tipos `PropertySchema` a inputs:
| type + format | Input |
|---------------|-------|
| `string` | text |
| `string` + `email` | email |
| `string` + `password` | password |
| `string` + `date` | date |
| `string` (maxLength > 255) | textarea |
| `string` + `enum` | select |
| `number` / `integer` | number |
| `boolean` | checkbox |

## Licencia

MIT
