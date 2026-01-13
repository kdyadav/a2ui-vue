<script>
export default { name: 'A2UISelect' };
</script>

<script setup>
import { computed } from 'vue';
import { A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS, useA2UIComponent } from '../useA2UIComponent.js';

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

const { weight, resolve, getUniqueId, setData } = useA2UIComponent(props, emit);

// Extract Select properties
const selectProps = computed(() => props.component?.Select || props.component || {});

const label = computed(() => resolve(selectProps.value.label) || '');
const placeholder = computed(() => resolve(selectProps.value.placeholder) || 'Select an option');
const options = computed(() => selectProps.value.options || []);

// Get the binding path - supports fieldPath, value.path, and binding
const bindingPath = computed(() => {
  if (selectProps.value.fieldPath) return selectProps.value.fieldPath;
  const valueVal = selectProps.value.value;
  if (valueVal?.path) return valueVal.path;
  return selectProps.value.binding || null;
});

const selectedValue = computed(() => {
  if (bindingPath.value) {
    return resolve({ path: bindingPath.value }) || '';
  }
  return resolve(selectProps.value.value) || '';
});

const selectId = getUniqueId('a2ui-select');

const handleChange = (event) => {
  if (!bindingPath.value) return;
  setData(bindingPath.value, event.target.value);
};
</script>

<template>
  <section class="a2ui-select" :style="{ '--weight': weight }">
    <label v-if="label" :for="selectId" class="a2ui-select__label">
      {{ label }}
    </label>
    <select
      class="a2ui-select__input"
      :id="selectId"
      :value="selectedValue"
      @change="handleChange"
    >
      <option v-if="placeholder && !selectedValue" value="" disabled selected>
        {{ placeholder }}
      </option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ resolve(option.label) || option.value }}
      </option>
    </select>
  </section>
</template>

<style scoped>
.a2ui-select {
  display: flex;
  flex-direction: column;
  flex: var(--weight);
  min-height: 0;
  width: 100%;
}

.a2ui-select__label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.a2ui-select__input {
  display: block;
  width: 100%;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
}

.a2ui-select__input:focus {
  border-color: #3b82f6;
  background-color: white;
}
</style>

