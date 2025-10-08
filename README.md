# use-keep

A lightweight React state management library with external store capabilities, providing simple yet powerful tools for managing component and application state.

[![npm version](https://badge.fury.io/js/use-keep.svg)](https://badge.fury.io/js/use-keep)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Comparison Table](#comparison-table)
- [Advanced Usage](#advanced-usage)
- [Best Practices](#best-practices)
- [TypeScript Support](#typescript-support)

## Installation

```bash
npm install use-keep
```

```bash
yarn add use-keep
```

```bash
pnpm add use-keep
```

## Quick Start

### Simple Counter Example

The most basic usage - create a store and use it in components:

```tsx
import { keep, useKeep } from 'use-keep';

// Create a store outside your component
const counter = keep(0);

function Counter() {
  const count = useKeep(counter);
  
  return (
    <div>
      <span>Count: {count}</span>
      <button onClick={() => counter(c => c + 1)}>+</button>
      <button onClick={() => counter(c => c - 1)}>-</button>
      <button onClick={() => counter(0)}>Reset</button>
    </div>
  );
}
```

That's it! Multiple components using the same store will automatically stay in sync.

## Core Concepts

### 1. **keep()** - Create Stores

```tsx
// Simple store
const count = keep(0);

// Store with initial complex data
const user = keep({ name: 'John', age: 25 });

// Store with methods
const counter = keep(0, {
  increment: () => counter(c => c + 1),
  decrement: () => counter(c => c - 1),
  reset: () => counter(0)
});
```

### 2. **useKeep()** - Subscribe to Stores

```tsx
function MyComponent() {
  const value = useKeep(myStore);
  // Component re-renders when store changes
  return <div>{value}</div>;
}
```

### 3. **useKeeper()** - Create Local Stores

```tsx
function Component() {
  // Creates a store that exists only for this component instance
  const localCounter = useKeeper(() => keep(0));
  const count = useKeep(localCounter);
  
  return (
    <div>
      <span>{count}</span>
      <button onClick={() => localCounter(c => c + 1)}>+</button>
    </div>
  );
}
```

## API Reference

### `keep<T>(initialValue: T): KeepType<T>`

Creates a new store with an initial value.

```tsx
const store = keep(initialValue);

// Get current value
const value = store();

// Set new value
store(newValue);

// Update with function
store(currentValue => newValue);

// Subscribe to changes
const unsubscribe = store.subscribe(() => {
  console.log('Store changed:', store());
});
```

### `keep<T, S>(initialValue: T, methods: S): KeepType<T> & S`

Creates a store with additional methods.

```tsx
const counter = keep(0, {
  increment: () => counter(c => c + 1),
  decrement: () => counter(c => c - 1),
  reset: () => counter(0)
});

counter.increment(); // Use attached method
```

### `useKeep<T>(store: KeepType<T>): T`

React hook that subscribes to a store and returns its current value.

```tsx
function Component() {
  const value = useKeep(store);
  return <div>{value}</div>;
}
```

### `useKeeper<T>(factory: () => T): T`

React hook that creates and maintains a value using lazy initialization.

```tsx
function Component() {
  // This store is unique to this component instance
  const localStore = useKeeper(() => keep(0));
  return <div>{useKeep(localStore)}</div>;
}
```

### `usePeek<T, L>(initialValue: T, extension: (store: KeepType<T>) => L): [T, KeepType<T> & L]`

Creates a local store with extensions using useReducer internally.

```tsx
function Component() {
  const [count, counter] = usePeek(0, store => ({
    increment: () => store(c => c + 1),
    decrement: () => store(c => c - 1)
  }));
  
  return (
    <div>
      <span>{count}</span>
      <button onClick={counter.increment}>+</button>
    </div>
  );
}
```

## Examples

### Basic Counter (from Examples/Simple.tsx)

```tsx
import { keep, useKeep } from 'use-keep';

// Global store
const chairs = keep(0);

// Global actions
const increment = () => chairs(s => s + 1);
const decrement = () => chairs(s => s - 1);
const reset = () => chairs(0);

function Chairs() {
  const chairCount = useKeep(chairs);
  
  return (
    <>
      <span>Chairs: {chairCount}</span>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </>
  );
}
```

### Store Factory Pattern

```tsx
const createLampStore = (lamp = keep(0)) => {
  return {
    useL: () => useKeep(lamp),
    add: () => lamp(lamp() + 1),
    sub: () => lamp(l => --l),
    reset: () => lamp(0)
  };
};

const lamps = createLampStore();

function Lamps() {
  const lampCount = lamps.useL();
  
  return (
    <>
      <span>Lamps: {lampCount}</span>
      <button onClick={lamps.add}>+</button>
      <button onClick={lamps.sub}>-</button>
      <button onClick={lamps.reset}>Reset</button>
    </>
  );
}
```

### Complex State Management with useKeeper

```tsx
function Cubes() {
  const cubes = useKeeper(() => createCubeCounter(3));
  const [cubeCount, { increment, decrement, reset }] = [cubes.use(), cubes];
  
  return (
    <>
      <span>Cubes: {cubeCount}</span>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </>
  );
}

function createCubeCounter(initial = 0) {
  const cubes = keep(initial);
  return {
    use: () => useKeep(cubes),
    increment: () => cubes(c => c + 1),
    decrement: () => cubes(c => c - 1),
    reset: () => cubes(initial)
  };
}
```

### Data Loading with Classes (from Examples/ActividadesHandler.ts)

```tsx
export class ActividadesHandler {
  public data = keep([] as Record<string, any>[]);
  public loading = keep(false);

  load = () => {
    this.loading(true);
    return fetch('/api/activities')
      .then(r => r.json())
      .then(data => {
        this.loading(false);
        this.data(data);
      });
  }

  setProduct = (e: ChangeEvent<HTMLInputElement>, id: string) => {
    const value = e.target.value;
    this.data(this.data().map(item => 
      item.id === id ? { ...item, product: value } : item
    ));
  }
}

// Global instance
export const activities = new ActividadesHandler();

// Usage in components
function App() {
  const [acts, isLoading] = [
    useKeep(activities.data), 
    useKeep(activities.loading)
  ];

  return (
    <div>
      {isLoading ? 'Loading...' : `${acts.length} items loaded`}
      <button onClick={activities.load}>Reload</button>
    </div>
  );
}
```

### Local Instance with useKeeper (from Examples/AppB.tsx)

```tsx
function AppB() {
  // Each component instance gets its own handler
  const actsHandler = useKeeper(() => new ActividadesHandler());
  const [acts, loading] = [
    useKeep(actsHandler.data), 
    useKeep(actsHandler.loading)
  ];

  useEffect(() => {
    actsHandler.load();
  }, []);

  return (
    <div>
      <span>
        {loading ? 'Loading...' : `${acts.length} activities found`}
      </span>
      <button onClick={actsHandler.load}>Search</button>
    </div>
  );
}
```

## Comparison Table

| Feature | `keep()` | `useKeep()` | `useKeeper()` | `usePeek()` |
|---------|----------|-------------|---------------|-------------|
| **Purpose** | Create external stores | Subscribe to stores | Create local stores | Create local stores with useReducer |
| **Scope** | Global/Module | Component subscription | Component instance | Component instance |
| **Persistence** | Permanent until cleanup | N/A (subscription only) | Component lifetime | Component lifetime |
| **Sharing** | ✅ Multiple components | ✅ Subscribe from anywhere | ❌ Component-local only | ❌ Component-local only |
| **Memory** | Manual cleanup needed | Auto cleanup on unmount | Auto cleanup on unmount | Auto cleanup on unmount |
| **Performance** | Excellent (external store) | Excellent (useSyncExternalStore) | Good (useRef based) | Good (useReducer based) |
| **Use Case** | App-wide state | Subscribe to global state | Component-specific stores | Local state with custom logic |
| **Initial Value** | Required | N/A | Lazy initialization | Direct value + extensions |
| **Methods** | Optional extensions | N/A | Factory function return | Extension function |
| **Type Safety** | Full TypeScript support | Inherits from store | Factory function types | Tuple return type |

### When to Use What

- **`keep()`**: For application-wide state, shared stores, persistent data
- **`useKeep()`**: To subscribe any component to a store created with `keep()`
- **`useKeeper()`**: For component-specific stores, expensive object creation, local caches
- **`usePeek()`**: For local state with custom extensions, when you need both value and methods

## Advanced Usage

### Store Composition

```tsx
const figures = () => {
  const triangles = keep(0);
  const squares = keep(0);
  const circles = keep(0);

  return {
    useTriangles: () => [useKeep(triangles), {
      increment: () => triangles(t => t + 1),
      decrement: () => triangles(t => t - 1),
      reset: () => triangles(0)
    }] as const,
    
    useTotal: () => useKeep(triangles) + useKeep(squares) + useKeep(circles)
  };
};

const shapesStore = figures();

function Total() {
  const total = shapesStore.useTotal();
  return <h1>Total: {total}</h1>;
}
```

### Conditional Store Creation

```tsx
function ConditionalComponent({ useGlobal }: { useGlobal: boolean }) {
  const store = useKeeper(() => 
    useGlobal ? globalCounter : keep(0)
  );
  
  const count = useKeep(store);
  return <div>{count}</div>;
}
```

### Store with Complex State

```tsx
interface TodoState {
  items: Todo[];
  filter: 'all' | 'active' | 'completed';
  loading: boolean;
}

const todoStore = keep<TodoState>({
  items: [],
  filter: 'all',
  loading: false
}, {
  addTodo: (text: string) => todoStore(state => ({
    ...state,
    items: [...state.items, { id: Date.now(), text, completed: false }]
  })),
  
  toggleTodo: (id: number) => todoStore(state => ({
    ...state,
    items: state.items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    )
  })),
  
  setFilter: (filter: TodoState['filter']) => todoStore(state => ({
    ...state,
    filter
  }))
});
```

## Best Practices

### 1. Store Organization

```tsx
// ✅ Good: Organize related stores
const userStore = {
  profile: keep(null as User | null),
  preferences: keep({ theme: 'light', lang: 'en' }),
  sessions: keep([])
};

// ❌ Avoid: Too many separate global stores
const userName = keep('');
const userAge = keep(0);
const userEmail = keep('');
```

### 2. Method Naming

```tsx
// ✅ Good: Clear, consistent naming
const counter = keep(0, {
  increment: () => counter(c => c + 1),
  decrement: () => counter(c => c - 1),
  reset: () => counter(0),
  set: (value: number) => counter(value)
});

// ❌ Avoid: Unclear method names
const counter = keep(0, {
  plus: () => counter(c => c + 1),
  sub: () => counter(c => c - 1),
  clear: () => counter(0)
});
```

### 3. Component Patterns

```tsx
// ✅ Good: Use useKeeper for component-specific needs
function UserProfile({ userId }: { userId: string }) {
  const userCache = useKeeper(() => new Map<string, User>());
  
  // This cache is unique to each UserProfile instance
}

// ✅ Good: Use keep() for shared state
const globalSettings = keep({ theme: 'light' });

function App() {
  const settings = useKeep(globalSettings);
  // All App instances share the same settings
}
```

### 4. Type Safety

```tsx
// ✅ Good: Use TypeScript for better development experience
interface AppState {
  user: User | null;
  isAuthenticated: boolean;
}

const appStore = keep<AppState>({
  user: null,
  isAuthenticated: false
}, {
  login: (user: User) => appStore(state => ({
    ...state,
    user,
    isAuthenticated: true
  })),
  logout: () => appStore({
    user: null,
    isAuthenticated: false
  })
});
```

## TypeScript Support

use-keep is built with TypeScript and provides excellent type safety:

```tsx
// Type inference works automatically
const stringStore = keep('hello'); // KeepType<string>
const numberStore = keep(42);       // KeepType<number>

// Generic types for complex data
interface User {
  id: number;
  name: string;
}

const userStore = keep<User | null>(null);

// Extended stores maintain type safety
const typedCounter = keep(0, {
  increment: () => typedCounter(c => c + 1), // c is inferred as number
  double: () => typedCounter(c => c * 2)     // Return type is void
});

// useKeep preserves the store's type
function Component() {
  const user = useKeep(userStore); // user is User | null
  const count = useKeep(typedCounter); // count is number
}
```

## License

MIT © [ksoze84](https://github.com/ksoze84)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you find this library useful, please consider giving it a ⭐ on [GitHub](https://github.com/ksoze84/use-keep)!
