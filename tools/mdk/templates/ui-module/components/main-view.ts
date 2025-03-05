// {{moduleId}}/components/main-view.ts
import { UIComponentDefinition } from '../../../ui-components/services/UIComponentService';

/**
 * Main view component for {{moduleName}}
 */
export const mainViewComponent: UIComponentDefinition = {
  id: '{{moduleId}}-main-view',
  name: '{{moduleName}} Main View',
  description: 'Main view for {{moduleName}}',
  category: 'display',
  defaultProps: {
    title: '{{moduleName}}',
  },
  template: (props) => {
    const { title } = props;
    
    return `
      <div class="{{moduleId}}-main-view">
        <h2 class="{{moduleId}}-title">${title}</h2>
        <div class="{{moduleId}}-content">
          <!-- Your component content goes here -->
          <p>Welcome to the {{moduleName}} module!</p>
        </div>
      </div>
    `;
  },
  init: (element, props) => {
    // Component initialization code
    console.log('{{moduleName}} Main View initialized');
    
    // Return component instance API
    return {
      setTitle: (title: string) => {
        const titleEl = element.querySelector('.{{moduleId}}-title');
        if (titleEl) {
          titleEl.textContent = title;
        }
      },
      getElement: () => element,
    };
  },
  styles: `
    .{{moduleId}}-main-view {
      padding: var(--spacing-md, 1rem);
      background-color: var(--color-background, #ffffff);
      border-radius: var(--border-radius-base, 0.375rem);
      box-shadow: var(--shadow-base, 0 1px 3px rgba(0,0,0,0.12));
    }
    
    .{{moduleId}}-title {
      margin-top: 0;
      margin-bottom: var(--spacing-md, 1rem);
      color: var(--color-primary, #4a63e6);
    }
    
    .{{moduleId}}-content {
      color: var(--color-text, #212529);
    }
  `,
};