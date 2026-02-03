<!--
  A2UIIcon.vue
  
  Icon component using Material Icons.
  Part of the A2UI Standard Catalog (v0.8).
-->

<script setup>
defineProps({
  args: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-400 shrink-0">
    <span class="material-icons notranslate text-[18px]">{{ args.name }}</span>
  </div>
</template>

