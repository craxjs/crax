import { useSyncExternalStore, useCallback, useEffect, useRef, type DependencyList } from 'react';
import equal from 'fast-deep-equal/react';

// #region Types

/**
 * Configuration for creating a new store.
 * @template T The type of the state.
 */
export type StoreConfig = {
  /** The maximum number of previous states to keep in history. */
  maxHistorySize?: number;
};

/**
 * Represents a created store.
 * @template T The type of the state.
 */
export type Store<T> = {
  /**
   * Gets the current value of the store.
   * @returns {T} The current state.
   */
  get value(): T;

  /**
   * Sets the new value of the store.
   * @param {T} newValue The new state.
   */
  set value(newValue: T);

  /**
   * Updates the store's value using an updater function.
   * @param {(prevState: T) => T} updater The function to update the state.
   */
  update: (updater: (prevState: T) => T) => void;

  /**
   * The history of the store's states.
   * @returns {T[]} An array of previous states.
   */
  get history(): T[];

  /**
   * Subscribes to changes in the store.
   * @param {() => void} callback The function to call on change.
   * @returns {() => void} A cleanup function to unsubscribe.
   */
  subscribe: (callback: () => void) => () => void;

  /**
   * Locks the store to prevent modifications.
   * @returns {symbol} A symbol to use for unlocking the store.
   */
  lock: () => symbol;

  /**
   * Unlocks the store to allow modifications.
   * @param {symbol} id The symbol returned from lock.
   */
  unlock: (id: symbol) => void;
};

// #endregion

/**
 * Creates a new store.
 * @template T The type of the state.
 * @param {T} initialState The initial state of the store.
 * @param {StoreConfig<T>} [config] Optional configuration for the store.
 * @returns {Store<T>} The created store.
 */
export function createStore<T>(
  initialState: T,

  config?: StoreConfig
): Store<T> {
  let state: T = initialState;
  const subscribers = new Map<symbol, () => void>();
  const history: T[] = [];
  const maxHistorySize = config?.maxHistorySize ?? 10;
  let locked = false;
  let lockId: symbol | null = null;

  const updateHistory = (newState: T) => {
    if (history.length >= maxHistorySize) {
      history.shift();
    }
    history.push(newState);
  };

  const store: Store<T> = {
    get value() {
      return state;
    },

    set value(newValue: T) {
      if (locked) {
        console.error('Cannot modify a locked store.');
        return;
      }

      if (equal(state, newValue)) return;

      updateHistory(state);
      state = newValue;
      for (const callback of subscribers.values()) {
        callback();
      }
    },

    update: (updater: (prevState: T) => T) => {
      if (locked) {
        console.error('Cannot modify a locked store.');
        return;
      }
      const newValue = updater(state);
      if (equal(state, newValue)) return;

      updateHistory(state);
      state = newValue;
      for (const callback of subscribers.values()) {
        callback();
      }
    },

    get history() {
      return [...history];
    },

    subscribe: (callback: () => void) => {
      if (typeof callback !== 'function') {
        throw new Error('Subscriber callback must be a function.');
      }
      const id = Symbol();
      subscribers.set(id, callback);
      return () => {
        subscribers.delete(id);
      };
    },

    lock: () => {
      if (locked) {
        console.warn('Store is already locked.');
        return lockId as symbol;
      }
      locked = true;
      lockId = Symbol('lock');
      return lockId;
    },

    unlock: (id: symbol) => {
      if (!locked) {
        console.warn('Store is not locked.');
        return;
      }
      if (id === lockId) {
        locked = false;
        lockId = null;
      } else {
        console.error('Invalid id to unlock the store.');
      }
    },
  };

  return store;
}

/**
 * A hook to use a store within a React component.
 * @template T The type of the state.
 * @param {Store<T>} store The store to use.
 * @returns {[T, (newValue: T) => void]} A tuple with the current state and a function to update it.
 */
export function useStore<T>(store: Store<T>): [T, (newValue: T | ((prevState: T) => T)) => void] {
  const state = useSyncExternalStore(
    store.subscribe,
    () => store.value,
    () => store.value
  );

  const setState = useCallback(
    (newValue: T | ((prevState: T) => T)) => {
      if (typeof newValue === 'function') {
        store.update(newValue as (prevState: T) => T);
      } else {
        store.value = newValue;
      }
    },
    [store]
  );

  return [state, setState];
}

/**
 * A hook to perform side effects when a store's state changes.
 * @param {() => void | (() => void)} effect The effect to run. Can return a cleanup function.
 * @param {Store<unknown>[]} [stores] The stores to track. If not provided, the effect runs only once.
 */
export function useStoreEffect(
  effect: () => void | (() => void),
  stores?: Store<unknown>[]
) {
  const effectRef = useRef(effect);
  effectRef.current = effect;

  useEffect(() => {
    let cleanup = effectRef.current();

    if (!stores || stores.length === 0) {
      return () => { if (typeof cleanup === 'function') cleanup(); };
    }

    const unsubs = stores.map((s) =>
      s.subscribe(() => {
        if (typeof cleanup === 'function') cleanup();
        cleanup = effectRef.current();
      })
    );

    return () => {
      if (typeof cleanup === 'function') cleanup();
      unsubs.forEach((u) => u());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, stores as unknown as DependencyList);
}


