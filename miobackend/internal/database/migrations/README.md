# Migrations

golang-migrate files, embedded into the binary and applied on startup.
sqlc also reads this directory as the schema (down files are ignored).

Create a new pair with:

```bash
make migration name=create_links
```

Never edit a migration that has already been applied; add a new one instead.
