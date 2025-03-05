"use strict";
// ModuleSystem.ts - Core interfaces for the module system
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleState = void 0;
/**
 * Module instance state
 */
var ModuleState;
(function (ModuleState) {
    /**
     * Module is registered but not loaded
     */
    ModuleState["REGISTERED"] = "registered";
    /**
     * Module is currently loading
     */
    ModuleState["LOADING"] = "loading";
    /**
     * Module is loaded but not initialized
     */
    ModuleState["LOADED"] = "loaded";
    /**
     * Module is initialized and active
     */
    ModuleState["ACTIVE"] = "active";
    /**
     * Module has been stopped
     */
    ModuleState["STOPPED"] = "stopped";
    /**
     * Module has encountered an error
     */
    ModuleState["ERROR"] = "error";
})(ModuleState || (exports.ModuleState = ModuleState = {}));
