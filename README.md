# miolink

A personal, single-user link manager. Links are organized in nested
directories and synced to every client (web and Android).

## Deploy

The server runs two containers, started by a compose file in the home server
repo (`apps/miolink/` there), behind Caddy:

| Image | Port | What it is |
| --- | --- | --- |
| `localhost/miolink/mioweb` | 3000 | The web client (static build served by nginx) |
| `localhost/miolink/miobackend` | 3001 | The API (Connect RPC), with SQLite and thumbnails in `./data` |

There's no registry. `deploy.sh` builds both images here, sends them to the
server over SSH (`docker save | ssh … docker load`) and restarts the stack
there:

```sh
./deploy.sh
```

1. It refuses to run with uncommitted changes in `miobackend/` or `mioweb/`,
   so every image tag is a commit (`git rev-parse --short HEAD`).
2. It builds both images with Podman (`DOCKER=docker` to use Docker).
3. It sends each image to `home-server` and loads it there.
4. It sets `MIOLINK_VERSION` to the new tag in the server's `.env` and runs
   `docker compose up -d`.
5. It keeps the 5 previous versions for rollback and removes older ones.

`MIOLINK_DEPLOY_HOST` and `MIOLINK_DEPLOY_DIR` change the SSH host and the
compose directory on the server (default `server/homeserver/apps/miolink`).

### API key

All clients share one API key. The server never sees the key, only its
SHA-256 hash:

```sh
./keygen.sh
```

It prints the key and the `MIOLINK_API_KEY_HASH=...` line for the server's
`.env`. Save the key in your password manager; it's shown only once and you
enter it on every client. To rotate it, run `./keygen.sh` again, replace the
hash in the server's `.env`, run `docker compose up -d` there, and enter the
new key on every client.

### Rollback

On the server, in the compose directory:

```sh
docker images localhost/miolink/miobackend   # versions still loaded
# set MIOLINK_VERSION in .env to one of them, then:
docker compose up -d
```

The backend applies new database migrations when it starts, and rolling back
doesn't undo them. To roll back past a migration, restore a backup of
`data/miolink.db` too.

## Development

Run the backend with `make run` in `miobackend/` (settings in
`miobackend/.env`) and the web client with `pnpm dev` in `mioweb/`. Each app
has its own instructions: [miobackend](miobackend/CLAUDE.md),
[mioweb](mioweb/CLAUDE.md), [mioandroid](mioandroid/CLAUDE.md). The API is
defined in [proto](proto/README.md).
