# Admin Dashboard Module

The Admin Dashboard module provides an administrative interface for monitoring and managing the AppletHub system.

## Features

- **System Information**: View key system metrics and status
- **Module Management**: Start, stop, and view module information
- **TupleStore Explorer**: Browse, search, edit, and delete data in the TupleStore
- **Service Dashboard**: View registered services and their providers

## Usage

The Admin Dashboard is automatically loaded when the `admin-dashboard` module is installed. It provides:

1. A sidebar navigation component
2. A main dashboard view with multiple panels
3. A dashboard service for accessing system information

### Dashboard Views

The Admin Dashboard provides several key views:

- **System Information**: Shows AppletHub version, uptime, resource usage, and module counts
- **Module Manager**: Lists all modules with the ability to start/stop non-required modules
- **TupleStore Explorer**: Interactive file explorer-like interface for browsing and editing data

### Dashboard Service

The dashboard exposes a service for programmatic access to system information:

```typescript
// Get the dashboard service
const dashboardService = context.services.getService('dashboardService');

// Get system stats
const stats = await dashboardService.getSystemStats();
console.log(`Memory usage: ${stats.memory}MB`);
console.log(`CPU usage: ${stats.cpu}%`);
console.log(`Uptime: ${stats.uptime}ms`);

// List modules
const modules = await dashboardService.listModules();
modules.forEach(module => {
  console.log(`Module: ${module.name} (${module.id}) - Status: ${module.status}`);
});

// Access TupleStore data
const data = await dashboardService.getTupleStoreData('user.preferences');
console.log('User preferences:', data);
```

## API Reference

### DashboardService

The DashboardService provides methods for accessing system information and managing the AppletHub instance.

#### Methods

- `getSystemStats()`: Returns system resource usage statistics
- `getVersion()`: Returns the AppletHub version
- `listModules()`: Returns information about all modules
- `getModule(id)`: Returns information about a specific module
- `startModule(id)`: Starts a module
- `stopModule(id)`: Stops a module
- `listServices()`: Returns information about all registered services
- `getTupleStoreData(path?)`: Returns data from the TupleStore at the specified path

### UI Components

The Admin Dashboard registers the following UI components:

- `admin-dashboard-main-view`: Main dashboard view
- `admin-dashboard-sidebar`: Dashboard navigation sidebar
- `admin-dashboard-system-info-panel`: System information panel
- `admin-dashboard-module-manager-panel`: Module management panel
- `admin-dashboard-tuplestore-explorer-panel`: TupleStore explorer panel

## Customization

You can extend the dashboard by interacting with its UI components or service. For example:

```typescript
// Get the main dashboard view
const dashboard = document.querySelector('.admin-dashboard-main-view');
if (dashboard && dashboard.__componentInstance) {
  // Refresh dashboard data
  dashboard.__componentInstance.refresh();
}
```

## Requirements

The Admin Dashboard module requires:

- `ui-components` module for UI rendering
- A service registry for registering the dashboard service
- UI slots for rendering dashboard views