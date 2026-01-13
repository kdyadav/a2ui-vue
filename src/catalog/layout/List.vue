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

const { weight } = useA2UIComponent(props, emit);

// Extract List properties
const listProps = computed(() => props.component?.List || props.component || {});
const direction = computed(() => listProps.value.direction || 'vertical');
const children = computed(() => {
  const childrenDef = listProps.value.children;
  if (!childrenDef) return [];
  if (childrenDef.explicitList) return childrenDef.explicitList;
  // Handle array of component nodes
  if (Array.isArray(childrenDef)) return childrenDef;
  return [];
});

const classes = computed(() => ({
  'a2ui-list': true,
  [`direction-${direction.value}`]: true
}));
</script>

<template>
  <section :class="classes" :style="{ '--weight': weight }">
    <A2UIRenderer v-for="(child, index) in children" :key="typeof child === 'string' ? child : index"
      :componentId="typeof child === 'string' ? child : child.id" :components="components" :data="data"
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
