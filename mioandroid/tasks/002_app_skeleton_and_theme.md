Status: done

# 002 — App skeleton, navigation and Expressive theme

Depends on: nothing (can run before or after 001).

## Goal

Replace the Android Studio template with the structure in "Layout" in
`../CLAUDE.md`: an `Application` that owns an `AppContainer`, a Material 3
Expressive theme, and Navigation 3 with placeholder screens.

## Scope

- **Libraries:** `lifecycle-viewmodel-compose`, `lifecycle-runtime-compose`,
  `navigation3-runtime`, `navigation3-ui`, `lifecycle-viewmodel-navigation3`,
  `kotlinx-serialization-core` and the `kotlin-serialization` plugin. Add them
  to the version catalog.
- **`MioLinkApplication` + `AppContainer`:** register the application in the
  manifest. The container is empty for now; later tasks add to it.
- **Theme (`ui/theme/`):**
  - `Theme.kt`: `MioLinkTheme` wraps `MaterialExpressiveTheme` with
    `MotionScheme.expressive()`, dynamic color on Android 12+, and the
    light/dark schemes from `Color.kt` otherwise.
  - `Color.kt`: replace the template purples with a generated Material 3
    scheme (Material Theme Builder) from one seed color; all roles, not just
    primary/secondary/tertiary.
  - `Shape.kt`: the app's `Shapes`.
  - Opt in to `ExperimentalMaterial3ExpressiveApi` once in
    `app/build.gradle.kts` (`compilerOptions.optIn`).
- **Navigation (`navigation/`):** `@Serializable` keys `Browse(directoryId:
  Long = 1)`, `LinkEdit(linkId: Long)` and `Settings`; a `NavDisplay` in
  `MioLinkApp.kt` with a back stack that starts at `Browse()`. Each key shows a
  placeholder screen for now. Add the ViewModel store decorator so ViewModels
  are scoped to their entry.
- Delete the template `Greeting` code and the example tests.

## Done when

- The app launches on a device into the Browse placeholder, can navigate to
  Settings and back, and system back pops the stack.
- Light, dark and dynamic color all render (check with `@Preview`s of a
  sample screen using `LoadingIndicator` and a few buttons).
- `./gradlew :app:assembleDebug :app:lintDebug` passes.
