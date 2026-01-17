<script setup>
import { ref, reactive, nextTick } from 'vue';
import A2UISurface from './A2UISurface.vue';

// ================== PARSER LOGIC ==================
const MODE = { TEXT: 'TEXT', JSON: 'JSON' };
const DELIMITER = '---a2ui_JSON---';

const currentMode = ref(MODE.TEXT);
const textBuffer = ref('');
const jsonBuffer = ref('');
const surfaces = reactive({});
const isStreaming = ref(false);
const scrollRef = ref(null);

// Timeline tracks items in order: { type: 'text'|'surface', id, content/surfaceId }
const timeline = ref([]);
let timelineIdCounter = 0;

// Helper to auto-scroll to bottom if user is near bottom
const autoScroll = () => {
  nextTick(() => {
    if (scrollRef.value) {
      const { scrollHeight, clientHeight, scrollTop } = scrollRef.value;
      const distanceFromBottom = scrollHeight - clientHeight - scrollTop;
      // Only autoscroll if user is near bottom (within 200px)
      if (distanceFromBottom < 200) {
        scrollRef.value.scrollTop = scrollHeight;
      }
    }
  });
};




// HELPER: Recursively unpack A2UI Typed Values into standard JS
const unpackValue = (item) => {
  if (!item) return null;

  // Primitives
  if (item.valueString !== undefined) return item.valueString;
  if (item.valueInt !== undefined) return item.valueInt;
  if (item.valueNumber !== undefined) return item.valueNumber;
  if (item.valueBool !== undefined) return item.valueBool;

  // Complex: Lists (Recursively unpack items)
  if (item.valueList) {
    return item.valueList.map(listItem => unpackValue(listItem));
  }

  // Complex: Maps (Convert [{key: 'a', valueString: 'b'}] -> {a: 'b'})
  if (item.valueMap) {
    return item.valueMap.reduce((acc, field) => {
      // If the map item has a 'key' property, use it. 
      // Otherwise, it might be a direct list item wrapper.
      if (field.key) {
        acc[field.key] = unpackValue(field);
      } else {
        // Fallback for flat maps if needed
        return unpackValue(field);
      }
      return acc;
    }, {});
  }

  return null;
};

const processToken = (chunk) => {
  if (currentMode.value === MODE.TEXT) {
    textBuffer.value += chunk;
    if (textBuffer.value.includes(DELIMITER)) {
      const parts = textBuffer.value.split(DELIMITER);

      // Save the text part before the delimiter to timeline
      if (parts[0]) {
        timeline.value.push({
          type: 'text',
          id: timelineIdCounter++,
          content: parts[0]
        });
        autoScroll();
      }

      // Switch to JSON mode and add a loader to timeline
      currentMode.value = MODE.JSON;
      timeline.value.push({
        type: 'loader',
        id: timelineIdCounter++
      });
      autoScroll();

      // Process remaining content after delimiter
      const remaining = parts.slice(1).join(DELIMITER);
      if (remaining) {
        textBuffer.value = '';
        handleJsonFragment(remaining);
      } else {
        textBuffer.value = '';
      }
    }
  } else {
    handleJsonFragment(chunk);
  }

  // Auto-scroll for streaming text buffer updates
  autoScroll();
};

const handleJsonFragment = (fragment) => {
  jsonBuffer.value += fragment;

  // Check if we've hit a text delimiter (switching back to text mode)
  if (jsonBuffer.value.includes(DELIMITER)) {
    const parts = jsonBuffer.value.split(DELIMITER);

    // Process all JSON lines before the delimiter
    if (parts[0]) {
      const lines = parts[0].split('\n');
      lines.forEach(line => {
        if (!line.trim()) return;
        try {
          const msg = JSON.parse(line);
          dispatchMessage(msg);
        } catch (e) {
          console.error('Failed to parse JSON line:', e);
        }
      });
    }

    // Switch back to TEXT mode
    currentMode.value = MODE.TEXT;
    jsonBuffer.value = '';

    // Process remaining content after delimiter as text
    const remaining = parts.slice(1).join(DELIMITER);
    if (remaining) {
      textBuffer.value = remaining;
      autoScroll();
    }
  } else if (jsonBuffer.value.includes('\n')) {
    // Continue processing newline-delimited JSON
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

  if (type === 'deleteSurface') {
    if (surfaces[surfaceId]) delete surfaces[surfaceId];

    // Remove surface from timeline
    const index = timeline.value.findIndex(
      item => item.type === 'surface' && item.surfaceId === surfaceId
    );
    if (index !== -1) {
      timeline.value.splice(index, 1);
    }
    return;
  }

  if (!surfaces[surfaceId]) {
    surfaces[surfaceId] = { components: {}, data: {}, root: null, isLive: false };
  }
  const s = surfaces[surfaceId];

  if (type === 'surfaceUpdate') {
    payload.components.forEach(c => s.components[c.id] = c.component);
  } else if (type === 'dataModelUpdate') {
    payload.contents.forEach(item => {
      // USE THE NEW UNPACKER
      s.data[item.key] = unpackValue(item);
    });
  } else if (type === 'beginRendering') {
    s.root = payload.root;
    s.isLive = true;

    // Remove the most recent loader from timeline (search from end)
    const loaderIndex = timeline.value.map((item, idx) => ({ item, idx }))
      .reverse()
      .find(({ item }) => item.type === 'loader')?.idx;

    if (loaderIndex !== undefined) {
      timeline.value.splice(loaderIndex, 1);
    }

    // Add the actual surface to timeline at the same position
    timeline.value.splice(loaderIndex !== undefined ? loaderIndex : timeline.value.length, 0, {
      type: 'surface',
      id: timelineIdCounter++,
      surfaceId
    });

    // Auto-scroll when surface is added
    autoScroll();
  }
};

// ================== SIMULATION DATA ==================
const runSimulation = async () => {
  if (isStreaming.value) return;
  isStreaming.value = true;

  // Reset
  timeline.value = [];
  timelineIdCounter = 0;
  textBuffer.value = '';
  jsonBuffer.value = '';
  currentMode.value = MODE.TEXT;
  Object.keys(surfaces).forEach(k => delete surfaces[k]);

  // SCENARIO: ORBITAL LAUNCH - Testing alternating text and JSON sections
  const fullStream = [
    // TEXT SECTION 1
    "Initiating **Orbital Launch Sequence**. \n",
    "Telemetry link established. Stand by for system pre-check...",
    "\n\n",

    // JSON SECTION 1 - LOADER
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "loader", "components": [{"id": "root", "component": {"Card": {"child": "col"}}}, {"id": "col", "component": {"Column": {"children": {"explicitList": ["txt", "bar"]}}}}, {"id": "txt", "component": {"Text": {"text": {"literalString": "Verifying Systems..."}, "usageHint": "caption"}}}, {"id": "bar", "component": {"ProgressBar": {"value": {"path": "/progress"}}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "loader", "contents": [{"key": "progress", "valueInt": 0}]}}\n',
    '{"beginRendering": {"surfaceId": "loader", "root": "root"}}\n',
    '{"dataModelUpdate": {"surfaceId": "loader", "contents": [{"key": "progress", "valueInt": 45}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "loader", "contents": [{"key": "progress", "valueInt": 100}]}}\n',
    '{"deleteSurface": {"surfaceId": "loader"}}\n',

    // TEXT SECTION 2
    "---a2ui_JSON---\n",
    "✓ Systems verified. All green.\n",
    "Initializing main telemetry dashboard...\n\n",

    // JSON SECTION 2 - TELEMETRY & FUEL
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "telemetry", "components": [{"id": "t-root", "component": {"Card": {"child": "t-col"}}}, {"id": "t-col", "component": {"Column": {"children": {"explicitList": ["t-head", "t-metrics"]}}}}, {"id": "t-head", "component": {"Row": {"children": {"explicitList": ["t-icon", "t-txt"]}}}}, {"id": "t-icon", "component": {"Icon": {"name": "speed"}}}, {"id": "t-txt", "component": {"Text": {"text": {"literalString": "Velocity Vector"}, "usageHint": "caption"}}}, {"id": "t-metrics", "component": {"Row": {"children": {"explicitList": ["vel", "alt"]}}}}, {"id": "vel", "component": {"Metric": {"label": "Speed", "value": {"path": "/speed"}, "trend": "up"}}}, {"id": "alt", "component": {"Metric": {"label": "Altitude", "value": {"path": "/alt"}, "trend": "up"}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "telemetry", "contents": [{"key": "speed", "valueString": "24,500"}, {"key": "alt", "valueString": "180 km"}]}}\n',
    '{"beginRendering": {"surfaceId": "telemetry", "root": "t-root"}}\n',
    '{"surfaceUpdate": {"surfaceId": "fuel", "components": [{"id": "f-root", "component": {"Card": {"child": "f-col"}}}, {"id": "f-col", "component": {"Column": {"children": {"explicitList": ["f-head", "tank1", "tank2"]}}}}, {"id": "f-head", "component": {"Text": {"text": {"literalString": "Propellant Levels"}, "usageHint": "caption"}}}, {"id": "tank1", "component": {"ProgressBar": {"value": {"path": "/lox"}}}}, {"id": "tank2", "component": {"ProgressBar": {"value": {"path": "/ch4"}}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "fuel", "contents": [{"key": "lox", "valueInt": 85}, {"key": "ch4", "valueInt": 92}]}}\n',
    '{"beginRendering": {"surfaceId": "fuel", "root": "f-root"}}\n',

    // TEXT SECTION 3
    "---a2ui_JSON---\n",
    "Propellant levels nominal. LOX at 85%, CH4 at 92%.\n",
    "Loading navigation and crew monitoring systems...\n\n",

    // JSON SECTION 3 - NAV & CREW
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "nav", "components": [{"id": "n-root", "component": {"Card": {"child": "n-col"}}}, {"id": "n-col", "component": {"Column": {"children": {"explicitList": ["n-head", "n-chart"]}}}}, {"id": "n-head", "component": {"Row": {"children": {"explicitList": ["n-icon", "n-txt"]}}}}, {"id": "n-icon", "component": {"Icon": {"name": "public"}}}, {"id": "n-txt", "component": {"Text": {"text": {"literalString": "Orbital Trajectory"}, "usageHint": "caption"}}}, {"id": "n-chart", "component": {"Chart": {"type": "bar", "dataBinding": "/path"}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "nav", "contents": [{"key": "path", "valueList": [{"valueMap": [{"key": "val", "valueInt": 20}]}, {"valueMap": [{"key": "val", "valueInt": 40}]}, {"valueMap": [{"key": "val", "valueInt": 60}]}, {"valueMap": [{"key": "val", "valueInt": 80}]}]}]}}\n',
    '{"beginRendering": {"surfaceId": "nav", "root": "n-root"}}\n',
    '{"surfaceUpdate": {"surfaceId": "crew", "components": [{"id": "c-root", "component": {"Card": {"child": "c-col"}}}, {"id": "c-col", "component": {"Column": {"children": {"explicitList": ["c-head", "c-stat"]}}}}, {"id": "c-head", "component": {"Row": {"children": {"explicitList": ["c-icon", "c-txt"]}}}}, {"id": "c-icon", "component": {"Icon": {"name": "favorite"}}}, {"id": "c-txt", "component": {"Text": {"text": {"literalString": "Crew Vitals"}, "usageHint": "caption"}}}, {"id": "c-stat", "component": {"Metric": {"label": "Avg BPM", "value": {"path": "/bpm"}, "trend": "neutral"}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "crew", "contents": [{"key": "bpm", "valueString": "72"}]}}\n',
    '{"beginRendering": {"surfaceId": "crew", "root": "c-root"}}\n',

    // TEXT SECTION 4
    "---a2ui_JSON---\n",
    "Crew vitals stable. Average heart rate: 72 BPM.\n",
    "Enabling manual override controls...\n\n",

    // JSON SECTION 4 - CONTROL
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "ctrl", "components": [{"id": "ct-root", "component": {"Card": {"child": "ct-col"}}}, {"id": "ct-col", "component": {"Column": {"children": {"explicitList": ["ct-head", "ct-btn"]}}}}, {"id": "ct-head", "component": {"Text": {"text": {"literalString": "Manual Override"}, "usageHint": "caption"}}}, {"id": "ct-btn", "component": {"Button": {"child": "abt", "action": {"name": "abort"}}}}, {"id": "abt", "component": {"Text": {"text": {"literalString": "INITIATE ABORT"}}}}]}}\n',
    '{"beginRendering": {"surfaceId": "ctrl", "root": "ct-root"}}\n',

    // TEXT SECTION 5 - FINAL
    "---a2ui_JSON---\n",
    "All systems operational. Ready for launch. 🚀\n",
    "Mission control standing by.\n"
  ].join("");

  let cursor = 0;
  while (cursor < fullStream.length) {
    const size = Math.floor(Math.random() * 20) + 1;
    const chunk = fullStream.slice(cursor, cursor + size);
    processToken(chunk);
    cursor += size;
    await new Promise(r => setTimeout(r, Math.random() * 20 + 10));
  }
  isStreaming.value = false;
};
</script>

<template>
  <div class="h-screen bg-[#09090b] flex flex-col text-zinc-300 font-sans overflow-hidden">

    <div
      class="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#09090b]/80 backdrop-blur z-20">
      <div class="flex items-center gap-3">
        <div class="w-2 h-2 rounded-full bg-zinc-500"></div>
        <span class="text-sm font-medium tracking-wide text-zinc-300">NaaviX <span
            class="text-zinc-600">Pro</span></span>
      </div>
      <button @click="runSimulation" :disabled="isStreaming"
        class="text-[10px] font-bold px-3 py-1.5 rounded border border-zinc-700 hover:bg-zinc-800 text-zinc-400 disabled:opacity-50 transition-all uppercase tracking-wide">
        {{ isStreaming ? 'Linking...' : 'Initialize' }}
      </button>
    </div>

    <div ref="scrollRef" class="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scroll-smooth">
      <div class="max-w-5xl mx-auto min-h-full flex flex-col justify-end pb-4">

        <div class="flex justify-end mb-8">
          <div
            class="bg-[#27272a] text-zinc-200 px-5 py-3 rounded-2xl rounded-tr-sm text-sm border border-zinc-800 max-w-md shadow-sm">
            Run system diagnostics and launch protocol.
          </div>
        </div>

        <div class="flex gap-4 items-start animate-fade-in">
          <div
            class="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 shrink-0 mt-1 border border-zinc-700">
            AI</div>

          <div class="flex-1 space-y-6 w-full min-w-0">

            <!-- Render timeline items in order -->
            <template v-for="item in timeline" :key="item.id">
              <!-- Text item -->
              <div v-if="item.type === 'text'" class="text-zinc-400 text-[15px] leading-relaxed max-w-3xl"
                v-html="item.content.replace(/\*\*(.*?)\*\*/g, '<span class=\'text-zinc-200 font-medium\'>$1</span>').replace(/\n/g, '<br>')">
              </div>

              <!-- Loader item - shown while JSON is streaming -->
              <div v-else-if="item.type === 'loader'" class="transition-all duration-500">
                <div class="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl animate-pulse h-48 flex flex-col gap-4">
                  <div class="h-3 bg-zinc-800 rounded w-1/3"></div>
                  <div class="h-full bg-zinc-800/50 rounded-lg"></div>
                </div>
              </div>

              <!-- Surface item - shown when JSON is complete -->
              <div v-else-if="item.type === 'surface' && surfaces[item.surfaceId]"
                class="transition-all duration-500 animate-slide-up">
                <A2UISurface :componentId="surfaces[item.surfaceId].root"
                  :components="surfaces[item.surfaceId].components" :data="surfaces[item.surfaceId].data" />
              </div>
            </template>

            <!-- Current streaming text buffer -->
            <div v-if="textBuffer" class="text-zinc-400 text-[15px]">
              {{ textBuffer }}<span class="inline-block w-1.5 h-4 bg-zinc-500 ml-1 align-middle animate-pulse"></span>
            </div>

          </div>
        </div>

      </div>
    </div>

    <div class="h-20 bg-[#09090b] border-t border-zinc-800 flex items-center px-4 sm:px-8 shrink-0 z-30">
      <div class="w-full max-w-5xl mx-auto relative">
        <input type="text" placeholder="Enter command..."
          class="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-5 py-3.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-all shadow-lg"
          disabled />
      </div>
    </div>

  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined');
@import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');

.material-icons {
  font-family: 'Material Icons';
  font-size: 24px;
  line-height: 1;
  display: inline-block;
}

.animate-slide-up {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #09090b;
}

::-webkit-scrollbar-thumb {
  background: #27272a;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #3f3f46;
}
</style>