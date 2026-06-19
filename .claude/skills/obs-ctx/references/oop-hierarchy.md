# OOP Hierarchy Model — obs-ctx

The CLAUDE.md chain is treated like a class hierarchy. This is the mental model for understanding
how rules flow from the root context down to child contexts.

## Mapping

| OOP concept | obs-ctx |
|---|---|
| Base class | root context — vault-wide rules |
| Abstract class | parent context (e.g. `work/CLAUDE.md`) — domain conventions |
| Concrete class | child context (e.g. `work/my-project/CLAUDE.md`) — concrete implementation |
| Class registry | Parent context registers child contexts in `## Child Contexts` |
| `@Final` method | Section that must not be overridden by any context beneath it |
| `@Abstract` method | Section that must be implemented by at least one context in the chain |
| Inheritance | Child context inherits all parent rules — no duplication needed |
| Override | Child context extends or replaces an `@Abstract` section from the parent |

## Implications

- A parent context **must register** its child contexts in `## Child Contexts`
- A child context's `area:` must point to a parent context that actually has a CLAUDE.md
- If the parent context defines conventions (tags, format, naming) → the child context follows
  them or **explicitly declares an override**
- `@Final` in a parent context = a locked rule — a child context repeating the same content
  without the marker is duplication, not an override
- `@Abstract` in a parent context = a contract — a child context that doesn't implement it is incomplete

## Direction of Inheritance

```
root context            ← @Final & @Abstract definitions
      ↓ inherits
parent context           ← implements @Abstract, may add new @Abstract
      ↓ inherits
child context             ← implements all @Abstract, concrete implementation
```

Chain alignment fixes always start from the child context and walk up to the parent — never the
other way around.
