import { useDebugValue } from "react";
// @ts-ignore - use-sync-external-store shim for React <18 compatibility
import { useSyncExternalStore } from "use-sync-external-store/shim";

const notProvided = Symbol("notProvided");

type KeepType<T> = {
  (s : T|((s:T) => T) ): undefined;
  (): T;
  subscribe: (listener: () => void) => () => void;
  assign: <L extends KeepType<T>, S>(this: L, k: S) => L & S;
  use: () => T;
}

export function keep<T>( initialState: T ): KeepType<T>;
export function keep<T,S>( initialState: T, k: S ): KeepType<T> & S;
export function keep<T,S>( initialState: T, k?: S ){
  const listeners = new Set<() => void>();
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
  const state = (( s : T|((s:T) => T) = notProvided as T) => {
    if(s !== notProvided){ 
      initialState = typeof s === 'function' ? (s as (s:T) => T)(initialState) : s;
      for (const listener of listeners) listener();
    }
    else
      return initialState;
  }) as KeepType<T>;
  state.subscribe = subscribe;
  state.use = () => useKeep(state);
  state.assign = function(this, k) {
    return Object.assign(this, k);
  }
  if (k)
    return state.assign(k);
  return state;
}

export function useKeep<T, K>( store: ReturnType<typeof keep<T, K>> ) : T {
  const state = useSyncExternalStore(
    store.subscribe,
    store,
    store // For server-side rendering, return the current value
  );
  useDebugValue(state);
  return state;
}