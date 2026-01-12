<script setup>
import { ref, reactive, nextTick } from 'vue';
import A2UISurface from './A2UISurface.vue';

// ================== 1. PARSER ENGINE ==================
const MODE = { TEXT: 'TEXT', JSON: 'JSON' };
const DELIMITER = '---a2ui_JSON---';

// State
const currentMode = ref(MODE.TEXT);
const textBuffer = ref('');
const textHistory = ref([]);
const jsonBuffer = ref('');
const surfaces = reactive({});
const isStreaming = ref(false);
const scrollRef = ref(null);

// Inspector State
const packetLog = ref([]);
const inspectorMode = ref('visual');

// --- Token Processing ---
const processToken = (chunk) => {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);

  packetLog.value.push({
    id: Date.now() + Math.random(),
    content: chunk,
    mode: currentMode.value,
    timestamp,
    isDelimiter: chunk.includes(DELIMITER)
  });

  if (currentMode.value === MODE.TEXT) {
    textBuffer.value += chunk;

    if (textBuffer.value.includes(DELIMITER)) {
      const parts = textBuffer.value.split(DELIMITER);
      if (parts[0]) textHistory.value.push(parts[0]);

      textBuffer.value = '';
      currentMode.value = MODE.JSON;

      if (parts[1]) handleJsonFragment(parts[1]);
    }
  } else {
    handleJsonFragment(chunk);
  }

  nextTick(() => {
    const list = document.getElementById('inspector-list');
    if (list) list.scrollTop = list.scrollHeight;
  });
};

const handleJsonFragment = (fragment) => {
  jsonBuffer.value += fragment;

  if (jsonBuffer.value.includes('\n')) {
    const lines = jsonBuffer.value.split('\n');
    jsonBuffer.value = lines.pop();

    lines.forEach(line => {
      if (!line.trim()) return;
      try {
        const msg = JSON.parse(line);
        dispatchMessage(msg);
      } catch (e) { /* Buffer wait */ }
    });
  }
};

const dispatchMessage = (msg) => {
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
      s.data[item.key] = item.valueString || item.valueInt || item.valueList || item.valueMap;
    });
  } else if (type === 'beginRendering') {
    s.root = payload.root;
    s.isLive = true;
  }
};

// ================== 2. MEGA SIMULATION DATA ==================
const runSimulation = async () => {
  if (isStreaming.value) return;
  isStreaming.value = true;

  // Reset
  textHistory.value = [];
  textBuffer.value = '';
  jsonBuffer.value = '';
  currentMode.value = MODE.TEXT;
  packetLog.value = [];
  Object.keys(surfaces).forEach(k => delete surfaces[k]);

  // THE MEGA STREAM
  const fullStream = [
    // --- PHASE 1: RICH TEXT CONTEXT ---
    "Good morning, **Dave**. I've prepared your home and daily brief.\n\n",
    "It looks like a busy day ahead. I've detected motion at the **Front Gate**, ",
    "so I've pulled up the security feed. The weather in **Seattle** is slightly rainy, ",
    "so you might want to leave 10 minutes early for your commute.\n\n",
    "Here is your full **Smart Home Dashboard** with 6 active widgets active specifically for your morning routine.",
    "\n\n",

    "---a2ui_JSON---\n",

    // --- PHASE 2: PARALLEL SURFACE DEFINITIONS (Interleaved) ---

    // 1. LIGHTS (Living Room)
    '{"surfaceUpdate": {"surfaceId": "lights", "components": [{"id": "root", "component": {"Card": {"child": "col"}}}, {"id": "col", "component": {"Column": {"children": {"explicitList": ["h-row", "l1", "l2"]}}}}, {"id": "h-row", "component": {"Row": {"children": {"explicitList": ["icon", "title"]}}}}, {"id": "icon", "component": {"Icon": {"name": "lightbulb"}}}, {"id": "title", "component": {"Text": {"text": {"literalString": "Lighting"}, "usageHint": "caption"}}}, {"id": "l1", "component": {"Checkbox": {"label": "Living Room (Dim)", "binding": "/l1"}}}, {"id": "l2", "component": {"Checkbox": {"label": "Kitchen (Bright)", "binding": "/l2"}}}]}}\n',

    // 2. SECURITY (Front Door)
    '{"surfaceUpdate": {"surfaceId": "security", "components": [{"id": "s-root", "component": {"Card": {"child": "s-col"}}}, {"id": "s-col", "component": {"Column": {"children": {"explicitList": ["s-head", "cam-feed"]}}}}, {"id": "s-head", "component": {"Row": {"children": {"explicitList": ["s-icon", "s-txt"]}}}}, {"id": "s-icon", "component": {"Icon": {"name": "videocam"}}}, {"id": "s-txt", "component": {"Text": {"text": {"literalString": "Front Gate"}, "usageHint": "caption"}}}, {"id": "cam-feed", "component": {"Metric": {"label": "Status", "value": {"literalString": "Motion Detected"}, "trend": "down"}}}]}}\n',

    // 3. WEATHER (Metric)
    '{"surfaceUpdate": {"surfaceId": "weather", "components": [{"id": "w-root", "component": {"Card": {"child": "w-col"}}}, {"id": "w-col", "component": {"Column": {"children": {"explicitList": ["w-icon", "w-val"]}}}}, {"id": "w-icon", "component": {"Icon": {"name": "cloud"}}}, {"id": "w-val", "component": {"Metric": {"label": "Seattle, WA", "value": {"literalString": "12°C"}, "trend": "neutral"}}}]}}\n',

    // 4. REMINDERS (List)
    '{"surfaceUpdate": {"surfaceId": "tasks", "components": [{"id": "t-root", "component": {"Card": {"child": "t-list"}}}, {"id": "t-list", "component": {"Column": {"children": {"explicitList": ["t-head", "task1", "task2"]}}}}, {"id": "t-head", "component": {"Text": {"text": {"literalString": "To-Do List"}, "usageHint": "caption"}}}, {"id": "task1", "component": {"Checkbox": {"label": "Buy Milk"}}}, {"id": "task2", "component": {"Checkbox": {"label": "Call Mom"}}}]}}\n',

    // 5. MUSIC (Player)
    '{"surfaceUpdate": {"surfaceId": "music", "components": [{"id": "m-root", "component": {"Card": {"child": "m-col"}}}, {"id": "m-col", "component": {"Column": {"children": {"explicitList": ["m-head", "m-track", "m-ctrl"]}}}}, {"id": "m-head", "component": {"Row": {"children": {"explicitList": ["m-icon", "m-src"]}}}}, {"id": "m-icon", "component": {"Icon": {"name": "music_note"}}}, {"id": "m-src", "component": {"Text": {"text": {"literalString": "Spotify"}, "usageHint": "caption"}}}, {"id": "m-track", "component": {"Text": {"text": {"literalString": "Morning Jazz Mix"}, "usageHint": "h1"}}}, {"id": "m-ctrl", "component": {"Button": {"child": "play-txt", "action": {"name": "play"}}}}, {"id": "play-txt", "component": {"Text": {"text": {"literalString": "▶ Play"}}}}]}}\n',

    // 6. HEALTH (Chart)
    '{"surfaceUpdate": {"surfaceId": "health", "components": [{"id": "h-root", "component": {"Card": {"child": "h-col"}}}, {"id": "h-col", "component": {"Column": {"children": {"explicitList": ["h-title", "h-chart"]}}}}, {"id": "h-title", "component": {"Text": {"text": {"literalString": "Sleep Quality"}, "usageHint": "caption"}}}, {"id": "h-chart", "component": {"Chart": {"type": "bar", "dataBinding": "/sleep"}}}]}}\n',

    // --- PHASE 3: DATA & RENDERING (Staggered) ---

    // Render Surfaces 1 & 2
    '{"beginRendering": {"surfaceId": "lights", "root": "root"}}\n',
    '{"beginRendering": {"surfaceId": "security", "root": "s-root"}}\n',

    // Data for Surface 6 (Health)
    '{"dataModelUpdate": {"surfaceId": "health", "contents": [{"key": "sleep", "valueList": [{"valueMap": [{"key": "item", "valueString": "M"}, {"key": "val", "valueInt": 70}]}, {"valueMap": [{"key": "item", "valueString": "T"}, {"key": "val", "valueInt": 85}]}, {"valueMap": [{"key": "item", "valueString": "W"}, {"key": "val", "valueInt": 60}]}, {"valueMap": [{"key": "item", "valueString": "T"}, {"key": "val", "valueInt": 90}]}]}]}}\n',

    // Render remaining surfaces in quick succession
    '{"beginRendering": {"surfaceId": "weather", "root": "w-root"}}\n',
    '{"beginRendering": {"surfaceId": "tasks", "root": "t-root"}}\n',
    '{"beginRendering": {"surfaceId": "music", "root": "m-root"}}\n',
    '{"beginRendering": {"surfaceId": "health", "root": "h-root"}}\n'
  ].join("");

  // CHAOS STREAMER
  let cursor = 0;
  while (cursor < fullStream.length) {
    const size = Math.floor(Math.random() * 25) + 1; // 1-25 chars
    const chunk = fullStream.slice(cursor, cursor + size);
    processToken(chunk);
    cursor += size;
    await new Promise(r => setTimeout(r, Math.random() * 60 + 5)); // 5-65ms delay

    if (scrollRef.value) scrollRef.value.scrollTop = scrollRef.value.scrollHeight;
  }
  isStreaming.value = false;
};

// Formatting Helper
const formatPacket = (txt) => {
  return txt
    .replace(/"(.*?)"/g, '<span class="text-green-400">"$1"</span>')
    .replace(/({|}|\[|\])/g, '<span class="text-yellow-500">$1</span>')
    .replace(/(surfaceUpdate|dataModelUpdate|beginRendering)/g, '<span class="text-blue-400 font-bold">$1</span>');
};
</script>

<template>
  <div class="h-screen bg-[#131314] flex text-gray-200 font-sans overflow-hidden">

    <div class="flex-1 flex flex-col relative bg-white">

      <div class="h-14 border-b border-gray-100 flex items-center justify-between px-6 bg-white z-10">
        <div class="flex items-center gap-2">
          <span class="text-lg font-medium text-gray-700">NaaviX Home</span>
          <span
            class="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-bold tracking-wide">6-SURFACE
            DEMO</span>
        </div>
        <button @click="runSimulation" :disabled="isStreaming"
          class="bg-black text-white text-xs px-5 py-2 rounded-full hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg flex items-center gap-2">
          <span v-if="isStreaming" class="material-icons text-xs animate-spin">sync</span>
          {{ isStreaming ? 'STREAMING DATA...' : 'RUN MEGA-SIMULATION' }}
        </button>
      </div>

      <div ref="scrollRef" class="flex-1 overflow-y-auto bg-[#F0F4F9] p-6 pb-20">
        <div class="max-w-6xl mx-auto space-y-8">
          <div class="flex justify-end">
            <div
              class="bg-[#E7F0FE] text-gray-800 px-6 py-4 rounded-[24px] rounded-tr-sm max-w-lg shadow-sm text-[15px]">
              Good morning. What's the status of the house?
            </div>
          </div>

          <div class="flex gap-4 items-start">
            <div
              class="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex-shrink-0 mt-1 shadow-md flex items-center justify-center text-xs font-bold text-white">
              AI</div>

            <div class="flex-1 space-y-6 min-w-0">

              <div v-if="textHistory.length || textBuffer" class="text-gray-800 text-[16px] leading-relaxed max-w-2xl">
                <span v-for="(t, i) in textHistory" :key="i"
                  v-html="t.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>')"></span>
                <span v-if="textBuffer">{{ textBuffer }}</span>
                <span v-if="textBuffer"
                  class="inline-block w-2 h-4 bg-purple-500 ml-0.5 align-middle animate-pulse rounded-full"></span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                <template v-for="(name, index) in ['lights', 'security', 'weather', 'tasks', 'music', 'health']"
                  :key="name">
                  <div class="transition-all duration-700">

                    <div v-if="!surfaces[name]?.isLive && currentMode === 'JSON'"
                      class="bg-white p-6 rounded-3xl shadow-sm border border-white/50 animate-pulse h-48 flex flex-col justify-between"
                      :style="{ animationDelay: `${index * 100}ms` }">
                      <div class="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div class="h-20 bg-gray-100 rounded-xl"></div>
                    </div>

                    <div v-else-if="surfaces[name]?.isLive" class="animate-enter h-full">
                      <A2UISurface :componentId="surfaces[name].root" :components="surfaces[name].components"
                        :data="surfaces[name].data" />
                    </div>

                  </div>
                </template>

              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-80 bg-[#1E1E1E] border-l border-[#333] flex flex-col shadow-2xl z-20">
      <div class="h-14 border-b border-[#333] flex items-center justify-between px-4 bg-[#252526]">
        <div class="flex items-center gap-2">
          <span class="material-icons text-gray-400 text-sm">code</span>
          <span class="text-xs font-bold text-gray-300 uppercase tracking-wider">Inspector</span>
        </div>
        <button @click="inspectorMode = inspectorMode === 'visual' ? 'raw' : 'visual'"
          class="text-[10px] text-blue-400 hover:text-blue-300">
          {{ inspectorMode === 'visual' ? 'VISUAL' : 'RAW' }}
        </button>
      </div>

      <div id="inspector-list" class="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-[10px]">
        <div v-for="pkt in packetLog" :key="pkt.id" class="rounded border-l-2 pl-2 py-1 transition-all" :class="{
          'border-blue-500 hover:bg-[#2a2a2d]': pkt.mode === 'TEXT',
          'border-green-500 hover:bg-[#202b24]': pkt.mode === 'JSON' && !pkt.isDelimiter,
          'border-purple-500 bg-[#2d2236]': pkt.isDelimiter
        }">
          <div class="flex justify-between opacity-50 mb-0.5">
            <span class="font-bold" :class="pkt.mode === 'TEXT' ? 'text-blue-400' : 'text-green-400'">{{ pkt.mode
              }}</span>
            <span>{{ pkt.timestamp }}</span>
          </div>
          <div v-if="inspectorMode === 'visual'" class="text-gray-300 break-all leading-tight"
            v-html="formatPacket(pkt.content)"></div>
          <div v-else class="text-gray-500 break-all">{{ JSON.stringify(pkt.content) }}</div>
        </div>
      </div>

      <div class="p-2 border-t border-[#333] bg-[#252526] text-[10px] text-gray-500 flex justify-between">
        <span>Packets: {{ packetLog.length }}</span>
        <span>Surfaces: {{ Object.keys(surfaces).length }}</span>
      </div>
    </div>

  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
@import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');

.animate-enter {
  animation: popIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

#inspector-list::-webkit-scrollbar {
  width: 6px;
}

#inspector-list::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}
</style>