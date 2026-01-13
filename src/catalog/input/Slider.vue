<script>
export default { name: 'A2UISlider' };
</script>

<script setup>
import { computed } from 'vue';
import { A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS, useA2UIComponent } from '../useA2UIComponent.js';

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

const { weight, resolve, getUniqueId, setData } = useA2UIComponent(props, emit);

// Extract Slider properties
const sliderProps = computed(() => props.component?.Slider || props.component || {});

const label = computed(() => resolve(sliderProps.value.label) || '');
const minValue = computed(() => sliderProps.value.minValue ?? 0);
const maxValue = computed(() => sliderProps.value.maxValue ?? 100);

// Get the binding path
const bindingPath = computed(() => {
  const valueVal = sliderProps.value.value;
  if (valueVal?.path) return valueVal.path;
  return sliderProps.value.binding || null;
});

const currentValue = computed(() => {
  if (bindingPath.value) {
    return resolve({ path: bindingPath.value }) ?? 0;
  }
  return resolve(sliderProps.value.value) ?? 0;
});

const inputId = getUniqueId('a2ui-slider');

const handleInput = (event) => {
  if (!bindingPath.value) return;
  setData(bindingPath.value, event.target.valueAsNumber);
};
</script>

<template>
  <section class="a2ui-slider" :style="{ '--weight': weight }">
    <label v-if="label" :for="inputId" class="a2ui-slider__label">
      {{ label }}
    </label>
    <input
      type="range"
      autocomplete="off"
      class="a2ui-slider__input"
      :id="inputId"
      :value="currentValue"
      :min="minValue"
      :max="maxValue"
      @input="handleInput"
    />
  </section>
</template>

<style scoped>
.a2ui-slider {
  display: flex;
  flex-direction: column;
  flex: var(--weight);
  width: 100%;
}

.a2ui-slider__label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.a2ui-slider__input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  accent-color: #2563eb;
  cursor: pointer;
}
</style>

