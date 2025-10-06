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

import { useReducer, useEffect, useDebugValue } from "react";
import { keep, KeepType } from "./keep";

// Utility type to prevent literal type inference
type NoInfer<T> = [T][T extends any ? 0 : never];

// State to hold both the current value and the store instance
type State<T,L> = [ value: T, store: KeepType<T> & L ];

  // Reducer that updates the state when the store value changes
const reducer = <T, L>(state: State<T,L>): State<T,L> => {
  return [ state[1](), state[1] ];
};

/**
 * React hook that creates and manages a KeepType store locally using useReducer.
 * Unlike useKeep which subscribes to an external store, usePeek creates the store
 * internally and manages it entirely within the component's local state.
 * 
 * @template T The type of the state value
 * @template L The type of the store (extends KeepType<T>)
 * @param storeFunc Function that creates/returns a store instance
 * @returns Tuple containing [current value, store instance]
 * 
 * @example
 * ```typescript
 * function Counter() {
 *   const [count, counter] = usePeek(() => keep(0));
 *   
 *   return (
 *     <div>
 *       <div>Count: {count}</div>
 *       <button onClick={() => counter(c => c + 1)}>+</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePeek<T, L>(
  initial_value : NoInfer<T>,
  extension : (s : KeepType<T>) => L
): [T, KeepType<T> & L] {

  // Initialize the reducer with the store and its initial value
  const [state, dispatch] = useReducer(reducer, null, init<T, L>(initial_value, extension));
  
  // Subscribe to store changes and trigger updates
  useEffect(() => state[1].subscribe(() => dispatch()), []);

  // Enable React DevTools debugging
  useDebugValue(state[0]);

  return [state[0], state[1]];
}

function init<T, L>( initial_value : T, extension: (s : KeepType<T>) => L): () => State<T, L> {
  return () => {
    const storeInstance = keep(initial_value, extension);
    return [
      storeInstance(),
      storeInstance
    ];
  };
}

