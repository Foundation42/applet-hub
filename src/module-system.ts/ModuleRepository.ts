// ModuleRepository.ts - Implementation of the module repository

import { ModuleManifest, ModuleRepository } from "./ModuleSystem";
import fs from "fs";
import path from "path";

/**
 * Options for the file system module repository
 */
interface FileSystemModuleRepositoryOptions {
  /**
   * Base directory for modules
   */
  modulesDir: string;

  /**
   * Manifest filename (default: manifest.json)
   */
  manifestFilename?: string;
}

/**
 * Implementation of the module repository that reads from the file system
 */
export class FileSystemModuleRepository implements ModuleRepository {
  private modulesDir: string;
  private manifestFilename: string;
  private modules: Map<string, ModuleManifest>;
  private modulesByCapability: Map<string, Set<string>>;
  private modulesBySlot: Map<string, Set<string>>;

  /**
   * Create a new file system module repository
   */
  constructor(options: FileSystemModuleRepositoryOptions) {
    this.modulesDir = options.modulesDir;
    this.manifestFilename = options.manifestFilename || "manifest.json";
    this.modules = new Map();
    this.modulesByCapability = new Map();
    this.modulesBySlot = new Map();
  }

  /**
   * Refresh the module repository by scanning the modules directory
   */
  async refresh(): Promise<void> {
    // Clear existing data
    this.modules.clear();
    this.modulesByCapability.clear();
    this.modulesBySlot.clear();

    // Ensure the modules directory exists
    if (!fs.existsSync(this.modulesDir)) {
      fs.mkdirSync(this.modulesDir, { recursive: true });
      return;
    }

    // Scan the directory for modules
    const dirEntries = fs.readdirSync(this.modulesDir, { withFileTypes: true });

    // Filter for directories
    const moduleDirs = dirEntries
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    // Process each module directory
    for (const moduleDir of moduleDirs) {
      try {
        const manifestPath = path.join(
          this.modulesDir,
          moduleDir,
          this.manifestFilename
        );

        // Skip if manifest doesn't exist
        if (!fs.existsSync(manifestPath)) {
          continue;
        }

        // Read and parse the manifest
        const manifestContent = fs.readFileSync(manifestPath, "utf8");
        const manifest = JSON.parse(manifestContent) as ModuleManifest;

        // Validate the manifest
        if (!this.validateManifest(manifest)) {
          console.warn(`Invalid manifest for module ${moduleDir}`);
          continue;
        }

        // Add to module map
        this.modules.set(manifest.id, manifest);

        // Index by capabilities
        if (manifest.capabilities) {
          for (const capability of manifest.capabilities) {
            if (!this.modulesByCapability.has(capability)) {
              this.modulesByCapability.set(capability, new Set());
            }
            this.modulesByCapability.get(capability)!.add(manifest.id);
          }
        }

        // Index by slots
        if (manifest.slots) {
          for (const slot of manifest.slots) {
            if (!this.modulesBySlot.has(slot)) {
              this.modulesBySlot.set(slot, new Set());
            }
            this.modulesBySlot.get(slot)!.add(manifest.id);
          }
        }
      } catch (error) {
        console.error(`Error processing module ${moduleDir}:`, error);
      }
    }

    console.log(
      `Module repository refreshed. Found ${this.modules.size} modules.`
    );
  }

  /**
   * Validate a module manifest
   */
  private validateManifest(manifest: ModuleManifest): boolean {
    // Required fields
    if (
      !manifest.id ||
      !manifest.name ||
      !manifest.version ||
      !manifest.entryPoint
    ) {
      return false;
    }

    // Basic format checks
    if (
      typeof manifest.id !== "string" ||
      typeof manifest.name !== "string" ||
      typeof manifest.version !== "string" ||
      typeof manifest.entryPoint !== "string"
    ) {
      return false;
    }

    // Additional validations could be added here

    return true;
  }

  /**
   * Get all available modules
   */
  listModules(): ModuleManifest[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get a specific module manifest
   */
  getModuleManifest(moduleId: string): ModuleManifest | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Find modules by capability
   */
  findModulesByCapability(capability: string): ModuleManifest[] {
    const moduleIds = this.modulesByCapability.get(capability);
    if (!moduleIds) {
      return [];
    }

    return Array.from(moduleIds)
      .map((id) => this.modules.get(id)!)
      .filter((manifest) => manifest !== undefined);
  }

  /**
   * Find modules by slot
   */
  findModulesBySlot(slot: string): ModuleManifest[] {
    const moduleIds = this.modulesBySlot.get(slot);
    if (!moduleIds) {
      return [];
    }

    return Array.from(moduleIds)
      .map((id) => this.modules.get(id)!)
      .filter((manifest) => manifest !== undefined);
  }
}

/**
 * In-memory module repository for testing or runtime-generated modules
 */
export class InMemoryModuleRepository implements ModuleRepository {
  private modules: Map<string, ModuleManifest>;
  private modulesByCapability: Map<string, Set<string>>;
  private modulesBySlot: Map<string, Set<string>>;

  /**
   * Create a new in-memory module repository
   */
  constructor() {
    this.modules = new Map();
    this.modulesByCapability = new Map();
    this.modulesBySlot = new Map();
  }

  /**
   * Add a module to the repository
   */
  addModule(manifest: ModuleManifest): boolean {
    // Validate the manifest
    if (!this.validateManifest(manifest)) {
      return false;
    }

    // Add to module map
    this.modules.set(manifest.id, manifest);

    // Index by capabilities
    if (manifest.capabilities) {
      for (const capability of manifest.capabilities) {
        if (!this.modulesByCapability.has(capability)) {
          this.modulesByCapability.set(capability, new Set());
        }
        this.modulesByCapability.get(capability)!.add(manifest.id);
      }
    }

    // Index by slots
    if (manifest.slots) {
      for (const slot of manifest.slots) {
        if (!this.modulesBySlot.has(slot)) {
          this.modulesBySlot.set(slot, new Set());
        }
        this.modulesBySlot.get(slot)!.add(manifest.id);
      }
    }

    return true;
  }

  /**
   * Remove a module from the repository
   */
  removeModule(moduleId: string): boolean {
    const manifest = this.modules.get(moduleId);
    if (!manifest) {
      return false;
    }

    // Remove from module map
    this.modules.delete(moduleId);

    // Remove from capability index
    if (manifest.capabilities) {
      for (const capability of manifest.capabilities) {
        const modules = this.modulesByCapability.get(capability);
        if (modules) {
          modules.delete(moduleId);
          if (modules.size === 0) {
            this.modulesByCapability.delete(capability);
          }
        }
      }
    }

    // Remove from slot index
    if (manifest.slots) {
      for (const slot of manifest.slots) {
        const modules = this.modulesBySlot.get(slot);
        if (modules) {
          modules.delete(moduleId);
          if (modules.size === 0) {
            this.modulesBySlot.delete(slot);
          }
        }
      }
    }

    return true;
  }

  /**
   * Validate a module manifest
   */
  private validateManifest(manifest: ModuleManifest): boolean {
    // Required fields
    if (
      !manifest.id ||
      !manifest.name ||
      !manifest.version ||
      !manifest.entryPoint
    ) {
      return false;
    }

    // Basic format checks
    if (
      typeof manifest.id !== "string" ||
      typeof manifest.name !== "string" ||
      typeof manifest.version !== "string" ||
      typeof manifest.entryPoint !== "string"
    ) {
      return false;
    }

    // Additional validations could be added here

    return true;
  }

  /**
   * Refresh the repository (no-op for in-memory implementation)
   */
  async refresh(): Promise<void> {
    // No-op for in-memory repository
  }

  /**
   * Get all available modules
   */
  listModules(): ModuleManifest[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get a specific module manifest
   */
  getModuleManifest(moduleId: string): ModuleManifest | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Find modules by capability
   */
  findModulesByCapability(capability: string): ModuleManifest[] {
    const moduleIds = this.modulesByCapability.get(capability);
    if (!moduleIds) {
      return [];
    }

    return Array.from(moduleIds)
      .map((id) => this.modules.get(id)!)
      .filter((manifest) => manifest !== undefined);
  }

  /**
   * Find modules by slot
   */
  findModulesBySlot(slot: string): ModuleManifest[] {
    const moduleIds = this.modulesBySlot.get(slot);
    if (!moduleIds) {
      return [];
    }

    return Array.from(moduleIds)
      .map((id) => this.modules.get(id)!)
      .filter((manifest) => manifest !== undefined);
  }
}
