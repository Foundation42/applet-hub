// ui-test-app/components/sidebar.ts
import { UIComponentDefinition } from '@ui-components/services/UIComponentService';

/**
 * Sidebar component for Ui Test App
 */
export const sidebarComponent: UIComponentDefinition = {
  id: 'ui-test-app-sidebar',
  name: 'Ui Test App Sidebar',
  description: 'Sidebar navigation for Ui Test App',
  category: 'navigation',
  defaultProps: {
    items: [
      { id: 'buttons', label: 'Buttons', icon: 'button' },
      { id: 'forms', label: 'Form Components', icon: 'form' },
      { id: 'layout', label: 'Layout Components', icon: 'layout' },
      { id: 'feedback', label: 'Feedback Components', icon: 'alert' },
      { id: 'theme', label: 'Theme Settings', icon: 'settings' },
    ],
    activeId: 'buttons',
    onSelect: null,
  },
  template: (props) => {
    const { items, activeId } = props;
    
    // Generate HTML for each item
    let itemsHtml = '';
    items.forEach(item => {
      const activeClass = item.id === activeId ? 'active' : '';
      itemsHtml += '<li class="ui-test-app-sidebar-item ' + activeClass + '">' +
                    '<button class="ui-test-app-sidebar-button" data-id="' + item.id + '">' +
                      '<span class="ui-test-app-sidebar-icon">' + getIcon(item.icon) + '</span>' +
                      '<span class="ui-test-app-sidebar-label">' + item.label + '</span>' +
                    '</button>' +
                   '</li>';
    });
    
    return '<div class="ui-test-app-sidebar">' +
             '<nav class="ui-test-app-sidebar-nav">' +
               '<ul class="ui-test-app-sidebar-list">' +
                 itemsHtml +
               '</ul>' +
             '</nav>' +
           '</div>';
  },
  init: (element, props) => {
    // Set up event listeners
    const buttons = element.querySelectorAll('.ui-test-app-sidebar-button');
    buttons.forEach(button => {
      button.addEventListener('click', (event) => {
        const id = (button as HTMLElement).dataset.id;
        
        // Update active item
        const items = element.querySelectorAll('.ui-test-app-sidebar-item');
        items.forEach(item => item.classList.remove('active'));
        (button as HTMLElement).closest('.ui-test-app-sidebar-item')?.classList.add('active');
        
        // Call onSelect callback
        if (typeof props.onSelect === 'function') {
          props.onSelect(id);
        }
      });
    });
    
    return {
      setActiveItem: (id: string) => {
        const items = element.querySelectorAll('.ui-test-app-sidebar-item');
        items.forEach(item => {
          const button = item.querySelector('.ui-test-app-sidebar-button');
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
    const buttons = element.querySelectorAll('.ui-test-app-sidebar-button');
    buttons.forEach(button => {
      button.replaceWith(button.cloneNode(true));
    });
  },
  styles: `
    .ui-test-app-sidebar {
      background-color: var(--color-surface, #f8f9fa);
      border-right: 1px solid var(--color-border, #dee2e6);
      height: 100%;
      min-width: 200px;
    }
    
    .ui-test-app-sidebar-nav {
      padding: var(--spacing-md, 1rem) 0;
    }
    
    .ui-test-app-sidebar-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    .ui-test-app-sidebar-item {
      margin-bottom: var(--spacing-xs, 0.25rem);
    }
    
    .ui-test-app-sidebar-button {
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
    
    .ui-test-app-sidebar-button:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    .ui-test-app-sidebar-item.active .ui-test-app-sidebar-button {
      background-color: var(--color-primary, #4a63e6);
      color: white;
    }
    
    .ui-test-app-sidebar-icon {
      margin-right: var(--spacing-sm, 0.5rem);
    }
    
    .ui-test-app-sidebar-label {
      font-weight: 500;
    }
  `,
};

/**
 * Simple function to get icon SVG based on name
 */
function getIcon(name: string): string {
  const icons: Record<string, string> = {
    button: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">' +
           '<path d="M6 13a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a.5.5 0 0 1 0 1H10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1H2.5a.5.5 0 0 1 0-1H6z"/>' + 
           '<path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2z"/>' +
           '</svg>',
           
    form: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">' +
          '<path d="M11 2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h6zm-1 1H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/>' +
          '<path d="M4.5 6a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5z"/>' +
          '<path d="M4.5 9a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5z"/>' +
          '</svg>',
          
    layout: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">' +
            '<path d="M1 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2zM1 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V7zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V7zM1 12a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2z"/>' +
            '</svg>',
            
    alert: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">' +
           '<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>' +
           '<path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>' +
           '</svg>',
            
    settings: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">' +
              '<path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>' +
              '<path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>' +
              '</svg>',
  };
  
  return icons[name] || '';
}