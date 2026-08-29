# Preload: Go

## Toolchain

- **Check:** `go version`
- **Install:**
  - Windows: `winget install GoLang.Go`
  - Mac: `brew install go`
  - Linux: package manager (`apt`, `dnf`, etc.) or a tarball from https://go.dev/dl/
- **Compile:** `go build`, `go run`, `go test`, `go vet`
- **Playground:** standard Go project (`go.mod` + `main.go`/`cmd/`/`internal/`)

## Documentation Sources

| Source | URL | Used for |
|---|---|---|
| `go doc` | (local, CLI) | Function/symbol/package docs — accurate for the installed version |
| Tour of Go | https://go.dev/tour/ | Interactive intro to language features, the official pedagogical order |
| Effective Go | https://go.dev/doc/effective_go | Idioms & best practice |
| Go Language Specification | https://go.dev/ref/spec | Precise definition of language constructs |
| Go Blog | https://go.dev/blog/ | Design rationale, case studies |
| Go Wiki | https://go.dev/wiki/ | FAQ, common mistakes, community guides |
| pkg.go.dev | https://pkg.go.dev/ | stdlib & third-party package docs |

Validation order: `go doc` (API reference) → go.dev (concepts, rationale) → community (optional, production wisdom).

## Calibration — Assumes: an experienced Java/Spring engineer

Target: an engineer coming from Java/Spring/Quarkus — not a programming beginner. **Don't explain what a variable, function, or loop is.**

| What confuses a Java developer | Why |
|---|---|
| Zero value, not `null` | Java: an uninitialized reference = null. Go: every type has its own zero value (`0`, `""`, `false`, empty struct) — nil is only for pointer/interface/slice/map/chan/func |
| Pointer vs value semantics | Java: objects are always referenced. Go: you choose — `T` (copy) vs `*T` (pointer) — this affects the method set & mutation |
| Errors as values, not exceptions | Java: `try/catch` breaks the normal flow. Go: `(result, error)` is an ordinary return value — control flow stays explicit on every line |
| Goroutine vs Thread/Virtual Thread | Closest analogy: a goroutine is more like a virtual thread (Project Loom) — far lighter, scheduled by Go's own runtime (M:N) |
| Implicit interfaces (duck typing) | Java: explicit `implements`. Go: just having the matching methods is enough, no declaration needed — looser decoupling |
| Struct embedding vs inheritance | Java: `extends` = a formal is-a. Go: embedding = composition, methods are promoted but it's not real polymorphism |

**Production framing:** "here's how Docker/Kubernetes/Terraform use this pattern in production" is often more effective than a generic analogy.

## Seed `resources:` CLAUDE.md frontmatter

At setup, fill the `resources:` field in the topic project's CLAUDE.md frontmatter (obs-ctx) with the sources below. New sources found each session → appended to the same list (no confirmation).

```yaml
resources:
  - https://go.dev/tour/            # Tour of Go — intro to language features
  - https://go.dev/doc/effective_go # Effective Go — idioms & best practice
  - https://go.dev/ref/spec         # Go Language Specification — precise definitions
  - https://go.dev/blog/            # Go Blog — design rationale, case studies
  - https://go.dev/wiki/            # Go Wiki — FAQ, common mistakes
  - https://pkg.go.dev/             # pkg.go.dev — stdlib & third-party package docs
```

(`go doc` = local CLI, used as the first API-validation source — no need to list it as a URL.)
