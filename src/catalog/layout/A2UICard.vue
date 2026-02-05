<!--
  A2UICard.vue

  Card container component with styling.
  Part of the A2UI Standard Catalog (v0.8).
-->

<script setup>
import A2UISurface from "@/A2UISurface.vue";

const props = defineProps({
  args: {
    type: Object,
    required: true,
  },
  components: {
    type: Object,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["action"]);
</script>

<template>
  <!-- Empty card if no child -->
  <div
    v-if="!args.child"
    class="bg-[#18181b] border border-zinc-800 rounded-xl shadow-sm"
  />

  <!-- Card with child content -->
  <div
    v-else
    class="bg-[#18181b] border border-zinc-800 rounded-xl shadow-sm hover:border-zinc-700 transition-colors duration-300"
  >
    <div class="p-4">
      <A2UISurface
        :componentId="args.child"
        :components="components"
        :data="data"
        @action="$emit('action', $event)"
      />
    </div>
  </div>
</template>

