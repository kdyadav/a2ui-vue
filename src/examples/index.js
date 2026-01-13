/**
 * A2UI Examples Index
 * Export all example components for easy access
 */

export { default as ComponentShowcase } from './ComponentShowcase.vue';
export { default as SimpleExample } from './SimpleExample.vue';
export { default as StreamingExample } from './StreamingExample.vue';
export { default as NestedDataExample } from './NestedDataExample.vue';
export { default as DynamicListExample } from './DynamicListExample.vue';
export { default as DashboardExample } from './DashboardExample.vue';
export { default as MediaPlayerExample } from './MediaPlayerExample.vue';
export { default as SettingsPanelExample } from './SettingsPanelExample.vue';
export { default as ModalWorkflowExample } from './ModalWorkflowExample.vue';

/**
 * Example definitions for the example viewer
 */
export const examples = [
  {
    id: 'showcase',
    name: 'Component Showcase',
    description: 'All A2UI catalog components in one view',
    component: () => import('./ComponentShowcase.vue')
  },
  {
    id: 'simple',
    name: 'Simple Form',
    description: 'Basic form with two-way data binding',
    component: () => import('./SimpleExample.vue')
  },
  {
    id: 'streaming',
    name: 'Streaming UI',
    description: 'Progressive UI building with streaming messages',
    component: () => import('./StreamingExample.vue')
  },
  {
    id: 'nested',
    name: 'Nested Data',
    description: 'Complex nested object data binding',
    component: () => import('./NestedDataExample.vue')
  },
  {
    id: 'dynamic-list',
    name: 'Dynamic List',
    description: 'Todo list with add/delete/toggle actions',
    component: () => import('./DynamicListExample.vue')
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Multi-card dashboard with metrics and charts',
    component: () => import('./DashboardExample.vue')
  },
  {
    id: 'media-player',
    name: 'Media Player',
    description: 'Audio player with playlist and controls',
    component: () => import('./MediaPlayerExample.vue')
  },
  {
    id: 'settings',
    name: 'Settings Panel',
    description: 'Tabbed settings with various input types',
    component: () => import('./SettingsPanelExample.vue')
  },
  {
    id: 'modals',
    name: 'Modal Workflows',
    description: 'Confirmation dialogs and form modals',
    component: () => import('./ModalWorkflowExample.vue')
  }
];

