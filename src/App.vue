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

  // SCENARIO: ADVANCED ENTERPRISE ANALYTICS PLATFORM - Ultra-detailed A2UI showcase
  const fullStream = [
    // TEXT SECTION 1 - INTRODUCTION
    "🌐 ENTERPRISE ANALYTICS PLATFORM v5.2.1\n",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n",
    "Initializing comprehensive multi-tenant analytics dashboard...\n",
    "Connecting to data sources: PostgreSQL, MongoDB, Redis, Elasticsearch\n",
    "Establishing secure WebSocket connections...\n\n",

    // JSON SECTION 1 - MAIN HEADER WITH BRANDING
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "main-header", "components": [{"id": "mh-root", "component": {"Card": {"child": "mh-container"}}}, {"id": "mh-container", "component": {"Column": {"gap": 3, "children": {"explicitList": ["mh-top-row", "mh-subtitle", "mh-breadcrumb"]}}}}, {"id": "mh-top-row", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["mh-icon", "mh-title", "mh-badge"]}}}}, {"id": "mh-icon", "component": {"Icon": {"name": "analytics"}}}, {"id": "mh-title", "component": {"Text": {"text": {"literalString": "Enterprise Analytics Platform"}, "usageHint": "h1"}}}, {"id": "mh-badge", "component": {"Text": {"text": {"literalString": "PRODUCTION"}, "usageHint": "caption"}}}, {"id": "mh-subtitle", "component": {"Text": {"text": {"literalString": "Real-time business intelligence and predictive analytics across 47 data sources"}, "usageHint": "body"}}}, {"id": "mh-breadcrumb", "component": {"Row": {"gap": 1, "children": {"explicitList": ["bc1", "bc2", "bc3"]}}}}, {"id": "bc1", "component": {"Text": {"text": {"literalString": "Home"}, "usageHint": "caption"}}}, {"id": "bc2", "component": {"Text": {"text": {"literalString": ">"}, "usageHint": "caption"}}}, {"id": "bc3", "component": {"Text": {"text": {"literalString": "Global Dashboard"}, "usageHint": "caption"}}}]}}\n',
    '{"beginRendering": {"surfaceId": "main-header", "root": "mh-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 2
    "✓ Platform initialized successfully\n",
    "✓ Authentication verified - User: admin@enterprise.com\n",
    "✓ Permissions loaded: Full Access (Super Admin)\n",
    "Loading real-time KPI overview...\n\n",

    // JSON SECTION 2 - COMPREHENSIVE KPI DASHBOARD
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "kpi-overview", "components": [{"id": "kpi-root", "component": {"Card": {"child": "kpi-main"}}}, {"id": "kpi-main", "component": {"Column": {"gap": 3, "children": {"explicitList": ["kpi-header", "kpi-row1", "kpi-row2", "kpi-divider", "kpi-footer"]}}}}, {"id": "kpi-header", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["kpi-icon", "kpi-title", "kpi-refresh"]}}}}, {"id": "kpi-icon", "component": {"Icon": {"name": "trending_up"}}}, {"id": "kpi-title", "component": {"Text": {"text": {"literalString": "Key Performance Indicators"}, "usageHint": "h2"}}}, {"id": "kpi-refresh", "component": {"Button": {"child": "kpi-refresh-txt", "action": {"name": "refresh_kpi"}}}}, {"id": "kpi-refresh-txt", "component": {"Text": {"text": {"literalString": "Refresh"}}}}, {"id": "kpi-row1", "component": {"Row": {"gap": 2, "children": {"explicitList": ["kpi-m1", "kpi-m2", "kpi-m3", "kpi-m4", "kpi-m5"]}}}}, {"id": "kpi-m1", "component": {"Metric": {"label": "Total Revenue", "value": {"path": "/kpi/revenue"}, "trend": "up"}}}, {"id": "kpi-m2", "component": {"Metric": {"label": "Active Users", "value": {"path": "/kpi/users"}, "trend": "up"}}}, {"id": "kpi-m3", "component": {"Metric": {"label": "Conversion Rate", "value": {"path": "/kpi/conversion"}, "trend": "neutral"}}}, {"id": "kpi-m4", "component": {"Metric": {"label": "Avg Response Time", "value": {"path": "/kpi/response"}, "trend": "down"}}}, {"id": "kpi-m5", "component": {"Metric": {"label": "Error Rate", "value": {"path": "/kpi/errors"}, "trend": "down"}}}, {"id": "kpi-row2", "component": {"Row": {"gap": 2, "children": {"explicitList": ["kpi-m6", "kpi-m7", "kpi-m8", "kpi-m9", "kpi-m10"]}}}}, {"id": "kpi-m6", "component": {"Metric": {"label": "API Calls/min", "value": {"path": "/kpi/api"}, "trend": "up"}}}, {"id": "kpi-m7", "component": {"Metric": {"label": "Database Load", "value": {"path": "/kpi/db"}, "trend": "neutral"}}}, {"id": "kpi-m8", "component": {"Metric": {"label": "Cache Hit Rate", "value": {"path": "/kpi/cache"}, "trend": "up"}}}, {"id": "kpi-m9", "component": {"Metric": {"label": "CDN Bandwidth", "value": {"path": "/kpi/cdn"}, "trend": "up"}}}, {"id": "kpi-m10", "component": {"Metric": {"label": "Queue Depth", "value": {"path": "/kpi/queue"}, "trend": "neutral"}}}, {"id": "kpi-divider", "component": {"Text": {"text": {"literalString": "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"}, "usageHint": "caption"}}}, {"id": "kpi-footer", "component": {"Text": {"text": {"path": "/kpi/timestamp"}, "usageHint": "caption"}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "kpi-overview", "contents": [{"key": "kpi", "valueMap": [{"key": "revenue", "valueString": "$2.4M"}, {"key": "users", "valueString": "127,543"}, {"key": "conversion", "valueString": "3.42%"}, {"key": "response", "valueString": "142ms"}, {"key": "errors", "valueString": "0.03%"}, {"key": "api", "valueString": "45,231"}, {"key": "db", "valueString": "67%"}, {"key": "cache", "valueString": "94.2%"}, {"key": "cdn", "valueString": "1.2 TB/h"}, {"key": "queue", "valueString": "234"}, {"key": "timestamp", "valueString": "Last updated: 2026-02-05 14:32:18 UTC"}]}]}}\n',
    '{"beginRendering": {"surfaceId": "kpi-overview", "root": "kpi-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 3
    "✓ KPI metrics loaded successfully\n",
    "✓ Real-time data streaming active\n",
    "Initializing regional performance breakdown...\n\n",

    // JSON SECTION 3 - REGIONAL PERFORMANCE WITH NESTED DATA
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "regional", "components": [{"id": "reg-root", "component": {"Card": {"child": "reg-main"}}}, {"id": "reg-main", "component": {"Column": {"gap": 2, "children": {"explicitList": ["reg-header", "reg-desc", "reg-chart", "reg-metrics"]}}}}, {"id": "reg-header", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["reg-icon", "reg-title"]}}}}, {"id": "reg-icon", "component": {"Icon": {"name": "public"}}}, {"id": "reg-title", "component": {"Text": {"text": {"literalString": "Global Regional Performance"}, "usageHint": "h3"}}}, {"id": "reg-desc", "component": {"Text": {"text": {"literalString": "Revenue distribution across 6 continents and 42 countries"}, "usageHint": "body"}}}, {"id": "reg-chart", "component": {"Chart": {"type": "bar", "dataBinding": "/regional/chart"}}}, {"id": "reg-metrics", "component": {"Row": {"gap": 2, "children": {"explicitList": ["reg-m1", "reg-m2", "reg-m3", "reg-m4", "reg-m5", "reg-m6"]}}}}, {"id": "reg-m1", "component": {"Metric": {"label": "North America", "value": {"path": "/regional/na"}, "trend": "up"}}}, {"id": "reg-m2", "component": {"Metric": {"label": "Europe", "value": {"path": "/regional/eu"}, "trend": "up"}}}, {"id": "reg-m3", "component": {"Metric": {"label": "Asia Pacific", "value": {"path": "/regional/ap"}, "trend": "up"}}}, {"id": "reg-m4", "component": {"Metric": {"label": "Latin America", "value": {"path": "/regional/la"}, "trend": "neutral"}}}, {"id": "reg-m5", "component": {"Metric": {"label": "Middle East", "value": {"path": "/regional/me"}, "trend": "up"}}}, {"id": "reg-m6", "component": {"Metric": {"label": "Africa", "value": {"path": "/regional/af"}, "trend": "neutral"}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "regional", "contents": [{"key": "regional", "valueMap": [{"key": "chart", "valueList": [{"valueMap": [{"key": "val", "valueInt": 850}]}, {"valueMap": [{"key": "val", "valueInt": 720}]}, {"valueMap": [{"key": "val", "valueInt": 640}]}, {"valueMap": [{"key": "val", "valueInt": 380}]}, {"valueMap": [{"key": "val", "valueInt": 290}]}, {"valueMap": [{"key": "val", "valueInt": 180}]}]}, {"key": "na", "valueString": "$850K"}, {"key": "eu", "valueString": "$720K"}, {"key": "ap", "valueString": "$640K"}, {"key": "la", "valueString": "$380K"}, {"key": "me", "valueString": "$290K"}, {"key": "af", "valueString": "$180K"}]}]}}\n',
    '{"beginRendering": {"surfaceId": "regional", "root": "reg-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 4
    "✓ Regional data synchronized\n",
    "✓ Geographic distribution calculated\n",
    "Loading customer segmentation analysis...\n\n",

    // JSON SECTION 4 - CUSTOMER SEGMENTATION WITH COMPLEX TABLE
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "customer-seg", "components": [{"id": "cs-root", "component": {"Card": {"child": "cs-main"}}}, {"id": "cs-main", "component": {"Column": {"gap": 2, "children": {"explicitList": ["cs-header", "cs-desc", "cs-table-header", "cs-row1", "cs-row2", "cs-row3", "cs-row4", "cs-row5", "cs-row6", "cs-footer"]}}}}, {"id": "cs-header", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["cs-icon", "cs-title"]}}}}, {"id": "cs-icon", "component": {"Icon": {"name": "people"}}}, {"id": "cs-title", "component": {"Text": {"text": {"literalString": "Customer Segmentation Analysis"}, "usageHint": "h2"}}}, {"id": "cs-desc", "component": {"Text": {"text": {"literalString": "Behavioral clustering across 127,543 active users with ML-powered insights"}, "usageHint": "body"}}}, {"id": "cs-table-header", "component": {"Row": {"columnWidthMode": "custom", "alignment": "center", "borderStyle": "all", "borderColor": "zinc-700", "backgroundColor": "zinc-800", "textColor": "zinc-100", "columnConfig": [{"width": "2fr", "align": "left"}, {"width": "1fr", "align": "center"}, {"width": "1fr", "align": "center"}, {"width": "1fr", "align": "center"}, {"width": "1fr", "align": "center"}], "children": {"explicitList": ["th-seg", "th-users", "th-rev", "th-ltv", "th-churn"]}}}}, {"id": "th-seg", "component": {"Text": {"text": {"literalString": "SEGMENT"}, "usageHint": "caption"}}}, {"id": "th-users", "component": {"Text": {"text": {"literalString": "USERS"}, "usageHint": "caption"}}}, {"id": "th-rev", "component": {"Text": {"text": {"literalString": "REVENUE"}, "usageHint": "caption"}}}, {"id": "th-ltv", "component": {"Text": {"text": {"literalString": "AVG LTV"}, "usageHint": "caption"}}}, {"id": "th-churn", "component": {"Text": {"text": {"literalString": "CHURN"}, "usageHint": "caption"}}}, {"id": "cs-row1", "component": {"Row": {"columnWidthMode": "custom", "alignment": "center", "borderStyle": "all", "borderColor": "zinc-800", "backgroundColor": "emerald-900", "textColor": "white", "columnConfig": [{"width": "2fr", "align": "left"}, {"width": "1fr", "align": "center"}, {"width": "1fr", "align": "center"}, {"width": "1fr", "align": "center"}, {"width": "1fr", "align": "center"}], "children": {"explicitList": ["r1-seg", "r1-users", "r1-rev", "r1-ltv", "r1-churn"]}}}}, {"id": "r1-seg", "component": {"Text": {"text": {"path": "/segments/0/name"}}}}, {"id": "r1-users", "component": {"Text": {"text": {"path": "/segments/0/users"}}}}, {"id": "r1-rev", "component": {"Text": {"text": {"path": "/segments/0/revenue"}}}}, {"id": "r1-ltv", "component": {"Text": {"text": {"path": "/segments/0/ltv"}}}}, {"id": "r1-churn", "component": {"Text": {"text": {"path": "/segments/0/churn"}}}}, {"id": "cs-row2", "component": {"Row": {"columnWidthMode": "custom", "alignment": "center", "borderStyle": "all", "borderColor": "zinc-800", "backgroundColor": "blue-900", "textColor": "white", "columnConfig": [{"width": "2fr", "align": "left"}, {"width": "1fr", "align": "center"}, {"width": "1fr", "align": "center"}, {"width": "1fr", "align": "center"}, {"width": "1fr", "align": "center"}], "children": {"explicitList": ["r2-seg", "r2-users", "r2-rev", "r2-ltv", "r2-churn"]}}}}, {"id": "r2-seg", "component": {"Text": {"text": {"path": "/segments/1/name"}}}}, {"id": "r2-users", "component": {"Text": {"text": {"path": "/segments/1/users"}}}}, {"id": "r2-rev", "component": {"Text": {"text": {"path": "/segments/1/revenue"}}}}, {"id": "r2-ltv", "component": {"Text": {"text": {"path": "/segments/1/ltv"}}}}, {"id": "r2-churn", "component": {"Text": {"text": {"path": "/segments/1/churn"}}}}, {"id": "cs-row3", "component": {"Row": {"columnWidthMode": "custom", "alignment": "center", "borderStyle": "all", "borderColor": "zinc-800", "backgroundColor": "purple-900", "textColor": "white", "columnConfig": [{"width": "2fr", "align": "left"}, {"width": "1fr", "align": "center"}, {"width": "1fr", "align": "center"}, {"width": "1fr", "align": "center"}, {"width": "1fr", "align": "center"}], "children": {"explicitList": ["r3-seg", "r3-users", "r3-rev", "r3-ltv", "r3-churn"]}}}}, {"id": "r3-seg", "component": {"Text": {"text": {"path": "/segments/2/name"}}}}, {"id": "r3-users", "component": {"Text": {"text": {"path": "/segments/2/users"}}}}, {"id": "r3-rev", "component": {"Text": {"text": {"path": "/segments/2/revenue"}}}}, {"id": "r3-ltv", "component": {"Text": {"text": {"path": "/segments/2/ltv"}}}}, {"id": "r3-churn", "component": {"Text": {"text": {"path": "/segments/2/churn"}}}}, {"id": "cs-row4", "component": {"Row": {"columnWidthMode": "custom", "alignment": "center", "borderStyle": "all", "borderColor": "zinc-800", "backgroundColor": "amber-900", "textColor": "white", "columnConfig": [{"width": "2fr", "align": "left"}, {"width": "1fr", "align": "center"}, {"width": "1fr", "align": "center"}, {"width": "1fr", "align": "center"}, {"width": "1fr", "align": "center"}], "children": {"explicitList": ["r4-seg", "r4-users", "r4-rev", "r4-ltv", "r4-churn"]}}}}, {"id": "r4-seg", "component": {"Text": {"text": {"path": "/segments/3/name"}}}}, {"id": "r4-users", "component": {"Text": {"text": {"path": "/segments/3/users"}}}}, {"id": "r4-rev", "component": {"Text": {"text": {"path": "/segments/3/revenue"}}}}, {"id": "r4-ltv", "component": {"Text": {"text": {"path": "/segments/3/ltv"}}}}, {"id": "r4-churn", "component": {"Text": {"text": {"path": "/segments/3/churn"}}}}, {"id": "cs-row5", "component": {"Row": {"columnWidthMode": "custom", "alignment": "center", "borderStyle": "all", "borderColor": "zinc-800", "backgroundColor": "rose-900", "textColor": "white", "columnConfig": [{"width": "2fr", "align": "left"}, {"width": "1fr", "align": "center"}, {"width": "1fr", "align": "center"}, {"width": "1fr", "align": "center"}, {"width": "1fr", "align": "center"}], "children": {"explicitList": ["r5-seg", "r5-users", "r5-rev", "r5-ltv", "r5-churn"]}}}}, {"id": "r5-seg", "component": {"Text": {"text": {"path": "/segments/4/name"}}}}, {"id": "r5-users", "component": {"Text": {"text": {"path": "/segments/4/users"}}}}, {"id": "r5-rev", "component": {"Text": {"text": {"path": "/segments/4/revenue"}}}}, {"id": "r5-ltv", "component": {"Text": {"text": {"path": "/segments/4/ltv"}}}}, {"id": "r5-churn", "component": {"Text": {"text": {"path": "/segments/4/churn"}}}}, {"id": "cs-row6", "component": {"Row": {"columnWidthMode": "custom", "alignment": "center", "borderStyle": "all", "borderColor": "zinc-800", "columnConfig": [{"width": "2fr", "align": "left"}, {"width": "1fr", "align": "center"}, {"width": "1fr", "align": "center"}, {"width": "1fr", "align": "center"}, {"width": "1fr", "align": "center"}], "children": {"explicitList": ["r6-seg", "r6-users", "r6-rev", "r6-ltv", "r6-churn"]}}}}, {"id": "r6-seg", "component": {"Text": {"text": {"path": "/segments/5/name"}}}}, {"id": "r6-users", "component": {"Text": {"text": {"path": "/segments/5/users"}}}}, {"id": "r6-rev", "component": {"Text": {"text": {"path": "/segments/5/revenue"}}}}, {"id": "r6-ltv", "component": {"Text": {"text": {"path": "/segments/5/ltv"}}}}, {"id": "r6-churn", "component": {"Text": {"text": {"path": "/segments/5/churn"}}}}, {"id": "cs-footer", "component": {"Text": {"text": {"literalString": "ML Model: Random Forest Classifier | Accuracy: 94.2% | Last trained: 2026-02-04"}, "usageHint": "caption"}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "customer-seg", "contents": [{"key": "segments", "valueList": [{"valueMap": [{"key": "name", "valueString": "💎 Enterprise Champions"}, {"key": "users", "valueString": "2,847"}, {"key": "revenue", "valueString": "$1.2M"}, {"key": "ltv", "valueString": "$4,250"}, {"key": "churn", "valueString": "1.2%"}]}, {"valueMap": [{"key": "name", "valueString": "🚀 Growth Accelerators"}, {"key": "users", "valueString": "8,234"}, {"key": "revenue", "valueString": "$680K"}, {"key": "ltv", "valueString": "$825"}, {"key": "churn", "valueString": "3.5%"}]}, {"valueMap": [{"key": "name", "valueString": "⭐ Loyal Regulars"}, {"key": "users", "valueString": "24,567"}, {"key": "revenue", "valueString": "$420K"}, {"key": "ltv", "valueString": "$170"}, {"key": "churn", "valueString": "5.8%"}]}, {"valueMap": [{"key": "name", "valueString": "🌱 New Explorers"}, {"key": "users", "valueString": "45,123"}, {"key": "revenue", "valueString": "$95K"}, {"key": "ltv", "valueString": "$21"}, {"key": "churn", "valueString": "12.4%"}]}, {"valueMap": [{"key": "name", "valueString": "⚠️ At-Risk Users"}, {"key": "users", "valueString": "18,942"}, {"key": "revenue", "valueString": "$28K"}, {"key": "ltv", "valueString": "$15"}, {"key": "churn", "valueString": "28.7%"}]}, {"valueMap": [{"key": "name", "valueString": "💤 Dormant Accounts"}, {"key": "users", "valueString": "27,830"}, {"key": "revenue", "valueString": "$2K"}, {"key": "ltv", "valueString": "$7"}, {"key": "churn", "valueString": "67.3%"}]}]}]}}\n',
    '{"beginRendering": {"surfaceId": "customer-seg", "root": "cs-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 5
    "✓ Customer segmentation complete\n",
    "✓ ML model predictions generated\n",
    "Loading product performance analytics...\n\n",

    // JSON SECTION 5 - PRODUCT PERFORMANCE WITH CHARTS
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "products", "components": [{"id": "prod-root", "component": {"Card": {"child": "prod-main"}}}, {"id": "prod-main", "component": {"Column": {"gap": 3, "children": {"explicitList": ["prod-header", "prod-desc", "prod-chart", "prod-metrics", "prod-progress"]}}}}, {"id": "prod-header", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["prod-icon", "prod-title"]}}}}, {"id": "prod-icon", "component": {"Icon": {"name": "inventory"}}}, {"id": "prod-title", "component": {"Text": {"text": {"literalString": "Product Performance Dashboard"}, "usageHint": "h2"}}}, {"id": "prod-desc", "component": {"Text": {"text": {"literalString": "Sales velocity and inventory metrics across 12 product lines"}, "usageHint": "body"}}}, {"id": "prod-chart", "component": {"Chart": {"type": "bar", "dataBinding": "/products/sales"}}}, {"id": "prod-metrics", "component": {"Row": {"gap": 2, "children": {"explicitList": ["prod-m1", "prod-m2", "prod-m3", "prod-m4"]}}}}, {"id": "prod-m1", "component": {"Metric": {"label": "Total SKUs", "value": {"path": "/products/skus"}, "trend": "up"}}}, {"id": "prod-m2", "component": {"Metric": {"label": "Avg Margin", "value": {"path": "/products/margin"}, "trend": "up"}}}, {"id": "prod-m3", "component": {"Metric": {"label": "Inventory Turn", "value": {"path": "/products/turn"}, "trend": "neutral"}}}, {"id": "prod-m4", "component": {"Metric": {"label": "Out of Stock", "value": {"path": "/products/oos"}, "trend": "down"}}}, {"id": "prod-progress", "component": {"Column": {"gap": 1, "children": {"explicitList": ["prog-label1", "prog-bar1", "prog-label2", "prog-bar2", "prog-label3", "prog-bar3"]}}}}, {"id": "prog-label1", "component": {"Text": {"text": {"literalString": "Warehouse Capacity: 87%"}, "usageHint": "caption"}}}, {"id": "prog-bar1", "component": {"ProgressBar": {"value": {"path": "/products/warehouse"}}}}, {"id": "prog-label2", "component": {"Text": {"text": {"literalString": "Fulfillment Rate: 96%"}, "usageHint": "caption"}}}, {"id": "prog-bar2", "component": {"ProgressBar": {"value": {"path": "/products/fulfillment"}}}}, {"id": "prog-label3", "component": {"Text": {"text": {"literalString": "Quality Score: 98%"}, "usageHint": "caption"}}}, {"id": "prog-bar3", "component": {"ProgressBar": {"value": {"path": "/products/quality"}}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "products", "contents": [{"key": "products", "valueMap": [{"key": "sales", "valueList": [{"valueMap": [{"key": "val", "valueInt": 340}]}, {"valueMap": [{"key": "val", "valueInt": 280}]}, {"valueMap": [{"key": "val", "valueInt": 250}]}, {"valueMap": [{"key": "val", "valueInt": 220}]}, {"valueMap": [{"key": "val", "valueInt": 190}]}, {"valueMap": [{"key": "val", "valueInt": 160}]}]}, {"key": "skus", "valueString": "1,247"}, {"key": "margin", "valueString": "42.3%"}, {"key": "turn", "valueString": "8.2x"}, {"key": "oos", "valueString": "23"}, {"key": "warehouse", "valueInt": 87}, {"key": "fulfillment", "valueInt": 96}, {"key": "quality", "valueInt": 98}]}]}}\n',
    '{"beginRendering": {"surfaceId": "products", "root": "prod-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 6
    "✓ Product analytics loaded\n",
    "✓ Inventory levels synchronized\n",
    "Loading operational infrastructure monitoring...\n\n",

    // JSON SECTION 6 - INFRASTRUCTURE & SYSTEM HEALTH
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "infrastructure", "components": [{"id": "infra-root", "component": {"Card": {"child": "infra-main"}}}, {"id": "infra-main", "component": {"Column": {"gap": 3, "children": {"explicitList": ["infra-header", "infra-servers", "infra-services", "infra-alerts"]}}}}, {"id": "infra-header", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["infra-icon", "infra-title"]}}}}, {"id": "infra-icon", "component": {"Icon": {"name": "dns"}}}, {"id": "infra-title", "component": {"Text": {"text": {"literalString": "Infrastructure Health Monitor"}, "usageHint": "h2"}}}, {"id": "infra-servers", "component": {"Column": {"gap": 1, "children": {"explicitList": ["srv-title", "srv-row"]}}}}, {"id": "srv-title", "component": {"Text": {"text": {"literalString": "Server Clusters (24 nodes across 3 regions)"}, "usageHint": "h4"}}}, {"id": "srv-row", "component": {"Row": {"gap": 2, "children": {"explicitList": ["srv-m1", "srv-m2", "srv-m3", "srv-m4", "srv-m5"]}}}}, {"id": "srv-m1", "component": {"Metric": {"label": "US-East", "value": {"path": "/infra/us_east"}, "trend": "neutral"}}}, {"id": "srv-m2", "component": {"Metric": {"label": "US-West", "value": {"path": "/infra/us_west"}, "trend": "neutral"}}}, {"id": "srv-m3", "component": {"Metric": {"label": "EU-Central", "value": {"path": "/infra/eu"}, "trend": "neutral"}}}, {"id": "srv-m4", "component": {"Metric": {"label": "Asia-Pacific", "value": {"path": "/infra/ap"}, "trend": "up"}}}, {"id": "srv-m5", "component": {"Metric": {"label": "Latency Avg", "value": {"path": "/infra/latency"}, "trend": "down"}}}, {"id": "infra-services", "component": {"Column": {"gap": 1, "children": {"explicitList": ["svc-title", "svc-list"]}}}}, {"id": "svc-title", "component": {"Text": {"text": {"literalString": "Microservices Status (47 services)"}, "usageHint": "h4"}}}, {"id": "svc-list", "component": {"Column": {"gap": 1, "children": {"explicitList": ["svc1", "svc2", "svc3", "svc4", "svc5", "svc6"]}}}}, {"id": "svc1", "component": {"Row": {"gap": 1, "children": {"explicitList": ["svc1-icon", "svc1-txt"]}}}}, {"id": "svc1-icon", "component": {"Text": {"text": {"literalString": "✅"}, "usageHint": "body"}}}, {"id": "svc1-txt", "component": {"Text": {"text": {"literalString": "Authentication Service - Healthy (99.98% uptime)"}, "usageHint": "body"}}}, {"id": "svc2", "component": {"Row": {"gap": 1, "children": {"explicitList": ["svc2-icon", "svc2-txt"]}}}}, {"id": "svc2-icon", "component": {"Text": {"text": {"literalString": "✅"}, "usageHint": "body"}}}, {"id": "svc2-txt", "component": {"Text": {"text": {"literalString": "Payment Gateway - Healthy (99.95% uptime)"}, "usageHint": "body"}}}, {"id": "svc3", "component": {"Row": {"gap": 1, "children": {"explicitList": ["svc3-icon", "svc3-txt"]}}}}, {"id": "svc3-icon", "component": {"Text": {"text": {"literalString": "✅"}, "usageHint": "body"}}}, {"id": "svc3-txt", "component": {"Text": {"text": {"literalString": "Data Pipeline - Healthy (99.92% uptime)"}, "usageHint": "body"}}}, {"id": "svc4", "component": {"Row": {"gap": 1, "children": {"explicitList": ["svc4-icon", "svc4-txt"]}}}}, {"id": "svc4-icon", "component": {"Text": {"text": {"literalString": "⚠️"}, "usageHint": "body"}}}, {"id": "svc4-txt", "component": {"Text": {"text": {"literalString": "Email Service - Degraded (High latency detected)"}, "usageHint": "body"}}}, {"id": "svc5", "component": {"Row": {"gap": 1, "children": {"explicitList": ["svc5-icon", "svc5-txt"]}}}}, {"id": "svc5-icon", "component": {"Text": {"text": {"literalString": "✅"}, "usageHint": "body"}}}, {"id": "svc5-txt", "component": {"Text": {"text": {"literalString": "Search Engine - Healthy (99.99% uptime)"}, "usageHint": "body"}}}, {"id": "svc6", "component": {"Row": {"gap": 1, "children": {"explicitList": ["svc6-icon", "svc6-txt"]}}}}, {"id": "svc6-icon", "component": {"Text": {"text": {"literalString": "✅"}, "usageHint": "body"}}}, {"id": "svc6-txt", "component": {"Text": {"text": {"literalString": "Analytics Engine - Healthy (99.94% uptime)"}, "usageHint": "body"}}}, {"id": "infra-alerts", "component": {"Column": {"gap": 1, "children": {"explicitList": ["alert-title", "alert1", "alert2"]}}}}, {"id": "alert-title", "component": {"Text": {"text": {"literalString": "Recent Alerts"}, "usageHint": "h4"}}}, {"id": "alert1", "component": {"Text": {"text": {"literalString": "⚠️ WARNING: Email service latency increased to 450ms (threshold: 200ms)"}, "usageHint": "caption"}}}, {"id": "alert2", "component": {"Text": {"text": {"literalString": "ℹ️ INFO: Scheduled maintenance for US-West cluster on 2026-02-07 02:00 UTC"}, "usageHint": "caption"}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "infrastructure", "contents": [{"key": "infra", "valueMap": [{"key": "us_east", "valueString": "8/8 ✓"}, {"key": "us_west", "valueString": "8/8 ✓"}, {"key": "eu", "valueString": "6/6 ✓"}, {"key": "ap", "valueString": "2/2 ✓"}, {"key": "latency", "valueString": "38ms"}]}]}}\n',
    '{"beginRendering": {"surfaceId": "infrastructure", "root": "infra-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 7
    "✓ Infrastructure monitoring active\n",
    "✓ All critical services operational\n",
    "⚠️ 1 warning detected - Email service latency elevated\n",
    "Loading financial summary and forecasting...\n\n",

    // JSON SECTION 7 - FINANCIAL SUMMARY WITH BUTTONS
    "---a2ui_JSON---\n",
    '{"surfaceUpdate": {"surfaceId": "financial", "components": [{"id": "fin-root", "component": {"Card": {"child": "fin-main"}}}, {"id": "fin-main", "component": {"Column": {"gap": 3, "children": {"explicitList": ["fin-header", "fin-summary", "fin-chart", "fin-forecast", "fin-actions"]}}}}, {"id": "fin-header", "component": {"Row": {"alignment": "center", "children": {"explicitList": ["fin-icon", "fin-title"]}}}}, {"id": "fin-icon", "component": {"Icon": {"name": "account_balance"}}}, {"id": "fin-title", "component": {"Text": {"text": {"literalString": "Financial Performance & Forecasting"}, "usageHint": "h2"}}}, {"id": "fin-summary", "component": {"Row": {"gap": 2, "children": {"explicitList": ["fin-m1", "fin-m2", "fin-m3", "fin-m4", "fin-m5"]}}}}, {"id": "fin-m1", "component": {"Metric": {"label": "MRR", "value": {"path": "/financial/mrr"}, "trend": "up"}}}, {"id": "fin-m2", "component": {"Metric": {"label": "ARR", "value": {"path": "/financial/arr"}, "trend": "up"}}}, {"id": "fin-m3", "component": {"Metric": {"label": "Gross Margin", "value": {"path": "/financial/margin"}, "trend": "up"}}}, {"id": "fin-m4", "component": {"Metric": {"label": "Burn Rate", "value": {"path": "/financial/burn"}, "trend": "down"}}}, {"id": "fin-m5", "component": {"Metric": {"label": "Runway", "value": {"path": "/financial/runway"}, "trend": "neutral"}}}, {"id": "fin-chart", "component": {"Chart": {"type": "bar", "dataBinding": "/financial/monthly"}}}, {"id": "fin-forecast", "component": {"Column": {"gap": 1, "children": {"explicitList": ["fc-title", "fc-text1", "fc-text2", "fc-text3"]}}}}, {"id": "fc-title", "component": {"Text": {"text": {"literalString": "AI-Powered Forecast (Next Quarter)"}, "usageHint": "h4"}}}, {"id": "fc-text1", "component": {"Text": {"text": {"literalString": "📈 Projected Revenue: $3.2M (+33% QoQ)"}, "usageHint": "body"}}}, {"id": "fc-text2", "component": {"Text": {"text": {"literalString": "👥 Expected New Users: 42,000 (+28% QoQ)"}, "usageHint": "body"}}}, {"id": "fc-text3", "component": {"Text": {"text": {"literalString": "💰 Predicted Churn: 4.2% (-0.8% improvement)"}, "usageHint": "body"}}}, {"id": "fin-actions", "component": {"Row": {"gap": 2, "children": {"explicitList": ["btn1", "btn2", "btn3"]}}}}, {"id": "btn1", "component": {"Button": {"child": "btn1-txt", "action": {"name": "export_report"}}}}, {"id": "btn1-txt", "component": {"Text": {"text": {"literalString": "📊 Export Report"}}}}, {"id": "btn2", "component": {"Button": {"child": "btn2-txt", "action": {"name": "view_details"}}}}, {"id": "btn2-txt", "component": {"Text": {"text": {"literalString": "🔍 View Details"}}}}, {"id": "btn3", "component": {"Button": {"child": "btn3-txt", "action": {"name": "schedule_review"}}}}, {"id": "btn3-txt", "component": {"Text": {"text": {"literalString": "📅 Schedule Review"}}}}]}}\n',
    '{"dataModelUpdate": {"surfaceId": "financial", "contents": [{"key": "financial", "valueMap": [{"key": "mrr", "valueString": "$245K"}, {"key": "arr", "valueString": "$2.94M"}, {"key": "margin", "valueString": "68.5%"}, {"key": "burn", "valueString": "$180K/mo"}, {"key": "runway", "valueString": "18 months"}, {"key": "monthly", "valueList": [{"valueMap": [{"key": "val", "valueInt": 180}]}, {"valueMap": [{"key": "val", "valueInt": 195}]}, {"valueMap": [{"key": "val", "valueInt": 210}]}, {"valueMap": [{"key": "val", "valueInt": 225}]}, {"valueMap": [{"key": "val", "valueInt": 245}]}, {"valueMap": [{"key": "val", "valueInt": 268}]}]}]}]}}\n',
    '{"beginRendering": {"surfaceId": "financial", "root": "fin-root"}}\n',
    "---a2ui_JSON---\n",

    // TEXT SECTION 8 - FINAL SUMMARY
    "✓ Financial data synchronized\n",
    "✓ Forecasting models updated\n",
    "✓ All dashboards rendered successfully\n\n",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n",
    "🎯 ENTERPRISE ANALYTICS PLATFORM FULLY LOADED\n",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n",
    "📊 Summary:\n",
    "  • 7 Interactive Dashboards Rendered\n",
    "  • 47 Data Sources Connected\n",
    "  • 127,543 Active Users Tracked\n",
    "  • $2.4M Total Revenue (Current Period)\n",
    "  • 10 KPI Metrics Monitored\n",
    "  • 6 Customer Segments Analyzed\n",
    "  • 6 Regional Markets Tracked\n",
    "  • 1,247 Product SKUs Managed\n",
    "  • 24 Server Nodes Operational\n",
    "  • 47 Microservices Running\n",
    "  • 1 Service Alert (Email latency)\n",
    "  • 18 Months Runway Remaining\n\n",
    "✨ All A2UI components successfully demonstrated:\n",
    "   ✓ Card, Column, Row layouts\n",
    "   ✓ Text with multiple usage hints (h1, h2, h3, h4, body, caption)\n",
    "   ✓ Icon components\n",
    "   ✓ Metric components with trends\n",
    "   ✓ Chart components (bar charts)\n",
    "   ✓ ProgressBar components\n",
    "   ✓ Button components with actions\n",
    "   ✓ Complex table layouts with custom columns\n",
    "   ✓ Nested data structures (valueMap, valueList)\n",
    "   ✓ Dynamic data binding\n",
    "   ✓ Custom styling (colors, borders, backgrounds)\n\n",
    "🚀 System Status: OPERATIONAL\n",
    "⏰ Last Updated: 2026-02-05 14:32:18 UTC\n",
    "👤 Current User: admin@enterprise.com (Super Admin)\n\n",
    "Ready for user interaction...\n",
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
        {{ isStreaming ? "Linking..." : "Initialize" }}
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
            AI
          </div>

          <div class="flex-1 space-y-6 w-full min-w-0">
            <!-- Render timeline items in order -->
            <template v-for="item in timeline" :key="item.id">
              <!-- Text item -->
              <div v-if="item.type === 'text'" class="text-zinc-400 text-[15px] leading-relaxed max-w-3xl" v-html="item.content
                .replace(
                  /\*\*(.*?)\*\*/g,
                  '<span class=\'text-zinc-200 font-medium\'>$1</span>'
                )
                .replace(/\n/g, '<br>')
                "></div>

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
              {{ textBuffer
              }}<span class="inline-block w-1.5 h-4 bg-zinc-500 ml-1 align-middle animate-pulse"></span>
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