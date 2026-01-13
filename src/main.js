import { createApp } from 'vue'
import App from './App.vue'
import "./App.css"

// Check URL for ?examples to show example viewer
const urlParams = new URLSearchParams(window.location.search);

// Mount appropriate component
createApp(App).mount('#app')
