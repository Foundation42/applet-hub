# Creating Your First Module

This guide will walk you through creating your first AppletHub module.

## Prerequisites

Before you begin, make sure you have:

- Installed AppletHub (see [Installation Guide](./installation.md))
- Installed the Module Development Kit (MDK)

## Using the Module Development Kit

The easiest way to create a new module is with the MDK:

```bash
# Create a basic module
applet create hello-world

# Or create a UI module
applet create hello-world-ui --type ui-module
```

The MDK will ask you a few questions and generate a module template for you.

## Understanding Module Structure

Let's look at the structure of a basic module:

```
hello-world/
├── index.ts        # Module entry point
├── manifest.json   # Module metadata
└── README.md       # Documentation
```

### The Manifest File

The `manifest.json` file defines your module's metadata, capabilities, and dependencies:

```json
{
  "id": "hello-world",
  "name": "Hello World",
  "description": "A simple hello world module",
  "version": "0.1.0",
  "entryPoint": "index.ts",
  "capabilities": [],
  "dependencies": {}
}
```

### The Module Entry Point

The `index.ts` file contains the module's implementation:

```typescript
// hello-world/index.ts
import { ModuleContext } from '../../module-system.ts/ModuleSystem';

/**
 * Initialize the module
 */
export async function initialize(context: ModuleContext): Promise<boolean> {
  console.log('Hello World module initialized!');
  
  // Store some data
  await context.store.set('message', 'Hello, AppletHub!');
  
  return true;
}

/**
 * Clean up when the module is stopped
 */
export async function cleanup(context: ModuleContext): Promise<boolean> {
  console.log('Hello World module cleanup');
  return true;
}

/**
 * Public API
 */
export function getAPI() {
  return {
    getMessage: () => 'Hello from the Hello World module!',
  };
}
```

## Adding Module Functionality

Let's enhance our module to do something useful:

### Storing and Retrieving Data

```typescript
// Store data during initialization
export async function initialize(context: ModuleContext): Promise<boolean> {
  await context.store.set('greeting', 'Hello');
  await context.store.set('user.name', 'AppletHub User');
  
  // Subscribe to changes
  context.store.subscribe('user.name', (newValue, oldValue) => {
    console.log(`User name changed from "${oldValue}" to "${newValue}"`);
  });
  
  return true;
}
```

### Exposing a Service

```typescript
// Register a service during initialization
export async function initialize(context: ModuleContext): Promise<boolean> {
  // Register the greeting service
  context.services.registerService({
    id: 'greetingService',
    implementation: {
      greet: (name: string) => `Hello, ${name}!`,
      farewell: (name: string) => `Goodbye, ${name}!`,
    },
    version: '1.0.0',
  });
  
  return true;
}
```

## Testing Your Module

To test your module, you can use the development server:

```bash
applet dev --modules hello-world
```

## Next Steps

Now that you've created your first module, you can:

- [Learn how to create UI components](./ui-components.md)
- [Work with the TupleStore for data management](./tuple-store.md)
- [Explore service registration and consumption](./service-registry.md)