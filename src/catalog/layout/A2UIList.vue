<!--
  A2UIList.vue

  Comprehensive list component for displaying collections of data.
  Supports both static (explicitList) and dynamic (dataBinding) data sources.
  Part of the A2UI Standard Catalog (v0.8).

  Features:
  - Direction: "vertical" | "horizontal" (default: "vertical")
  - Explicit list of component IDs
  - Data binding with path-based data access
  - Item templates for data-driven rendering
  - Weight/flex support for layout
  - Gap control between items
  - Background and text color support
  - Padding support
  - Custom item width for horizontal lists
  - Empty state handling
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

// ============================================================================
// CONFIGURATION
// ============================================================================

const direction = computed(() => props.args.direction || "vertical");
const gap = computed(() => (props.args.gap !== undefined ? props.args.gap : 3));
const itemTemplate = computed(() => props.args.itemTemplate);

// ============================================================================
// DATA HANDLING
// ============================================================================

const listData = computed(() => {
  // Case 1: Explicit list of component IDs
  if (props.args.children?.explicitList) {
    return {
      type: "explicit",
      items: props.args.children.explicitList,
    };
  }

  // Case 2: Data binding - path to array in data model
  if (props.args.children?.dataBinding) {
    const path = props.args.children.dataBinding;
    const value = getValueAtPath(props.data, path);

    if (Array.isArray(value)) {
      return {
        type: "dataBinding",
        items: value,
      };
    }

    console.warn(
      `A2UIList: dataBinding path "${path}" did not resolve to an array`
    );
    return { type: "empty", items: [] };
  }

  // Case 3: Direct items array (convenience)
  if (props.args.items && Array.isArray(props.args.items)) {
    return {
      type: "direct",
      items: props.args.items,
    };
  }

  return { type: "empty", items: [] };
});

// ============================================================================
// STYLING
// ============================================================================

const containerClasses = computed(() => {
  const classes = ["block", "min-h-0"];

  // Flex weight for layout
  if (props.args.weight) {
    classes.push(`flex-[${props.args.weight}]`);
  }

  // Background and text colors
  if (props.args.backgroundColor) {
    classes.push(`bg-${props.args.backgroundColor}`);
  }
  if (props.args.textColor) {
    classes.push(`text-${props.args.textColor}`);
  }

  // Padding
  if (props.args.padding !== undefined) {
    classes.push(`p-${props.args.padding}`);
  }

  return classes.join(" ");
});

const listClasses = computed(() => {
  const classes = [];

  if (direction.value === "horizontal") {
    // Horizontal scrolling list
    classes.push(
      "flex",
      "max-w-full",
      "overflow-x-auto",
      "overflow-y-hidden",
      "scrollbar-thin",
      "scrollbar-thumb-zinc-700",
      "scrollbar-track-transparent"
    );
  } else {
    // Vertical stacked list
    classes.push("flex", "flex-col");
  }

  // Gap between items
  if (gap.value > 0) {
    classes.push(`gap-${gap.value}`);
  }

  return classes.join(" ");
});

const itemClasses = computed(() => {
  const classes = [];

  if (direction.value === "horizontal") {
    // Horizontal items: flexible width with constraints
    classes.push("flex-shrink-0");

    if (props.args.itemWidth) {
      classes.push(`w-${props.args.itemWidth}`);
    } else {
      classes.push("w-auto", "max-w-[min(80%,400px)]");
    }
  } else {
    // Vertical items: full width with padding
    classes.push("w-full");

    // Add padding for vertical items (can be overridden by itemPadding)
    const itemPadding =
      props.args.itemPadding !== undefined ? props.args.itemPadding : 4;
    if (itemPadding > 0) {
      classes.push(`py-${itemPadding}`);
    }
  }

  return classes.join(" ");
});

// ============================================================================
// UTILITIES
// ============================================================================

function getValueAtPath(data, path) {
  if (!path || !data) return undefined;

  // Remove leading slash and split by /
  const keys = path.replace(/^\//, "").split("/");
  let value = data;

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }

  return value;
}

function getItemKey(item, index) {
  // Try to use a unique identifier if available
  if (typeof item === "object" && item !== null) {
    return item.id || item.key || index;
  }
  return index;
}
</script>

<template>
  <!-- Explicit List: Render component IDs -->
  <div
    v-if="listData.type === 'explicit'"
    :class="containerClasses"
    :data-list-type="listData.type"
  >
    <div :class="listClasses">
      <div
        v-for="componentId in listData.items"
        :key="componentId"
        :class="itemClasses"
      >
        <A2UISurface
          :componentId="componentId"
          :components="components"
          :data="data"
          @action="$emit('action', $event)"
        />
      </div>
    </div>
  </div>

  <!-- Data Binding: Render items from data model -->
  <div
    v-else-if="listData.type === 'dataBinding'"
    :class="containerClasses"
    :data-list-type="listData.type"
  >
    <div :class="listClasses">
      <div
        v-for="(item, index) in listData.items"
        :key="getItemKey(item, index)"
        :class="itemClasses"
        :data-index="index"
      >
        <!-- Render with item template if provided -->
        <A2UISurface
          v-if="itemTemplate"
          :componentId="itemTemplate"
          :components="components"
          :data="{ ...data, $item: item, $index: index }"
          @action="$emit('action', $event)"
        />

        <!-- Fallback: render item as JSON -->
        <div
          v-else
          class="p-3 bg-zinc-800 rounded text-zinc-300 text-sm font-mono"
        >
          <div class="text-zinc-500 text-xs mb-1">Item {{ index }}</div>
          <pre class="whitespace-pre-wrap break-words">{{
            JSON.stringify(item, null, 2)
          }}</pre>
        </div>
      </div>
    </div>
  </div>

  <!-- Direct Items: Render items array -->
  <div
    v-else-if="listData.type === 'direct'"
    :class="containerClasses"
    :data-list-type="listData.type"
  >
    <div :class="listClasses">
      <div
        v-for="(item, index) in listData.items"
        :key="getItemKey(item, index)"
        :class="itemClasses"
        :data-index="index"
      >
        <A2UISurface
          v-if="itemTemplate"
          :componentId="itemTemplate"
          :components="components"
          :data="{ ...data, $item: item, $index: index }"
          @action="$emit('action', $event)"
        />

        <div v-else class="p-3 bg-zinc-800 rounded text-zinc-300 text-sm">
          {{ typeof item === "object" ? JSON.stringify(item) : item }}
        </div>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div v-else :class="containerClasses" :data-list-type="listData.type">
    <div
      class="flex items-center justify-center p-8 text-zinc-500 text-sm italic"
    >
      <span>No items to display</span>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar styling */
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}

.scrollbar-thumb-zinc-700::-webkit-scrollbar-thumb {
  background-color: rgb(63 63 70);
  border-radius: 3px;
}

.scrollbar-thumb-zinc-700::-webkit-scrollbar-thumb:hover {
  background-color: rgb(82 82 91);
}

.scrollbar-track-transparent::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>