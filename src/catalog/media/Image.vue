<script>
export default { name: 'A2UIImage' };
</script>

<script setup>
import { computed } from 'vue';
import { A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS, useA2UIComponent } from '../useA2UIComponent.js';

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

const { weight, resolve } = useA2UIComponent(props, emit);

// Extract Image properties
const imageProps = computed(() => props.component?.Image || props.component || {});
const url = computed(() => resolve(imageProps.value.url) || '');
const usageHint = computed(() => imageProps.value.usageHint || 'default');
const alt = computed(() => resolve(imageProps.value.alt) || 'Image');

const classes = computed(() => ({
  'a2ui-image': true,
  [`a2ui-image--${usageHint.value}`]: true
}));
</script>

<template>
  <section v-if="url" :class="classes" :style="{ '--weight': weight }">
    <img :src="url" :alt="alt" />
  </section>
</template>

<style scoped>
.a2ui-image {
  display: block;
  flex: var(--weight);
  min-height: 0;
  overflow: auto;
}

.a2ui-image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  box-sizing: border-box;
}

/* Usage hint variants */
.a2ui-image--thumbnail img {
  width: 4rem;
  height: 4rem;
  border-radius: 0.5rem;
}

.a2ui-image--avatar img {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
}

.a2ui-image--banner img {
  width: 100%;
  height: auto;
  max-height: 200px;
  border-radius: 0.75rem;
}
</style>

