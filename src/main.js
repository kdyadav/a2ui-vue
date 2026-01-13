import { createApp } from 'vue'
import App from './App.vue'
import ExampleViewer from './examples/ExampleViewer.vue'
import "./App.css"

// Check URL for ?examples to show example viewer
const urlParams = new URLSearchParams(window.location.search);
const showExamples = urlParams.has('examples');

// Mount appropriate component
const RootComponent = showExamples ? ExampleViewer : App;
createApp(RootComponent).mount('#app')
