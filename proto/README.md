# miolink protos

Source of truth for the miolink API. Every service is defined here and exposed
over [Connect RPC](https://connectrpc.com). Code for all clients is generated
from these files with [buf](https://buf.build):

| Target       | Consumer       | Generated with                                  |
| ------------ | -------------- | ----------------------------------------------- |
| `miobackend` | Go services    | `protocolbuffers/go`, `connectrpc/go`           |
| `mioandroid` | Kotlin app     | `protocolbuffers/java` + `kotlin` (lite), `connectrpc/kotlin` |
| `mioweb`     | Web app        | `bufbuild/es`                                   |

`buf.yaml` and `buf.gen.yaml` live at the repository root, and this directory
(`proto/`) is the buf module.

## Layout

```
proto/
└── miolink/
    ├── common/v1/              # small, shared value types only
    │   └── pagination.proto
    └── <domain>/v1/            # one directory per domain (auth, user, ...)
        ├── <domain>.proto          # resource messages and enums
        └── <domain>_service.proto  # service, plus its Request/Response messages
```

### Rules

- **Directory = package.** `proto/miolink/user/v1/user.proto` must declare
  `package miolink.user.v1;`.
- **Always versioned.** Every package ends in a version: `v1`, `v2`, or
  `v1alpha1`/`v1beta1` for APIs that are still unstable.
- **Split by domain, not by layer.** Use `user/` and `auth/`, never `models/`
  or `services/`.
- **Two files per domain.** `<domain>.proto` holds resources and enums, and
  `<domain>_service.proto` holds the service and its request/response
  messages. Split further only when a file grows large (e.g.
  `user_events.proto`).
- **Keep `common/` small.** Only true value types belong there (pagination,
  money, ...). Domain messages stay in their domain, even if another domain
  uses them.
- **No language-specific options.** Don't set `go_package`, `java_package`,
  etc. in `.proto` files; buf managed mode injects them at generation time.

## Naming

| Element           | Style                          | Example                       |
| ----------------- | ------------------------------ | ----------------------------- |
| Files             | `lower_snake_case.proto`       | `user_service.proto`          |
| Packages          | `miolink.<domain>.<version>`   | `miolink.user.v1`             |
| Messages          | `PascalCase`                   | `User`, `GetUserRequest`      |
| Fields            | `lower_snake_case`             | `display_name`                |
| Services          | `PascalCase` + `Service`       | `UserService`                 |
| RPCs              | `PascalCase`, verb first       | `GetUser`, `ListUsers`        |
| Enums             | `PascalCase`                   | `UserStatus`                  |
| Enum values       | `UPPER_SNAKE_CASE`, prefixed with the enum name | `USER_STATUS_ACTIVE` |

## Design conventions

- **Unique request/response per RPC.** Every RPC gets its own `XxxRequest` and
  `XxxResponse`, even if they start out empty. Never reuse a resource message
  (or `google.protobuf.Empty`) as a request or response; wrap it instead
  (`GetUserResponse { User user = 1; }`). This lets you add fields later
  without breaking anything.
- **Resource-oriented RPCs.** Prefer the standard methods `Get`, `List`,
  `Create`, `Update` and `Delete` (see [Google AIP](https://google.aip.dev)).
  Use a custom verb (`ArchiveLink`) only when none of them fit.
- **Enum zero value.** The first value of every enum is
  `<ENUM_NAME>_UNSPECIFIED = 0` and is never a meaningful state.
- **Well-known types.** Use `google.protobuf.Timestamp` and
  `google.protobuf.Duration` for time, never raw integers or strings.
- **Pagination.** `List` RPCs take `page_size` and `page_token` and return
  `next_page_token`.
- **Comments.** Document every service, RPC, message and non-obvious field.
  These comments are carried into the generated code for every client.

## Evolving the API safely

Released Android builds keep calling old API versions for a long time, so
breaking changes on a published `v1` are not allowed.

- Never change a field's number or type, and never reuse a field number.
- When removing a field, reserve both its number and its name:
  ```proto
  reserved 4;
  reserved "legacy_name";
  ```
- Adding new fields, messages, enum values and RPCs is safe.
- If you need a breaking change, create a new version (`miolink/user/v2/`)
  and serve both versions side by side until old clients are gone.

## Workflow

Run from the repository root:

```bash
buf format -w          # format protos
buf lint               # check style rules (STANDARD)
buf breaking --against '.git#branch=main'   # detect breaking changes
buf generate           # regenerate code for all targets
```

CI runs `buf format -d --exit-code`, `buf lint` and `buf breaking`. A pull
request that fails any of them must not be merged.
