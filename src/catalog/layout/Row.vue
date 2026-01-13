<script>
export default { name: 'A2UIRow' };
</script>

<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS, useA2UIComponent } from '../useA2UIComponent.js';

// Lazy import to avoid circular dependency
const A2UIRenderer = defineAsyncComponent(() => import('../A2UIRenderer.vue'));

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

const { weight, resolve } = useA2UIComponent(props, emit);

// Extract Row properties
const rowProps = computed(() => props.component?.Row || props.component || {});
const alignment = computed(() => rowProps.value.alignment || 'stretch');
const distribution = computed(() => rowProps.value.distribution || 'start');

// Resolve children - supports both explicitList and template
const childrenDef = computed(() => rowProps.value.children);
const isTemplated = computed(() => !!childrenDef.value?.template);

// Static children from explicitList
const staticChildren = computed(() => {
  if (!childrenDef.value) return [];
  if (childrenDef.value.explicitList) return childrenDef.value.explicitList;
  return [];
});

// Dynamic children from template
const templateConfig = computed(() => childrenDef.value?.template || null);
const templateItems = computed(() => {
  if (!templateConfig.value?.dataBinding) return [];
  const data = resolve({ path: templateConfig.value.dataBinding });
  return Array.isArray(data) ? data : [];
});

// Dynamic classes for alignment and distribution
const classes = computed(() => ({
  'a2ui-row': true,
  [`align-${alignment.value}`]: true,
  [`distribute-${distribution.value}`]: true
}));
</script>

<template>
  <section :class="classes" :style="{ '--weight': weight }">
    <!-- Static children from explicitList -->
    <A2UIRenderer v-if="!isTemplated" v-for="childId in staticChildren" :key="childId" :componentId="childId"
      :components="components" :data="data" :surfaceId="surfaceId" @action="emit('action', $event)"
      @dataUpdate="emit('dataUpdate', $event)" />

    <!-- Dynamic children from template -->
    <A2UIRenderer v-if="isTemplated && templateConfig" v-for="(item, index) in templateItems" :key="`template-${index}`"
      :componentId="templateConfig.componentId" :components="components" :data="{ ...data, $item: item, $index: index }"
      :surfaceId="surfaceId" @action="emit('action', $event)" @dataUpdate="emit('dataUpdate', $event)" />
  </section>
</template>

<style scoped>
.a2ui-row {
  display: flex;
  flex-direction: row;
  flex: var(--weight);
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* Alignment (cross-axis) */
.align-start {
  align-items: flex-start;
}

.align-center {
  align-items: center;
}

.align-end {
  align-items: flex-end;
}

.align-stretch {
  align-items: stretch;
}

/* Distribution (main-axis) */
.distribute-start {
  justify-content: flex-start;
}

.distribute-center {
  justify-content: center;
}

.distribute-end {
  justify-content: flex-end;
}

.distribute-spaceBetween {
  justify-content: space-between;
}

.distribute-spaceAround {
  justify-content: space-around;
}

.distribute-spaceEvenly {
  justify-content: space-evenly;
}
</style>
