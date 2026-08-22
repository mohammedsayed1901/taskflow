# TaskFlow

TaskFlow is a full-stack task management application built with the MERN stack and TypeScript. It provides secure user authentication, owner-scoped task management, filtering, pagination, and a responsive Kanban workflow.

## Features

### Core requirements

- User registration, login, logout, and session restoration
- JWT authentication using an HTTP-only cookie
- Protected API endpoints
- Strict task ownership: users can access only their own tasks
- Create, view, update, and delete tasks
- Task title, description, status, priority, and due date
- Statuses: To Do, In Progress, and Done
- Priorities: Low, Medium, and High
- Search by task title
- Filter by status and priority
- Responsive desktop and mobile interface
- Loading, validation, error, empty, and confirmation states

### Bonus features

- TypeScript across the frontend and backend
- Drag and drop between Kanban status columns
- Optimistic task-status updates with rollback on API failure
- API integration tests
- Frontend validation and cache-update tests
- Pagination and sorting
- Docker and Docker Compose support
- GitHub Actions continuous integration

## Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- dnd kit
- Lucide React

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- Zod
- bcrypt
- JSON Web Tokens
- Helmet
- Express Rate Limit

### Tooling

- npm workspaces
- ESLint
- Prettier
- Vitest
- Supertest
- Docker
- GitHub Actions

## Architecture

TaskFlow is organized as an npm-workspace monorepo with separate frontend and backend applications.

```text
taskflow/
├── .github/
│   └── workflows/
│       └── ci.yml
├── client/
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   └── tasks/
│   │   ├── lib/
│   │   └── types/
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── errors/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   └── tasks/
│   │   └── routes/
│   ├── tests/
│   └── package.json
├── compose.yaml
├── Dockerfile
├── package.json
└── README.md
```

The backend follows a feature-oriented structure:

- Routes define endpoints and middleware order.
- Controllers translate HTTP requests and responses.
- Services contain business logic and database operations.
- Zod schemas validate incoming request data.
- Mongoose models define database documents and indexes.
- Central middleware handles validation, authentication, errors, and missing routes.

In production, Express serves both the API and the compiled React application from the same origin. This simplifies deployment and secure cookie handling.

## Security Decisions

- Passwords are hashed with bcrypt and never returned by the API.
- JWTs are stored in HTTP-only cookies instead of browser storage.
- Production cookies use `Secure` and `SameSite=Strict`.
- Protected routes verify the session before accessing business logic.
- Every task database query includes the authenticated user's ID.
- Request bodies, URL parameters, and query parameters are validated with Zod.
- Registration and login endpoints are rate-limited to reduce automated authentication attempts.
- Helmet adds standard HTTP security headers.
- JSON request sizes are limited.
- Secrets and environment files are excluded from Git.

## Prerequisites

For local development:

- Node.js 24
- npm
- MongoDB running on port `27017`
- Git

For containerized execution:

- Docker Desktop, or Docker Engine with Docker Compose

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/mohammedsayed1901/taskflow.git
cd taskflow
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Configure the backend

Copy the example environment file.

On Windows PowerShell:

```powershell
Copy-Item .\.env.example .\.env
```

On macOS or Linux:

```bash
cp .env.example .env
```

On macOS or Linux:

```bash
cp server/.env.example server/.env
```

Configure `server/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=replace-with-a-random-secret-containing-at-least-32-characters
JWT_EXPIRES_IN_SECONDS=604800
BCRYPT_SALT_ROUNDS=12
TRUST_PROXY=false
```

Generate a suitable development secret in PowerShell:

```powershell
-join ((48..57) + (65..90) + (97..122) |
  Get-Random -Count 64 |
  ForEach-Object { [char]$_ })
```

### 4. Start MongoDB

Verify that the Windows MongoDB service is running:

```powershell
Get-Service -Name MongoDB*
Test-NetConnection 127.0.0.1 -Port 27017
```

Start it if necessary:

```powershell
Start-Service MongoDB
```

### 5. Start TaskFlow

```bash
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- API health check: `http://localhost:5000/api/health`

Vite proxies development requests beginning with `/api` to the Express server.

## Docker Setup

Copy the root Docker environment example:

```powershell
Copy-Item .\.env.example .\.env
```

Replace the example JWT secret in `.env`, then build and start the application:

```bash
docker compose up --build -d
```

Open:

```text
http://localhost:5000
```

Check service status and logs:

```bash
docker compose ps
docker compose logs -f app
```

Stop the containers while retaining MongoDB data:

```bash
docker compose down
```

Delete the containers and development database volume:

```bash
docker compose down -v
```

> The MongoDB service in `compose.yaml` is configured for local review and is not exposed to the host. Production deployments should use an authenticated managed MongoDB instance.

### Docker environment variables

| Variable                 | Description                        | Example                                               |
| ------------------------ | ---------------------------------- | ----------------------------------------------------- |
| `APP_PORT`               | Host port used to expose TaskFlow  | `5000`                                                |
| `JWT_SECRET`             | Secret used to sign session tokens | Replace with a random value of at least 32 characters |
| `JWT_EXPIRES_IN_SECONDS` | Session lifetime in seconds        | `604800`                                              |
| `BCRYPT_SALT_ROUNDS`     | bcrypt password hashing cost       | `12`                                                  |

## Available Scripts

| Command                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Start the client and server in development   |
| `npm run build`        | Build the backend and frontend               |
| `npm start`            | Start the compiled production server         |
| `npm run typecheck`    | Type-check both workspaces                   |
| `npm run lint`         | Lint both workspaces                         |
| `npm test`             | Run backend and frontend tests               |
| `npm run format`       | Format the repository with Prettier          |
| `npm run format:check` | Check repository formatting                  |
| `docker compose up -d` | Start the production-style Docker deployment |

## Main API Endpoints

All endpoints are prefixed with `/api`.

### Health

| Method | Endpoint  | Authentication | Description            |
| ------ | --------- | -------------- | ---------------------- |
| GET    | `/health` | No             | Check API availability |

### Authentication

| Method | Endpoint         | Authentication | Description                    |
| ------ | ---------------- | -------------- | ------------------------------ |
| POST   | `/auth/register` | No             | Register and authenticate user |
| POST   | `/auth/login`    | No             | Authenticate an existing user  |
| POST   | `/auth/logout`   | No             | Clear the session cookie       |
| GET    | `/auth/me`       | Yes            | Return the authenticated user  |

### Tasks

| Method | Endpoint         | Authentication | Description                   |
| ------ | ---------------- | -------------- | ----------------------------- |
| GET    | `/tasks`         | Yes            | List the current user's tasks |
| POST   | `/tasks`         | Yes            | Create a task                 |
| PATCH  | `/tasks/:taskId` | Yes            | Update an owned task          |
| DELETE | `/tasks/:taskId` | Yes            | Delete an owned task          |

Example list request:

```text
GET /api/tasks?search=review&status=todo&priority=high&page=1&limit=12
```

The API never accepts an owner ID from the client. Ownership comes exclusively from the authenticated session.

## Testing

Run all tests:

```bash
npm test
```

The backend integration suite covers:

- Registration, login, session retrieval, and logout
- Task creation, search, filtering, updates, and deletion
- Request validation
- Unauthenticated access
- Cross-user task isolation

The frontend tests cover:

- Task form validation and normalization
- Optimistic cache updates
- Status-update rollback behavior

Before submitting a change, run:

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
npm run build
```

## Continuous Integration

GitHub Actions runs the following checks for pushes and pull requests targeting `main`:

1. Clean dependency installation
2. Formatting check
3. Type checking
4. Linting
5. Backend and frontend tests
6. Production application build
7. Production Docker image build

## Known Limitations and Incomplete Items

- A live deployment has not yet been added.
- Drag and drop changes task status, but custom ordering inside a column is not persisted.
- Task attachments are not implemented.
- Password reset and email verification are outside the assignment scope.
- Frontend tests currently focus on validation and optimistic cache logic rather than full browser end-to-end flows.

## Third-Party Tools, References, and AI Disclosure

The project uses the open-source packages listed in the Technology Stack
section. Official documentation for React, Express, MongoDB, Mongoose, Zod,
TanStack Query, React Hook Form, dnd kit, Docker, and GitHub Actions was used
as technical reference material.

ChatGPT and OpenAI Codex were used for milestone planning, implementation
guidance, debugging assistance, and documentation review. Suggestions were
reviewed, adapted, and tested against the assignment requirements by the
candidate.

The candidate is responsible for the submitted implementation and can explain
its architecture, security decisions, application behavior, and code.

## Candidate

- **Name:** Mohammed Sayed
- **Repository:** https://github.com/mohammedsayed1901/taskflow.git
- **Live demo:** Not deployed yet
- **Test account:** Not required for local review; user registration is enabled
- **Actual time spent:** In progress; final total will be provided at submission
