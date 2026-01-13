<script>
export default { name: 'A2UIAudio' };
</script>

<script setup>
import { computed } from 'vue';
import { A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS, useA2UIComponent } from '../useA2UIComponent.js';

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

const { weight, resolve } = useA2UIComponent(props, emit);

// Extract Audio properties
const audioProps = computed(() => props.component?.AudioPlayer || props.component || {});
const url = computed(() => resolve(audioProps.value.url) || '');
</script>

<template>
  <section v-if="url" class="a2ui-audio" :style="{ '--weight': weight }">
    <audio controls :src="url" />
  </section>
</template>

<style scoped>
.a2ui-audio {
  display: block;
  flex: var(--weight);
  min-height: 0;
  overflow: auto;
}

.a2ui-audio audio {
  display: block;
  width: 100%;
  box-sizing: border-box;
}
</style>

