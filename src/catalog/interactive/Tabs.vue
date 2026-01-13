<script>
export default { name: 'A2UITabs' };
</script>

<script setup>
import { computed, ref, defineAsyncComponent } from 'vue';
import { A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS, useA2UIComponent } from '../useA2UIComponent.js';

// Lazy import to avoid circular dependency
const A2UIRenderer = defineAsyncComponent(() => import('../A2UIRenderer.vue'));

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

const { weight, resolve } = useA2UIComponent(props, emit);

// Extract Tabs properties
const tabsProps = computed(() => props.component?.Tabs || props.component || {});
const tabs = computed(() => tabsProps.value.tabItems || tabsProps.value.options || []);

const selectedIndex = ref(0);

const getTabTitle = (tab) => {
  if (typeof tab === 'string') return tab;
  return resolve(tab.title) || `Tab ${tabs.value.indexOf(tab) + 1}`;
};

const getTabChild = (tab) => {
  if (typeof tab === 'object' && tab.child) return tab.child;
  // Fallback to child if it's legacy format
  if (tabsProps.value.child) return tabsProps.value.child;
  return null;
};

const currentChild = computed(() => {
  const tab = tabs.value[selectedIndex.value];
  return getTabChild(tab);
});
</script>

<template>
  <section class="a2ui-tabs" :style="{ '--weight': weight }">
    <div class="a2ui-tabs__controls">
      <button v-for="(tab, index) in tabs" :key="index" class="a2ui-tabs__button"
        :class="{ 'a2ui-tabs__button--selected': selectedIndex === index }" :disabled="selectedIndex === index"
        @click="selectedIndex = index">
        {{ getTabTitle(tab) }}
      </button>
    </div>
    <div class="a2ui-tabs__content">
      <A2UIRenderer v-if="currentChild" :componentId="currentChild" :components="components" :data="data"
        :surfaceId="surfaceId" @action="emit('action', $event)" @dataUpdate="emit('dataUpdate', $event)" />
    </div>
  </section>
</template>

<style scoped>
.a2ui-tabs {
  display: flex;
  flex-direction: column;
  flex: var(--weight);
  width: 100%;
}

.a2ui-tabs__controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 0.25rem;
}

.a2ui-tabs__button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.5rem 0.5rem 0 0;
  position: relative;
  top: 1px;
  transition: all 0.2s ease;
}

.a2ui-tabs__button:hover:not(:disabled) {
  background: #f9fafb;
}

.a2ui-tabs__button--selected {
  color: #2563eb;
  border-bottom: 2px solid #2563eb;
}

.a2ui-tabs__button:disabled {
  cursor: default;
}

.a2ui-tabs__content {
  flex: 1;
}
</style>
