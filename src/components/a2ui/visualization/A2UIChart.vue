<!--
  A2UIChart.vue
  
  Chart visualization component using Plotly.
  Part of the A2UI Standard Catalog (v0.8).
-->

<script setup>
import { useDataResolver } from '@/composables/useDataResolver';
import { useChartRenderer } from '@/composables/useChartRenderer';
import { toRef, computed, watch, onMounted, nextTick } from 'vue';

const props = defineProps({
  args: {
    type: Object,
    required: true
  },
  data: {
    type: Object,
    required: true
  }
});

const dataRef = toRef(props, 'data');
const argsRef = toRef(props, 'args');
const { resolve } = useDataResolver(dataRef);

// Use chart renderer composable
const { chartRef, drawChart } = useChartRenderer({
  resolve,
  args: argsRef,
  data: dataRef
});

// Watch for data changes to redraw chart
watch(() => props.data, () => {
  console.log('Chart data changed, redrawing');
  nextTick(() => {
    setTimeout(drawChart, 50);
  });
}, { deep: true });

// Watch for args changes
watch(() => props.args, () => {
  console.log('Chart args changed, redrawing');
  nextTick(() => {
    setTimeout(drawChart, 100);
  });
}, { deep: true });

// Initial render
onMounted(() => {
  console.log('Chart component mounted');
  setTimeout(drawChart, 300);
});
</script>

<template>
  <div class="w-full h-32 mt-2 bg-zinc-900/30 rounded-lg relative">
    <div ref="chartRef" class="w-full h-full min-h-[128px]"></div>
    <div 
      v-if="!chartRef" 
      class="absolute inset-0 flex items-center justify-center text-zinc-600 text-xs"
    >
      Loading chart...
    </div>
  </div>
</template>

