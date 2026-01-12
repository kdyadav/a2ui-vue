// useA2UIParser.js
import { ref, reactive } from 'vue';

/**
 * Extract value from A2UI value types (spec-compliant)
 * Handles: valueString, valueNumber, valueBool, valueNull, valueList, valueMap
 */
function extractValue(item) {
  if ('valueString' in item) return item.valueString;
  if ('valueNumber' in item) return item.valueNumber;
  if ('valueBool' in item) return item.valueBool;
  if ('valueNull' in item) return null;

  if ('valueList' in item) {
    return item.valueList.map(extractValue);
  }

  if ('valueMap' in item) {
    const obj = {};
    item.valueMap.forEach(entry => {
      obj[entry.key] = extractValue(entry);
    });
    return obj;
  }

  return undefined;
}

export function useA2UIParser() {
  // Modes: TEXT (streaming chat) vs JSON (streaming UI)
  const modes = { TEXT: 'TEXT', JSON: 'JSON' };
  const currentMode = ref(modes.TEXT);
  const DELIMITER = '---a2ui_JSON---';

  // State
  const textBuffer = ref('');       // Current active text block
  const jsonBuffer = ref('');       // Buffer for incomplete JSON lines
  const textHistory = ref([]);      // Stores text blocks that came before UI

  // The Reactive UI Store
  // Structure: { [surfaceId]: { components: {}, data: {}, root: null, isLive: false } }
  const surfaces = reactive({});

  const processToken = (token) => {
    if (currentMode.value === modes.TEXT) {
      textBuffer.value += token;

      // Check for the Magic Switch
      if (textBuffer.value.includes(DELIMITER)) {
        const parts = textBuffer.value.split(DELIMITER);

        // Archive the text part
        if (parts[0]) textHistory.value.push(parts[0]);
        textBuffer.value = ''; // Clear active text

        // Switch to JSON Mode
        currentMode.value = modes.JSON;

        // If there were tokens *after* the delimiter in this chunk, process them
        if (parts[1]) handleJsonToken(parts[1]);
      }
    } else {
      handleJsonToken(token);
    }
  };

  const handleJsonToken = (token) => {
    jsonBuffer.value += token;

    // A2UI Standard: Newline separates messages
    if (jsonBuffer.value.includes('\n')) {
      const lines = jsonBuffer.value.split('\n');

      // The last item is either empty string (clean split) or a partial next line
      jsonBuffer.value = lines.pop();

      lines.forEach(line => {
        if (!line.trim()) return;
        try {
          const msg = JSON.parse(line);

          // Validate message structure (A2UI spec compliance)
          const messageType = Object.keys(msg)[0];
          const validTypes = ['surfaceUpdate', 'dataModelUpdate', 'beginRendering', 'deleteSurface'];

          if (!validTypes.includes(messageType)) {
            console.error(`[A2UI] Invalid message type: ${messageType}`);
            return;
          }

          if (!msg[messageType]?.surfaceId) {
            console.error(`[A2UI] Missing surfaceId in ${messageType}`);
            return;
          }

          dispatchMessage(msg);
        } catch (e) {
          console.error("[A2UI] Parse error:", e, "Line:", line);
        }
      });
    }
  };

  const dispatchMessage = (msg) => {
    // Extract the wrapper key (surfaceUpdate, dataModelUpdate, etc.)
    const type = Object.keys(msg)[0];
    const payload = msg[type];
    const { surfaceId } = payload;

    // Init surface if missing
    if (!surfaces[surfaceId]) {
      surfaces[surfaceId] = { components: {}, data: {}, root: null, isLive: false };
    }
    const s = surfaces[surfaceId];

    switch (type) {
      case 'surfaceUpdate':
        payload.components.forEach(c => s.components[c.id] = c.component);
        break;

      case 'dataModelUpdate':
        // Spec-compliant value extraction
        payload.contents.forEach(item => {
          const val = extractValue(item);
          s.data[item.key] = val;
        });
        break;

      case 'beginRendering':
        s.root = payload.root;
        s.isLive = true;
        break;

      case 'deleteSurface':
        delete surfaces[surfaceId];
        break;
    }
  };

  // Helper to update data from Inputs (Two-Way Binding)
  // Uses JSON Pointer format (RFC 6901)
  const updateDataPath = (surfaceId, path, value) => {
    if (!path || !surfaces[surfaceId]?.data) return;

    // JSON Pointer: path starts with '/'
    if (!path.startsWith('/')) {
      console.warn('[A2UI] Invalid path format, must start with /:', path);
      return;
    }

    const tokens = path.slice(1).split('/').map(token =>
      token.replace(/~1/g, '/').replace(/~0/g, '~')
    );

    // Navigate to parent and set value
    let current = surfaces[surfaceId].data;
    for (let i = 0; i < tokens.length - 1; i++) {
      const token = tokens[i];
      if (!(token in current)) {
        current[token] = {};
      }
      current = current[token];
    }

    const lastToken = tokens[tokens.length - 1];
    current[lastToken] = value;
  };

  return {
    textHistory,
    textBuffer,
    currentMode,
    surfaces,
    processToken,
    updateDataPath
  };
}