// ui-components/components/input.ts
import { UIComponentDefinition } from "../services/UIComponentService";

/**
 * Text Input component
 */
export const textInputComponent: UIComponentDefinition = {
  id: "text-input",
  name: "Text Input",
  description: "Standard text input field",
  category: "input",
  defaultProps: {
    type: "text",
    label: "",
    placeholder: "",
    value: "",
    disabled: false,
    required: false,
    helperText: "",
    error: false,
    onChange: null,
  },
  template: (props) => {
    const {
      type,
      label,
      placeholder,
      value,
      disabled,
      required,
      helperText,
      error,
    } = props;

    const disabledAttr = disabled ? "disabled" : "";
    const requiredAttr = required ? "required" : "";
    const errorClass = error ? "ah-input-error" : "";
    const id = `input-${Math.random().toString(36).substring(2, 11)}`;

    // Label HTML if provided
    const labelHtml = label
      ? `<label class="ah-input-label" for="${id}">${label}${
          required ? " *" : ""
        }</label>`
      : "";

    // Helper text HTML if provided
    const helperHtml = helperText
      ? `<div class="ah-input-helper ${errorClass}">${helperText}</div>`
      : "";

    return `
      <div class="ah-input-container ${errorClass}">
        ${labelHtml}
        <input
          id="${id}"
          type="${type}"
          class="ah-input ${errorClass}"
          placeholder="${placeholder}"
          value="${value}"
          ${disabledAttr}
          ${requiredAttr}
        />
        ${helperHtml}
      </div>
    `;
  },
  init: (element, props) => {
    const input = element.querySelector("input");

    if (input && props.onChange) {
      input.addEventListener("input", (e) => {
        props.onChange((e.target as HTMLInputElement).value, e);
      });
    }

    // Return API for component
    return {
      getValue: () => (input ? (input as HTMLInputElement).value : ""),
      setValue: (value) => {
        if (input) (input as HTMLInputElement).value = value;
      },
      setDisabled: (disabled) => {
        if (input) {
          if (disabled) input.setAttribute("disabled", "");
          else input.removeAttribute("disabled");
        }
      },
      setError: (error, helperText) => {
        const container = element.querySelector(".ah-input-container");
        const inputEl = element.querySelector(".ah-input");
        const helperEl = element.querySelector(".ah-input-helper");

        if (container && inputEl) {
          if (error) {
            container.classList.add("ah-input-error");
            inputEl.classList.add("ah-input-error");
          } else {
            container.classList.remove("ah-input-error");
            inputEl.classList.remove("ah-input-error");
          }
        }

        if (helperEl && helperText !== undefined) {
          helperEl.textContent = helperText;
        }
      },
      focus: () => {
        if (input) input.focus();
      },
    };
  },
  cleanup: (element) => {
    const input = element.querySelector("input");
    if (input) {
      input.removeEventListener("input", (input as any).oninput);
    }
  },
  styles: `
    .ah-input-container {
      display: flex;
      flex-direction: column;
      margin-bottom: var(--spacing-md);
    }
    
    .ah-input-label {
      font-size: var(--font-size-small);
      font-weight: 500;
      margin-bottom: var(--spacing-xs);
      color: var(--color-text);
    }
    
    .ah-input {
      font-family: var(--font-family);
      font-size: var(--font-size-base);
      padding: var(--spacing-sm) var(--spacing-md);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-base);
      background-color: var(--color-background);
      color: var(--color-text);
      transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }
    
    .ah-input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(74, 99, 230, 0.3);
    }
    
    .ah-input:disabled {
      background-color: #f5f5f5;
      color: var(--color-textSecondary);
      cursor: not-allowed;
    }
    
    .ah-input-helper {
      font-size: var(--font-size-small);
      color: var(--color-textSecondary);
      margin-top: var(--spacing-xs);
    }
    
    .ah-input-error.ah-input {
      border-color: var(--color-error);
    }
    
    .ah-input-error.ah-input:focus {
      box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.3);
    }
    
    .ah-input-error.ah-input-helper {
      color: var(--color-error);
    }
  `,
};
