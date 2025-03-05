// ui-components/components/button.ts
import { UIComponentDefinition } from "../services/UIComponentService";

/**
 * Button component
 */
export const buttonComponent: UIComponentDefinition = {
  id: "button",
  name: "Button",
  description: "Standard button component",
  category: "input",
  defaultProps: {
    label: "Button",
    variant: "primary",
    size: "medium",
    disabled: false,
    onClick: null,
  },
  template: (props) => {
    const { label, variant, size, disabled } = props;

    const variantClass = variant ? `ah-button-${variant}` : "ah-button-primary";
    const sizeClass = size ? `ah-button-${size}` : "ah-button-medium";
    const disabledAttr = disabled ? "disabled" : "";

    return `
      <button class="ah-button ${variantClass} ${sizeClass}" ${disabledAttr}>
        ${label}
      </button>
    `;
  },
  init: (element, props) => {
    const button = element.querySelector(".ah-button");
    if (button && props.onClick) {
      button.addEventListener("click", props.onClick);
    }

    return {
      setLabel: (label) => {
        if (button) {
          button.textContent = label;
        }
      },
      setDisabled: (disabled) => {
        if (button) {
          if (disabled) {
            button.setAttribute("disabled", "");
          } else {
            button.removeAttribute("disabled");
          }
        }
      },
    };
  },
  cleanup: (element) => {
    const button = element.querySelector(".ah-button");
    if (button) {
      button.removeEventListener("click", (button as any).onclick);
    }
  },
  styles: `
    .ah-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: var(--border-radius-base, 0.375rem);
      font-family: var(--font-family, system-ui, sans-serif);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      appearance: button;
      padding: 0.5rem 1rem;
    }
    
    .ah-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    /* Variants */
    .ah-button-primary {
      background-color: var(--color-primary, #4a63e6);
      color: white;
    }
    
    .ah-button-primary:hover:not(:disabled) {
      background-color: color-mix(in srgb, var(--color-primary, #4a63e6) 90%, black);
    }
    
    .ah-button-secondary {
      background-color: var(--color-secondary, #6c757d);
      color: white;
    }
    
    .ah-button-secondary:hover:not(:disabled) {
      background-color: color-mix(in srgb, var(--color-secondary, #6c757d) 90%, black);
    }
    
    .ah-button-outline {
      background-color: transparent;
      color: var(--color-primary, #4a63e6);
      border: 1px solid var(--color-primary, #4a63e6);
    }
    
    .ah-button-outline:hover:not(:disabled) {
      background-color: color-mix(in srgb, var(--color-primary, #4a63e6) 10%, transparent);
    }
    
    .ah-button-text {
      background-color: transparent;
      color: var(--color-primary, #4a63e6);
    }
    
    .ah-button-text:hover:not(:disabled) {
      background-color: color-mix(in srgb, var(--color-primary, #4a63e6) 10%, transparent);
    }
    
    /* Sizes */
    .ah-button-small {
      padding: 0.25rem 0.5rem;
      font-size: var(--font-size-small, 0.875rem);
    }
    
    .ah-button-medium {
      padding: 0.5rem 1rem;
      font-size: var(--font-size-base, 1rem);
    }
    
    .ah-button-large {
      padding: 0.75rem 1.5rem;
      font-size: var(--font-size-large, 1.25rem);
    }
  `,
};

/**
 * Icon Button component
 */
export const iconButtonComponent: UIComponentDefinition = {
  id: "icon-button",
  name: "Icon Button",
  description: "Button with an icon",
  category: "input",
  defaultProps: {
    icon: "circle",
    variant: "primary",
    size: "medium",
    disabled: false,
    ariaLabel: "Button",
    onClick: null,
  },
  template: (props) => {
    const { icon, variant, size, disabled, ariaLabel } = props;

    const variantClass = variant
      ? `ah-icon-button-${variant}`
      : "ah-icon-button-primary";
    const sizeClass = size ? `ah-icon-button-${size}` : "ah-icon-button-medium";
    const disabledAttr = disabled ? "disabled" : "";

    return `
      <button class="ah-icon-button ${variantClass} ${sizeClass}" ${disabledAttr} aria-label="${ariaLabel}">
        <span class="ah-icon ah-icon-${icon}"></span>
      </button>
    `;
  },
  init: (element, props) => {
    const button = element.querySelector(".ah-icon-button");
    if (button && props.onClick) {
      button.addEventListener("click", props.onClick);
    }
  },
  cleanup: (element) => {
    const button = element.querySelector(".ah-icon-button");
    if (button) {
      button.removeEventListener("click", (button as any).onclick);
    }
  },
  styles: `
    .ah-icon-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: var(--border-radius-full, 9999px);
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      appearance: button;
    }
    
    .ah-icon-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    /* Variants */
    .ah-icon-button-primary {
      background-color: var(--color-primary, #4a63e6);
      color: white;
    }
    
    .ah-icon-button-primary:hover:not(:disabled) {
      background-color: color-mix(in srgb, var(--color-primary, #4a63e6) 90%, black);
    }
    
    .ah-icon-button-secondary {
      background-color: var(--color-secondary, #6c757d);
      color: white;
    }
    
    .ah-icon-button-outline {
      background-color: transparent;
      color: var(--color-primary, #4a63e6);
      border: 1px solid var(--color-primary, #4a63e6);
    }
    
    .ah-icon-button-text {
      background-color: transparent;
      color: var(--color-primary, #4a63e6);
    }
    
    /* Sizes */
    .ah-icon-button-small {
      width: 2rem;
      height: 2rem;
      min-width: 2rem;
      min-height: 2rem;
    }
    
    .ah-icon-button-medium {
      width: 2.5rem;
      height: 2.5rem;
      min-width: 2.5rem;
      min-height: 2.5rem;
    }
    
    .ah-icon-button-large {
      width: 3rem;
      height: 3rem;
      min-width: 3rem;
      min-height: 3rem;
    }
    
    /* Icons */
    .ah-icon {
      width: 1.25em;
      height: 1.25em;
      display: inline-block;
      line-height: 1;
    }
  `,
};
