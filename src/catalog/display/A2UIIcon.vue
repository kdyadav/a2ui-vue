<!--
  A2UIIcon.vue

  Icon component using Material Icons.
  Part of the A2UI Standard Catalog (v0.8).

  Supports:
  - Literal icon name: { "name": "battery" }
  - Path-based icon name: { "name": { "path": "/$item/icon" } }
-->

<script setup>
import { useDataResolver } from "@/composables/useDataResolver";
import { toRef, computed } from "vue";

const props = defineProps({
  args: {
    type: Object,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
});

const dataRef = toRef(props, "data");
const { resolve } = useDataResolver(dataRef);

// Resolve icon name - supports both literal strings and path-based values
const iconName = computed(() => {
  if (typeof props.args.name === "string") {
    // Direct string value
    return props.args.name;
  } else if (typeof props.args.name === "object") {
    // Path-based value
    return resolve(props.args.name);
  }
  return "help_outline"; // Fallback icon
});
</script>

<template>
  <div
    class="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-400 shrink-0"
  >
    <span class="material-icons notranslate text-[18px]">{{ iconName }}</span>
  </div>
</template>

