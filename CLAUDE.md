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

`deploy.sh` builds the `miobackend` and `mioweb` images for the current
commit, sends them to the home server over SSH (no registry) and restarts
them there with the compose file in the home server repo. `keygen.sh` creates
the API key and its hash. `README.md` has the deploy, rollback and key
rotation steps.

## Git

- Commit directly on `main`; don't create branches unless asked. The project
  is in an early stage with a single developer.
- Commit messages are a single line.

@miobackend/CLAUDE.md
@mioandroid/CLAUDE.md
@mioweb/CLAUDE.md
