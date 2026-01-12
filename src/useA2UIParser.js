// useA2UIParser.js
import { ref, reactive } from 'vue';

export function useA2UIParser() {
  const modes = { TEXT: 'TEXT', JSON: 'JSON' };
  const currentMode = ref(modes.TEXT);
  
  // Buffers
  const textResponse = ref('');
  const jsonBuffer = ref('');
  
  // A2UI Surface States
  const surfaces = reactive({}); // Stores { components: [], data: {}, isLive: false, root: null }

  const DELIMITER = '---a2ui_JSON---';

  const processToken = (token) => {
    if (currentMode.value === modes.TEXT) {
      const fullText = textResponse.value + token;
      if (fullText.includes(DELIMITER)) {
        const parts = fullText.split(DELIMITER);
        textResponse.value = parts[0]; // Keep text before delimiter
        currentMode.value = modes.JSON;
        if (parts[1]) handleJsonToken(parts[1]);
      } else {
        textResponse.value += token;
      }
    } else {
      handleJsonToken(token);
    }
  };

  const handleJsonToken = (token) => {
    jsonBuffer.value += token;
    
    // Split by newline for JSONL processing
    if (jsonBuffer.value.includes('\n')) {
      const lines = jsonBuffer.value.split('\n');
      // Keep the last partial line in the buffer
      jsonBuffer.value = lines.pop(); 

      lines.forEach(line => {
        if (line.trim()) {
          try {
            const message = JSON.parse(line);
            dispatchMessage(message);
          } catch (e) {
            console.error("Malformed A2UI JSON Line:", line, e);
          }
        }
      });
    }
  };

  const dispatchMessage = (msg) => {
    const key = Object.keys(msg)[0];
    const payload = msg[key];
    const { surfaceId } = payload;

    if (!surfaces[surfaceId]) {
      surfaces[surfaceId] = { components: {}, data: {}, isLive: false, root: null };
    }

    const s = surfaces[surfaceId];

    switch (key) {
      case 'surfaceUpdate':
        payload.components.forEach(c => s.components[c.id] = c.component);
        break;
      case 'dataModelUpdate':
        payload.contents.forEach(d => s.data[d.key] = d.valueList || d.valueString || d.valueMap);
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

  return { textResponse, surfaces, processToken, currentMode };
}