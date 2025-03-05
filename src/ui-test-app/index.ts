// ui-test-app/index.ts
import { ModuleContext } from '@module-system/ModuleSystem';
import { registerComponents } from './components';

/**
 * Initialize the Ui Test App module
 */
export async function initialize(context: ModuleContext): Promise<boolean> {
  console.log('Initializing Ui Test App module');
  
  // Get UI component service
  const uiComponentService = context.services.getService('uiComponentService');
  if (!uiComponentService) {
    console.error('UI Component service not available');
    return false;
  }
  
  // Register components with UI service
  await registerComponents(uiComponentService);
  
  // Check if UI system exists before registering views
  if (context.ui && typeof context.ui.registerView === 'function') {
    // Register UI views for available slots
    context.ui.registerView({
      slot: 'main',
      component: 'ui-test-app-main-view',
      priority: 10,
    });
    
    context.ui.registerView({
      slot: 'sidebar',
      component: 'ui-test-app-sidebar',
      priority: 5,
    });
  } else {
    console.log('UI system not available, skipping view registration');
    
    // Create a simple HTTP handler if available to show our UI
    const httpService = context.services.getService('httpServer');
    if (httpService && typeof httpService.registerHandler === 'function') {
      console.log('Registering HTTP handler for UI test app at /ui-test');
      
      // Register HTTP handler
      httpService.registerHandler({
        handleRequest: async (request) => {
          const url = new URL(request.url);
          if (url.pathname === '/ui-test') {
            // Create a more comprehensive HTML page to test our components
            return new Response(`
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>UI Component Test App</title>
                <style>
                  body { 
                    font-family: system-ui, sans-serif; 
                    line-height: 1.5; 
                    margin: 0;
                    padding: 0;
                    background-color: #f8f9fa;
                    color: #333;
                  }
                  .container { 
                    max-width: 1200px; 
                    margin: 0 auto; 
                    padding: 2rem; 
                  }
                  header {
                    background-color: #4a63e6;
                    color: white;
                    padding: 1rem 0;
                    margin-bottom: 2rem;
                  }
                  header .container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                  }
                  h1, h2, h3 { 
                    color: #4a63e6; 
                    margin-top: 0;
                  }
                  header h1 {
                    color: white;
                    margin: 0;
                  }
                  .card {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                  }
                  .test-section {
                    margin-bottom: 2rem;
                  }
                  .component-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1rem;
                  }
                  .component-test {
                    border: 1px dashed #ddd;
                    padding: 1rem;
                    border-radius: 6px;
                  }
                  .component-test h4 {
                    margin-top: 0;
                    color: #6c757d;
                    font-size: 0.875rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                  }
                  .component-info {
                    margin-bottom: 1rem;
                    font-size: 0.875rem;
                    color: #6c757d;
                  }
                  .component-render {
                    padding: 1rem;
                    background-color: #f8f9fa;
                    border-radius: 4px;
                  }
                  .log-container {
                    height: 200px;
                    overflow-y: auto;
                    background-color: #f8f9fa;
                    padding: 1rem;
                    border-radius: 6px;
                    border: 1px solid #e9ecef;
                    font-family: monospace;
                  }
                  .log-entry {
                    margin-bottom: 0.5rem;
                    border-bottom: 1px solid #e9ecef;
                    padding-bottom: 0.5rem;
                  }
                  .theme-toggle {
                    background-color: transparent;
                    color: white;
                    border: 1px solid rgba(255,255,255,0.5);
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                  }
                  .theme-toggle:hover {
                    background-color: rgba(255,255,255,0.1);
                  }
                  .dark-mode {
                    background-color: #121212;
                    color: #e0e0e0;
                  }
                  .dark-mode .card {
                    background-color: #1e1e1e;
                    color: #e0e0e0;
                  }
                  .dark-mode h1, .dark-mode h2, .dark-mode h3 {
                    color: #7c93f5;
                  }
                  .dark-mode .component-render {
                    background-color: #2d2d2d;
                  }
                  .dark-mode .log-container {
                    background-color: #2d2d2d;
                    border-color: #333;
                  }
                  .dark-mode .log-entry {
                    border-color: #333;
                  }
                  .error {
                    background-color: #f8d7da;
                    color: #721c24;
                    padding: 0.75rem;
                    border-radius: 4px;
                    margin-bottom: 1rem;
                  }
                  .dark-mode .error {
                    background-color: rgba(220, 53, 69, 0.2);
                    color: #f8d7da;
                  }
                </style>
              </head>
              <body>
                <header>
                  <div class="container">
                    <h1>UI Component Test App</h1>
                    <button id="theme-toggle" class="theme-toggle">Toggle Dark Mode</button>
                  </div>
                </header>
                
                <div class="container">
                  <div class="card">
                    <h2>Component Testing Dashboard</h2>
                    <p>This page demonstrates and tests the UI components from the AppletHub UI Components library.</p>
                    
                    <div class="test-section">
                      <h3>Button Components</h3>
                      <div id="button-container" class="component-render"></div>
                    </div>
                    
                    <div class="test-section">
                      <h3>Alert Components</h3>
                      <div id="alert-container" class="component-render"></div>
                    </div>
                    
                    <div class="test-section">
                      <h3>Form Components</h3>
                      <div id="form-container" class="component-render"></div>
                    </div>
                    
                    <div class="test-section">
                      <h3>Card Components</h3>
                      <div id="card-container" class="component-render"></div>
                    </div>
                    
                    <div class="test-section">
                      <h3>Layout Components</h3>
                      <div id="layout-container" class="component-render"></div>
                    </div>
                  </div>

                  <div class="card">
                    <h3>Available Components</h3>
                    <div id="component-list"></div>
                  </div>
                  
                  <div class="card">
                    <h3>Component Test Log</h3>
                    <div id="log-container" class="log-container"></div>
                  </div>
                </div>

                <script>
                  // Helper function to log messages
                  function log(message) {
                    const logContainer = document.getElementById('log-container');
                    const logEntry = document.createElement('div');
                    logEntry.className = 'log-entry';
                    logEntry.textContent = '> ' + message;
                    logContainer.appendChild(logEntry);
                    logContainer.scrollTop = logContainer.scrollHeight;
                    console.log(message);
                  }
                
                  // Initialize AppletHub global object
                  window.AppletHub = {
                    services: {
                      themeService: {
                        getTheme: function() {
                          return {
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
                            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
                        },
                        toggleDarkMode: function() {
                          log('Theme service: toggling dark mode');
                          // Theme toggle is handled by CSS classes in this test app
                        },
                        subscribe: function(callback) {
                          // Simple implementation just calls the callback once
                          callback(this.getTheme());
                          return function() {}; // Return unsubscribe function
                        }
                      },
                      uiComponentService: {
                        components: new Map(),
                        styleElement: null,
                        
                        // Initialize style element
                        init: function() {
                          if (!this.styleElement) {
                            try {
                              this.styleElement = document.createElement('style');
                              this.styleElement.id = 'applethub-component-styles';
                              document.head.appendChild(this.styleElement);
                              log('UI Component Service initialized in browser');
                              
                              // Apply theme CSS variables to document root
                              this.applyThemeToDocument();
                            } catch (error) {
                              console.error('Error initializing UI Component Service:', error);
                            }
                          }
                        },
                        
                        // Apply theme to document
                        applyThemeToDocument: function() {
                          try {
                            const theme = window.AppletHub.services.themeService.getTheme();
                            const root = document.documentElement;
                            
                            // Set colors
                            for (const [key, value] of Object.entries(theme.colors)) {
                              root.style.setProperty('--color-' + key, value);
                              log('Setting CSS variable: --color-' + key + ' = ' + value);
                            }
                            
                            // Set font
                            root.style.setProperty("--font-family", theme.fontFamily);
                            
                            // Set font sizes
                            for (const [key, value] of Object.entries(theme.fontSize)) {
                              root.style.setProperty('--font-size-' + key, value);
                            }
                            
                            // Set spacing
                            for (const [key, value] of Object.entries(theme.spacing)) {
                              root.style.setProperty('--spacing-' + key, value);
                            }
                            
                            // Set border radius
                            for (const [key, value] of Object.entries(theme.borderRadius)) {
                              root.style.setProperty('--border-radius-' + key, value);
                            }
                            
                            // Set shadows
                            for (const [key, value] of Object.entries(theme.shadows)) {
                              root.style.setProperty('--shadow-' + key, value);
                            }
                            
                            log('Theme CSS variables applied to document');
                          } catch (error) {
                            console.error('Error applying theme to document:', error);
                            log('Error applying theme: ' + error.message);
                          }
                        },
                        
                        registerComponent: function(component) {
                          if (!component || !component.id) {
                            console.error('Invalid component definition');
                            return;
                          }
                          
                          // Initialize style element if needed
                          this.init();
                          
                          // Check if already registered
                          if (this.components.has(component.id)) {
                            console.warn('Component already registered: ' + component.id);
                            return;
                          }
                          
                          // Add to registry
                          this.components.set(component.id, component);
                          
                          // Add styles if provided
                          if (component.styles && this.styleElement) {
                            this.styleElement.textContent = this.styleElement.textContent + '\\n/* ' + component.id + ' */\\n' + component.styles;
                          }
                          
                          log('Registered component: ' + component.id);
                        },
                        
                        getComponent: function(id) {
                          return this.components.get(id);
                        },
                        
                        getAllComponents: function() {
                          return Array.from(this.components.values());
                        },
                        
                        getComponentsByCategory: function(category) {
                          return this.getAllComponents().filter(c => c.category === category);
                        },
                        
                        createComponent: function(id, props = {}) {
                          try {
                            const component = this.components.get(id);
                            if (!component) {
                              console.error('Component not found: ' + id);
                              return null;
                            }
                            
                            // Merge props with defaults
                            const mergedProps = { ...(component.defaultProps || {}), ...props };
                            
                            // Create container
                            const container = document.createElement("div");
                            container.className = 'ah-component ah-component-' + id;
                            container.innerHTML = component.template(mergedProps);
                            
                            // Initialize component
                            if (component.init) {
                              try {
                                const instance = component.init(container, mergedProps);
                                if (instance) {
                                  // Store instance data
                                  container.__componentInstance = instance;
                                }
                              } catch (error) {
                                console.error('Error initializing component ' + id + ':', error);
                              }
                            }
                            
                            return container;
                          } catch (error) {
                            console.error('Error creating component ' + id + ':', error);
                            return null;
                          }
                        }
                      }
                    }
                  };
                  
                  // Initialize the UI component service
                  window.AppletHub.services.uiComponentService.init();
                  
                  // Fetch and register components
                  async function loadComponents() {
                    try {
                      log('Fetching UI components...');
                      const response = await fetch('/ui-test/components');
                      const components = await response.json();
                      log('Found ' + components.length + ' UI components');
                      
                      // Display component list
                      const componentList = document.getElementById('component-list');
                      const categories = {};
                      
                      // Group components by category
                      components.forEach(component => {
                        if (!categories[component.category]) {
                          categories[component.category] = [];
                        }
                        categories[component.category].push(component);
                      });
                      
                      // Create component list HTML
                      let listHtml = '<div class="component-grid">';
                      Object.keys(categories).sort().forEach(category => {
                        listHtml += '<div class="component-test">';
                        listHtml += '<h4>' + category.toUpperCase() + '</h4>';
                        listHtml += '<ul>';
                        categories[category].forEach(component => {
                          listHtml += '<li>' + component.name + ' (' + component.id + ')</li>';
                        });
                        listHtml += '</ul>';
                        listHtml += '</div>';
                      });
                      listHtml += '</div>';
                      componentList.innerHTML = listHtml;
                      
                      // Register all components with our UI service
                      components.forEach(component => {
                        try {
                          // Add extra diagnostics
                          log('Registering component: ' + component.id + ' (' + component.category + ')');
                          
                          // Convert string functions back to functions
                          let processed = {...component};
                          
                          // Convert template string back to function
                          try {
                            if (component.template) {
                              processed.template = new Function('return ' + component.template)();
                              if (typeof processed.template !== 'function') {
                                log('Warning: template for ' + component.id + ' is not a function after conversion');
                              }
                            } else {
                              log('Warning: template missing for ' + component.id);
                            }
                          } catch (e) {
                            log('Error converting template for ' + component.id + ': ' + e.message);
                            // Create a dummy template function
                            processed.template = (props) => '<div>Error in template for ' + component.id + '</div>';
                          }
                          
                          // Convert init string back to function if it exists
                          if (component.init) {
                            try {
                              processed.init = new Function('return ' + component.init)();
                            } catch (e) {
                              log('Error converting init for ' + component.id + ': ' + e.message);
                              processed.init = undefined;
                            }
                          }
                          
                          // Convert update string back to function if it exists
                          if (component.update) {
                            try {
                              processed.update = new Function('return ' + component.update)();
                            } catch (e) {
                              log('Error converting update for ' + component.id + ': ' + e.message);
                              processed.update = undefined;
                            }
                          }
                          
                          // Convert cleanup string back to function if it exists
                          if (component.cleanup) {
                            try {
                              processed.cleanup = new Function('return ' + component.cleanup)();
                            } catch (e) {
                              log('Error converting cleanup for ' + component.id + ': ' + e.message);
                              processed.cleanup = undefined;
                            }
                          }
                          
                          // Register the component
                          window.AppletHub.services.uiComponentService.registerComponent(processed);
                        } catch (error) {
                          log('Error registering component ' + component.id + ': ' + error.message);
                        }
                      });
                      
                      // Now create some examples
                      createButtonExamples();
                      createAlertExamples();
                      createFormExamples();
                      createCardExamples();
                      createLayoutExamples();
                      
                    } catch (error) {
                      log('Error loading components: ' + error.message);
                      console.error('Error:', error);
                    }
                  }
                  
                  // Create button examples
                  function createButtonExamples() {
                    const container = document.getElementById('button-container');
                    const uiService = window.AppletHub.services.uiComponentService;
                    
                    try {
                      // Check if the button component exists
                      if (!uiService.getComponent('button')) {
                        container.innerHTML = '<div class="error">Button component not found</div>';
                        log('Error: Button component not found');
                        return;
                      }
                      
                      // Create primary button
                      try {
                        const primaryButton = uiService.createComponent('button', {
                          label: 'Primary Button',
                          variant: 'primary',
                          onClick: () => log('Primary button clicked')
                        });
                        
                        if (primaryButton) {
                          container.appendChild(primaryButton);
                          log('Created primary button');
                        }
                      } catch (err) {
                        log('Error creating primary button: ' + err.message);
                      }
                      
                      // Create secondary button
                      try {
                        const secondaryButton = uiService.createComponent('button', {
                          label: 'Secondary Button',
                          variant: 'secondary',
                          onClick: () => log('Secondary button clicked')
                        });
                        
                        if (secondaryButton) {
                          container.appendChild(document.createTextNode(' '));
                          container.appendChild(secondaryButton);
                          log('Created secondary button');
                        }
                      } catch (err) {
                        log('Error creating secondary button: ' + err.message);
                      }
                      
                      // Create outline button
                      try {
                        const outlineButton = uiService.createComponent('button', {
                          label: 'Outline Button',
                          variant: 'outline',
                          onClick: () => log('Outline button clicked')
                        });
                        
                        if (outlineButton) {
                          container.appendChild(document.createTextNode(' '));
                          container.appendChild(outlineButton);
                          log('Created outline button');
                        }
                      } catch (err) {
                        log('Error creating outline button: ' + err.message);
                      }
                      
                      // Create text button
                      try {
                        const textButton = uiService.createComponent('button', {
                          label: 'Text Button',
                          variant: 'text',
                          onClick: () => log('Text button clicked')
                        });
                        
                        if (textButton) {
                          container.appendChild(document.createTextNode(' '));
                          container.appendChild(textButton);
                          log('Created text button');
                        }
                      } catch (err) {
                        log('Error creating text button: ' + err.message);
                      }
                      
                    } catch (error) {
                      container.innerHTML = '<div class="error">Error creating button examples: ' + error.message + '</div>';
                      log('Error creating button examples: ' + error.message);
                    }
                  }
                  
                  // Create alert examples
                  function createAlertExamples() {
                    const container = document.getElementById('alert-container');
                    const uiService = window.AppletHub.services.uiComponentService;
                    
                    try {
                      // Check if the alert component exists
                      if (!uiService.getComponent('alert')) {
                        container.innerHTML = '<div class="error">Alert component not found</div>';
                        log('Error: Alert component not found');
                        return;
                      }
                      
                      // Create info alert
                      try {
                        const infoAlert = uiService.createComponent('alert', {
                          type: 'info',
                          message: 'This is an information message.'
                        });
                        
                        if (infoAlert) {
                          container.appendChild(infoAlert);
                          log('Created info alert');
                        }
                      } catch (err) {
                        log('Error creating info alert: ' + err.message);
                      }
                      
                      // Create success alert
                      try {
                        const successAlert = uiService.createComponent('alert', {
                          type: 'success',
                          message: 'Operation completed successfully!'
                        });
                        
                        if (successAlert) {
                          container.appendChild(successAlert);
                          log('Created success alert');
                        }
                      } catch (err) {
                        log('Error creating success alert: ' + err.message);
                      }
                      
                      // Create warning alert
                      try {
                        const warningAlert = uiService.createComponent('alert', {
                          type: 'warning',
                          message: 'Warning: This action cannot be undone.'
                        });
                        
                        if (warningAlert) {
                          container.appendChild(warningAlert);
                          log('Created warning alert');
                        }
                      } catch (err) {
                        log('Error creating warning alert: ' + err.message);
                      }
                      
                      // Create error alert
                      try {
                        const errorAlert = uiService.createComponent('alert', {
                          type: 'error',
                          message: 'Error: Something went wrong.'
                        });
                        
                        if (errorAlert) {
                          container.appendChild(errorAlert);
                          log('Created error alert');
                        }
                      } catch (err) {
                        log('Error creating error alert: ' + err.message);
                      }
                      
                    } catch (error) {
                      container.innerHTML = '<div class="error">Error creating alert examples: ' + error.message + '</div>';
                      log('Error creating alert examples: ' + error.message);
                    }
                  }
                  
                  // Create form examples
                  function createFormExamples() {
                    const container = document.getElementById('form-container');
                    const uiService = window.AppletHub.services.uiComponentService;
                    
                    try {
                      // Create a text input
                      const textInput = uiService.createComponent('text-input', {
                        label: 'Name',
                        placeholder: 'Enter your name',
                        onChange: (value) => log('Input changed: ' + value)
                      });
                      
                      // Create a form
                      const form = uiService.createComponent('form', {
                        onSubmit: () => log('Form submitted')
                      });
                      
                      // Add input to form if both were created successfully
                      if (form && textInput) {
                        const formContent = form.querySelector('.ah-form-content');
                        if (formContent) {
                          formContent.appendChild(textInput);
                        }
                        container.appendChild(form);
                      }
                      
                      log('Created form examples');
                    } catch (error) {
                      log('Error creating form examples: ' + error.message);
                    }
                  }
                  
                  // Create card examples
                  function createCardExamples() {
                    const container = document.getElementById('card-container');
                    const uiService = window.AppletHub.services.uiComponentService;
                    
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
                          { label: 'Save', onClick: () => log('Save clicked') },
                          { label: 'Cancel', variant: 'secondary', onClick: () => log('Cancel clicked') }
                        ]
                      });
                      
                      // Add cards to container
                      if (card) container.appendChild(card);
                      if (actionCard) container.appendChild(actionCard);
                      
                      log('Created card examples');
                    } catch (error) {
                      log('Error creating card examples: ' + error.message);
                    }
                  }
                  
                  // Create layout examples
                  function createLayoutExamples() {
                    const container = document.getElementById('layout-container');
                    const uiService = window.AppletHub.services.uiComponentService;
                    
                    try {
                      // Create a container component
                      const containerComponent = uiService.createComponent('container', {});
                      
                      // Create a flex component
                      const flex = uiService.createComponent('flex', {
                        direction: 'row',
                        gap: 'md'
                      });
                      
                      if (flex) {
                        // Create some items to put in the flex container
                        for (let i = 1; i <= 3; i++) {
                          const item = document.createElement('div');
                          item.style.padding = '1rem';
                          item.style.backgroundColor = '#e9ecef';
                          item.style.borderRadius = '4px';
                          item.textContent = 'Flex Item ' + i;
                          flex.appendChild(item);
                        }
                        
                        // Add flex to container
                        if (containerComponent) {
                          containerComponent.appendChild(flex);
                          container.appendChild(containerComponent);
                        } else {
                          container.appendChild(flex);
                        }
                      }
                      
                      // Create a grid component if it exists
                      const grid = uiService.createComponent('grid', {
                        columns: 3,
                        gap: 'md'
                      });
                      
                      if (grid) {
                        // Create some grid items
                        for (let i = 1; i <= 6; i++) {
                          const gridItem = uiService.createComponent('grid-item', {
                            span: i % 3 === 0 ? 3 : 1
                          });
                          
                          if (gridItem) {
                            const content = document.createElement('div');
                            content.style.padding = '1rem';
                            content.style.backgroundColor = '#e9ecef';
                            content.style.borderRadius = '4px';
                            content.textContent = 'Grid Item ' + i;
                            gridItem.appendChild(content);
                            grid.appendChild(gridItem);
                          }
                        }
                        
                        container.appendChild(grid);
                      }
                      
                      log('Created layout examples');
                    } catch (error) {
                      log('Error creating layout examples: ' + error.message);
                    }
                  }
                  
                  // Handle theme toggle
                  const themeToggle = document.getElementById('theme-toggle');
                  themeToggle.addEventListener('click', () => {
                    document.body.classList.toggle('dark-mode');
                    log('Theme toggled to ' + (document.body.classList.contains('dark-mode') ? 'dark' : 'light') + ' mode');
                    
                    // Update theme via theme service if available
                    if (window.AppletHub?.services?.themeService?.toggleDarkMode) {
                      window.AppletHub.services.themeService.toggleDarkMode();
                    }
                  });
                  
                  // Load all components when the page loads
                  document.addEventListener('DOMContentLoaded', loadComponents);
                </script>
              </body>
              </html>
            `, {
              headers: { 'Content-Type': 'text/html' }
            });
          }
          
          if (url.pathname === '/ui-test/components') {
            // Get all components
            const components = uiComponentService.getAllComponents();
            
            // Create serializable version of components
            const serializableComponents = components.map(component => {
              // Convert the template function to a string
              const templateStr = component.template ? component.template.toString() : '';
              const initStr = component.init ? component.init.toString() : '';
              const updateStr = component.update ? component.update.toString() : '';
              const cleanupStr = component.cleanup ? component.cleanup.toString() : '';
              
              return {
                id: component.id,
                name: component.name,
                description: component.description,
                category: component.category,
                defaultProps: component.defaultProps || {},
                template: templateStr,
                init: initStr,
                update: updateStr,
                cleanup: cleanupStr,
                styles: component.styles || '',
                hasChildren: component.hasChildren || false
              };
            });
            
            return new Response(JSON.stringify(serializableComponents), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          // Not a UI test path
          return undefined;
        }
      });
    }
  }
  
  return true;
}

/**
 * Clean up when the module is stopped
 */
export async function cleanup(context: ModuleContext): Promise<boolean> {
  console.log('Cleaning up Ui Test App module');
  
  // Unregister UI views if UI system exists
  if (context.ui && typeof context.ui.unregisterView === 'function') {
    context.ui.unregisterView('main', 'ui-test-app-main-view');
    context.ui.unregisterView('sidebar', 'ui-test-app-sidebar');
  }
  
  return true;
}

/**
 * Public API exposed by this module
 */
export function getAPI() {
  return {
    // Public methods and properties
    getName: () => 'Ui Test App',
    getVersion: () => '0.1.0',
  };
}