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


/**
 * Type definition for a keep store.
 * @template T The type of the state value
 */
export type KeepType<T> = {
  /** 
   * Sets a new value for the store
   * @param s New value or function that receives current value and returns new value
   * @returns undefined
   */
  (s : T|((s:T) => T)): undefined;
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
export const keep = <T>( initialState: T ) => {
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
  function state( s? : T|((s:T) => T) ) {
    if(arguments.length === 1) { 
      // Setting: update value and notify listeners
      initialState = (typeof s === 'function' ? (s as (s:T) => T)(initialState) : s) as T;
      for (const listener of listeners) listener();
    }
    else {
      // Getting: return current value
      return initialState;
    }
  };
  
  // Attach core methods to the state function
  state.subscribe = subscribe;

  return state as KeepType<T>;
}

