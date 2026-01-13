<script setup>
/**
 * Example Viewer - Navigate between different A2UI examples
 */
import { ref, shallowRef, watch, onMounted } from 'vue';
import { examples } from './index.js';

const currentExample = ref('showcase');
const ExampleComponent = shallowRef(null);

const loadExample = async (id) => {
  const example = examples.find(e => e.id === id);
  if (example) {
    const mod = await example.component();
    ExampleComponent.value = mod.default;
    currentExample.value = id;
  }
};

// Load initial example
onMounted(() => loadExample('showcase'));

watch(currentExample, (id) => loadExample(id));
</script>

<template>
  <div class="example-viewer">
    <nav class="example-nav">
      <h1>A2UI Vue Examples</h1>
      <div class="example-tabs">
        <button
          v-for="example in examples"
          :key="example.id"
          :class="['example-tab', { active: currentExample === example.id }]"
          @click="currentExample = example.id"
        >
          <span class="tab-name">{{ example.name }}</span>
          <span class="tab-desc">{{ example.description }}</span>
        </button>
      </div>
    </nav>
    
    <main class="example-content">
      <component v-if="ExampleComponent" :is="ExampleComponent" />
      <div v-else class="loading">Loading example...</div>
    </main>
  </div>
</template>

<style scoped>
.example-viewer {
  min-height: 100vh;
  background: #f0f4f9;
}

.example-nav {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.example-nav h1 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
}

.example-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.example-tab {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.example-tab:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.example-tab.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.tab-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
}

.example-tab.active .tab-name {
  color: #1d4ed8;
}

.tab-desc {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.example-content {
  padding: 0;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: #6b7280;
}
</style>

