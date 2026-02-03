<!--
  A2UIText.vue
  
  Text display component with support for different usage hints (h1, caption, body).
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
  <!-- Heading variant -->
  <h2 
    v-if="args.usageHint === 'h1'" 
    class="text-base font-medium text-zinc-200 tracking-tight"
  >
    {{ resolve(args.text) }}
  </h2>

  <!-- Caption variant -->
  <div 
    v-else-if="args.usageHint === 'caption'" 
    class="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1"
  >
    {{ resolve(args.text) }}
  </div>

  <!-- Default body text -->
  <p 
    v-else 
    class="text-zinc-400 text-sm leading-relaxed"
  >
    {{ resolve(args.text) }}
  </p>
</template>

