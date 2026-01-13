<script>
export default { name: 'A2UIRenderer' };
</script>

<script setup>
import { computed } from 'vue';
import { getComponent, A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS } from './index.js';

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

// Get the component definition from the components map
const componentDef = computed(() => {
  if (!props.componentId || !props.components) return null;
  return props.components[props.componentId] || null;
});

// Determine the component type
const componentType = computed(() => {
  if (!componentDef.value) return null;
  
  // Check for known component type keys
  const knownTypes = [
    'Row', 'Column', 'List', 'Card',
    'Text', 'Icon', 'Divider',
    'TextField', 'TextInput', 'CheckBox', 'Checkbox', 'Slider', 'MultipleChoice', 'DateTimeInput',
    'Image', 'Video', 'AudioPlayer',
    'Button', 'Tabs', 'Modal',
    'Metric', 'Chart'
  ];
  
  for (const type of knownTypes) {
    if (componentDef.value[type]) {
      return type;
    }
  }
  
  // Fallback: check for 'type' property
  if (componentDef.value.type) {
    return componentDef.value.type;
  }
  
  return null;
});

// Get the weight from the component definition
const componentWeight = computed(() => {
  if (!componentDef.value || !componentType.value) return 'initial';
  const typeProps = componentDef.value[componentType.value];
  return typeProps?.weight ?? 'initial';
});

// Resolve the Vue component from the catalog
const resolvedComponent = computed(() => {
  if (!componentType.value) return null;
  return getComponent(componentType.value);
});

// Forward events
const handleAction = (event) => emit('action', event);
const handleDataUpdate = (event) => emit('dataUpdate', event);
</script>

<template>
  <component
    v-if="resolvedComponent && componentDef"
    :is="resolvedComponent"
    :componentId="componentId"
    :component="componentDef"
    :components="components"
    :data="data"
    :surfaceId="surfaceId"
    :weight="componentWeight"
    @action="handleAction"
    @dataUpdate="handleDataUpdate"
  />
  <div v-else-if="componentId && !componentDef" class="a2ui-renderer-error">
    Component not found: {{ componentId }}
  </div>
  <div v-else-if="componentDef && !resolvedComponent" class="a2ui-renderer-error">
    Unknown component type: {{ componentType || 'undefined' }}
  </div>
</template>

<style scoped>
.a2ui-renderer-error {
  padding: 0.5rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.25rem;
  color: #dc2626;
  font-size: 0.75rem;
}
</style>

