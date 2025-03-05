// ui-test-app/components/main-view.ts
import { UIComponentDefinition } from '../../../ui-components/services/UIComponentService';

/**
 * Main view component for Ui Test App
 */
export const mainViewComponent: UIComponentDefinition = {
  id: 'ui-test-app-main-view',
  name: 'Ui Test App Main View',
  description: 'Main view for Ui Test App',
  category: 'display',
  defaultProps: {
    title: 'UI Components Test App',
  },
  template: (props) => {
    const { title } = props;
    
    return '<div class="ui-test-app-main-view">' +
             '<h2 class="ui-test-app-title">' + title + '</h2>' +
             '<div class="ui-test-app-content">' +
               '<div class="ui-test-section">' +
                 '<h3>Button Components</h3>' +
                 '<div id="button-container" class="component-test-container"></div>' +
               '</div>' +
               '<div class="ui-test-section">' +
                 '<h3>Alert Components</h3>' +
                 '<div id="alert-container" class="component-test-container"></div>' +
               '</div>' +
               '<div class="ui-test-section">' +
                 '<h3>Form Components</h3>' +
                 '<div id="form-container" class="component-test-container"></div>' +
               '</div>' +
               '<div class="ui-test-section">' +
                 '<h3>Card Components</h3>' +
                 '<div id="card-container" class="component-test-container"></div>' +
               '</div>' +
               '<div class="ui-test-section">' +
                 '<h3>Layout Components</h3>' +
                 '<div id="layout-container" class="component-test-container"></div>' +
               '</div>' +
               '<div class="ui-test-section">' +
                 '<h3>Component Log</h3>' +
                 '<div id="log-container" class="log-container"></div>' +
               '</div>' +
             '</div>' +
           '</div>';
  },
  init: (element, props) => {
    console.log('UI Components Test App initialized');
    
    // Helper function to log messages
    const logMessage = (message) => {
      const logContainer = element.querySelector('#log-container');
      if (logContainer) {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = '> ' + message;
        logContainer.appendChild(logEntry);
        console.log(message);
      }
    };
    
    // Get UI Component Service
    const uiService = window.AppletHub?.services?.uiComponentService;
    if (!uiService) {
      logMessage('ERROR: UI Component Service not available');
      return;
    }
    
    logMessage('UI Component Service found');
    
    // Test button components
    const buttonContainer = element.querySelector('#button-container');
    if (buttonContainer) {
      try {
        // Create primary button
        const primaryButton = uiService.createComponent('button', {
          label: 'Primary Button',
          variant: 'primary',
          onClick: () => logMessage('Primary button clicked')
        });
        
        // Create secondary button
        const secondaryButton = uiService.createComponent('button', {
          label: 'Secondary Button',
          variant: 'secondary',
          onClick: () => logMessage('Secondary button clicked')
        });
        
        // Create outline button
        const outlineButton = uiService.createComponent('button', {
          label: 'Outline Button',
          variant: 'outline',
          onClick: () => logMessage('Outline button clicked')
        });
        
        // Create text button
        const textButton = uiService.createComponent('button', {
          label: 'Text Button',
          variant: 'text',
          onClick: () => logMessage('Text button clicked')
        });
        
        // Add buttons to container
        buttonContainer.appendChild(primaryButton);
        buttonContainer.appendChild(document.createTextNode(' '));
        buttonContainer.appendChild(secondaryButton);
        buttonContainer.appendChild(document.createTextNode(' '));
        buttonContainer.appendChild(outlineButton);
        buttonContainer.appendChild(document.createTextNode(' '));
        buttonContainer.appendChild(textButton);
        
        logMessage('Button components created successfully');
      } catch (error) {
        logMessage('Error creating button components: ' + error.message);
      }
    }
    
    // Test alert components
    const alertContainer = element.querySelector('#alert-container');
    if (alertContainer) {
      try {
        // Create different alert types
        const infoAlert = uiService.createComponent('alert', {
          type: 'info',
          message: 'This is an information message.'
        });
        
        const successAlert = uiService.createComponent('alert', {
          type: 'success',
          message: 'Operation completed successfully!'
        });
        
        const warningAlert = uiService.createComponent('alert', {
          type: 'warning',
          message: 'Warning: This action cannot be undone.'
        });
        
        const errorAlert = uiService.createComponent('alert', {
          type: 'error',
          message: 'Error: Something went wrong.'
        });
        
        // Add alerts to container
        alertContainer.appendChild(infoAlert);
        alertContainer.appendChild(successAlert);
        alertContainer.appendChild(warningAlert);
        alertContainer.appendChild(errorAlert);
        
        logMessage('Alert components created successfully');
      } catch (error) {
        logMessage('Error creating alert components: ' + error.message);
      }
    }
    
    // Test form components
    const formContainer = element.querySelector('#form-container');
    if (formContainer) {
      try {
        // Create a text input
        const textInput = uiService.createComponent('text-input', {
          label: 'Name',
          placeholder: 'Enter your name',
          onChange: (value) => logMessage('Input changed: ' + value)
        });
        
        // Create a form
        const form = uiService.createComponent('form', {
          onSubmit: () => logMessage('Form submitted')
        });
        
        if (form) {
          const formContent = form.querySelector('.ah-form-content');
          if (formContent) {
            formContent.appendChild(textInput);
          }
          formContainer.appendChild(form);
        }
        
        logMessage('Form components created successfully');
      } catch (error) {
        logMessage('Error creating form components: ' + error.message);
      }
    }
    
    // Test card components
    const cardContainer = element.querySelector('#card-container');
    if (cardContainer) {
      try {
        // Create a regular card
        const card = uiService.createComponent('card', {
          title: 'Sample Card',
          content: 'This is a sample card component with some content.'
        });
        
        // Create an action card
        const actionCard = uiService.createComponent('action-card', {
          title: 'Action Card',
          content: 'This card has action buttons.',
          actions: [
            { label: 'Save', onClick: () => logMessage('Save clicked') },
            { label: 'Cancel', variant: 'secondary', onClick: () => logMessage('Cancel clicked') }
          ]
        });
        
        // Add cards to container
        cardContainer.appendChild(card);
        cardContainer.appendChild(actionCard);
        
        logMessage('Card components created successfully');
      } catch (error) {
        logMessage('Error creating card components: ' + error.message);
      }
    }
    
    // Test layout components
    const layoutContainer = element.querySelector('#layout-container');
    if (layoutContainer) {
      try {
        // Create a container
        const container = uiService.createComponent('container', {});
        
        // Create a flex container
        const flex = uiService.createComponent('flex', {
          direction: 'row',
          gap: 'md'
        });
        
        // Create some items to put in the flex container
        const item1 = document.createElement('div');
        item1.style.padding = '1rem';
        item1.style.backgroundColor = '#e9ecef';
        item1.style.borderRadius = '4px';
        item1.textContent = 'Flex Item 1';
        
        const item2 = document.createElement('div');
        item2.style.padding = '1rem';
        item2.style.backgroundColor = '#e9ecef';
        item2.style.borderRadius = '4px';
        item2.textContent = 'Flex Item 2';
        
        const item3 = document.createElement('div');
        item3.style.padding = '1rem';
        item3.style.backgroundColor = '#e9ecef';
        item3.style.borderRadius = '4px';
        item3.textContent = 'Flex Item 3';
        
        // Add items to flex container
        flex.appendChild(item1);
        flex.appendChild(item2);
        flex.appendChild(item3);
        
        // Add flex to container
        container.appendChild(flex);
        
        // Add container to layout container
        layoutContainer.appendChild(container);
        
        logMessage('Layout components created successfully');
      } catch (error) {
        logMessage('Error creating layout components: ' + error.message);
      }
    }
    
    logMessage('All components initialized');
    
    // Return component instance API
    return {
      setTitle: (title) => {
        const titleEl = element.querySelector('.ui-test-app-title');
        if (titleEl) {
          titleEl.textContent = title;
        }
      },
      log: logMessage,
      getElement: () => element,
    };
  },
  styles: `
    .ui-test-app-main-view {
      padding: 1rem;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    }
    
    .ui-test-app-title {
      margin-top: 0;
      margin-bottom: 1rem;
      color: #4a63e6;
    }
    
    .ui-test-app-content {
      color: #212529;
    }
    
    .ui-test-section {
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }
    
    .ui-test-section h3 {
      margin-top: 0;
      color: #2c3e50;
    }
    
    .component-test-container {
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 6px;
      border: 1px dashed #dee2e6;
    }
    
    .log-container {
      height: 150px;
      overflow-y: auto;
      background-color: #f8f9fa;
      padding: 0.5rem;
      border-radius: 6px;
      font-family: monospace;
      font-size: 0.875rem;
    }
    
    .log-entry {
      margin-bottom: 0.25rem;
      line-height: 1.4;
    }
  `,
};