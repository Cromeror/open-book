# Configuración de Base de Datos

Este documento describe cómo configurar PostgreSQL para el desarrollo de G.D.O.M.

## Inicio Rápido con Docker

La forma más sencilla de ejecutar PostgreSQL es con Docker Compose:

```bash
# Iniciar PostgreSQL
docker-compose up -d postgres

# Verificar estado
docker-compose ps

# Ver logs
docker-compose logs -f postgres

# Detener
docker-compose down
```

## Configuración de la Base de Datos

### Variables de Entorno

Copie el archivo de entorno de ejemplo y configure su base de datos:

```bash
cd apps/api
cp .env.example .env
```

Edite `.env` con sus credenciales de base de datos:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=openbook
DATABASE_USER=postgres
DATABASE_PASSWORD=your_secure_password
DATABASE_URL=postgresql://postgres:your_secure_password@localhost:5432/openbook
DATABASE_POOL_SIZE=10
DATABASE_SSL=false
```

### Formato de la Cadena de Conexión

```
postgresql://[usuario]:[contraseña]@[host]:[puerto]/[base_de_datos]
```

## Instalación Manual de PostgreSQL

Si prefiere instalar PostgreSQL localmente:

### macOS (Homebrew)

```bash
brew install postgresql@16
brew services start postgresql@16
createdb openbook
```

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql-16 postgresql-contrib-16
sudo systemctl start postgresql
sudo -u postgres createdb openbook
```

### Windows

Descargue e instale desde [postgresql.org](https://www.postgresql.org/download/windows/)

## Creación de la Base de Datos

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE openbook;

# Crear usuario (opcional)
CREATE USER openbook_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE openbook TO openbook_user;

# Salir
\q
```

## Base de Datos de Pruebas

Hay una base de datos de pruebas disponible en el puerto 5433:

```bash
# Iniciar base de datos de pruebas
docker-compose up -d postgres-test

# Conectarse a la base de datos de pruebas
psql -h localhost -p 5433 -U postgres -d openbook_test
```

La base de datos de pruebas usa tmpfs como almacenamiento (los datos se pierden al reiniciar), lo que hace las pruebas más rápidas.

## Comandos Útiles

```bash
# Conectarse a la base de datos
psql -h localhost -p 5432 -U postgres -d openbook

# Listar bases de datos
\l

# Listar tablas
\dt

# Describir tabla
\d nombre_tabla

# Ejecutar archivo SQL
psql -h localhost -U postgres -d openbook -f script.sql
```

## Consideraciones para Producción

Para despliegues en producción:

1. **Habilitar SSL**: Configure `DATABASE_SSL=true`
2. **Usar contraseñas seguras**: Genere contraseñas robustas
3. **Limitar conexiones**: Configure `DATABASE_POOL_SIZE` apropiadamente
4. **Respaldos regulares**: Configure procedimientos de respaldo automatizados
5. **Monitorear rendimiento**: Use la extensión pg_stat_statements
