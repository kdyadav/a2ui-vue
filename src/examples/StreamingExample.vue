<script setup>
/**
 * Streaming Example - Shows how to build UI progressively
 * Simulates an AI agent streaming component definitions
 */
import { ref, reactive } from 'vue';
import A2UISurface from '../A2UISurface.vue';

const isStreaming = ref(false);
const surfaces = reactive({});

// Simulate streaming JSON messages from an AI agent
const streamMessages = async () => {
  isStreaming.value = true;
  
  // Reset
  Object.keys(surfaces).forEach(k => delete surfaces[k]);
  
  const messages = [
    // First: Create the dashboard structure
    { surfaceUpdate: { surfaceId: 'dashboard', components: [
      { id: 'root', component: { Column: { children: { explicitList: ['header', 'metrics-row'] } } } },
      { id: 'header', component: { Row: { alignment: 'center', children: { explicitList: ['icon', 'title'] } } } },
      { id: 'icon', component: { Icon: { name: 'analytics' } } },
      { id: 'title', component: { Text: { text: { literalString: 'Loading Dashboard...' }, usageHint: 'h1' } } }
    ] } },
    
    // Begin rendering (shows initial state)
    { beginRendering: { surfaceId: 'dashboard', root: 'root' } },
    
    // Add metrics row
    { surfaceUpdate: { surfaceId: 'dashboard', components: [
      { id: 'metrics-row', component: { Row: { distribution: 'spaceAround', children: { explicitList: ['metric1', 'metric2', 'metric3'] } } } },
      { id: 'metric1', component: { Metric: { label: 'Users', value: { literalString: '---' } } } },
      { id: 'metric2', component: { Metric: { label: 'Revenue', value: { literalString: '---' } } } },
      { id: 'metric3', component: { Metric: { label: 'Growth', value: { literalString: '---' } } } }
    ] } },
    
    // Update title
    { surfaceUpdate: { surfaceId: 'dashboard', components: [
      { id: 'title', component: { Text: { text: { literalString: 'Analytics Dashboard' }, usageHint: 'h1' } } }
    ] } },
    
    // Update metrics with real values
    { surfaceUpdate: { surfaceId: 'dashboard', components: [
      { id: 'metric1', component: { Metric: { label: 'Active Users', value: { literalString: '12,847' }, trend: 15.2 } } }
    ] } },
    
    { surfaceUpdate: { surfaceId: 'dashboard', components: [
      { id: 'metric2', component: { Metric: { label: 'Revenue', value: { literalString: '$48,293' }, unit: 'USD', trend: 8.7 } } }
    ] } },
    
    { surfaceUpdate: { surfaceId: 'dashboard', components: [
      { id: 'metric3', component: { Metric: { label: 'Growth Rate', value: { literalString: '23.5%' }, trend: 3.2 } } }
    ] } },
    
    // Add chart section
    { surfaceUpdate: { surfaceId: 'dashboard', components: [
      { id: 'root', component: { Column: { children: { explicitList: ['header', 'metrics-row', 'chart-section'] } } } },
      { id: 'chart-section', component: { Card: { child: 'chart' } } },
      { id: 'chart', component: { Chart: { type: 'bar', title: { literalString: 'Weekly Performance' }, data: { path: '/chartData' } } } }
    ] } },
    
    // Add chart data
    { dataModelUpdate: { surfaceId: 'dashboard', contents: [
      { key: 'chartData', valueList: [
        { valueMap: [{ key: 'label', valueString: 'Mon' }, { key: 'value', valueInt: 65 }] },
        { valueMap: [{ key: 'label', valueString: 'Tue' }, { key: 'value', valueInt: 78 }] },
        { valueMap: [{ key: 'label', valueString: 'Wed' }, { key: 'value', valueInt: 52 }] },
        { valueMap: [{ key: 'label', valueString: 'Thu' }, { key: 'value', valueInt: 91 }] },
        { valueMap: [{ key: 'label', valueString: 'Fri' }, { key: 'value', valueInt: 84 }] }
      ] }
    ] } }
  ];
  
  // Stream messages with delay
  for (const msg of messages) {
    await new Promise(r => setTimeout(r, 500));
    processMessage(msg);
  }
  
  isStreaming.value = false;
};

const extractValue = (item) => {
  if ('valueString' in item) return item.valueString;
  if ('valueNumber' in item) return item.valueNumber;
  if ('valueInt' in item) return item.valueInt;
  if ('valueBool' in item) return item.valueBool;
  if ('valueList' in item) return item.valueList.map(extractValue);
  if ('valueMap' in item) {
    const obj = {};
    item.valueMap.forEach(e => obj[e.key] = extractValue(e));
    return obj;
  }
  return null;
};

const processMessage = (msg) => {
  const type = Object.keys(msg)[0];
  const payload = msg[type];
  const { surfaceId } = payload;
  
  if (!surfaces[surfaceId]) {
    surfaces[surfaceId] = { components: {}, data: {}, root: null, isLive: false };
  }
  
  const s = surfaces[surfaceId];
  
  if (type === 'surfaceUpdate') {
    payload.components.forEach(c => s.components[c.id] = c.component);
  } else if (type === 'dataModelUpdate') {
    payload.contents.forEach(item => {
      s.data[item.key] = extractValue(item);
    });
  } else if (type === 'beginRendering') {
    s.root = payload.root;
    s.isLive = true;
  }
};

const handleAction = (action) => console.log('Action:', action);
const handleDataUpdate = (update) => console.log('Data update:', update);
</script>

<template>
  <div class="streaming-example">
    <div class="controls">
      <h2>Streaming UI Example</h2>
      <p>Watch the UI build progressively as messages stream in.</p>
      <button @click="streamMessages" :disabled="isStreaming">
        {{ isStreaming ? 'Streaming...' : 'Start Stream' }}
      </button>
    </div>
    
    <div v-if="surfaces.dashboard?.isLive" class="surface-container">
      <A2UISurface
        :componentId="surfaces.dashboard.root"
        :components="surfaces.dashboard.components"
        :data="surfaces.dashboard.data"
        surfaceId="dashboard"
        @action="handleAction"
        @dataUpdate="handleDataUpdate"
      />
    </div>
    <div v-else class="placeholder">
      Click "Start Stream" to begin
    </div>
  </div>
</template>

<style scoped>
.streaming-example { max-width: 700px; margin: 2rem auto; padding: 1rem; }
.controls { text-align: center; margin-bottom: 2rem; }
.controls button { background: #2563eb; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 9999px; cursor: pointer; font-weight: 500; }
.controls button:disabled { opacity: 0.5; cursor: not-allowed; }
.surface-container { background: #f9fafb; padding: 1.5rem; border-radius: 1rem; }
.placeholder { text-align: center; padding: 4rem; background: #f3f4f6; border-radius: 1rem; color: #6b7280; }
</style>

