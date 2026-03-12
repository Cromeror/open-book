# Definiciones Técnicas

Este documento tiene como finalidad definir los estándares arquitectónicos, protocolos de seguridad y lineamientos de implementación de **G.D.O.M.** (Goal-Driven Operations Manager) para el equipo de ingeniería y arquitectura. Su objetivo es servir como la única fuente de verdad técnica para el desarrollo, mantenimiento y escalado de una plataforma concebida como una fachada empresarial y capa de integración robusta.

A través de sus apartados, el documento técnico busca:

- **Establecer la Arquitectura de Desacoplamiento:** Detallar el modelo de capas independientes donde la API y la Web mantienen sus propias definiciones de tipos para evitar el acoplamiento fuerte y permitir una evolución autónoma de los servicios.

- **Definir el Modelo de Seguridad Zero Trust:** Describir la implementación de la "doble puerta" de seguridad, que incluye el manejo de sesiones exclusivo en el servidor mediante cookies `httpOnly`, y el blindaje de comunicaciones internas a través de gRPC con mTLS (certificados RSA de 4096 bits).

- **Normalizar la Lógica de Dominio y Capacidades:** Explicar el funcionamiento del motor de HATEOAS, el cual utiliza un modelo de capacidades unificado para inyectar dinámicamente lógica de negocio y navegación en las respuestas de la API según los permisos del usuario.

- **Guiar la Integración de Sistemas Externos:** Proveer las pautas para orquestar datos de terceros (como CaptuData) mediante el cifrado de credenciales en reposo con AES-256-GCM y su procesamiento seguro en el lado del servidor.

- **Documentar la Infraestructura y Deuda Técnica:** Exponer las configuraciones críticas de la base de datos PostgreSQL, los flujos de despliegue y los puntos de deuda técnica identificados (como la migración de canales REST a mTLS) para garantizar la mejora continua de la "caja negra" operativa que representa el sistema.

En resumen, este documento es la hoja de ruta técnica para asegurar que cada componente de **G.D.O.M.** cumpla con los principios de trazabilidad, inmutabilidad y alta disponibilidad exigidos por el dominio de negocio.

---

## Deuda Técnica: Conexiones Servidor-a-Servidor sin mTLS

Para cumplir con el objetivo de convertir a **G.D.O.M.** en una "caja negra" totalmente blindada, se han identificado los siguientes flujos internos que operan sin mTLS, lo que representa una inconsistencia con el principio de *"nunca confiar, siempre verificar"*.

### Flujos identificados

#### 1. Route Handlers (`/api/...`) → NestJS

Estas peticiones se realizan actualmente mediante HTTP plano utilizando Axios. Aunque están protegidas por JWT, carecen de la identidad de máquina que proporciona el mTLS, lo que impide asegurar físicamente que el emisor sea el servidor oficial de Next.js.

#### 2. Proxy de Embed (`/ext/...`) → NestJS

Este canal de comunicación utiliza HTTP plano a través de `fetch`. Al igual que los Route Handlers, depende exclusivamente de la validación de tokens de sesión y no de certificados mutuos, dejando una superficie de ataque interna sin blindaje de infraestructura.

#### 3. NestJS → PostgreSQL

La conexión entre el backend y la base de datos se realiza vía TCP con SSL opcional, pero no implementa un esquema de mTLS. Esto significa que, aunque el tráfico pueda estar cifrado, no existe una autenticación mutua estricta basada en certificados para validar la identidad de ambos extremos del flujo de datos.

### Impacto Arquitectónico

Mantener estos canales sin mTLS contraviene el diseño de **"Zero Trust"**, donde idealmente el backend no debería tener endpoints HTTP accesibles sin una identidad de servidor validada.

La resolución de esta deuda técnica implica:

- **Migrar estos flujos hacia gRPC** para heredar automáticamente la configuración de certificados mutuos (RSA 4096-bit), o
- **Implementar mTLS de forma explícita** en los clientes HTTP del servidor.
