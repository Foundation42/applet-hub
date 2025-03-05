// ui-components/index.ts
import {
  Module,
  ModuleContext,
  ModuleState,
  ServiceDefinition,
} from "../module-system/ModuleSystem";
import { UIComponentService } from "./services/UIComponentService";
import { registerComponents } from "./components";
import { ThemeService } from "./services/ThemeService";

/**
 * UI Component Library module
 */
export class UIComponentModule implements Module {
  private context: ModuleContext | null = null;
  private state: ModuleState = ModuleState.REGISTERED;
  private uiComponentService: UIComponentService;
  private themeService: ThemeService;

  constructor() {
    this.uiComponentService = new UIComponentService();
    this.themeService = new ThemeService();
  }

  /**
   * Initialize the UI component module
   */
  async initialize(context: ModuleContext): Promise<boolean> {
    try {
      this.state = ModuleState.LOADING;
      this.context = context;

      // Register the UI component service
      const uiComponentServiceDefinition: ServiceDefinition = {
        id: "uiComponentService",
        implementation: this.uiComponentService,
        version: "1.0.0",
        metadata: {
          description: "Service for registering and retrieving UI components",
        },
      };

      context.services.registerService(uiComponentServiceDefinition);

      // Register the theme service
      const themeServiceDefinition: ServiceDefinition = {
        id: "themeService",
        implementation: this.themeService,
        version: "1.0.0",
        metadata: {
          description: "Service for managing themes",
        },
      };

      context.services.registerService(themeServiceDefinition);

      // Register built-in components
      await registerComponents(this.uiComponentService);

      // Load theme from store if available
      const storedTheme = await context.store.get("theme");
      if (storedTheme) {
        this.themeService.setTheme(storedTheme);
      } else {
        // Set default theme
        const defaultTheme = {
          name: "light",
          colors: {
            primary: "#4a63e6",
            secondary: "#6c757d",
            background: "#ffffff",
            surface: "#f8f9fa",
            text: "#212529",
            textSecondary: "#6c757d",
            border: "#dee2e6",
            error: "#dc3545",
            warning: "#ffc107",
            success: "#28a745",
            info: "#17a2b8",
          },
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: {
            small: "0.875rem",
            base: "1rem",
            large: "1.25rem",
            xlarge: "1.5rem",
            xxlarge: "2rem",
          },
          spacing: {
            xs: "0.25rem",
            sm: "0.5rem",
            md: "1rem",
            lg: "1.5rem",
            xl: "2rem",
            xxl: "3rem",
          },
          borderRadius: {
            small: "0.25rem",
            base: "0.375rem",
            large: "0.5rem",
            full: "9999px",
          },
          shadows: {
            small: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
            base: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
            large: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)",
          },
          darkMode: false,
        };

        this.themeService.setTheme(defaultTheme);
        context.store.set("theme", defaultTheme);
      }

      // Subscribe to theme changes
      this.themeService.subscribe((theme) => {
        // Update store
        context.store.set("theme", theme);

        // Apply theme to document
        this.applyThemeToDocument(theme);
      });

      // Apply initial theme
      this.applyThemeToDocument(this.themeService.getTheme());

      this.state = ModuleState.ACTIVE;
      return true;
    } catch (error) {
      console.error("Error initializing UI component module:", error);
      this.state = ModuleState.ERROR;
      return false;
    }
  }

  /**
   * Stop the UI component module
   */
  async stop(): Promise<boolean> {
    try {
      this.state = ModuleState.STOPPED;
      return true;
    } catch (error) {
      console.error("Error stopping UI component module:", error);
      this.state = ModuleState.ERROR;
      return false;
    }
  }

  /**
   * Get the module state
   */
  getState(): ModuleState {
    return this.state;
  }

  /**
   * Get the module manifest
   */
  getManifest(): any {
    return {
      id: "ui-components",
      name: "UI Component Library",
      description: "Standard UI component library for AppletHub",
      version: "1.0.0",
      entryPoint: "index.ts",
      capabilities: ["ui-components", "design-system"],
      dependencies: {},
    };
  }

  /**
   * Get the module API
   */
  getAPI(): Record<string, any> {
    return {
      registerComponent: this.uiComponentService.registerComponent.bind(
        this.uiComponentService
      ),
      getComponent: this.uiComponentService.getComponent.bind(
        this.uiComponentService
      ),
      getAllComponents: this.uiComponentService.getAllComponents.bind(
        this.uiComponentService
      ),

      getTheme: this.themeService.getTheme.bind(this.themeService),
      setTheme: this.themeService.setTheme.bind(this.themeService),
      subscribeToTheme: this.themeService.subscribe.bind(this.themeService),
      toggleDarkMode: this.themeService.toggleDarkMode.bind(this.themeService),
    };
  }

  /**
   * Apply theme to document
   */
  private applyThemeToDocument(theme: any): void {
    // Create CSS variables
    const root = document.documentElement;

    // Set colors
    for (const [key, value] of Object.entries(theme.colors)) {
      root.style.setProperty(`--color-${key}`, value as string);
    }

    // Set font
    root.style.setProperty("--font-family", theme.fontFamily);

    // Set font sizes
    for (const [key, value] of Object.entries(theme.fontSize)) {
      root.style.setProperty(`--font-size-${key}`, value as string);
    }

    // Set spacing
    for (const [key, value] of Object.entries(theme.spacing)) {
      root.style.setProperty(`--spacing-${key}`, value as string);
    }

    // Set border radius
    for (const [key, value] of Object.entries(theme.borderRadius)) {
      root.style.setProperty(`--border-radius-${key}`, value as string);
    }

    // Set shadows
    for (const [key, value] of Object.entries(theme.shadows)) {
      root.style.setProperty(`--shadow-${key}`, value as string);
    }

    // Set body class for dark/light mode
    document.body.classList.toggle("dark-mode", theme.darkMode === true);
  }
}

/**
 * Create the UI component module
 */
export function createModule(): Module {
  return new UIComponentModule();
}
