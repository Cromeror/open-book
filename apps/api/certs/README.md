# mTLS Certificates for gRPC Server

Este directorio contiene los certificados necesarios para la autenticación mTLS (mutual TLS) del servidor gRPC.

## Generación de Certificados (Desarrollo)

Para generar certificados de desarrollo:

```bash
cd apps/api
chmod +x scripts/generate-dev-certs.sh
./scripts/generate-dev-certs.sh
```

Este script genera:
- **CA Certificate** (`ca-cert.pem`): Autoridad certificadora para firmar otros certificados
- **CA Key** (`ca-key.pem`): Clave privada de la CA
- **Server Certificate** (`server-cert.pem`): Certificado del servidor gRPC
- **Server Key** (`server-key.pem`): Clave privada del servidor
- **Client Certificate** (`client-cert.pem`): Certificado del cliente para pruebas
- **Client Key** (`client-key.pem`): Clave privada del cliente

## Configuración

Agregar las siguientes variables al archivo `.env`:

```env
GRPC_ENABLED=true
GRPC_PORT=50051
GRPC_HOST=0.0.0.0
GRPC_SERVER_CERT_PATH=./certs/server-cert.pem
GRPC_SERVER_KEY_PATH=./certs/server-key.pem
GRPC_CA_CERT_PATH=./certs/ca-cert.pem
GRPC_REQUIRE_CLIENT_CERT=true
```

## Seguridad

⚠️ **IMPORTANTE**: Los certificados generados por el script son **SOLO PARA DESARROLLO**.

**NO usar en producción**. En producción:

1. Usar certificados emitidos por una CA confiable (Let's Encrypt, DigiCert, etc.)
2. Almacenar las claves privadas en un gestor de secretos (AWS Secrets Manager, HashiCorp Vault, etc.)
3. Rotar certificados regularmente
4. Monitorear fechas de expiración
5. Usar certificados con nombres de dominio reales (no `localhost`)

## Renovación de Certificados

Los certificados de desarrollo tienen validez de 10 años. Para renovarlos:

```bash
# Eliminar certificados anteriores
rm apps/api/certs/*.pem

# Generar nuevos certificados
./apps/api/scripts/generate-dev-certs.sh
```

## Testing con grpcurl

Ejemplo de llamada gRPC con mTLS:

```bash
grpcurl \
  -cert certs/client-cert.pem \
  -key certs/client-key.pem \
  -cacert certs/ca-cert.pem \
  -H "authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{}' \
  localhost:50051 \
  openbook.condominiums.CondominiumsService/GetUserCondominiums
```

## Troubleshooting

### Error: "certificate verify failed"
- Verificar que el certificado cliente esté firmado por la misma CA que el servidor
- Verificar que `ca-cert.pem` coincida en cliente y servidor

### Error: "connection refused"
- Verificar que el servidor gRPC esté ejecutándose en el puerto configurado
- Verificar que `GRPC_ENABLED=true` en `.env`

### Error: "permission denied"
- Verificar permisos de archivos: `chmod 600 certs/*.pem && chmod 644 certs/*-cert.pem`
