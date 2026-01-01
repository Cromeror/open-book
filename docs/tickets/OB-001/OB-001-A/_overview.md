# OB-001-A: Setup inicial del proyecto y dependencias

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-001 - Configuracion e Infraestructura del Proyecto |
| Status | in-progress |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2026-01-01 |
| Labels | story, setup, infraestructura |
| Depends on | - |

## User Story

**Como** desarrollador del proyecto
**Quiero** tener el proyecto inicializado con todas las dependencias y configuraciones basicas
**Para** poder comenzar a desarrollar las funcionalidades del sistema de forma estructurada

## Descripcion

Esta story cubre la inicializacion completa del proyecto, incluyendo la estructura de carpetas, configuracion de TypeScript, linters (ESLint, Prettier), y la instalacion de dependencias base necesarias para el desarrollo del backend y frontend.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-001-A-001](./OB-001-A-001.md) | Inicializar monorepo Nx con pnpm y estructura de carpetas | ✅ completed |
| [OB-001-A-002](./OB-001-A-002.md) | Configurar TypeScript con tsconfig apropiado | pending |
| [OB-001-A-003](./OB-001-A-003.md) | Configurar ESLint y Prettier | pending |
| [OB-001-A-004](./OB-001-A-004.md) | Configurar variables de entorno con dotenv | pending |
| [OB-001-A-005](./OB-001-A-005.md) | Crear README con instrucciones de setup | pending |

## Criterios de Aceptacion

- [x] El proyecto tiene una estructura de carpetas clara y documentada
- [ ] TypeScript esta configurado con modo estricto
- [ ] ESLint y Prettier estan configurados y funcionando
- [ ] Las variables de entorno tienen un archivo .env.example
- [ ] El README contiene instrucciones completas de instalacion

## Stack Tecnologico

| Componente | Tecnologia | Version |
|------------|------------|---------|
| Monorepo | Nx | ^19.x |
| Package Manager | pnpm | ^8.x |
| Backend | NestJS | ^10.x |
| Frontend | Next.js | ^14.x |
| Base de datos | PostgreSQL | 16 |
| ORM | TypeORM | ^0.3.x |
| Runtime | Node.js | ^20.x |
| Lenguaje | TypeScript | ^5.x |
| Formularios | React Hook Form | ^7.x |
| Validación | Zod | ^3.x |
| Estilos | Tailwind CSS | ^3.x |
| HTTP Client | Axios | ^1.x |

## Notas Tecnicas

- Monorepo con Nx para gestionar backend (NestJS) y frontend (Next.js)
- Usar pnpm como package manager para mejor manejo de dependencias
- TypeScript 5.x con configuracion estricta
- Configurar path aliases para imports mas limpios

## Dependencias

- **Depende de**: Ninguna
- **Bloquea a**: OB-001-B, OB-001-C
