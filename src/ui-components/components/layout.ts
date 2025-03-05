// ui-components/components/layout.ts
import { UIComponentDefinition } from "../services/UIComponentService";

/**
 * Container component
 */
export const containerComponent: UIComponentDefinition = {
  id: "container",
  name: "Container",
  description: "Responsive container with max-width",
  category: "layout",
  hasChildren: true,
  defaultProps: {
    maxWidth: "lg",
    padding: true,
    center: true,
  },
  template: (props) => {
    const { maxWidth, padding, center } = props;

    const maxWidthClass = maxWidth
      ? `ah-container-${maxWidth}`
      : "ah-container-lg";
    const paddingClass = padding ? "ah-container-padding" : "";
    const centerClass = center ? "ah-container-center" : "";

    return `
      <div class="ah-container ${maxWidthClass} ${paddingClass} ${centerClass}"></div>
    `;
  },
  styles: `
    .ah-container {
      width: 100%;
    }
    
    .ah-container-padding {
      padding-left: var(--spacing-md);
      padding-right: var(--spacing-md);
    }
    
    .ah-container-center {
      margin-left: auto;
      margin-right: auto;
    }
    
    .ah-container-sm {
      max-width: 640px;
    }
    
    .ah-container-md {
      max-width: 768px;
    }
    
    .ah-container-lg {
      max-width: 1024px;
    }
    
    .ah-container-xl {
      max-width: 1280px;
    }
    
    .ah-container-fluid {
      max-width: none;
    }
    
    @media (max-width: 640px) {
      .ah-container {
        padding-left: var(--spacing-sm);
        padding-right: var(--spacing-sm);
      }
    }
  `,
};

/**
 * Grid component
 */
export const gridComponent: UIComponentDefinition = {
  id: "grid",
  name: "Grid",
  description: "Responsive grid layout",
  category: "layout",
  hasChildren: true,
  defaultProps: {
    columns: 12,
    gap: "md",
    rowGap: null,
    columnGap: null,
  },
  template: (props) => {
    const { columns, gap, rowGap, columnGap } = props;

    const columnsClass = columns
      ? `ah-grid-cols-${columns}`
      : "ah-grid-cols-12";
    const gapClass = gap ? `ah-grid-gap-${gap}` : "";
    const rowGapClass = rowGap ? `ah-grid-row-gap-${rowGap}` : "";
    const columnGapClass = columnGap ? `ah-grid-col-gap-${columnGap}` : "";

    return `
      <div class="ah-grid ${columnsClass} ${gapClass} ${rowGapClass} ${columnGapClass}"></div>
    `;
  },
  styles: `
    .ah-grid {
      display: grid;
      width: 100%;
    }
    
    /* Columns */
    .ah-grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
    .ah-grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
    .ah-grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
    .ah-grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
    .ah-grid-cols-5 { grid-template-columns: repeat(5, 1fr); }
    .ah-grid-cols-6 { grid-template-columns: repeat(6, 1fr); }
    .ah-grid-cols-7 { grid-template-columns: repeat(7, 1fr); }
    .ah-grid-cols-8 { grid-template-columns: repeat(8, 1fr); }
    .ah-grid-cols-9 { grid-template-columns: repeat(9, 1fr); }
    .ah-grid-cols-10 { grid-template-columns: repeat(10, 1fr); }
    .ah-grid-cols-11 { grid-template-columns: repeat(11, 1fr); }
    .ah-grid-cols-12 { grid-template-columns: repeat(12, 1fr); }
    
    /* Gaps */
    .ah-grid-gap-xs { gap: var(--spacing-xs); }
    .ah-grid-gap-sm { gap: var(--spacing-sm); }
    .ah-grid-gap-md { gap: var(--spacing-md); }
    .ah-grid-gap-lg { gap: var(--spacing-lg); }
    .ah-grid-gap-xl { gap: var(--spacing-xl); }
    
    .ah-grid-row-gap-xs { row-gap: var(--spacing-xs); }
    .ah-grid-row-gap-sm { row-gap: var(--spacing-sm); }
    .ah-grid-row-gap-md { row-gap: var(--spacing-md); }
    .ah-grid-row-gap-lg { row-gap: var(--spacing-lg); }
    .ah-grid-row-gap-xl { row-gap: var(--spacing-xl); }
    
    .ah-grid-col-gap-xs { column-gap: var(--spacing-xs); }
    .ah-grid-col-gap-sm { column-gap: var(--spacing-sm); }
    .ah-grid-col-gap-md { column-gap: var(--spacing-md); }
    .ah-grid-col-gap-lg { column-gap: var(--spacing-lg); }
    .ah-grid-col-gap-xl { column-gap: var(--spacing-xl); }
    
    /* Responsive breakpoints */
    @media (max-width: 768px) {
      .ah-grid-cols-12,
      .ah-grid-cols-11,
      .ah-grid-cols-10,
      .ah-grid-cols-9,
      .ah-grid-cols-8,
      .ah-grid-cols-7,
      .ah-grid-cols-6 {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    
    @media (max-width: 640px) {
      .ah-grid-cols-12,
      .ah-grid-cols-11,
      .ah-grid-cols-10,
      .ah-grid-cols-9,
      .ah-grid-cols-8,
      .ah-grid-cols-7,
      .ah-grid-cols-6,
      .ah-grid-cols-5,
      .ah-grid-cols-4,
      .ah-grid-cols-3 {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (max-width: 480px) {
      .ah-grid-cols-12,
      .ah-grid-cols-11,
      .ah-grid-cols-10,
      .ah-grid-cols-9,
      .ah-grid-cols-8,
      .ah-grid-cols-7,
      .ah-grid-cols-6,
      .ah-grid-cols-5,
      .ah-grid-cols-4,
      .ah-grid-cols-3,
      .ah-grid-cols-2 {
        grid-template-columns: 1fr;
      }
    }
  `,
};

/**
 * Grid Item component
 */
export const gridItemComponent: UIComponentDefinition = {
  id: "grid-item",
  name: "Grid Item",
  description: "Item within a grid layout",
  category: "layout",
  hasChildren: true,
  defaultProps: {
    colSpan: 1,
    rowSpan: 1,
    colStart: null,
    rowStart: null,
  },
  template: (props) => {
    const { colSpan, rowSpan, colStart, rowStart } = props;

    const colSpanClass = colSpan ? `ah-col-span-${colSpan}` : "";
    const rowSpanClass = rowSpan ? `ah-row-span-${rowSpan}` : "";
    const colStartClass = colStart ? `ah-col-start-${colStart}` : "";
    const rowStartClass = rowStart ? `ah-row-start-${rowStart}` : "";

    return `
      <div class="ah-grid-item ${colSpanClass} ${rowSpanClass} ${colStartClass} ${rowStartClass}"></div>
    `;
  },
  styles: `
    .ah-grid-item {
      min-width: 0; /* Allows grid items to shrink below their minimum content size */
    }
    
    /* Column spans */
    .ah-col-span-1 { grid-column: span 1; }
    .ah-col-span-2 { grid-column: span 2; }
    .ah-col-span-3 { grid-column: span 3; }
    .ah-col-span-4 { grid-column: span 4; }
    .ah-col-span-5 { grid-column: span 5; }
    .ah-col-span-6 { grid-column: span 6; }
    .ah-col-span-7 { grid-column: span 7; }
    .ah-col-span-8 { grid-column: span 8; }
    .ah-col-span-9 { grid-column: span 9; }
    .ah-col-span-10 { grid-column: span 10; }
    .ah-col-span-11 { grid-column: span 11; }
    .ah-col-span-12 { grid-column: span 12; }
    
    /* Row spans */
    .ah-row-span-1 { grid-row: span 1; }
    .ah-row-span-2 { grid-row: span 2; }
    .ah-row-span-3 { grid-row: span 3; }
    .ah-row-span-4 { grid-row: span 4; }
    .ah-row-span-5 { grid-row: span 5; }
    .ah-row-span-6 { grid-row: span 6; }
    
    /* Column starts */
    .ah-col-start-1 { grid-column-start: 1; }
    .ah-col-start-2 { grid-column-start: 2; }
    .ah-col-start-3 { grid-column-start: 3; }
    .ah-col-start-4 { grid-column-start: 4; }
    .ah-col-start-5 { grid-column-start: 5; }
    .ah-col-start-6 { grid-column-start: 6; }
    .ah-col-start-7 { grid-column-start: 7; }
    .ah-col-start-8 { grid-column-start: 8; }
    .ah-col-start-9 { grid-column-start: 9; }
    .ah-col-start-10 { grid-column-start: 10; }
    .ah-col-start-11 { grid-column-start: 11; }
    .ah-col-start-12 { grid-column-start: 12; }
    
    /* Row starts */
    .ah-row-start-1 { grid-row-start: 1; }
    .ah-row-start-2 { grid-row-start: 2; }
    .ah-row-start-3 { grid-row-start: 3; }
    .ah-row-start-4 { grid-row-start: 4; }
    .ah-row-start-5 { grid-row-start: 5; }
    .ah-row-start-6 { grid-row-start: 6; }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .ah-col-span-12, .ah-col-span-11, .ah-col-span-10,
      .ah-col-span-9, .ah-col-span-8, .ah-col-span-7,
      .ah-col-span-6, .ah-col-span-5 {
        grid-column: 1 / -1; /* Full width on medium screens */
      }
    }
    
    @media (max-width: 640px) {
      .ah-col-span-4, .ah-col-span-3 {
        grid-column: 1 / -1; /* Full width on small screens */
      }
    }
  `,
};

/**
 * Flex container component
 */
export const flexComponent: UIComponentDefinition = {
  id: "flex",
  name: "Flex Container",
  description: "Flexible layout container",
  category: "layout",
  hasChildren: true,
  defaultProps: {
    direction: "row",
    wrap: false,
    justify: "start",
    align: "start",
    gap: "md",
  },
  template: (props) => {
    const { direction, wrap, justify, align, gap } = props;

    const directionClass = direction ? `ah-flex-${direction}` : "ah-flex-row";
    const wrapClass = wrap ? "ah-flex-wrap" : "";
    const justifyClass = justify ? `ah-justify-${justify}` : "";
    const alignClass = align ? `ah-align-${align}` : "";
    const gapClass = gap ? `ah-gap-${gap}` : "";

    return `
      <div class="ah-flex ${directionClass} ${wrapClass} ${justifyClass} ${alignClass} ${gapClass}"></div>
    `;
  },
  styles: `
    .ah-flex {
      display: flex;
    }
    
    /* Direction */
    .ah-flex-row { flex-direction: row; }
    .ah-flex-row-reverse { flex-direction: row-reverse; }
    .ah-flex-col { flex-direction: column; }
    .ah-flex-col-reverse { flex-direction: column-reverse; }
    
    /* Wrap */
    .ah-flex-wrap { flex-wrap: wrap; }
    
    /* Justify content */
    .ah-justify-start { justify-content: flex-start; }
    .ah-justify-end { justify-content: flex-end; }
    .ah-justify-center { justify-content: center; }
    .ah-justify-between { justify-content: space-between; }
    .ah-justify-around { justify-content: space-around; }
    .ah-justify-evenly { justify-content: space-evenly; }
    
    /* Align items */
    .ah-align-start { align-items: flex-start; }
    .ah-align-end { align-items: flex-end; }
    .ah-align-center { align-items: center; }
    .ah-align-baseline { align-items: baseline; }
    .ah-align-stretch { align-items: stretch; }
    
    /* Gap */
    .ah-gap-xs { gap: var(--spacing-xs); }
    .ah-gap-sm { gap: var(--spacing-sm); }
    .ah-gap-md { gap: var(--spacing-md); }
    .ah-gap-lg { gap: var(--spacing-lg); }
    .ah-gap-xl { gap: var(--spacing-xl); }
  `,
};
