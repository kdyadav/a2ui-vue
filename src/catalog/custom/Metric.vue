<script>
export default { name: 'A2UIMetric' };
</script>

<script setup>
import { computed } from 'vue';
import { A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS, useA2UIComponent } from '../useA2UIComponent.js';

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

const { weight, resolve } = useA2UIComponent(props, emit);

// Extract Metric properties
const metricProps = computed(() => props.component?.Metric || props.component || {});
const label = computed(() => resolve(metricProps.value.label) || '');
const value = computed(() => resolve(metricProps.value.value) || '');
const unit = computed(() => resolve(metricProps.value.unit) || '');
const trend = computed(() => metricProps.value.trend || null);
</script>

<template>
  <section class="a2ui-metric" :style="{ '--weight': weight }">
    <span class="a2ui-metric__label">{{ label }}</span>
    <span class="a2ui-metric__value">
      {{ value }}
      <span v-if="unit" class="a2ui-metric__unit">{{ unit }}</span>
    </span>
    <span v-if="trend" class="a2ui-metric__trend" :class="{ 'a2ui-metric__trend--up': trend > 0, 'a2ui-metric__trend--down': trend < 0 }">
      {{ trend > 0 ? '+' : '' }}{{ trend }}%
    </span>
  </section>
</template>

<style scoped>
.a2ui-metric {
  display: flex;
  flex-direction: column;
  flex: var(--weight);
  gap: 0.25rem;
}

.a2ui-metric__label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.a2ui-metric__value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.a2ui-metric__unit {
  font-size: 0.875rem;
  font-weight: 400;
  color: #6b7280;
}

.a2ui-metric__trend {
  font-size: 0.75rem;
  font-weight: 500;
}

.a2ui-metric__trend--up {
  color: #10b981;
}

.a2ui-metric__trend--down {
  color: #ef4444;
}
</style>

