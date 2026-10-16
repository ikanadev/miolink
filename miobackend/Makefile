# Load local settings (MIOLINK_*) from .env when present.
-include .env
export

SQLC    := GOWORK=off go tool -modfile=tools/go.mod sqlc
MIGRATE := GOWORK=off go tool -modfile=tools/go.mod migrate

.PHONY: generate proto sqlc migration run build test lint keygen

## generate: regenerate protobuf/Connect code and sqlc code
generate: proto sqlc

## proto: regenerate Go code from ../proto (buf runs from the repo root)
proto:
	cd .. && buf generate

## sqlc: regenerate database code (skipped until there are queries)
sqlc:
	@if ls internal/database/queries/*.sql >/dev/null 2>&1; then \
		$(SQLC) generate && echo "sqlc: generated"; \
	else \
		echo "sqlc: no queries yet, skipping"; \
	fi

## migration: create a new migration pair, e.g. make migration name=create_links
migration:
	@test -n "$(name)" || (echo "usage: make migration name=<snake_case_name>" && exit 1)
	$(MIGRATE) create -ext sql -dir internal/database/migrations -seq -digits 6 $(name)

## run: start the server with settings from .env
run:
	go run ./cmd/miobackend

## build: build the server binary into bin/
build:
	go build -o bin/miobackend ./cmd/miobackend

## test: run all tests
test:
	go test ./...

## lint: vet Go code and lint protos
lint:
	go vet ./...
	cd .. && buf lint && buf format -d --exit-code

## keygen: create a new API key and print its hash for .env
keygen:
	@key=$$(openssl rand -base64 32 | tr '+/' '-_' | tr -d '='); \
	echo "API key (save it in your password manager, enter it on each client, never commit it):"; \
	echo "  $$key"; \
	echo "Set in .env:"; \
	echo "  MIOLINK_API_KEY_HASH=$$(printf '%s' "$$key" | sha256sum | cut -d' ' -f1)"
