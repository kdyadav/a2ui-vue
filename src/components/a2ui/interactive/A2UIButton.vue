<!--
  A2UIButton.vue
  
  Interactive button component with action handling.
  Part of the A2UI Standard Catalog (v0.8).
-->

<script setup>
import A2UISurface from '@/A2UISurface.vue';

const props = defineProps({
  args: {
    type: Object,
    required: true
  },
  components: {
    type: Object,
    required: true
  },
  data: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['action']);
</script>

<template>
  <button 
    @click="$emit('action', args.action)"
    class="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-semibold py-2.5 px-4 rounded-lg transition-all flex justify-center items-center mt-auto border border-zinc-700 uppercase tracking-wide cursor-pointer hover:border-zinc-500"
  >
    <A2UISurface 
      :componentId="args.child" 
      :components="components" 
      :data="data" 
    />
  </button>
</template>

