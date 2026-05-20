# SOLID — Reference with Examples

## S — Single Responsibility Principle

> A class should have only one reason to change.

```typescript
// ❌ Violates SRP: handles data, formatting, AND persistence
class UserReport {
  generateReport(user: User): string { ... }
  formatAsPDF(content: string): Buffer { ... }
  saveToDatabase(report: Buffer): void { ... }
}

// ✅ Each class has one job
class ReportGenerator { generate(user: User): string { ... } }
class PDFFormatter     { format(content: string): Buffer { ... } }
class ReportRepository { save(report: Buffer): void { ... } }
```

---

## O — Open/Closed Principle

> Open for extension, closed for modification.

```typescript
// ❌ Adding a new payment method requires modifying this class
class PaymentProcessor {
  process(type: string, amount: number) {
    if (type === 'credit') { ... }
    else if (type === 'paypal') { ... }
    // Adding 'crypto' means editing this file ❌
  }
}

// ✅ Extend by adding a new class, not modifying existing ones
interface PaymentMethod {
  process(amount: number): void;
}
class CreditCardPayment implements PaymentMethod { ... }
class PayPalPayment      implements PaymentMethod { ... }
class CryptoPayment      implements PaymentMethod { ... } // new, zero changes elsewhere
```

---

## L — Liskov Substitution Principle

> Subtypes must be substitutable for their base types without breaking behavior.

```typescript
// ❌ Violates LSP: ReadOnlyFile breaks the contract of File
class File {
  write(data: string): void { ... }
}
class ReadOnlyFile extends File {
  write(data: string): void {
    throw new Error("Cannot write to read-only file"); // ❌ surprises callers
  }
}

// ✅ Model the hierarchy correctly
interface Readable  { read(): string; }
interface Writable  { write(data: string): void; }
class ReadOnlyFile  implements Readable { ... }
class WritableFile  implements Readable, Writable { ... }
```

---

## I — Interface Segregation Principle

> No client should be forced to depend on methods it doesn't use.

```typescript
// ❌ Fat interface forces all implementors to implement everything
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
}
class Robot implements Worker {
  eat()  { throw new Error("Robots don't eat"); }  // ❌
  sleep(){ throw new Error("Robots don't sleep"); } // ❌
}

// ✅ Segregated interfaces
interface Workable  { work(): void; }
interface Feedable  { eat(): void; }
interface Restable  { sleep(): void; }
class Human implements Workable, Feedable, Restable { ... }
class Robot implements Workable { ... } // no irrelevant methods
```

---

## D — Dependency Inversion Principle

> High-level modules should not depend on low-level modules. Both should depend on abstractions.

```typescript
// ❌ High-level UserService is tightly coupled to MySQL
class UserService {
  private db = new MySQLDatabase(); // ❌ concrete dependency
  getUser(id: string) { return this.db.query(`SELECT * FROM users WHERE id=${id}`); }
}

// ✅ Depend on an abstraction (port), inject the concrete (adapter)
interface UserRepository {
  findById(id: string): Promise<User>;
}
class UserService {
  constructor(private repo: UserRepository) {} // ✅ injected abstraction
  getUser(id: string) { return this.repo.findById(id); }
}
class MySQLUserRepository implements UserRepository { ... }
class InMemoryUserRepository implements UserRepository { ... } // easy to swap for tests
```
