<!--
  A2UIRow.vue

  Horizontal flex container component.
  Part of the A2UI Standard Catalog (v0.8).

  Supports:
  - Distribution (justify-content): start, center, end, spaceBetween, spaceAround, spaceEvenly
  - Alignment (align-items): start, center, end, stretch
  - equalWidth: true/false - Makes all children take equal width (flex: 1)
  - columnWidthMode: "equal" | "auto" | "custom" - How to size columns
  - columnConfig: Array of {width?, align?, border?} - Per-column configuration
  - Explicit list of children

  Table-like behavior:
  - Use columnConfig to define column widths and alignments
  - columnWidthMode="equal" - All columns get equal width (flex: 1)
  - columnWidthMode="auto" - Columns size based on content (flex: 0 0 auto)
  - columnWidthMode="custom" - Use columnConfig widths (e.g., "100px", "20%", "2fr")

  Border support:
  - border: true/false - Add border to entire row
  - borderStyle: "all" | "horizontal" | "vertical" | "none" - Border style
  - borderColor: Tailwind color class (e.g., "zinc-800", "gray-300")
  - columnConfig[].border: "left" | "right" | "both" | "none" - Per-column borders

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
 * Maps text alignment values to Tailwind classes
 */
const textAlignStyles = {
  start: "text-left",
  center: "text-center",
  end: "text-right",
  left: "text-left",
  right: "text-right",
};

/**
 * Computed class name based on distribution and alignment props
 */
const className = computed(() => {
  const distribution = props.args.distribution || "start";
  const alignment = props.args.alignment || "stretch";
  const borderStyle = props.args.borderStyle;
  const borderColor = props.args.borderColor || "zinc-800";
  const backgroundColor = props.args.backgroundColor;
  const textColor = props.args.textColor;

  const classes = [
    "flex",
    "flex-row",
    "w-full",
    distributionStyles[distribution] || "justify-start",
    alignmentStyles[alignment] || "items-stretch",
  ];

  // Add gap only if no borders (borders will handle spacing)
  if (!props.args.border && !borderStyle) {
    classes.push("gap-3");
  }

  // Add border classes
  if (props.args.border || borderStyle) {
    if (borderStyle === "horizontal" || borderStyle === "all") {
      classes.push(`border-b border-${borderColor}`);
    }
    if (borderStyle === "all") {
      classes.push(`border-t border-${borderColor}`);
    }
    if (!borderStyle && props.args.border) {
      classes.push(`border border-${borderColor}`);
    }
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

/**
 * Get column configuration for a specific index
 */
const getColumnConfig = (index) => {
  if (props.args.columnConfig && props.args.columnConfig[index]) {
    return props.args.columnConfig[index];
  }
  return {};
};

/**
 * Check if column wrapper is needed
 * Wrapper is only needed when we have column configuration, borders, or width modes
 */
const needsColumnWrapper = computed(() => {
  return !!(
    props.args.columnWidthMode ||
    props.args.equalWidth ||
    props.args.columnConfig ||
    props.args.border ||
    props.args.borderStyle
  );
});

/**
 * Get column wrapper class and style for a specific index
 */
const getColumnWrapperClassAndStyle = (index) => {
  const columnWidthMode =
    props.args.columnWidthMode || (props.args.equalWidth ? "equal" : null);
  const columnConfig = getColumnConfig(index);
  const borderColor = props.args.borderColor || "zinc-800";
  const borderStyle = props.args.borderStyle;
  const childrenCount = props.args.children?.explicitList?.length || 0;

  const classes = [];
  const styles = {};

  // Handle width based on mode
  if (columnWidthMode === "equal") {
    classes.push("flex-1");
  } else if (columnWidthMode === "auto") {
    classes.push("flex-none");
  } else if (columnWidthMode === "custom" && columnConfig.width) {
    // Custom width from columnConfig
    if (columnConfig.width.endsWith("fr")) {
      // CSS Grid fr units converted to flex
      const frValue = parseFloat(columnConfig.width);
      styles.flex = `${frValue} ${frValue} 0%`;
    } else {
      // Fixed width (px, %, rem, etc.)
      styles.width = columnConfig.width;
      classes.push("flex-none");
    }
  } else if (props.args.equalWidth) {
    // Legacy equalWidth support
    classes.push("flex-1");
  } else {
    classes.push("w-auto");
  }

  // Handle alignment
  if (columnConfig.align) {
    classes.push(textAlignStyles[columnConfig.align] || "text-left");
  }

  // Handle borders
  if (props.args.border || borderStyle) {
    // Add padding for bordered cells
    classes.push("px-3 py-1.5");

    // Per-column border configuration
    if (columnConfig.border === "left" || columnConfig.border === "both") {
      classes.push(`border-l border-${borderColor}`);
    }
    if (columnConfig.border === "right" || columnConfig.border === "both") {
      classes.push(`border-r border-${borderColor}`);
    }

    // Default border behavior based on borderStyle
    if (!columnConfig.border) {
      if (borderStyle === "all" || borderStyle === "vertical") {
        // Add right border to all except last column
        if (index < childrenCount - 1) {
          classes.push(`border-r border-${borderColor}`);
        }
      }
    }
  }

  return { class: classes.join(" "), style: styles };
};
</script>

<template>
  <!-- Render explicit list of children with column wrappers (for tables) -->
  <div
    v-if="args.children?.explicitList && needsColumnWrapper"
    :class="className"
  >
    <div
      v-for="(id, index) in args.children.explicitList"
      :key="id"
      :class="getColumnWrapperClassAndStyle(index).class"
      :style="getColumnWrapperClassAndStyle(index).style"
    >
      <A2UISurface
        :componentId="id"
        :components="components"
        :data="data"
        @action="$emit('action', $event)"
      />
    </div>
  </div>

  <!-- Render explicit list of children directly (for simple rows) -->
  <div v-else-if="args.children?.explicitList" :class="className">
    <A2UISurface
      v-for="id in args.children.explicitList"
      :key="id"
      :componentId="id"
      :components="components"
      :data="data"
      @action="$emit('action', $event)"
    />
  </div>

  <!-- Empty row if no children -->
  <div v-else :class="className" />
</template>

