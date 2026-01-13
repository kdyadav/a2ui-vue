/**
 * A2UI Component Catalog
 * Registry of all available A2UI components
 * Inspired by Angular's Catalog pattern with lazy loading support
 */
import { defineAsyncComponent } from 'vue';

/**
 * Default component catalog
 * Maps component type names to their Vue component definitions
 * Uses lazy loading for better performance
 */
export const DEFAULT_CATALOG = {
  // Layout components
  Row: defineAsyncComponent(() => import('./layout/Row.vue')),
  Column: defineAsyncComponent(() => import('./layout/Column.vue')),
  List: defineAsyncComponent(() => import('./layout/List.vue')),
  Card: defineAsyncComponent(() => import('./layout/Card.vue')),

  // Text components
  Text: defineAsyncComponent(() => import('./text/Text.vue')),
  Icon: defineAsyncComponent(() => import('./text/Icon.vue')),
  Divider: defineAsyncComponent(() => import('./text/Divider.vue')),

  // Input components
  TextField: defineAsyncComponent(() => import('./input/TextField.vue')),
  TextInput: defineAsyncComponent(() => import('./input/TextField.vue')), // Alias
  CheckBox: defineAsyncComponent(() => import('./input/Checkbox.vue')),
  Checkbox: defineAsyncComponent(() => import('./input/Checkbox.vue')), // Alias
  Slider: defineAsyncComponent(() => import('./input/Slider.vue')),
  MultipleChoice: defineAsyncComponent(() => import('./input/MultipleChoice.vue')),
  DateTimeInput: defineAsyncComponent(() => import('./input/DateTimeInput.vue')),

  // Media components
  Image: defineAsyncComponent(() => import('./media/Image.vue')),
  Video: defineAsyncComponent(() => import('./media/Video.vue')),
  AudioPlayer: defineAsyncComponent(() => import('./media/Audio.vue')),

  // Interactive components
  Button: defineAsyncComponent(() => import('./interactive/Button.vue')),
  Tabs: defineAsyncComponent(() => import('./interactive/Tabs.vue')),
  Modal: defineAsyncComponent(() => import('./interactive/Modal.vue')),

  // Custom/extension components (your existing ones)
  Metric: defineAsyncComponent(() => import('./custom/Metric.vue')),
  Chart: defineAsyncComponent(() => import('./custom/Chart.vue')),
};

/**
 * Merged catalog - allows extending the default catalog
 */
let catalog = { ...DEFAULT_CATALOG };

/**
 * Get a component from the catalog
 */
export function getComponent(type) {
  return catalog[type] || null;
}

/**
 * Register a new component or override an existing one
 */
export function registerComponent(type, component) {
  catalog[type] = component;
}

/**
 * Extend the catalog with multiple components
 */
export function extendCatalog(extensions) {
  catalog = { ...catalog, ...extensions };
}

/**
 * Get all registered component types
 */
export function getRegisteredTypes() {
  return Object.keys(catalog);
}

// Export composable utilities
export * from './useA2UIComponent.js';

