# use-keep

[![npm version](https://badge.fury.io/js/use-keep.svg)](https://badge.fury.io/js/use-keep)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

Tiny (~4 KB) signal-style React state management. Global stores, multi-store subscriptions, and component-local state — no providers, no reducers, no boilerplate. Works with React 16+.

```bash
npm install use-keep
```

## Quick Start

```tsx
import { keep, useKeep } from 'use-keep';

const counter = keep(0);
const increment = () => counter(c => c + 1);
const reset = () => counter(0);

function Counter() {
  const count = useKeep(counter);
  return (
    <div>
      <span>{count}</span>
      <button onClick={increment}>+</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

## API Reference

### `keep<T>(initialValue: T): KeepType<T>`

Creates a store — a callable function that acts as both getter and setter:

```tsx
const store = keep(0);

store()              // → 0  (get)
store(5)             // set to 5
store(n => n + 1)    // functional update → 6

// Subscribe to changes (used internally by hooks)
const unsub = store.subscribe(() => console.log(store()));
```

### `useKeep(...stores)`

Subscribes a component to one or more stores. Built on `useSyncExternalStore`.

```tsx
// Single store → value
const count = useKeep(counter);

// Multiple stores → tuple
const [count, user, theme] = useKeep(counterStore, userStore, themeStore);
```

### `useKpr(generator, selector?)`

Creates **component-local** state (via `useRef`) — each instance gets its own isolated stores that are destroyed on unmount.

**Simple** — wraps a single `keep`:

```tsx
const [count, counter] = useKpr(() => keep(0));
// count = current value, counter = KeepType store
```

**With selector** — extracts specific `KeepType` properties from a factory:

```tsx
const [count, name, state] = useKpr(
  () => ({ count: keep(0), name: keep(''), reset() { /* ... */ } }),
  s => [s.count, s.name]
);
// Extracted values first, full state object last
```

**With class constructor** — the class is `new`-ed once per component instance:

```tsx
const [items, filter, todos] = useKpr(
  TodoManager,
  s => [s.items, s.filter]
);
```

## Patterns

### Store Factory

Encapsulate a store with its actions:

```tsx
function createCounter(initial = 0) {
  const count = keep(initial);
  return {
    count,
    increment: () => count(c => c + 1),
    decrement: () => count(c => c - 1),
    reset: () => count(initial),
  };
}

// Global — shared between components
const appCounter = createCounter(10);

function Counter() {
  const count = useKeep(appCounter.count);
  return <button onClick={appCounter.increment}>{count}</button>;
}

// Local — isolated per component instance
function LocalCounter() {
  const [count, { increment, reset }] = useKpr(
    () => createCounter(0),
    s => [s.count]
  );
  return <button onClick={increment}>{count}</button>;
}
```

### Multi-Store Subscription

```tsx
const user = keep<User | null>(null);
const theme = keep<'light' | 'dark'>('light');
const notifications = keep<Notification[]>([]);

function Dashboard() {
  const [u, t, n] = useKeep(user, theme, notifications);
  if (!u) return <LoginForm />;
  return (
    <div className={`theme-${t}`}>
      <h1>Welcome {u.name}</h1>
      {n.length > 0 && <NotificationBanner items={n} />}
    </div>
  );
}
```

### Class-Based State with Inheritance

Classes pair naturally with `useKpr` for extensible, self-contained state:

```tsx
class TodoManager {
  items = keep<Todo[]>([]);
  filter = keep<'all' | 'active' | 'completed'>('all');

  addTodo = (text: string) =>
    this.items(cur => [...cur, { id: Date.now(), text, completed: false }]);

  toggleTodo = (id: number) =>
    this.items(cur =>
      cur.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

  setFilter = (f: 'all' | 'active' | 'completed') => this.filter(f);
}

class AsyncTodoManager extends TodoManager {
  loading = keep(false);

  loadTodos = async () => {
    this.loading(true);
    const data: Todo[] = await fetch('/api/todos').then(r => r.json());
    this.items(data);
    this.loading(false);
  };
}

// Global instance — subscribe with useKeep
const todoStore = new AsyncTodoManager();

function GlobalTodoApp() {
  const [items, filter, loading] = useKeep(
    todoStore.items, todoStore.filter, todoStore.loading
  );
  // use todoStore.addTodo(...), todoStore.toggleTodo(...), etc.
}

// Component-local instance — pass the class to useKpr
function LocalTodoApp() {
  const [items, filter, loading, todos] = useKpr(
    AsyncTodoManager,
    s => [s.items, s.filter, s.loading]
  );
  // use todos.addTodo(...), todos.toggleTodo(...), etc.
}
```

## Best Practices

**Prefer granular stores over monoliths** — each subscriber re-renders only when *its* store changes:

```tsx
// ✅ Granular — profile subscribers don't re-render on settings changes
const profile = keep<User | null>(null);
const settings = keep({ theme: 'light', lang: 'en' });

// ❌ Monolith — any change re-renders all subscribers
const appState = keep({ profile: null, settings: { theme: 'light', lang: 'en' } });
```

**Group related stores** in plain objects or classes for organization:

```tsx
const userState = {
  profile: keep<User | null>(null),
  preferences: keep({ theme: 'light', lang: 'en' }),
  sessions: keep<Session[]>([]),
};
```

**`useKeep`** for shared/global state. **`useKpr`** for component-local or temporary state (forms, modals, list items with independent state).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [Felipe Rodriguez Herrera](https://github.com/ksoze84)
