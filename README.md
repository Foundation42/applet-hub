# AppletHub

AppletHub is a modular application platform for building dynamic, composable applications with a plugin-based architecture.

## Features

- **Module System**: Dynamic loading and management of modules with dependency resolution
- **TupleStore**: Hierarchical key-value data store with path-based access, observation, and journaling
- **UI Components**: Modular component system for building interfaces
- **Client SDK**: Framework for connecting to AppletHub servers
- **Server Components**: HTTP, WebSocket, and webhook implementations

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
git clone https://github.com/yourusername/applethub.git
cd applethub

# Install dependencies
bun install
```

### Running the examples

```bash
# Run the demonstration examples 
bun run index.ts
```

## Project Structure

```
/applethub
├── src/
│   ├── client-sdk/         # Client-side SDK for connecting to AppletHub
│   ├── github-webhook/     # GitHub webhook integration module
│   ├── http-server/        # HTTP server module
│   ├── module-system.ts/   # Core module system implementation
│   ├── rpc-module/         # RPC communication module
│   ├── static-files/       # Static file serving module
│   ├── tuple-store/        # Hierarchical data store
│   ├── ui-components/      # UI component system
│   └── websocket-server.ts/# WebSocket server module
└── index.ts               # Main entry point
```

## Development

AppletHub is designed to be extended with custom modules. To create a new module:

1. Create a new directory in `src/` for your module
2. Create a manifest.json file to define your module's metadata, capabilities, and dependencies
3. Implement your module's functionality
4. Register your module with the AppletHub system

## License

[MIT](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
