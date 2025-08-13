# Task Manager

## NX Monorepo – Full-Stack Application

This repository contains a **TypeScript-based NX monorepo** that includes multiple backend and frontend applications along with shared libraries.

## Project Structure

```
.
├── apps/
│   ├── api/                        # NestJS backend for main API
│   ├── auth/                       # NestJS backend for authentication
│   └── dashboard/                  # React frontend (dashboard UI)
├── libs/
│   ├── data/                       # Shared data types & generated OpenAPI types
│   └── shared-auth/                # Shared NestJS guards & decorators for authentication
├── tools/
│   └── generate-openapi-types.js   # Script to generate OpenAPI types & fetch clients
└── data/                           # SQLite databases
```

## Domain Overview

### Entities

- `users`: application users (authenticated via apps/auth).

- `organizations`: containers for memberships, tasks, and audit logs.

- `memberships`: relation between users and organizations with role (`owner` | `admin` | `viewer`).

- `tasks`: work items that belong to an organization.

- `audit-logs`: immutable records describing who did what and when in an organization.

### Typical flows

- Create organization: any authenticated user can create an organization; they become `owner`.

- Add members: owners can add members and assign roles.

- Tasks lifecycle: owners/admins create/update/delete tasks; all roles can read tasks.

- Auditing: mutating operations produce audit-log records; logs can be listed (paginated) by owners/admins.

## Tech Stack

### Monorepo & Language

- **NX** – Monorepo management
- **TypeScript**
- **npm** – Package manager

### Backend

- **NestJS** – API & authentication services
- **Swagger/OpenAPI** – API documentation
- **openapi-typescript** – Generate API types from OpenAPI docs
- **openapi-fetch** – Fully type-safe fetch clients from generated types

### Frontend

- **React** – SPA dashboard
- **TailwindCSS** + **DaisyUI** – UI styling
- **React Router** – Routing
- **React Query (TanStack Query)** – Data fetching & caching
- **Zustand** – Persistent state (auth & theme)
- **zod** & **react-hook-form** – Validated and type-safe form state

### Database

- **SQLite** – Simple local database storage in `data/`

## Feature Highlights

### Type-safe API calls

- `openapi-typescript` generates shared types into `libs/data`.

- `openapi-fetch` creates typed api clients usable by both backend and frontend.

- Run `npm run generate:types` after changing backend Swagger decorators to stay in sync.

### Caching & performance

- React Query caches successful responses to reduce API calls.

- Mutations invalidate relevant queries so data reflect latest server state.

- JWT authentication: the dashboard includes the token on requests; backends validate it.

- RBAC enforced per organization using `libs/shared-auth` Nest guards/decorators.

- UI elements are conditionally rendered based on the current user’s role within the selected organization.

### Reliability & UX

- Expired tokens trigger an automatic logout via Zustand.

- Responsive UI with accessible components (DaisyUI).

- Clear error and loading states integrated with React Query.

- Users can modify a task's status via drag-and-drop (moving task card between columns)

## API Types & Fetch Client Generation

To generate **OpenAPI types** and **fetch clients** for both frontend and backend:

```sh
npm run generate:types
```

This runs:

```sh
node tools/generate-openapi-types.js
```

## Authentication & Authorization

- **JWT-based authentication**
- **Role-Based Access Control (RBAC)** per organization:
  - **Roles**: `owner` > `admin` > `viewer`
  - **Hierarchical access**: higher roles inherit lower roles' permissions.

### RBAC Rules

| Action                          | Roles                      |
| ------------------------------- | -------------------------- |
| Create task in organization     | `owner`, `admin`           |
| Get organization tasks          | `owner`, `admin`, `viewer` |
| Update task                     | `owner`, `admin`           |
| Delete task                     | `owner`, `admin`           |
| Create organization             | all authenticated users    |
| Get single organization         | all authenticated users    |
| Add member to organization      | `owner`                    |
| Remove member from organization | `owner`                    |
| Get organization members        | `owner`, `admin`, `viewer` |
| Get audit logs of organization  | `owner`, `admin`           |

## Swagger Docs

Online SwaggerUI is provided for all backend services:

- **API Service** → [http://localhost:3000/docs](http://localhost:3000/docs)
- **Auth Service** → [http://localhost:3001/docs](http://localhost:3001/docs)

## Running the Project

### Clone the repository

```sh
git clone https://github.com/BehzadBarzin/task-manager
cd task-manager
```

### Install dependencies

```sh
npm install
```

### Setup environment variables

Copy `.env-example` to `.env` in the **root** folder and modify as needed.

```sh
cp .env-example .env
```

For the **frontend**:

```sh
cp apps/dashboard/.env-example apps/dashboard/.env
```

### Start all apps

```sh
npm start
```

- This runs:

  ```sh
  nx run-many --target=serve --all --parallel
  ```

## Development Notes

- After modifying backend APIs, **update Swagger decorators** if needed and re-generate types:

  ```sh
  npm run generate:types
  ```

## UI Features

- The **UI** is fully responsive and role-restricted.
- **Tasks page** supports drag-and-drop.
- **Audit logs** are paginated.
- Data fetching, retry, and caching is handled via React Query (TanStack Query).

## Features Summary

- **Multi-app NX monorepo** with backend + frontend
- **Type-safe API communication** via OpenAPI and type generation
- **RBAC** with hierarchical roles
- **Persistent auth & theme state**
- **Responsive UI** with Tailwind & DaisyUI
- **Drag-and-drop tasks** and **paginated audit logs**
