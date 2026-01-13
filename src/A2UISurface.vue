<script>
export default { name: 'A2UISurface' }
</script>

<script setup>
/**
 * A2UISurface - Main entry point for rendering A2UI surfaces
 *
 * This component serves as the top-level container for A2UI rendering.
 * It delegates to the catalog-based A2UIRenderer for actual component rendering.
 *
 * Inspired by Angular's A2UI implementation pattern.
 */
import { provide, reactive } from 'vue';
import A2UIRenderer from './catalog/A2UIRenderer.vue';
import { A2UI_PROCESSOR_KEY, A2UI_THEME_KEY, resolveDataPath } from './catalog/useA2UIComponent.js';

const props = defineProps({
    componentId: { type: String, required: true },
    components: { type: Object, required: true },
    data: { type: Object, default: () => ({}) },
    surfaceId: { type: String, required: true },
    theme: { type: Object, default: null }
});

const emit = defineEmits(['action', 'dataUpdate']);

// Create a processor object for child components to use
const processor = reactive({
    /**
     * Handle action events from components
     */
    handleAction(action) {
        emit('action', action);
    },

    /**
     * Handle data updates (two-way binding)
     */
    handleDataUpdate(update) {
        emit('dataUpdate', update);
    },

    /**
     * Resolve a data path
     */
    resolveData(path) {
        return resolveDataPath(path, props.data);
    }
});

// Provide processor and theme to all child components
provide(A2UI_PROCESSOR_KEY, processor);
provide(A2UI_THEME_KEY, props.theme);

// Forward events from renderer
const handleAction = (event) => emit('action', event);
const handleDataUpdate = (event) => emit('dataUpdate', event);
</script>

<template>
    <section class="a2ui-surface">
        <A2UIRenderer :componentId="componentId" :components="components" :data="data" :surfaceId="surfaceId"
            @action="handleAction" @dataUpdate="handleDataUpdate" />
    </section>
</template>

<style scoped>
.a2ui-surface {
    width: 100%;
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>