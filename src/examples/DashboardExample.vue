<script setup>
/**
 * Dashboard Example - Multi-card dashboard with metrics, charts, and actions
 */
import { reactive } from 'vue';
import A2UISurface from '../A2UISurface.vue';

const data = reactive({
  sales: [
    { label: 'Jan', value: 42 }, { label: 'Feb', value: 58 },
    { label: 'Mar', value: 75 }, { label: 'Apr', value: 63 },
    { label: 'May', value: 89 }, { label: 'Jun', value: 95 }
  ],
  traffic: [
    { label: 'Mon', value: 1200 }, { label: 'Tue', value: 1450 },
    { label: 'Wed', value: 1100 }, { label: 'Thu', value: 1680 },
    { label: 'Fri', value: 1420 }
  ],
  quickActions: { notifications: true, autoRefresh: false }
});

const components = {
  'root': { Column: { children: { explicitList: ['header', 'metrics-row', 'charts-row', 'actions-card'] } } },
  
  // Header
  'header': { Row: { alignment: 'center', distribution: 'spaceBetween', children: { explicitList: ['header-left', 'header-right'] } } },
  'header-left': { Row: { alignment: 'center', children: { explicitList: ['logo', 'title'] } } },
  'logo': { Icon: { name: 'dashboard' } },
  'title': { Text: { text: { literalString: 'Analytics Dashboard' }, usageHint: 'h1' } },
  'header-right': { Row: { children: { explicitList: ['refresh-btn', 'export-btn'] } } },
  'refresh-btn': { Button: { child: 'refresh-icon', action: { name: 'refresh' }, ariaLabel: 'Refresh' } },
  'refresh-icon': { Icon: { name: 'refresh' } },
  'export-btn': { Button: { child: 'export-text', action: { name: 'export' }, ariaLabel: 'Export' } },
  'export-text': { Text: { text: { literalString: 'Export' } } },
  
  // Metrics Row
  'metrics-row': { Row: { distribution: 'spaceAround', children: { explicitList: ['metric1', 'metric2', 'metric3', 'metric4'] } } },
  'metric1': { Card: { child: 'metric1-content' } },
  'metric1-content': { Metric: { label: 'Total Revenue', value: { literalString: '$124,500' }, unit: 'USD', trend: 12.5 } },
  'metric2': { Card: { child: 'metric2-content' } },
  'metric2-content': { Metric: { label: 'Active Users', value: { literalString: '8,492' }, trend: 8.3 } },
  'metric3': { Card: { child: 'metric3-content' } },
  'metric3-content': { Metric: { label: 'Conversion', value: { literalString: '3.24%' }, trend: -2.1 } },
  'metric4': { Card: { child: 'metric4-content' } },
  'metric4-content': { Metric: { label: 'Avg Session', value: { literalString: '4m 32s' }, trend: 5.7 } },
  
  // Charts Row
  'charts-row': { Row: { children: { explicitList: ['sales-card', 'traffic-card'] } } },
  'sales-card': { Card: { child: 'sales-content' } },
  'sales-content': { Column: { children: { explicitList: ['sales-header', 'sales-chart'] } } },
  'sales-header': { Row: { alignment: 'center', children: { explicitList: ['sales-icon', 'sales-title'] } } },
  'sales-icon': { Icon: { name: 'trending_up' } },
  'sales-title': { Text: { text: { literalString: 'Monthly Sales' }, usageHint: 'caption' } },
  'sales-chart': { Chart: { type: 'bar', data: { path: '/sales' } } },
  'traffic-card': { Card: { child: 'traffic-content' } },
  'traffic-content': { Column: { children: { explicitList: ['traffic-header', 'traffic-chart'] } } },
  'traffic-header': { Row: { alignment: 'center', children: { explicitList: ['traffic-icon', 'traffic-title'] } } },
  'traffic-icon': { Icon: { name: 'show_chart' } },
  'traffic-title': { Text: { text: { literalString: 'Weekly Traffic' }, usageHint: 'caption' } },
  'traffic-chart': { Chart: { type: 'bar', data: { path: '/traffic' } } },
  
  // Quick Actions Card
  'actions-card': { Card: { child: 'actions-content' } },
  'actions-content': { Column: { children: { explicitList: ['actions-title', 'actions-divider', 'actions-row'] } } },
  'actions-title': { Text: { text: { literalString: 'Quick Settings' }, usageHint: 'caption' } },
  'actions-divider': { Divider: {} },
  'actions-row': { Row: { distribution: 'spaceAround', children: { explicitList: ['notif-check', 'refresh-check', 'view-btn'] } } },
  'notif-check': { Checkbox: { label: 'Notifications', value: { path: '/quickActions/notifications' } } },
  'refresh-check': { Checkbox: { label: 'Auto-refresh', value: { path: '/quickActions/autoRefresh' } } },
  'view-btn': { Button: { child: 'view-btn-content', action: { name: 'viewAll' }, ariaLabel: 'View all' } },
  'view-btn-content': { Row: { alignment: 'center', children: { explicitList: ['view-icon', 'view-text'] } } },
  'view-icon': { Icon: { name: 'open_in_new' } },
  'view-text': { Text: { text: { literalString: 'View All' } } }
};

const handleAction = (action) => {
  console.log('[Dashboard] Action:', action);
  if (action.name === 'refresh') alert('Refreshing data...');
  else if (action.name === 'export') alert('Exporting dashboard...');
  else if (action.name === 'viewAll') alert('Opening full view...');
};

const handleDataUpdate = ({ path, value }) => {
  const tokens = path.slice(1).split('/');
  let current = data;
  for (let i = 0; i < tokens.length - 1; i++) current = current[tokens[i]];
  current[tokens[tokens.length - 1]] = value;
};
</script>

<template>
  <div class="dashboard-example">
    <A2UISurface componentId="root" :components="components" :data="data" surfaceId="dashboard"
      @action="handleAction" @dataUpdate="handleDataUpdate" />
  </div>
</template>

<style scoped>
.dashboard-example { max-width: 900px; margin: 2rem auto; padding: 1rem; background: #f8fafc; min-height: 100vh; }
</style>

