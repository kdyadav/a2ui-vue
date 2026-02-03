<!--
  A2UIProgressBar.vue
  
  Progress bar visualization component.
  Part of the A2UI Standard Catalog (v0.8).
-->

<script setup>
import { useDataResolver } from '@/composables/useDataResolver';
import { toRef, computed } from 'vue';

const props = defineProps({
  args: {
    type: Object,
    required: true
  },
  data: {
    type: Object,
    required: true
  }
});

const dataRef = toRef(props, 'data');
const { resolve } = useDataResolver(dataRef);

// Ensure progress value is between 0 and 100
const progressValue = computed(() => {
  const value = resolve(props.args.value) || 0;
  return Math.min(100, Math.max(0, value));
});
</script>

<template>
  <div class="w-full mt-3">
    <div class="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
      <div 
        class="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] transition-all duration-700 ease-out"
        :style="{ width: `${progressValue}%` }"
      />
    </div>
  </div>
</template>

