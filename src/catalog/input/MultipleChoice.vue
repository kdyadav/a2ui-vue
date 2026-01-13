<script>
export default { name: 'A2UIMultipleChoice' };
</script>

<script setup>
import { computed } from 'vue';
import { A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS, useA2UIComponent } from '../useA2UIComponent.js';

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

const { weight, resolve, getUniqueId, setData } = useA2UIComponent(props, emit);

// Extract MultipleChoice properties
const mcProps = computed(() => props.component?.MultipleChoice || props.component || {});

const options = computed(() => mcProps.value.options || []);
const description = computed(() => mcProps.value.description || 'Select an item');

// Get the binding path for selections
const bindingPath = computed(() => {
  const selectionsVal = mcProps.value.selections;
  if (selectionsVal?.path) return selectionsVal.path;
  return mcProps.value.binding || null;
});

const selectedValue = computed(() => {
  if (bindingPath.value) {
    return resolve({ path: bindingPath.value }) || '';
  }
  return resolve(mcProps.value.selections) || '';
});

const selectId = getUniqueId('a2ui-multiplechoice');

const handleChange = (event) => {
  if (!bindingPath.value || !event.target.value) return;
  setData(bindingPath.value, event.target.value);
};
</script>

<template>
  <section class="a2ui-multiplechoice" :style="{ '--weight': weight }">
    <label :for="selectId" class="a2ui-multiplechoice__label">
      {{ description }}
    </label>
    <select
      class="a2ui-multiplechoice__select"
      :id="selectId"
      :value="selectedValue"
      @change="handleChange"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ resolve(option.label) || option.value }}
      </option>
    </select>
  </section>
</template>

<style scoped>
.a2ui-multiplechoice {
  display: flex;
  flex-direction: column;
  flex: var(--weight);
  min-height: 0;
  width: 100%;
}

.a2ui-multiplechoice__label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.a2ui-multiplechoice__select {
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

.a2ui-multiplechoice__select:focus {
  outline: none;
  border-color: #3b82f6;
}
</style>

