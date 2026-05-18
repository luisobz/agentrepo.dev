# Design Patterns — Reference Catalog

## When to use patterns
Only apply a pattern when it solves a **real, present problem**. Patterns introduced speculatively add complexity without value. Ask: *"Does this pattern remove a pain I already have?"*

---

## Creational Patterns

### Factory Method
Use when: object creation logic would otherwise pollute the caller; when you need to swap implementations.
```typescript
interface Logger { log(msg: string): void; }
class ConsoleLogger implements Logger { log(msg) { console.log(msg); } }
class FileLogger    implements Logger { log(msg) { fs.appendFile(...); } }

function createLogger(env: string): Logger {
  return env === 'production' ? new FileLogger() : new ConsoleLogger();
}
```

### Builder
Use when: constructing complex objects with many optional fields; avoids telescoping constructors.
```typescript
class QueryBuilder {
  private filters: string[] = [];
  private limitVal?: number;

  where(condition: string) { this.filters.push(condition); return this; }
  limit(n: number)         { this.limitVal = n; return this; }
  build(): string {
    const where = this.filters.length ? `WHERE ${this.filters.join(' AND ')}` : '';
    const limit = this.limitVal ? `LIMIT ${this.limitVal}` : '';
    return `SELECT * FROM table ${where} ${limit}`.trim();
  }
}
// Usage: new QueryBuilder().where('active = true').limit(10).build()
```

### Singleton
Use when: exactly one instance is needed globally (config, logger). Avoid for mutable state.
```typescript
class Config {
  private static instance: Config;
  private constructor(private data: Record<string, string>) {}
  static getInstance(): Config {
    if (!Config.instance) Config.instance = new Config(loadEnv());
    return Config.instance;
  }
  get(key: string): string { return this.data[key]; }
}
```

---

## Structural Patterns

### Adapter
Use when: integrating a third-party library behind your own interface to stay decoupled.
```typescript
// Third-party API you don't control
class StripeClient { charge(cents: number, token: string) { ... } }

// Your domain's port
interface PaymentGateway { pay(amount: number, token: string): void; }

// Adapter bridges the two
class StripeAdapter implements PaymentGateway {
  constructor(private stripe: StripeClient) {}
  pay(amount: number, token: string) {
    this.stripe.charge(amount * 100, token); // converts dollars → cents
  }
}
```

### Decorator
Use when: adding behavior to an object without subclassing or touching the original.
```typescript
interface DataStore { save(data: string): void; }
class FileStore implements DataStore { save(data) { writeFile(data); } }

class EncryptedStore implements DataStore {
  constructor(private inner: DataStore) {}
  save(data: string) { this.inner.save(encrypt(data)); } // adds encryption transparently
}
class LoggedStore implements DataStore {
  constructor(private inner: DataStore) {}
  save(data: string) { logger.info('saving'); this.inner.save(data); }
}

// Compose: logging + encryption + file
const store = new LoggedStore(new EncryptedStore(new FileStore()));
```

### Facade
Use when: simplifying a complex subsystem behind a single, clean interface.
```typescript
// Complex subsystem
class AudioDecoder { decode(file: string): AudioBuffer { ... } }
class AudioMixer   { mix(buffer: AudioBuffer): AudioBuffer { ... } }
class AudioOutput  { play(buffer: AudioBuffer): void { ... } }

// Facade hides the complexity
class AudioPlayer {
  play(file: string) {
    const buffer  = new AudioDecoder().decode(file);
    const mixed   = new AudioMixer().mix(buffer);
    new AudioOutput().play(mixed);
  }
}
```

---

## Behavioral Patterns

### Strategy
Use when: you need to swap algorithms at runtime, or avoid long if/switch chains.
```typescript
interface SortStrategy { sort(data: number[]): number[]; }
class BubbleSort implements SortStrategy { sort(d) { /* ... */ return d; } }
class QuickSort  implements SortStrategy { sort(d) { /* ... */ return d; } }

class Sorter {
  constructor(private strategy: SortStrategy) {}
  setStrategy(s: SortStrategy) { this.strategy = s; }
  sort(data: number[]) { return this.strategy.sort(data); }
}
```

### Observer
Use when: decoupling event producers from consumers; multiple parts of the system react to the same event.
```typescript
type Handler<T> = (event: T) => void;
class EventBus<T> {
  private handlers: Handler<T>[] = [];
  subscribe(h: Handler<T>) { this.handlers.push(h); }
  publish(event: T)        { this.handlers.forEach(h => h(event)); }
}

const orderBus = new EventBus<Order>();
orderBus.subscribe(order => sendConfirmationEmail(order));
orderBus.subscribe(order => updateInventory(order));
orderBus.publish(newOrder); // both handlers fire, neither knows about the other
```

### Command
Use when: you need undo/redo, queuing operations, or audit logs.
```typescript
interface Command { execute(): void; undo(): void; }

class MoveCommand implements Command {
  constructor(private shape: Shape, private dx: number, private dy: number) {}
  execute() { this.shape.move(this.dx, this.dy); }
  undo()    { this.shape.move(-this.dx, -this.dy); }
}

class CommandHistory {
  private stack: Command[] = [];
  run(cmd: Command)  { cmd.execute(); this.stack.push(cmd); }
  undoLast()         { this.stack.pop()?.undo(); }
}
```
