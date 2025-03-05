# AppletHub Documentation

Welcome to the AppletHub documentation! This guide will help you learn about AppletHub, its architecture, and how to use it to build modular applications.

## Table of Contents

- [Getting Started](#getting-started)
- [Core Concepts](#core-concepts)
- [Guides](#guides)
- [API Reference](#api-reference)
- [Architecture](#architecture)

## Getting Started

- [Installation and Setup](./guides/installation.md)
- [Creating Your First Module](./guides/first-module.md)
- [Running the Development Server](./guides/development-server.md)

## Core Concepts

AppletHub is built around a few core concepts:

### Modules

Modules are self-contained pieces of functionality with a well-defined interface. Each module can provide capabilities and services, and can also depend on capabilities and services provided by other modules.

### TupleStore

The TupleStore is a hierarchical key-value store that modules use to share state and data. It provides path-based access, reactive updates, and transaction support.

### Service Registry

The Service Registry allows modules to register and consume services. Services are APIs that modules can expose for other modules to use.

### UI System

The UI System provides a component-based approach to building user interfaces. It supports slot-based composition, allowing modules to contribute UI components to different parts of the application.

## Guides

- [Module Development Kit](./guides/mdk.md)
- [Working with TupleStore](./guides/tuple-store.md)
- [Creating UI Components](./guides/ui-components.md)
- [Using the Service Registry](./guides/service-registry.md)
- [Advanced Module Patterns](./guides/advanced-modules.md)

## API Reference

- [Module System API](./api/module-system.md)
- [TupleStore API](./api/tuple-store.md)
- [UI Component API](./api/ui-components.md)
- [Client SDK API](./api/client-sdk.md)

## Architecture

- [System Overview](./architecture/overview.md)
- [Module Loading and Resolution](./architecture/module-loading.md)
- [Data Flow](./architecture/data-flow.md)
- [Extension Points](./architecture/extension-points.md)

## Contributing

We welcome contributions to AppletHub! See our [Contributing Guide](../CONTRIBUTING.md) for more information.