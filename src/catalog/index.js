/**
 * A2UI Component Catalog
 *
 * This file exports the component registry for the A2UI Standard Catalog (v0.8).
 * Components are organized by category for better maintainability.
 *
 * Based on: https://a2ui.org/specification/v0_8/standard_catalog_definition.json
 */

// Layout Components
import A2UIColumn from "./layout/A2UIColumn.vue";
import A2UIRow from "./layout/A2UIRow.vue";
import A2UICard from "./layout/A2UICard.vue";
import A2UIList from "./layout/A2UIList.vue";

// Display Components
import A2UIText from "./display/A2UIText.vue";
import A2UIIcon from "./display/A2UIIcon.vue";
import A2UIMetric from "./display/A2UIMetric.vue";

// Interactive Components
import A2UIButton from "./interactive/A2UIButton.vue";

// Visualization Components
import A2UIChart from "./visualization/A2UIChart.vue";
import A2UIProgressBar from "./visualization/A2UIProgressBar.vue";

// Error Component
import A2UIError from "./A2UIError.vue";

/**
 * Component Catalog Registry
 * Maps component type names to their Vue component implementations
 */
export const componentCatalog = {
  // Layout
  Column: A2UIColumn,
  Row: A2UIRow,
  Card: A2UICard,
  List: A2UIList,

  // Display
  Text: A2UIText,
  Icon: A2UIIcon,
  Metric: A2UIMetric,

  // Interactive
  Button: A2UIButton,

  // Visualization
  Chart: A2UIChart,
  ProgressBar: A2UIProgressBar,

  // Error fallback
  Error: A2UIError,
};

/**
 * Catalog ID for A2UI v0.8 Standard Catalog
 * This identifier is used in catalog negotiation with agents
 */
export const catalogId =
  "https://a2ui.org/specification/v0_8/standard_catalog_definition.json";

/**
 * Get a component from the catalog by type name
 * @param {string} type - Component type name (e.g., 'Text', 'Button')
 * @returns {Component} Vue component or Error component if not found
 */
export function getComponent(type) {
  return componentCatalog[type] || componentCatalog.Error;
}

/**
 * Check if a component type is supported
 * @param {string} type - Component type name
 * @returns {boolean} True if component exists in catalog
 */
export function isComponentSupported(type) {
  return type in componentCatalog && type !== "Error";
}

/**
 * Get all supported component types
 * @returns {string[]} Array of component type names
 */
export function getSupportedComponents() {
  return Object.keys(componentCatalog).filter((key) => key !== "Error");
}
