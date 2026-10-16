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
| `mioweb/` | Web client (not started) |

`buf.yaml` and `buf.gen.yaml` live here, at the repository root, and `go.work`
includes `miobackend`.

## Git

- Commit directly on `main`; don't create branches unless asked. The project
  is in an early stage with a single developer.
- Commit messages are a single line.

@miobackend/CLAUDE.md
@mioandroid/CLAUDE.md
