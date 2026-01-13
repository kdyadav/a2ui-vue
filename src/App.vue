<script setup>
/**
 * Streaming Example - Shows how to build UI progressively
 * Simulates an AI agent streaming component definitions
 */
import { ref, reactive } from 'vue';
import A2UISurface from './A2UISurface.vue';

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
  }
};

// Dashboard stream messages
const dashboardMessages = [
  {
    surfaceUpdate: {
      surfaceId: 'dashboard', components: [
        { id: 'root', component: { Column: { children: { explicitList: ['header', 'metrics-row'] } } } },
        { id: 'header', component: { Row: { alignment: 'center', children: { explicitList: ['icon', 'title'] } } } },
        { id: 'icon', component: { Icon: { name: 'analytics' } } },
        { id: 'title', component: { Text: { text: { literalString: 'Loading Dashboard...' }, usageHint: 'h1' } } }
      ]
    }
  },
  { beginRendering: { surfaceId: 'dashboard', root: 'root' } },
  {
    surfaceUpdate: {
      surfaceId: 'dashboard', components: [
        { id: 'metrics-row', component: { Row: { distribution: 'spaceAround', children: { explicitList: ['metric1', 'metric2', 'metric3'] } } } },
        { id: 'metric1', component: { Metric: { label: 'Users', value: { literalString: '---' } } } },
        { id: 'metric2', component: { Metric: { label: 'Revenue', value: { literalString: '---' } } } },
        { id: 'metric3', component: { Metric: { label: 'Growth', value: { literalString: '---' } } } }
      ]
    }
  },
  {
    surfaceUpdate: {
      surfaceId: 'dashboard', components: [
        { id: 'title', component: { Text: { text: { literalString: 'Analytics Dashboard' }, usageHint: 'h1' } } }
      ]
    }
  },
  {
    surfaceUpdate: {
      surfaceId: 'dashboard', components: [
        { id: 'metric1', component: { Metric: { label: 'Active Users', value: { literalString: '12,847' }, trend: 15.2 } } }
      ]
    }
  },
  {
    surfaceUpdate: {
      surfaceId: 'dashboard', components: [
        { id: 'metric2', component: { Metric: { label: 'Revenue', value: { literalString: '$48,293' }, unit: 'USD', trend: 8.7 } } }
      ]
    }
  },
  {
    surfaceUpdate: {
      surfaceId: 'dashboard', components: [
        { id: 'metric3', component: { Metric: { label: 'Growth Rate', value: { literalString: '23.5%' }, trend: 3.2 } } }
      ]
    }
  },
  {
    surfaceUpdate: {
      surfaceId: 'dashboard', components: [
        { id: 'root', component: { Column: { children: { explicitList: ['header', 'metrics-row', 'chart-section'] } } } },
        { id: 'chart-section', component: { Card: { child: 'chart' } } },
        { id: 'chart', component: { Chart: { type: 'bar', title: { literalString: 'Weekly Performance' }, data: { path: '/chartData' } } } }
      ]
    }
  },
  {
    dataModelUpdate: {
      surfaceId: 'dashboard', contents: [
        {
          key: 'chartData', valueList: [
            { valueMap: [{ key: 'label', valueString: 'Mon' }, { key: 'value', valueInt: 65 }] },
            { valueMap: [{ key: 'label', valueString: 'Tue' }, { key: 'value', valueInt: 78 }] },
            { valueMap: [{ key: 'label', valueString: 'Wed' }, { key: 'value', valueInt: 52 }] },
            { valueMap: [{ key: 'label', valueString: 'Thu' }, { key: 'value', valueInt: 91 }] },
            { valueMap: [{ key: 'label', valueString: 'Fri' }, { key: 'value', valueInt: 84 }] }
          ]
        }
      ]
    }
  }
];

// AI Assistant stream messages
const assistantMessages = [
  {
    surfaceUpdate: {
      surfaceId: 'assistant', components: [
        { id: 'root', component: { Card: { child: 'content' } } },
        { id: 'content', component: { Column: { children: { explicitList: ['thinking'] } } } },
        { id: 'thinking', component: { Text: { text: { literalString: '🤔 Thinking...' }, usageHint: 'body' } } }
      ]
    }
  },
  { beginRendering: { surfaceId: 'assistant', root: 'root' } },
  {
    surfaceUpdate: {
      surfaceId: 'assistant', components: [
        { id: 'content', component: { Column: { children: { explicitList: ['response-header', 'divider', 'response-text'] } } } },
        { id: 'response-header', component: { Row: { alignment: 'center', children: { explicitList: ['bot-icon', 'bot-name'] } } } },
        { id: 'bot-icon', component: { Icon: { name: 'smart_toy' } } },
        { id: 'bot-name', component: { Text: { text: { literalString: 'AI Assistant' }, usageHint: 'h3' } } },
        { id: 'divider', component: { Divider: {} } },
        { id: 'response-text', component: { Text: { text: { literalString: 'I found 3 options for your request...' }, usageHint: 'body' } } }
      ]
    }
  },
  {
    surfaceUpdate: {
      surfaceId: 'assistant', components: [
        { id: 'content', component: { Column: { children: { explicitList: ['response-header', 'divider', 'response-text', 'options-row'] } } } },
        { id: 'options-row', component: { Row: { distribution: 'spaceEvenly', children: { explicitList: ['opt1', 'opt2', 'opt3'] } } } },
        { id: 'opt1', component: { Button: { label: '🎯 Quick Fix', action: { name: 'quickFix' }, variant: 'secondary' } } },
        { id: 'opt2', component: { Button: { label: '📋 Full Report', action: { name: 'fullReport' }, variant: 'primary' } } },
        { id: 'opt3', component: { Button: { label: '🔍 Details', action: { name: 'details' }, variant: 'secondary' } } }
      ]
    }
  },
  {
    surfaceUpdate: {
      surfaceId: 'assistant', components: [
        { id: 'response-text', component: { Text: { text: { literalString: 'Based on your query, I analyzed the data and found 3 possible solutions. The "Full Report" option provides comprehensive insights, while "Quick Fix" offers an immediate resolution. Select "Details" for more context.' }, usageHint: 'body' } } }
      ]
    }
  },
  {
    surfaceUpdate: {
      surfaceId: 'assistant', components: [
        { id: 'content', component: { Column: { children: { explicitList: ['response-header', 'divider', 'response-text', 'options-row', 'feedback-row'] } } } },
        { id: 'feedback-row', component: { Row: { alignment: 'end', children: { explicitList: ['like-btn', 'dislike-btn'] } } } },
        { id: 'like-btn', component: { Button: { label: '👍', action: { name: 'like' }, variant: 'secondary' } } },
        { id: 'dislike-btn', component: { Button: { label: '👎', action: { name: 'dislike' }, variant: 'secondary' } } }
      ]
    }
  }
];

// Product catalog stream messages
const productMessages = [
  {
    surfaceUpdate: {
      surfaceId: 'products', components: [
        { id: 'root', component: { Column: { children: { explicitList: ['header', 'loading'] } } } },
        { id: 'header', component: { Text: { text: { literalString: '🛒 Featured Products' }, usageHint: 'h1' } } },
        { id: 'loading', component: { Text: { text: { literalString: 'Loading products...' }, usageHint: 'caption' } } }
      ]
    }
  },
  { beginRendering: { surfaceId: 'products', root: 'root' } },
  {
    surfaceUpdate: {
      surfaceId: 'products', components: [
        { id: 'root', component: { Column: { children: { explicitList: ['header', 'product-grid'] } } } },
        { id: 'product-grid', component: { Row: { children: { explicitList: ['p1'] } } } },
        { id: 'p1', component: { Card: { child: 'p1-content' } } },
        { id: 'p1-content', component: { Column: { children: { explicitList: ['p1-img', 'p1-name', 'p1-price', 'p1-btn'] } } } },
        { id: 'p1-img', component: { Icon: { name: 'headphones' } } },
        { id: 'p1-name', component: { Text: { text: { literalString: 'Wireless Headphones' }, usageHint: 'h3' } } },
        { id: 'p1-price', component: { Text: { text: { literalString: '$149.99' }, usageHint: 'body' } } },
        { id: 'p1-btn', component: { Button: { label: 'Add to Cart', action: { name: 'addToCart', params: { id: 1 } }, variant: 'primary' } } }
      ]
    }
  },
  {
    surfaceUpdate: {
      surfaceId: 'products', components: [
        { id: 'product-grid', component: { Row: { children: { explicitList: ['p1', 'p2'] } } } },
        { id: 'p2', component: { Card: { child: 'p2-content' } } },
        { id: 'p2-content', component: { Column: { children: { explicitList: ['p2-img', 'p2-name', 'p2-price', 'p2-btn'] } } } },
        { id: 'p2-img', component: { Icon: { name: 'watch' } } },
        { id: 'p2-name', component: { Text: { text: { literalString: 'Smart Watch Pro' }, usageHint: 'h3' } } },
        { id: 'p2-price', component: { Text: { text: { literalString: '$299.00' }, usageHint: 'body' } } },
        { id: 'p2-btn', component: { Button: { label: 'Add to Cart', action: { name: 'addToCart', params: { id: 2 } }, variant: 'primary' } } }
      ]
    }
  },
  {
    surfaceUpdate: {
      surfaceId: 'products', components: [
        { id: 'product-grid', component: { Row: { children: { explicitList: ['p1', 'p2', 'p3'] } } } },
        { id: 'p3', component: { Card: { child: 'p3-content' } } },
        { id: 'p3-content', component: { Column: { children: { explicitList: ['p3-img', 'p3-name', 'p3-price', 'p3-btn'] } } } },
        { id: 'p3-img', component: { Icon: { name: 'speaker' } } },
        { id: 'p3-name', component: { Text: { text: { literalString: 'Portable Speaker' }, usageHint: 'h3' } } },
        { id: 'p3-price', component: { Text: { text: { literalString: '$79.99' }, usageHint: 'body' } } },
        { id: 'p3-btn', component: { Button: { label: 'Add to Cart', action: { name: 'addToCart', params: { id: 3 } }, variant: 'primary' } } }
      ]
    }
  },
  {
    surfaceUpdate: {
      surfaceId: 'products', components: [
        { id: 'root', component: { Column: { children: { explicitList: ['header', 'product-grid', 'cart-summary'] } } } },
        { id: 'cart-summary', component: { Row: { alignment: 'center', distribution: 'spaceBetween', children: { explicitList: ['cart-icon', 'cart-text', 'checkout-btn'] } } } },
        { id: 'cart-icon', component: { Icon: { name: 'shopping_cart' } } },
        { id: 'cart-text', component: { Text: { text: { path: '/cartCount' }, usageHint: 'body' } } },
        { id: 'checkout-btn', component: { Button: { label: 'Checkout', action: { name: 'checkout' }, variant: 'primary' } } }
      ]
    }
  },
  {
    dataModelUpdate: {
      surfaceId: 'products', contents: [
        { key: 'cartCount', valueString: '0 items in cart' }
      ]
    }
  }
];

// Status board stream messages
const statusMessages = [
  {
    surfaceUpdate: {
      surfaceId: 'status', components: [
        { id: 'root', component: { Column: { children: { explicitList: ['header', 'status-grid'] } } } },
        { id: 'header', component: { Row: { alignment: 'center', children: { explicitList: ['status-icon', 'status-title', 'refresh-btn'] } } } },
        { id: 'status-icon', component: { Icon: { name: 'dns' } } },
        { id: 'status-title', component: { Text: { text: { literalString: 'System Status' }, usageHint: 'h1' } } },
        { id: 'refresh-btn', component: { Button: { label: '🔄 Refresh', action: { name: 'refresh' }, variant: 'secondary' } } },
        { id: 'status-grid', component: { Column: { children: { explicitList: [] } } } }
      ]
    }
  },
  { beginRendering: { surfaceId: 'status', root: 'root' } },
  {
    surfaceUpdate: {
      surfaceId: 'status', components: [
        { id: 'status-grid', component: { Column: { children: { explicitList: ['api-status'] } } } },
        { id: 'api-status', component: { Row: { alignment: 'center', distribution: 'spaceBetween', children: { explicitList: ['api-label', 'api-metric'] } } } },
        { id: 'api-label', component: { Text: { text: { literalString: '🟢 API Server' }, usageHint: 'body' } } },
        { id: 'api-metric', component: { Metric: { label: 'Response', value: { literalString: '45ms' }, trend: -5 } } }
      ]
    }
  },
  {
    surfaceUpdate: {
      surfaceId: 'status', components: [
        { id: 'status-grid', component: { Column: { children: { explicitList: ['api-status', 'db-status'] } } } },
        { id: 'db-status', component: { Row: { alignment: 'center', distribution: 'spaceBetween', children: { explicitList: ['db-label', 'db-metric'] } } } },
        { id: 'db-label', component: { Text: { text: { literalString: '🟢 Database' }, usageHint: 'body' } } },
        { id: 'db-metric', component: { Metric: { label: 'Queries/s', value: { literalString: '1,250' }, trend: 12 } } }
      ]
    }
  },
  {
    surfaceUpdate: {
      surfaceId: 'status', components: [
        { id: 'status-grid', component: { Column: { children: { explicitList: ['api-status', 'db-status', 'cache-status'] } } } },
        { id: 'cache-status', component: { Row: { alignment: 'center', distribution: 'spaceBetween', children: { explicitList: ['cache-label', 'cache-metric'] } } } },
        { id: 'cache-label', component: { Text: { text: { literalString: '🟡 Cache' }, usageHint: 'body' } } },
        { id: 'cache-metric', component: { Metric: { label: 'Hit Rate', value: { literalString: '87%' }, trend: -2 } } }
      ]
    }
  },
  {
    surfaceUpdate: {
      surfaceId: 'status', components: [
        { id: 'status-grid', component: { Column: { children: { explicitList: ['api-status', 'db-status', 'cache-status', 'cdn-status'] } } } },
        { id: 'cdn-status', component: { Row: { alignment: 'center', distribution: 'spaceBetween', children: { explicitList: ['cdn-label', 'cdn-metric'] } } } },
        { id: 'cdn-label', component: { Text: { text: { literalString: '🟢 CDN' }, usageHint: 'body' } } },
        { id: 'cdn-metric', component: { Metric: { label: 'Latency', value: { literalString: '12ms' }, trend: -8 } } }
      ]
    }
  },
  {
    surfaceUpdate: {
      surfaceId: 'status', components: [
        { id: 'root', component: { Column: { children: { explicitList: ['header', 'status-grid', 'divider', 'summary'] } } } },
        { id: 'divider', component: { Divider: {} } },
        { id: 'summary', component: { Row: { alignment: 'center', distribution: 'spaceAround', children: { explicitList: ['uptime', 'alerts', 'health'] } } } },
        { id: 'uptime', component: { Metric: { label: 'Uptime', value: { literalString: '99.97%' }, trend: 0.02 } } },
        { id: 'alerts', component: { Metric: { label: 'Active Alerts', value: { literalString: '1' }, trend: -3 } } },
        { id: 'health', component: { Metric: { label: 'Health Score', value: { literalString: '95/100' }, trend: 2 } } }
      ]
    }
  }
];

const messageMap = {
  dashboard: dashboardMessages,
  assistant: assistantMessages,
  products: productMessages,
  statusBoard: statusMessages
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
  max-width: 800px;
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
