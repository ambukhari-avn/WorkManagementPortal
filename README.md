# Enterprise Work Management Portal

A full-stack work management application built with ASP.NET Core 10 (Web API) and Angular 22, featuring project/task management, role-based access control, file attachments, comments, and audit logging.

## Tech Stack

**Backend**
- ASP.NET Core 10 Web API
- Entity Framework Core (SQL Server)
- JWT Authentication (access + refresh tokens)
- FluentValidation
- xUnit (unit + integration tests)

**Frontend**
- Angular 22 (standalone components)
- CoreUI + Bootstrap 5
- Chart.js (via ng2-charts)
- Reactive Forms
- Vitest (unit tests)

## Features

- JWT-based login/register with refresh token flow
- Role-based access control (Admin / Member)
- Projects, Tasks, Users — full CRUD with relationships and audit fields
- Project membership management
- Task comments and file attachments
- Dashboard with summary cards and a task-status chart
- Search, filtering, sorting, and pagination on Projects and Tasks
- Audit logging on Projects, Tasks, and Comments
- Structured logging, global error handling, health check endpoint
- Swagger/OpenAPI documentation

## Project Structure
WorkManagementPortal/
├── src/
│ ├── API/ # Controllers, Program.cs, middleware
│ ├── Application/ # Services, DTOs, validators, interfaces
│ ├── Domain/ # Entities, enums
│ ├── Infrastructure/ # EF Core, file storage, auth
│ └── Web/ # Angular frontend
├── tests/
│ ├── EnterpriseWorkManagementPortal.UnitTests/
│ └── EnterpriseWorkManagementPortal.IntegrationTests/
└── EnterpriseWorkManagementPortal.slnx


## Prerequisites

- .NET 10 SDK
- Node.js (LTS) + npm
- SQL Server (LocalDB or full instance)
- Angular CLI (`npm install -g @angular/cli`)

## Local Development Setup

### 1. Clone and Restore

```bash
git clone <your-repo-url>
cd WorkManagementPortal
dotnet restore
```

### 2. Configure Secrets (Backend)

From `src/API`:
```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Database=WorkManagementPortal;Trusted_Connection=True;TrustServerCertificate=True"
dotnet user-secrets set "Jwt:Key" "<a long random secret string>"
```

### 3. Apply Migrations

```bash
dotnet ef database update --project src/Infrastructure --startup-project src/API
```

### 4. Run the Backend

```bash
dotnet run --project src/API
```
API runs at `http://localhost:5090` (check `launchSettings.json` for the exact port). Swagger UI is available at `/swagger`.

### 5. Run the Frontend

```bash
cd src/Web
npm install
ng serve
```
App runs at `http://localhost:4200`.

## Running Tests

**Backend:**
```bash
dotnet test
```

**Frontend:**
```bash
cd src/Web
ng test
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full IIS deployment instructions.

## Default Roles

New registrations default to the **Member** role. To create an Admin account, register normally, then promote via SQL:
```sql
UPDATE Users SET Role = 'Admin' WHERE Email = 'your-email@example.com';
```

## License

Internal learning project — not licensed for external distribution.