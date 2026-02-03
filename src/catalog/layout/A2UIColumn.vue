<!--
  A2UIColumn.vue
  
  Layout component that arranges children vertically.
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
  <div class="flex flex-col gap-4 w-full h-full">
    <A2UISurface 
      v-for="id in args.children.explicitList" 
      :key="id" 
      :componentId="id" 
      :components="components"
      :data="data" 
      @action="$emit('action', $event)" 
    />
  </div>
</template>

