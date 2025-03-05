"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpServerModule = void 0;
exports.createModule = createModule;
// http-server/index.ts
var ModuleSystem_1 = require("../module-system/ModuleSystem");
var bun_1 = require("bun");
/**
 * HTTP server module
 */
var HttpServerModule = /** @class */ (function () {
    function HttpServerModule() {
        this.context = null;
        this.state = ModuleSystem_1.ModuleState.REGISTERED;
        this.config = {
            port: 3000,
            host: "localhost",
            basePath: "/",
        };
        this.server = null;
        this.handlers = [];
    }
    /**
     * Initialize the HTTP server module
     */
    HttpServerModule.prototype.initialize = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var storedConfig, service, serviceDefinition, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        this.state = ModuleSystem_1.ModuleState.LOADING;
                        this.context = context;
                        return [4 /*yield*/, context.store.get("config")];
                    case 1:
                        storedConfig = _a.sent();
                        if (storedConfig) {
                            this.config = __assign(__assign({}, this.config), storedConfig);
                        }
                        service = {
                            registerHandler: this.registerHandler.bind(this),
                            getConfig: this.getConfig.bind(this),
                            setConfig: this.setConfig.bind(this),
                            getServer: this.getServer.bind(this),
                            restart: this.restart.bind(this),
                        };
                        serviceDefinition = {
                            id: "httpServer",
                            implementation: service,
                            version: "1.0.0",
                            metadata: {
                                description: "HTTP server service",
                            },
                        };
                        context.services.registerService(serviceDefinition);
                        // Start the server
                        return [4 /*yield*/, this.startServer()];
                    case 2:
                        // Start the server
                        _a.sent();
                        // Subscribe to configuration changes
                        context.store.subscribe("config", function (newConfig) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        console.log("HTTP server configuration changed:", newConfig);
                                        this.config = __assign(__assign({}, this.config), newConfig);
                                        return [4 /*yield*/, this.restart()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        this.state = ModuleSystem_1.ModuleState.ACTIVE;
                        return [2 /*return*/, true];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Error initializing HTTP server module:", error_1);
                        this.state = ModuleSystem_1.ModuleState.ERROR;
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stop the HTTP server module
     */
    HttpServerModule.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (this.server) {
                        this.server.stop();
                        this.server = null;
                    }
                    this.state = ModuleSystem_1.ModuleState.STOPPED;
                    return [2 /*return*/, true];
                }
                catch (error) {
                    console.error("Error stopping HTTP server module:", error);
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
    HttpServerModule.prototype.getState = function () {
        return this.state;
    };
    /**
     * Get the module manifest
     */
    HttpServerModule.prototype.getManifest = function () {
        return {
            id: "http-server",
            name: "HTTP Server",
            description: "Core HTTP server module for AppletHub",
            version: "1.0.0",
            entryPoint: "index.ts",
            capabilities: ["http-server"],
            dependencies: {},
        };
    };
    /**
     * Get the module API
     */
    HttpServerModule.prototype.getAPI = function () {
        return {};
    };
    /**
     * Start the HTTP server
     */
    HttpServerModule.prototype.startServer = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (this.server) {
                        this.server.stop();
                    }
                    this.server = (0, bun_1.serve)({
                        port: this.config.port,
                        hostname: this.config.host,
                        fetch: this.handleRequest.bind(this),
                    });
                    console.log("HTTP server started on http://".concat(this.config.host, ":").concat(this.config.port));
                    return [2 /*return*/, true];
                }
                catch (error) {
                    console.error("Error starting HTTP server:", error);
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle an HTTP request
     */
    HttpServerModule.prototype.handleRequest = function (request, server) {
        return __awaiter(this, void 0, void 0, function () {
            var url, path, sortedHandlers, _i, sortedHandlers_1, handler, response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = new URL(request.url);
                        path = url.pathname;
                        if (this.config.basePath !== "/" &&
                            !path.startsWith(this.config.basePath)) {
                            return [2 /*return*/, new Response("Not Found", { status: 404 })];
                        }
                        sortedHandlers = __spreadArray([], this.handlers, true).sort(function (a, b) { return b.priority - a.priority; });
                        _i = 0, sortedHandlers_1 = sortedHandlers;
                        _a.label = 1;
                    case 1:
                        if (!(_i < sortedHandlers_1.length)) return [3 /*break*/, 6];
                        handler = sortedHandlers_1[_i].handler;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, handler.handleRequest(request, server)];
                    case 3:
                        response = _a.sent();
                        if (response) {
                            return [2 /*return*/, response];
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.error("Error in HTTP request handler:", error_2);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: 
                    // Default response if no handler handled the request
                    return [2 /*return*/, new Response("Not Found", { status: 404 })];
                }
            });
        });
    };
    /**
     * Register a request handler
     */
    HttpServerModule.prototype.registerHandler = function (handler, priority) {
        var _this = this;
        if (priority === void 0) { priority = 0; }
        this.handlers.push({ handler: handler, priority: priority });
        return function () {
            var index = _this.handlers.findIndex(function (h) { return h.handler === handler; });
            if (index !== -1) {
                _this.handlers.splice(index, 1);
            }
        };
    };
    /**
     * Get the current server configuration
     */
    HttpServerModule.prototype.getConfig = function () {
        return __assign({}, this.config);
    };
    /**
     * Set the server configuration
     */
    HttpServerModule.prototype.setConfig = function (config) {
        this.config = __assign(__assign({}, this.config), config);
        // Update store if context is available
        if (this.context) {
            this.context.store.set("config", this.config);
        }
    };
    /**
     * Get the server instance
     */
    HttpServerModule.prototype.getServer = function () {
        return this.server;
    };
    /**
     * Restart the server
     */
    HttpServerModule.prototype.restart = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.startServer()];
            });
        });
    };
    return HttpServerModule;
}());
exports.HttpServerModule = HttpServerModule;
/**
 * Create the HTTP server module
 */
function createModule() {
    return new HttpServerModule();
}
