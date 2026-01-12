// useA2UIParser.js
import { ref, reactive } from 'vue';

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
          dispatchMessage(JSON.parse(line));
        } catch (e) {
          console.warn("A2UI Parse Error (skipping line):", e);
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
        payload.contents.forEach(item => {
          // Flatten the A2UI value types into standard JS primitives
          let val = item.valueString || item.valueNumber || item.valueBool || item.valueList || item.valueMap;
          
          // Deep merge logic for arrays (simple replacement for this demo)
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
  const updateDataPath = (surfaceId, path, value) => {
    if (!path) return;
    const parts = path.split('/').filter(p => p);
    const key = parts[0]; 
    // Simplified: In a real app, use lodash.set for deep nesting
    if (surfaces[surfaceId]?.data) {
      surfaces[surfaceId].data[key] = value; 
    }
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