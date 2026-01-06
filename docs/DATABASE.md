# Database Setup

This document describes how to set up PostgreSQL for OpenBook development.

## Quick Start with Docker

The easiest way to get PostgreSQL running is with Docker Compose:

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Check status
docker-compose ps

# View logs
docker-compose logs -f postgres

# Stop
docker-compose down
```

## Database Configuration

### Environment Variables

Copy the example env file and configure your database:

```bash
cd apps/api
cp .env.example .env
```

Edit `.env` with your database credentials:

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

### Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

## Manual PostgreSQL Setup

If you prefer to install PostgreSQL locally:

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

Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

## Creating the Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE openbook;

# Create user (optional)
CREATE USER openbook_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE openbook TO openbook_user;

# Exit
\q
```

## Test Database

A separate test database is available on port 5433:

```bash
# Start test database
docker-compose up -d postgres-test

# Connect to test database
psql -h localhost -p 5433 -U postgres -d openbook_test
```

The test database uses tmpfs for storage (data is lost on restart), making tests faster.

## Useful Commands

```bash
# Connect to database
psql -h localhost -p 5432 -U postgres -d openbook

# List databases
\l

# List tables
\dt

# Describe table
\d table_name

# Execute SQL file
psql -h localhost -U postgres -d openbook -f script.sql
```

## Production Considerations

For production deployments:

1. **Enable SSL**: Set `DATABASE_SSL=true`
2. **Use strong passwords**: Generate secure passwords
3. **Limit connections**: Configure `DATABASE_POOL_SIZE` appropriately
4. **Regular backups**: Set up automated backup procedures
5. **Monitor performance**: Use pg_stat_statements extension
