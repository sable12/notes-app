# Pinboard — Notes App

A simple notes CRUD app:

- **Backend:** Java 21 + Spring Boot 3 + PostgreSQL (REST API)
- **Frontend:** React (Vite) — index-card / pinboard UI
- **Infra:** Docker Compose *or* Kubernetes (both included) — works with Rancher Desktop
- **CI/CD:** GitHub Actions workflow (`.github/workflows/ci-cd.yml`) — builds/tests both apps and publishes Docker images to GHCR on push to `main`

## Project layout

```
notes-app/
├── backend/              Spring Boot API (Maven)
├── frontend/              React app (Vite)
├── docker-compose.yml      Compose setup: db + backend + frontend
├── k8s/                    Kubernetes manifests (see k8s/README.md)
└── README.md
```

Two ways to run this — pick one:

- **Docker Compose** (instructions below): simplest, fastest to iterate on.
- **Kubernetes**: see [`k8s/README.md`](./k8s/README.md) — deploys the same
  app onto the k3s cluster bundled with Rancher Desktop.

## Prerequisites

- Rancher Desktop installed and **running**, with the container engine set to
  `dockerd (moby)` (Preferences → Container Engine). That gives you a working
  `docker` and `docker compose` CLI.
- Verify with:
  ```bash
  docker version
  docker compose version
  ```

## Run everything

From the `notes-app` folder:

```bash
docker compose up --build
```

First run will take a few minutes (Maven downloads dependencies, npm installs
packages). Subsequent runs are much faster thanks to Docker layer caching.

Once it's up:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api/notes
- Postgres: localhost:5432 (user `notes`, password `notes`, db `notesdb`)

Stop everything with `Ctrl+C`, or run in the background with:

```bash
docker compose up -d --build
```

and stop with:

```bash
docker compose down
```

Add `-v` to `docker compose down` if you also want to wipe the Postgres volume
(deletes all saved notes).

## API endpoints

| Method | Path              | Description       |
|--------|-------------------|--------------------|
| GET    | `/api/notes`      | List all notes (newest updated first) |
| GET    | `/api/notes/{id}` | Get one note       |
| POST   | `/api/notes`      | Create a note (`{"title": "...", "content": "..."}`) |
| PUT    | `/api/notes/{id}` | Update a note      |
| DELETE | `/api/notes/{id}` | Delete a note      |

## Local development (without Docker)

**Backend:**
```bash
cd backend
# needs a local Postgres reachable at localhost:5432, or override DB_HOST etc.
mvn spring-boot:run         # requires Maven installed locally (no wrapper included)
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev                # http://localhost:5173, proxies /api to :8080
```

## Notes on the data model

Each note has: `id`, `title` (required, ≤200 chars), `content` (≤10,000 chars),
`createdAt`, `updatedAt`. Schema is auto-created/updated by Hibernate
(`ddl-auto: update`) — fine for local dev, but for production you'd want to
switch to a migration tool like Flyway.
