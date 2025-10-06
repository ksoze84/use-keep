/**
 * MIT License
 * 
 * Copyright (c) 2025 Felipe Rodriguez Herrera
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { useDebugValue } from "react";
// @ts-ignore - use-sync-external-store shim for React <18 compatibility
import { useSyncExternalStore } from "use-sync-external-store/shim";

const notProvided = Symbol("notProvided");

/**
 * Type definition for a keep store.
 * @template T The type of the state value
 */
type KeepType<T> = {
  /** 
   * Sets a new value for the store
   * @param s New value or function that receives current value and returns new value
   * @returns undefined
   */
  (s : T|((s:T) => T) ): undefined;
  /** 
   * Gets the current value from the store
   * @returns Current state value
   */
  (): T;
  /** 
   * Subscribes to store changes
   * @param listener Function called when store value changes
   * @returns Unsubscribe function
   */
  subscribe: (listener: () => void) => () => void;
  /** 
   * Assigns additional methods to the store
   * @template L The store type
   * @template S The methods object type
   * @param k Object containing additional methods
   * @returns Store with additional methods attached
   */
  assign: <L extends KeepType<T>, S>(this: L, k: S) => L & S;
  /** 
   * React hook to subscribe to store changes (calls useKeep internally)
   * @returns Current state value, triggers re-render on changes
   */
  use: () => T;
}

/**
 * Creates a new store with the given initial state.
 * 
 * @template T The type of the state value
 * @param initialState Initial value for the store
 * @returns Store instance with getter/setter functionality
 * 
 * @example
 * ```typescript
 * const counter = keep(0);
 * console.log(counter()); // 0
 * counter(5); // Set to 5
 * counter(c => c + 1); // Increment using function
 * ```
 */
export function keep<T>( initialState: T ): KeepType<T>;

/**
 * Creates a new store with initial state and additional methods.
 * 
 * @template T The type of the state value
 * @template S The type of the additional methods object
 * @param initialState Initial value for the store
 * @param k Object containing additional methods to attach to the store
 * @returns Store instance with additional methods
 * 
 * @example
 * ```typescript
 * const counter = keep(0, {
 *   increment: () => counter(c => c + 1),
 *   decrement: () => counter(c => c - 1),
 *   reset: () => counter(0)
 * });
 * 
 * counter.increment(); // Uses attached method
 * ```
 */
export function keep<T,S>( initialState: T, k: S ): KeepType<T> & S;

export function keep<T,S>( initialState: T, k?: S ){
  const listeners = new Set<() => void>();
  
  /**
   * Subscription function that manages listeners for store changes.
   * @param listener Callback function to be called when store value changes
   * @returns Function to unsubscribe the listener
   */
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
  
  /**
   * Core state function that handles both getting and setting values.
   * When called without arguments, returns current value.
   * When called with a value or function, updates the store and notifies listeners.
   * 
   * @param s Optional new value or updater function
   * @returns Current value when getting, undefined when setting
   */
  const state = (( s : T|((s:T) => T) = notProvided as T) => {
    if(s !== notProvided){ 
      // Setting: update value and notify listeners
      initialState = typeof s === 'function' ? (s as (s:T) => T)(initialState) : s;
      for (const listener of listeners) listener();
    }
    else {
      // Getting: return current value
      return initialState;
    }
  }) as KeepType<T>;
  
  // Attach core methods to the state function
  state.subscribe = subscribe;
  
  /**
   * React hook method that subscribes to store changes.
   * Calls useKeep internally to provide reactive updates in components.
   * 
   * @returns Current state value, component re-renders on changes
   */
  state.use = () => useKeep(state);
  
  /**
   * Method to extend the store with additional functionality.
   * Uses Object.assign to merge additional methods with the store.
   * 
   * @param k Object containing methods to add to the store
   * @returns Store instance with additional methods attached
   */
  state.assign = function(this, k) {
    return Object.assign(this, k);
  }
  
  // If additional methods provided, assign them and return extended store
  if (k)
    return state.assign(k);
  return state;
}

/**
 * React hook that subscribes a component to store changes.
 * Uses React's useSyncExternalStore for optimal performance and concurrent features support.
 * The component will re-render whenever the store value changes.
 * 
 * @template T The type of the state value
 * @template K The type of additional methods (if any)
 * @param store Store instance created by keep()
 * @returns Current state value from the store
 * 
 * @example
 * ```typescript
 * const counter = keep(0);
 * 
 * function Counter() {
 *   const count = useKeep(counter);
 *   return <div>Count: {count}</div>;
 * }
 * 
 * // Equivalent to using store.use()
 * function CounterAlt() {
 *   const count = counter.use();
 *   return <div>Count: {count}</div>;
 * }
 * ```
 */
export function useKeep<T, K>( store: ReturnType<typeof keep<T, K>> ) : T {
  const state = useSyncExternalStore(
    store.subscribe,     // Subscribe function
    store,              // Get snapshot function (current value)
    store               // Server snapshot function (for SSR)
  );
  
  // Enable React DevTools debugging
  useDebugValue(state);
  return state;
}