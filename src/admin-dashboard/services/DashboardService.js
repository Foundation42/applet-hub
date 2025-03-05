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
exports.DashboardService = void 0;
/**
 * Dashboard Service Implementation
 */
var DashboardService = /** @class */ (function () {
    function DashboardService(context) {
        this.context = context;
        this.startTime = Date.now();
    }
    /**
     * Get system statistics
     */
    DashboardService.prototype.getSystemStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var modules, services;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.listModules()];
                    case 1:
                        modules = _a.sent();
                        return [4 /*yield*/, this.listServices()];
                    case 2:
                        services = _a.sent();
                        return [2 /*return*/, {
                                memory: Math.floor(50 + Math.random() * 100),
                                cpu: Math.floor(Math.random() * 30),
                                uptime: Date.now() - this.startTime,
                                modulesCount: modules.length,
                                servicesCount: services.length,
                            }];
                }
            });
        });
    };
    /**
     * Get AppletHub version
     */
    DashboardService.prototype.getVersion = function () {
        // In a real implementation, we would get this from the core module
        return '0.1.0';
    };
    /**
     * List all modules
     */
    DashboardService.prototype.listModules = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In a real implementation, we would get this from the ModuleManager
                // For now, we'll return a static list
                return [2 /*return*/, [
                        {
                            id: 'core',
                            name: 'Core',
                            version: '0.1.0',
                            description: 'Core AppletHub functionality',
                            status: 'active',
                            required: true,
                            capabilities: ['core'],
                        },
                        {
                            id: 'ui-components',
                            name: 'UI Components',
                            version: '0.1.0',
                            description: 'UI component library',
                            status: 'active',
                            required: true,
                            capabilities: ['ui-components'],
                        },
                        {
                            id: 'admin-dashboard',
                            name: 'Admin Dashboard',
                            version: '0.1.0',
                            description: 'Administrator dashboard for AppletHub',
                            status: 'active',
                            required: false,
                            dependencies: { 'ui-components': '^1.0.0' },
                            capabilities: ['ui-components'],
                        },
                        {
                            id: 'http-server',
                            name: 'HTTP Server',
                            version: '0.1.0',
                            description: 'HTTP server implementation',
                            status: 'inactive',
                            required: false,
                        },
                        {
                            id: 'websocket-server',
                            name: 'WebSocket Server',
                            version: '0.1.0',
                            description: 'WebSocket server implementation',
                            status: 'inactive',
                            required: false,
                            dependencies: { 'http-server': '^1.0.0' },
                        },
                    ]];
            });
        });
    };
    /**
     * Get a module by ID
     */
    DashboardService.prototype.getModule = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var modules;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.listModules()];
                    case 1:
                        modules = _a.sent();
                        return [2 /*return*/, modules.find(function (m) { return m.id === id; }) || null];
                }
            });
        });
    };
    /**
     * Start a module
     */
    DashboardService.prototype.startModule = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In a real implementation, we would call the ModuleManager
                console.log("Starting module ".concat(id));
                return [2 /*return*/, true];
            });
        });
    };
    /**
     * Stop a module
     */
    DashboardService.prototype.stopModule = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In a real implementation, we would call the ModuleManager
                console.log("Stopping module ".concat(id));
                return [2 /*return*/, true];
            });
        });
    };
    /**
     * List all services
     */
    DashboardService.prototype.listServices = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In a real implementation, we would get this from the ServiceRegistry
                // For now, we'll return a static list
                return [2 /*return*/, [
                        {
                            id: 'uiComponentService',
                            version: '1.0.0',
                            provider: 'ui-components',
                            methods: ['registerComponent', 'getComponent', 'createComponent'],
                        },
                        {
                            id: 'dashboardService',
                            version: '1.0.0',
                            provider: 'admin-dashboard',
                            methods: [
                                'getSystemStats',
                                'getVersion',
                                'listModules',
                                'getModule',
                                'startModule',
                                'stopModule',
                                'listServices',
                            ],
                        },
                    ]];
            });
        });
    };
    /**
     * Get TupleStore data
     */
    DashboardService.prototype.getTupleStoreData = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var data, parts, current, _i, parts_1, part;
            return __generator(this, function (_a) {
                data = {
                    system: {
                        version: this.getVersion(),
                        startTime: this.startTime,
                    },
                    user: {
                        preferences: {
                            theme: 'light',
                            language: 'en',
                        },
                    },
                    modules: {
                        core: {
                            loaded: true,
                            version: '0.1.0',
                        },
                        'ui-components': {
                            loaded: true,
                            version: '0.1.0',
                        },
                    },
                };
                if (!path)
                    return [2 /*return*/, data];
                parts = path.split('.');
                current = data;
                for (_i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
                    part = parts_1[_i];
                    if (current === null || current === undefined)
                        return [2 /*return*/, undefined];
                    // Use safe access for any type of data
                    current = (typeof current === 'object' && current !== null) ? current[part] : undefined;
                }
                return [2 /*return*/, current];
            });
        });
    };
    return DashboardService;
}());
exports.DashboardService = DashboardService;
