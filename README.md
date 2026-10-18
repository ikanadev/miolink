# miolink

A personal, single-user link manager. Links are organized in nested
directories and synced to every client (web and Android).

## Deploy

`compose.yaml` runs two containers:

| Service | Port | What it is |
| --- | --- | --- |
| `mioweb` | 3000 | The web client (static build served by nginx) |
| `miobackend` | 3001 | The API (Connect RPC), with SQLite and thumbnails in the `data` volume |

A reverse proxy in front (Caddy) handles TLS and routes a domain to each port.
Both ports are published on `127.0.0.1` by default; set `MIOLINK_BIND_ADDR`
in `.env` to change it.

### 1. Generate the API key

All clients share one API key. The server never sees the key, only its
SHA-256 hash, so you generate both first:

```sh
./keygen.sh
```

It prints the key and the `MIOLINK_API_KEY_HASH=...` line. Save the key in
your password manager; it's shown only once and you enter it on every client.

### 2. Create `.env`

```sh
cp .env.example .env
```

Fill in:

- `MIOLINK_API_KEY_HASH`: the hash printed by `./keygen.sh` (not the key).
- `MIOLINK_CORS_ORIGINS`: the public URL of the web client, e.g.
  `https://miolink.example.com`. The browser calls the API directly, so it's
  blocked without this.

`.env` is gitignored; never commit it.

### 3. Start

```sh
docker compose up -d --build
docker compose logs -f
```

Then open the web client, enter the API's public URL and the key in the
setup form.

### 4. Reverse proxy

Example Caddy site blocks, with Caddy on the same host:

```caddy
miolink.example.com {
  reverse_proxy localhost:3000
}

api.miolink.example.com {
  reverse_proxy localhost:3001
}
```

### Update, stop, rotate the key

```sh
git pull && docker compose up -d --build   # rebuild and restart
docker compose down                        # stop; keeps the data volume
docker compose down -v                     # stop and DELETE all links and thumbnails
```

To rotate the key, run `./keygen.sh` again, replace `MIOLINK_API_KEY_HASH` in
`.env`, run `docker compose up -d`, and enter the new key on every client.

## Development

Each app has its own instructions: [miobackend](miobackend/CLAUDE.md),
[mioweb](mioweb/CLAUDE.md), [mioandroid](mioandroid/CLAUDE.md). The API is
defined in [proto](proto/README.md).
