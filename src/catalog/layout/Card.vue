<script>
export default { name: 'A2UICard' };
</script>

<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS, useA2UIComponent } from '../useA2UIComponent.js';

// Lazy import to avoid circular dependency
const A2UIRenderer = defineAsyncComponent(() => import('../A2UIRenderer.vue'));

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

const { weight } = useA2UIComponent(props, emit);

// Extract Card properties
const cardProps = computed(() => props.component?.Card || props.component || {});

// Card can have either 'child' (single) or 'children' (multiple)
const children = computed(() => {
  if (cardProps.value.child) {
    return [cardProps.value.child];
  }
  if (cardProps.value.children) {
    if (cardProps.value.children.explicitList) {
      return cardProps.value.children.explicitList;
    }
    if (Array.isArray(cardProps.value.children)) {
      return cardProps.value.children;
    }
  }
  return [];
});
</script>

<template>
  <section class="a2ui-card" :style="{ '--weight': weight }">
    <div class="a2ui-card-content">
      <A2UIRenderer v-for="(child, index) in children" :key="typeof child === 'string' ? child : index"
        :componentId="typeof child === 'string' ? child : child.id" :components="components" :data="data"
        :surfaceId="surfaceId" @action="emit('action', $event)" @dataUpdate="emit('dataUpdate', $event)" />
    </div>
  </section>
</template>

<style scoped>
.a2ui-card {
  display: block;
  flex: var(--weight);
  min-height: 0;
  overflow: auto;
}

.a2ui-card-content {
  height: 100%;
  width: 100%;
  min-height: 0;
  overflow: auto;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1.5rem;
  padding: 1.25rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  transition: box-shadow 0.3s ease;
}

.a2ui-card-content:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.a2ui-card-content>* {
  height: 100%;
  width: 100%;
}
</style>
