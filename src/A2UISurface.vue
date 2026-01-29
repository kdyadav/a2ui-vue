<script>
export default { name: 'A2UISurface' }
</script>

<script setup>
import { computed } from 'vue';
import { getComponent } from '@/components/a2ui';

const props = defineProps(['componentId', 'components', 'data']);
const emit = defineEmits(['action']);

// --- COMPONENT RESOLVER ---
const compDef = computed(() => props.components[props.componentId]);
const type = computed(() => compDef.value ? Object.keys(compDef.value)[0] : null);
const args = computed(() => compDef.value ? compDef.value[type.value] : {});

// --- DYNAMIC COMPONENT RESOLUTION ---
// Get the component from the catalog based on type
const componentToRender = computed(() => {
    return getComponent(type.value);
});
</script>

<template>
    <!-- Dynamic component rendering using the catalog -->
    <component :is="componentToRender" :componentId="componentId" :args="args" :data="data" :components="components"
        @action="$emit('action', $event)" />
</template>