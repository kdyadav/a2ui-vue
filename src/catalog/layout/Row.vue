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

const { weight } = useA2UIComponent(props, emit);

// Extract Row properties
const rowProps = computed(() => props.component?.Row || props.component || {});
const alignment = computed(() => rowProps.value.alignment || 'stretch');
const distribution = computed(() => rowProps.value.distribution || 'start');
const children = computed(() => {
  const childrenDef = rowProps.value.children;
  if (!childrenDef) return [];
  if (childrenDef.explicitList) return childrenDef.explicitList;
  return [];
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
    <A2UIRenderer v-for="childId in children" :key="childId" :componentId="childId" :components="components"
      :data="data" :surfaceId="surfaceId" @action="emit('action', $event)" @dataUpdate="emit('dataUpdate', $event)" />
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
