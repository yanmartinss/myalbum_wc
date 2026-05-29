#!/bin/sh
set -e

echo "Aplicando migrações do Prisma..."
attempt=0
max_attempts=30

until npx prisma migrate deploy; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Falha ao aplicar migrações após ${max_attempts} tentativas."
    exit 1
  fi
  echo "Banco ainda não disponível. Nova tentativa em 2s (${attempt}/${max_attempts})..."
  sleep 2
done

echo "Migrações aplicadas. Iniciando servidor..."
exec "$@"
