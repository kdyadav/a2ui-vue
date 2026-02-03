<!--
  A2UIError.vue
  
  Error component displayed when a component type is not found
  or when component resolution fails.
-->

<script setup>
defineProps({
  componentId: String,
  args: Object
});
</script>

<template>
  <div class="text-[10px] text-rose-400 border border-rose-500/20 bg-rose-500/5 p-2 rounded">
    ERR: {{ componentId }}
  </div>
</template>

