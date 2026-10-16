Status: done

# 001 — `:gen` module with generated protobuf and Connect code

Depends on: nothing.

## Goal

Generate Kotlin client code for every service in `../../proto` into a `:gen`
Gradle module that `:app` depends on. Read "Modules" in `../CLAUDE.md`.

## Scope

- **`../../buf.gen.yaml`:** add the Android targets next to the Go ones:
  - managed mode override `java_package_prefix` = `dev.ikana.miolink.gen`
    (protos never set language options; see `../../proto/README.md`).
  - `buf.build/protocolbuffers/java` with `opt: lite`,
    `buf.build/protocolbuffers/kotlin` with `opt: lite`, and
    `buf.build/connectrpc/kotlin` with `opt: generateCoroutineMethods=true`,
    all writing to `mioandroid/gen/src/main/java`.
  - Pin each remote plugin to a version that matches the runtime libraries
    (protobuf `4.x` runtime ↔ protoc `v3x` plugin, `connect-kotlin` runtime ↔
    the same connect plugin version). A mismatch compiles but fails at runtime.
  - Don't change the Go output; `make generate` in `../miobackend` must still
    produce identical Go code (`git diff miobackend/gen` is empty).
- **`gen/build.gradle.kts`:** a plain Kotlin/JVM library (`kotlin("jvm")`,
  Java 17) with `api` dependencies on `protobuf-javalite`,
  `protobuf-kotlin-lite` and `connect-kotlin`, so `:app` sees them. Add the
  libraries and the `kotlin-jvm` plugin to `gradle/libs.versions.toml`.
- **`settings.gradle.kts`:** `include(":gen")`; `:app` adds
  `implementation(project(":gen"))`.
- Commit the generated sources.
- **`../../proto/README.md`:** the `mioandroid` row already lists the
  generators; add how the output is laid out (`mioandroid/gen`, package
  prefix).

## Done when

- `buf generate` from the repository root regenerates both Go and Kotlin code.
- `./gradlew :gen:build :app:assembleDebug` passes.
- A throwaway check (removed before committing, or kept as a unit test in
  `:gen`) builds a `GetTreeRequest` with the Kotlin DSL and round-trips it
  through `toByteArray()` / `parseFrom()`.
