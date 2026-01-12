<script setup>
import { useA2UIParser } from './useA2UIParser';
import A2UISurface from './A2UISurface.vue';

const { textResponse, surfaces, processToken } = useA2UIParser();

// Mock Streaming Function
const simulateStream = async () => {
  const chunks = [
    "Analysis complete. Your store is performing **12% above average** this morning.\n\n",
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "main", "components": [',
    '{"id": "root", "component": {"Column": {"children": {"explicitList": ["header-row", "metrics-row", "sales-chart", "action-card"]}}}},',

    // Header with Icon
    '{"id": "header-row", "component": {"Row": {"children": {"explicitList": ["icon", "title"]}}}},',
    '{"id": "icon", "component": {"Icon": {"name": "trending_up"}}},',
    '{"id": "title", "component": {"Text": {"text": {"literalString": "Performance Insights"}, "usageHint": "h1"}}},',

    // Metrics Grid
    '{"id": "metrics-row", "component": {"Row": {"children": {"explicitList": ["m1", "m2"]}}}},',
    '{"id": "m1", "component": {"Metric": {"label": "Revenue", "value": {"path": "/rev"}, "trend": "up"}}},',
    '{"id": "m2", "component": {"Metric": {"label": "Conversion", "value": {"path": "/conv"}, "trend": "neutral"}}},',

    // The Chart
    '{"id": "sales-chart", "component": {"Card": {"child": "chart-inner"}}},',
    '{"id": "chart-inner", "component": {"Column": {"children": {"explicitList": ["chart-label", "main-bar-chart"]}}}},',
    '{"id": "chart-label", "component": {"Text": {"text": {"literalString": "Hourly Traffic (Last 5h)"}, "usageHint": "caption"}}},',
    '{"id": "main-bar-chart", "component": {"Chart": {"type": "bar", "dataBinding": "/hourly"}}}',
    ']}}\n',

    '{"dataModelUpdate": {"surfaceId": "main", "contents": [',
    '{"key": "rev", "valueString": "$12,402"},',
    '{"key": "conv", "valueString": "3.8%"},',
    '{"key": "hourly", "valueList": [',
    '{"valueMap": [{"key": "item", "valueString": "9AM"}, {"key": "val", "valueInt": 45}]},',
    '{"valueMap": [{"key": "item", "valueString": "10AM"}, {"key": "val", "valueInt": 78}]},',
    '{"valueMap": [{"key": "item", "valueString": "11AM"}, {"key": "val", "valueInt": 92}]},',
    '{"valueMap": [{"key": "item", "valueString": "12PM"}, {"key": "val", "valueInt": 65}]},',
    '{"valueMap": [{"key": "item", "valueString": "1PM"}, {"key": "val", "valueInt": 80}]}',
    ']}]}}\n',

    '{"beginRendering": {"surfaceId": "main", "root": "root"}}\n'
  ];

  for (const chunk of chunks) {
    await new Promise(r => setTimeout(r, 500));
    processToken(chunk);
  }
};
</script>

<template>
  <div class="message">
    <div class="text-content">{{ textResponse }}</div>

    <div v-for="(surface, id) in surfaces" :key="id">
      <div v-if="!surface.isLive" class="spinner">Loading UI...</div>
      <A2UISurface v-else :surfaceId="id" :componentId="surface.root" :components="surface.components"
        :data="surface.data" />
    </div>

    <button @click="simulateStream">Test Stream</button>
  </div>
</template>