<script>
export default { name: 'A2UITextField' };
</script>

<script setup>
import { computed } from 'vue';
import { A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS, useA2UIComponent } from '../useA2UIComponent.js';

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

const { weight, resolve, getUniqueId, setData } = useA2UIComponent(props, emit);

// Extract TextField properties
const fieldProps = computed(() =>
  props.component?.TextField || props.component?.TextInput || props.component || {}
);

const label = computed(() => resolve(fieldProps.value.label) || '');
const placeholder = computed(() => resolve(fieldProps.value.placeholder) || 'Please enter a value');

// Map A2UI spec textFieldType to HTML input types
// Spec types: date, longText, number, shortText, obscured
const textFieldType = computed(() => fieldProps.value.textFieldType || fieldProps.value.type || 'shortText');
const inputType = computed(() => {
  switch (textFieldType.value) {
    case 'date': return 'date';
    case 'number': return 'number';
    case 'obscured': return 'password';
    case 'longText': return 'text'; // Will use textarea
    case 'shortText':
    default: return 'text';
  }
});
const isLongText = computed(() => textFieldType.value === 'longText');

// Get the binding path (supports both 'text' and 'binding' properties)
const bindingPath = computed(() => {
  const textVal = fieldProps.value.text;
  if (textVal?.path) return textVal.path;
  return fieldProps.value.binding || null;
});

const inputValue = computed(() => {
  if (bindingPath.value) {
    return resolve({ path: bindingPath.value }) || '';
  }
  return resolve(fieldProps.value.text) || '';
});

const inputId = getUniqueId('a2ui-textfield');

const handleInput = (event) => {
  if (!bindingPath.value) return;
  setData(bindingPath.value, event.target.value);
};
</script>

<template>
  <section class="a2ui-textfield" :class="{ 'a2ui-textfield--long': isLongText }" :style="{ '--weight': weight }">
    <label v-if="label" :for="inputId" class="a2ui-textfield__label">
      {{ label }}
    </label>
    <!-- Use textarea for longText type -->
    <textarea v-if="isLongText" autocomplete="off" class="a2ui-textfield__input a2ui-textfield__textarea" :id="inputId"
      :value="inputValue" :placeholder="placeholder" @input="handleInput" rows="4" />
    <!-- Use input for other types -->
    <input v-else autocomplete="off" class="a2ui-textfield__input" :id="inputId" :type="inputType" :value="inputValue"
      :placeholder="placeholder" @input="handleInput" />
  </section>
</template>

<style scoped>
.a2ui-textfield {
  display: flex;
  flex-direction: column;
  flex: var(--weight);
  width: 100%;
}

.a2ui-textfield__label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.a2ui-textfield__input {
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
}

.a2ui-textfield__input:focus {
  border-color: #3b82f6;
  background: white;
}

.a2ui-textfield__input::placeholder {
  color: #9ca3af;
}

.a2ui-textfield__textarea {
  resize: vertical;
  min-height: 6rem;
  font-family: inherit;
  line-height: 1.5;
}

.a2ui-textfield--long {
  flex: 1;
}
</style>
