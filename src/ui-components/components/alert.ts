// ui-components/components/alert.ts
import { UIComponentDefinition } from "../services/UIComponentService";

/**
 * Alert component
 */
export const alertComponent: UIComponentDefinition = {
  id: "alert",
  name: "Alert",
  description: "Alert component for showing important messages",
  category: "feedback",
  defaultProps: {
    title: "",
    message: "",
    severity: "info", // info, success, warning, error
    dismissible: false,
    onDismiss: null,
    icon: true,
  },
  template: (props) => {
    const { title, message, severity, dismissible, icon } = props;
    
    const iconMap: Record<string, string> = {
      info: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
      </svg>`,
      success: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
      </svg>`,
      warning: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM7 6.5C7 5.672 7.448 5 8 5s1 .672 1 1.5v2C9 9.328 8.552 10 8 10s-1-.672-1-1.5v-2zm1.5 5.8a1.001 1.001 0 0 1-1.5-1.3 1.001 1.001 0 0 1 1.5-1.3 1.001 1.001 0 0 1 0 2.6z"/>
      </svg>`,
      error: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7z"/>
      </svg>`,
    };
    
    const closeButton = dismissible 
      ? `<button type="button" class="ah-alert-close" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>` 
      : '';
    
    const iconElement = icon ? `<div class="ah-alert-icon">${iconMap[severity] || iconMap.info}</div>` : '';
    
    return `
      <div class="ah-alert ah-alert-${severity}" role="alert">
        ${iconElement}
        <div class="ah-alert-content">
          ${title ? `<div class="ah-alert-title">${title}</div>` : ''}
          ${message ? `<div class="ah-alert-message">${message}</div>` : ''}
        </div>
        ${closeButton}
      </div>
    `;
  },
  init: (element, props) => {
    const alertElement = element.querySelector(".ah-alert");
    const closeButton = element.querySelector(".ah-alert-close");
    
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        // Hide the alert
        if (alertElement) {
          alertElement.classList.add("ah-alert-dismissed");
        }
        
        // Call onDismiss callback
        if (typeof props.onDismiss === "function") {
          props.onDismiss();
        }
      });
    }
    
    // Set the alert message
    const setMessage = (message: string) => {
      const messageElement = element.querySelector(".ah-alert-message");
      if (messageElement) {
        messageElement.textContent = message;
      }
    };
    
    // Set the alert title
    const setTitle = (title: string) => {
      let titleElement = element.querySelector(".ah-alert-title");
      const contentElement = element.querySelector(".ah-alert-content");
      
      if (!titleElement && title && contentElement) {
        // Create title element if it doesn't exist
        titleElement = document.createElement("div");
        titleElement.className = "ah-alert-title";
        contentElement.prepend(titleElement);
      }
      
      if (titleElement) {
        titleElement.textContent = title;
      }
    };
    
    // Set the alert severity
    const setSeverity = (severity: string) => {
      if (alertElement) {
        // Remove existing severity classes
        alertElement.classList.remove("ah-alert-info", "ah-alert-success", "ah-alert-warning", "ah-alert-error");
        
        // Add new severity class
        alertElement.classList.add(`ah-alert-${severity}`);
      }
    };
    
    // Show the alert (if it was dismissed)
    const show = () => {
      if (alertElement) {
        alertElement.classList.remove("ah-alert-dismissed");
      }
    };
    
    // Hide the alert
    const hide = () => {
      if (alertElement) {
        alertElement.classList.add("ah-alert-dismissed");
      }
    };
    
    return {
      setMessage,
      setTitle,
      setSeverity,
      show,
      hide,
    };
  },
  styles: `
    .ah-alert {
      display: flex;
      padding: var(--spacing-md, 1rem);
      border-radius: var(--border-radius-base, 0.375rem);
      margin-bottom: var(--spacing-md, 1rem);
      transition: opacity 0.3s ease-in-out;
    }
    
    .ah-alert-icon {
      display: flex;
      align-items: flex-start;
      margin-right: var(--spacing-sm, 0.5rem);
    }
    
    .ah-alert-content {
      flex: 1;
    }
    
    .ah-alert-title {
      font-weight: bold;
      margin-bottom: var(--spacing-xs, 0.25rem);
    }
    
    .ah-alert-close {
      background: transparent;
      border: none;
      padding: 0;
      cursor: pointer;
      opacity: 0.5;
      transition: opacity 0.2s ease-in-out;
      margin-left: var(--spacing-xs, 0.25rem);
    }
    
    .ah-alert-close:hover {
      opacity: 1;
    }
    
    .ah-alert-dismissed {
      opacity: 0;
      pointer-events: none;
    }
    
    /* Severity styles */
    .ah-alert-info {
      background-color: #e3f2fd;
      border-left: 4px solid var(--color-info, #17a2b8);
      color: #04414d;
    }
    
    .ah-alert-success {
      background-color: #e8f5e9;
      border-left: 4px solid var(--color-success, #28a745);
      color: #0d5323;
    }
    
    .ah-alert-warning {
      background-color: #fff8e1;
      border-left: 4px solid var(--color-warning, #ffc107);
      color: #7a5d00;
    }
    
    .ah-alert-error {
      background-color: #ffebee;
      border-left: 4px solid var(--color-error, #dc3545);
      color: #7c151f;
    }
  `,
};

/**
 * Custom Alert component (as referenced in example.ts)
 */
export const customAlertComponent: UIComponentDefinition = {
  id: "custom-alert",
  name: "Custom Alert",
  description: "Custom alert component with different severity levels",
  category: "feedback",
  defaultProps: {
    title: "Alert",
    message: "",
    severity: "info", // info, success, warning, error
  },
  template: (props) => {
    const { title, message, severity } = props;
    
    return `
      <div class="custom-alert custom-alert-${severity}">
        <div class="custom-alert-title">${title}</div>
        ${message ? `<div class="custom-alert-message">${message}</div>` : ''}
      </div>
    `;
  },
  styles: `
    .custom-alert {
      padding: var(--spacing-md);
      border-radius: var(--border-radius-base);
      margin-bottom: var(--spacing-md);
    }
    
    .custom-alert-title {
      font-weight: bold;
      margin-bottom: 0.25rem;
    }
    
    .custom-alert-info {
      background-color: #e3f2fd;
      border-left: 4px solid var(--color-info);
    }
    
    .custom-alert-success {
      background-color: #e8f5e9;
      border-left: 4px solid var(--color-success);
    }
    
    .custom-alert-warning {
      background-color: #fff8e1;
      border-left: 4px solid var(--color-warning);
    }
    
    .custom-alert-error {
      background-color: #ffebee;
      border-left: 4px solid var(--color-error);
    }
  `,
};