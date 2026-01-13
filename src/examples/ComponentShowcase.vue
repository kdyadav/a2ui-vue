<script setup>
/**
 * Component Showcase - Demonstrates all A2UI catalog components
 */
import { reactive } from 'vue';
import A2UISurface from '../A2UISurface.vue';

// Example data for components
const data = reactive({
  username: 'John Doe',
  email: '',
  notifications: true,
  volume: 65,
  theme: 'dark',
  birthdate: '1990-01-15',
  chartData: [
    { label: 'Mon', value: 45 },
    { label: 'Tue', value: 72 },
    { label: 'Wed', value: 58 },
    { label: 'Thu', value: 89 },
    { label: 'Fri', value: 67 }
  ]
});

// Component definitions for showcase
const components = {
  // Root layout
  'root': { Column: { children: { explicitList: ['header-card', 'layout-section', 'text-section', 'input-section', 'media-section', 'interactive-section', 'custom-section'] } } },

  // Header Card
  'header-card': { Card: { child: 'header-content' } },
  'header-content': { Row: { alignment: 'center', children: { explicitList: ['header-icon', 'header-text'] } } },
  'header-icon': { Icon: { name: 'dashboard' } },
  'header-text': { Column: { children: { explicitList: ['header-title', 'header-subtitle'] } } },
  'header-title': { Text: { text: { literalString: 'A2UI Component Catalog' }, usageHint: 'h1' } },
  'header-subtitle': { Text: { text: { literalString: 'All available components in the Vue 3 renderer' }, usageHint: 'body' } },

  // Layout Section
  'layout-section': { Card: { child: 'layout-content' } },
  'layout-content': { Column: { children: { explicitList: ['layout-title', 'layout-divider', 'layout-demo-row', 'layout-demo-list'] } } },
  'layout-title': { Text: { text: { literalString: 'Layout Components' }, usageHint: 'caption' } },
  'layout-divider': { Divider: {} },
  'layout-demo-row': { Row: { distribution: 'spaceAround', children: { explicitList: ['row-item-1', 'row-item-2', 'row-item-3'] } } },
  'row-item-1': { Text: { text: { literalString: 'Row Item 1' } } },
  'row-item-2': { Text: { text: { literalString: 'Row Item 2' } } },
  'row-item-3': { Text: { text: { literalString: 'Row Item 3' } } },
  'layout-demo-list': { List: { direction: 'horizontal', children: { explicitList: ['list-card-1', 'list-card-2', 'list-card-3'] } } },
  'list-card-1': { Card: { child: 'list-text-1' } },
  'list-card-2': { Card: { child: 'list-text-2' } },
  'list-card-3': { Card: { child: 'list-text-3' } },
  'list-text-1': { Text: { text: { literalString: 'Horizontal List Item 1' } } },
  'list-text-2': { Text: { text: { literalString: 'Horizontal List Item 2' } } },
  'list-text-3': { Text: { text: { literalString: 'Horizontal List Item 3' } } },

  // Text Section
  'text-section': { Card: { child: 'text-content' } },
  'text-content': { Column: { children: { explicitList: ['text-title', 'text-divider', 'text-h1', 'text-h2', 'text-h3', 'text-body', 'text-caption', 'text-icons-row'] } } },
  'text-title': { Text: { text: { literalString: 'Text & Icons' }, usageHint: 'caption' } },
  'text-divider': { Divider: {} },
  'text-h1': { Text: { text: { literalString: 'Heading 1 (h1)' }, usageHint: 'h1' } },
  'text-h2': { Text: { text: { literalString: 'Heading 2 (h2)' }, usageHint: 'h2' } },
  'text-h3': { Text: { text: { literalString: 'Heading 3 (h3)' }, usageHint: 'h3' } },
  'text-body': { Text: { text: { literalString: 'This is body text with **bold** and *italic* formatting support.' }, usageHint: 'body' } },
  'text-caption': { Text: { text: { literalString: 'Caption Text' }, usageHint: 'caption' } },
  'text-icons-row': { Row: { children: { explicitList: ['icon-home', 'icon-settings', 'icon-person', 'icon-star', 'icon-favorite'] } } },
  'icon-home': { Icon: { name: 'home' } },
  'icon-settings': { Icon: { name: 'settings' } },
  'icon-person': { Icon: { name: 'person' } },
  'icon-star': { Icon: { name: 'star' } },
  'icon-favorite': { Icon: { name: 'favorite' } },

  // Input Section
  'input-section': { Card: { child: 'input-content' } },
  'input-content': { Column: { children: { explicitList: ['input-title', 'input-divider', 'input-textfield', 'input-checkbox', 'input-slider', 'input-select', 'input-datetime'] } } },
  'input-title': { Text: { text: { literalString: 'Input Components' }, usageHint: 'caption' } },
  'input-divider': { Divider: {} },
  'input-textfield': { TextField: { label: 'Email Address', placeholder: 'Enter your email', text: { path: '/email' } } },
  'input-checkbox': { Checkbox: { label: 'Enable notifications', value: { path: '/notifications' } } },
  'input-slider': { Slider: { label: 'Volume', minValue: 0, maxValue: 100, value: { path: '/volume' } } },
  'input-select': { MultipleChoice: { description: 'Select theme', options: [{ value: 'light', label: { literalString: 'Light Mode' } }, { value: 'dark', label: { literalString: 'Dark Mode' } }, { value: 'system', label: { literalString: 'System Default' } }], selections: { path: '/theme' } } },
  'input-datetime': { DateTimeInput: { enableDate: true, enableTime: false, value: { path: '/birthdate' } } },

  // Media Section
  'media-section': { Card: { child: 'media-content' } },
  'media-content': { Column: { children: { explicitList: ['media-title', 'media-divider', 'media-row'] } } },
  'media-title': { Text: { text: { literalString: 'Media Components' }, usageHint: 'caption' } },
  'media-divider': { Divider: {} },
  'media-row': { Row: { children: { explicitList: ['media-image', 'media-info'] } } },
  'media-image': { Image: { url: { literalString: 'https://picsum.photos/200/150' }, usageHint: 'thumbnail', alt: { literalString: 'Sample image' } } },
  'media-info': { Column: { children: { explicitList: ['media-note-1', 'media-note-2'] } } },
  'media-note-1': { Text: { text: { literalString: 'Image component with thumbnail hint' } } },
  'media-note-2': { Text: { text: { literalString: 'Video and Audio components also available' }, usageHint: 'caption' } },

  // Interactive Section
  'interactive-section': { Card: { child: 'interactive-content' } },
  'interactive-content': { Column: { children: { explicitList: ['interactive-title', 'interactive-divider', 'interactive-buttons', 'interactive-tabs', 'interactive-modal'] } } },
  'interactive-title': { Text: { text: { literalString: 'Interactive Components' }, usageHint: 'caption' } },
  'interactive-divider': { Divider: {} },
  'interactive-buttons': { Row: { children: { explicitList: ['btn-primary', 'btn-secondary'] } } },
  'btn-primary': { Button: { child: 'btn-primary-text', action: { name: 'primaryAction' }, ariaLabel: 'Primary action' } },
  'btn-primary-text': { Text: { text: { literalString: 'Primary Button' } } },
  'btn-secondary': { Button: { child: 'btn-secondary-text', action: { name: 'secondaryAction' }, ariaLabel: 'Secondary action' } },
  'btn-secondary-text': { Text: { text: { literalString: 'Secondary Button' } } },
  'interactive-tabs': { Tabs: { tabItems: [{ title: { literalString: 'Tab 1' }, child: 'tab1-content' }, { title: { literalString: 'Tab 2' }, child: 'tab2-content' }, { title: { literalString: 'Tab 3' }, child: 'tab3-content' }] } },
  'tab1-content': { Text: { text: { literalString: 'Content for Tab 1' } } },
  'tab2-content': { Text: { text: { literalString: 'Content for Tab 2' } } },
  'tab3-content': { Text: { text: { literalString: 'Content for Tab 3' } } },
  'interactive-modal': { Modal: { entryPointChild: 'modal-trigger', contentChild: 'modal-content' } },
  'modal-trigger': { Button: { child: 'modal-trigger-text', ariaLabel: 'Open modal' } },
  'modal-trigger-text': { Text: { text: { literalString: 'Open Modal' } } },
  'modal-content': { Column: { children: { explicitList: ['modal-title', 'modal-body'] } } },
  'modal-title': { Text: { text: { literalString: 'Modal Dialog' }, usageHint: 'h2' } },
  'modal-body': { Text: { text: { literalString: 'This is the modal content. Click outside or the X to close.' } } },

  // Custom Section (Metric & Chart)
  'custom-section': { Card: { child: 'custom-content' } },
  'custom-content': { Column: { children: { explicitList: ['custom-title', 'custom-divider', 'custom-row'] } } },
  'custom-title': { Text: { text: { literalString: 'Custom Components' }, usageHint: 'caption' } },
  'custom-divider': { Divider: {} },
  'custom-row': { Row: { children: { explicitList: ['metric-demo', 'chart-demo'] } } },
  'metric-demo': { Metric: { label: 'Active Users', value: { literalString: '1,234' }, unit: 'users', trend: 12.5 } },
  'chart-demo': { Chart: { type: 'bar', title: { literalString: 'Weekly Activity' }, data: { path: '/chartData' } } }
};

const handleAction = (action) => {
  console.log('[Showcase] Action:', action);
  alert(`Action triggered: ${action.name}`);
};

const handleDataUpdate = ({ path, value }) => {
  console.log('[Showcase] Data update:', path, '=', value);
  // Update data using JSON Pointer
  const tokens = path.slice(1).split('/');
  let current = data;
  for (let i = 0; i < tokens.length - 1; i++) {
    current = current[tokens[i]];
  }
  current[tokens[tokens.length - 1]] = value;
};
</script>

<template>
  <div class="showcase">
    <A2UISurface
      componentId="root"
      :components="components"
      :data="data"
      surfaceId="showcase"
      @action="handleAction"
      @dataUpdate="handleDataUpdate"
    />
  </div>
</template>

<style scoped>
.showcase {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  background: #f5f5f5;
  min-height: 100vh;
}
</style>

