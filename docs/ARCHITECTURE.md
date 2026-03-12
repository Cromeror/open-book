# Arquitectura de G.D.O.M.

**G.D.O.M.** utiliza una arquitectura por capas donde **las aplicaciones API y Web mantienen sus propias definiciones de tipos**. No existe una librería de tipos compartida — cada aplicación es dueña de sus tipos de forma independiente.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            apps/api (NestJS)                                │
│                                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │   entities/*.ts      │  │   types/*.ts         │  │ grpc/proto/*.proto│  │
│  │   (TypeORM)          │  │   (Tipos API)        │  │ (Contratos gRPC) │  │
│  │                      │  │                      │  │                  │  │
│  │ @Entity, @Column     │  │ ModuleWithActions    │  │ Def. servicios   │  │
│  │ Modelos de BD        │  │ ResourceMetadata     │  │ Formato mensajes │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                       modules/**/dto/ (Validación)                   │  │
│  │                                                                       │  │
│  │  Esquemas Zod (createUserSchema)  │  DTOs de respuesta (UserResponse)│  │
│  │  Constantes (MODULE_TYPES)        │  Funciones mapper (toResponse)   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        modules/ (Módulos Core)                       │  │
│  │                                                                       │  │
│  │  auth/           │ Autenticación (JWT, refresh tokens, auth logs)    │  │
│  │  permissions/    │ Permisos granulares (usuarios, pools, recursos)   │  │
│  │  resources/      │ Registro de recursos expuestos (catálogo)         │  │
│  │  hateoas/        │ Enriquecimiento HATEOAS (interceptor + servicio) │  │
│  │  users/          │ Gestión de usuarios                               │  │
│  │  external-proxy/ │ Proxy a sistemas externos (6 estrategias auth)   │  │
│  │  admin/          │ Administración (resources, modules, pools, orgs) │  │
│  │  session-context/│ Contexto de sesión del request                    │  │
│  │  user-state/     │ Estado del usuario                                │  │
│  │  cache/          │ Caché en memoria global (@nestjs/cache-manager)  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    Infraestructura transversal                       │  │
│  │                                                                       │  │
│  │  subscribers/    │ Auditoría e inmutabilidad (TypeORM events)        │  │
│  │  config/         │ Configuración (env, database, gRPC con mTLS)     │  │
│  │  migrations/     │ Migraciones de base de datos                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           apps/web (Next.js)                                │
│                                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │ types/business/      │  │ types/api.types.ts   │  │ lib/grpc/types.ts│  │
│  │ (Dominio Negocio)    │  │ (Transporte HTTP)    │  │ (Transporte gRPC)│  │
│  │                      │  │                      │  │                  │  │
│  │ User, Resource       │  │ PaginatedResponse<T> │  │ @internal        │  │
│  │ CapabilityPreset     │  │ ApiError             │  │ GrpcXxxResponse  │  │
│  │ ModuleWithActions    │  │ QueryParams          │  │ Mensajes Proto   │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    lib/grpc/services/ (Capa de Servicio)             │  │
│  │                                                                       │  │
│  │  Mapea GrpcXxxResponse → Tipos de negocio  │  Maneja transporte     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        components/ (Capa UI)                         │  │
│  │                                                                       │  │
│  │  Usa tipos de @/types/business  │  Nunca usa tipos de transporte    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Principios de Diseño

### 1. Sin Librería de Tipos Compartida

Las aplicaciones API y Web mantienen sus tipos de forma independiente:

- **API**: Es dueña de entidades (TypeORM), DTOs (Zod) y tipos específicos de la API
- **Web**: Es dueña de tipos de negocio, tipos de transporte y tipos específicos de la UI

Esto evita el acoplamiento fuerte y permite que cada aplicación evolucione independientemente.

### 2. Separación de Responsabilidades

| Capa | Ubicación | Propósito |
|------|-----------|-----------|
| Tipos de Negocio | `web/types/business/` | Conceptos puros de dominio |
| Tipos de Transporte | `web/types/api.types.ts`, `web/lib/grpc/types.ts` | Formatos de comunicación |
| Entidades | `api/entities/` | Modelos de base de datos |
| DTOs | `api/modules/**/dto/` | Validación de entrada y formato de salida |

### 3. Los Tipos de Transporte son Internos

Los tipos gRPC se marcan como `@internal` y nunca deben filtrarse a los componentes:

```typescript
// lib/grpc/types.ts
/** @internal - No usar en componentes */
export interface GrpcResourceResponse {
  code: string;
  // ...campos del proto
}

// lib/grpc/services/resources.service.ts
import type { Resource } from '@/types/business';

export function mapToResource(grpc: GrpcResourceResponse): Resource {
  return { /* mapeo */ };
}
```

### 4. Seguridad Zero Trust

Toda la autenticación sigue el principio de **nunca confiar, siempre verificar**. La información de sesión vive exclusivamente en el servidor; el navegador nunca tiene acceso directo a tokens.

| Aspecto | Implementación |
|---------|----------------|
| Access Token | Cookie `httpOnly`, `secure`, `sameSite: lax` — TTL 15 min |
| Refresh Token | Cookie `httpOnly`, `secure`, `sameSite: lax` — TTL 7 días |
| Almacenamiento en cliente | Ninguno. Sin `localStorage`, sin `sessionStorage` |
| Contexto de sesión | Resuelto del lado del servidor vía gRPC, pasado al cliente como props de React (sin tokens) |
| Comunicación interna | gRPC con mTLS — Next.js y NestJS se autentican mutuamente con certificados |

**Por qué es sólido:**

- **Resistente a XSS**: `httpOnly` impide que JavaScript lea los tokens
- **Resistente a CSRF**: `sameSite: lax` asegura que las cookies solo viajan desde navegaciones del mismo origen
- **Cero exposición de tokens**: El navegador recibe datos de usuario resueltos (nombre, preferencias), nunca JWTs
- **Validación en cada petición**: El middleware valida contra el backend (`/auth/me`), sin confiar en estado previo
- **Doble puerta en Server Actions**: Validación en Next.js + validación en el backend gRPC — defensa en profundidad
- **Sin superficie API pública**: El backend no expone endpoints HTTP al navegador, solo gRPC interno

Ver [Decisiones de Arquitectura](./ARCHITECTURE_DECISIONS.md) para el razonamiento completo y las alternativas evaluadas.

### 5. Resguardo de Servicio en la Comunicación

La plataforma emplea un modelo de comunicación híbrido diseñado para garantizar que la capa de presentación nunca se comunique directamente con el backend, manteniendo la lógica de negocio resguardada bajo un concepto de **"caja negra" altamente segura**.

#### 5.1. Paradigmas de Comunicación

* **gRPC (Remote Procedure Calls): Alto Rendimiento y Conectividad Externa** Es el estándar core para la comunicación servidor-a-servidor. Su arquitectura basada en HTTP/2 y Protocol Buffers (binario) lo hace **ideal para integraciones con sistemas externos de alto rendimiento** que superen las capacidades de los servicios REST convencionales.

    * **Escalabilidad:** Si el backend de un cliente utiliza microservicios o ofrece conexiones gRPC veloces, **G.D.O.M.** se conecta a ellos sin convertirse en un cuello de botella, permitiendo baja latencia y streaming en tiempo real.

    * **Eficiencia:** Reduce el tamaño del payload entre un **30% y 50%** y ofrece una serialización hasta **10 veces más rápida** en listas grandes.

* **REST (Route Handlers de Next.js): Soporte Universal** Se utiliza para peticiones convencionales y soporte directo desde el navegador. Es la opción cuando la infraestructura externa no justifica la complejidad de gRPC o cuando se requiere facilidad de depuración con herramientas universales.

#### 5.2. El Principio de Resguardo (Enmascaramiento)

Un pilar innegociable de la arquitectura **G.D.O.M.** es que, independientemente del protocolo elegido (gRPC o REST), **el servicio consumido siempre se mantiene enmascarado.**

* **Aislamiento:** Nunca se comunica directamente la capa de presentación con el backend; los detalles de la infraestructura y la lógica de dominio permanecen resguardados detrás de la fachada de la plataforma.

* **Seguridad por Diseño:** Al no existir una superficie de API pública para la lógica de negocio en gRPC, se refuerza la integridad del sistema ante intentos de acceso externo.

#### 5.3. Seguridad y Protección CSRF

La estrategia de seguridad se adapta según el origen de la petición para optimizar el rendimiento sin comprometer la protección:

* **Navegador (HTTPS) → API:** En este flujo, al tratarse de endpoints HTTP públicos accesibles desde el browser, **se requiere obligatoriamente protección CSRF explícita** para mitigar riesgos de seguridad.

* **Servidor → gRPC → API:** Al ser una comunicación privada servidor-a-servidor (Server Components/Actions), **no necesita protección CSRF**, ya que no hay exposición directa al cliente web, lo que simplifica la arquitectura interna.

#### 5.4. Matriz de Decisión Técnica

| Criterio | REST (HTTP/JSON) | gRPC (Protobuf) |
|----------|------------------|-----------------|
| Integración Externa | Estándar; limitada por JSON | Ideal para alto rendimiento (> REST) |
| Resguardo de Servicio | Enmascarado | Enmascarado (Caja Negra) |
| Seguridad CSRF | Requerido (Browser → API) | No requerido (Servidor → Servidor) |
| Volumen de Datos | Payloads pequeños | Grandes volúmenes / Listas >1000 |
| Contratos | Documentación manual | Fuentes de verdad estrictas (`.proto`) |

---

## Capa API (`apps/api/`)

### Entidades (`src/entities/`)

Las entidades TypeORM definen modelos de base de datos con decoradores:

```typescript
// entities/user.entity.ts
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### DTOs (`src/modules/**/dto/`)

Los DTOs se colocan junto a sus módulos siguiendo el **principio de proximidad**:

```
modules/
├── auth/
│   └── dto/
│       ├── login.dto.ts
│       └── register.dto.ts
├── goals/
│   └── dto/
│       ├── create-goal.dto.ts
│       ├── update-goal.dto.ts
│       └── goal.response.ts
└── permissions/
    └── dto/
        ├── create-module.dto.ts    # Contiene constante MODULE_TYPES
        └── update-module.dto.ts
```

#### Patrón de DTO de Entrada (Zod)

```typescript
// modules/goals/dto/create-goal.dto.ts
import { z } from 'zod';

export const createGoalSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(200),
  targetAmount: z.number().positive('Debe ser positivo'),
  deadline: z.string().datetime(),
});

export type CreateGoalDto = z.infer<typeof createGoalSchema>;

export function validateCreateGoalDto(data: unknown): CreateGoalDto {
  return createGoalSchema.parse(data);
}
```

#### Patrón de DTO de Salida (Respuesta)

```typescript
// modules/goals/dto/goal.response.ts
import { GoalEntity } from '../../../entities/goal.entity';

export interface GoalResponse {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;  // Campo calculado
  status: string;
  createdAt: string;
}

export function toGoalResponse(entity: GoalEntity): GoalResponse {
  return {
    id: entity.id,
    name: entity.name,
    targetAmount: entity.targetAmount,
    currentAmount: entity.currentAmount,
    progress: (entity.currentAmount / entity.targetAmount) * 100,
    status: entity.status,
    createdAt: entity.createdAt.toISOString(),
  };
}
```

### Tipos (`src/types/`)

Tipos compartidos específicos de la API:

```typescript
// types/module-actions.types.ts
export interface ModuleWithActions {
  code: string;
  label: string;
  type: 'crud' | 'specialized';
  actions: ModuleAction[];
  // ...
}

export interface ModuleAction {
  code: string;
  label: string;
  settings: ActionSettings;
}
```

---

## Capa Web (`apps/web/`)

### Tipos de Negocio (`src/types/business/`)

Tipos puros de dominio — sin ORM, sin preocupaciones de transporte:

```typescript
// types/business/user.types.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export type PublicUser = Omit<User, 'isSuperAdmin'>;
```

Estructura:
```
types/business/
├── index.ts                    # Exportaciones principales
├── user.types.ts               # Dominio de usuario
├── resource.types.ts           # Recursos HATEOAS
├── capability-preset.types.ts  # Configuración de presets
├── permission.types.ts         # Sistema de permisos
├── module.types.ts             # Configuración de módulos
└── README.md                   # Lineamientos
```

### Tipos de Transporte (`src/types/api.types.ts`)

Wrappers de respuesta HTTP:

```typescript
// types/api.types.ts
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
```

### Tipos gRPC (`src/lib/grpc/types.ts`)

Tipos internos de transporte desde definiciones proto:

```typescript
// lib/grpc/types.ts

/**
 * @internal - No usar directamente en componentes
 * Usar los tipos de negocio mapeados en su lugar
 */
export interface GrpcResourceResponse {
  code: string;
  name: string;
  endpoint: string;
  capabilities: GrpcCapability[];
}

/** @internal */
export interface GrpcCapability {
  name: string;
  method: string;
  urlPattern: string;
}
```

### Capa de Servicio (`src/lib/grpc/services/`)

Mapea tipos de transporte a tipos de negocio:

```typescript
// lib/grpc/services/resources.service.ts
import type { Resource } from '@/types/business';
import type { GrpcResourceResponse } from '../types';

export function mapToResource(grpc: GrpcResourceResponse): Resource {
  return {
    code: grpc.code,
    name: grpc.name,
    endpoint: grpc.endpoint,
    capabilities: grpc.capabilities.map(c => ({
      name: c.name,
      method: c.method as HttpMethod,
      urlPattern: c.urlPattern,
    })),
  };
}
```

### Componentes

Usan solo tipos de negocio:

```typescript
// components/resources/ResourceCard.tsx
import type { Resource } from '@/types/business';

interface ResourceCardProps {
  resource: Resource;
  onEdit: () => void;
}

export function ResourceCard({ resource, onEdit }: ResourceCardProps) {
  // Implementación del componente
}
```

---

## Flujo de Datos

### Flujo de Petición en la API

```
Petición del Cliente
      │
      ▼
┌─────────────────┐
│  DTO de Entrada  │ ← Zod valida el cuerpo de la petición
│  (validación)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Capa de        │ ← Lógica de negocio
│  Servicio       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Entidad        │ ← Operaciones de base de datos
│  TypeORM        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  DTO de Salida  │ ← Mapea entidad → respuesta
│  (respuesta)    │
└────────┬────────┘
         │
         ▼
  Respuesta JSON/gRPC
```

### Flujo de Datos en la Web

```
Respuesta gRPC/HTTP
        │
        ▼
┌─────────────────┐
│  Tipos de       │ ← Tipos GrpcXxxResponse
│  Transporte     │
└────────┬────────┘
         │
         │ Mapeo en capa de servicio
         ▼
┌─────────────────┐
│  Tipos de       │ ← Tipos de @/types/business
│  Negocio        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Componentes    │ ← Componentes de UI
│  React          │
└─────────────────┘
```

---

## Buenas Prácticas

### HACER

- Usar `@/types/business` para tipos de dominio en componentes
- Crear funciones mapper explícitas entre capas
- Marcar tipos de transporte como `@internal`
- Validar toda entrada en la frontera de la API con Zod
- Agregar campos calculados en los DTOs de salida
- Colocar los DTOs junto a sus módulos

### NO HACER

- Compartir tipos entre API y Web mediante una librería
- Usar tipos de transporte (`GrpcXxx`) en componentes
- Mezclar decoradores ORM con tipos de negocio
- Exponer IDs internos o detalles de implementación
- Omitir validación en la entrada de la API
- Crear utilidades genéricas compartidas

---

## Documentación Relacionada

- [README de la API](../apps/api/README.md)
- [README de Tipos de Negocio](../apps/web/src/types/business/README.md)
- [Resumen del Proyecto](./SUMMARY.md)
