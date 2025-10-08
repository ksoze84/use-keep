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

import { useRef } from "react";

// Using a symbol as initial value to distinguish from undefined values
const UNINITIALIZED = Symbol('uninitialized');
/**
 * React hook that creates and persists a value across component re-renders using lazy initialization.
 * The value is created only once on the first render using the provided generator function.
 * This is useful for expensive computations or object creation that should only happen once.
 * 
 * Unlike useState with lazy initialization, useKeeper doesn't provide a setter function,
 * making the value immutable once created. The value persists for the entire component lifecycle.
 * 
 * @template T The type of the value to be kept
 * @param keeperGen Generator function that creates the initial value. Called only once on first render.
 * @returns The persistent value created by the generator function
 * 
 * @example
 * ```typescript
 * // Basic usage with expensive computation
 * function ExpensiveComponent() {
 *   const expensiveValue = useKeeper(() => {
 *     console.log('This only runs once!');
 *     return heavyComputation();
 *   });
 *   
 *   return <div>{expensiveValue}</div>;
 * }
 * 
 * // Creating persistent objects
 * function ComponentWithMap() {
 *   const cache = useKeeper(() => new Map<string, any>());
 *   
 *   const handleClick = (key: string, value: any) => {
 *     cache.set(key, value);
 *   };
 *   
 *   return <button onClick={() => handleClick('test', 123)}>Add to cache</button>;
 * }
 * 
 * // Creating stores or external state
 * function ComponentWithStore() {
 *   const store = useKeeper(() => keep(0));
 *   const count = useKeep(store);
 *   
 *   return (
 *     <div>
 *       <div>Count: {count}</div>
 *       <button onClick={() => store(c => c + 1)}>Increment</button>
 *     </div>
 *   );
 * }
 * 
 * // Creating unique IDs
 * function ComponentWithId() {
 *   const id = useKeeper(() => Math.random().toString(36));
 *   
 *   return <div id={id}>Unique component</div>;
 * }
 * ```
 * 
 * @remarks
 * - The generator function is called exactly once, on the first render
 * - The returned value is memoized and persists across all subsequent re-renders
 * - Unlike useState, this hook doesn't trigger re-renders when the value changes
 * - The value is stored in a useRef, making it mutable if it's an object/array
 * - Memory is freed when the component unmounts
 * 
 * @see {@link useRef} - For storing mutable values without lazy initialization
 * @see {@link useState} - For stateful values that trigger re-renders
 * @see {@link useMemo} - For computed values that depend on dependencies
 */
export function useKeeper<T>( keeperGen: () => T ): T {
  const keeper = useRef<T | typeof UNINITIALIZED>(UNINITIALIZED);
  if (keeper.current === UNINITIALIZED) {
    keeper.current = keeperGen();
  }

  return keeper.current;
}
