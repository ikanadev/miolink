#!/bin/sh
# Creates a new miolink API key and prints it with the hash for .env.
# The server only stores the hash; the key itself is entered on each client.
set -eu

key=$(head -c 32 /dev/urandom | base64 | tr '+/' '-_' | tr -d '=\n')

if command -v sha256sum >/dev/null 2>&1; then
  hash=$(printf '%s' "$key" | sha256sum | cut -d' ' -f1)
else
  hash=$(printf '%s' "$key" | shasum -a 256 | cut -d' ' -f1)
fi

echo "API key (save it in your password manager, enter it on each client, never commit it):"
echo "  $key"
echo "Set in .env:"
echo "  MIOLINK_API_KEY_HASH=$hash"
