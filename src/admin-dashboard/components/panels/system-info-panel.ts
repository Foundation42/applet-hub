// admin-dashboard/components/panels/system-info-panel.ts
import { UIComponentDefinition } from '@ui-components/services/UIComponentService';

/**
 * System Information Panel
 */
export const systemInfoPanelComponent: UIComponentDefinition = {
  id: 'admin-dashboard-system-info-panel',
  name: 'System Information Panel',
  description: 'Displays system information and statistics',
  category: 'display',
  defaultProps: {
    title: 'System Information',
  },
  template: (props) => {
    const { title } = props;
    
    return `
      <div class="admin-dashboard-panel system-info-panel">
        <h3 class="panel-title">${title}</h3>
        <div class="panel-content">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">AppletHub Version</div>
              <div class="info-value" id="system-version">0.1.0</div>
            </div>
            <div class="info-item">
              <div class="info-label">Uptime</div>
              <div class="info-value" id="system-uptime">00:00:00</div>
            </div>
            <div class="info-item">
              <div class="info-label">Modules Loaded</div>
              <div class="info-value" id="modules-loaded">0</div>
            </div>
            <div class="info-item">
              <div class="info-label">Active Services</div>
              <div class="info-value" id="active-services">0</div>
            </div>
            <div class="info-item">
              <div class="info-label">Memory Usage</div>
              <div class="info-value" id="memory-usage">0 MB</div>
            </div>
            <div class="info-item">
              <div class="info-label">CPU Usage</div>
              <div class="info-value" id="cpu-usage">0%</div>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  init: (element, props) => {
    // Get elements
    const versionEl = element.querySelector('#system-version');
    const uptimeEl = element.querySelector('#system-uptime');
    const modulesEl = element.querySelector('#modules-loaded');
    const servicesEl = element.querySelector('#active-services');
    const memoryEl = element.querySelector('#memory-usage');
    const cpuEl = element.querySelector('#cpu-usage');
    
    // Update stats at intervals
    let startTime = Date.now();
    let updateInterval: any;
    
    const formatUptime = (ms: number) => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      const pad = (num: number) => num.toString().padStart(2, '0');
      
      if (days > 0) {
        return `${days}d ${pad(hours % 24)}h ${pad(minutes % 60)}m`;
      }
      return `${pad(hours)}:${pad(minutes % 60)}:${pad(seconds % 60)}`;
    };
    
    const updateStats = async () => {
      // Update uptime
      if (uptimeEl) {
        const uptime = Date.now() - startTime;
        uptimeEl.textContent = formatUptime(uptime);
      }
      
      try {
        // These would be actual API calls in a real implementation
        // For now, we'll just simulate with random values
        if (modulesEl) modulesEl.textContent = Math.floor(3 + Math.random() * 5).toString();
        if (servicesEl) servicesEl.textContent = Math.floor(5 + Math.random() * 10).toString();
        if (memoryEl) memoryEl.textContent = `${Math.floor(50 + Math.random() * 100)} MB`;
        if (cpuEl) cpuEl.textContent = `${Math.floor(Math.random() * 30)}%`;
      } catch (error) {
        console.error('Error updating system stats:', error);
      }
    };
    
    // Initial update
    updateStats();
    
    // Schedule regular updates
    updateInterval = setInterval(updateStats, 1000);
    
    return {
      refresh: () => {
        updateStats();
      },
      cleanup: () => {
        if (updateInterval) {
          clearInterval(updateInterval);
        }
      }
    };
  },
  cleanup: (element) => {
    // Access the component instance
    const instance = (element as any).__componentInstance;
    if (instance && instance.cleanup) {
      instance.cleanup();
    }
  },
  styles: `
    .system-info-panel {
      margin-bottom: var(--spacing-md, 1rem);
    }
    
    .panel-title {
      margin-top: 0;
      margin-bottom: var(--spacing-sm, 0.5rem);
      font-size: var(--font-size-large, 1.25rem);
      color: var(--color-text, #212529);
    }
    
    .panel-content {
      background-color: var(--color-surface, #f8f9fa);
      border-radius: var(--border-radius-base, 0.375rem);
      padding: var(--spacing-md, 1rem);
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--spacing-md, 1rem);
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
    }
    
    .info-label {
      font-size: var(--font-size-small, 0.875rem);
      color: var(--color-text-secondary, #6c757d);
      margin-bottom: var(--spacing-xs, 0.25rem);
    }
    
    .info-value {
      font-size: var(--font-size-base, 1rem);
      font-weight: 600;
      color: var(--color-text, #212529);
    }
  `,
};