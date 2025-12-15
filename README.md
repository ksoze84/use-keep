# use-keep

[![npm version](https://badge.fury.io/js/use-keep.svg)](https://badge.fury.io/js/use-keep)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/use-keep)](https://bundlephobia.com/package/use-keep)

A (yet another) simple and lightweight React state management library. Share state across components while maintaining React's hook patterns.

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
- [Contributing](#contributing)
- [License](#license)

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

```tsx
import { keep, useKeep } from 'use-keep';

// Create a store
const counter = keep(0);

// Create actions
const increment = () => counter(c => c + 1);
const decrement = () => counter(c => c - 1);
const reset = () => counter(0);

function Counter() {
  const count = useKeep(counter);
  
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

## Core Concepts

### 1. **keep()** - Create Stores

`keep()` creates a stateful store that can be shared across components:

```tsx
// Simple value store
const count = keep(0);

// Object store
const user = keep({ name: 'John', age: 25 });

// Array store  
const todos = keep([]);
```

### 2. **useKeep()** - Subscribe to Stores

`useKeep()` is a React hook that subscribes to one or more stores:

```tsx
function Component() {
  // Single store
  const count = useKeep(counter);
  
  // Multiple stores
  const [count, user, todos] = useKeep(counterStore, userStore, todoStore);
  
  return <div>{count} - {user.name}</div>;
}
```

### 3. **useKpr()** - Component-Local State

`useKpr()` creates component-scoped stores that don't persist between unmounts:

```tsx
function Component() {
  // Creates a local store unique to this component instance
  const [count, counter] = useKpr(() => keep(0));
  
  return (
    <div>
      <span>{count}</span>
      <button onClick={() => counter(c => c + 1)}>+</button>
    </div>
  );
}


// Advanced: With selector for complex state
function AdvancedComponent() {
  const [count, { increment, decrement }] = useKpr(
    () => createCounter(0),
    state => [state.count] // select only the count value
  );
  
  return (
    <div>
      <span>{count}</span>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}

const createCounter = (initial: number) => {
  const count = keep(initial);
  return {
    count,
    increment: () => count(c => c + 1),
    decrement: () => count(c => c - 1)
  };
};

```

### 4. **Store Operations**

Stores support both getter and setter operations, signal style:

```tsx
const store = keep(0);

// Get current value
const value = store();

// Set new value
store(5);

// Update with function
store(current => current + 1);
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

// Subscribe to changes (used internally by useKeep)
const unsubscribe = store.subscribe(() => {
  console.log('Store changed:', store());
});
```

### `useKeep<T>(store: KeepType<T>): T`
### `useKeep<T1, T2, ...>(...stores: KeepType<T1 | T2 | ...>[]): [T1, T2, ...]`

React hook that subscribes to one or more stores and returns their current values.

```tsx
// Single store
function Component() {
  const value = useKeep(store);
  return <div>{value}</div>;
}

// Multiple stores - returns tuple of values
function MultiComponent() {
  const [count, user, isLoading] = useKeep(counterStore, userStore, loadingStore);
  return (
    <div>
      {isLoading ? 'Loading...' : `${user.name}: ${count}`}
    </div>
  );
}
```

### `useKpr<K>(generator: () => KeepType<K>): readonly [K, KeepType<K>]`
### `useKpr<S, T>(generator: () => S, selector: (s: S) => [...T]): readonly [...ProjectedValues, S]`

React hook that creates component-local state that doesn't persist between component unmounts. Supports projection patterns for selecting specific values from complex state objects.

```tsx
// Basic usage - creates a local store
function SimpleComponent() {
  const [count, countStore] = useKpr(() => keep(0));
  
  return (
    <div>
      <span>Count: {count}</span>
      <button onClick={() => countStore(c => c + 1)}>+</button>
    </div>
  );
}

// Component-scoped counter factory
function CounterComponent() {
  const [count, { increment, decrement, reset }] = useKpr(
    () => createCounter(5), // Each component gets its own counter starting at 5
    counter => [counter.count] // Project only the count value
  );
  
  return (
    <div>
      <span>Local Count: {count}</span>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

function createCounter(initial: number) {
  const count = keep(initial);
  return {
    count,
    increment: () => count(c => c + 1),
    decrement: () => count(c => c - 1),
    reset: () => count(initial)
  };
}
```

## Examples

### Basic Counter

```tsx
import { keep, useKeep } from 'use-keep';

// Global store
const counter = keep(0);

// Global actions
const increment = () => counter(s => s + 1);
const decrement = () => counter(s => s - 1);
const reset = () => counter(0);

function Counter() {
  const count = useKeep(counter);
  
  return (
    <>
      <span>Count: {count}</span>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </>
  );
}
```

### Store Factory Pattern

```tsx
const createCounterStore = (initialValue = 0) => {
  const store = keep(initialValue);
  
  return {
    useValue: () => useKeep(store),
    increment: () => store(s => s + 1),
    decrement: () => store(s => s - 1),
    reset: () => store(initialValue),
    setValue: (value: number) => store(value)
  };
};

const counter = createCounterStore(10);

function Counter() {
  const count = counter.useValue();
  
  return (
    <>
      <span>Count: {count}</span>
      <button onClick={counter.increment}>+</button>
      <button onClick={counter.decrement}>-</button>
      <button onClick={counter.reset}>Reset</button>
    </>
  );
}
```

### Multiple Store Subscription

```tsx
// Multiple independent stores
const counter = keep(0);
const user = keep({ name: 'John', age: 25 });
const theme = keep('light');

function Dashboard() {
  // Subscribe to multiple stores at once
  const [count, userData, currentTheme] = useKeep(counter, user, theme);
  
  return (
    <div className={`theme-${currentTheme}`}>
      <h1>Welcome {userData.name}</h1>
      <p>Count: {count}</p>
      <p>Age: {userData.age}</p>
    </div>
  );
}
```

### Component-Local State with useKpr

```tsx
// Each component instance gets its own isolated state
function LocalCounterComponent() {
  const [count, counter] = useKpr(() => keep(0));
  
  return (
    <div>
      <h3>Local Counter: {count}</h3>
      <button onClick={() => counter(c => c + 1)}>+</button>
      <button onClick={() => counter(c => c - 1)}>-</button>
      <button onClick={() => counter(0)}>Reset</button>
    </div>
  );
}

// Advanced: Component-local state with projection
function LocalStateWithProjection() {
  const [items, loading, { addItem, setLoading }] = useKpr(
    () => createDataManager(),
    manager => [manager.items, manager.loading] // Project specific values
  );
  
  return (
    <div>
      <p>Items: {items.length}, Loading: {loading ? 'Yes' : 'No'}</p>
      <button onClick={() => addItem('New Item')}>Add Item</button>
      <button onClick={() => setLoading(!loading)}>Toggle Loading</button>
    </div>
  );
}

function createDataManager() {
  const items = keep<string[]>([]);
  const loading = keep(false);
  
  return {
    items,
    loading,
    addItem: (item: string) => items(current => [...current, item]),
    setLoading: (isLoading: boolean) => loading(isLoading),
    clear: () => items([])
  };
}

// Using multiple instances - each gets independent state
function MultipleInstanceDemo() {
  return (
    <div>
      <h2>Independent Counter Instances</h2>
      <LocalCounterComponent /> {/* Counter A */}
      <LocalCounterComponent /> {/* Counter B */}
      <LocalCounterComponent /> {/* Counter C */}
      {/* Each counter maintains its own state independently */}
    </div>
  );
}
```

### Extensible State Management

```tsx
class TodoManager {

  public items = keep<Todo[]>([]);
  public filter = keep<'all' | 'active' | 'completed'>('all');
  public loading = keep<boolean>(false);
  
  public addTodo = (text: string) => this.items( current => [
    ...current,
    { id: Date.now(), text, completed: false }
  ]);

  public toggleTodo = (id: number) => this.items( current => 
    current.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  );

  public setFilter = (filter: 'all' | 'active' | 'completed' ) => this.filter(filter);

}

// Extending
class SomeTodoManager extends TodoManager {

  public clearCompleted = () => this.items( current => 
    current.filter(todo => !todo.completed)
  );

  public loadTodos = async () => {
    this.loading(true);
    const response = await fetch('/api/todos');
    const data: Todo[] = await response.json();
    this.items(data);
    this.loading(false);
  };
}

const todoStore = new SomeTodoManager();

//some react framework loader:
function loader = () => {
  todoStore.loadTodos();
};

function TodoApp() {
  const { items, filter, loading } = useKeep(todoStore.items, todoStore.filter, todoStore.loading);
  
  const filteredItems = items.filter(item => {
    if (filter === 'active') return !item.completed;
    if (filter === 'completed') return item.completed;
    return true;
  });
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <input 
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            addTodo(e.currentTarget.value);
            e.currentTarget.value = '';
          }
        }}
      />
      {filteredItems.map(item => (
        <div key={item.id} onClick={() => toggleTodo(item.id)}>
          {item.text} {item.completed ? '✓' : '○'}
        </div>
      ))}
      <button onClick={() => setFilter('all')}>All</button>
      <button onClick={() => setFilter('active')}>Active</button>
      <button onClick={() => setFilter('completed')}>Completed</button>
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
| **Store Creation** | `keep(value)` | `createStore(reducer)` | `create(set => ({}))` | `atom(value)` |
| **Actions** | Direct updates | Dispatched actions | Direct mutations | Direct updates |
| **Performance** | Excellent | Good | Excellent | Excellent |

### When to Choose use-keep

**Choose use-keep when:**
- You want the smallest possible bundle size
- You prefer direct state updates over actions/reducers
- You need both global and component-scoped state patterns
- You want minimal learning curve and setup
- You're building lightweight applications
- You like React's useState API but need external stores
- You need atomic and structured state management

**Consider other libraries when:**
- You need extensive middleware ecosystem (Redux)
- You require time-travel debugging (Redux)
- You need built-in persistence (Zustand)
- You prefer only atomic state management (Jotai)

## Advanced Usage

### Store Composition

```tsx
const createAppState = () => {
  const user = keep<User | null>(null);
  const settings = keep({ theme: 'light', lang: 'en' });
  const notifications = keep<Notification[]>([]);

  return {
    user: {
      store: user,
      login: (userData: User) => user(userData),
      logout: () => user(null),
      useValue: () => useKeep(user)
    },
    settings: {
      store: settings,
      setTheme: (theme: string) => settings(s => ({ ...s, theme })),
      setLang: (lang: string) => settings(s => ({ ...s, lang })),
      useValue: () => useKeep(settings)
    },
    notifications: {
      store: notifications,
      add: (notification: Notification) => notifications(n => [...n, notification]),
      remove: (id: string) => notifications(n => n.filter(notif => notif.id !== id)),
      useValue: () => useKeep(notifications)
    },
    useAll: () => useKeep(user, settings, notifications)
  };
};

const appState = createAppState();
```

### Conditional Rendering with Multiple Stores

```tsx
function UserDashboard() {
  const [user, settings, notifications] = appState.useAll();
  
  if (!user) return <LoginForm />;
  
  return (
    <div className={`theme-${settings.theme}`}>
      <h1>Welcome {user.name}</h1>
      {notifications.length > 0 && (
        <NotificationBanner notifications={notifications} />
      )}
    </div>
  );
}
```

## Best Practices

### 1. Store Organization

```tsx
// ✅ Good: Organize related stores together
const userState = {
  profile: keep<User | null>(null),
  preferences: keep({ theme: 'light', lang: 'en' }),
  sessions: keep<Session[]>([])
};

// ❌ Avoid: Too many separate global stores
const userName = keep('');
const userAge = keep(0);
const userEmail = keep('');
```

### 2. Type Safety

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

### 3. Performance Optimization

```tsx
// ❌ avoid: Large monolithic stores causing unnecessary re-renders
const userStore = keep({ profile: null, settings: {} });

function UserProfile() {
  // Only re-renders when userStore changes
  const user = useKeep(userStore);
  return <div>{user.profile?.name}</div>;
}

// ✅ Good: Multiple granular stores for better performance
const userProfile = keep(null);
const userSettings = keep({});

function UserProfile() {
  // Only re-renders when userProfile changes
  const profile = useKeep(userProfile);
  return <div>{profile?.name}</div>;
}
```

### 4. useKpr vs useKeep Guidelines

```tsx
// ✅ Use useKeep for shared global state
const globalSettings = keep({ theme: 'light', lang: 'en' });

function SettingsPanel() {
  const settings = useKeep(globalSettings);
  // All instances share the same settings
  return <div>Theme: {settings.theme}</div>;
}

// ✅ Use useKpr for component-local state
// ✅ Use useKpr for temporary or derived state
function FormWithValidation() {
  const [values, errors, { setValue, validate }] = useKpr(
    () => createFormState(),
    form => [form.values, form.errors]
  );
  
  // Form state is local to each form instance
  return (
    <form onSubmit={() => validate()}>
      <input 
        value={values.email} 
        onChange={(e) => setValue('email', e.target.value)}
      />
      {errors.email && <span className="error">{errors.email}</span>}
    </form>
  );
}
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
  
  // Multiple stores with automatic tuple typing
  const [userData, countValue] = useKeep(userStore, numberStore);
  // userData is User | null, countValue is number
}


// useKpr with TypeScript
function TypedProjectionComponent() {
  const [items, loading, manager] = useKpr(
    () => createTypedDataManager(),
    (state) => [state.items, state.loading] as const
  );
  // items: string[], loading: boolean, manager: DataManager
  
  return (
    <div>
      <p>Items: {items.length}, Loading: {loading.toString()}</p>
      <button onClick={() => manager.addItem('New')}>Add Item</button>
    </div>
  );
}

interface DataManager {
  items: KeepType<string[]>;
  loading: KeepType<boolean>;
  addItem: (item: string) => void;
}

function createTypedDataManager(): DataManager {
  const items = keep<string[]>([]);
  const loading = keep<boolean>(false);
  
  return {
    items,
    loading,
    addItem: (item: string) => items(current => [...current, item])
  };
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [Felipe Rodriguez Herrera](https://github.com/ksoze84)

---

If you find this library useful, please consider giving it a ⭐ on [GitHub](https://github.com/ksoze84/use-keep)!
