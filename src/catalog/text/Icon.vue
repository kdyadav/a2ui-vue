<script>
export default { name: 'A2UIIcon' };
</script>

<script setup>
import { computed } from 'vue';
import { A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS, useA2UIComponent } from '../useA2UIComponent.js';

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

const { weight, resolve } = useA2UIComponent(props, emit);

// Extract Icon properties
const iconProps = computed(() => props.component?.Icon || props.component || {});
const name = computed(() => resolve(iconProps.value.name) || '');
</script>

<template>
  <section v-if="name" class="a2ui-icon" :style="{ '--weight': weight }">
    <span class="material-icons notranslate">{{ name }}</span>
  </section>
</template>

<style scoped>
.a2ui-icon {
  display: flex;
  flex: var(--weight);
  min-height: 0;
  overflow: hidden;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background-color: #eff6ff;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.a2ui-icon .material-icons {
  color: #2563eb;
  font-size: 1.25rem;
  line-height: 1;
  user-select: none;
}
</style>

