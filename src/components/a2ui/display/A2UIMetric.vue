<!--
  A2UIMetric.vue
  
  Metric display component with optional trend indicator.
  Part of the A2UI Standard Catalog (v0.8).
-->

<script setup>
import { useDataResolver } from '@/composables/useDataResolver';
import { toRef } from 'vue';

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
</script>

<template>
  <div class="flex-1 min-w-[120px] bg-zinc-800/30 rounded-lg p-3 border border-zinc-800/50">
    <div class="flex justify-between items-start">
      <div class="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
        {{ args.label }}
      </div>
      <span 
        v-if="args.trend" 
        class="material-icons text-[14px]"
        :class="args.trend === 'up' ? 'text-emerald-500/80' : 'text-rose-500/80'"
      >
        {{ args.trend === 'up' ? 'north_east' : 'south_east' }}
      </span>
    </div>
    <div class="text-xl font-mono text-zinc-300 mt-1 tracking-tight">
      {{ resolve(args.value) || '--' }}
    </div>
  </div>
</template>

