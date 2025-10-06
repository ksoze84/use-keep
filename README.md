# use-keep

A lightweight React state management library that provides a simple alternative to `useState` with external store capabilities. Share state across components while maintaining React's familiar hook patterns.

[![npm version](https://badge.fury.io/js/use-keep.svg)](https://badge.fury.io/js/use-keep)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🪶 **Lightweight**: Minimal bundle size with zero dependencies (except React peer)
- 🔄 **React 16-18+ Compatible**: Works with all modern React versions using `useSyncExternalStore` shim
- 🎯 **Simple API**: Familiar getter/setter pattern similar to `useState`
- 🔗 **External Store**: Share state between components without prop drilling
- 🛠️ **Extensible**: Add custom methods to your stores
- 📘 **TypeScript**: Full type safety with comprehensive TypeScript support
- ⚡ **Performance**: Efficient subscription-based updates

## Installation

```bash
npm install use-keep
```

## Quick Start

```typescript
import { keep, useKeep } from 'use-keep';

// Create a store
const counter = keep(0);

// Use in components
function Counter() {
  const count = useKeep(counter);
  // or: const count = counter.use();
  
  return (
    <div>
      <span>Count: {count}</span>
      <button onClick={() => counter(count + 1)}>+</button>
      <button onClick={() => counter(c => c - 1)}>-</button>
    </div>
  );
}
```

## API Reference

### `keep<T>(initialState: T)`

Creates a new store with the given initial state.

```typescript
const store = keep(0);

// Get current value
const value = store();

// Set new value
store(42);

// Set with function
store(prev => prev + 1);

// Subscribe to changes (used internally by useKeep)
const unsubscribe = store.subscribe(() => console.log('Changed!'));

// Use in React component - both methods are equivalent
const Component = () => {
  const value = store.use(); // Calls useKeep(store) internally
  // or: const value = useKeep(store);
  return <div>{value}</div>;
};
```

### `keep<T, S>(initialState: T, methods: S)`

Creates a store with additional methods attached.

```typescript
const counter = keep(0, {
  increment: () => counter(c => c + 1),
  decrement: () => counter(c => c - 1),
  reset: () => counter(0)
});

// Use the methods
counter.increment();
counter.decrement();
counter.reset();
```

### `store.use()`

Convenience method that calls `useKeep(store)` internally. This method enables reactive composition - the component will re-render when the store changes.

```typescript
const counter = keep(0);

function Component() {
  const value = counter.use(); // Equivalent to useKeep(counter)
  // Component re-renders when counter changes
  return <div>Count: {value}</div>;
}

// Perfect for composition patterns
const shapes = () => {
  const triangles = keep(0);
  const squares = keep(0);
  
  return {
    useTotal: () => triangles.use() + squares.use(), // Both stores are reactive
    useTriangles: () => triangles.use(),
    useSquares: () => squares.use()
  };
};
```

### `useKeep<T>(store)`

React hook to subscribe to store changes. Functionally identical to `store.use()`.

```typescript
function Component() {
  const value = useKeep(store);
  // Component re-renders when store changes
  return <div>{value}</div>;
}
```

## Usage Patterns

### Basic Counter

```typescript
import { keep } from 'use-keep';

const counter = keep(0, {
  increment: () => counter(c => c + 1),
  decrement: () => counter(c => c - 1),
  reset: () => counter(0)
});

function Counter() {
  const count = counter.use();
  
  return (
    <div>
      <span>Count: {count}</span>
      <button onClick={counter.increment}>+</button>
      <button onClick={counter.decrement}>-</button>
      <button onClick={counter.reset}>Reset</button>
    </div>
  );
}
```

### Complex State with Methods

```typescript
const todos = keep([] as Todo[], {
  add: (text: string) => todos(prev => [
    ...prev,
    { id: Date.now(), text, completed: false }
  ]),
  
  toggle: (id: number) => todos(prev => 
    prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  ),
  
  remove: (id: number) => todos(prev => 
    prev.filter(todo => todo.id !== id)
  )
});
```

### Factory Pattern

```typescript
const createCounter = (initial = 0) => {
  const store = keep(initial);
  
  return {
    useValue: () => store.use(),
    increment: () => store(s => s + 1),
    decrement: () => store(s => s - 1),
    reset: () => store(initial),
    setValue: (value: number) => store(value)
  };
};

const counter1 = createCounter(0);
const counter2 = createCounter(10);
```

### Class-based Store

```typescript
class UserStore {
  private userState = keep({ name: '', email: '' });
  private loadingState = keep(false);

  load = async (userId: string) => {
    this.loadingState(true);
    try {
      const user = await fetchUser(userId);
      this.userState(user);
    } finally {
      this.loadingState(false);
    }
  };

  updateName = (name: string) => {
    this.userState(prev => ({ ...prev, name }));
  };

  useUser = () => this.userState.use();
  useLoading = () => this.loadingState.use();
}

export const userStore = new UserStore();
```

### Form Handling

```typescript
const formStore = keep({ name: '', email: '' }, {
  setName: (name: string) => formStore(prev => ({ ...prev, name })),
  setEmail: (email: string) => formStore(prev => ({ ...prev, email })),
  reset: () => formStore({ name: '', email: '' }),
  
  // Custom hook pattern
  useField: (field: 'name' | 'email') => {
    const form = formStore.use();
    return [
      form[field],
      (value: string) => formStore(prev => ({ ...prev, [field]: value }))
    ] as const;
  }
});

function MyForm() {
  const [name, setName] = formStore.useField('name');
  const [email, setEmail] = formStore.useField('email');
  
  return (
    <form>
      <input value={name} onChange={e => setName(e.target.value)} />
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <button type="button" onClick={formStore.reset}>Reset</button>
    </form>
  );
}
```

### Multiple Store Composition

```typescript
const shapes = () => {
  const triangles = keep(0, {
    increment: () => triangles(t => t + 1),
    decrement: () => triangles(t => t - 1),
    reset: () => triangles(0)
  });
  
  const squares = keep(0, {
    increment: () => squares(s => s + 1),
    decrement: () => squares(s => s - 1),
    reset: () => squares(0)
  });

  return {
    useTriangles: () => [triangles.use(), triangles] as const,
    useSquares: () => [squares.use(), squares] as const,
    useTotal: () => triangles.use() + squares.use()
  };
};

const shapeStore = shapes();
```

## TypeScript Support

`use-keep` is written in TypeScript and provides full type safety:

```typescript
// Strongly typed store
const typedStore = keep<{ count: number; name: string }>({
  count: 0,
  name: 'initial'
});

// Type inference works automatically
const counter = keep(0); // inferred as keep<number>
const user = keep({ name: 'John' }); // inferred as keep<{name: string}>

// Extended stores maintain types
const enhancedCounter = keep(0, {
  double: () => enhancedCounter(c => c * 2) // fully typed
});
```

## Comparison with Other Libraries

| Feature | use-keep | useState | Zustand | Redux |
|---------|----------|---------|---------|-------|
| Bundle Size | ~1KB | Built-in | ~2KB | ~15KB+ |
| Learning Curve | Minimal | None | Low | High |
| Boilerplate | Very Low | None | Low | High |
| TypeScript | Excellent | Good | Excellent | Good |
| DevTools | React DevTools | React DevTools | Custom | Redux DevTools |
| External State | ✅ | ❌ | ✅ | ✅ |

## React Compatibility

`use-keep` works with React 16.8+ through React 18+:

- **React 18+**: Uses native `useSyncExternalStore`
- **React 16-17**: Uses `use-sync-external-store` shim (automatically handled)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [ksoze84 Felipe Rodriguez Herrera](https://github.com/ksoze84)
