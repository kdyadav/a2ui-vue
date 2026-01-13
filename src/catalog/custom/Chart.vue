<script>
export default { name: 'A2UIChart' };
</script>

<script setup>
import { computed } from 'vue';
import { A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS, useA2UIComponent } from '../useA2UIComponent.js';

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

const { weight, resolve } = useA2UIComponent(props, emit);

// Extract Chart properties
const chartProps = computed(() => props.component?.Chart || props.component || {});
const chartType = computed(() => chartProps.value.type || 'bar');
const title = computed(() => resolve(chartProps.value.title) || '');
const dataPath = computed(() => chartProps.value.data?.path || null);

// Get chart data from data context
const chartData = computed(() => {
  if (dataPath.value) {
    return resolve({ path: dataPath.value }) || [];
  }
  return chartProps.value.data || [];
});

// Simple bar chart rendering
const maxValue = computed(() => {
  if (!Array.isArray(chartData.value)) return 100;
  return Math.max(...chartData.value.map(d => d.value || 0), 1);
});
</script>

<template>
  <section class="a2ui-chart" :style="{ '--weight': weight }">
    <h4 v-if="title" class="a2ui-chart__title">{{ title }}</h4>
    
    <!-- Simple bar chart -->
    <div v-if="chartType === 'bar'" class="a2ui-chart__bars">
      <div
        v-for="(item, index) in chartData"
        :key="index"
        class="a2ui-chart__bar-item"
      >
        <span class="a2ui-chart__bar-label">{{ item.label }}</span>
        <div class="a2ui-chart__bar-track">
          <div
            class="a2ui-chart__bar-fill"
            :style="{ width: `${(item.value / maxValue) * 100}%` }"
          />
        </div>
        <span class="a2ui-chart__bar-value">{{ item.value }}</span>
      </div>
    </div>

    <!-- Placeholder for other chart types -->
    <div v-else class="a2ui-chart__placeholder">
      Chart type "{{ chartType }}" - integrate with your preferred charting library
    </div>
  </section>
</template>

<style scoped>
.a2ui-chart {
  display: flex;
  flex-direction: column;
  flex: var(--weight);
  gap: 0.75rem;
}

.a2ui-chart__title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.a2ui-chart__bars {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.a2ui-chart__bar-item {
  display: grid;
  grid-template-columns: 80px 1fr 40px;
  align-items: center;
  gap: 0.5rem;
}

.a2ui-chart__bar-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
}

.a2ui-chart__bar-track {
  height: 0.5rem;
  background: #f3f4f6;
  border-radius: 9999px;
  overflow: hidden;
}

.a2ui-chart__bar-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.a2ui-chart__bar-value {
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
}

.a2ui-chart__placeholder {
  padding: 2rem;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 0.5rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}
</style>

