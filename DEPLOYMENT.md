# VINI Deployment & Migration Runbook

This document details the procedures for deploying the VINI Full-Stack E-Commerce Platform to a production environment.

## 1. Prerequisites
- **Docker Engine** and **Docker Compose** installed on the host machine.
- Minimum 2GB RAM / 2 vCPUs recommended for SQL Server + .NET + Next.js stack.
- A domain name (optional but recommended for production) and SSL certificates (via Let's Encrypt / Nginx).

## 2. Environment Variables & Secrets
Before deploying, you MUST change the default passwords and settings in `docker-compose.yml` or load them via an `.env` file.

**Required Overrides:**
- `MSSQL_SA_PASSWORD`: The SQL Server SA password (must be strong).
- `ConnectionStrings__DefaultConnection`: Update the connection string in the backend to match the new SA password.
- `Cors__AllowedOrigins__0`: Change this to the public URL of your Next.js frontend (e.g., `https://www.vini.com`).
- `NEXT_PUBLIC_API_URL`: Update to the public API URL (e.g., `https://api.vini.com/api`).

## 3. Production Deployment via Docker Compose

1. Clone or copy the repository to the production server.
2. Navigate to the root directory containing `docker-compose.yml`.
3. Run the following command to build the optimized production images:
   ```bash
   docker-compose build
   ```
4. Start the stack in detached mode:
   ```bash
   docker-compose up -d
   ```
5. Verify services are running:
   ```bash
   docker-compose ps
   ```
   Both `db`, `backend`, and `frontend` should show as `Up`.

## 4. EF Core Migrations (Runbook)

By default, the backend API is configured to run `DatabaseInitializer.InitializeAsync()` automatically on startup **ONLY in the Development environment**. 
For Production (`ASPNETCORE_ENVIRONMENT=Production`), migrations must be applied explicitly to avoid race conditions when scaling out multiple backend containers.

### Applying Migrations to Production
To apply database schema changes in production, run the EF Core CLI against the live database from your build pipeline, or execute the SQL script.

**Option A: Generate SQL Script (Recommended for DBAs)**
```bash
# On your local dev machine:
cd backend/src/Vini.Infrastructure
dotnet ef migrations script -o migration.sql
# Run the resulting migration.sql file against the production SQL Server database.
```

**Option B: EF Core Bundle (Self-Contained Executable)**
```bash
# Generate a self-contained executable that applies migrations
dotnet ef migrations bundle -r linux-x64 --self-contained
# Copy the generated 'efbundle' to the server and run it:
./efbundle --connection "Server=...;Database=ViniDb;..."
```

## 5. Security & Hardening Checklist
- [ ] Ensure `MSSQL_SA_PASSWORD` meets complexity requirements.
- [ ] Place the stack behind a reverse proxy (e.g., Nginx, Caddy, Traefik) that terminates SSL/TLS (HTTPS).
- [ ] Restrict port `1433` (SQL Server) so it is NOT exposed to the public internet. Remove the `ports: - "1433:1433"` mapping in `docker-compose.yml` if external access is not required.
- [ ] Ensure Cookie configuration (`SecurePolicy`) is set to `Always` when running strictly behind HTTPS.

## 6. Accessing the Admin Dashboard
Once deployed, the database seeder (if run manually or via a separate job) will create an initial admin account.
- **Login URL**: `https://your-domain.com/admin/login`
- **Default Email**: `admin@vini.com`
- **Default Password**: `Admin123!` *(Change immediately via SQL or Admin Dashboard once built)*.
