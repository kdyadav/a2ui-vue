<script>
export default { name: 'A2UIDateTimeInput' };
</script>

<script setup>
import { computed } from 'vue';
import { A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS, useA2UIComponent } from '../useA2UIComponent.js';

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

const { weight, resolve, getUniqueId, setData } = useA2UIComponent(props, emit);

// Extract DateTimeInput properties
const dtProps = computed(() => props.component?.DateTimeInput || props.component || {});

const enableDate = computed(() => dtProps.value.enableDate ?? true);
const enableTime = computed(() => dtProps.value.enableTime ?? true);

// Determine input type
const inputType = computed(() => {
  if (enableDate.value && enableTime.value) return 'datetime-local';
  if (enableDate.value) return 'date';
  if (enableTime.value) return 'time';
  return 'datetime-local';
});

// Get the binding path
const bindingPath = computed(() => {
  const valueVal = dtProps.value.value;
  if (valueVal?.path) return valueVal.path;
  return dtProps.value.binding || null;
});

const currentValue = computed(() => {
  if (bindingPath.value) {
    return resolve({ path: bindingPath.value }) || '';
  }
  return resolve(dtProps.value.value) || '';
});

const inputId = getUniqueId('a2ui-datetime');

const handleInput = (event) => {
  if (!bindingPath.value) return;
  setData(bindingPath.value, event.target.value);
};
</script>

<template>
  <section class="a2ui-datetime" :style="{ '--weight': weight }">
    <input
      autocomplete="off"
      class="a2ui-datetime__input"
      :id="inputId"
      :type="inputType"
      :value="currentValue"
      @input="handleInput"
    />
  </section>
</template>

<style scoped>
.a2ui-datetime {
  display: flex;
  flex: var(--weight);
  width: 100%;
}

.a2ui-datetime__input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
}

.a2ui-datetime__input:focus {
  outline: none;
  border-color: #3b82f6;
}
</style>

