# VitaTrack Backend Architecture

This document defines the architectural decisions, project structure, and methodologies used in the VitaTrack Backend application.

## 1. Architectural Overview

VitaTrack follows **Clean Architecture** principles, enforcing a strict separation of concerns. The solution is strictly layered to ensure that the core business rules (Domain) remain independent of frameworks, databases, and external interfaces.

### Core Principles
- **Dependency Rule**: Dependencies only point inwards. The core layers (Domain/Application) know nothing about the outer layers (Infrastructure/API).
- **CQRS (Command Query Responsibility Segregation)**: Read (Query) and Write (Command) operations are handled separately using the **MediatR** library.
- **Repository Pattern**: Data access is abstracted behind generic repositories, decoupling the application from the specific database implementation (EF Core).

## 2. Project Structure

The solution `VitaTrack.Backend.sln` is organized into the following projects:

### 📂 `src/VitaTrack.Domain` (Core)
*The heart of the application. Contains enterprise logic and types.*
- **Entities**: Mutable classes representing database tables (e.g., `User`, `Activity`, `Meal`). All inherit from `BaseEntity`.
- **Enums**: Fixed sets of values (e.g., `ActivityCategory`, `ExerciseType`).
- **Interfaces**: Contracts for data access (e.g., `IRepository<T>`) that Infrastructure must implement.
- **Dependencies**: None.

### 📂 `src/VitaTrack.Application` (Business Logic)
*Orchestrates the flow of data. Contains application-specific business rules.*
- **Features/Modules** (Organized by domain concept: `Activities`, `Meals`, `Workouts`):
  - **Commands**: Write requests (e.g., `CreateMealCommand`). Implementation of `IRequest<T>`.
  - **Queries**: Read requests (e.g., `GetDailyMealsQuery`). Implementation of `IRequest<T>`.
  - **Handlers**: The logic that executes commands/queries.
  - **DTOs**: Data Transfer Objects returned to the API. Simple records.
  - **Validators**: FluentValidation rules for commands.
- **Common**: Behaviors (Pipeline triggers like Validation), Mappers (AutoMapper profiles).
- **Interfaces**: Contracts for infrastructure services (e.g., `IIdentityService`, `IEmailService`, `IAnalyticsService`).
- **Dependencies**: `VitaTrack.Domain`.

### 📂 `src/VitaTrack.Infrastructure` (Implementation)
*Gateways to the outside world. Implements interfaces defined in inner layers.*
- **Persistence**: `VitaTrackDbContext`, generic `Repository<T>`, Migrations, Seeding (`VitaTrackDbContextInitialiser`).
- **Services**: Concrete implementations of application interfaces (e.g., `IdentityService` for JWT, `AnalyticsService`).
- **Jobs**: Background tasks (Hangfire jobs) like `DailyValuesJob` and `JobsService`.
- **Dependencies**: `VitaTrack.Application`, `VitaTrack.Domain`, implementation specifics (EF Core, Npgsql, Hangfire).

### 📂 `src/VitaTrack.Api` (Presentation)
*Entry point for the application. Handles HTTP requests.*
- **Controllers**: Thin REST endpoints. They construct Commands/Queries and send them to MediatR.
- **Middleware**: Global Exception Handling, Authentication/Authorization.
- **Program.cs**: Dependency Injection wiring, App Configuration, Hangfire Dashboard setup.
- **Dependencies**: `VitaTrack.Application`, `VitaTrack.Infrastructure`.

### 📂 `src/VitaTrack.Common` (Shared)
*Cross-cutting utilities.*
- **Helpers**: Date formatting, extension methods.
- **Constants**: Policy names, Magic strings.

## 3. Data Flow & Request Lifecycle

Here is how a typical request (e.g., "Create Activity Log") flows through the system:

1.  **Request**: Client sends `POST /api/activitylogs`.
2.  **API Layer**: 
    - `ActivityLogsController` receives the JSON.
    - Maps inputs to a `CreateActivityLogCommand`.
    - Calls `_mediator.Send(command)`.
3.  **Application Layer**:
    - **Pipeline Behavior**: `ValidationBehavior` intercepts the command.
    - **FluentValidation**: Checks built-in rules (e.g., "Duration > 0"). Throws `ValidationException` on failure.
    - **Handler**: `CreateActivityLogHandler` is invoked.
    - **Logic**: Handler maps Command -> Domain Entity (`ActivityLog`).
    - **Interaction**: Calls `IRepository<ActivityLog>.AddAsync()`.
    - **Mapping**: Maps the saved Entity -> `ActivityLogDto`.
4.  **Infrastructure Layer**:
    - `Repository` saves the entity to `DbContext`.
    - EF Core translates this to SQL (`INSERT INTO "ActivityLogs"...`) and commits to PostgreSQL.
5.  **Response**: The DTO is returned up the stack to the Controller, which returns `201 Created`.

## 4. Key Methodologies & Patterns

### Validation
We use **FluentValidation** to separate validation logic from the models. Validation is automatically applied via a MediatR Pipeline Behavior. This ensures no handler executes with invalid data.

### background Jobs
**Hangfire** is used for:
- Recurring tasks (Daily BMR updates, Email reminders).
- Fire-and-forget tasks (Email sending).
The dashboard is available at `/hangfire`.

### Authentication
- **JWT (JSON Web Tokens)**: Stateless authentication.
- **Refresh Tokens**: Stored in the database (`RefreshToken` entity) to allow long-lived sessions securely.
- **Policies**: Authorization policies (e.g., "Admin", "User") managed in `VitaTrack.Common` and applied via `[Authorize]`.

### Database Management
- **Code-First**: Database schema is defined by C# Entity classes.
- **Migrations**: `dotnet ef migrations` manages schema evolution.
- **Seeding**: `VitaTrackDbContextInitialiser` ensures default data (Foods, Activities) exists on startup for Development environments.
