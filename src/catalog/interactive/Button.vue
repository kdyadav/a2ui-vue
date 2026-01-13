<script>
export default { name: 'A2UIButton' };
</script>

<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS, useA2UIComponent } from '../useA2UIComponent.js';

// Lazy import to avoid circular dependency
const A2UIRenderer = defineAsyncComponent(() => import('../A2UIRenderer.vue'));

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

const { weight, sendAction, resolve } = useA2UIComponent(props, emit);

// Extract Button properties
const buttonProps = computed(() => props.component?.Button || props.component || {});
const action = computed(() => buttonProps.value.action || null);
const ariaLabel = computed(() => buttonProps.value.ariaLabel || '');
const child = computed(() => buttonProps.value.child || null);

// Support for non-spec 'label' property as fallback for convenience
// Spec uses 'child' to reference a Text component, but 'label' is more convenient for inline text
const label = computed(() => {
  const labelVal = buttonProps.value.label;
  if (!labelVal) return null;
  return resolve(labelVal);
});

const handleClick = () => {
  if (action.value) {
    sendAction(action.value);
  }
};
</script>

<template>
  <button class="a2ui-button" :style="{ '--weight': weight }" :aria-label="ariaLabel" @click="handleClick">
    <!-- Spec-compliant: render child component -->
    <A2UIRenderer v-if="child" :componentId="child" :components="components" :data="data" :surfaceId="surfaceId"
      @action="emit('action', $event)" @dataUpdate="emit('dataUpdate', $event)" />
    <!-- Convenience fallback: render label directly -->
    <span v-else-if="label">{{ label }}</span>
    <slot v-else />
  </button>
</template>

<style scoped>
.a2ui-button {
  display: flex;
  flex: var(--weight);
  min-height: 0;
  width: 100%;
  background: #2563eb;
  color: white;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  transition: all 0.2s ease;
  justify-content: center;
  align-items: center;
}

.a2ui-button:hover {
  background: #1d4ed8;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.a2ui-button:active {
  transform: scale(0.95);
}

.a2ui-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
}
</style>
