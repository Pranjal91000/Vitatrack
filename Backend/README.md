# VitaTrack Backend

A RESTful API for a Notion-inspired life activities tracker (activities, meals, workouts). Built with .NET 8, Clean Architecture, CQRS, and PostgreSQL.

## Prerequisites

- .NET 8 SDK
- PostgreSQL (local or cloud; set connection string in `src/VitaTrack.Api/appsettings.json`)

## Quick start

1. **Restore and configure**
   ```bash
   cd Backend
   dotnet restore
   ```
   Edit `src/VitaTrack.Api/appsettings.json` → `ConnectionStrings:DefaultConnection` for your database.

2. **Apply migrations** (if needed)
   ```bash
   dotnet ef database update --project src/VitaTrack.Infrastructure --startup-project src/VitaTrack.Api
   ```

3. **Run the API**
   ```bash
   dotnet run --project src/VitaTrack.Api/VitaTrack.Api.csproj
   ```

   URLs depend on `Properties/launchSettings.json` (default HTTP is often `http://localhost:5177`). Open **Swagger** at `/swagger` on that base URL.

4. **Run tests**
   ```bash
   dotnet test
   ```

## Architecture

- **Domain**: Pure domain entities, enums, exceptions. No dependencies.
- **Application**: Business logic, CQRS (MediatR), DTOs, Validators.
- **Infrastructure**: Data access (EF Core), external services, Identity.
- **Api**: REST Controllers, Middleware, Hosting.
- **Common**: Shared utilities.

## Features

- **Authentication**: JWT based auth (Register, Login, Refresh).
- **Activities**: Track time and categorize activities.
- **Meals**: Log meals with nutritional info (Calories, Macros).
- **Workouts**: Log sets, reps, and volume for exercises.
- **Analytics**: Basic streak tracking.

## Seed data

On startup the app runs EF migrations and seeds default foods and meal slots when appropriate.
