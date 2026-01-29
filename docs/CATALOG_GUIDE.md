# A2UI Component Catalog Guide

## 📖 Introduction

This guide explains how to work with the A2UI component catalog in this Vue implementation.

---

## 🎯 What is a Component Catalog?

A **Component Catalog** is a registry of UI components that can be rendered by the A2UI system. It's based on the [A2UI v0.8 specification](https://a2ui.org/specification/v0_8/a2ui_protocol/).

### Key Concepts

1. **Catalog ID**: A unique identifier for the catalog (usually a URI)
2. **Component Registry**: A map of component type names to Vue components
3. **Catalog Negotiation**: Process where client and server agree on which catalog to use

---

## 📦 Current Catalog

**Catalog ID:** `https://a2ui.org/specification/v0_8/standard_catalog_definition.json`

### Supported Components

| Category | Components |
|----------|-----------|
| **Layout** | Column, Row, Card |
| **Display** | Text, Icon, Metric |
| **Interactive** | Button |
| **Visualization** | Chart, ProgressBar |
| **Error** | Error (fallback) |

---

## 🔧 Adding a New Component

### Step 1: Create the Component File

Create a new Vue component in the appropriate category folder:

```vue
<!-- src/components/a2ui/display/A2UIImage.vue -->
<script setup>
import { useDataResolver } from '@/composables/useDataResolver';
import { toRef } from 'vue';

const props = defineProps({
  args: { type: Object, required: true },
  data: { type: Object, required: true }
});

const { resolve } = useDataResolver(toRef(props, 'data'));
</script>

<template>
  <img 
    :src="resolve(args.url)" 
    :alt="resolve(args.alt) || ''"
    class="w-full h-auto rounded-lg"
  />
</template>
```

### Step 2: Register in Catalog

Add the component to `src/components/a2ui/index.js`:

```javascript
// Import
import A2UIImage from './display/A2UIImage.vue';

// Add to catalog
export const componentCatalog = {
  // ... existing components
  Image: A2UIImage,
};
```

### Step 3: Test

The component is now available! Use it in your A2UI messages:

```json
{
  "surfaceUpdate": {
    "surfaceId": "main",
    "components": [{
      "id": "my-image",
      "component": {
        "Image": {
          "url": { "literalString": "https://example.com/image.jpg" },
          "alt": { "literalString": "Example image" }
        }
      }
    }]
  }
}
```

---

## 🧩 Using Composables

### Data Resolver

Use `useDataResolver` for components that need to resolve BoundValues:

```vue
<script setup>
import { useDataResolver } from '@/composables/useDataResolver';
import { toRef } from 'vue';

const props = defineProps({
  args: Object,
  data: Object
});

const { resolve } = useDataResolver(toRef(props, 'data'));
</script>

<template>
  <div>{{ resolve(args.text) }}</div>
</template>
```

### Chart Renderer

Use `useChartRenderer` for Plotly-based visualizations:

```vue
<script setup>
import { useChartRenderer } from '@/composables/useChartRenderer';
import { useDataResolver } from '@/composables/useDataResolver';
import { toRef } from 'vue';

const props = defineProps({
  args: Object,
  data: Object
});

const dataRef = toRef(props, 'data');
const { resolve } = useDataResolver(dataRef);
const { chartRef, drawChart } = useChartRenderer({
  resolve,
  args: toRef(props, 'args'),
  data: dataRef
});
</script>

<template>
  <div ref="chartRef" class="w-full h-64"></div>
</template>
```

---

## 🔄 Recursive Components

Layout components (Column, Row, Card, Button) need to recursively render children:

```vue
<script setup>
import A2UISurface from '@/A2UISurface.vue';

defineProps({
  args: Object,
  components: Object,
  data: Object
});

defineEmits(['action']);
</script>

<template>
  <div class="flex flex-col gap-4">
    <A2UISurface 
      v-for="id in args.children.explicitList" 
      :key="id" 
      :componentId="id" 
      :components="components"
      :data="data" 
      @action="$emit('action', $event)" 
    />
  </div>
</template>
```

---

## 🎨 Styling Guidelines

All components use **Tailwind CSS** with a dark theme:

### Color Palette
- Background: `#09090b`, `#18181b`
- Borders: `zinc-800`, `zinc-700`
- Text: `zinc-200`, `zinc-300`, `zinc-400`
- Accent: `indigo-500`

### Common Classes
```css
/* Cards */
bg-[#18181b] border border-zinc-800 rounded-xl p-5

/* Text */
text-zinc-400 text-sm

/* Buttons */
bg-zinc-800 hover:bg-zinc-700 text-zinc-300
```

---

## 🧪 Testing Components

Test individual components in isolation:

```javascript
import { mount } from '@vue/test-utils';
import A2UIText from '@/components/a2ui/display/A2UIText.vue';

test('renders text correctly', () => {
  const wrapper = mount(A2UIText, {
    props: {
      args: { text: { literalString: 'Hello' } },
      data: {}
    }
  });
  
  expect(wrapper.text()).toBe('Hello');
});
```

---

## 📚 Resources

- [A2UI Specification](https://a2ui.org/specification/v0_8/a2ui_protocol/)
- [Component Reference](https://a2ui.org/reference/component-reference/)
- [REFACTORING.md](../REFACTORING.md) - Architecture details

