# A2UI Component Catalog Refactoring

## 📋 Overview

This document describes the refactoring of `A2UISurface.vue` to use a **component catalog architecture** based on the [A2UI v0.8 specification](https://a2ui.org/specification/v0_8/a2ui_protocol/).

**Date:** 2026-01-29  
**Status:** ✅ Complete (Phase 1)

---

## 🎯 Goals

1. **Modularity**: Separate each component type into its own file
2. **Maintainability**: Make it easy to add/modify components
3. **A2UI Compliance**: Follow the official catalog-based architecture
4. **Reusability**: Extract shared logic into composables
5. **Scalability**: Support custom catalogs in the future

---

## 📊 Before & After

### Before (Monolithic)
```
src/
├── A2UISurface.vue (246 lines - all components in one file)
├── App.vue
├── useA2UIParser.js
└── main.js
```

**Issues:**
- ❌ All 9 component types in one 246-line file
- ❌ Chart logic mixed with general rendering
- ❌ Hard to test individual components
- ❌ Difficult to extend with new components

### After (Catalog-Based)
```
src/
├── A2UISurface.vue (28 lines - orchestrator only)
├── composables/
│   ├── useDataResolver.js (data binding logic)
│   └── useChartRenderer.js (Plotly logic)
├── components/
│   └── a2ui/
│       ├── index.js (component registry)
│       ├── layout/
│       │   ├── A2UIColumn.vue
│       │   ├── A2UIRow.vue
│       │   └── A2UICard.vue
│       ├── display/
│       │   ├── A2UIText.vue
│       │   ├── A2UIIcon.vue
│       │   └── A2UIMetric.vue
│       ├── interactive/
│       │   └── A2UIButton.vue
│       ├── visualization/
│       │   ├── A2UIChart.vue
│       │   └── A2UIProgressBar.vue
│       └── A2UIError.vue
├── App.vue
├── useA2UIParser.js
└── main.js
```

**Benefits:**
- ✅ Each component in its own file (~20-60 lines each)
- ✅ Shared logic extracted to composables
- ✅ Easy to test components in isolation
- ✅ Simple to add new components to catalog
- ✅ Follows A2UI specification patterns

---

## 🏗️ Architecture

### 1. Component Catalog (`src/components/a2ui/index.js`)

The catalog is the **registry** that maps component type names to Vue components:

```javascript
export const componentCatalog = {
  Column: A2UIColumn,
  Row: A2UIRow,
  Card: A2UICard,
  Text: A2UIText,
  Icon: A2UIIcon,
  Metric: A2UIMetric,
  Button: A2UIButton,
  Chart: A2UIChart,
  ProgressBar: A2UIProgressBar,
  Error: A2UIError
};
```

**Catalog ID:** `https://a2ui.org/specification/v0_8/standard_catalog_definition.json`

### 2. Composables

#### `useDataResolver.js`
Handles A2UI data binding (BoundValue resolution):
- `literalString`, `literalNumber`, `literalBool`
- JSON Pointer path resolution (`/user/name`)
- Supports local data context for templates

#### `useChartRenderer.js`
Handles Plotly chart rendering:
- Data transformation
- Chart configuration
- Lifecycle management (mount, update)

### 3. A2UISurface (Orchestrator)

Now a **lightweight orchestrator** (28 lines):

```vue
<script setup>
import { computed } from 'vue';
import { getComponent } from '@/components/a2ui';

const componentToRender = computed(() => {
  return getComponent(type.value);
});
</script>

<template>
  <component 
    :is="componentToRender"
    :args="args"
    :data="data"
    :components="components"
    @action="$emit('action', $event)"
  />
</template>
```

Uses Vue's `<component :is="...">` for dynamic rendering.

---

## 📦 Component Categories

### Layout Components
- **Column**: Vertical flex layout
- **Row**: Horizontal flex layout
- **Card**: Container with card styling

### Display Components
- **Text**: Text with usage hints (h1, caption, body)
- **Icon**: Material Icons display
- **Metric**: Metric card with optional trend

### Interactive Components
- **Button**: Clickable button with action handling

### Visualization Components
- **Chart**: Plotly charts (bar, line)
- **ProgressBar**: Progress indicator

### Error Component
- **Error**: Fallback for unknown component types

---

## 🔄 Migration Impact

### Breaking Changes
**None!** The refactoring is **100% backward compatible**.

### Files Modified
1. `src/A2UISurface.vue` - Simplified to 28 lines
2. No changes to `App.vue` or `useA2UIParser.js`

### Files Created
- 2 composables
- 10 component files
- 1 catalog registry

---

## ✅ Testing

The application was tested with the existing demo:
- ✅ All 6 surfaces render correctly
- ✅ Charts update dynamically
- ✅ Progress bars animate
- ✅ Buttons emit actions
- ✅ Hot module reload works

**Test URL:** http://localhost:5174/

---

## 🚀 Future Enhancements

### Phase 2: Advanced Features (Planned)
- [ ] Support for `template` children (dynamic lists)
- [ ] Custom catalog support
- [ ] Catalog negotiation with agents
- [ ] Component lazy loading

### Phase 3: Additional Components
- [ ] Input components (TextField, Checkbox, etc.)
- [ ] Image component
- [ ] Link component
- [ ] List component with templates

---

## 📚 References

- [A2UI v0.8 Specification](https://a2ui.org/specification/v0_8/a2ui_protocol/)
- [A2UI Standard Catalog](https://a2ui.org/specification/v0_8/standard_catalog_definition.json)
- [A2A Extension Spec](https://a2ui.org/specification/v0_8-a2a-extension/)

---

## 👥 Contributors

- Refactoring based on A2UI official specification
- Inspired by catalog-based architecture patterns

