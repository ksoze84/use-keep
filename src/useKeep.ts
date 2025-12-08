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


// @ts-ignore - use-sync-external-store shim for React <18 compatibility
import { useSyncExternalStore } from "use-sync-external-store/shim";
import { KeepType } from "./keep";



/**
 * React hook that subscribes a component to store changes.
 * Uses React's useSyncExternalStore for optimal performance and concurrent features support.
 * The component will re-render whenever the store value changes.
 * 
 * @template K The type of the state value
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
 */
export function useKeep<K>(store: KeepType<K>): K;
/**
 * A hook that retrieves and combines values from multiple Keep stores.
 * 
 * @template T - A readonly array type of KeepType instances
 * @param stores - The Keep stores to retrieve values from
 * @returns An object with the same structure as the input array, where each KeepType is replaced with its underlying value type
 * 
 * @example
 * ```typescript
 * const userStore = keep<User>(initialUser);
 * const settingsStore = keep<Settings>(initialSettings);
 * 
 * const [user, settings] = useKeep(userStore, settingsStore);
 * ```
 */
export function useKeep<T extends readonly KeepType<any>[]>(
  ...stores: T
): { [K in keyof T]: T[K] extends KeepType<infer S> ? S : never };


export function useKeep<T extends readonly KeepType<any>[]>(
  ...stores: T
) {
  if (stores.length === 1) 
    return useK(stores[0]);
  return stores.map(useK);
}


export function useK<T>( store: KeepType<T> ) {
  const state = useSyncExternalStore(
    store.subscribe,     // Subscribe function
    store,              // Get snapshot function (current value)
    store               // Server snapshot function (for SSR)
  );
  
  return state;
}



