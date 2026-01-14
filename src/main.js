import { createApp } from 'vue'
import App from './App.vue'
import GeminiSimulation from './simple-a2ui/GeminiSimulation.vue';
import "./App.css"

// Check URL for ?examples to show example viewer
const urlParams = new URLSearchParams(window.location.search);
console.log(urlParams.has("simple"))
const rootComponent = urlParams.get("simple") ? simpleA2UI : App;
// Mount appropriate component
createApp(GeminiSimulation).mount('#app')
