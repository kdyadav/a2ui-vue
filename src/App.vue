<script setup>
/**
 * Streaming Example - Shows how to build UI progressively
 * Simulates an AI agent streaming component definitions
 */
import { ref, reactive } from 'vue';
import A2UISurface from './A2UISurface.vue';
import dashboardJsonl from './streams/dashboard.jsonl?raw';
import assistantJsonl from './streams/assistant.jsonl?raw';
import productsJsonl from './streams/products.jsonl?raw';
import statusJsonl from './streams/status.jsonl?raw';
import taskManagerJsonl from './streams/taskmanager.jsonl?raw';

const isStreaming = ref(false);
const activeStream = ref(null);
const surfaces = reactive({});

// Stream configurations
const streamConfigs = {
  dashboard: {
    name: '📊 Analytics Dashboard',
    description: 'Dashboard with metrics and charts',
    surfaceId: 'dashboard'
  },
  assistant: {
    name: '🤖 AI Assistant',
    description: 'Chat response with action buttons',
    surfaceId: 'assistant'
  },
  products: {
    name: '🛒 Product Catalog',
    description: 'E-commerce product cards loading',
    surfaceId: 'products'
  },
  statusBoard: {
    name: '🚦 Status Board',
    description: 'Live system status monitoring',
    surfaceId: 'status'
  },
  taskManager: {
    name: '✅ Task Manager',
    description: 'Comprehensive task management app with forms, lists, charts, and data binding',
    surfaceId: 'taskmanager'
  }
};

// Parse JSONL string into array of message objects
const parseJsonl = (jsonlString) => {
  return jsonlString
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line));
};

// Stream messages are loaded from JSONL files
const dashboardMessages = parseJsonl(dashboardJsonl);

const assistantMessages = parseJsonl(assistantJsonl);

const productMessages = parseJsonl(productsJsonl);
const statusMessages = parseJsonl(statusJsonl);
const taskManagerMessages = parseJsonl(taskManagerJsonl);

const messageMap = {
  dashboard: dashboardMessages,
  assistant: assistantMessages,
  products: productMessages,
  statusBoard: statusMessages,
  taskManager: taskManagerMessages
};

// Simulate streaming JSON messages from an AI agent
const streamMessages = async (streamType = 'dashboard') => {
  isStreaming.value = true;
  activeStream.value = streamType;

  // Reset
  Object.keys(surfaces).forEach(k => delete surfaces[k]);

  const messages = messageMap[streamType] || dashboardMessages;

  // Stream messages with delay
  for (const msg of messages) {
    await new Promise(r => setTimeout(r, 400));
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
      <h2>Streaming UI Examples</h2>
      <p>Watch different UIs build progressively as messages stream in.</p>

      <div class="stream-buttons">
        <button v-for="(config, key) in streamConfigs" :key="key" @click="streamMessages(key)" :disabled="isStreaming"
          :class="{ active: activeStream === key }">
          {{ config.name }}
        </button>
      </div>

      <p v-if="activeStream" class="stream-description">
        {{ streamConfigs[activeStream]?.description }}
      </p>
    </div>

    <!-- Dynamic surface rendering based on active stream -->
    <div v-if="activeStream && surfaces[streamConfigs[activeStream]?.surfaceId]?.isLive" class="surface-container">
      <A2UISurface :componentId="surfaces[streamConfigs[activeStream].surfaceId].root"
        :components="surfaces[streamConfigs[activeStream].surfaceId].components"
        :data="surfaces[streamConfigs[activeStream].surfaceId].data" :surfaceId="streamConfigs[activeStream].surfaceId"
        @action="handleAction" @dataUpdate="handleDataUpdate" />
    </div>
    <div v-else class="placeholder">
      <span v-if="isStreaming">⏳ Building UI...</span>
      <span v-else>👆 Select a stream example above to begin</span>
    </div>
  </div>
</template>

<style scoped>
.streaming-example {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 1rem;
}

.controls {
  text-align: center;
  margin-bottom: 2rem;
}

.stream-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin: 1.5rem 0;
}

.stream-buttons button {
  background: #f3f4f6;
  color: #374151;
  padding: 0.75rem 1.25rem;
  border: 2px solid transparent;
  border-radius: 9999px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.stream-buttons button:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #d1d5db;
}

.stream-buttons button.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.stream-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stream-description {
  color: #6b7280;
  font-size: 0.875rem;
  font-style: italic;
  margin-top: 0.5rem;
}

.surface-container {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 1rem;
  min-height: 200px;
}

.placeholder {
  text-align: center;
  padding: 4rem;
  background: #f3f4f6;
  border-radius: 1rem;
  color: #6b7280;
  font-size: 1.1rem;
}
</style>
