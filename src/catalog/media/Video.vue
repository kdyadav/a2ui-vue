<script>
export default { name: 'A2UIVideo' };
</script>

<script setup>
import { computed } from 'vue';
import { A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS, useA2UIComponent } from '../useA2UIComponent.js';

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

const { weight, resolve } = useA2UIComponent(props, emit);

// Extract Video properties
const videoProps = computed(() => props.component?.Video || props.component || {});
const url = computed(() => resolve(videoProps.value.url) || '');
</script>

<template>
  <section v-if="url" class="a2ui-video" :style="{ '--weight': weight }">
    <video controls :src="url" />
  </section>
</template>

<style scoped>
.a2ui-video {
  display: block;
  flex: var(--weight);
  min-height: 0;
  overflow: auto;
}

.a2ui-video video {
  display: block;
  width: 100%;
  box-sizing: border-box;
  border-radius: 0.5rem;
}
</style>

