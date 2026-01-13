<script>
export default { name: 'A2UIDivider' };
</script>

<script setup>
import { A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS, useA2UIComponent } from '../useA2UIComponent.js';

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

const { weight } = useA2UIComponent(props, emit);
</script>

<template>
  <hr class="a2ui-divider" :style="{ '--weight': weight }" />
</template>

<style scoped>
.a2ui-divider {
  display: block;
  flex: var(--weight);
  min-height: 0;
  height: 1px;
  background: #e5e7eb;
  border: none;
  margin: 0.5rem 0;
}
</style>

