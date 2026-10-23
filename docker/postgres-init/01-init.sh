#!/usr/bin/env bash
set -e

echo "[INIT] Enabling PostGIS, pgcrypto and pg_trgm..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS postgis;
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
EOSQL

echo "[INIT] Applying migrations from /migrations/*.up.sql..."
for migration in $(ls /migrations/*.up.sql | sort -V); do
    echo "[INIT] Running: $migration"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$migration"
done

echo "[INIT] All migrations applied successfully!"
