<!--
  A2UIText.vue

  Text display component with support for different usage hints.
  Part of the A2UI Standard Catalog (v0.8).

  Supported usage hints:
  - h1: Large heading (2xl, bold, zinc-100)
  - h2: Medium heading (xl, semibold, zinc-200)
  - h3: Small heading (lg, semibold, zinc-200)
  - h4: Extra small heading (base, medium, zinc-200)
  - h5: Tiny heading (sm, medium, zinc-300)
  - body: Default body text (sm, regular, zinc-400)
  - caption: Small uppercase label (xs, semibold, zinc-500)
-->

<script setup>
import { useDataResolver } from "@/composables/useDataResolver";
import { toRef } from "vue";

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
</script>

<template>
  <!-- H1: Large heading -->
  <h1
    v-if="args.usageHint === 'h1'"
    class="text-2xl font-bold text-zinc-100 tracking-tight"
  >
    {{ resolve(args.text) }}
  </h1>

  <!-- H2: Medium heading -->
  <h2
    v-else-if="args.usageHint === 'h2'"
    class="text-xl font-semibold text-zinc-200 tracking-tight"
  >
    {{ resolve(args.text) }}
  </h2>

  <!-- H3: Small heading -->
  <h3
    v-else-if="args.usageHint === 'h3'"
    class="text-lg font-semibold text-zinc-200 tracking-tight"
  >
    {{ resolve(args.text) }}
  </h3>

  <!-- H4: Extra small heading -->
  <h4
    v-else-if="args.usageHint === 'h4'"
    class="text-base font-medium text-zinc-200 tracking-tight"
  >
    {{ resolve(args.text) }}
  </h4>

  <!-- H5: Tiny heading -->
  <h5
    v-else-if="args.usageHint === 'h5'"
    class="text-sm font-medium text-zinc-300 tracking-tight"
  >
    {{ resolve(args.text) }}
  </h5>

  <!-- Caption: Small uppercase label -->
  <div
    v-else-if="args.usageHint === 'caption'"
    class="text-xs font-semibold text-zinc-500 uppercase tracking-widest"
  >
    {{ resolve(args.text) }}
  </div>

  <!-- Body: Default body text -->
  <p v-else class="text-sm text-zinc-400 leading-relaxed">
    {{ resolve(args.text) }}
  </p>
</template>

