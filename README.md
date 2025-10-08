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
- [Comparison with Other Libraries](#comparison-with-other-libraries)
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

// Get current value
console.log(count()); // 0

// Set new value
count(5);

// Update with function
count(c => c + 1);
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

### `useKeep<T>(store: KeepType<T>): T`

React hook that subscribes to a store and returns its current value.

```tsx
function Component() {
  const value = useKeep(store);
  return <div>{value}</div>;
}
```

### `useKeeper<T>(factory: () => T): T`

React hook that creates and maintains a value that not change.

```tsx
function Component() {
  // This store is unique to this component instance
  const localStore = useKeeper(() => keep(0));
  return <div>{useKeep(localStore)}</div>;
}
```

## Examples

### Basic Counter

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

### Data Loading with Classes

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

### Local Instance with useKeeper

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

## Comparison with Other Libraries

| Feature | **use-keep** | **Redux** | **Zustand** | **Jotai** |
|---------|-------------|-----------|-------------|-----------|
| **Bundle Size** | ~2KB | ~47KB (with RTK) | ~8KB | ~13KB |
| **Learning Curve** | Minimal | Steep | Moderate | Moderate |
| **Boilerplate** | Almost none | High | Low | Low |
| **TypeScript** | Excellent | Good (with RTK) | Excellent | Excellent |
| **DevTools** | React DevTools | Redux DevTools | Redux DevTools | React DevTools |
| **Async Actions** | Manual | Thunks/RTK Query | Built-in | Suspense |
| **Subscriptions** | Direct store access | connect/useSelector | Direct access | Direct access |
| **Store Creation** | `keep(value)` | `createStore(reducer)` | `create(set => ({}))` | `atom(value)` |
| **Actions** | Direct mutations | Dispatched actions | Direct mutations | Direct updates |
| **Middleware** | None | Extensive | Basic | Basic |
| **Time Travel** | No | Yes | With devtools | With devtools |
| **SSR Support** | Yes | Yes | Yes | Yes |
| **Persistence** | Manual | Manual/plugins | Built-in | Built-in |
| **Code Splitting** | Natural | Complex | Natural | Natural |
| **Performance** | Excellent | Good | Excellent | Excellent |

### Detailed Comparison

#### **Bundle Size & Performance**
- **use-keep**: Smallest footprint (~2KB), excellent performance with `useSyncExternalStore`
- **Redux**: Large bundle especially with dev tools, good performance with proper optimization
- **Zustand**: Small and performant, good balance
- **Jotai**: Medium size, atomic updates provide excellent performance

#### **Developer Experience**
- **use-keep**: Minimal API, start coding immediately
- **Redux**: Structured but verbose, requires understanding of actions/reducers
- **Zustand**: Simple API with powerful features
- **Jotai**: Atomic approach, great for fine-grained reactivity

#### **Use Cases**

**Choose use-keep when:**
- You want the smallest possible bundle
- You prefer direct state mutations
- You need both global and local state patterns
- You want minimal learning curve
- You're building lightweight applications

**Choose Redux when:**
- You need extensive middleware ecosystem
- You require time-travel debugging
- You have complex state logic
- You're working with large teams needing structure

**Choose Zustand when:**
- You want Redux-like patterns without boilerplate
- You need built-in persistence
- You want good balance of features and simplicity

**Choose Jotai when:**
- You prefer atomic state management
- You need fine-grained reactivity
- You're building complex applications with many state pieces

### Migration Examples

#### From Redux to use-keep

```tsx
// Redux
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1 },
    decrement: (state) => { state.value -= 1 },
    reset: (state) => { state.value = 0 }
  }
});

function Counter() {
  const count = useSelector(state => state.counter.value);
  const dispatch = useDispatch();
  
  return (
    <div>
      <span>{count}</span>
      <button onClick={() => dispatch(counterSlice.actions.increment())}>+</button>
    </div>
  );
}

// use-keep equivalent
const counter = keep(0);

function Counter() {
  const count = useKeep(counter);
  
  return (
    <div>
      <span>{count}</span>
      <button onClick={() => counter(c => c + 1)}>+</button>
    </div>
  );
}
```

#### From Zustand to use-keep

```tsx
// Zustand
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 })
}));

function Counter() {
  const { count, increment, decrement, reset } = useStore();
  return (
    <div>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}

// use-keep equivalent
const counter = keep(0);
const increment = () => counter(c => c + 1);
const decrement = () => counter(c => c - 1);
const reset = () => counter(0);

function Counter() {
  const count = useKeep(counter);
  return (
    <div>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

#### From Jotai to use-keep

```tsx
// Jotai
const countAtom = atom(0);
const incrementAtom = atom(null, (get, set) => {
  set(countAtom, get(countAtom) + 1);
});

function Counter() {
  const [count] = useAtom(countAtom);
  const [, increment] = useAtom(incrementAtom);
  
  return (
    <div>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}

// use-keep equivalent
const counter = keep(0);

function Counter() {
  const count = useKeep(counter);
  
  return (
    <div>
      <span>{count}</span>
      <button onClick={() => counter(c => c + 1)}>+</button>
    </div>
  );
}
```

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
});

const addTodo = (text: string) => todoStore(state => ({
  ...state,
  items: [...state.items, { id: Date.now(), text, completed: false }]
}));

const toggleTodo = (id: number) => todoStore(state => ({
  ...state,
  items: state.items.map(item => 
    item.id === id ? { ...item, completed: !item.completed } : item
  )
}));

const setFilter = (filter: TodoState['filter']) => todoStore(state => ({
  ...state,
  filter
}));
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

### 2. Action Functions

```tsx
// ✅ Good: Clear, consistent naming
const counter = keep(0);
const increment = () => counter(c => c + 1);
const decrement = () => counter(c => c - 1);
const reset = () => counter(0);
const set = (value: number) => counter(value);

// ❌ Avoid: Unclear function names
const plus = () => counter(c => c + 1);
const sub = () => counter(c => c - 1);
const clear = () => counter(0);
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
});

const login = (user: User) => appStore(state => ({
  ...state,
  user,
  isAuthenticated: true
}));

const logout = () => appStore({
  user: null,
  isAuthenticated: false
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

// useKeep preserves the store's type
function Component() {
  const user = useKeep(userStore); // user is User | null
  const count = useKeep(numberStore); // count is number
}

// useKeeper with proper typing
function ComponentWithTypedStore() {
  const store = useKeeper(() => keep<string[]>([]));
  const items = useKeep(store); // items is string[]
  
  return <div>{items.length}</div>;
}
```

## License

MIT © [ksoze84](https://github.com/ksoze84)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you find this library useful, please consider giving it a ⭐ on [GitHub](https://github.com/ksoze84/use-keep)!
