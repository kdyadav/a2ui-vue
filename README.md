# A2UI Vue Renderer

A **spec-compliant Vue 3 renderer** for the [A2UI protocol](https://a2ui.org/) - enabling AI agents to generate rich, interactive user interfaces that render natively in Vue applications.

## 🎯 What is A2UI?

A2UI (Agent to UI) is a protocol that allows AI agents to safely send rich UIs across trust boundaries. Instead of text-only responses or risky code execution, agents send declarative component descriptions that clients render using their own native widgets.

**Key Features:**

- 🔒 **Secure by Design** - Declarative data format, not executable code
- 🤖 **LLM-Friendly** - Flat, streaming JSON structure for easy generation
- 🎨 **Framework-Agnostic** - Same agent response works everywhere
- ⚡ **Progressive Rendering** - Stream UI updates in real-time

## ✨ Features

This Vue renderer implements **A2UI v0.8** with full spec compliance:

- ✅ **JSON Pointer path resolution** (RFC 6901)
- ✅ **Complete value type support** (valueString, valueNumber, valueBool, valueNull, valueList, valueMap)
- ✅ **Dynamic children** with data binding
- ✅ **Two-way data binding** for inputs
- ✅ **Proper action handling** with full payload structure
- ✅ **Enhanced error handling** and validation
- ✅ **Surface lifecycle management** (create, update, delete)
- ✅ **Streaming parser** with TEXT/JSON mode switching

## 🚀 Quick Start

### Installation

```bash
npm install
# or
pnpm install
```

### Run the Demo

```bash
npm run dev
# or
pnpm dev
```

Open http://localhost:5173 and click **"RUN MEGA-SIMULATION"** to see the A2UI streaming parser in action!

### What You'll See

The demo simulates an AI agent ("NaaviX Home") responding to "What's the status of the house?" with:

1. **Rich text response** - Markdown-formatted chat message
2. **Mode switch** - Transition from TEXT to JSON mode via `---a2ui_JSON---` delimiter
3. **6 dynamic surfaces** streaming in:
   - 💡 Lights control
   - 🎥 Security camera
   - ☁️ Weather widget
   - ✅ Task list
   - 🎵 Music player
   - 💤 Sleep quality chart

## 📖 Usage

### Basic Integration

```vue
<script setup>
import { ref } from "vue";
import A2UISurface from "./A2UISurface.vue";

const surfaces = ref({
  main: {
    components: {
      /* component definitions */
    },
    data: {
      /* application data */
    },
    root: "root-component-id",
    isLive: true,
  },
});

const handleAction = (action) => {
  console.log("Action:", action);
  // Send action to your AI agent
};

const handleDataUpdate = ({ path, value, surfaceId }) => {
  console.log("Data updated:", path, value);
  // Update your data model
};
</script>

<template>
  <A2UISurface
    :componentId="surfaces.main.root"
    :components="surfaces.main.components"
    :data="surfaces.main.data"
    :surfaceId="'main'"
    @action="handleAction"
    @dataUpdate="handleDataUpdate"
  />
</template>
```

### Using the Parser

```javascript
import { useA2UIParser } from "./useA2UIParser.js";

const { surfaces, processToken } = useA2UIParser();

// Stream tokens from your AI agent
const streamResponse = async (response) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    processToken(chunk);
  }
};
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        AI Agent                              │
│  (Generates A2UI messages: surfaceUpdate, dataModelUpdate)   │
└────────────────────────┬────────────────────────────────────┘
                         │ Streaming JSON
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   useA2UIParser.js                           │
│  • Switches between TEXT/JSON modes                          │
│  • Parses newline-delimited JSON                             │
│  • Validates messages                                        │
│  • Manages surface state                                     │
└────────────────────────┬────────────────────────────────────┘
                         │ Reactive surfaces
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   A2UISurface.vue                            │
│  • Renders components recursively                            │
│  • Resolves JSON Pointer paths                               │
│  • Handles two-way data binding                              │
│  • Emits actions to parent                                   │
└─────────────────────────────────────────────────────────────┘
```

## 📚 Documentation

- **[IMPROVEMENTS.md](./IMPROVEMENTS.md)** - Detailed changelog of spec compliance improvements
- **[TODO.md](./TODO.md)** - Roadmap and future enhancements
- **[A2UI Official Docs](https://a2ui.org/)** - Protocol specification

## 🛠️ Development

### Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

### Recommended Browser Extensions

- [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- [Custom Object Formatters](http://bit.ly/object-formatters)

### Build for Production

```bash
npm run build
# or
pnpm build
```

## 🤝 Contributing

Contributions are welcome! Please see [TODO.md](./TODO.md) for areas that need work.

## 📄 License

Apache 2.0 (same as A2UI protocol)

## 🙏 Acknowledgments

- **Google** - For creating the A2UI protocol
- **CopilotKit** - For contributions to the A2UI ecosystem
- **A2UI Community** - For feedback and collaboration
