<!--
  A2UICard.vue
  
  Container component with card styling.
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
  <div class="bg-[#18181b] border border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col h-full relative overflow-hidden group hover:border-zinc-700 transition-colors duration-300">
    <div class="relative z-10 flex flex-col h-full">
      <A2UISurface 
        :componentId="args.child" 
        :components="components" 
        :data="data"
        @action="$emit('action', $event)" 
      />
    </div>
  </div>
</template>

