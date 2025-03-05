// src/client-sdk/UISystem.ts
/**
 * AppletHub Client UI System
 *
 * This provides client-side UI component management.
 */

import AppletHubClient from "./AppletHubClient";
import { ModuleManager } from "./ModuleManager";

/**
 * UI component
 */
export interface UIComponent {
  /**
   * Component ID
   */
  id: string;

  /**
   * Module ID that provides this component
   */
  moduleId: string;

  /**
   * Component name
   */
  name: string;

  /**
   * Component type
   */
  type: "element" | "container" | "utility";

  /**
   * Component render function
   */
  render: (container: HTMLElement, props?: any) => void | any;

  /**
   * Component update function
   */
  update?: (props?: any) => void;

  /**
   * Component cleanup function
   */
  cleanup?: () => void;

  /**
   * Slots this component can be rendered in
   */
  slots?: string[];

  /**
   * Component metadata
   */
  metadata?: Record<string, any>;
}

/**
 * UI slot
 */
export interface UISlot {
  /**
   * Slot ID
   */
  id: string;

  /**
   * Slot name
   */
  name: string;

  /**
   * DOM element
   */
  element: HTMLElement;

  /**
   * Components rendered in this slot
   */
  components: Array<{
    component: UIComponent;
    instance: any;
  }>;
}

/**
 * Component registration options
 */
export interface ComponentRegistrationOptions {
  /**
   * Auto-render in matching slots
   * @default true
   */
  autoRender?: boolean;

  /**
   * Component props
   */
  props?: any;
}

/**
 * Slot registration options
 */
export interface SlotRegistrationOptions {
  /**
   * Auto-render matching components
   * @default true
   */
  autoRender?: boolean;

  /**
   * Default props for components
   */
  defaultProps?: Record<string, any>;

  /**
   * Component filter
   */
  componentFilter?: (component: UIComponent) => boolean;
}

/**
 * UI system
 */
export class UISystem {
  private client: AppletHubClient;
  private moduleManager: ModuleManager;
  private components: Map<string, UIComponent> = new Map();
  private slots: Map<string, UISlot> = new Map();
  private globalProps: Record<string, any> = {};

  /**
   * Create a new UI system
   */
  constructor(client: AppletHubClient, moduleManager: ModuleManager) {
    this.client = client;
    this.moduleManager = moduleManager;

    // Initialize by scanning the DOM for slots
    this.scanDOMForSlots();

    // Set up mutation observer to detect new slots
    this.observeDOMForSlots();
  }

  /**
   * Set global props for all components
   */
  setGlobalProps(props: Record<string, any>): void {
    this.globalProps = { ...this.globalProps, ...props };

    // Update all rendered components
    for (const slot of this.slots.values()) {
      for (const { component, instance } of slot.components) {
        if (component.update) {
          try {
            component.update(this.getMergedProps(component, slot));
          } catch (error) {
            console.error(`Error updating component ${component.id}:`, error);
          }
        }
      }
    }
  }

  /**
   * Register a UI component
   */
  registerComponent(
    component: UIComponent,
    options: ComponentRegistrationOptions = {}
  ): void {
    // Default options
    const opts = {
      autoRender: options.autoRender !== false,
      props: options.props || {},
    };

    // Check if component already exists
    if (this.components.has(component.id)) {
      console.warn(`Component already registered: ${component.id}`);
      return;
    }

    // Add component metadata if not provided
    if (!component.metadata) {
      component.metadata = {};
    }

    // Store initial props in metadata
    component.metadata.initialProps = opts.props;

    // Add to components map
    this.components.set(component.id, component);

    // Add to any matching slots if auto-render is enabled
    if (opts.autoRender) {
      for (const slot of this.slots.values()) {
        if (this.shouldRenderInSlot(component, slot)) {
          this.renderComponentInSlot(component, slot);
        }
      }
    }
  }

  /**
   * Unregister a UI component
   */
  unregisterComponent(componentId: string): void {
    // Check if component exists
    const component = this.components.get(componentId);
    if (!component) {
      return;
    }

    // Remove from components map
    this.components.delete(componentId);

    // Remove from any slots
    for (const slot of this.slots.values()) {
      this.removeComponentFromSlot(component, slot);
    }
  }

  /**
   * Register a UI slot
   */
  registerSlot(
    id: string,
    element: HTMLElement,
    name = id,
    options: SlotRegistrationOptions = {}
  ): UISlot {
    // Default options
    const opts = {
      autoRender: options.autoRender !== false,
      defaultProps: options.defaultProps || {},
      componentFilter: options.componentFilter,
    };

    // Create slot
    const slot: UISlot = {
      id,
      name,
      element,
      components: [],
    };

    // Store default props in element dataset
    element.dataset.defaultProps = JSON.stringify(opts.defaultProps);

    // Clear the slot
    element.innerHTML = "";

    // Add to slots map
    this.slots.set(id, slot);

    // Render any matching components if auto-render is enabled
    if (opts.autoRender) {
      for (const component of this.components.values()) {
        if (this.shouldRenderInSlot(component, slot, opts.componentFilter)) {
          this.renderComponentInSlot(component, slot);
        }
      }
    }

    return slot;
  }

  /**
   * Unregister a UI slot
   */
  unregisterSlot(slotId: string): void {
    // Check if slot exists
    const slot = this.slots.get(slotId);
    if (!slot) {
      return;
    }

    // Clean up components
    for (const { component, instance } of slot.components) {
      if (component.cleanup) {
        try {
          component.cleanup();
        } catch (error) {
          console.error(`Error cleaning up component ${component.id}:`, error);
        }
      }
    }

    // Remove from slots map
    this.slots.delete(slotId);
  }

  /**
   * Get a UI component
   */
  getComponent(componentId: string): UIComponent | undefined {
    return this.components.get(componentId);
  }

  /**
   * Get all UI components
   */
  getAllComponents(): UIComponent[] {
    return Array.from(this.components.values());
  }

  /**
   * Get a UI slot
   */
  getSlot(slotId: string): UISlot | undefined {
    return this.slots.get(slotId);
  }

  /**
   * Get all UI slots
   */
  getAllSlots(): UISlot[] {
    return Array.from(this.slots.values());
  }

  /**
   * Render a component in a slot
   */
  renderComponent(componentId: string, slotId: string, props?: any): any {
    const component = this.components.get(componentId);
    const slot = this.slots.get(slotId);

    if (!component || !slot) {
      console.error(`Component or slot not found: ${componentId}, ${slotId}`);
      return null;
    }

    return this.renderComponentInSlot(component, slot, props);
  }

  /**
   * Check if a component should be rendered in a slot
   */
  private shouldRenderInSlot(
    component: UIComponent,
    slot: UISlot,
    filter?: (component: UIComponent) => boolean
  ): boolean {
    // Check if component has explicit slot list
    if (component.slots && component.slots.length > 0) {
      if (!component.slots.includes(slot.id)) {
        return false;
      }
    }

    // Check custom filter if provided
    if (filter && !filter(component)) {
      return false;
    }

    return true;
  }

  /**
   * Render a component in a slot
   */
  private renderComponentInSlot(
    component: UIComponent,
    slot: UISlot,
    extraProps?: any
  ): any {
    // Create container
    const container = document.createElement("div");
    container.className = "applethub-component";
    container.dataset.componentId = component.id;
    container.dataset.moduleId = component.moduleId;

    // Add to slot
    slot.element.appendChild(container);

    // Merge props
    const props = this.getMergedProps(component, slot, extraProps);

    // Render component
    let instance;
    try {
      instance = component.render(container, props);
    } catch (error) {
      console.error(`Error rendering component ${component.id}:`, error);
      container.innerHTML = `<div class="error">Error rendering component: ${component.id}</div>`;
    }

    // Add to slot components
    slot.components.push({
      component,
      instance,
    });

    return instance;
  }

  /**
   * Remove a component from a slot
   */
  private removeComponentFromSlot(component: UIComponent, slot: UISlot): void {
    // Find component in slot
    const index = slot.components.findIndex(
      (c) => c.component.id === component.id
    );
    if (index === -1) {
      return;
    }

    const { instance } = slot.components[index];

    // Call cleanup if available
    if (component.cleanup) {
      try {
        component.cleanup();
      } catch (error) {
        console.error(`Error cleaning up component ${component.id}:`, error);
      }
    }

    // Remove from DOM
    const componentEl = slot.element.querySelector(
      `[data-component-id="${component.id}"]`
    );
    if (componentEl) {
      slot.element.removeChild(componentEl);
    }

    // Remove from slot components
    slot.components.splice(index, 1);
  }

  /**
   * Get merged props for a component
   */
  private getMergedProps(
    component: UIComponent,
    slot: UISlot,
    extraProps?: any
  ): any {
    // Get default props from metadata
    const metadataProps = component.metadata?.initialProps || {};

    // Get default props from slot
    let slotProps = {};
    try {
      if (slot.element.dataset.defaultProps) {
        slotProps = JSON.parse(slot.element.dataset.defaultProps);
      }
    } catch (error) {
      console.error(`Error parsing default props for slot ${slot.id}:`, error);
    }

    // Merge props
    return {
      ...this.globalProps,
      ...metadataProps,
      ...slotProps,
      ...extraProps,
    };
  }

  /**
   * Scan the DOM for slot elements
   */
  private scanDOMForSlots(): void {
    // Find all elements with data-slot attribute
    const slotElements = document.querySelectorAll("[data-applethub-slot]");

    // Register each slot
    slotElements.forEach((element) => {
      const slotId = element.getAttribute("data-applethub-slot");
      if (slotId) {
        const slotName =
          element.getAttribute("data-applethub-slot-name") || slotId;

        // Get default props if available
        let defaultProps = {};
        const propsAttr = element.getAttribute("data-applethub-slot-props");
        if (propsAttr) {
          try {
            defaultProps = JSON.parse(propsAttr);
          } catch (error) {
            console.error(`Error parsing slot props for ${slotId}:`, error);
          }
        }

        this.registerSlot(slotId, element as HTMLElement, slotName, {
          defaultProps,
        });
      }
    });
  }

  /**
   * Observe the DOM for new slot elements
   */
  private observeDOMForSlots(): void {
    // Create mutation observer
    const observer = new MutationObserver((mutations) => {
      let shouldScan = false;

      // Check if any mutations add elements with data-slot attribute
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          for (const node of Array.from(mutation.addedNodes)) {
            if (node instanceof HTMLElement) {
              if (
                node.hasAttribute("data-applethub-slot") ||
                node.querySelector("[data-applethub-slot]")
              ) {
                shouldScan = true;
                break;
              }
            }
          }
        }

        if (shouldScan) break;
      }

      // Scan for slots if needed
      if (shouldScan) {
        this.scanDOMForSlots();
      }
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}

/**
 * Create a UI system
 */
export function createUISystem(
  client: AppletHubClient,
  moduleManager: ModuleManager
): UISystem {
  return new UISystem(client, moduleManager);
}

// Default export
export default createUISystem;
