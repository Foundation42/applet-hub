// admin-dashboard/index.ts
import { Module, ModuleContext, ModuleState } from '../module-system/ModuleSystem';
import { HttpRequestHandler, HttpServerService } from '../http-server';
import { Server } from 'bun';
import { DashboardService } from './services/DashboardService';

/**
 * Admin Dashboard Module
 */
export class AdminDashboardModule implements Module {
  private context: ModuleContext | null = null;
  private state: ModuleState = ModuleState.REGISTERED;
  private dashboardService: DashboardService | null = null;
  private httpService: HttpServerService | null = null;
  private unregisterHttpHandler: (() => void) | null = null;

  /**
   * Initialize the Admin Dashboard module
   */
  async initialize(context: ModuleContext): Promise<boolean> {
    try {
      this.state = ModuleState.LOADING;
      this.context = context;
      
      console.log('Initializing Admin Dashboard module');
      console.log('Available services:', Array.from(context.services.getAllServices().entries()));
      
      // Check for UI component service (dependency)
      const uiService = context.services.getService('uiComponentService');
      if (!uiService) {
        console.warn('UI Component service not found - dashboard will use fallback HTML');
      } else {
        console.log('UI Component service available:', uiService);
      }
      
      // Get HTTP server service
      this.httpService = context.services.getService('httpServer') as unknown as HttpServerService;
      if (!this.httpService) {
        console.error('HTTP server service not found');
        this.state = ModuleState.ERROR;
        return false;
      }
      
      // Create and register dashboard service
      this.dashboardService = new DashboardService(context);
      
      context.services.registerService({
        id: 'dashboardService',
        implementation: this.dashboardService as unknown as Record<string, Function>,
        version: '1.0.0',
        metadata: {
          description: 'Administrative dashboard service for AppletHub',
        },
      });
      
      // Register HTTP handler for the admin dashboard
      const httpHandler: HttpRequestHandler = {
        handleRequest: this.handleRequest.bind(this),
      };
      
      this.unregisterHttpHandler = this.httpService.registerHandler(
        httpHandler,
        100 // High priority to handle admin routes first
      );
      
      this.state = ModuleState.ACTIVE;
      return true;
    } catch (error) {
      console.error('Error initializing Admin Dashboard module:', error);
      this.state = ModuleState.ERROR;
      return false;
    }
  }
  
  /**
   * Handle HTTP requests for the admin dashboard
   */
  private async handleRequest(
    request: Request,
    server: Server
  ): Promise<Response | undefined> {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Only handle admin routes
    if (path === '/admin' || path.startsWith('/admin/')) {
      console.log(`Admin dashboard handling request: ${path}`);
      
      // Get access to UI Component Service
      // Get all services
      const allServices = this.context?.services.getAllServices();
      console.log('Available services:', allServices ? Array.from(allServices.keys()) : 'None');
      
      const uiService = this.context?.services.getService('uiComponentService');
      if (!uiService) {
        console.error('UI Component service not found, using fallback HTML');
        
        // Try to find UI service with different patterns
        console.log('Looking for any UI-related services...');
        const serviceKeys = allServices ? Array.from(allServices.keys()) : [];
        const uiRelatedServices = serviceKeys.filter(k => 
          k.toLowerCase().includes('ui') || 
          k.toLowerCase().includes('component')
        );
        
        if (uiRelatedServices.length > 0) {
          console.log('Found UI-related services:', uiRelatedServices);
          // Try each one
          for (const key of uiRelatedServices) {
            console.log(`Trying service: ${key}`);
            const service = this.context?.services.getService(key);
            if (service) {
              console.log(`Found alternative UI service: ${key}`, service);
            }
          }
        }
      } else {
        try {
          // Import UI components and register them
          const { registerComponents } = await import('./components');
          
          // Log what's in the uiService to debug
          console.log('UI Service methods:', Object.keys(uiService));
          
          // Check if registerComponent is available
          if (typeof uiService.registerComponent === 'function') {
            await registerComponents(uiService);
            console.log('UI components registered for admin dashboard');
          } else {
            console.error('UI service is missing registerComponent method:', uiService);
          }
        } catch (error) {
          console.error('Error registering admin components:', error);
        }
      }
      
      // Generate a simpler dashboard HTML with direct implementation of the panels
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AppletHub Admin Dashboard</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
      color: #333;
    }
    header {
      background-color: #2c3e50;
      color: white;
      padding: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    main {
      padding: 0;
      max-width: 1500px;
      margin: 0 auto;
    }
    .dashboard-layout {
      display: flex;
      min-height: calc(100vh - 60px);
    }
    .sidebar {
      width: 250px;
      background-color: #f8f9fa;
      border-right: 1px solid #e9ecef;
      padding: 1.5rem 0;
    }
    .sidebar .panel {
      background: transparent;
      box-shadow: none;
      border-radius: 0;
    }
    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .nav-link {
      display: block;
      padding: 0.75rem 1.5rem;
      color: #495057;
      text-decoration: none;
      border-left: 3px solid transparent;
      transition: all 0.2s ease;
    }
    .nav-link:hover, .nav-link.active {
      background-color: #e9ecef;
      color: #2c3e50;
      border-left-color: #3498db;
    }
    .content {
      flex: 1;
      padding: 1.5rem;
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }
    .panel {
      background-color: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1, h2, h3 {
      margin-top: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 0.5rem;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    th {
      font-weight: 600;
    }
    .button {
      display: inline-block;
      background-color: #3498db;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      text-decoration: none;
      margin-right: 0.5rem;
      cursor: pointer;
      border: none;
    }
    .button:hover {
      background-color: #2980b9;
    }
    .button.danger {
      background-color: #e74c3c;
    }
    .button.danger:hover {
      background-color: #c0392b;
    }
  </style>
</head>
<body>
  <header>
    <h1>AppletHub Admin Dashboard</h1>
  </header>
  <main>
    <div class="dashboard-layout">
      <div class="sidebar" id="sidebar-container">
        <!-- Sidebar will be populated by component or fallback HTML -->
        <div class="panel fallback-sidebar">
          <h2>Navigation</h2>
          <ul class="nav-list">
            <li><a href="#system-info" class="nav-link active">System Info</a></li>
            <li><a href="#modules" class="nav-link">Modules</a></li>
            <li><a href="#services" class="nav-link">Services</a></li>
            <li><a href="#tuplestore" class="nav-link">TupleStore Explorer</a></li>
          </ul>
        </div>
      </div>
      <div class="content" id="dashboard-container">
        <!-- Main content will be populated by component system or fallback HTML -->
        <div class="dashboard-grid fallback-content">
          <div class="panel" id="system-info-panel">
            <h2>System Information</h2>
            <div id="system-info-content">Loading system information...</div>
          </div>
          
          <div class="panel" id="modules-panel">
            <h2>Modules</h2>
            <div id="modules-content">Loading modules...</div>
          </div>
          
          <div class="panel" id="tuplestore-panel">
            <h2>TupleStore Explorer</h2>
            <div id="tuplestore-content">
              <input type="text" id="tuplestore-path" placeholder="Enter path (e.g. system.version)" style="width: 100%; padding: 0.5rem; margin-bottom: 1rem; border: 1px solid #ddd; border-radius: 4px;">
              <button class="button" id="tuplestore-search">Search</button>
              <div id="tuplestore-results">Enter a path to search</div>
            </div>
          </div>

          <div class="panel" id="services-panel">
            <h2>Services</h2>
            <div id="services-content">Loading services...</div>
          </div>
        </div>
      </div>
    </div>
  </main>
  <script>
    // Initialize AppletHub global object to make services available to components
    window.AppletHub = {
      services: {
        // Expose dashboard service to components
        dashboardService: {
          getSystemStats: async () => {
            const response = await fetch('/admin/api/system-stats');
            return response.json();
          },
          listModules: async () => {
            const response = await fetch('/admin/api/modules');
            return response.json();
          },
          getModule: async (id) => {
            const response = await fetch('/admin/api/modules/' + id);
            return response.json();
          },
          startModule: async (id) => {
            const response = await fetch('/admin/api/modules/' + id + '/start', {
              method: 'POST'
            });
            return response.json();
          },
          stopModule: async (id) => {
            const response = await fetch('/admin/api/modules/' + id + '/stop', {
              method: 'POST'
            });
            return response.json();
          },
          listServices: async () => {
            const response = await fetch('/admin/api/services');
            return response.json();
          },
          getTupleStoreData: async (path) => {
            const url = '/admin/api/tuplestore' + (path ? '?path=' + path : '');
            const response = await fetch(url);
            return response.json();
          }
        },
        
        // Create a minimal UI component service for the browser
        uiComponentService: {
          components: new Map(),
          
          registerComponent(component) {
            this.components.set(component.id, component);
            
            // Add styles if provided
            if (component.styles) {
              const styleId = 'style-' + component.id;
              let styleEl = document.getElementById(styleId);
              
              if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = styleId;
                document.head.appendChild(styleEl);
              }
              
              styleEl.textContent = component.styles;
            }
          },
          
          createComponent(id, props = {}) {
            const component = this.components.get(id);
            if (!component) {
              console.error('Component not found: ' + id);
              return null;
            }
            
            // Merge props with defaults
            const mergedProps = { ...component.defaultProps, ...props };
            
            // Create container
            const container = document.createElement('div');
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
          },
          
          getComponent(id) {
            return this.components.get(id);
          },
          
          getAllComponents() {
            return Array.from(this.components.values());
          }
        }
      }
    };
    
    // Helper function to fetch and handle API data
    async function fetchApi(endpoint) {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching data:', error);
        return null;
      }
    }
    
    // Initialize dashboard with UI components if available, otherwise use basic HTML
    document.addEventListener('DOMContentLoaded', () => {
      console.log("Admin dashboard is initializing in the browser");
      console.log("AppletHub global:", window.AppletHub);
      
      const dashboardContainer = document.getElementById('dashboard-container');
      
      if (window.AppletHub?.services?.uiComponentService) {
        // UI component system is available
        console.log('Using UI component system for dashboard');
        
        // Clean fallback content
        const sidebarContainer = document.getElementById('sidebar-container');
        const fallbackSidebar = document.querySelector('.fallback-sidebar');
        const dashboardContainer = document.getElementById('dashboard-container');
        const fallbackContent = document.querySelector('.fallback-content');
        
        // Remove fallback elements
        if (fallbackSidebar) fallbackSidebar.remove();
        if (fallbackContent) fallbackContent.remove();
        
        try {
          // Log available components to debug
          console.log('Available components:', window.AppletHub.services.uiComponentService.getAllComponents());
          
          // Register admin dashboard components directly in the browser
          const registerDashboardComponents = () => {
            // Define sidebar component
            window.AppletHub.services.uiComponentService.registerComponent({
              id: 'admin-dashboard-sidebar',
              name: 'Admin Dashboard Sidebar',
              description: 'Navigation sidebar for Admin Dashboard',
              category: 'navigation',
              template: () => {
                return '<div class="admin-dashboard-sidebar">' +
                  '<h3>Navigation</h3>' +
                  '<ul class="nav-list">' +
                    '<li><a href="#system-info" class="nav-link active">System Info</a></li>' +
                    '<li><a href="#modules" class="nav-link">Modules</a></li>' +
                    '<li><a href="#services" class="nav-link">Services</a></li>' +
                    '<li><a href="#tuplestore" class="nav-link">TupleStore Explorer</a></li>' +
                  '</ul>' +
                '</div>';
              }
            });
            
            // Define main view component
            window.AppletHub.services.uiComponentService.registerComponent({
              id: 'admin-dashboard-main-view',
              name: 'Admin Dashboard Main View',
              description: 'Main view for Admin Dashboard',
              category: 'display',
              template: (props) => {
                return '<div class="admin-dashboard-main-view">' +
                  '<h2>' + (props.title || 'Admin Dashboard') + '</h2>' +
                  '<div class="dashboard-content">' +
                    '<div class="system-info-panel" id="system-info-panel">' +
                      '<h3>System Information</h3>' +
                      '<div id="system-info-content">Loading system information...</div>' +
                    '</div>' +
                    '<div class="modules-panel" id="modules-panel">' +
                      '<h3>Modules</h3>' +
                      '<div id="modules-content">Loading modules...</div>' +
                    '</div>' +
                    '<div class="services-panel" id="services-panel">' +
                      '<h3>Services</h3>' +
                      '<div id="services-content">Loading services...</div>' +
                    '</div>' +
                    '<div class="tuplestore-panel" id="tuplestore-panel">' +
                      '<h3>TupleStore Explorer</h3>' +
                      '<div id="tuplestore-content">' +
                        '<input type="text" id="tuplestore-path" placeholder="Enter path (e.g. system.version)" style="width: 100%; padding: 0.5rem; margin-bottom: 1rem; border: 1px solid #ddd; border-radius: 4px;">' +
                        '<button class="button" id="tuplestore-search">Search</button>' +
                        '<div id="tuplestore-results">Enter a path to search</div>' +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                '</div>';
              },
              init: (element) => {
                // Load and refresh data
                let refreshTimer;
                
                // Log debugging info
                console.log("Admin Dashboard component initialized");
                
                // Directly use the dashboard service from the global AppletHub object
                const dashboardService = window.AppletHub?.services?.dashboardService;
                if (!dashboardService) {
                  console.error("Dashboard service not found in AppletHub global");
                  
                  // Add direct error message to the page
                  const systemInfoEl = element.querySelector('#system-info-content');
                  if (systemInfoEl) {
                    systemInfoEl.innerHTML = '<div class="error">Dashboard service not available</div>';
                  }
                  
                  const modulesEl = element.querySelector('#modules-content');
                  if (modulesEl) {
                    modulesEl.innerHTML = '<div class="error">Dashboard service not available</div>';
                  }
                  
                  const servicesEl = element.querySelector('#services-content');
                  if (servicesEl) {
                    servicesEl.innerHTML = '<div class="error">Dashboard service not available</div>';
                  }
                } else {
                  console.log("Dashboard service found, initializing data");
                }
                
                const loadSystemInfo = () => {
                  // Try direct fetch first, with better error handling
                  fetch('/admin/api/system-stats')
                    .then(response => {
                      if (!response.ok) {
                        throw new Error('HTTP error ' + response.status);
                      }
                      return response.json();
                    })
                    .then(stats => {
                      console.log("System stats loaded:", stats);
                      if (stats) {
                        const systemInfoEl = element.querySelector('#system-info-content');
                        if (systemInfoEl) {
                          systemInfoEl.innerHTML = 
                            '<table>' +
                              '<tr><th>AppletHub Version</th><td>' + (stats.version || '0.1.0') + '</td></tr>' +
                              '<tr><th>Uptime</th><td>' + formatUptime(stats.uptime) + '</td></tr>' +
                              '<tr><th>CPU Usage</th><td>' + stats.cpu + '%</td></tr>' +
                              '<tr><th>Memory Usage</th><td>' + stats.memory + ' MB</td></tr>' +
                              '<tr><th>Loaded Modules</th><td>' + stats.modulesCount + '</td></tr>' +
                              '<tr><th>Registered Services</th><td>' + stats.servicesCount + '</td></tr>' +
                            '</table>';
                        }
                      }
                    })
                    .catch(error => {
                      console.error("Error loading system stats:", error);
                      const systemInfoEl = element.querySelector('#system-info-content');
                      if (systemInfoEl) {
                        systemInfoEl.innerHTML = '<div class="error">Error loading system information: ' + error.message + '</div>';
                      }
                    });
                };
                
                const loadModules = () => {
                  // Try direct fetch with better error handling
                  fetch('/admin/api/modules')
                    .then(response => {
                      if (!response.ok) {
                        throw new Error('HTTP error ' + response.status);
                      }
                      return response.json();
                    })
                    .then(modules => {
                      console.log("Modules loaded:", modules);
                      if (modules && modules.length) {
                        const modulesEl = element.querySelector('#modules-content');
                        if (modulesEl) {
                          let html = '<table><tr><th>Module</th><th>Version</th><th>Status</th><th>Actions</th></tr>';
                          modules.forEach(module => {
                            const statusClass = module.status === 'active' ? 'status-active' : 
                                              module.status === 'error' ? 'status-error' : 'status-inactive';
                            html += '<tr>' + 
                                      '<td>' + module.name + '</td>' + 
                                      '<td>' + module.version + '</td>' + 
                                      '<td><span class="status-indicator ' + statusClass + '">' + module.status + '</span></td>' +
                                      '<td>' + 
                                        (module.status === 'active' 
                                          ? '<button class="button danger" data-action="stop" data-id="' + module.id + '">Stop</button>'
                                          : '<button class="button" data-action="start" data-id="' + module.id + '">Start</button>') +
                                      '</td>' +
                                    '</tr>';
                          });
                          html += '</table>';
                          modulesEl.innerHTML = html;
                          
                          // Add event listeners to buttons
                          modulesEl.querySelectorAll('button[data-action]').forEach(button => {
                            button.addEventListener('click', async () => {
                              const action = button.getAttribute('data-action');
                              const id = button.getAttribute('data-id');
                              
                              button.disabled = true;
                              button.textContent = action === 'start' ? 'Starting...' : 'Stopping...';
                              
                              try {
                                const response = await fetch('/admin/api/modules/' + id + '/' + action, {
                                  method: 'POST'
                                });
                                if (!response.ok) {
                                  throw new Error('HTTP error ' + response.status);
                                }
                                const data = await response.json();
                                if (data && data.success) {
                                  loadModules(); // Refresh the list
                                } else {
                                  throw new Error("Operation failed");
                                }
                              } catch (error) {
                                console.error('Error ' + action + 'ing module:', error);
                                button.disabled = false;
                                button.textContent = action === 'start' ? 'Start' : 'Stop';
                              }
                            });
                          });
                        }
                      }
                    })
                    .catch(error => {
                      console.error("Error loading modules:", error);
                      const modulesEl = element.querySelector('#modules-content');
                      if (modulesEl) {
                        modulesEl.innerHTML = '<div class="error">Error loading modules: ' + error.message + '</div>';
                      }
                    });
                };
                
                const loadServices = () => {
                  // Try direct fetch with better error handling
                  fetch('/admin/api/services')
                    .then(response => {
                      if (!response.ok) {
                        throw new Error('HTTP error ' + response.status);
                      }
                      return response.json();
                    })
                    .then(services => {
                      console.log("Services loaded:", services);
                      if (services && services.length) {
                        const servicesEl = element.querySelector('#services-content');
                        if (servicesEl) {
                          let html = '<table><tr><th>Service</th><th>Version</th><th>Provider</th><th>Methods</th></tr>';
                          services.forEach(service => {
                            html += '<tr>' +
                                      '<td>' + service.id + '</td>' +
                                      '<td>' + service.version + '</td>' +
                                      '<td>' + service.provider + '</td>' +
                                      '<td>' + (service.methods ? service.methods.join(', ') : '') + '</td>' +
                                    '</tr>';
                          });
                          html += '</table>';
                          servicesEl.innerHTML = html;
                        }
                      }
                    })
                    .catch(error => {
                      console.error("Error loading services:", error);
                      const servicesEl = element.querySelector('#services-content');
                      if (servicesEl) {
                        servicesEl.innerHTML = '<div class="error">Error loading services: ' + error.message + '</div>';
                      }
                    });
                };
                
                // Setup TupleStore explorer
                const setupTupleStore = () => {
                  const searchButton = element.querySelector('#tuplestore-search');
                  if (!searchButton) {
                    console.error('TupleStore search button not found');
                    return;
                  }
                  
                  const pathInput = element.querySelector('#tuplestore-path');
                  const resultsContainer = element.querySelector('#tuplestore-results');
                  
                  // Pre-populate with system.version for easy testing
                  if (pathInput) {
                    pathInput.value = 'system.version';
                  }
                  
                  searchButton.addEventListener('click', async () => {
                    if (!pathInput || !resultsContainer) {
                      console.error('Path input or results container not found');
                      return;
                    }
                    
                    const path = pathInput.value.trim();
                    resultsContainer.innerHTML = 'Searching...';
                    
                    try {
                      const response = await fetch('/admin/api/tuplestore' + (path ? '?path=' + path : ''));
                      if (!response.ok) {
                        throw new Error('HTTP error ' + response.status);
                      }
                      
                      const data = await response.json();
                      console.log('TupleStore data:', data);
                      
                      if (data === null) {
                        resultsContainer.innerHTML = '<div class="error">Error fetching data</div>';
                        return;
                      }
                      
                      if (data === undefined) {
                        resultsContainer.innerHTML = '<div class="error">Path not found</div>';
                        return;
                      }
                      
                      if (typeof data === 'object' && data !== null) {
                        resultsContainer.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                      } else {
                        resultsContainer.innerHTML = '<pre>' + data + '</pre>';
                      }
                    } catch (error) {
                      console.error('Error searching TupleStore:', error);
                      resultsContainer.innerHTML = '<div class="error">Error searching TupleStore: ' + error.message + '</div>';
                    }
                  });
                  
                  // Trigger search on Enter key
                  pathInput.addEventListener('keyup', (event) => {
                    if (event.key === 'Enter') {
                      searchButton.click();
                    }
                  });
                  
                  // Trigger an initial search with the default value
                  searchButton.click();
                };
                
                // Handle navigation links
                const setupNavigation = () => {
                  // Get all navigation links
                  const navLinks = document.querySelectorAll('.nav-link');
                  if (navLinks.length === 0) {
                    console.error('Navigation links not found');
                    return;
                  }
                  
                  // Get all panels
                  const panels = [
                    document.getElementById('system-info-panel'),
                    document.getElementById('modules-panel'),
                    document.getElementById('services-panel'),
                    document.getElementById('tuplestore-panel'),
                  ].filter(Boolean);
                  
                  // Add click event to each nav link
                  navLinks.forEach(link => {
                    link.addEventListener('click', (e) => {
                      e.preventDefault();
                      
                      // Remove active class from all links
                      navLinks.forEach(l => l.classList.remove('active'));
                      
                      // Add active class to clicked link
                      link.classList.add('active');
                      
                      // Get the target panel ID
                      const targetId = link.getAttribute('href').substring(1);
                      
                      // Show/hide panels based on target
                      panels.forEach(panel => {
                        if (panel && panel.id.includes(targetId)) {
                          panel.style.display = 'block';
                        } else if (panel) {
                          panel.style.display = 'none';
                        }
                      });
                    });
                  });
                  
                  // Initially show only system info panel
                  panels.forEach(panel => {
                    if (panel && panel.id === 'system-info-panel') {
                      panel.style.display = 'block';
                    } else if (panel) {
                      panel.style.display = 'none';
                    }
                  });
                };
                
                // Initial load
                loadSystemInfo();
                loadModules();
                loadServices();
                setupTupleStore();
                setupNavigation();
                
                // Set up auto-refresh for system info and other panels
                refreshTimer = setInterval(() => {
                  console.log("Auto-refreshing dashboard data");
                  loadSystemInfo();
                  loadModules();
                  loadServices();
                }, 5000);
                
                // Return component API
                return {
                  refresh: () => {
                    loadSystemInfo();
                    loadModules();
                    loadServices();
                  },
                  cleanup: () => {
                    if (refreshTimer) {
                      clearInterval(refreshTimer);
                    }
                  }
                };
              },
              
              // Cleanup when component is removed
              cleanup: (element) => {
                const instance = (element as any).__componentInstance;
                if (instance && instance.cleanup) {
                  instance.cleanup();
                }
              },
              },
              styles: '.admin-dashboard-main-view {' +
                '  padding: 1rem;' +
                '}' +
                '' +
                '.dashboard-content {' +
                '  display: grid;' +
                '  grid-template-columns: repeat(2, 1fr);' +
                '  grid-template-rows: auto;' +
                '  gap: 1rem;' +
                '}' +
                '' +
                '.error {' +
                '  color: #721c24;' +
                '  background-color: #f8d7da;' +
                '  padding: 0.75rem;' +
                '  border-radius: 0.375rem;' +
                '  border: 1px solid #f5c6cb;' +
                '}' +
                '' +
                '.system-info-panel, .modules-panel, .services-panel, .tuplestore-panel {' +
                '  background: white;' +
                '  border-radius: 8px;' +
                '  padding: 1rem;' +
                '  box-shadow: 0 2px 4px rgba(0,0,0,0.1);' +
                '  margin-bottom: 1rem;' +
                '}' +
                '' +
                '@media (max-width: 768px) {' +
                '  .dashboard-content {' +
                '    grid-template-columns: 1fr;' +
                '  }' +
                '}' +
                '' +
                'table {' +
                '  width: 100%;' +
                '  border-collapse: collapse;' +
                '}' +
                '' +
                'th, td {' +
                '  padding: 0.5rem;' +
                '  text-align: left;' +
                '  border-bottom: 1px solid #eee;' +
                '}' +
                '' +
                'th {' +
                '  font-weight: 600;' +
                '}' +
                '' +
                '.status-indicator {' +
                '  display: inline-block;' +
                '  padding: 0.25rem 0.5rem;' +
                '  border-radius: 4px;' +
                '  font-size: 0.875rem;' +
                '}' +
                '' +
                '.status-active {' +
                '  background-color: #d4edda;' +
                '  color: #155724;' +
                '}' +
                '' +
                '.status-inactive {' +
                '  background-color: #f8f9fa;' +
                '  color: #6c757d;' +
                '}' +
                '' +
                '.status-error {' +
                '  background-color: #f8d7da;' +
                '  color: #721c24;' +
                '}' +
                '' +
                '.button {' +
                '  display: inline-block;' +
                '  background-color: #3498db;' +
                '  color: white;' +
                '  padding: 0.5rem 1rem;' +
                '  border-radius: 4px;' +
                '  text-decoration: none;' +
                '  margin-right: 0.5rem;' +
                '  cursor: pointer;' +
                '  border: none;' +
                '}' +
                '' +
                '.button:hover {' +
                '  background-color: #2980b9;' +
                '}' +
                '' +
                '.button.danger {' +
                '  background-color: #e74c3c;' +
                '}' +
                '' +
                '.button.danger:hover {' +
                '  background-color: #c0392b;' +
                '}' +
                '' +
                'pre {' +
                '  background-color: #f8f9fa;' +
                '  padding: 0.5rem;' +
                '  border-radius: 4px;' +
                '  overflow: auto;' +
                '  max-height: 300px;' +
                '}'
            });
          };
          
          // Register components
          registerDashboardComponents();
          console.log('Registered dashboard components in browser');
          
          // Create sidebar
          const sidebar = window.AppletHub.services.uiComponentService.createComponent('admin-dashboard-sidebar');
          if (sidebar) {
            sidebarContainer.appendChild(sidebar);
          } else {
            console.error('Failed to create sidebar component');
          }
          
          // Create main view with panels
          const mainView = window.AppletHub.services.uiComponentService.createComponent('admin-dashboard-main-view', {
            title: 'Admin Dashboard'
          });
          
          if (mainView) {
            dashboardContainer.appendChild(mainView);
          } else {
            console.error('Failed to create main view component');
            // Handle the case where main view component creation failed
            dashboardContainer.innerHTML = '<div class="error-panel">Failed to load dashboard components</div>';
            
            // Fall back to basic HTML content loading
            loadBasicDashboard();
          }
        } catch (error) {
          console.error('Error creating dashboard components:', error);
          dashboardContainer.innerHTML = '<div class="error-panel">Error creating dashboard components: ' + error.message + '</div>';
          loadBasicDashboard();
        }
      } else {
        console.warn('UI component service not available, using basic HTML dashboard');
        loadBasicDashboard();
      }
    });
    
    // Basic HTML dashboard loading (fallback)
    function loadBasicDashboard() {
      // Load system info
      loadSystemInfo();
      // Load modules
      loadModules();
      // Load services
      loadServices();
      // Setup TupleStore explorer
      setupTupleStore();
      // Setup navigation
      setupNavigation();
      
      // Auto-refresh system info every 5 seconds
      setInterval(loadSystemInfo, 5000);
    }
    
    // Load system info (fallback)
    async function loadSystemInfo() {
      const container = document.getElementById('system-info-content');
      if (!container) return;
      
      const stats = await fetchApi('/admin/api/system-stats');
      
      if (!stats) {
        container.innerHTML = '<div class="error">Failed to load system information</div>';
        return;
      }
      
      container.innerHTML = 
        '<table>' +
          '<tr>' +
            '<th>AppletHub Version</th>' +
            '<td>' + (stats.version || '0.1.0') + '</td>' +
          '</tr>' +
          '<tr>' +
            '<th>Uptime</th>' +
            '<td>' + formatUptime(stats.uptime) + '</td>' +
          '</tr>' +
          '<tr>' +
            '<th>CPU Usage</th>' +
            '<td>' + stats.cpu + '%</td>' +
          '</tr>' +
          '<tr>' +
            '<th>Memory Usage</th>' +
            '<td>' + stats.memory + ' MB</td>' +
          '</tr>' +
          '<tr>' +
            '<th>Loaded Modules</th>' +
            '<td>' + stats.modulesCount + '</td>' +
          '</tr>' +
          '<tr>' +
            '<th>Registered Services</th>' +
            '<td>' + stats.servicesCount + '</td>' +
          '</tr>' +
        '</table>';
    }
    
    // Format uptime
    function formatUptime(ms) {
      if (!ms) return 'Unknown';
      
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) {
        return days + 'd ' + (hours % 24) + 'h ' + (minutes % 60) + 'm';
      } else if (hours > 0) {
        return hours + 'h ' + (minutes % 60) + 'm ' + (seconds % 60) + 's';
      } else if (minutes > 0) {
        return minutes + 'm ' + (seconds % 60) + 's';
      } else {
        return seconds + 's';
      }
    }
    
    // Load modules (fallback)
    async function loadModules() {
      const container = document.getElementById('modules-content');
      if (!container) return;
      
      const modules = await fetchApi('/admin/api/modules');
      
      if (!modules || !modules.length) {
        container.innerHTML = '<div class="error">No modules found</div>';
        return;
      }
      
      let html = '<table><tr><th>Module</th><th>Version</th><th>Status</th><th>Actions</th></tr>';
      
      modules.forEach(module => {
        html += 
          '<tr>' +
            '<td>' + module.name + '</td>' +
            '<td>' + module.version + '</td>' +
            '<td>' + module.status + '</td>' +
            '<td>' +
              (module.status === 'active' 
                ? '<button class="button danger" data-action="stop" data-id="' + module.id + '">Stop</button>'
                : '<button class="button" data-action="start" data-id="' + module.id + '">Start</button>'
              ) +
            '</td>' +
          '</tr>';
      });
      
      html += '</table>';
      container.innerHTML = html;
      
      // Add event listeners to buttons
      container.querySelectorAll('button[data-action]').forEach(button => {
        button.addEventListener('click', async () => {
          const action = button.getAttribute('data-action');
          const id = button.getAttribute('data-id');
          
          const response = await fetchApi('/admin/api/modules/' + id + '/' + action);
          if (response && response.success) {
            loadModules(); // Refresh the list
          }
        });
      });
    }
    
    // Load services (fallback)
    async function loadServices() {
      const container = document.getElementById('services-content');
      if (!container) return;
      
      const services = await fetchApi('/admin/api/services');
      
      if (!services || !services.length) {
        container.innerHTML = '<div class="error">No services found</div>';
        return;
      }
      
      let html = '<table><tr><th>Service</th><th>Version</th><th>Provider</th><th>Methods</th></tr>';
      
      services.forEach(service => {
        html += 
          '<tr>' +
            '<td>' + service.id + '</td>' +
            '<td>' + service.version + '</td>' +
            '<td>' + service.provider + '</td>' +
            '<td>' + (service.methods ? service.methods.join(', ') : '') + '</td>' +
          '</tr>';
      });
      
      html += '</table>';
      container.innerHTML = html;
    }
    
    // Handle TupleStore search (fallback)
    async function setupTupleStore() {
      const searchButton = document.getElementById('tuplestore-search');
      if (!searchButton) return;
      
      const pathInput = document.getElementById('tuplestore-path');
      const resultsContainer = document.getElementById('tuplestore-results');
      
      searchButton.addEventListener('click', async () => {
        const path = pathInput.value.trim();
        resultsContainer.innerHTML = 'Searching...';
        
        const data = await fetchApi('/admin/api/tuplestore' + (path ? '?path=' + path : ''));
        
        if (data === null) {
          resultsContainer.innerHTML = '<div class="error">Error fetching data</div>';
          return;
        }
        
        if (data === undefined) {
          resultsContainer.innerHTML = '<div class="error">Path not found</div>';
          return;
        }
        
        if (typeof data === 'object' && data !== null) {
          resultsContainer.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
        } else {
          resultsContainer.innerHTML = '<pre>' + data + '</pre>';
        }
      });
    }
    
    // Handle navigation (fallback)
    function setupNavigation() {
      const navLinks = document.querySelectorAll('.nav-link');
      if (navLinks.length === 0) return;
      
      const panels = document.querySelectorAll('.panel');
      
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          
          // Remove active class from all links
          navLinks.forEach(l => l.classList.remove('active'));
          
          // Add active class to clicked link
          link.classList.add('active');
          
          // Get the target section from the href
          const targetId = link.getAttribute('href').substring(1);
          
          // Toggle visibility of panels
          panels.forEach(panel => {
            const panelId = panel.id;
            if (panelId.includes(targetId)) {
              panel.style.display = 'block';
            } else {
              panel.style.display = 'none';
            }
          });
        });
      });
      
      // Initial state - only show system info panel
      panels.forEach(panel => {
        if (panel.id === 'system-info-panel' || panel.closest('.sidebar')) {
          panel.style.display = 'block';
        } else {
          panel.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>
      `;
      
      // Handle API requests for component data
      if (path.startsWith('/admin/api/')) {
        const apiPath = path.replace('/admin/api/', '');
        
        // System stats endpoint
        if (apiPath === 'system-stats') {
          const stats = await this.dashboardService?.getSystemStats();
          return new Response(JSON.stringify(stats), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Modules list endpoint
        if (apiPath === 'modules') {
          const modules = await this.dashboardService?.listModules();
          return new Response(JSON.stringify(modules), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Single module endpoint
        if (apiPath.startsWith('modules/') && apiPath.includes('/start')) {
          const id = apiPath.split('/')[1];
          const result = await this.dashboardService?.startModule(id);
          return new Response(JSON.stringify({ success: result }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        if (apiPath.startsWith('modules/') && apiPath.includes('/stop')) {
          const id = apiPath.split('/')[1];
          const result = await this.dashboardService?.stopModule(id);
          return new Response(JSON.stringify({ success: result }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        if (apiPath.startsWith('modules/')) {
          const id = apiPath.split('/')[1];
          const module = await this.dashboardService?.getModule(id);
          return new Response(JSON.stringify(module), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Services list endpoint
        if (apiPath === 'services') {
          const services = await this.dashboardService?.listServices();
          return new Response(JSON.stringify(services), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // TupleStore data endpoint
        if (apiPath === 'tuplestore') {
          const path = url.searchParams.get('path');
          const data = await this.dashboardService?.getTupleStoreData(path || undefined);
          return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // API endpoint not found
        return new Response(JSON.stringify({ error: 'API endpoint not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Return main dashboard HTML for non-API requests
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }
    
    // Not an admin route
    return undefined;
  }

  /**
   * Stop the Admin Dashboard module
   */
  async stop(): Promise<boolean> {
    try {
      console.log('Stopping Admin Dashboard module');
      
      // Unregister HTTP handler
      if (this.unregisterHttpHandler) {
        this.unregisterHttpHandler();
      }
      
      this.dashboardService = null;
      this.state = ModuleState.STOPPED;
      return true;
    } catch (error) {
      console.error('Error stopping Admin Dashboard module:', error);
      this.state = ModuleState.ERROR;
      return false;
    }
  }

  /**
   * Get the module state
   */
  getState(): ModuleState {
    return this.state;
  }

  /**
   * Get the module manifest
   */
  getManifest(): any {
    return {
      id: 'admin-dashboard',
      name: 'Admin Dashboard',
      description: 'Administrative dashboard for AppletHub',
      version: '1.0.0',
      entryPoint: 'index.ts',
      capabilities: ['admin-dashboard'],
      dependencies: {
        'http-server': '^1.0.0',
      },
    };
  }

  /**
   * Get the module API
   */
  getAPI(): Record<string, any> {
    return {
      getName: () => 'Admin Dashboard',
      getVersion: () => '1.0.0',
      getDashboardService: () => this.dashboardService,
    };
  }
}

/**
 * Create the Admin Dashboard module
 */
export function createModule(): Module {
  return new AdminDashboardModule();
}