// admin-dashboard/components/panels/tuplestore-explorer-panel.ts
import { UIComponentDefinition } from '@ui-components/services/UIComponentService';

/**
 * TupleStore Explorer Panel
 */
export const tupleStoreExplorerPanelComponent: UIComponentDefinition = {
  id: 'admin-dashboard-tuplestore-explorer-panel',
  name: 'TupleStore Explorer Panel',
  description: 'Explore and manipulate the TupleStore data',
  category: 'display',
  defaultProps: {
    title: 'TupleStore Explorer',
    data: {
      system: {
        version: '0.1.0',
        startTime: Date.now(),
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
    },
  },
  template: (props) => {
    const { title } = props;
    
    return `
      <div class="admin-dashboard-panel tuplestore-explorer-panel">
        <div class="panel-header">
          <h3 class="panel-title">${title}</h3>
          <div class="panel-actions">
            <div class="search-box">
              <input type="text" placeholder="Search paths..." id="path-search" />
              <button id="search-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
              </button>
            </div>
            <button class="refresh-button" id="refresh-data">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>
        <div class="explorer-layout">
          <div class="path-tree-container">
            <div class="path-tree" id="path-tree"></div>
          </div>
          <div class="value-container">
            <div class="path-info">
              <div class="current-path" id="current-path">No path selected</div>
              <div class="path-actions">
                <button class="edit-button" id="edit-value" disabled>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                  </svg>
                  Edit
                </button>
                <button class="delete-button" id="delete-value" disabled>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
            <div class="value-display">
              <pre id="value-content">Select a path to view its value</pre>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  init: (element, props) => {
    // Clone the data to avoid modifying the original
    let storeData = JSON.parse(JSON.stringify(props.data || {}));
    let currentPath = '';
    
    // Get elements
    const pathTree = element.querySelector('#path-tree');
    const currentPathEl = element.querySelector('#current-path');
    const valueContent = element.querySelector('#value-content');
    const editButton = element.querySelector('#edit-value');
    const deleteButton = element.querySelector('#delete-value');
    const searchInput = element.querySelector('#path-search');
    const searchButton = element.querySelector('#search-button');
    const refreshButton = element.querySelector('#refresh-data');
    
    // Render the path tree
    const renderPathTree = (data: any, parentPath = '') => {
      if (!pathTree) return;
      
      const isRoot = parentPath === '';
      if (isRoot) {
        pathTree.innerHTML = '';
      }
      
      // Get the items to render (root level or properties of an object)
      const items = isRoot 
        ? Object.entries(data)
        : Object.entries(data);
      
      // Create elements for each item
      items.forEach(([key, value]) => {
        const path = parentPath ? `${parentPath}.${key}` : key;
        const isObject = value && typeof value === 'object' && !Array.isArray(value);
        const isArray = Array.isArray(value);
        const hasChildren = isObject || isArray;
        
        // Create the tree item element
        const itemEl = document.createElement('div');
        itemEl.className = 'tree-item';
        itemEl.dataset.path = path;
        
        // Create the item content
        const itemContent = document.createElement('div');
        itemContent.className = 'tree-item-content';
        
        // Create the expander (if the item has children)
        if (hasChildren) {
          const expander = document.createElement('div');
          expander.className = 'tree-expander';
          expander.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          `;
          expander.addEventListener('click', (e) => {
            e.stopPropagation();
            itemEl.classList.toggle('expanded');
            
            // If we're expanding and the children container is empty, render the children
            const childrenContainer = itemEl.querySelector('.tree-children');
            if (itemEl.classList.contains('expanded') && childrenContainer) {
              if (childrenContainer.children.length === 0 && value !== null) {
                renderPathTree(value, path);
              }
            }
          });
          itemContent.appendChild(expander);
        } else {
          // Add a spacer for leaf nodes to maintain alignment
          const spacer = document.createElement('div');
          spacer.className = 'tree-spacer';
          itemContent.appendChild(spacer);
        }
        
        // Create the item label
        const label = document.createElement('div');
        label.className = 'tree-label';
        label.textContent = key;
        
        // Add type indicator
        if (isObject) {
          label.textContent += ' {}';
        } else if (isArray) {
          label.textContent += ` [${value.length}]`;
        } else if (value === null) {
          label.textContent += ' (null)';
        } else if (typeof value === 'string') {
          label.textContent += ` (string)`;
        } else if (typeof value === 'number') {
          label.textContent += ` (number)`;
        } else if (typeof value === 'boolean') {
          label.textContent += ` (boolean)`;
        }
        
        itemContent.appendChild(label);
        itemEl.appendChild(itemContent);
        
        // Add click handler to select the path
        itemEl.addEventListener('click', (e) => {
          e.stopPropagation();
          selectPath(path);
        });
        
        // If the item has children, create a container for them
        if (hasChildren) {
          const childrenContainer = document.createElement('div');
          childrenContainer.className = 'tree-children';
          itemEl.appendChild(childrenContainer);
        }
        
        // Add the item to the tree (either the root or a children container)
        if (isRoot) {
          pathTree.appendChild(itemEl);
        } else {
          const parentItem = element.querySelector(`[data-path="${parentPath}"]`);
          if (parentItem) {
            const childrenContainer = parentItem.querySelector('.tree-children');
            if (childrenContainer) {
              childrenContainer.appendChild(itemEl);
            }
          }
        }
      });
    };
    
    // Select a path
    const selectPath = (path: string) => {
      currentPath = path;
      
      // Update the current path display
      if (currentPathEl) {
        currentPathEl.textContent = path || 'No path selected';
      }
      
      // Update the value display
      if (valueContent) {
        const value = getValueAtPath(storeData, path);
        valueContent.textContent = JSON.stringify(value, null, 2);
      }
      
      // Update button states
      if (editButton) {
        editButton.disabled = !path;
      }
      
      if (deleteButton) {
        deleteButton.disabled = !path;
      }
      
      // Update selected state in the tree
      const allItems = element.querySelectorAll('.tree-item');
      allItems.forEach(item => {
        item.classList.remove('selected');
      });
      
      const selectedItem = element.querySelector(`[data-path="${path}"]`);
      if (selectedItem) {
        selectedItem.classList.add('selected');
        
        // Expand parents
        let parent = selectedItem.parentElement?.closest('.tree-item');
        while (parent) {
          parent.classList.add('expanded');
          parent = parent.parentElement?.closest('.tree-item');
        }
      }
    };
    
    // Get a value at a path
    const getValueAtPath = (data: any, path: string) => {
      if (!path) return data;
      
      const parts = path.split('.');
      let current = data;
      
      for (const part of parts) {
        if (current === null || current === undefined) return undefined;
        current = current[part];
      }
      
      return current;
    };
    
    // Set a value at a path
    const setValueAtPath = (data: any, path: string, value: any) => {
      if (!path) return;
      
      const parts = path.split('.');
      const lastPart = parts.pop();
      
      if (!lastPart) return;
      
      let current = data;
      for (const part of parts) {
        if (current[part] === undefined) {
          current[part] = {};
        }
        current = current[part];
      }
      
      current[lastPart] = value;
    };
    
    // Delete a value at a path
    const deleteValueAtPath = (data: any, path: string) => {
      if (!path) return;
      
      const parts = path.split('.');
      const lastPart = parts.pop();
      
      if (!lastPart) return;
      
      let current = data;
      for (const part of parts) {
        if (current[part] === undefined) {
          return;
        }
        current = current[part];
      }
      
      delete current[lastPart];
    };
    
    // Handle path search
    const handleSearch = () => {
      if (!searchInput) return;
      
      const searchValue = searchInput.value.trim();
      if (!searchValue) return;
      
      // Simple search for now - just check if the path includes the search value
      const allItems = element.querySelectorAll('.tree-item');
      let foundItem = null;
      
      allItems.forEach(item => {
        const itemPath = (item as HTMLElement).dataset.path || '';
        if (itemPath.includes(searchValue)) {
          foundItem = item;
          return;
        }
      });
      
      if (foundItem) {
        const path = (foundItem as HTMLElement).dataset.path || '';
        selectPath(path);
      }
    };
    
    // Handle edit
    const handleEdit = () => {
      if (!currentPath) return;
      
      const value = getValueAtPath(storeData, currentPath);
      
      // For simplicity, just use prompt for editing
      const newValue = prompt('Edit value:', JSON.stringify(value));
      if (newValue === null) return; // User cancelled
      
      try {
        const parsedValue = JSON.parse(newValue);
        storeData = { ...storeData }; // Clone to trigger updates
        setValueAtPath(storeData, currentPath, parsedValue);
        
        // Refresh the display
        selectPath(currentPath);
        renderPathTree(storeData);
      } catch (error) {
        alert('Invalid JSON. Please try again.');
      }
    };
    
    // Handle delete
    const handleDelete = () => {
      if (!currentPath) return;
      
      if (confirm(`Are you sure you want to delete ${currentPath}?`)) {
        storeData = { ...storeData }; // Clone to trigger updates
        deleteValueAtPath(storeData, currentPath);
        
        // Refresh the display
        currentPath = '';
        selectPath('');
        renderPathTree(storeData);
      }
    };
    
    // Handle refresh
    const handleRefresh = () => {
      // In a real implementation, this would fetch the latest data from the system
      console.log('Refreshing TupleStore data');
      
      // For demo, just update a timestamp
      storeData = { ...storeData };
      setValueAtPath(storeData, 'system.lastRefresh', Date.now());
      
      // Refresh the display
      renderPathTree(storeData);
      if (currentPath) {
        selectPath(currentPath);
      }
    };
    
    // Attach event handlers
    if (searchButton) {
      searchButton.addEventListener('click', handleSearch);
    }
    
    if (searchInput) {
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleSearch();
        }
      });
    }
    
    if (editButton) {
      editButton.addEventListener('click', handleEdit);
    }
    
    if (deleteButton) {
      deleteButton.addEventListener('click', handleDelete);
    }
    
    if (refreshButton) {
      refreshButton.addEventListener('click', handleRefresh);
    }
    
    // Initial rendering
    renderPathTree(storeData);
    
    // Return the component API
    return {
      getData: () => JSON.parse(JSON.stringify(storeData)),
      setData: (data: any) => {
        storeData = JSON.parse(JSON.stringify(data));
        renderPathTree(storeData);
        if (currentPath) {
          selectPath(currentPath);
        }
      },
      getCurrentPath: () => currentPath,
      selectPath,
    };
  },
  cleanup: (element) => {
    // Remove event listeners by cloning and replacing
    const buttons = element.querySelectorAll('button');
    buttons.forEach(button => {
      const newButton = button.cloneNode(true);
      if (button.parentNode) {
        button.parentNode.replaceChild(newButton, button);
      }
    });
    
    const searchInput = element.querySelector('#path-search');
    if (searchInput) {
      const newInput = searchInput.cloneNode(true);
      if (searchInput.parentNode) {
        searchInput.parentNode.replaceChild(newInput, searchInput);
      }
    }
    
    const treeItems = element.querySelectorAll('.tree-item');
    treeItems.forEach(item => {
      const newItem = item.cloneNode(true);
      if (item.parentNode) {
        item.parentNode.replaceChild(newItem, item);
      }
    });
  },
  styles: `
    .tuplestore-explorer-panel {
      margin-bottom: var(--spacing-md, 1rem);
    }
    
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-sm, 0.5rem);
    }
    
    .panel-title {
      margin: 0;
      font-size: var(--font-size-large, 1.25rem);
      color: var(--color-text, #212529);
    }
    
    .panel-actions {
      display: flex;
      gap: var(--spacing-sm, 0.5rem);
    }
    
    .search-box {
      display: flex;
      border: 1px solid var(--color-border, #dee2e6);
      border-radius: var(--border-radius-base, 0.375rem);
      overflow: hidden;
    }
    
    .search-box input {
      border: none;
      padding: 0.25rem 0.5rem;
      font-size: var(--font-size-small, 0.875rem);
      outline: none;
    }
    
    .search-box button {
      background-color: var(--color-surface, #f8f9fa);
      border: none;
      padding: 0.25rem 0.5rem;
      cursor: pointer;
    }
    
    .refresh-button {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background-color: var(--color-background, #ffffff);
      border: 1px solid var(--color-border, #dee2e6);
      border-radius: var(--border-radius-base, 0.375rem);
      padding: 0.25rem 0.5rem;
      cursor: pointer;
      font-size: var(--font-size-small, 0.875rem);
    }
    
    .explorer-layout {
      display: flex;
      background-color: var(--color-surface, #f8f9fa);
      border-radius: var(--border-radius-base, 0.375rem);
      overflow: hidden;
      border: 1px solid var(--color-border, #dee2e6);
    }
    
    .path-tree-container {
      flex: 0 0 40%;
      max-width: 40%;
      border-right: 1px solid var(--color-border, #dee2e6);
      overflow: auto;
      max-height: 400px;
    }
    
    .path-tree {
      padding: var(--spacing-sm, 0.5rem);
    }
    
    .tree-item {
      margin-bottom: 2px;
      cursor: pointer;
    }
    
    .tree-item-content {
      display: flex;
      align-items: center;
      padding: 0.25rem;
      border-radius: var(--border-radius-small, 0.25rem);
    }
    
    .tree-item-content:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    .tree-item.selected > .tree-item-content {
      background-color: rgba(74, 99, 230, 0.1);
      color: var(--color-primary, #4a63e6);
    }
    
    .tree-expander {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 4px;
      transition: transform 0.2s;
    }
    
    .tree-spacer {
      width: 16px;
      margin-right: 4px;
    }
    
    .tree-item.expanded > .tree-item-content > .tree-expander {
      transform: rotate(90deg);
    }
    
    .tree-children {
      margin-left: 16px;
      display: none;
    }
    
    .tree-item.expanded > .tree-children {
      display: block;
    }
    
    .tree-label {
      font-family: monospace;
      font-size: var(--font-size-small, 0.875rem);
    }
    
    .value-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      max-height: 400px;
    }
    
    .path-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm, 0.5rem);
      border-bottom: 1px solid var(--color-border, #dee2e6);
    }
    
    .current-path {
      font-family: monospace;
      font-size: var(--font-size-small, 0.875rem);
      color: var(--color-text-secondary, #6c757d);
    }
    
    .path-actions {
      display: flex;
      gap: var(--spacing-xs, 0.25rem);
    }
    
    .edit-button,
    .delete-button {
      display: flex;
      align-items: center;
      gap: 4px;
      background-color: var(--color-background, #ffffff);
      border: 1px solid var(--color-border, #dee2e6);
      border-radius: var(--border-radius-small, 0.25rem);
      padding: 2px 6px;
      font-size: var(--font-size-small, 0.875rem);
      cursor: pointer;
    }
    
    .edit-button:disabled,
    .delete-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .delete-button {
      color: var(--color-error, #dc3545);
    }
    
    .value-display {
      flex: 1;
      overflow: auto;
      padding: var(--spacing-sm, 0.5rem);
    }
    
    #value-content {
      margin: 0;
      font-family: monospace;
      font-size: var(--font-size-small, 0.875rem);
      white-space: pre-wrap;
    }
  `,
};