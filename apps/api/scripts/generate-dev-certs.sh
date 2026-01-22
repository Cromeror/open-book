#!/bin/bash

# Script to generate self-signed certificates for gRPC mTLS (development only)
# DO NOT USE IN PRODUCTION

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERTS_DIR="$SCRIPT_DIR/../certs"

# Create certs directory if it doesn't exist
mkdir -p "$CERTS_DIR"

echo "🔐 Generating mTLS certificates for development..."
echo "📁 Certificates will be saved to: $CERTS_DIR"
echo ""

# Step 1: Generate CA (Certificate Authority)
echo "1️⃣  Generating CA certificate..."
openssl genrsa -out "$CERTS_DIR/ca-key.pem" 4096
openssl req -new -x509 -days 3650 -key "$CERTS_DIR/ca-key.pem" -out "$CERTS_DIR/ca-cert.pem" \
  -subj "/C=CO/ST=Bogota/L=Bogota/O=OpenBook Dev/OU=Development/CN=OpenBook Dev CA"

# Step 2: Generate Server Certificate
echo "2️⃣  Generating server certificate..."
openssl genrsa -out "$CERTS_DIR/server-key.pem" 4096
openssl req -new -key "$CERTS_DIR/server-key.pem" -out "$CERTS_DIR/server-csr.pem" \
  -subj "/C=CO/ST=Bogota/L=Bogota/O=OpenBook Dev/OU=Development/CN=localhost"

# Create extensions file for server certificate (includes localhost and 127.0.0.1)
cat > "$CERTS_DIR/server-ext.cnf" << EOF
basicConstraints = CA:FALSE
nsCertType = server
nsComment = "OpenBook gRPC Server Certificate"
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer:always
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

openssl x509 -req -days 3650 -in "$CERTS_DIR/server-csr.pem" \
  -CA "$CERTS_DIR/ca-cert.pem" -CAkey "$CERTS_DIR/ca-key.pem" -CAcreateserial \
  -out "$CERTS_DIR/server-cert.pem" \
  -extfile "$CERTS_DIR/server-ext.cnf"

# Step 3: Generate Client Certificate
echo "3️⃣  Generating client certificate..."
openssl genrsa -out "$CERTS_DIR/client-key.pem" 4096
openssl req -new -key "$CERTS_DIR/client-key.pem" -out "$CERTS_DIR/client-csr.pem" \
  -subj "/C=CO/ST=Bogota/L=Bogota/O=OpenBook Dev/OU=Development/CN=OpenBook Dev Client"

# Create extensions file for client certificate
cat > "$CERTS_DIR/client-ext.cnf" << EOF
basicConstraints = CA:FALSE
nsCertType = client, email
nsComment = "OpenBook gRPC Client Certificate"
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid,issuer
keyUsage = critical, nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = clientAuth, emailProtection
EOF

openssl x509 -req -days 3650 -in "$CERTS_DIR/client-csr.pem" \
  -CA "$CERTS_DIR/ca-cert.pem" -CAkey "$CERTS_DIR/ca-key.pem" -CAcreateserial \
  -out "$CERTS_DIR/client-cert.pem" \
  -extfile "$CERTS_DIR/client-ext.cnf"

# Clean up temporary files
echo "🧹 Cleaning up temporary files..."
rm -f "$CERTS_DIR"/*.csr "$CERTS_DIR"/*.cnf "$CERTS_DIR"/*.srl

# Set proper permissions
chmod 600 "$CERTS_DIR"/*.pem
chmod 644 "$CERTS_DIR"/*-cert.pem

echo ""
echo "✅ Certificate generation complete!"
echo ""
echo "📋 Generated files:"
echo "   - CA Certificate:     $CERTS_DIR/ca-cert.pem"
echo "   - CA Key:             $CERTS_DIR/ca-key.pem"
echo "   - Server Certificate: $CERTS_DIR/server-cert.pem"
echo "   - Server Key:         $CERTS_DIR/server-key.pem"
echo "   - Client Certificate: $CERTS_DIR/client-cert.pem"
echo "   - Client Key:         $CERTS_DIR/client-key.pem"
echo ""
echo "⚠️  WARNING: These certificates are for DEVELOPMENT ONLY!"
echo "   Do NOT use them in production environments."
echo ""
echo "🔄 To use these certificates:"
echo "   1. Set GRPC_SERVER_CERT_PATH=./certs/server-cert.pem in .env"
echo "   2. Set GRPC_SERVER_KEY_PATH=./certs/server-key.pem in .env"
echo "   3. Set GRPC_CA_CERT_PATH=./certs/ca-cert.pem in .env"
echo ""
