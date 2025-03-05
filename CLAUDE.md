# AppleHub Development Guidelines

## Commands
- **Run TypeScript check**: `bun tsc`
- **Run tests**: `bun test`
- **Run specific test**: `bun test src/tuple-store/tests/tuple-store.test.ts`
- **Format code**: `bun prettier --write src/**/*.ts`
- **Run server**: `bun run index.ts`
- **Run server in detached mode**: `bun run index.ts --detached`

## Code Style
- **Imports**: Use ES Module syntax (`import/export`)
- **TypeScript**: Strict mode with explicit types for function parameters and returns
- **Naming**:
  - PascalCase for classes, interfaces, and types
  - camelCase for variables, functions, and methods
  - Use descriptive names that reflect intent
- **Classes**: Prefer composition over inheritance
- **Architecture**: Interface-based design with standalone modules
- **Error Handling**: Use try/catch blocks for error handling
- **Testing**: Jest syntax with describe/test blocks and beforeEach hooks
- **Documentation**: Add JSDoc comments for public APIs and complex logic

## Project Structure
- **Module Organization**: Each module in a separate directory with its own `manifest.json`
- **Testing**: Co-locate tests in a `tests` directory within each module
- **Examples**: Include example.ts files showing usage patterns

## Current Project Status

### Working Features
- HTTP server, static files server and base module system infrastructure
- Basic admin dashboard with panels for system info, modules, services and TupleStore explorer
- UI Test App for interactively testing UI components
- TypeScript path aliases in tsconfig.json for cleaner imports
- Detached mode for running the server in the background
- Browser/server environment detection for proper component initialization
- Improved component serialization for cross-environment usage

### Issues and TODOs
- TypeScript has configuration issues with template strings (`...`), always use string concatenation ('string ' + variable) instead
- Always add robust error handling with try/catch for browser code
- Services have type issues when registering due to Record<string, Function> requirements - use explicit method binding
- Component functions need special handling when serializing/deserializing between server and browser
- When working with components in the browser, always handle possible function conversion errors
- Function serialization limitations require careful handling of complex components

## Module Dependencies
The application loads modules in the following order:
1. HTTP Server
2. UI Components 
3. Admin Dashboard 
4. Static Files
5. UI Test App (when explicitly added)

## App URLs
- Admin dashboard: http://localhost:3000/admin
- UI Test App: http://localhost:3000/ui-test