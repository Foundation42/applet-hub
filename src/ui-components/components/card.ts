// ui-components/components/card.ts
import { UIComponentDefinition } from "../services/UIComponentService";

/**
 * Card component
 */
export const cardComponent: UIComponentDefinition = {
  id: "card",
  name: "Card",
  description: "Standard card component",
  category: "layout",
  hasChildren: true,
  defaultProps: {
    title: "",
    variant: "default",
    elevation: "base",
    padding: true,
  },
  template: (props) => {
    const { title, variant, elevation, padding } = props;

    const variantClass = variant ? `ah-card-${variant}` : "ah-card-default";
    const elevationClass = elevation
      ? `ah-elevation-${elevation}`
      : "ah-elevation-base";
    const paddingClass = padding ? "ah-card-padding" : "";

    // Title section
    const titleSection = title
      ? `
      <div class="ah-card-header">
        <h3 class="ah-card-title">${title}</h3>
      </div>
    `
      : "";

    return `
      <div class="ah-card ${variantClass} ${elevationClass} ${paddingClass}">
        ${titleSection}
        <div class="ah-card-content"></div>
      </div>
    `;
  },
  init: (element, props) => {
    // We'll return an API for card operations
    return {
      setTitle: (title) => {
        let headerEl = element.querySelector(".ah-card-header");
        let titleEl = element.querySelector(".ah-card-title");

        if (title) {
          if (!headerEl) {
            headerEl = document.createElement("div");
            headerEl.className = "ah-card-header";
            element
              .querySelector(".ah-card")
              .insertBefore(
                headerEl,
                element.querySelector(".ah-card-content")
              );
          }

          if (!titleEl) {
            titleEl = document.createElement("h3");
            titleEl.className = "ah-card-title";
            headerEl.appendChild(titleEl);
          }

          titleEl.textContent = title;
        } else {
          // Remove title if exists
          if (headerEl) {
            headerEl.remove();
          }
        }
      },

      addContent: (content) => {
        const contentEl = element.querySelector(".ah-card-content");
        if (contentEl) {
          if (typeof content === "string") {
            contentEl.innerHTML = content;
          } else if (content instanceof HTMLElement) {
            contentEl.appendChild(content);
          }
        }
      },

      clearContent: () => {
        const contentEl = element.querySelector(".ah-card-content");
        if (contentEl) {
          contentEl.innerHTML = "";
        }
      },
    };
  },
  styles: `
    .ah-card {
      background-color: var(--color-surface);
      border-radius: var(--border-radius-base);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .ah-card-padding {
      padding: var(--spacing-md);
    }
    
    .ah-card-header {
      margin-bottom: var(--spacing-md);
    }
    
    .ah-card-title {
      margin: 0;
      font-size: var(--font-size-large);
      font-weight: 600;
      color: var(--color-text);
    }
    
    .ah-card-content {
      flex: 1;
    }
    
    /* Variants */
    .ah-card-default {
      border: 1px solid var(--color-border);
    }
    
    .ah-card-primary {
      border-top: 4px solid var(--color-primary);
    }
    
    .ah-card-outlined {
      border: 1px solid var(--color-border);
      box-shadow: none;
    }
    
    /* Elevations */
    .ah-elevation-none {
      box-shadow: none;
    }
    
    .ah-elevation-small {
      box-shadow: var(--shadow-small);
    }
    
    .ah-elevation-base {
      box-shadow: var(--shadow-base);
    }
    
    .ah-elevation-large {
      box-shadow: var(--shadow-large);
    }
  `,
};

/**
 * Action Card component
 */
export const actionCardComponent: UIComponentDefinition = {
  id: "action-card",
  name: "Action Card",
  description: "Card with actions in the footer",
  category: "layout",
  hasChildren: true,
  defaultProps: {
    title: "",
    variant: "default",
    elevation: "base",
    padding: true,
    actions: [],
  },
  template: (props) => {
    const { title, variant, elevation, padding, actions } = props;

    const variantClass = variant ? `ah-card-${variant}` : "ah-card-default";
    const elevationClass = elevation
      ? `ah-elevation-${elevation}`
      : "ah-elevation-base";
    const paddingClass = padding ? "ah-card-padding" : "";

    // Title section
    const titleSection = title
      ? `
      <div class="ah-card-header">
        <h3 class="ah-card-title">${title}</h3>
      </div>
    `
      : "";

    // Actions section
    let actionsSection = "";
    if (actions && actions.length > 0) {
      const actionButtons = actions
        .map((action) => {
          const variantClass = action.variant
            ? `ah-button-${action.variant}`
            : "ah-button-text";
          return `<button class="ah-button ${variantClass} ah-button-small" data-action="${action.id}">${action.label}</button>`;
        })
        .join("");

      actionsSection = `
        <div class="ah-card-actions">
          ${actionButtons}
        </div>
      `;
    }

    return `
      <div class="ah-card ${variantClass} ${elevationClass} ${paddingClass}">
        ${titleSection}
        <div class="ah-card-content"></div>
        ${actionsSection}
      </div>
    `;
  },
  init: (element, props) => {
    // Set up action handlers
    if (props.actions && props.actions.length > 0) {
      props.actions.forEach((action) => {
        const button = element.querySelector(`[data-action="${action.id}"]`);
        if (button && action.onClick) {
          button.addEventListener("click", action.onClick);
        }
      });
    }

    // Return the same API as card but with action management
    return {
      setTitle: (title) => {
        let headerEl = element.querySelector(".ah-card-header");
        let titleEl = element.querySelector(".ah-card-title");

        if (title) {
          if (!headerEl) {
            headerEl = document.createElement("div");
            headerEl.className = "ah-card-header";
            element
              .querySelector(".ah-card")
              .insertBefore(
                headerEl,
                element.querySelector(".ah-card-content")
              );
          }

          if (!titleEl) {
            titleEl = document.createElement("h3");
            titleEl.className = "ah-card-title";
            headerEl.appendChild(titleEl);
          }

          titleEl.textContent = title;
        } else {
          // Remove title if exists
          if (headerEl) {
            headerEl.remove();
          }
        }
      },

      addContent: (content) => {
        const contentEl = element.querySelector(".ah-card-content");
        if (contentEl) {
          if (typeof content === "string") {
            contentEl.innerHTML = content;
          } else if (content instanceof HTMLElement) {
            contentEl.appendChild(content);
          }
        }
      },

      clearContent: () => {
        const contentEl = element.querySelector(".ah-card-content");
        if (contentEl) {
          contentEl.innerHTML = "";
        }
      },

      setActions: (actions) => {
        let actionsEl = element.querySelector(".ah-card-actions");

        // Clear existing actions
        if (actionsEl) {
          // Remove event listeners
          const buttons = actionsEl.querySelectorAll("button");
          buttons.forEach((button) => {
            button.removeEventListener("click", (button as any).onclick);
          });

          actionsEl.innerHTML = "";
        } else {
          // Create actions container
          actionsEl = document.createElement("div");
          actionsEl.className = "ah-card-actions";
          element.querySelector(".ah-card").appendChild(actionsEl);
        }

        // Add new actions
        if (actions && actions.length > 0) {
          actions.forEach((action) => {
            const variantClass = action.variant
              ? `ah-button-${action.variant}`
              : "ah-button-text";
            const button = document.createElement("button");
            button.className = `ah-button ${variantClass} ah-button-small`;
            button.setAttribute("data-action", action.id);
            button.textContent = action.label;

            if (action.onClick) {
              button.addEventListener("click", action.onClick);
            }

            actionsEl.appendChild(button);
          });
        }
      },
    };
  },
  cleanup: (element) => {
    // Remove event listeners from action buttons
    const buttons = element.querySelectorAll(".ah-card-actions button");
    buttons.forEach((button) => {
      button.removeEventListener("click", (button as any).onclick);
    });
  },
  styles: `
    .ah-card {
      background-color: var(--color-surface);
      border-radius: var(--border-radius-base);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .ah-card-padding {
      padding: var(--spacing-md);
    }
    
    .ah-card-header {
      margin-bottom: var(--spacing-md);
    }
    
    .ah-card-title {
      margin: 0;
      font-size: var(--font-size-large);
      font-weight: 600;
      color: var(--color-text);
    }
    
    .ah-card-content {
      flex: 1;
    }
    
    .ah-card-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--color-border);
    }
    
    /* Variants and elevations are the same as card component */
  `,
};
