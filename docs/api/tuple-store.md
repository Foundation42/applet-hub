# TupleStore API Reference

The TupleStore is a hierarchical key-value store that provides path-based access to data, with support for reactivity and transactions.

## Core Interfaces

### TupleStore

```typescript
interface TupleStore {
  set(path: string | string[], value: any, options?: TupleStoreOptions): boolean;
  get(path: string | string[]): any;
  getBranch(path?: string | string[]): any;
  has(path: string | string[]): boolean;
  delete(path: string | string[], options?: TupleStoreOptions): boolean;
  find(pattern: string | string[]): string[];
  clear(options?: TupleStoreOptions): boolean;
  import(data: object, options?: TupleStoreOptions): boolean;
  export(path?: string | string[]): any;
}
```

### JournaledTupleStore

Extends TupleStore with transaction support.

```typescript
interface JournaledTupleStore extends TupleStore {
  beginTransaction(): any;
  commitTransaction(transaction?: any): boolean;
  rollbackTransaction(transaction?: any): boolean;
  getJournal(): any[];
  clearJournal(): void;
  setJournaling(enabled: boolean): void;
}
```

### ObservableTupleStore

Extends TupleStore with subscription capabilities.

```typescript
interface ObservableTupleStore extends TupleStore {
  subscribe(
    path: string | string[],
    callback: (newValue: any, oldValue: any, path: string[]) => void
  ): () => void;
}
```

### TupleStoreOptions

Options for various TupleStore operations.

```typescript
interface TupleStoreOptions {
  journal?: boolean;   // Whether to add this operation to the journal
  silent?: boolean;    // Whether to notify subscribers about this change
  reset?: boolean;     // Whether to reset the store on import
  transaction?: any;   // Current transaction (if any)
  [key: string]: any;  // Any additional options
}
```

## Usage Examples

### Basic Operations

```typescript
// Create a store
import { createTupleStore } from './tuple-store/factory';
const store = createTupleStore();

// Set values
store.set('user.name', 'John');
store.set('user.profile.email', 'john@example.com');
store.set(['user', 'profile', 'address', 'city'], 'New York');

// Get values
const name = store.get('user.name'); // 'John'
const profile = store.getBranch('user.profile'); // { email: 'john@example.com', address: { city: 'New York' } }

// Check if paths exist
const hasEmail = store.has('user.profile.email'); // true
const hasPhone = store.has('user.profile.phone'); // false

// Delete values
store.delete('user.profile.email');

// Find paths with wildcards
const userProps = store.find('user.*'); // ['user.name', 'user.profile']
const allUserProps = store.find('user.**'); // ['user.name', 'user.profile', 'user.profile.address', 'user.profile.address.city']

// Import/export data
const data = { settings: { theme: 'dark' } };
store.import(data);
const exported = store.export(); // { user: { ... }, settings: { theme: 'dark' } }
```

### Subscriptions

```typescript
// Create an observable store
import { createTupleStore } from './tuple-store/factory';
const store = createTupleStore({ observable: true });

// Subscribe to changes
const unsubscribe = store.subscribe('user.profile.**', (newValue, oldValue, path) => {
  console.log(`Change at ${path.join('.')}: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`);
});

// Make changes (will trigger the subscription)
store.set('user.profile.email', 'john@example.com');
store.set('user.profile.age', 30);

// Unsubscribe when done
unsubscribe();
```

### Transactions

```typescript
// Create a journaled store
import { createTupleStore } from './tuple-store/factory';
const store = createTupleStore({ journal: true });

// Begin a transaction
const transaction = store.beginTransaction();

try {
  // Make changes as part of the transaction
  store.set('account1.balance', 50);
  store.set('account2.balance', 150);
  
  // Commit the transaction
  store.commitTransaction(transaction);
} catch (error) {
  // Rollback on error
  store.rollbackTransaction(transaction);
}

// Get the journal
const journal = store.getJournal();
console.log(`Journal entries: ${journal.length}`);
```

## Implementations

AppletHub provides several TupleStore implementations:

- **CoreTupleStore**: Basic implementation with no additional features
- **JournaledTupleStore**: Adds transaction support
- **ObservableTupleStore**: Adds subscription support

You can compose these implementations to create a store with the features you need.

## Factory

For convenience, AppletHub provides a factory function to create TupleStore instances:

```typescript
import { createTupleStore } from './tuple-store/factory';

// Create a basic store
const basicStore = createTupleStore({ journal: false, observable: false });

// Create a journaled store
const journaledStore = createTupleStore({ observable: false });

// Create an observable store
const observableStore = createTupleStore({ journal: false });

// Create a full-featured store
const fullStore = createTupleStore();
```