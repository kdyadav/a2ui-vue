<script setup>
/**
 * Settings Panel Example - Tabbed settings with various input types
 */
import { reactive } from 'vue';
import A2UISurface from '../A2UISurface.vue';

const settings = reactive({
  account: { email: 'user@example.com', username: 'johndoe' },
  appearance: { theme: 'dark', fontSize: 14, compact: false },
  notifications: { email: true, push: true, sms: false, frequency: 'daily' },
  privacy: { profilePublic: false, showEmail: false, analytics: true }
});

const components = {
  'root': { Card: { child: 'main-col' } },
  'main-col': { Column: { children: { explicitList: ['header', 'tabs'] } } },
  
  // Header
  'header': { Row: { alignment: 'center', children: { explicitList: ['settings-icon', 'settings-title'] } } },
  'settings-icon': { Icon: { name: 'settings' } },
  'settings-title': { Text: { text: { literalString: 'Settings' }, usageHint: 'h1' } },
  
  // Tabs
  'tabs': { Tabs: { tabItems: [
    { title: { literalString: '👤 Account' }, child: 'account-tab' },
    { title: { literalString: '🎨 Appearance' }, child: 'appearance-tab' },
    { title: { literalString: '🔔 Notifications' }, child: 'notifications-tab' },
    { title: { literalString: '🔒 Privacy' }, child: 'privacy-tab' }
  ] } },
  
  // Account Tab
  'account-tab': { Column: { children: { explicitList: ['account-email', 'account-username', 'account-actions'] } } },
  'account-email': { TextField: { label: 'Email', text: { path: '/account/email' } } },
  'account-username': { TextField: { label: 'Username', text: { path: '/account/username' } } },
  'account-actions': { Row: { children: { explicitList: ['change-pw-btn', 'delete-btn'] } } },
  'change-pw-btn': { Button: { child: 'change-pw-text', action: { name: 'changePassword' }, ariaLabel: 'Change password' } },
  'change-pw-text': { Text: { text: { literalString: 'Change Password' } } },
  'delete-btn': { Button: { child: 'delete-text', action: { name: 'deleteAccount' }, ariaLabel: 'Delete account' } },
  'delete-text': { Text: { text: { literalString: 'Delete Account' } } },
  
  // Appearance Tab
  'appearance-tab': { Column: { children: { explicitList: ['theme-select', 'font-slider', 'compact-check'] } } },
  'theme-select': { MultipleChoice: { description: 'Theme', options: [
    { value: 'light', label: { literalString: '☀️ Light' } },
    { value: 'dark', label: { literalString: '🌙 Dark' } },
    { value: 'system', label: { literalString: '💻 System' } }
  ], selections: { path: '/appearance/theme' } } },
  'font-slider': { Slider: { label: 'Font Size', minValue: 10, maxValue: 24, value: { path: '/appearance/fontSize' } } },
  'compact-check': { Checkbox: { label: 'Compact Mode', value: { path: '/appearance/compact' } } },
  
  // Notifications Tab
  'notifications-tab': { Column: { children: { explicitList: ['notif-email', 'notif-push', 'notif-sms', 'notif-freq'] } } },
  'notif-email': { Checkbox: { label: 'Email notifications', value: { path: '/notifications/email' } } },
  'notif-push': { Checkbox: { label: 'Push notifications', value: { path: '/notifications/push' } } },
  'notif-sms': { Checkbox: { label: 'SMS notifications', value: { path: '/notifications/sms' } } },
  'notif-freq': { MultipleChoice: { description: 'Digest Frequency', options: [
    { value: 'realtime', label: { literalString: 'Real-time' } },
    { value: 'daily', label: { literalString: 'Daily' } },
    { value: 'weekly', label: { literalString: 'Weekly' } }
  ], selections: { path: '/notifications/frequency' } } },
  
  // Privacy Tab
  'privacy-tab': { Column: { children: { explicitList: ['privacy-profile', 'privacy-email', 'privacy-analytics', 'privacy-export'] } } },
  'privacy-profile': { Checkbox: { label: 'Public profile', value: { path: '/privacy/profilePublic' } } },
  'privacy-email': { Checkbox: { label: 'Show email on profile', value: { path: '/privacy/showEmail' } } },
  'privacy-analytics': { Checkbox: { label: 'Help improve with analytics', value: { path: '/privacy/analytics' } } },
  'privacy-export': { Button: { child: 'export-content', action: { name: 'exportData' }, ariaLabel: 'Export data' } },
  'export-content': { Row: { alignment: 'center', children: { explicitList: ['export-icon', 'export-text'] } } },
  'export-icon': { Icon: { name: 'download' } },
  'export-text': { Text: { text: { literalString: 'Export My Data' } } }
};

const handleAction = (action) => {
  console.log('[Settings] Action:', action);
  const messages = {
    changePassword: 'Opening password change dialog...',
    deleteAccount: 'Are you sure you want to delete your account?',
    exportData: 'Preparing data export...'
  };
  alert(messages[action.name] || `Action: ${action.name}`);
};

const handleDataUpdate = ({ path, value }) => {
  const tokens = path.slice(1).split('/');
  let current = settings;
  for (let i = 0; i < tokens.length - 1; i++) current = current[tokens[i]];
  current[tokens[tokens.length - 1]] = value;
  console.log('[Settings] Updated:', path, '=', value);
};
</script>

<template>
  <div class="settings-example">
    <A2UISurface componentId="root" :components="components" :data="settings" surfaceId="settings"
      @action="handleAction" @dataUpdate="handleDataUpdate" />
    <details class="debug">
      <summary>Current Settings</summary>
      <pre>{{ JSON.stringify(settings, null, 2) }}</pre>
    </details>
  </div>
</template>

<style scoped>
.settings-example { max-width: 550px; margin: 2rem auto; padding: 1rem; }
.debug { margin-top: 1.5rem; padding: 1rem; background: #1f2937; border-radius: 0.5rem; }
.debug summary { color: #9ca3af; cursor: pointer; font-size: 0.875rem; }
.debug pre { color: #10b981; font-size: 0.75rem; margin-top: 0.5rem; }
</style>

