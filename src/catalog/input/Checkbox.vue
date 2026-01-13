<script>
export default { name: 'A2UICheckbox' };
</script>

<script setup>
import { computed } from 'vue';
import { A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS, useA2UIComponent } from '../useA2UIComponent.js';

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

const { weight, resolve, getUniqueId, setData } = useA2UIComponent(props, emit);

// Extract Checkbox properties
const checkboxProps = computed(() =>
  props.component?.CheckBox || props.component?.Checkbox || props.component || {}
);

const label = computed(() => resolve(checkboxProps.value.label) || '');

// Get the binding path (supports 'fieldPath', 'value.path', and 'binding' properties)
const bindingPath = computed(() => {
  if (checkboxProps.value.fieldPath) return checkboxProps.value.fieldPath;
  const valueVal = checkboxProps.value.value;
  if (valueVal?.path) return valueVal.path;
  return checkboxProps.value.binding || null;
});

const isChecked = computed(() => {
  if (bindingPath.value) {
    return resolve({ path: bindingPath.value }) ?? false;
  }
  return resolve(checkboxProps.value.value) ?? false;
});

const inputId = getUniqueId('a2ui-checkbox');

const handleChange = (event) => {
  if (!bindingPath.value) return;
  setData(bindingPath.value, event.target.checked);
};
</script>

<template>
  <section class="a2ui-checkbox" :style="{ '--weight': weight }">
    <input type="checkbox" autocomplete="off" class="a2ui-checkbox__input" :id="inputId" :checked="isChecked"
      @change="handleChange" />
    <label :for="inputId" class="a2ui-checkbox__label">
      {{ label }}
    </label>
  </section>
</template>

<style scoped>
.a2ui-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: var(--weight);
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.a2ui-checkbox:hover {
  background: #f9fafb;
}

.a2ui-checkbox__input {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  border: 1px solid #d1d5db;
  cursor: pointer;
  accent-color: #2563eb;
}

.a2ui-checkbox__label {
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  user-select: none;
}
</style>
