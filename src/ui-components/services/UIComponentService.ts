// ui-components/services/UIComponentService.ts

/**
 * UI Component definition
 */
export interface UIComponentDefinition {
  /**
   * Unique ID of the component
   */
  id: string;

  /**
   * Display name
   */
  name: string;

  /**
   * Component description
   */
  description?: string;

  /**
   * Component category
   */
  category:
    | "layout"
    | "input"
    | "display"
    | "navigation"
    | "feedback"
    | "data"
    | "utility";

  /**
   * Component template function
   */
  template: (props?: any) => string;

  /**
   * Component initialization function (called after the component is rendered)
   */
  init?: (element: HTMLElement, props?: any) => void | any;

  /**
   * Component update function
   */
  update?: (element: HTMLElement, props?: any) => void;

  /**
   * Component cleanup function
   */
  cleanup?: (element: HTMLElement) => void;

  /**
   * Default props
   */
  defaultProps?: Record<string, any>;

  /**
   * Component CSS styles
   */
  styles?: string;

  /**
   * Whether the component can have children
   */
  hasChildren?: boolean;
}

/**
 * Service for managing UI components
 */
export class UIComponentService {
  private components: Map<string, UIComponentDefinition> = new Map();
  private styleElement: HTMLStyleElement | null = null;

  constructor() {
    // Create style element for component styles
    this.styleElement = document.createElement("style");
    this.styleElement.id = "applethub-component-styles";
    document.head.appendChild(this.styleElement);
  }

  /**
   * Register a UI component
   */
  registerComponent(component: UIComponentDefinition): void {
    // Check if already registered
    if (this.components.has(component.id)) {
      console.warn(`Component already registered: ${component.id}`);
      return;
    }

    // Add to registry
    this.components.set(component.id, component);

    // Add styles if provided
    if (component.styles && this.styleElement) {
      this.styleElement.textContent += `\n/* ${component.id} */\n${component.styles}`;
    }

    console.log(`Registered component: ${component.id}`);
  }

  /**
   * Get a UI component by ID
   */
  getComponent(id: string): UIComponentDefinition | undefined {
    return this.components.get(id);
  }

  /**
   * Get all UI components
   */
  getAllComponents(): UIComponentDefinition[] {
    return Array.from(this.components.values());
  }

  /**
   * Get components by category
   */
  getComponentsByCategory(category: string): UIComponentDefinition[] {
    return this.getAllComponents().filter((c) => c.category === category);
  }

  /**
   * Create a component instance
   */
  createComponent(id: string, props?: any): HTMLElement | null {
    const component = this.components.get(id);
    if (!component) {
      console.error(`Component not found: ${id}`);
      return null;
    }

    // Merge props with defaults
    const mergedProps = { ...component.defaultProps, ...props };

    // Create container
    const container = document.createElement("div");
    container.className = `ah-component ah-component-${id}`;
    container.innerHTML = component.template(mergedProps);

    // Initialize component
    if (component.init) {
      try {
        const instance = component.init(container, mergedProps);
        if (instance) {
          // Store instance data
          (container as any).__componentInstance = instance;
        }
      } catch (error) {
        console.error(`Error initializing component ${id}:`, error);
      }
    }

    return container;
  }

  /**
   * Update a component instance
   */
  updateComponent(element: HTMLElement, props?: any): void {
    // Get component ID
    const classList = Array.from(element.classList);
    const componentClass = classList.find((c) => c.startsWith("ah-component-"));
    if (!componentClass) {
      console.error("Not a component element");
      return;
    }

    const id = componentClass.replace("ah-component-", "");
    const component = this.components.get(id);
    if (!component) {
      console.error(`Component not found: ${id}`);
      return;
    }

    // Call update method if available
    if (component.update) {
      try {
        component.update(element, props);
      } catch (error) {
        console.error(`Error updating component ${id}:`, error);
      }
    } else {
      // Default update behavior: re-render
      const mergedProps = { ...component.defaultProps, ...props };
      element.innerHTML = component.template(mergedProps);

      // Re-initialize component
      if (component.init) {
        try {
          const instance = component.init(element, mergedProps);
          if (instance) {
            // Store instance data
            (element as any).__componentInstance = instance;
          }
        } catch (error) {
          console.error(`Error re-initializing component ${id}:`, error);
        }
      }
    }
  }

  /**
   * Clean up a component instance
   */
  cleanupComponent(element: HTMLElement): void {
    // Get component ID
    const classList = Array.from(element.classList);
    const componentClass = classList.find((c) => c.startsWith("ah-component-"));
    if (!componentClass) {
      return;
    }

    const id = componentClass.replace("ah-component-", "");
    const component = this.components.get(id);
    if (!component) {
      return;
    }

    // Call cleanup method if available
    if (component.cleanup) {
      try {
        component.cleanup(element);
      } catch (error) {
        console.error(`Error cleaning up component ${id}:`, error);
      }
    }

    // Clear instance data
    delete (element as any).__componentInstance;
  }
}

// ui-components/services/ThemeService.ts

/**
 * Theme definition
 */
export interface Theme {
  /**
   * Theme name
   */
  name: string;

  /**
   * Color palette
   */
  colors: Record<string, string>;

  /**
   * Font family
   */
  fontFamily: string;

  /**
   * Font sizes
   */
  fontSize: Record<string, string>;

  /**
   * Spacing values
   */
  spacing: Record<string, string>;

  /**
   * Border radius values
   */
  borderRadius: Record<string, string>;

  /**
   * Shadow values
   */
  shadows: Record<string, string>;

  /**
   * Whether dark mode is enabled
   */
  darkMode: boolean;
}

/**
 * Theme change listener
 */
type ThemeChangeListener = (theme: Theme) => void;

/**
 * Service for managing themes
 */
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

  /**
   * Get the current theme
   */
  getTheme(): Theme {
    return { ...this.theme };
  }

  /**
   * Set the theme
   */
  setTheme(theme: Partial<Theme>): void {
    // Merge with current theme
    this.theme = { ...this.theme, ...theme };

    // Notify listeners
    this.notifyListeners();
  }

  /**
   * Toggle dark mode
   */
  toggleDarkMode(): void {
    this.theme.darkMode = !this.theme.darkMode;

    // Update colors for dark mode
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

    // Notify listeners
    this.notifyListeners();
  }

  /**
   * Subscribe to theme changes
   */
  subscribe(listener: ThemeChangeListener): () => void {
    this.listeners.add(listener);

    // Call listener immediately with current theme
    listener(this.getTheme());

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify listeners of theme change
   */
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
