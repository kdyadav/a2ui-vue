<script>
export default { name: 'A2UIColumn' };
</script>

<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS, useA2UIComponent } from '../useA2UIComponent.js';

// Lazy import to avoid circular dependency
const A2UIRenderer = defineAsyncComponent(() => import('../A2UIRenderer.vue'));

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

const { weight } = useA2UIComponent(props, emit);

// Extract Column properties
const colProps = computed(() => props.component?.Column || props.component || {});
const alignment = computed(() => colProps.value.alignment || 'stretch');
const distribution = computed(() => colProps.value.distribution || 'start');
const children = computed(() => {
  const childrenDef = colProps.value.children;
  if (!childrenDef) return [];
  if (childrenDef.explicitList) return childrenDef.explicitList;
  return [];
});

// Dynamic classes for alignment and distribution
const classes = computed(() => ({
  'a2ui-column': true,
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
.a2ui-column {
  display: flex;
  flex-direction: column;
  flex: var(--weight);
  min-width: 100%;
  height: 100%;
  box-sizing: border-box;
  gap: 1rem;
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
