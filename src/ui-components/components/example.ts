// ui-components/components/example.ts

// Import the SDK
import { createAppletHub } from '@client-sdk/AppletHubClient';

/**
 * Example of using the UI component library
 */
async function uiComponentsExample() {
  // Create AppletHub client
  const applethub = createAppletHub({
    serverUrl: 'http://localhost:3000',
    autoConnect: true
  });
  
  // Wait for connection
  await new Promise((resolve) => {
    applethub.on('connect', resolve);
  });
  
  // Load UI components module
  await applethub.modules.loadModules(['ui-components']);
  
  // Get the UI Components module
  const uiComponentsModule = applethub.modules.getModule('ui-components');
  if (!uiComponentsModule) {
    console.error('UI Components module not loaded');
    return;
  }
  
  // Access the UI components API
  const { 
    registerComponent, 
    getComponent, 
    getTheme, 
    setTheme, 
    toggleDarkMode 
  } = uiComponentsModule.api;
  
  // Get the UI component service
  const uiComponentService = await applethub.client.call('system.services.getService', {
    id: 'uiComponentService'
  });
  
  // Example 1: Create a button
  const buttonContainer = document.getElementById('button-example');
  if (buttonContainer) {
    const button = uiComponentService.createComponent('button', {
      label: 'Click Me!',
      variant: 'primary',
      onClick: () => alert('Button clicked!')
    });
    
    if (button) {
      buttonContainer.appendChild(button);
    }
  }
  
  // Example 2: Create a card with content
  const cardContainer = document.getElementById('card-example');
  if (cardContainer) {
    const card = uiComponentService.createComponent('card', {
      title: 'Example Card',
      variant: 'primary',
      elevation: 'base'
    });
    
    if (card) {
      // Get the card instance API
      const cardInstance = card.__componentInstance;
      
      // Add content to the card
      cardInstance.addContent(`
        <p>This is an example card with content.</p>
        <p>You can add any HTML content to cards.</p>
      `);
      
      cardContainer.appendChild(card);
    }
  }
  
  // Example 3: Create a form with input
  const formContainer = document.getElementById('form-example');
  if (formContainer) {
    const inputContainer = document.createElement('div');
    const input = uiComponentService.createComponent('text-input', {
      label: 'Your Name',
      placeholder: 'Enter your name...',
      required: true,
      helperText: 'We need your name for personalization',
      onChange: (value) => console.log('Name changed:', value)
    });
    
    if (input) {
      inputContainer.appendChild(input);
      
      // Get input instance API
      const inputInstance = input.__componentInstance;
      
      // Create a submit button
      const button = uiComponentService.createComponent('button', {
        label: 'Submit',
        variant: 'primary',
        onClick: () => {
          const value = inputInstance.getValue();
          if (!value) {
            inputInstance.setError(true, 'Name is required');
          } else {
            inputInstance.setError(false, 'Looks good!');
            alert(`Hello, ${value}!`);
          }
        }
      });
      
      if (button) {
        inputContainer.appendChild(button);
      }
      
      formContainer.appendChild(inputContainer);
    }
  }
  
  // Example 4: Create a grid layout
  const gridContainer = document.getElementById('grid-example');
  if (gridContainer) {
    const grid = uiComponentService.createComponent('grid', {
      columns: 3,
      gap: 'md'
    });
    
    if (grid) {
      // Create grid items
      for (let i = 1; i <= 6; i++) {
        const item = uiComponentService.createComponent('grid-item');
        if (item) {
          // Add card to grid item
          const card = uiComponentService.createComponent('card', {
            title: `Item ${i}`,
            padding: true
          });
          
          if (card) {
            const cardInstance = card.__componentInstance;
            cardInstance.addContent(`<p>Grid item ${i} content</p>`);
            item.appendChild(card);
          }
          
          grid.appendChild(item);
        }
      }
      
      gridContainer.appendChild(grid);
    }
  }
  
  // Example 5: Theme control
  const themeContainer = document.getElementById('theme-example');
  if (themeContainer) {
    // Create theme controls
    const controls = document.createElement('div');
    controls.className = 'theme-controls';
    
    // Get current theme
    const theme = getTheme();
    
    // Display current theme
    const themeInfo = document.createElement('pre');
    themeInfo.textContent = JSON.stringify(theme, null, 2);
    controls.appendChild(themeInfo);
    
    // Create dark mode toggle
    const darkModeToggle = uiComponentService.createComponent('button', {
      label: theme.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      variant: 'secondary',
      onClick: () => {
        toggleDarkMode();
        darkModeToggle.__componentInstance.setLabel(
          theme.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'
        );
      }
    });
    
    if (darkModeToggle) {
      controls.appendChild(darkModeToggle);
    }
    
    themeContainer.appendChild(controls);
  }
  
  // Example 6: Register a custom component
  registerComponent({
    id: 'custom-alert',
    name: 'Custom Alert',
    description: 'Custom alert component with different severity levels',
    category: 'feedback',
    defaultProps: {
      title: 'Alert',
      message: '',
      severity: 'info' // info, success, warning, error
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
        background-color: #fff3e0;
        border-left: 4px solid var(--color-warning);
      }
      
      .custom-alert-error {
        background-color: #ffebee;
        border-left: 4px solid var(--color-error);
      }
    `
  });
  
  // Create example alerts
  const alertContainer = document.getElementById('alert-example');
  if (alertContainer) {
    const severities = ['info', 'success', 'warning', 'error'];
    
    severities.forEach(severity => {
      const alert = uiComponentService.createComponent('custom-alert', {
        title: `${severity.charAt(0).toUpperCase() + severity.slice(1)} Alert`,
        message: `This is an example ${severity} alert message.`,
        severity
      });
      
      if (alert) {
        alertContainer.appendChild(alert);
      }
    });
  }
}

// Export the example function
export { uiComponentsExample };