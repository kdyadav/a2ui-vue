<script setup>
/**
 * Modal Workflow Example - Shows modal dialogs for confirmations and forms
 */
import { reactive } from 'vue';
import A2UISurface from '../A2UISurface.vue';

const data = reactive({
  items: ['Item 1', 'Item 2', 'Item 3'],
  newItemName: '',
  selectedItem: null
});

const components = {
  'root': { Column: { children: { explicitList: ['header', 'divider', 'item-list', 'actions-row'] } } },
  
  // Header
  'header': { Text: { text: { literalString: 'Modal Workflow Example' }, usageHint: 'h1' } },
  'divider': { Divider: {} },
  
  // Items list
  'item-list': { Card: { child: 'list-content' } },
  'list-content': { Column: { children: { explicitList: ['list-title', 'item1', 'item2', 'item3'] } } },
  'list-title': { Text: { text: { literalString: 'Your Items' }, usageHint: 'caption' } },
  'item1': { Row: { alignment: 'center', distribution: 'spaceBetween', children: { explicitList: ['item1-text', 'item1-del'] } } },
  'item1-text': { Text: { text: { literalString: 'Item 1' } } },
  'item1-del': { Modal: { entryPointChild: 'del1-trigger', contentChild: 'del1-confirm' } },
  'del1-trigger': { Button: { child: 'del-icon1', ariaLabel: 'Delete Item 1' } },
  'del-icon1': { Icon: { name: 'delete' } },
  'del1-confirm': { Column: { alignment: 'center', children: { explicitList: ['del1-title', 'del1-msg', 'del1-actions'] } } },
  'del1-title': { Text: { text: { literalString: 'Confirm Delete' }, usageHint: 'h2' } },
  'del1-msg': { Text: { text: { literalString: 'Are you sure you want to delete "Item 1"?' } } },
  'del1-actions': { Row: { distribution: 'center', children: { explicitList: ['del1-cancel', 'del1-confirm-btn'] } } },
  'del1-cancel': { Button: { child: 'cancel-text1', action: { name: 'closeModal' }, ariaLabel: 'Cancel' } },
  'cancel-text1': { Text: { text: { literalString: 'Cancel' } } },
  'del1-confirm-btn': { Button: { child: 'confirm-text1', action: { name: 'deleteItem', context: [{ key: 'item', value: { literalString: 'Item 1' } }] }, ariaLabel: 'Confirm delete' } },
  'confirm-text1': { Text: { text: { literalString: 'Delete' } } },
  
  'item2': { Row: { alignment: 'center', distribution: 'spaceBetween', children: { explicitList: ['item2-text', 'item2-del'] } } },
  'item2-text': { Text: { text: { literalString: 'Item 2' } } },
  'item2-del': { Button: { child: 'del-icon2', action: { name: 'quickDelete', context: [{ key: 'item', value: { literalString: 'Item 2' } }] }, ariaLabel: 'Delete Item 2' } },
  'del-icon2': { Icon: { name: 'delete' } },
  
  'item3': { Row: { alignment: 'center', distribution: 'spaceBetween', children: { explicitList: ['item3-text', 'item3-del'] } } },
  'item3-text': { Text: { text: { literalString: 'Item 3' } } },
  'item3-del': { Button: { child: 'del-icon3', action: { name: 'quickDelete', context: [{ key: 'item', value: { literalString: 'Item 3' } }] }, ariaLabel: 'Delete Item 3' } },
  'del-icon3': { Icon: { name: 'delete' } },
  
  // Actions row with Add modal
  'actions-row': { Row: { distribution: 'spaceBetween', children: { explicitList: ['add-modal', 'info-modal'] } } },
  
  // Add Item Modal
  'add-modal': { Modal: { entryPointChild: 'add-trigger', contentChild: 'add-form' } },
  'add-trigger': { Button: { child: 'add-trigger-content', ariaLabel: 'Add new item' } },
  'add-trigger-content': { Row: { alignment: 'center', children: { explicitList: ['add-icon', 'add-text'] } } },
  'add-icon': { Icon: { name: 'add' } },
  'add-text': { Text: { text: { literalString: 'Add Item' } } },
  'add-form': { Column: { children: { explicitList: ['add-title', 'add-input', 'add-actions'] } } },
  'add-title': { Text: { text: { literalString: 'Add New Item' }, usageHint: 'h2' } },
  'add-input': { TextField: { label: 'Item Name', placeholder: 'Enter item name...', text: { path: '/newItemName' } } },
  'add-actions': { Row: { distribution: 'center', children: { explicitList: ['add-cancel', 'add-submit'] } } },
  'add-cancel': { Button: { child: 'add-cancel-text', action: { name: 'closeModal' }, ariaLabel: 'Cancel' } },
  'add-cancel-text': { Text: { text: { literalString: 'Cancel' } } },
  'add-submit': { Button: { child: 'add-submit-text', action: { name: 'addItem' }, ariaLabel: 'Add item' } },
  'add-submit-text': { Text: { text: { literalString: 'Add' } } },
  
  // Info Modal
  'info-modal': { Modal: { entryPointChild: 'info-trigger', contentChild: 'info-content' } },
  'info-trigger': { Button: { child: 'info-icon', ariaLabel: 'Show info' } },
  'info-icon': { Icon: { name: 'info' } },
  'info-content': { Column: { children: { explicitList: ['info-title', 'info-text1', 'info-text2'] } } },
  'info-title': { Text: { text: { literalString: 'About Modals' }, usageHint: 'h2' } },
  'info-text1': { Text: { text: { literalString: 'Modals are useful for confirmations, forms, and detailed views.' } } },
  'info-text2': { Text: { text: { literalString: 'Click outside the modal or press ESC to close.' }, usageHint: 'caption' } }
};

const handleAction = (action) => {
  console.log('[Modal] Action:', action);
  if (action.name === 'deleteItem') {
    const item = action.context?.item;
    alert(`Deleted: ${item}`);
  } else if (action.name === 'quickDelete') {
    const item = action.context?.item;
    if (confirm(`Delete ${item}?`)) alert(`Deleted: ${item}`);
  } else if (action.name === 'addItem') {
    if (data.newItemName.trim()) {
      alert(`Added: ${data.newItemName}`);
      data.newItemName = '';
    }
  }
};

const handleDataUpdate = ({ path, value }) => {
  if (path === '/newItemName') data.newItemName = value;
};
</script>

<template>
  <div class="modal-example">
    <A2UISurface componentId="root" :components="components" :data="data" surfaceId="modals"
      @action="handleAction" @dataUpdate="handleDataUpdate" />
  </div>
</template>

<style scoped>
.modal-example { max-width: 500px; margin: 2rem auto; padding: 1rem; }
</style>

