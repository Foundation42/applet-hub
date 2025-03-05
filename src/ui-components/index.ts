// ui-components/index.ts
import {
  Module,
  ModuleContext,
  ModuleState,
  ServiceDefinition,
} from "../module-system/ModuleSystem";
import { UIComponentService } from "./services/UIComponentService";
import { registerComponents } from "./components";
// Define theme service here to avoid document reference issues
export interface Theme {
  name: string;
  colors: Record<string, string>;
  fontFamily: string;
  fontSize: Record<string, string>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  darkMode: boolean;
}

type ThemeChangeListener = (theme: Theme) => void;

export class ThemeService {
  private theme: Theme;
  private listeners: Set<ThemeChangeListener> = new Set();

  constructor() {
    // Default theme
    this.theme = {
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
  }

  getTheme(): Theme {
    return { ...this.theme };
  }

  setTheme(theme: Partial<Theme>): void {
    this.theme = { ...this.theme, ...theme };
    this.notifyListeners();
  }

  toggleDarkMode(): void {
    this.theme.darkMode = !this.theme.darkMode;

    if (this.theme.darkMode) {
      this.theme.colors = {
        ...this.theme.colors,
        background: "#121212",
        surface: "#1e1e1e",
        text: "#e0e0e0",
        textSecondary: "#a0a0a0",
        border: "#333333",
      };
    } else {
      this.theme.colors = {
        ...this.theme.colors,
        background: "#ffffff",
        surface: "#f8f9fa",
        text: "#212529",
        textSecondary: "#6c757d",
        border: "#dee2e6",
      };
    }

    this.notifyListeners();
  }

  subscribe(listener: ThemeChangeListener): () => void {
    this.listeners.add(listener);
    listener(this.getTheme());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const theme = this.getTheme();
    for (const listener of this.listeners) {
      try {
        listener(theme);
      } catch (error) {
        console.error("Error in theme change listener:", error);
      }
    }
  }
}

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

      console.log('Initializing UI Component Module...');
      console.log('Context received:', {
        manifestExists: !!context.manifest,
        storeExists: !!context.store,
        servicesExists: !!context.services
      });

      // Browser environment check to modify UIComponentService behavior
      const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
      if (!isBrowser) {
        console.log('Running in Node.js environment, modifying UIComponentService implementation');
        // Override document-dependent methods
        this.uiComponentService = new UIComponentService();
        
        // Override browser-specific methods
        this.uiComponentService.registerComponent = function(component) {
          console.log(`Registered component: ${component.id} (server-side)`);
          this.components.set(component.id, component);
        };
      }

      // Register the UI component service
      const uiComponentServiceDefinition: ServiceDefinition = {
        id: "uiComponentService",
        implementation: {
          registerComponent: this.uiComponentService.registerComponent.bind(this.uiComponentService),
          getComponent: this.uiComponentService.getComponent.bind(this.uiComponentService),
          getAllComponents: this.uiComponentService.getAllComponents.bind(this.uiComponentService),
          getComponentsByCategory: this.uiComponentService.getComponentsByCategory.bind(this.uiComponentService),
          createComponent: isBrowser ? this.uiComponentService.createComponent.bind(this.uiComponentService) : 
            () => { console.log('createComponent called in non-browser environment'); return null; }
        },
        version: "1.0.0",
        metadata: {
          description: "Service for registering and retrieving UI components",
        },
      };

      const success = context.services.registerService(uiComponentServiceDefinition);
      console.log('UI Component Service registration ' + (success ? 'succeeded' : 'failed'));

      // Register the theme service
      const themeServiceDefinition: ServiceDefinition = {
        id: "themeService",
        implementation: {
          getTheme: this.themeService.getTheme.bind(this.themeService),
          setTheme: this.themeService.setTheme.bind(this.themeService),
          toggleDarkMode: this.themeService.toggleDarkMode.bind(this.themeService),
          subscribe: this.themeService.subscribe.bind(this.themeService)
        },
        version: "1.0.0",
        metadata: {
          description: "Service for managing themes",
        },
      };

      const themeSuccess = context.services.registerService(themeServiceDefinition);
      console.log('Theme Service registration ' + (themeSuccess ? 'succeeded' : 'failed'));

      // Register built-in components
      await registerComponents(this.uiComponentService);
      console.log('Registered built-in components');

      // Load theme from store if available
      if (context.store) {
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
          if (context.store) {
            context.store.set("theme", defaultTheme);
          }
        }

        // Subscribe to theme changes
        if (isBrowser) {
          this.themeService.subscribe((theme) => {
            // Update store
            if (context.store) {
              context.store.set("theme", theme);
            }

            // Apply theme to document
            this.applyThemeToDocument(theme);
          });

          // Apply initial theme
          this.applyThemeToDocument(this.themeService.getTheme());
        }
      }

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
    // Check if we're in a browser environment
    if (typeof document === 'undefined') {
      console.log('Not in browser environment, skipping theme application');
      return;
    }
    
    try {
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
    } catch (error) {
      console.error('Error applying theme to document:', error);
    }
  }
}

/**
 * Create the UI component module
 */
export function createModule(): Module {
  return new UIComponentModule();
}
