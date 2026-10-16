Status: done

# 003 — Server settings and the Connect client

Depends on: 001 and 002.

## Goal

Let the user enter the server URL and API key, store them safely, and build
the Connect client every repository uses. Read "Network and errors" in
`../CLAUDE.md`.

## Scope

- **Libraries:** OkHttp, `connect-kotlin-okhttp`,
  `connect-kotlin-google-java-lite-ext`, `datastore-preferences`,
  `tink-android`.
- **`core/settings/`:**
  - `ServerSettings(baseUrl: String, apiKey: String)` exposed as
    `Flow<ServerSettings?>` (null until configured).
  - The base URL is stored as-is in DataStore. The API key is encrypted with a
    Tink AEAD whose keyset is stored in Android Keystore (`AndroidKeysetManager`
    with a `android-keystore://` master key) and only the ciphertext goes into
    DataStore.
  - Normalize the base URL: require `http://` or `https://`, trim whitespace
    and trailing `/`.
- **`core/network/`:**
  - One `OkHttpClient` with sensible timeouts and an interceptor that adds
    `Authorization: Bearer <key>` from the current settings.
  - A `ProtocolClient` (Connect protocol, `GoogleJavaLiteProtobufStrategy`)
    built from the current base URL; rebuilt when the settings change. Expose
    the generated service clients (`HealthServiceClient`, `TreeServiceClient`,
    `DirectoryServiceClient`, `LinkServiceClient`) through a small holder so
    repositories always use the current client.
  - `ApiError` mapping from `ConnectException` codes as described in
    `../CLAUDE.md`, plus a network-unreachable case. Never include the API key
    in errors or logs.
  - `thumbnailUrl(path)`: base URL + `thumbnail_url` by plain concatenation
    (the backend returns `/thumbnails/<name>`, and the base URL may carry a
    path prefix, so don't use URL resolution). Empty `thumbnail_url` means no
    thumbnail.
- **`settings/`:** `SettingsScreen` with base URL and API key fields (key
  masked, with a show toggle), Save, and "Test connection" calling `Ping` with
  the entered values before saving. Show the result inline.
- **First launch:** while settings are null, the app opens `Settings` instead
  of `Browse`, without a back arrow.
- Wire everything in `AppContainer`.
- `usesCleartextTraffic` only for debug builds (a debug
  `network_security_config`), so a local `http://` backend works in
  development but not in release.

## Tests

Settings round trip (Robolectric): saved key reads back, the stored value is
not the plaintext. URL normalization cases. `ApiError` mapping for each code.
The auth interceptor adds the header (OkHttp `MockWebServer` is fine here: it
is local, not a real network).
