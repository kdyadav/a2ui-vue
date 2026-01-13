<script>
export default { name: 'A2UIText' };
</script>

<script setup>
import { computed } from 'vue';
import { A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS, useA2UIComponent } from '../useA2UIComponent.js';

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

const { weight, resolve } = useA2UIComponent(props, emit);

// Extract Text properties
const textProps = computed(() => props.component?.Text || props.component || {});
const usageHint = computed(() => textProps.value.usageHint || 'body');
const text = computed(() => resolve(textProps.value.text) || '');

// Determine which HTML tag to use based on usageHint
const tag = computed(() => {
  switch (usageHint.value) {
    case 'h1': return 'h1';
    case 'h2': return 'h2';
    case 'h3': return 'h3';
    case 'h4': return 'h4';
    case 'h5': return 'h5';
    case 'h6': return 'h6';
    case 'caption': return 'span';
    default: return 'p';
  }
});

const classes = computed(() => ({
  'a2ui-text': true,
  [`a2ui-text--${usageHint.value}`]: true
}));

// Simple markdown rendering (bold, italic)
const renderedText = computed(() => {
  let result = String(text.value);
  // Bold: **text**
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic: *text*
  result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Line breaks
  result = result.replace(/\n/g, '<br>');
  return result;
});
</script>

<template>
  <component :is="tag" :class="classes" :style="{ '--weight': weight }" v-html="renderedText" />
</template>

<style scoped>
.a2ui-text {
  display: block;
  flex: var(--weight);
  margin: 0;
}

.a2ui-text--h1 {
  font-size: 1.25rem;
  font-weight: 500;
  color: #111827;
  letter-spacing: -0.025em;
}

.a2ui-text--h2 {
  font-size: 1.125rem;
  font-weight: 500;
  color: #1f2937;
}

.a2ui-text--h3 {
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
}

.a2ui-text--h4, .a2ui-text--h5, .a2ui-text--h6 {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

.a2ui-text--caption {
  font-size: 0.6875rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.a2ui-text--body {
  font-size: 0.9375rem;
  color: #374151;
  line-height: 1.6;
}
</style>

