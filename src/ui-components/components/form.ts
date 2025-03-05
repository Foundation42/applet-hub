// ui-components/components/form.ts
import { UIComponentDefinition } from "../services/UIComponentService";

/**
 * Form component
 */
export const formComponent: UIComponentDefinition = {
  id: "form",
  name: "Form",
  description: "Form container with validation support",
  category: "input",
  hasChildren: true,
  defaultProps: {
    id: "",
    onSubmit: null,
    autoComplete: "off",
    validateOnSubmit: true,
    validateOnChange: false,
    resetOnSubmit: false,
  },
  template: (props) => {
    const { id, autoComplete } = props;
    return `
      <form id="${id || ''}" class="ah-form" autocomplete="${autoComplete}" novalidate>
        <div class="ah-form-content"></div>
      </form>
    `;
  },
  init: (element, props) => {
    const formElement = element.querySelector("form") as HTMLFormElement;
    const contentContainer = element.querySelector(".ah-form-content") as HTMLElement;
    
    let formValues: Record<string, any> = {};
    const formControls: Record<string, any> = {};
    
    // Handle form submission
    formElement.addEventListener("submit", (event) => {
      event.preventDefault();
      
      // Validate if needed
      if (props.validateOnSubmit) {
        const isValid = validate();
        if (!isValid) return;
      }
      
      // Call onSubmit callback
      if (typeof props.onSubmit === "function") {
        props.onSubmit(formValues);
      }
      
      // Reset if configured
      if (props.resetOnSubmit) {
        reset();
      }
    });
    
    // Validate all form controls
    const validate = () => {
      let isValid = true;
      
      Object.values(formControls).forEach((control) => {
        if (typeof control.validate === "function") {
          const controlValid = control.validate();
          if (!controlValid) isValid = false;
        }
      });
      
      return isValid;
    };
    
    // Reset all form controls
    const reset = () => {
      Object.values(formControls).forEach((control) => {
        if (typeof control.reset === "function") {
          control.reset();
        }
      });
      
      formValues = {};
    };
    
    // Register form controls
    const registerControl = (name: string, control: any) => {
      formControls[name] = control;
      
      // Listen for value changes
      if (typeof control.getValue === "function" && typeof control.onChange === "function") {
        const originalOnChange = control.onChange;
        
        control.onChange = (value: any) => {
          // Update form values
          formValues[name] = value;
          
          // Call original handler
          if (originalOnChange) {
            originalOnChange(value);
          }
          
          // Validate if configured
          if (props.validateOnChange && typeof control.validate === "function") {
            control.validate();
          }
        };
      }
      
      return control;
    };
    
    // Add content to the form
    const addContent = (content: string | HTMLElement) => {
      if (typeof content === "string") {
        contentContainer.innerHTML += content;
      } else {
        contentContainer.appendChild(content);
      }
    };
    
    // Get current form values
    const getValues = () => {
      return { ...formValues };
    };
    
    // Set form values
    const setValues = (values: Record<string, any>) => {
      Object.entries(values).forEach(([name, value]) => {
        formValues[name] = value;
        
        const control = formControls[name];
        if (control && typeof control.setValue === "function") {
          control.setValue(value);
        }
      });
    };
    
    return {
      addContent,
      registerControl,
      validate,
      reset,
      getValues,
      setValues,
    };
  },
  cleanup: (element) => {
    const formElement = element.querySelector("form");
    if (formElement) {
      // Remove event listeners
      formElement.replaceWith(formElement.cloneNode(true));
    }
  },
  styles: `
    .ah-form {
      width: 100%;
    }
    
    .ah-form-content {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md, 1rem);
    }
    
    .ah-form-group {
      margin-bottom: var(--spacing-md, 1rem);
    }
  `,
};

/**
 * Form Field component
 */
export const formFieldComponent: UIComponentDefinition = {
  id: "form-field",
  name: "Form Field",
  description: "Form field with label and validation",
  category: "input",
  hasChildren: true,
  defaultProps: {
    label: "",
    required: false,
    helperText: "",
    error: "",
  },
  template: (props) => {
    const { label, required, helperText, error } = props;
    const hasError = error && error.length > 0;
    
    return `
      <div class="ah-form-field ${hasError ? 'ah-form-field-error' : ''}">
        ${label ? `<label class="ah-form-field-label">${label}${required ? ' <span class="ah-required">*</span>' : ''}</label>` : ''}
        <div class="ah-form-field-input"></div>
        <div class="ah-form-field-helper ${hasError ? 'ah-form-field-error-text' : ''}">${hasError ? error : helperText}</div>
      </div>
    `;
  },
  init: (element, props) => {
    const inputContainer = element.querySelector(".ah-form-field-input") as HTMLElement;
    const helperTextElement = element.querySelector(".ah-form-field-helper") as HTMLElement;
    
    // Add content (usually input elements)
    const addContent = (content: string | HTMLElement) => {
      if (typeof content === "string") {
        inputContainer.innerHTML += content;
      } else {
        inputContainer.appendChild(content);
      }
    };
    
    // Set error state
    const setError = (error: string | boolean) => {
      const fieldElement = element.querySelector(".ah-form-field") as HTMLElement;
      
      if (error) {
        fieldElement.classList.add("ah-form-field-error");
        helperTextElement.classList.add("ah-form-field-error-text");
        helperTextElement.textContent = typeof error === "string" ? error : props.helperText;
      } else {
        fieldElement.classList.remove("ah-form-field-error");
        helperTextElement.classList.remove("ah-form-field-error-text");
        helperTextElement.textContent = props.helperText;
      }
    };
    
    return {
      addContent,
      setError,
    };
  },
  styles: `
    .ah-form-field {
      display: flex;
      flex-direction: column;
      margin-bottom: var(--spacing-md, 1rem);
    }
    
    .ah-form-field-label {
      font-weight: 500;
      margin-bottom: var(--spacing-xs, 0.25rem);
    }
    
    .ah-required {
      color: var(--color-error, #dc3545);
    }
    
    .ah-form-field-helper {
      font-size: var(--font-size-small, 0.875rem);
      color: var(--color-text-secondary, #6c757d);
      margin-top: var(--spacing-xs, 0.25rem);
    }
    
    .ah-form-field-error-text {
      color: var(--color-error, #dc3545);
    }
    
    .ah-form-field-error .ah-component-text-input input {
      border-color: var(--color-error, #dc3545);
    }
  `,
};