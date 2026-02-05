<script setup>
import { ref, reactive, nextTick } from "vue";
import A2UISurface from "./A2UISurface.vue";

// ================== PARSER LOGIC ==================
const MODE = { TEXT: "TEXT", JSON: "JSON" };
const DELIMITER = "---a2ui_JSON---";

const currentMode = ref(MODE.TEXT);
const textBuffer = ref("");
const jsonBuffer = ref("");
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
    return item.valueList.map((listItem) => unpackValue(listItem));
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
          type: "text",
          id: timelineIdCounter++,
          content: parts[0],
        });
        autoScroll();
      }

      // Switch to JSON mode and add a loader to timeline
      currentMode.value = MODE.JSON;
      timeline.value.push({
        type: "loader",
        id: timelineIdCounter++,
      });
      autoScroll();

      // Process remaining content after delimiter
      const remaining = parts.slice(1).join(DELIMITER);
      if (remaining) {
        textBuffer.value = "";
        handleJsonFragment(remaining);
      } else {
        textBuffer.value = "";
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
      const lines = parts[0].split("\n");
      lines.forEach((line) => {
        if (!line.trim()) return;
        try {
          const msg = JSON.parse(line);
          dispatchMessage(msg);
        } catch (e) {
          console.error("Failed to parse JSON line:", e);
        }
      });
    }

    // Switch back to TEXT mode
    currentMode.value = MODE.TEXT;
    jsonBuffer.value = "";

    // Process remaining content after delimiter as text
    const remaining = parts.slice(1).join(DELIMITER);
    if (remaining) {
      textBuffer.value = remaining;
      autoScroll();
    }
  } else if (jsonBuffer.value.includes("\n")) {
    // Continue processing newline-delimited JSON
    const lines = jsonBuffer.value.split("\n");
    jsonBuffer.value = lines.pop();
    lines.forEach((line) => {
      if (!line.trim()) return;
      try {
        const msg = JSON.parse(line);
        dispatchMessage(msg);
      } catch (e) {
        /* Buffer wait */
      }
    });
  }
};

const dispatchMessage = (msg) => {
  const type = Object.keys(msg)[0];
  const payload = msg[type];
  const { surfaceId } = payload;

  if (type === "deleteSurface") {
    if (surfaces[surfaceId]) delete surfaces[surfaceId];

    // Remove surface from timeline
    const index = timeline.value.findIndex(
      (item) => item.type === "surface" && item.surfaceId === surfaceId
    );
    if (index !== -1) {
      timeline.value.splice(index, 1);
    }
    return;
  }

  if (!surfaces[surfaceId]) {
    surfaces[surfaceId] = {
      components: {},
      data: {},
      root: null,
      isLive: false,
    };
  }
  const s = surfaces[surfaceId];

  if (type === "surfaceUpdate") {
    payload.components.forEach((c) => (s.components[c.id] = c.component));
  } else if (type === "dataModelUpdate") {
    payload.contents.forEach((item) => {
      // USE THE NEW UNPACKER
      s.data[item.key] = unpackValue(item);
    });
  } else if (type === "beginRendering") {
    s.root = payload.root;
    s.isLive = true;

    // Remove the most recent loader from timeline (search from end)
    const loaderIndex = timeline.value
      .map((item, idx) => ({ item, idx }))
      .reverse()
      .find(({ item }) => item.type === "loader")?.idx;

    if (loaderIndex !== undefined) {
      timeline.value.splice(loaderIndex, 1);
    }

    // Add the actual surface to timeline at the same position
    timeline.value.splice(
      loaderIndex !== undefined ? loaderIndex : timeline.value.length,
      0,
      {
        type: "surface",
        id: timelineIdCounter++,
        surfaceId,
      }
    );

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
  textBuffer.value = "";
  jsonBuffer.value = "";
  currentMode.value = MODE.TEXT;
  Object.keys(surfaces).forEach((k) => delete surfaces[k]);

  // SCENARIO: PRODUCTION DASHBOARD - Comprehensive A2UI showcase with all components
  const fullStream = [
    // TEXT SECTION 1 - INTRODUCTION
    "🚀 MISSION CONTROL DASHBOARD v3.0\n",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n",
    "Initializing production-level monitoring system...\n\n",

    // JSON SECTION 1 - HEADER WITH TITLE
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "header", "components": [{"id": "hdr-root", "component": {"Card": {"child": "hdr-col"}}}, {"id": "hdr-col", "component": {"Column": {"gap": 2, "children": {"explicitList": ["hdr-title", "hdr-subtitle"]}}}}, {"id": "hdr-title", "component": {"Text": {"text": {"literalString": "Mission Control Dashboard"}, "usageHint": "h1"}}}, {"id": "hdr-subtitle", "component": {"Text": {"text": {"literalString": "Real-time spacecraft monitoring and telemetry system"}, "usageHint": "body"}}}]}}\n',
    '{"beginRendering": {"surfaceId": "header", "root": "hdr-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 2
    "✓ Dashboard initialized successfully\n",
    "Loading system status overview...\n\n",

    // JSON SECTION 2 - SYSTEM STATUS OVERVIEW
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "status", "components": [{"id": "st-root", "component": {"Card": {"child": "st-main"}}}, {"id": "st-main", "component": {"Column": {"children": {"explicitList": ["st-header", "st-metrics"]}}}}, {"id": "st-header", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["st-icon", "st-title"]}}}}, {"id": "st-icon", "component": {"Icon": {"name": "dashboard"}}}, {"id": "st-title", "component": {"Text": {"text": {"literalString": "System Status"}, "usageHint": "h3"}}}, {"id": "st-metrics", "component": {"Row": {"children": {"explicitList": ["st-m1", "st-m2", "st-m3", "st-m4"]}}}}, {"id": "st-m1", "component": {"Metric": {"label": "CPU Usage", "value": {"path": "/cpu"}, "trend": "up"}}}, {"id": "st-m2", "component": {"Metric": {"label": "Memory", "value": {"path": "/memory"}, "trend": "neutral"}}}, {"id": "st-m3", "component": {"Metric": {"label": "Network", "value": {"path": "/network"}, "trend": "up"}}}, {"id": "st-m4", "component": {"Metric": {"label": "Storage", "value": {"path": "/storage"}, "trend": "neutral"}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "status", "contents": [{"key": "cpu", "valueString": "42%"}, {"key": "memory", "valueString": "8.2 GB"}, {"key": "network", "valueString": "125 Mbps"}, {"key": "storage", "valueString": "67%"}]}}\n',
    '{"beginRendering": {"surfaceId": "status", "root": "st-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 3
    "✓ System resources nominal\n",
    "Initializing telemetry and propulsion monitoring...\n\n",

    // JSON SECTION 3 - TELEMETRY & PROPULSION
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "telemetry", "components": [{"id": "t-root", "component": {"Card": {"child": "t-col"}}}, {"id": "t-col", "component": {"Column": {"children": {"explicitList": ["t-head", "t-metrics"]}}}}, {"id": "t-head", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["t-icon", "t-txt"]}}}}, {"id": "t-icon", "component": {"Icon": {"name": "speed"}}}, {"id": "t-txt", "component": {"Text": {"text": {"literalString": "Velocity & Altitude"}, "usageHint": "h4"}}}, {"id": "t-metrics", "component": {"Row": {"children": {"explicitList": ["vel", "alt"]}}}}, {"id": "vel", "component": {"Metric": {"label": "Speed", "value": {"path": "/speed"}, "trend": "up"}}}, {"id": "alt", "component": {"Metric": {"label": "Altitude", "value": {"path": "/alt"}, "trend": "up"}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "telemetry", "contents": [{"key": "speed", "valueString": "24,500 km/h"}, {"key": "alt", "valueString": "180 km"}]}}\n',
    '{"beginRendering": {"surfaceId": "telemetry", "root": "t-root"}}\n',
    '{"surfaceUpdate": {"surfaceId": "fuel", "components": [{"id": "f-root", "component": {"Card": {"child": "f-col"}}}, {"id": "f-col", "component": {"Column": {"children": {"explicitList": ["f-head", "f-desc", "tank1", "tank2"]}}}}, {"id": "f-head", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["f-icon", "f-title"]}}}}, {"id": "f-icon", "component": {"Icon": {"name": "local_gas_station"}}}, {"id": "f-title", "component": {"Text": {"text": {"literalString": "Propellant Levels"}, "usageHint": "h4"}}}, {"id": "f-desc", "component": {"Text": {"text": {"literalString": "Real-time fuel tank monitoring"}, "usageHint": "caption"}}}, {"id": "tank1", "component": {"ProgressBar": {"value": {"path": "/lox"}}}}, {"id": "tank2", "component": {"ProgressBar": {"value": {"path": "/ch4"}}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "fuel", "contents": [{"key": "lox", "valueInt": 85}, {"key": "ch4", "valueInt": 92}]}}\n',
    '{"beginRendering": {"surfaceId": "fuel", "root": "f-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 4
    "✓ Propellant levels optimal - LOX: 85%, CH4: 92%\n",
    "Loading navigation and crew monitoring...\n\n",

    // JSON SECTION 4 - NAVIGATION & CREW VITALS
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "nav", "components": [{"id": "n-root", "component": {"Card": {"child": "n-col"}}}, {"id": "n-col", "component": {"Column": {"children": {"explicitList": ["n-head", "n-chart"]}}}}, {"id": "n-head", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["n-icon", "n-txt"]}}}}, {"id": "n-icon", "component": {"Icon": {"name": "public"}}}, {"id": "n-txt", "component": {"Text": {"text": {"literalString": "Orbital Trajectory"}, "usageHint": "h4"}}}, {"id": "n-chart", "component": {"Chart": {"type": "bar", "dataBinding": "/path"}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "nav", "contents": [{"key": "path", "valueList": [{"valueMap": [{"key": "val", "valueInt": 20}]}, {"valueMap": [{"key": "val", "valueInt": 40}]}, {"valueMap": [{"key": "val", "valueInt": 60}]}, {"valueMap": [{"key": "val", "valueInt": 80}]}]}]}}\n',
    '{"beginRendering": {"surfaceId": "nav", "root": "n-root"}}\n',
    '{"surfaceUpdate": {"surfaceId": "crew", "components": [{"id": "c-root", "component": {"Card": {"child": "c-col"}}}, {"id": "c-col", "component": {"Column": {"children": {"explicitList": ["c-head", "c-stat"]}}}}, {"id": "c-head", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["c-icon", "c-txt"]}}}}, {"id": "c-icon", "component": {"Icon": {"name": "favorite"}}}, {"id": "c-txt", "component": {"Text": {"text": {"literalString": "Crew Vitals"}, "usageHint": "h4"}}}, {"id": "c-stat", "component": {"Metric": {"label": "Avg Heart Rate", "value": {"path": "/bpm"}, "trend": "neutral"}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "crew", "contents": [{"key": "bpm", "valueString": "72 BPM"}]}}\n',
    '{"beginRendering": {"surfaceId": "crew", "root": "c-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 5
    "✓ Crew vitals stable - Average heart rate: 72 BPM\n",
    "Loading mission timeline...\n\n",

    // JSON SECTION 5 - MISSION TIMELINE TABLE
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "table", "components": [{"id": "tb-root", "component": {"Card": {"child": "tb-main"}}}, {"id": "tb-main", "component": {"Column": {"gap": 0, "children": {"explicitList": ["tb-title", "tb-header", "tb-row1", "tb-row2", "tb-row3", "tb-row4", "tb-row5"]}}}}, {"id": "tb-title", "component": {"Text": {"text": {"literalString": "Mission Timeline"}, "usageHint": "h2"}}}, {"id": "tb-header", "component": {"Row": {"columnWidthMode": "custom", "alignment": "center", "borderStyle": "all", "borderColor": "zinc-700", "backgroundColor": "zinc-800", "textColor": "zinc-100", "columnConfig": [{"width": "120px", "align": "left"}, {"width": "2fr", "align": "left"}, {"width": "1fr", "align": "center"}], "children": {"explicitList": ["th-time", "th-event", "th-status"]}}}}, {"id": "th-time", "component": {"Text": {"text": {"literalString": "TIMELINE"}, "usageHint": "caption"}}}, {"id": "th-event", "component": {"Text": {"text": {"literalString": "EVENT"}, "usageHint": "caption"}}}, {"id": "th-status", "component": {"Text": {"text": {"literalString": "STATUS"}, "usageHint": "caption"}}}, {"id": "tb-row1", "component": {"Row": {"columnWidthMode": "custom", "alignment": "center", "borderStyle": "all", "borderColor": "zinc-800", "backgroundColor": "green-600", "textColor": "white", "columnConfig": [{"width": "120px", "align": "left"}, {"width": "2fr", "align": "left"}, {"width": "1fr", "align": "center"}], "children": {"explicitList": ["r1-time", "r1-event", "r1-status"]}}}}, {"id": "r1-time", "component": {"Text": {"text": {"path": "/timeline/0/time"}}}}, {"id": "r1-event", "component": {"Text": {"text": {"path": "/timeline/0/event"}}}}, {"id": "r1-status", "component": {"Text": {"text": {"path": "/timeline/0/status"}}}}, {"id": "tb-row2", "component": {"Row": {"columnWidthMode": "custom", "alignment": "center", "borderStyle": "all", "borderColor": "zinc-800", "backgroundColor": "green-600", "textColor": "white", "columnConfig": [{"width": "120px", "align": "left"}, {"width": "2fr", "align": "left"}, {"width": "1fr", "align": "center"}], "children": {"explicitList": ["r2-time", "r2-event", "r2-status"]}}}}, {"id": "r2-time", "component": {"Text": {"text": {"path": "/timeline/1/time"}}}}, {"id": "r2-event", "component": {"Text": {"text": {"path": "/timeline/1/event"}}}}, {"id": "r2-status", "component": {"Text": {"text": {"path": "/timeline/1/status"}}}}, {"id": "tb-row3", "component": {"Row": {"columnWidthMode": "custom", "alignment": "center", "borderStyle": "all", "borderColor": "zinc-800", "backgroundColor": "blue-600", "textColor": "white", "columnConfig": [{"width": "120px", "align": "left"}, {"width": "2fr", "align": "left"}, {"width": "1fr", "align": "center"}], "children": {"explicitList": ["r3-time", "r3-event", "r3-status"]}}}}, {"id": "r3-time", "component": {"Text": {"text": {"path": "/timeline/2/time"}}}}, {"id": "r3-event", "component": {"Text": {"text": {"path": "/timeline/2/event"}}}}, {"id": "r3-status", "component": {"Text": {"text": {"path": "/timeline/2/status"}}}}, {"id": "tb-row4", "component": {"Row": {"columnWidthMode": "custom", "alignment": "center", "borderStyle": "all", "borderColor": "zinc-800", "columnConfig": [{"width": "120px", "align": "left"}, {"width": "2fr", "align": "left"}, {"width": "1fr", "align": "center"}], "children": {"explicitList": ["r4-time", "r4-event", "r4-status"]}}}}, {"id": "r4-time", "component": {"Text": {"text": {"path": "/timeline/3/time"}}}}, {"id": "r4-event", "component": {"Text": {"text": {"path": "/timeline/3/event"}}}}, {"id": "r4-status", "component": {"Text": {"text": {"path": "/timeline/3/status"}}}}, {"id": "tb-row5", "component": {"Row": {"columnWidthMode": "custom", "alignment": "center", "borderStyle": "all", "borderColor": "zinc-800", "columnConfig": [{"width": "120px", "align": "left"}, {"width": "2fr", "align": "left"}, {"width": "1fr", "align": "center"}], "children": {"explicitList": ["r5-time", "r5-event", "r5-status"]}}}}, {"id": "r5-time", "component": {"Text": {"text": {"path": "/timeline/4/time"}}}}, {"id": "r5-event", "component": {"Text": {"text": {"path": "/timeline/4/event"}}}}, {"id": "r5-status", "component": {"Text": {"text": {"path": "/timeline/4/status"}}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "table", "contents": [{"key": "timeline", "valueList": [{"valueMap": [{"key": "time", "valueString": "T+00:00"}, {"key": "event", "valueString": "Liftoff"}, {"key": "status", "valueString": "✓ Complete"}]}, {"valueMap": [{"key": "time", "valueString": "T+02:30"}, {"key": "event", "valueString": "Stage Separation"}, {"key": "status", "valueString": "✓ Complete"}]}, {"valueMap": [{"key": "time", "valueString": "T+08:45"}, {"key": "event", "valueString": "Orbit Insertion"}, {"key": "status", "valueString": "⏳ In Progress"}]}, {"valueMap": [{"key": "time", "valueString": "T+12:15"}, {"key": "event", "valueString": "Solar Panel Deploy"}, {"key": "status", "valueString": "⏱️ Scheduled"}]}, {"valueMap": [{"key": "time", "valueString": "T+15:30"}, {"key": "event", "valueString": "Comm Link Test"}, {"key": "status", "valueString": "⏱️ Scheduled"}]}]}]}}\n',
    '{"beginRendering": {"surfaceId": "table", "root": "tb-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 6
    "✓ Mission timeline synchronized\n",
    "Loading communication systems...\\n\\n",

    // JSON SECTION 6 - COMMUNICATIONS & ALERTS
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "comms", "components": [{"id": "cm-root", "component": {"Card": {"child": "cm-main"}}}, {"id": "cm-main", "component": {"Column": {"children": {"explicitList": ["cm-header", "cm-content"]}}}}, {"id": "cm-header", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["cm-icon", "cm-title"]}}}}, {"id": "cm-icon", "component": {"Icon": {"name": "wifi"}}}, {"id": "cm-title", "component": {"Text": {"text": {"literalString": "Communications"}, "usageHint": "h5"}}}, {"id": "cm-content", "component": {"Column": {"gap": 2, "children": {"explicitList": ["cm-status", "cm-signal"]}}}}, {"id": "cm-status", "component": {"Text": {"text": {"literalString": "Ground link established - Signal strength: Strong"}, "usageHint": "body"}}}, {"id": "cm-signal", "component": {"ProgressBar": {"value": {"path": "/signal"}}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "comms", "contents": [{"key": "signal", "valueInt": 95}]}}\n',
    '{"beginRendering": {"surfaceId": "comms", "root": "cm-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 7
    "✓ Communications link stable\n",
    "Loading environmental controls...\n\n",

    // JSON SECTION 7 - ENVIRONMENTAL CONTROLS
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "env", "components": [{"id": "env-root", "component": {"Card": {"child": "env-main"}}}, {"id": "env-main", "component": {"Column": {"children": {"explicitList": ["env-header", "env-metrics"]}}}}, {"id": "env-header", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["env-icon", "env-title"]}}}}, {"id": "env-icon", "component": {"Icon": {"name": "thermostat"}}}, {"id": "env-title", "component": {"Text": {"text": {"literalString": "Environmental Systems"}, "usageHint": "h3"}}}, {"id": "env-metrics", "component": {"Row": {"children": {"explicitList": ["env-m1", "env-m2", "env-m3"]}}}}, {"id": "env-m1", "component": {"Metric": {"label": "Temperature", "value": {"path": "/temp"}, "trend": "neutral"}}}, {"id": "env-m2", "component": {"Metric": {"label": "Pressure", "value": {"path": "/pressure"}, "trend": "neutral"}}}, {"id": "env-m3", "component": {"Metric": {"label": "O2 Level", "value": {"path": "/oxygen"}, "trend": "up"}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "env", "contents": [{"key": "temp", "valueString": "21.5°C"}, {"key": "pressure", "valueString": "101.3 kPa"}, {"key": "oxygen", "valueString": "20.9%"}]}}\n',
    '{"beginRendering": {"surfaceId": "env", "root": "env-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 8
    "✓ Environmental systems nominal\n",
    "Loading power distribution...\n\n",

    // JSON SECTION 8 - POWER DISTRIBUTION
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "power", "components": [{"id": "pwr-root", "component": {"Card": {"child": "pwr-main"}}}, {"id": "pwr-main", "component": {"Column": {"children": {"explicitList": ["pwr-header", "pwr-desc", "pwr-bars"]}}}}, {"id": "pwr-header", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["pwr-icon", "pwr-title"]}}}}, {"id": "pwr-icon", "component": {"Icon": {"name": "battery_charging_full"}}}, {"id": "pwr-title", "component": {"Text": {"text": {"literalString": "Power Distribution"}, "usageHint": "h4"}}}, {"id": "pwr-desc", "component": {"Text": {"text": {"literalString": "Solar array and battery status"}, "usageHint": "caption"}}}, {"id": "pwr-bars", "component": {"Column": {"gap": 2, "children": {"explicitList": ["pwr-solar", "pwr-battery"]}}}}, {"id": "pwr-solar", "component": {"ProgressBar": {"value": {"path": "/solar"}}}}, {"id": "pwr-battery", "component": {"ProgressBar": {"value": {"path": "/battery"}}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "power", "contents": [{"key": "solar", "valueInt": 78}, {"key": "battery", "valueInt": 94}]}}\n',
    '{"beginRendering": {"surfaceId": "power", "root": "pwr-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 9
    "✓ Power systems optimal - Solar: 78%, Battery: 94%\n",
    "Loading thermal management...\n\n",

    // JSON SECTION 9 - THERMAL MANAGEMENT
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "thermal", "components": [{"id": "thm-root", "component": {"Card": {"child": "thm-main"}}}, {"id": "thm-main", "component": {"Column": {"children": {"explicitList": ["thm-header", "thm-chart"]}}}}, {"id": "thm-header", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["thm-icon", "thm-title"]}}}}, {"id": "thm-icon", "component": {"Icon": {"name": "ac_unit"}}}, {"id": "thm-title", "component": {"Text": {"text": {"literalString": "Thermal Management"}, "usageHint": "h4"}}}, {"id": "thm-chart", "component": {"Chart": {"type": "bar", "dataBinding": "/thermal"}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "thermal", "contents": [{"key": "thermal", "valueList": [{"valueMap": [{"key": "val", "valueInt": 15}]}, {"valueMap": [{"key": "val", "valueInt": 25}]}, {"valueMap": [{"key": "val", "valueInt": 35}]}, {"valueMap": [{"key": "val", "valueInt": 30}]}, {"valueMap": [{"key": "val", "valueInt": 20}]}]}]}}\n',
    '{"beginRendering": {"surfaceId": "thermal", "root": "thm-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 10
    "✓ Thermal systems balanced\n",
    "Loading guidance systems...\n\n",

    // JSON SECTION 10 - GUIDANCE & CONTROL
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "guidance", "components": [{"id": "gd-root", "component": {"Card": {"child": "gd-main"}}}, {"id": "gd-main", "component": {"Column": {"children": {"explicitList": ["gd-header", "gd-metrics"]}}}}, {"id": "gd-header", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["gd-icon", "gd-title"]}}}}, {"id": "gd-icon", "component": {"Icon": {"name": "explore"}}}, {"id": "gd-title", "component": {"Text": {"text": {"literalString": "Guidance & Control"}, "usageHint": "h3"}}}, {"id": "gd-metrics", "component": {"Row": {"children": {"explicitList": ["gd-m1", "gd-m2", "gd-m3", "gd-m4"]}}}}, {"id": "gd-m1", "component": {"Metric": {"label": "Pitch", "value": {"path": "/pitch"}, "trend": "neutral"}}}, {"id": "gd-m2", "component": {"Metric": {"label": "Yaw", "value": {"path": "/yaw"}, "trend": "neutral"}}}, {"id": "gd-m3", "component": {"Metric": {"label": "Roll", "value": {"path": "/roll"}, "trend": "neutral"}}}, {"id": "gd-m4", "component": {"Metric": {"label": "Heading", "value": {"path": "/heading"}, "trend": "up"}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "guidance", "contents": [{"key": "pitch", "valueString": "0.2°"}, {"key": "yaw", "valueString": "-0.1°"}, {"key": "roll", "valueString": "0.0°"}, {"key": "heading", "valueString": "045°"}]}}\n',
    '{"beginRendering": {"surfaceId": "guidance", "root": "gd-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 11
    "✓ Guidance systems locked\n",
    "Loading payload status...\n\n",

    // JSON SECTION 11 - PAYLOAD STATUS
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "payload", "components": [{"id": "pl-root", "component": {"Card": {"child": "pl-main"}}}, {"id": "pl-main", "component": {"Column": {"children": {"explicitList": ["pl-header", "pl-content"]}}}}, {"id": "pl-header", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["pl-icon", "pl-title"]}}}}, {"id": "pl-icon", "component": {"Icon": {"name": "inventory_2"}}}, {"id": "pl-title", "component": {"Text": {"text": {"literalString": "Payload Status"}, "usageHint": "h4"}}}, {"id": "pl-content", "component": {"Column": {"gap": 2, "children": {"explicitList": ["pl-text", "pl-metric"]}}}}, {"id": "pl-text", "component": {"Text": {"text": {"literalString": "Scientific instruments and cargo bay"}, "usageHint": "caption"}}}, {"id": "pl-metric", "component": {"Metric": {"label": "Bay Pressure", "value": {"path": "/bay"}, "trend": "neutral"}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "payload", "contents": [{"key": "bay", "valueString": "0.01 kPa"}]}}\n',
    '{"beginRendering": {"surfaceId": "payload", "root": "pl-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 12
    "✓ Payload secured\n",
    "Loading radiation monitoring...\n\n",

    // JSON SECTION 12 - RADIATION MONITORING
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "radiation", "components": [{"id": "rad-root", "component": {"Card": {"child": "rad-main"}}}, {"id": "rad-main", "component": {"Column": {"children": {"explicitList": ["rad-header", "rad-chart"]}}}}, {"id": "rad-header", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["rad-icon", "rad-title"]}}}}, {"id": "rad-icon", "component": {"Icon": {"name": "warning"}}}, {"id": "rad-title", "component": {"Text": {"text": {"literalString": "Radiation Levels"}, "usageHint": "h5"}}}, {"id": "rad-chart", "component": {"Chart": {"type": "bar", "dataBinding": "/radiation"}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "radiation", "contents": [{"key": "radiation", "valueList": [{"valueMap": [{"key": "val", "valueInt": 5}]}, {"valueMap": [{"key": "val", "valueInt": 8}]}, {"valueMap": [{"key": "val", "valueInt": 6}]}, {"valueMap": [{"key": "val", "valueInt": 7}]}, {"valueMap": [{"key": "val", "valueInt": 5}]}, {"valueMap": [{"key": "val", "valueInt": 6}]}]}]}}\n',
    '{"beginRendering": {"surfaceId": "radiation", "root": "rad-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 13
    "✓ Radiation levels within safe limits\n",
    "Loading docking systems...\n\n",

    // JSON SECTION 13 - DOCKING SYSTEMS
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "docking", "components": [{"id": "dk-root", "component": {"Card": {"child": "dk-main"}}}, {"id": "dk-main", "component": {"Column": {"children": {"explicitList": ["dk-header", "dk-metrics"]}}}}, {"id": "dk-header", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["dk-icon", "dk-title"]}}}}, {"id": "dk-icon", "component": {"Icon": {"name": "link"}}}, {"id": "dk-title", "component": {"Text": {"text": {"literalString": "Docking Systems"}, "usageHint": "h4"}}}, {"id": "dk-metrics", "component": {"Row": {"children": {"explicitList": ["dk-m1", "dk-m2"]}}}}, {"id": "dk-m1", "component": {"Metric": {"label": "Distance", "value": {"path": "/distance"}, "trend": "down"}}}, {"id": "dk-m2", "component": {"Metric": {"label": "Approach Speed", "value": {"path": "/approach"}, "trend": "neutral"}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "docking", "contents": [{"key": "distance", "valueString": "1.2 km"}, {"key": "approach", "valueString": "0.5 m/s"}]}}\n',
    '{"beginRendering": {"surfaceId": "docking", "root": "dk-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 14
    "✓ Docking systems ready\n",
    "Loading emergency protocols...\n\n",

    // JSON SECTION 14 - EMERGENCY PROTOCOLS
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "emergency", "components": [{"id": "em-root", "component": {"Card": {"child": "em-main"}}}, {"id": "em-main", "component": {"Column": {"children": {"explicitList": ["em-header", "em-content"]}}}}, {"id": "em-header", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["em-icon", "em-title"]}}}}, {"id": "em-icon", "component": {"Icon": {"name": "emergency"}}}, {"id": "em-title", "component": {"Text": {"text": {"literalString": "Emergency Protocols"}, "usageHint": "h3"}}}, {"id": "em-content", "component": {"Column": {"gap": 2, "children": {"explicitList": ["em-status", "em-btn"]}}}}, {"id": "em-status", "component": {"Text": {"text": {"literalString": "All emergency systems armed and ready"}, "usageHint": "body"}}}, {"id": "em-btn", "component": {"Button": {"child": "em-btn-txt", "action": {"name": "abort"}}}}, {"id": "em-btn-txt", "component": {"Text": {"text": {"literalString": "ABORT MISSION"}}}}}]}}\n',
    '{"beginRendering": {"surfaceId": "emergency", "root": "em-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 15
    "✓ Emergency protocols active\n",
    "Loading diagnostics...\n\n",

    // JSON SECTION 15 - SYSTEM DIAGNOSTICS
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "diagnostics", "components": [{"id": "diag-root", "component": {"Card": {"child": "diag-main"}}}, {"id": "diag-main", "component": {"Column": {"children": {"explicitList": ["diag-header", "diag-metrics"]}}}}, {"id": "diag-header", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["diag-icon", "diag-title"]}}}}, {"id": "diag-icon", "component": {"Icon": {"name": "settings"}}}, {"id": "diag-title", "component": {"Text": {"text": {"literalString": "System Diagnostics"}, "usageHint": "h2"}}}, {"id": "diag-metrics", "component": {"Row": {"children": {"explicitList": ["diag-m1", "diag-m2", "diag-m3"]}}}}, {"id": "diag-m1", "component": {"Metric": {"label": "Uptime", "value": {"path": "/uptime"}, "trend": "up"}}}, {"id": "diag-m2", "component": {"Metric": {"label": "Errors", "value": {"path": "/errors"}, "trend": "neutral"}}}, {"id": "diag-m3", "component": {"Metric": {"label": "Warnings", "value": {"path": "/warnings"}, "trend": "neutral"}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "diagnostics", "contents": [{"key": "uptime", "valueString": "127h 45m"}, {"key": "errors", "valueString": "0"}, {"key": "warnings", "valueString": "2"}]}}\n',
    '{"beginRendering": {"surfaceId": "diagnostics", "root": "diag-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 16 - FINAL
    "✓ All systems operational and verified\n",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n",
    "Dashboard initialization complete. Ready for mission. 🚀\n",
    "Mission control standing by.\n",
  ].join("");

  let cursor = 0;
  while (cursor < fullStream.length) {
    const size = Math.floor(Math.random() * 20) + 1;
    const chunk = fullStream.slice(cursor, cursor + size);
    processToken(chunk);
    cursor += size;
    await new Promise((r) => setTimeout(r, Math.random() * 20 + 10));
  }
  isStreaming.value = false;
};
</script>

<template>
  <div
    class="h-screen bg-[#09090b] flex flex-col text-zinc-300 font-sans overflow-hidden"
  >
    <div
      class="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#09090b]/80 backdrop-blur z-20"
    >
      <div class="flex items-center gap-3">
        <div class="w-2 h-2 rounded-full bg-zinc-500"></div>
        <span class="text-sm font-medium tracking-wide text-zinc-300"
          >NaaviX <span class="text-zinc-600">Pro</span></span
        >
      </div>
      <button
        @click="runSimulation"
        :disabled="isStreaming"
        class="text-[10px] font-bold px-3 py-1.5 rounded border border-zinc-700 hover:bg-zinc-800 text-zinc-400 disabled:opacity-50 transition-all uppercase tracking-wide"
      >
        {{ isStreaming ? "Linking..." : "Initialize" }}
      </button>
    </div>

    <div
      ref="scrollRef"
      class="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scroll-smooth"
    >
      <div class="max-w-5xl mx-auto min-h-full flex flex-col justify-end pb-4">
        <div class="flex justify-end mb-8">
          <div
            class="bg-[#27272a] text-zinc-200 px-5 py-3 rounded-2xl rounded-tr-sm text-sm border border-zinc-800 max-w-md shadow-sm"
          >
            Run system diagnostics and launch protocol.
          </div>
        </div>

        <div class="flex gap-4 items-start animate-fade-in">
          <div
            class="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 shrink-0 mt-1 border border-zinc-700"
          >
            AI
          </div>

          <div class="flex-1 space-y-6 w-full min-w-0">
            <!-- Render timeline items in order -->
            <template v-for="item in timeline" :key="item.id">
              <!-- Text item -->
              <div
                v-if="item.type === 'text'"
                class="text-zinc-400 text-[15px] leading-relaxed max-w-3xl"
                v-html="
                  item.content
                    .replace(
                      /\*\*(.*?)\*\*/g,
                      '<span class=\'text-zinc-200 font-medium\'>$1</span>'
                    )
                    .replace(/\n/g, '<br>')
                "
              ></div>

              <!-- Loader item - shown while JSON is streaming -->
              <div
                v-else-if="item.type === 'loader'"
                class="transition-all duration-500"
              >
                <div
                  class="bg-[#18181b] border border-zinc-800 p-6 rounded-2xl animate-pulse h-48 flex flex-col gap-4"
                >
                  <div class="h-3 bg-zinc-800 rounded w-1/3"></div>
                  <div class="h-full bg-zinc-800/50 rounded-lg"></div>
                </div>
              </div>

              <!-- Surface item - shown when JSON is complete -->
              <div
                v-else-if="item.type === 'surface' && surfaces[item.surfaceId]"
                class="transition-all duration-500 animate-slide-up"
              >
                <A2UISurface
                  :componentId="surfaces[item.surfaceId].root"
                  :components="surfaces[item.surfaceId].components"
                  :data="surfaces[item.surfaceId].data"
                />
              </div>
            </template>

            <!-- Current streaming text buffer -->
            <div v-if="textBuffer" class="text-zinc-400 text-[15px]">
              {{ textBuffer
              }}<span
                class="inline-block w-1.5 h-4 bg-zinc-500 ml-1 align-middle animate-pulse"
              ></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="h-20 bg-[#09090b] border-t border-zinc-800 flex items-center px-4 sm:px-8 shrink-0 z-30"
    >
      <div class="w-full max-w-5xl mx-auto relative">
        <input
          type="text"
          placeholder="Enter command..."
          class="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-5 py-3.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-all shadow-lg"
          disabled
        />
      </div>
    </div>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined");
@import url("https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css");

.material-icons {
  font-family: "Material Icons";
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