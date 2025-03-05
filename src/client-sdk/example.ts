// examples/client-usage.js

// Import the SDK
import { createAppletHub, ConnectionStatus } from "@applethub/client-sdk";

// Basic usage
function basicUsage() {
  // Create AppletHub client
  const applethub = createAppletHub({
    serverUrl: "http://localhost:3000",
    autoConnect: true,
    handlers: {
      onConnect: () => console.log("Connected to AppletHub!"),
      onDisconnect: () => console.log("Disconnected from AppletHub"),
      onError: (error) => console.error("AppletHub error:", error),
    },
  });

  // Listen for status changes
  applethub.on("status", (status) => {
    console.log(`Connection status: ${status}`);

    if (status === ConnectionStatus.CONNECTED) {
      console.log("Ready to use AppletHub!");
    }
  });

  // Access RPC service
  async function callRpcMethod() {
    try {
      const response = await applethub.client.call("system.echo", {
        message: "Hello, AppletHub!",
      });
      console.log("Response:", response);
    } catch (error) {
      console.error("RPC error:", error);
    }
  }

  // Access state
  async function workWithState() {
    // Set state
    await applethub.client.setState("app.theme", "dark", true);

    // Get state
    const theme = await applethub.client.getState("app.theme");
    console.log("Current theme:", theme);

    // Subscribe to state changes
    const unsubscribe = await applethub.client.subscribeToState(
      "app.**",
      (newValue, oldValue, path) => {
        console.log(`State changed at ${path}: ${oldValue} -> ${newValue}`);
      }
    );

    // Later, unsubscribe
    // unsubscribe();
  }

  // When needed, you can manually connect or disconnect
  applethub.connect().then(() => {
    console.log("Manually connected");

    // Later, disconnect
    // applethub.disconnect();
  });

  return applethub;
}

// Module management
async function moduleManagement(applethub) {
  // List available modules
  const modules = await applethub.modules.listModules();
  console.log(
    `Available modules (${modules.length}):`,
    modules.map((m) => `${m.name} v${m.version}`)
  );

  // Find modules by capability
  const visualizationModules = await applethub.modules.findModulesByCapability(
    "data-visualization"
  );
  console.log(
    "Visualization modules:",
    visualizationModules.map((m) => m.name)
  );

  // Load modules
  const chartModules = await applethub.modules.loadModules([
    "chart-visualizer",
  ]);
  console.log("Loaded chart modules:", chartModules);

  // Access module API
  const chartModule = applethub.modules.getModule("chart-visualizer");
  if (chartModule) {
    // Create a chart
    const container = document.getElementById("chart-container");
    chartModule.api.createBarChart(container, [
      { label: "Jan", value: 10 },
      { label: "Feb", value: 15 },
      { label: "Mar", value: 8 },
      { label: "Apr", value: 12 },
    ]);
  }
}

// UI system
function uiSystem(applethub) {
  // Register a slot in the DOM
  const mainContainer = document.getElementById("main-content");
  applethub.ui.registerSlot("main", mainContainer, "Main Content");

  // Alternatively, use data attributes in HTML:
  // <div id="sidebar" data-applethub-slot="sidebar" data-applethub-slot-name="Sidebar"></div>

  // Register a component
  applethub.ui.registerComponent({
    id: "welcome-message",
    moduleId: "core",
    name: "Welcome Message",
    type: "element",
    slots: ["main", "sidebar"],
    render: (container, props) => {
      const { message, userName } = props;
      container.innerHTML = `
        <div class="welcome-card">
          <h2>${message || "Welcome to AppletHub"}</h2>
          <p>Hello, ${userName || "User"}!</p>
        </div>
      `;
    },
    update: (props) => {
      // Update logic
    },
    cleanup: () => {
      // Cleanup logic
    },
  });

  // Set global props for all components
  applethub.ui.setGlobalProps({
    userName: "John",
    theme: "dark",
  });

  // Manually render a component in a slot
  applethub.ui.renderComponent("welcome-message", "main", {
    message: "Custom welcome message",
  });
}

// Real-world example: Building a dashboard
async function buildDashboard() {
  // Initialize AppletHub
  const applethub = createAppletHub();

  // Wait for connection
  await new Promise((resolve) => {
    if (applethub.client.getStatus() === ConnectionStatus.CONNECTED) {
      resolve(undefined);
    } else {
      applethub.once("connect", () => resolve(undefined));
    }
  });

  // Load required modules
  await applethub.modules.loadModules([
    "data-provider",
    "chart-visualizer",
    "table-component",
  ]);

  // Set up UI
  const dashboard = document.getElementById("dashboard");
  dashboard.innerHTML = `
    <div class="dashboard">
      <header data-applethub-slot="header"></header>
      <div class="dashboard-content">
        <div class="main-panel" data-applethub-slot="main"></div>
        <aside class="sidebar" data-applethub-slot="sidebar"></aside>
      </div>
      <footer data-applethub-slot="footer"></footer>
    </div>
  `;

  // Scan for slots (automatically done by the UI system)

  // Load dashboard data
  const dataProvider = applethub.modules.getModule("data-provider");
  if (dataProvider) {
    const data = await dataProvider.api.fetchDashboardData();

    // Store in state
    await applethub.client.setState("dashboard.data", data);

    // Subscribe to data updates
    await applethub.client.subscribeToState("dashboard.data", (newData) => {
      console.log("Dashboard data updated:", newData);
    });
  }

  // Register custom component
  applethub.ui.registerComponent({
    id: "dashboard-header",
    moduleId: "app",
    name: "Dashboard Header",
    type: "container",
    slots: ["header"],
    render: (container, props) => {
      const { title, userName } = props;
      container.innerHTML = `
        <div class="dashboard-header">
          <h1>${title || "Dashboard"}</h1>
          <div class="user-info">
            <span>Welcome, ${userName || "User"}</span>
            <button id="logout-btn">Logout</button>
          </div>
        </div>
      `;

      // Add event listener
      container.querySelector("#logout-btn").addEventListener("click", () => {
        console.log("Logout clicked");
      });

      // Return instance data if needed
      return {
        setTitle: (newTitle) => {
          container.querySelector("h1").textContent = newTitle;
        },
      };
    },
  });

  // The UI system will automatically render components in their slots

  return applethub;
}

// Export examples
export { basicUsage, moduleManagement, uiSystem, buildDashboard };
