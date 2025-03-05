# AppletHub

AppletHub is a modular application platform for building dynamic, composable applications with a plugin-based architecture.

## Features

- **Module System**: Dynamic loading and management of modules with dependency resolution
- **TupleStore**: Hierarchical key-value data store with path-based access, observation, and journaling
- **UI Components**: Modular component system for building interfaces
- **Client SDK**: Framework for connecting to AppletHub servers
- **Server Components**: HTTP, WebSocket, and webhook implementations
- **Admin Dashboard**: System monitoring, module management, and data exploration

## Architecture

AppletHub is built around a modular architecture with several key components:

- **Module System**: Core system for loading, managing, and orchestrating modules
- **Service Registry**: Inter-module communication via well-defined service interfaces
- **TupleStore**: Hierarchical data management for modules to share state
- **UI System**: Component-based interface system with slot registration

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.2.4 or later) - Fast JavaScript runtime with package management

### Installation

```bash
# Clone the repository
git clone https://github.com/foundation42/applethub.git
cd applethub

# Install dependencies
bun install
```

### Running the application

```bash
# Start the development server (stays running)
bun run dev 
# or
bun run start

# Start the server in test mode (auto-exits after startup)
bun run test-start
# or manually
bun run index.ts --test

# Run unit tests
bun test

# Type checking
bun tsc
```

### Accessing the Admin Dashboard

Once the server is running:

1. Open your browser and navigate to `http://localhost:3000/admin`
2. The dashboard provides three main panels:
   - **System Information** - View real-time metrics about your AppletHub instance
   - **Module Manager** - Start, stop, and manage installed modules
   - **TupleStore Explorer** - Browse and modify data in the TupleStore

You can also access the dashboard programmatically through the DashboardService:

```typescript
import { ModuleSystemFactory } from './src/module-system.ts/ModuleSystemFactory';
import { DashboardService } from './src/admin-dashboard/services/DashboardService';

const moduleSystem = ModuleSystemFactory.create();
await moduleSystem.registerModule('./src/admin-dashboard');
await moduleSystem.startAll();

// Get the dashboard service
const dashboardService = moduleSystem.getService<DashboardService>('DashboardService');

// Get system metrics
const metrics = await dashboardService.getSystemMetrics();
console.log('Memory usage:', metrics.memoryUsage);
```

### Quick Start Example

```typescript
import { ModuleSystemFactory } from './src/module-system.ts/ModuleSystemFactory';
import { TupleStoreFactory } from './src/tuple-store/factory';

// Initialize core systems
const moduleSystem = ModuleSystemFactory.create();
const tupleStore = TupleStoreFactory.createObservable();

// Register and start modules
await moduleSystem.registerModule('./src/http-server');
await moduleSystem.registerModule('./src/admin-dashboard');
await moduleSystem.startAll();

console.log('AppletHub is running!');
```

## Project Structure

```
/applethub
├── src/
│   ├── admin-dashboard/    # Admin dashboard for system monitoring
│   ├── client-sdk/         # Client-side SDK for connecting to AppletHub
│   ├── github-webhook/     # GitHub webhook integration module
│   ├── http-server/        # HTTP server module
│   ├── module-system.ts/   # Core module system implementation
│   ├── rpc-module/         # RPC communication module
│   ├── static-files/       # Static file serving module
│   ├── tuple-store/        # Hierarchical data store
│   ├── ui-components/      # UI component system
│   └── websocket-server.ts/# WebSocket server module
├── docs/                   # Documentation
│   └── modules/            # Module-specific documentation
├── demos/                  # Demo applications
└── index.ts                # Main entry point
```

## Module Development

AppletHub is designed to be extended with custom modules. To create a new module:

1. Create a new directory in `src/` for your module
2. Create a `manifest.json` file with the following structure:
   ```json
   {
     "name": "my-module",
     "version": "1.0.0",
     "description": "Description of my module",
     "dependencies": ["http-server"],
     "services": ["MyModuleService"],
     "components": ["MyComponent"]
   }
   ```
3. Implement your module's functionality with an `index.ts` entry point
4. Register services with the Service Registry for other modules to access
5. Register UI components with the UI Component Service if needed

### Example Module Structure

```
/my-module
├── index.ts                # Module entry point
├── manifest.json           # Module metadata
├── components/             # UI components
│   └── MyComponent.ts
├── services/               # Service implementations
│   └── MyModuleService.ts
└── tests/                  # Unit tests
    └── my-module.test.ts
```

## Troubleshooting

### Common Issues

1. **Module Not Found Error**
   ```
   Error: Cannot find module './src/admin-dashboard'
   ```
   
   Make sure all referenced modules exist in the correct directory structure.

2. **Port Already in Use**
   ```
   Error: listen EADDRINUSE: address already in use :::3000
   ```
   
   Change the port in your HTTP server configuration or close the application using port 3000.

3. **TypeScript Errors**
   Run `bun tsc` to check for type errors. Most common issues can be fixed by:
   - Adding proper type annotations
   - Importing missing types
   - Resolving interface implementation errors

### Getting Help

- Check the documentation in the `/docs` directory
- Open an issue on GitHub
- Join our Discord community at [discord.gg/applethub](https://discord.gg/applethub)

## License

[MIT](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
