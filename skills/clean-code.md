---
name: clean-code
description: >
  Apply this skill whenever the user asks to write, review, refactor, or generate code of any kind —
  even if they don't say "clean code" explicitly. Triggers include: "write a function", "create a class",
  "implement a feature", "refactor this", "add tests", "review my code", "design a module", "help me
  architect this", or any task that produces source code. This skill enforces TDD, SOLID principles,
  Clean Code naming and structure, Design Patterns, Clean Architecture, and Hexagonal Architecture.
  Always use this skill when code is being written or reviewed — do not skip it for "simple" tasks.
---

# Clean Code Skill

This skill guides Claude to produce **professional, maintainable, testable code** following industry-proven principles. Apply all relevant sections below based on the task at hand.

---

## 1. Workflow: TDD First

**Always follow Red-Green-Refactor:**

1. **Red** — Write a failing test that defines the desired behavior. No production code yet.
2. **Green** — Write the *minimum* code to make the test pass. Resist over-engineering.
3. **Refactor** — Clean up duplication, naming, and structure. Tests must stay green.

```
// ❌ Wrong: writing implementation first
function add(a, b) { return a + b; }

// ✅ Right: test first
test('add returns sum of two numbers', () => {
  expect(add(2, 3)).toBe(5);
});
// THEN implement
```

> If the user asks to "add a feature", always propose the test first and ask for confirmation before writing production code.

---

## 2. SOLID Principles

Read `references/solid.md` for detailed examples. Summary:

| Principle | Rule |
|-----------|------|
| **S** — Single Responsibility | One class/function = one reason to change |
| **O** — Open/Closed | Open for extension, closed for modification (use abstractions) |
| **L** — Liskov Substitution | Subtypes must honor the contract of their parent |
| **I** — Interface Segregation | No client should depend on methods it doesn't use |
| **D** — Dependency Inversion | Depend on abstractions, not concretions |

**Quick check before writing a class:** *"Can I describe this class's responsibility in one sentence without using 'and' or 'or'?"* If not, split it.

---

## 3. Clean Code Rules

### Naming
- Variables, functions, classes: **reveal intent**
- No abbreviations: `usr` → `user`, `calc` → `calculateTotal`
- Functions: verb phrases — `getUserById`, `sendWelcomeEmail`
- Booleans: `isActive`, `hasPermission`, `canEdit`
- Avoid noise words: `data`, `info`, `manager`, `helper`, `utils`

### Functions
- **Do one thing** — if you can extract a meaningful sub-function, do it
- Max **3 parameters** — if more are needed, use a config object
- No side effects unless the name implies them (`saveUser` can write to DB, `getUser` cannot)
- Max **~20 lines** — longer functions are a refactoring signal

### Comments
- **Self-documenting code is the goal** — if you need a comment to explain *what*, rename things
- Only comment *why* (business rules, workarounds, non-obvious decisions)
- Never leave dead code or commented-out code

```
// ❌ Noise comment
// Loop through users
for (const user of users) { ... }

// ✅ Useful why-comment
// Retry once: external payment API occasionally drops first request
await retry(paymentRequest, { times: 1 });
```

---

## 4. Design Patterns

Read `references/patterns.md` for full catalog. Use patterns **only when they solve a real problem** — don't apply them speculatively.

**Creational** (object creation complexity)
- `Factory` / `Factory Method` — decouple instantiation from usage
- `Builder` — step-by-step construction of complex objects
- `Singleton` — careful: only for truly global state (logger, config)

**Structural** (composition of classes)
- `Adapter` — make incompatible interfaces work together
- `Decorator` — add behavior without modifying the original
- `Facade` — simple interface over a complex subsystem

**Behavioral** (communication between objects)
- `Strategy` — swap algorithms at runtime
- `Observer` — decouple event producers from consumers
- `Command` — encapsulate requests as objects (undo/redo, queues)

> When suggesting a pattern, always name it and explain briefly *why* it fits the current problem.

---

## 5. Architecture

### Clean Architecture (Dependency Rule)
Dependencies always point **inward**. Inner layers know nothing about outer layers.

```
[ Frameworks & Drivers ]   ← outermost (DB, HTTP, UI)
      ↓ depends on
[ Interface Adapters ]      (Controllers, Presenters, Gateways)
      ↓ depends on
[ Use Cases / Application ] (Business rules orchestration)
      ↓ depends on
[ Entities / Domain ]       ← innermost (core business logic)
```

### Hexagonal Architecture (Ports & Adapters)
- **Domain** at the center: pure business logic, no framework dependencies
- **Ports**: interfaces the domain exposes (driving) or requires (driven)
- **Adapters**: concrete implementations (REST controller, SQL repo, email sender)

```
[HTTP Controller] → [Port: OrderService] → [Domain: Order]
                                               ↓ [Port: OrderRepository]
                                         [Adapter: PostgresOrderRepository]
```

### Vertical Slicing
Organize code **by feature**, not by technical layer:

```
// ❌ Horizontal (layer-based)
/controllers/UserController.ts
/services/UserService.ts
/repositories/UserRepository.ts

// ✅ Vertical (feature-based)
/users/
  UserController.ts
  UserService.ts
  UserRepository.ts
  user.test.ts
```

---

## 6. Code Review Checklist

Before presenting code, verify:

- [ ] Tests written first (TDD) or tests cover all behavior
- [ ] Each class/function has a single responsibility
- [ ] Names are self-documenting — no need for explanatory comments
- [ ] No function exceeds ~20 lines
- [ ] Dependencies are injected, not instantiated inside
- [ ] Domain logic has zero framework/infrastructure imports
- [ ] A relevant design pattern was applied (or consciously avoided)
- [ ] Code is organized by feature (vertical slice)

---

## Reference Files

- `references/solid.md` — Detailed SOLID examples in multiple languages
- `references/patterns.md` — Design pattern catalog with code examples
