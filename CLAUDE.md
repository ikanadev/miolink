# miolink

A personal, single-user link manager. Links are organized in nested
directories, like a filesystem, and synced to every client.

| Directory | What it is |
| --- | --- |
| `proto/` | Source of truth for the API (Connect RPC). Conventions in `proto/README.md` |
| `miobackend/` | Go server, SQLite storage. Details and rules in `miobackend/CLAUDE.md` |
| `miobackend/tasks/` | Pending backend work, one task file per session |
| `mioandroid/` | Android client (not started) |
| `mioweb/` | Web client (not started) |

`buf.yaml` and `buf.gen.yaml` live here, at the repository root, and `go.work`
includes `miobackend`.

Commit messages are a single line.

@miobackend/CLAUDE.md
