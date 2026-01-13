<script>
export default { name: 'A2UIList' };
</script>

<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS, useA2UIComponent } from '../useA2UIComponent.js';

// Lazy import to avoid circular dependency
const A2UIRenderer = defineAsyncComponent(() => import('../A2UIRenderer.vue'));

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

const { weight, resolve } = useA2UIComponent(props, emit);

// Extract List properties
const listProps = computed(() => props.component?.List || props.component || {});
const direction = computed(() => listProps.value.direction || 'vertical');

// Resolve children - supports both explicitList and template
const childrenDef = computed(() => listProps.value.children);
const isTemplated = computed(() => !!childrenDef.value?.template);

// Static children from explicitList
const staticChildren = computed(() => {
  const def = childrenDef.value;
  if (!def) return [];
  if (def.explicitList) return def.explicitList;
  // Handle array of component nodes (legacy support)
  if (Array.isArray(def)) return def;
  return [];
});

// Dynamic children from template
const templateConfig = computed(() => childrenDef.value?.template || null);
const templateItems = computed(() => {
  if (!templateConfig.value?.dataBinding) return [];
  const data = resolve({ path: templateConfig.value.dataBinding });
  return Array.isArray(data) ? data : [];
});

const classes = computed(() => ({
  'a2ui-list': true,
  [`direction-${direction.value}`]: true
}));
</script>

<template>
  <section :class="classes" :style="{ '--weight': weight }">
    <!-- Static children from explicitList -->
    <A2UIRenderer v-if="!isTemplated" v-for="(child, index) in staticChildren"
      :key="typeof child === 'string' ? child : index" :componentId="typeof child === 'string' ? child : child.id"
      :components="components" :data="data" :surfaceId="surfaceId" @action="emit('action', $event)"
      @dataUpdate="emit('dataUpdate', $event)" />

    <!-- Dynamic children from template -->
    <A2UIRenderer v-if="isTemplated && templateConfig" v-for="(item, index) in templateItems" :key="`template-${index}`"
      :componentId="templateConfig.componentId" :components="components" :data="{ ...data, $item: item, $index: index }"
      :surfaceId="surfaceId" @action="emit('action', $event)" @dataUpdate="emit('dataUpdate', $event)" />
  </section>
</template>

<style scoped>
.a2ui-list {
  display: flex;
  flex: var(--weight);
  min-height: 0;
  overflow: auto;
  gap: 0.5rem;
}

.direction-vertical {
  flex-direction: column;
}

.direction-horizontal {
  flex-direction: row;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}

.direction-horizontal::-webkit-scrollbar {
  display: none;
}

.direction-horizontal>* {
  flex: 1 0 auto;
  max-width: min(80%, 400px);
}
</style>
