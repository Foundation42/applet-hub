// tuple-store.test.ts - Tests for TupleStore implementations

import { CoreTupleStore } from './CoreTupleStore';
import { JournaledTupleStore } from './JournaledTupleStore';
import { ObservableTupleStore } from './ObservableTupleStore';

// Helper function to create different store configurations for testing
function createStores() {
  const core = new CoreTupleStore();
  const journaled = new JournaledTupleStore({ store: core });
  const observable = new ObservableTupleStore({ store: core });
  const full = new ObservableTupleStore({ 
    store: new JournaledTupleStore({ store: new CoreTupleStore() })
  });
  
  return { core, journaled, observable, full };
}

// Basic CRUD operations tests for all store types
describe('Core TupleStore Operations', () => {
  const { core, journaled, observable, full } = createStores();
  
  // Test each type of store with the same tests
  const stores = [
    { name: 'CoreTupleStore', store: core },
    { name: 'JournaledTupleStore', store: journaled },
    { name: 'ObservableTupleStore', store: observable },
    { name: 'Full Composed Store', store: full }
  ];
  
  stores.forEach(({ name, store }) => {
    describe(name, () => {
      beforeEach(() => {
        store.clear();
      });
      
      test('should set and get values', () => {
        store.set('user.name', 'John');
        expect(store.get('user.name')).toBe('John');
      });
      
      test('should set and get nested values', () => {
        store.set('user.profile.address.city', 'New York');
        expect(store.get('user.profile.address.city')).toBe('New York');
        expect(store.get('user.profile.address')).toEqual({ city: 'New York' });
      });
      
      test('should check if a path exists', () => {
        store.set('user.age', 30);
        expect(store.has('user.age')).toBe(true);
        expect(store.has('user.email')).toBe(false);
      });
      
      test('should delete values', () => {
        store.set('user.name', 'John');
        store.set('user.age', 30);
        
        expect(store.get('user')).toEqual({ name: 'John', age: 30 });
        
        store.delete('user.age');
        expect(store.get('user')).toEqual({ name: 'John' });
        expect(store.has('user.age')).toBe(false);
      });
      
      test('should get a branch', () => {
        store.set('user.name', 'John');
        store.set('user.profile.age', 30);
        store.set('user.profile.email', 'john@example.com');
        
        const profile = store.getBranch('user.profile');
        expect(profile).toEqual({ age: 30, email: 'john@example.com' });
        
        const user = store.getBranch('user');
        expect(user).toEqual({
          name: 'John',
          profile: {
            age: 30,
            email: 'john@example.com'
          }
        });
      });
      
      test('should handle arrays', () => {
        store.set('users', [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' }
        ]);
        
        expect(store.get('users.0.name')).toBe('John');
        expect(store.get('users.1.name')).toBe('Jane');
        
        store.set('users.1.age', 25);
        expect(store.get('users.1')).toEqual({ id: 2, name: 'Jane', age: 25 });
      });
      
      test('should import and export data', () => {
        const data = {
          user: {
            name: 'John',
            profile: {
              age: 30,
              email: 'john@example.com'
            }
          }
        };
        
        store.import(data);
        
        expect(store.get('user.name')).toBe('John');
        expect(store.get('user.profile.age')).toBe(30);
        
        const exported = store.export();
        expect(exported).toEqual(data);
        
        const userProfile = store.export('user.profile');
        expect(userProfile).toEqual(data.user.profile);
      });
      
      test('should find paths by pattern', () => {
        store.set('users.0.name', 'John');
        store.set('users.0.age', 30);
        store.set('users.1.name', 'Jane');
        store.set('users.1.age', 25);
        
        const namesOnly = store.find('users.*.name');
        expect(namesOnly).toContain('users.0.name');
        expect(namesOnly).toContain('users.1.name');
        expect(namesOnly).not.toContain('users.0.age');
        
        const allUserProps = store.find('users.**');
        expect(allUserProps).toContain('users.0.name');
        expect(allUserProps).toContain('users.0.age');
        expect(allUserProps).toContain('users.1.name');
        expect(allUserProps).toContain('users.1.age');
      });
    });
  });
});

// Tests for JournaledTupleStore-specific functionality
describe('JournaledTupleStore', () => {
  let store: JournaledTupleStore;
  
  beforeEach(() => {
    store = new JournaledTupleStore();
    store.clear();
  });
  
  test('should journal operations', () => {
    store.set('user.name', 'John');
    store.set('user.age', 30);
    
    const journal = store.getJournal();
    expect(journal.length).toBe(2);
    expect(journal[0].type).toBe('set');
    expect(journal[0].path).toEqual(['user', 'name']);
    expect(journal[0].value).toBe('John');
  });
  
  test('should not journal when disabled', () => {
    store.setJournaling(false);
    store.set('user.name', 'John');
    
    expect(store.getJournal().length).toBe(0);
  });
  
  test('should not journal silent operations', () => {
    store.set('user.name', 'John', { journal: false });
    
    expect(store.getJournal().length).toBe(0);
  });
  
  test('should clear journal', () => {
    store.set('user.name', 'John');
    expect(store.getJournal().length).toBe(1);
    
    store.clearJournal();
    expect(store.getJournal().length).toBe(0);
  });
  
  test('should perform atomic updates in a transaction', () => {
    store.beginTransaction();
    store.set('user.name', 'John');
    store.set('user.age', 30);
    store.set('user.email', 'john@example.com');
    
    // Data should be updated during transaction
    expect(store.get('user.name')).toBe('John');
    
    store.commitTransaction();
    
    // Transaction should be in the journal
    const journal = store.getJournal();
    expect(journal.length).toBe(1);
    expect(journal[0].type).toBe('transaction');
    expect(journal[0].operations.length).toBe(3);
  });
  
  test('should rollback a transaction', () => {
    store.set('user.name', 'Original');
    
    store.beginTransaction();
    store.set('user.name', 'Changed');
    expect(store.get('user.name')).toBe('Changed');
    
    store.rollbackTransaction();
    expect(store.get('user.name')).toBe('Original');
  });
});

// Tests for ObservableTupleStore-specific functionality
describe('ObservableTupleStore', () => {
  let store: ObservableTupleStore;
  
  beforeEach(() => {
    store = new ObservableTupleStore();
    store.clear();
  });
  
  test('should notify subscribers on value changes', () => {
    const callback = jest.fn();
    
    store.subscribe('user.name', callback);
    store.set('user.name', 'John');
    
    expect(callback).toHaveBeenCalledWith('John', undefined, ['user', 'name']);
    
    store.set('user.name', 'Jane');
    expect(callback).toHaveBeenCalledWith('Jane', 'John', ['user', 'name']);
  });
  
  test('should support wildcard subscriptions', () => {
    const callback = jest.fn();
    
    store.subscribe('user.*', callback);
    
    store.set('user.name', 'John');
    expect(callback).toHaveBeenCalledWith('John', undefined, ['user', 'name']);
    
    store.set('user.age', 30);
    expect(callback).toHaveBeenCalledWith(30, undefined, ['user', 'age']);
    
    // Should not trigger for deeper paths
    store.set('user.profile.email', 'john@example.com');
    expect(callback).toHaveBeenCalledTimes(2);
  });
  
  test('should support deep wildcard subscriptions', () => {
    const callback = jest.fn();
    
    store.subscribe('user.**', callback);
    
    store.set('user.name', 'John');
    expect(callback).toHaveBeenCalledWith('John', undefined, ['user', 'name']);
    
    store.set('user.profile.email', 'john@example.com');
    expect(callback).toHaveBeenCalledWith('john@example.com', undefined, ['user', 'profile', 'email']);
  });
  
  test('should be able to unsubscribe', () => {
    const callback = jest.fn();
    
    const unsubscribe = store.subscribe('user.name', callback);
    store.set('user.name', 'John');
    expect(callback).toHaveBeenCalledTimes(1);
    
    unsubscribe();
    store.set('user.name', 'Jane');
    expect(callback).toHaveBeenCalledTimes(1); // Still just one call
  });
  
  test('should not notify on silent updates', () => {
    const callback = jest.fn();
    
    store.subscribe('user.name', callback);
    store.set('user.name', 'John', { silent: true });
    
    expect(callback).not.toHaveBeenCalled();
    expect(store.get('user.name')).toBe('John');
  });
});

// Tests for full composed store
describe('Full Composed Store', () => {
  let store: ObservableTupleStore;
  
  beforeEach(() => {
    // Create a fully composed store with all features
    store = new ObservableTupleStore({ 
      store: new JournaledTupleStore({ store: new CoreTupleStore() })
    });
    store.clear();
  });
  
  test('should support both journaling and subscriptions', () => {
    const callback = jest.fn();
    store.subscribe('user.**', callback);
    
    // Journal should be available (via the journaled store layer)
    expect(store.getJournal).toBeDefined();
    const journaledStore = store['store'] as JournaledTupleStore;
    
    // Begin a transaction
    journaledStore.beginTransaction();
    
    // Make some changes - they should update the store but not notify subscribers yet
    journaledStore.set('user.name', 'John');
    journaledStore.set('user.age', 30);
    
    // Data should be available
    expect(store.get('user.name')).toBe('John');
    
    // But subscribers shouldn't be notified yet
    expect(callback).not.toHaveBeenCalled();
    
    // Commit the transaction
    journaledStore.commitTransaction();
    
    // Now subscribers should be notified
    expect(callback).toHaveBeenCalledTimes(2);
    
    // And journal should contain the transaction
    const journal = journaledStore.getJournal();
    expect(journal.length).toBe(1);
    expect(journal[0].type).toBe('transaction');
  });
});