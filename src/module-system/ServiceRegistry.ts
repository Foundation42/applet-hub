// ServiceRegistry.ts - Implementation of the service registry

import { ServiceDefinition, ServiceRegistry } from "./ModuleSystem";

/**
 * Default implementation of the service registry
 */
export class DefaultServiceRegistry implements ServiceRegistry {
  private services: Map<string, Map<string, ServiceDefinition>>;

  /**
   * Create a new service registry
   */
  constructor() {
    this.services = new Map();
  }

  /**
   * Register a service
   */
  registerService(definition: ServiceDefinition): boolean {
    // Validate the service definition
    if (!this.validateServiceDefinition(definition)) {
      return false;
    }

    const serviceKey = this.getServiceKey(definition.id, definition.namespace);

    // Create version map if it doesn't exist
    if (!this.services.has(serviceKey)) {
      this.services.set(serviceKey, new Map());
    }

    // Register the service
    const versions = this.services.get(serviceKey)!;
    versions.set(definition.version, { ...definition });

    console.log(`Registered service ${serviceKey} v${definition.version}`);
    return true;
  }

  /**
   * Get a service by ID and optional version
   */
  getService(
    id: string,
    version?: string,
    namespace?: string
  ): Record<string, Function> | undefined {
    const serviceKey = this.getServiceKey(id, namespace);
    const versions = this.services.get(serviceKey);

    if (!versions) {
      return undefined;
    }

    // If version is specified, return that version
    if (version) {
      const service = versions.get(version);
      return service?.implementation;
    }

    // Otherwise, find the latest version
    let latestVersion: string | null = null;
    let latestService: ServiceDefinition | null = null;

    for (const [ver, service] of versions.entries()) {
      if (!latestVersion || this.isNewerVersion(ver, latestVersion)) {
        latestVersion = ver;
        latestService = service;
      }
    }

    return latestService?.implementation;
  }

  /**
   * Check if a service exists
   */
  hasService(id: string, version?: string, namespace?: string): boolean {
    const serviceKey = this.getServiceKey(id, namespace);
    const versions = this.services.get(serviceKey);

    if (!versions) {
      return false;
    }

    if (version) {
      return versions.has(version);
    }

    return versions.size > 0;
  }

  /**
   * List all available services
   */
  listServices(): ServiceDefinition[] {
    const result: ServiceDefinition[] = [];

    for (const versions of this.services.values()) {
      for (const service of versions.values()) {
        result.push({ ...service });
      }
    }

    return result;
  }
  
  /**
   * Get all services with their versions
   */
  getAllServices(): Map<string, Map<string, ServiceDefinition>> {
    // Return a copy of the services map
    const result = new Map<string, Map<string, ServiceDefinition>>();
    
    for (const [key, versions] of this.services.entries()) {
      const versionsCopy = new Map<string, ServiceDefinition>();
      
      for (const [version, service] of versions.entries()) {
        versionsCopy.set(version, { ...service });
      }
      
      result.set(key, versionsCopy);
    }
    
    return result;
  }

  /**
   * Unregister a service
   */
  unregisterService(id: string, version?: string, namespace?: string): boolean {
    const serviceKey = this.getServiceKey(id, namespace);
    const versions = this.services.get(serviceKey);

    if (!versions) {
      return false;
    }

    if (version) {
      // Remove specific version
      const removed = versions.delete(version);

      // Remove the service entirely if no versions remain
      if (versions.size === 0) {
        this.services.delete(serviceKey);
      }

      return removed;
    } else {
      // Remove all versions
      this.services.delete(serviceKey);
      return true;
    }
  }

  /**
   * Get services by capability
   */
  getServicesByCapability(capability: string): ServiceDefinition[] {
    const result: ServiceDefinition[] = [];

    for (const versions of this.services.values()) {
      for (const service of versions.values()) {
        if (service.capabilities?.includes(capability)) {
          result.push({ ...service });
        }
      }
    }

    return result;
  }

  /**
   * Validate a service definition
   */
  private validateServiceDefinition(definition: ServiceDefinition): boolean {
    // Required fields
    if (!definition.id || !definition.implementation || !definition.version) {
      return false;
    }

    // Check implementation is an object with functions
    if (
      typeof definition.implementation !== "object" ||
      definition.implementation === null
    ) {
      return false;
    }

    // Check at least one method
    const methods = Object.values(definition.implementation).filter(
      (value) => typeof value === "function"
    );

    if (methods.length === 0) {
      return false;
    }

    return true;
  }

  /**
   * Generate a unique service key
   */
  private getServiceKey(id: string, namespace?: string): string {
    return namespace ? `${namespace}:${id}` : id;
  }

  /**
   * Compare semantic versions
   */
  private isNewerVersion(v1: string, v2: string): boolean {
    const parts1 = v1.split(".").map(Number);
    const parts2 = v2.split(".").map(Number);

    // Compare each part
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = i < parts1.length ? parts1[i] : 0;
      const p2 = i < parts2.length ? parts2[i] : 0;

      if (p1 > p2) return true;
      if (p1 < p2) return false;
    }

    return false; // Equal versions
  }
}
