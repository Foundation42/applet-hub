// admin-dashboard/components/sidebar.ts
import { UIComponentDefinition } from '../../../ui-components/services/UIComponentService';

/**
 * Sidebar component for Admin Dashboard
 */
export const sidebarComponent: UIComponentDefinition = {
  id: 'admin-dashboard-sidebar',
  name: 'Admin Dashboard Sidebar',
  description: 'Sidebar navigation for Admin Dashboard',
  category: 'navigation',
  defaultProps: {
    items: [
      { id: 'home', label: 'Home', icon: 'home' },
      { id: 'settings', label: 'Settings', icon: 'settings' },
    ],
    activeId: 'home',
    onSelect: null,
  },
  template: (props) => {
    const { items, activeId } = props;
    
    const itemsHtml = items.map(item => `
      <li class="admin-dashboard-sidebar-item ${item.id === activeId ? 'active' : ''}">
        <button class="admin-dashboard-sidebar-button" data-id="${item.id}">
          <span class="admin-dashboard-sidebar-icon">${getIcon(item.icon)}</span>
          <span class="admin-dashboard-sidebar-label">${item.label}</span>
        </button>
      </li>
    `).join('');
    
    return `
      <div class="admin-dashboard-sidebar">
        <nav class="admin-dashboard-sidebar-nav">
          <ul class="admin-dashboard-sidebar-list">
            ${itemsHtml}
          </ul>
        </nav>
      </div>
    `;
  },
  init: (element, props) => {
    // Set up event listeners
    const buttons = element.querySelectorAll('.admin-dashboard-sidebar-button');
    buttons.forEach(button => {
      button.addEventListener('click', (event) => {
        const id = (button as HTMLElement).dataset.id;
        
        // Update active item
        const items = element.querySelectorAll('.admin-dashboard-sidebar-item');
        items.forEach(item => item.classList.remove('active'));
        (button as HTMLElement).closest('.admin-dashboard-sidebar-item')?.classList.add('active');
        
        // Call onSelect callback
        if (typeof props.onSelect === 'function') {
          props.onSelect(id);
        }
      });
    });
    
    return {
      setActiveItem: (id: string) => {
        const items = element.querySelectorAll('.admin-dashboard-sidebar-item');
        items.forEach(item => {
          const button = item.querySelector('.admin-dashboard-sidebar-button');
          if (button && (button as HTMLElement).dataset.id === id) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      },
    };
  },
  cleanup: (element) => {
    // Remove event listeners
    const buttons = element.querySelectorAll('.admin-dashboard-sidebar-button');
    buttons.forEach(button => {
      button.replaceWith(button.cloneNode(true));
    });
  },
  styles: `
    .admin-dashboard-sidebar {
      background-color: var(--color-surface, #f8f9fa);
      border-right: 1px solid var(--color-border, #dee2e6);
      height: 100%;
      min-width: 200px;
    }
    
    .admin-dashboard-sidebar-nav {
      padding: var(--spacing-md, 1rem) 0;
    }
    
    .admin-dashboard-sidebar-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    .admin-dashboard-sidebar-item {
      margin-bottom: var(--spacing-xs, 0.25rem);
    }
    
    .admin-dashboard-sidebar-button {
      background: transparent;
      border: none;
      border-radius: var(--border-radius-base, 0.375rem);
      color: var(--color-text, #212529);
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
      text-align: left;
      width: 100%;
      transition: background-color 0.2s;
    }
    
    .admin-dashboard-sidebar-button:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    .admin-dashboard-sidebar-item.active .admin-dashboard-sidebar-button {
      background-color: var(--color-primary, #4a63e6);
      color: white;
    }
    
    .admin-dashboard-sidebar-icon {
      margin-right: var(--spacing-sm, 0.5rem);
    }
    
    .admin-dashboard-sidebar-label {
      font-weight: 500;
    }
  `,
};

/**
 * Simple function to get icon SVG based on name
 */
function getIcon(name: string): string {
  const icons: Record<string, string> = {
    home: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4H2.5z"/>
    </svg>`,
    settings: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
      <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
    </svg>`,
  };
  
  return icons[name] || '';
}