# Installation and Setup

This guide will walk you through the steps to install and set up AppletHub for development.

## Prerequisites

AppletHub requires the following tools to be installed on your system:

- [Bun](https://bun.sh/) (version 1.2.4 or higher)
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (version 18 or higher, optional but recommended)

## Installing AppletHub

### Option 1: Clone the Repository

```bash
# Clone the AppletHub repository
git clone https://github.com/Foundation42/applet-hub.git
cd applet-hub

# Install dependencies
bun install
```

### Option 2: Start a New Project

You can also create a new project using AppletHub as a dependency:

```bash
# Create a new directory for your project
mkdir my-applet-project
cd my-applet-project

# Initialize a new project
bun init -y

# Install AppletHub as a dependency
bun add @applethub/core
```

## Setting Up the Development Environment

### Install the Module Development Kit (MDK)

The MDK provides tools for developing AppletHub modules:

```bash
# From the AppletHub repository
cd tools/mdk
bun install
bun link

# Verify installation
applet --version
```

### Project Structure

Here's a typical AppletHub project structure:

```
my-applet-project/
├── modules/           # Custom modules go here
├── public/            # Static assets
├── src/               # Core AppletHub code
│   ├── client-sdk/    # Client SDK
│   ├── module-system/ # Module system
│   ├── tuple-store/   # Tuple store
│   └── ...
├── index.ts           # Entry point
├── package.json       # Project configuration
└── tsconfig.json      # TypeScript configuration
```

## Running AppletHub

To start the development server:

```bash
bun run index.ts
```

Or using the MDK:

```bash
applet dev
```

By default, the server will start on port 3000. You can access the application at http://localhost:3000.

## Next Steps

- [Create your first module](./first-module.md)
- [Learn about the TupleStore](./tuple-store.md)
- [Explore the Module System](../api/module-system.md)