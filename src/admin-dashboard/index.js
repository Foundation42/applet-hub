"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDashboardModule = void 0;
exports.createModule = createModule;
// admin-dashboard/index.ts
var ModuleSystem_1 = require("../module-system/ModuleSystem");
var DashboardService_1 = require("./services/DashboardService");
/**
 * Admin Dashboard Module
 */
var AdminDashboardModule = /** @class */ (function () {
    function AdminDashboardModule() {
        this.context = null;
        this.state = ModuleSystem_1.ModuleState.REGISTERED;
        this.dashboardService = null;
        this.httpService = null;
        this.unregisterHttpHandler = null;
    }
    /**
     * Initialize the Admin Dashboard module
     */
    AdminDashboardModule.prototype.initialize = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var httpHandler;
            return __generator(this, function (_a) {
                try {
                    this.state = ModuleSystem_1.ModuleState.LOADING;
                    this.context = context;
                    console.log('Initializing Admin Dashboard module');
                    // Get HTTP server service
                    this.httpService = context.services.getService('httpServer');
                    if (!this.httpService) {
                        console.error('HTTP server service not found');
                        this.state = ModuleSystem_1.ModuleState.ERROR;
                        return [2 /*return*/, false];
                    }
                    // Create and register dashboard service
                    this.dashboardService = new DashboardService_1.DashboardService(context);
                    context.services.registerService({
                        id: 'dashboardService',
                        implementation: this.dashboardService,
                        version: '1.0.0',
                        metadata: {
                            description: 'Administrative dashboard service for AppletHub',
                        },
                    });
                    httpHandler = {
                        handleRequest: this.handleRequest.bind(this),
                    };
                    this.unregisterHttpHandler = this.httpService.registerHandler(httpHandler, 100 // High priority to handle admin routes first
                    );
                    this.state = ModuleSystem_1.ModuleState.ACTIVE;
                    return [2 /*return*/, true];
                }
                catch (error) {
                    console.error('Error initializing Admin Dashboard module:', error);
                    this.state = ModuleSystem_1.ModuleState.ERROR;
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle HTTP requests for the admin dashboard
     */
    AdminDashboardModule.prototype.handleRequest = function (request, server) {
        return __awaiter(this, void 0, void 0, function () {
            var url, path, html, apiPath, stats, modules, id, result, id, result, id, module_1, services, path_1, data;
            var _a, _b, _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        url = new URL(request.url);
                        path = url.pathname;
                        if (!(path === '/admin' || path.startsWith('/admin/'))) return [3 /*break*/, 16];
                        console.log("Admin dashboard handling request: ".concat(path));
                        html = "\n<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>AppletHub Admin Dashboard</title>\n  <style>\n    body {\n      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;\n      margin: 0;\n      padding: 0;\n      background-color: #f5f5f5;\n      color: #333;\n    }\n    header {\n      background-color: #2c3e50;\n      color: white;\n      padding: 1rem;\n      box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n    }\n    main {\n      padding: 0;\n      max-width: 1500px;\n      margin: 0 auto;\n    }\n    .dashboard-layout {\n      display: flex;\n      min-height: calc(100vh - 60px);\n    }\n    .sidebar {\n      width: 250px;\n      background-color: #f8f9fa;\n      border-right: 1px solid #e9ecef;\n      padding: 1.5rem 0;\n    }\n    .sidebar .panel {\n      background: transparent;\n      box-shadow: none;\n      border-radius: 0;\n    }\n    .nav-list {\n      list-style: none;\n      padding: 0;\n      margin: 0;\n    }\n    .nav-link {\n      display: block;\n      padding: 0.75rem 1.5rem;\n      color: #495057;\n      text-decoration: none;\n      border-left: 3px solid transparent;\n      transition: all 0.2s ease;\n    }\n    .nav-link:hover, .nav-link.active {\n      background-color: #e9ecef;\n      color: #2c3e50;\n      border-left-color: #3498db;\n    }\n    .content {\n      flex: 1;\n      padding: 1.5rem;\n    }\n    .dashboard-grid {\n      display: grid;\n      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));\n      gap: 1.5rem;\n    }\n    .panel {\n      background-color: white;\n      border-radius: 8px;\n      padding: 1.5rem;\n      box-shadow: 0 2px 8px rgba(0,0,0,0.1);\n    }\n    h1, h2, h3 {\n      margin-top: 0;\n    }\n    table {\n      width: 100%;\n      border-collapse: collapse;\n    }\n    th, td {\n      padding: 0.5rem;\n      text-align: left;\n      border-bottom: 1px solid #eee;\n    }\n    th {\n      font-weight: 600;\n    }\n    .button {\n      display: inline-block;\n      background-color: #3498db;\n      color: white;\n      padding: 0.5rem 1rem;\n      border-radius: 4px;\n      text-decoration: none;\n      margin-right: 0.5rem;\n      cursor: pointer;\n      border: none;\n    }\n    .button:hover {\n      background-color: #2980b9;\n    }\n    .button.danger {\n      background-color: #e74c3c;\n    }\n    .button.danger:hover {\n      background-color: #c0392b;\n    }\n  </style>\n</head>\n<body>\n  <header>\n    <h1>AppletHub Admin Dashboard</h1>\n  </header>\n  <main>\n    <div class=\"dashboard-layout\">\n      <div class=\"sidebar\">\n        <div class=\"panel\">\n          <h2>Navigation</h2>\n          <ul class=\"nav-list\">\n            <li><a href=\"#system-info\" class=\"nav-link active\">System Info</a></li>\n            <li><a href=\"#modules\" class=\"nav-link\">Modules</a></li>\n            <li><a href=\"#services\" class=\"nav-link\">Services</a></li>\n            <li><a href=\"#tuplestore\" class=\"nav-link\">TupleStore Explorer</a></li>\n          </ul>\n        </div>\n      </div>\n      <div class=\"content\">\n        <div class=\"dashboard-grid\">\n          <div class=\"panel\" id=\"system-info-panel\">\n            <h2>System Information</h2>\n            <div id=\"system-info-content\">Loading system information...</div>\n          </div>\n          \n          <div class=\"panel\" id=\"modules-panel\">\n            <h2>Modules</h2>\n            <div id=\"modules-content\">Loading modules...</div>\n          </div>\n          \n          <div class=\"panel\" id=\"tuplestore-panel\">\n            <h2>TupleStore Explorer</h2>\n            <div id=\"tuplestore-content\">\n              <input type=\"text\" id=\"tuplestore-path\" placeholder=\"Enter path (e.g. system.version)\" style=\"width: 100%; padding: 0.5rem; margin-bottom: 1rem; border: 1px solid #ddd; border-radius: 4px;\">\n              <button class=\"button\" id=\"tuplestore-search\">Search</button>\n              <div id=\"tuplestore-results\">Enter a path to search</div>\n            </div>\n          </div>\n\n          <div class=\"panel\" id=\"services-panel\">\n            <h2>Services</h2>\n            <div id=\"services-content\">Loading services...</div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </main>\n  <script>\n    // Helper function to fetch and handle API data\n    async function fetchApi(endpoint) {\n      try {\n        const response = await fetch(endpoint);\n        if (!response.ok) {\n          throw new Error('Network response was not ok');\n        }\n        return await response.json();\n      } catch (error) {\n        console.error('Error fetching data:', error);\n        return null;\n      }\n    }\n\n    // Load system info\n    async function loadSystemInfo() {\n      const container = document.getElementById('system-info-content');\n      const stats = await fetchApi('/admin/api/system-stats');\n      \n      if (!stats) {\n        container.innerHTML = '<div class=\"error\">Failed to load system information</div>';\n        return;\n      }\n      \n      container.innerHTML = `\n        <table>\n          <tr>\n            <th>AppletHub Version</th>\n            <td>${stats.version || '0.1.0'}</td>\n          </tr>\n          <tr>\n            <th>Uptime</th>\n            <td>${formatUptime(stats.uptime)}</td>\n          </tr>\n          <tr>\n            <th>CPU Usage</th>\n            <td>${stats.cpu}%</td>\n          </tr>\n          <tr>\n            <th>Memory Usage</th>\n            <td>${stats.memory} MB</td>\n          </tr>\n          <tr>\n            <th>Loaded Modules</th>\n            <td>${stats.modulesCount}</td>\n          </tr>\n          <tr>\n            <th>Registered Services</th>\n            <td>${stats.servicesCount}</td>\n          </tr>\n        </table>\n      `;\n    }\n\n    // Format uptime\n    function formatUptime(ms) {\n      if (!ms) return 'Unknown';\n      \n      const seconds = Math.floor(ms / 1000);\n      const minutes = Math.floor(seconds / 60);\n      const hours = Math.floor(minutes / 60);\n      const days = Math.floor(hours / 24);\n      \n      if (days > 0) {\n        return `${days}d ${hours % 24}h ${minutes % 60}m`;\n      } else if (hours > 0) {\n        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;\n      } else if (minutes > 0) {\n        return `${minutes}m ${seconds % 60}s`;\n      } else {\n        return `${seconds}s`;\n      }\n    }\n\n    // Load modules\n    async function loadModules() {\n      const container = document.getElementById('modules-content');\n      const modules = await fetchApi('/admin/api/modules');\n      \n      if (!modules || !modules.length) {\n        container.innerHTML = '<div class=\"error\">No modules found</div>';\n        return;\n      }\n      \n      let html = '<table><tr><th>Module</th><th>Version</th><th>Status</th><th>Actions</th></tr>';\n      \n      modules.forEach(module => {\n        html += `\n          <tr>\n            <td>${module.name}</td>\n            <td>${module.version}</td>\n            <td>${module.status}</td>\n            <td>\n              ${module.status === 'active' \n                ? `<button class=\"button danger\" data-action=\"stop\" data-id=\"${module.id}\">Stop</button>`\n                : `<button class=\"button\" data-action=\"start\" data-id=\"${module.id}\">Start</button>`\n              }\n            </td>\n          </tr>\n        `;\n      });\n      \n      html += '</table>';\n      container.innerHTML = html;\n      \n      // Add event listeners to buttons\n      container.querySelectorAll('button[data-action]').forEach(button => {\n        button.addEventListener('click', async () => {\n          const action = button.getAttribute('data-action');\n          const id = button.getAttribute('data-id');\n          \n          const response = await fetchApi(`/admin/api/modules/${id}/${action}`);\n          if (response && response.success) {\n            loadModules(); // Refresh the list\n          }\n        });\n      });\n    }\n\n    // Load services\n    async function loadServices() {\n      const container = document.getElementById('services-content');\n      const services = await fetchApi('/admin/api/services');\n      \n      if (!services || !services.length) {\n        container.innerHTML = '<div class=\"error\">No services found</div>';\n        return;\n      }\n      \n      let html = '<table><tr><th>Service</th><th>Version</th><th>Provider</th><th>Methods</th></tr>';\n      \n      services.forEach(service => {\n        html += `\n          <tr>\n            <td>${service.id}</td>\n            <td>${service.version}</td>\n            <td>${service.provider}</td>\n            <td>${service.methods ? service.methods.join(', ') : ''}</td>\n          </tr>\n        `;\n      });\n      \n      html += '</table>';\n      container.innerHTML = html;\n    }\n\n    // Handle TupleStore search\n    async function setupTupleStore() {\n      const searchButton = document.getElementById('tuplestore-search');\n      const pathInput = document.getElementById('tuplestore-path');\n      const resultsContainer = document.getElementById('tuplestore-results');\n      \n      searchButton.addEventListener('click', async () => {\n        const path = pathInput.value.trim();\n        resultsContainer.innerHTML = 'Searching...';\n        \n        const data = await fetchApi(`/admin/api/tuplestore${path ? '?path=' + path : ''}`);\n        \n        if (data === null) {\n          resultsContainer.innerHTML = '<div class=\"error\">Error fetching data</div>';\n          return;\n        }\n        \n        if (data === undefined) {\n          resultsContainer.innerHTML = '<div class=\"error\">Path not found</div>';\n          return;\n        }\n        \n        if (typeof data === 'object' && data !== null) {\n          resultsContainer.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;\n        } else {\n          resultsContainer.innerHTML = `<pre>${data}</pre>`;\n        }\n      });\n    }\n\n    // Handle navigation\n    function setupNavigation() {\n      const navLinks = document.querySelectorAll('.nav-link');\n      const panels = document.querySelectorAll('.panel');\n      \n      navLinks.forEach(link => {\n        link.addEventListener('click', (e) => {\n          e.preventDefault();\n          \n          // Remove active class from all links\n          navLinks.forEach(l => l.classList.remove('active'));\n          \n          // Add active class to clicked link\n          link.classList.add('active');\n          \n          // Get the target section from the href\n          const targetId = link.getAttribute('href').substring(1);\n          \n          // Toggle visibility of panels\n          panels.forEach(panel => {\n            const panelId = panel.id;\n            if (panelId.includes(targetId)) {\n              panel.style.display = 'block';\n            } else {\n              panel.style.display = 'none';\n            }\n          });\n        });\n      });\n      \n      // Initial state - only show system info panel\n      panels.forEach(panel => {\n        if (panel.id === 'system-info-panel' || panel.closest('.sidebar')) {\n          panel.style.display = 'block';\n        } else {\n          panel.style.display = 'none';\n        }\n      });\n    }\n\n    // Initialize dashboard\n    document.addEventListener('DOMContentLoaded', () => {\n      loadSystemInfo();\n      loadModules();\n      loadServices();\n      setupTupleStore();\n      setupNavigation();\n      \n      // Auto-refresh system info every 5 seconds\n      setInterval(loadSystemInfo, 5000);\n    });\n  </script>\n</body>\n</html>\n      ";
                        if (!path.startsWith('/admin/api/')) return [3 /*break*/, 15];
                        apiPath = path.replace('/admin/api/', '');
                        if (!(apiPath === 'system-stats')) return [3 /*break*/, 2];
                        return [4 /*yield*/, ((_a = this.dashboardService) === null || _a === void 0 ? void 0 : _a.getSystemStats())];
                    case 1:
                        stats = _h.sent();
                        return [2 /*return*/, new Response(JSON.stringify(stats), {
                                headers: { 'Content-Type': 'application/json' }
                            })];
                    case 2:
                        if (!(apiPath === 'modules')) return [3 /*break*/, 4];
                        return [4 /*yield*/, ((_b = this.dashboardService) === null || _b === void 0 ? void 0 : _b.listModules())];
                    case 3:
                        modules = _h.sent();
                        return [2 /*return*/, new Response(JSON.stringify(modules), {
                                headers: { 'Content-Type': 'application/json' }
                            })];
                    case 4:
                        if (!(apiPath.startsWith('modules/') && apiPath.includes('/start'))) return [3 /*break*/, 6];
                        id = apiPath.split('/')[1];
                        return [4 /*yield*/, ((_c = this.dashboardService) === null || _c === void 0 ? void 0 : _c.startModule(id))];
                    case 5:
                        result = _h.sent();
                        return [2 /*return*/, new Response(JSON.stringify({ success: result }), {
                                headers: { 'Content-Type': 'application/json' }
                            })];
                    case 6:
                        if (!(apiPath.startsWith('modules/') && apiPath.includes('/stop'))) return [3 /*break*/, 8];
                        id = apiPath.split('/')[1];
                        return [4 /*yield*/, ((_d = this.dashboardService) === null || _d === void 0 ? void 0 : _d.stopModule(id))];
                    case 7:
                        result = _h.sent();
                        return [2 /*return*/, new Response(JSON.stringify({ success: result }), {
                                headers: { 'Content-Type': 'application/json' }
                            })];
                    case 8:
                        if (!apiPath.startsWith('modules/')) return [3 /*break*/, 10];
                        id = apiPath.split('/')[1];
                        return [4 /*yield*/, ((_e = this.dashboardService) === null || _e === void 0 ? void 0 : _e.getModule(id))];
                    case 9:
                        module_1 = _h.sent();
                        return [2 /*return*/, new Response(JSON.stringify(module_1), {
                                headers: { 'Content-Type': 'application/json' }
                            })];
                    case 10:
                        if (!(apiPath === 'services')) return [3 /*break*/, 12];
                        return [4 /*yield*/, ((_f = this.dashboardService) === null || _f === void 0 ? void 0 : _f.listServices())];
                    case 11:
                        services = _h.sent();
                        return [2 /*return*/, new Response(JSON.stringify(services), {
                                headers: { 'Content-Type': 'application/json' }
                            })];
                    case 12:
                        if (!(apiPath === 'tuplestore')) return [3 /*break*/, 14];
                        path_1 = url.searchParams.get('path');
                        return [4 /*yield*/, ((_g = this.dashboardService) === null || _g === void 0 ? void 0 : _g.getTupleStoreData(path_1 || undefined))];
                    case 13:
                        data = _h.sent();
                        return [2 /*return*/, new Response(JSON.stringify(data), {
                                headers: { 'Content-Type': 'application/json' }
                            })];
                    case 14: 
                    // API endpoint not found
                    return [2 /*return*/, new Response(JSON.stringify({ error: 'API endpoint not found' }), {
                            status: 404,
                            headers: { 'Content-Type': 'application/json' }
                        })];
                    case 15: 
                    // Return main dashboard HTML for non-API requests
                    return [2 /*return*/, new Response(html, {
                            headers: {
                                'Content-Type': 'text/html',
                            },
                        })];
                    case 16: 
                    // Not an admin route
                    return [2 /*return*/, undefined];
                }
            });
        });
    };
    /**
     * Stop the Admin Dashboard module
     */
    AdminDashboardModule.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    console.log('Stopping Admin Dashboard module');
                    // Unregister HTTP handler
                    if (this.unregisterHttpHandler) {
                        this.unregisterHttpHandler();
                    }
                    this.dashboardService = null;
                    this.state = ModuleSystem_1.ModuleState.STOPPED;
                    return [2 /*return*/, true];
                }
                catch (error) {
                    console.error('Error stopping Admin Dashboard module:', error);
                    this.state = ModuleSystem_1.ModuleState.ERROR;
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get the module state
     */
    AdminDashboardModule.prototype.getState = function () {
        return this.state;
    };
    /**
     * Get the module manifest
     */
    AdminDashboardModule.prototype.getManifest = function () {
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
    };
    /**
     * Get the module API
     */
    AdminDashboardModule.prototype.getAPI = function () {
        var _this = this;
        return {
            getName: function () { return 'Admin Dashboard'; },
            getVersion: function () { return '1.0.0'; },
            getDashboardService: function () { return _this.dashboardService; },
        };
    };
    return AdminDashboardModule;
}());
exports.AdminDashboardModule = AdminDashboardModule;
/**
 * Create the Admin Dashboard module
 */
function createModule() {
    return new AdminDashboardModule();
}
