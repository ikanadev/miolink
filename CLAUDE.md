# miolink

A personal, single-user link manager. Links are organized in nested
directories, like a filesystem, and synced to every client.

| Directory | What it is |
| --- | --- |
| `proto/` | Source of truth for the API (Connect RPC). Conventions in `proto/README.md` |
| `miobackend/` | Go server, SQLite storage. Details and rules in `miobackend/CLAUDE.md` |
| `miobackend/tasks/` | Pending backend work, one task file per session |
| `mioandroid/tasks/` | Pending Android work, one task file per session |
| `mioandroid/` | Android client (Kotlin, Compose). Details and rules in `mioandroid/CLAUDE.md` |
| `mioweb/` | Web client (SolidJS, Ark UI, Material 3 components). Details and rules in `mioweb/CLAUDE.md` |

`buf.yaml` and `buf.gen.yaml` live here, at the repository root, and `go.work`
includes `miobackend`.

`compose.yaml` runs the deployed apps: `mioweb` (nginx serving the build) on
port 3000 and `miobackend` on port 3001, published on `MIOLINK_BIND_ADDR`
(default `127.0.0.1`) for the Caddy reverse proxy in front, which handles TLS
and routing. Settings come from the root `.env` (see `.env.example`); the
database and thumbnails live in the `data` volume. `keygen.sh` creates the API
key and its hash; `README.md` has the deploy steps.

## Git

- Commit directly on `main`; don't create branches unless asked. The project
  is in an early stage with a single developer.
- Commit messages are a single line.

@miobackend/CLAUDE.md
@mioandroid/CLAUDE.md
@mioweb/CLAUDE.md
