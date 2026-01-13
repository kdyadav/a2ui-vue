<script setup>
/**
 * Nested Data Example - Shows complex data binding with nested objects
 */
import { reactive } from 'vue';
import A2UISurface from '../A2UISurface.vue';

const data = reactive({
  user: {
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      age: 28
    },
    preferences: {
      darkMode: true,
      fontSize: 16,
      language: 'en'
    },
    address: {
      street: '123 Main St',
      city: 'San Francisco',
      zip: '94102'
    }
  }
});

const components = {
  'root': { Column: { children: { explicitList: ['title', 'profile-card', 'prefs-card', 'address-card', 'summary'] } } },
  
  // Title
  'title': { Text: { text: { literalString: 'Nested Data Binding Example' }, usageHint: 'h1' } },
  
  // Profile Card
  'profile-card': { Card: { child: 'profile-content' } },
  'profile-content': { Column: { children: { explicitList: ['profile-title', 'profile-divider', 'profile-row1', 'profile-row2'] } } },
  'profile-title': { Text: { text: { literalString: '👤 Profile' }, usageHint: 'caption' } },
  'profile-divider': { Divider: {} },
  'profile-row1': { Row: { children: { explicitList: ['first-name', 'last-name'] } } },
  'first-name': { TextField: { label: 'First Name', text: { path: '/user/profile/firstName' } } },
  'last-name': { TextField: { label: 'Last Name', text: { path: '/user/profile/lastName' } } },
  'profile-row2': { Slider: { label: 'Age', minValue: 18, maxValue: 100, value: { path: '/user/profile/age' } } },
  
  // Preferences Card
  'prefs-card': { Card: { child: 'prefs-content' } },
  'prefs-content': { Column: { children: { explicitList: ['prefs-title', 'prefs-divider', 'dark-mode', 'font-size', 'language'] } } },
  'prefs-title': { Text: { text: { literalString: '⚙️ Preferences' }, usageHint: 'caption' } },
  'prefs-divider': { Divider: {} },
  'dark-mode': { Checkbox: { label: 'Dark Mode', value: { path: '/user/preferences/darkMode' } } },
  'font-size': { Slider: { label: 'Font Size (px)', minValue: 12, maxValue: 24, value: { path: '/user/preferences/fontSize' } } },
  'language': { MultipleChoice: { description: 'Language', options: [
    { value: 'en', label: { literalString: 'English' } },
    { value: 'es', label: { literalString: 'Spanish' } },
    { value: 'fr', label: { literalString: 'French' } }
  ], selections: { path: '/user/preferences/language' } } },
  
  // Address Card
  'address-card': { Card: { child: 'address-content' } },
  'address-content': { Column: { children: { explicitList: ['address-title', 'address-divider', 'street', 'city-zip'] } } },
  'address-title': { Text: { text: { literalString: '📍 Address' }, usageHint: 'caption' } },
  'address-divider': { Divider: {} },
  'street': { TextField: { label: 'Street', text: { path: '/user/address/street' } } },
  'city-zip': { Row: { children: { explicitList: ['city', 'zip'] } } },
  'city': { TextField: { label: 'City', text: { path: '/user/address/city' } } },
  'zip': { TextField: { label: 'ZIP', text: { path: '/user/address/zip' } } },
  
  // Summary (displays nested data)
  'summary': { Card: { child: 'summary-content' } },
  'summary-content': { Column: { children: { explicitList: ['summary-title', 'summary-name', 'summary-location'] } } },
  'summary-title': { Text: { text: { literalString: '📋 Summary' }, usageHint: 'caption' } },
  'summary-name': { Row: { children: { explicitList: ['summary-label1', 'summary-firstname', 'summary-lastname'] } } },
  'summary-label1': { Text: { text: { literalString: 'Name:' } } },
  'summary-firstname': { Text: { text: { path: '/user/profile/firstName' } } },
  'summary-lastname': { Text: { text: { path: '/user/profile/lastName' } } },
  'summary-location': { Row: { children: { explicitList: ['summary-label2', 'summary-city'] } } },
  'summary-label2': { Text: { text: { literalString: 'City:' } } },
  'summary-city': { Text: { text: { path: '/user/address/city' } } }
};

const handleDataUpdate = ({ path, value }) => {
  const tokens = path.slice(1).split('/');
  let current = data;
  for (let i = 0; i < tokens.length - 1; i++) {
    current = current[tokens[i]];
  }
  current[tokens[tokens.length - 1]] = value;
};
</script>

<template>
  <div class="nested-example">
    <A2UISurface componentId="root" :components="components" :data="data" surfaceId="nested"
      @dataUpdate="handleDataUpdate" />
    <details class="debug">
      <summary>View Raw Data</summary>
      <pre>{{ JSON.stringify(data, null, 2) }}</pre>
    </details>
  </div>
</template>

<style scoped>
.nested-example { max-width: 600px; margin: 2rem auto; padding: 1rem; }
.debug { margin-top: 1.5rem; padding: 1rem; background: #1f2937; border-radius: 0.5rem; }
.debug summary { color: #9ca3af; cursor: pointer; font-size: 0.875rem; }
.debug pre { color: #10b981; font-size: 0.75rem; margin-top: 0.5rem; overflow-x: auto; }
</style>

