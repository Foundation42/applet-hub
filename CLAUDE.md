# AppleHub Development Guidelines

## Commands
- **Run TypeScript check**: `bun tsc`
- **Run tests**: `bun test`
- **Run specific test**: `bun test src/tuple-store/tests/tuple-store.test.ts`
- **Format code**: `bun prettier --write src/**/*.ts`

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