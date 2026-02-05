<!--
  A2UIColumn.vue

  Vertical flex container component.
  Part of the A2UI Standard Catalog (v0.8).

  Supports:
  - Distribution (justify-content): start, center, end, spaceBetween, spaceAround, spaceEvenly
  - Alignment (align-items): start, center, end, stretch
  - Explicit list of children
  - Template-based children (future support)

  Gap support:
  - gap: Default is "4" (1rem) between children
  - gap: 0 or gap: false - Disable gap (for tables)
  - gap: true - Use default gap of "4"
  - gap: "2", "6", "8" - Custom gap values

  Border support:
  - border: true/false - Add border to entire column
  - borderStyle: "all" | "horizontal" | "none" - Border style for rows
  - borderColor: Tailwind color class (e.g., "zinc-800", "gray-300")

  Styling support:
  - backgroundColor: Tailwind background color class (e.g., "zinc-900", "blue-500", "gray-100")
  - textColor: Tailwind text color class (e.g., "white", "zinc-100", "gray-900")
-->

<script setup>
import { computed } from "vue";
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

/**
 * Maps distribution values to Tailwind justify-content classes
 */
const distributionStyles = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  spaceBetween: "justify-between",
  spaceAround: "justify-around",
  spaceEvenly: "justify-evenly",
};

/**
 * Maps alignment values to Tailwind align-items classes
 */
const alignmentStyles = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

/**
 * Computed class name based on distribution and alignment props
 */
const className = computed(() => {
  const distribution = props.args.distribution || "start";
  const alignment = props.args.alignment || "stretch";
  const borderColor = props.args.borderColor || "zinc-800";
  const backgroundColor = props.args.backgroundColor;
  const textColor = props.args.textColor;

  const classes = [
    "flex",
    "flex-col",
    distributionStyles[distribution] || "justify-start",
    alignmentStyles[alignment] || "items-stretch",
  ];

  // Handle gap: default is "4", can be disabled with gap: 0 or gap: false
  if (
    props.args.gap === 0 ||
    props.args.gap === "0" ||
    props.args.gap === false
  ) {
    // No gap for tables
  } else if (props.args.gap) {
    // Custom gap value
    const gapValue = props.args.gap === true ? "4" : props.args.gap;
    classes.push(`gap-${gapValue}`);
  } else {
    // Default gap
    classes.push("gap-4");
  }

  // Add border classes
  if (props.args.border) {
    classes.push(`border border-${borderColor}`);
  }

  // Add background color
  if (backgroundColor) {
    classes.push(`bg-${backgroundColor}`);
  }

  // Add text color
  if (textColor) {
    classes.push(`text-${textColor}`);
  }

  return classes.join(" ");
});
</script>

<template>
  <!-- Render explicit list of children -->
  <div v-if="args.children?.explicitList" :class="className">
    <A2UISurface
      v-for="id in args.children.explicitList"
      :key="id"
      :componentId="id"
      :components="components"
      :data="data"
      @action="$emit('action', $event)"
    />
  </div>

  <!-- Empty column if no children -->
  <div v-else :class="className" />
</template>

