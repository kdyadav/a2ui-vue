<script setup>
/**
 * Dynamic List Example - Shows list manipulation with actions
 */
import { ref, reactive, computed } from 'vue';
import A2UISurface from '../A2UISurface.vue';

const todos = ref([
  { id: 1, text: 'Learn Vue 3', done: true },
  { id: 2, text: 'Build A2UI renderer', done: true },
  { id: 3, text: 'Create examples', done: false },
  { id: 4, text: 'Write tests', done: false }
]);

const newTodoText = ref('');
let nextId = 5;

// Dynamically generate components based on todo list
const components = computed(() => {
  const comps = {
    'root': { Card: { child: 'main-col' } },
    'main-col': { Column: { children: { explicitList: ['header', 'divider', 'input-row', ...todos.value.map(t => `todo-${t.id}`), 'stats'] } } },
    'header': { Row: { alignment: 'center', children: { explicitList: ['header-icon', 'header-text'] } } },
    'header-icon': { Icon: { name: 'checklist' } },
    'header-text': { Text: { text: { literalString: 'Todo List' }, usageHint: 'h1' } },
    'divider': { Divider: {} },
    'input-row': { Row: { children: { explicitList: ['new-todo-input', 'add-btn'] } } },
    'new-todo-input': { TextField: { label: 'New Todo', placeholder: 'What needs to be done?', text: { path: '/newTodo' } } },
    'add-btn': { Button: { child: 'add-btn-text', action: { name: 'addTodo' }, ariaLabel: 'Add todo' } },
    'add-btn-text': { Icon: { name: 'add' } },
    'stats': { Row: { distribution: 'spaceBetween', children: { explicitList: ['stats-total', 'stats-done', 'clear-btn'] } } },
    'stats-total': { Text: { text: { literalString: `Total: ${todos.value.length}` }, usageHint: 'caption' } },
    'stats-done': { Text: { text: { literalString: `Done: ${todos.value.filter(t => t.done).length}` }, usageHint: 'caption' } },
    'clear-btn': { Button: { child: 'clear-btn-text', action: { name: 'clearDone' }, ariaLabel: 'Clear completed' } },
    'clear-btn-text': { Text: { text: { literalString: 'Clear Done' } } }
  };

  // Generate todo item components
  todos.value.forEach(todo => {
    comps[`todo-${todo.id}`] = { Row: { alignment: 'center', children: { explicitList: [`check-${todo.id}`, `text-${todo.id}`, `del-${todo.id}`] } } };
    comps[`check-${todo.id}`] = { Checkbox: { label: '', value: { path: `/todos/${todo.id}/done` } } };
    comps[`text-${todo.id}`] = { Text: { text: { literalString: todo.text }, usageHint: todo.done ? 'caption' : 'body' } };
    comps[`del-${todo.id}`] = { Button: { child: `del-icon-${todo.id}`, action: { name: 'deleteTodo', context: [{ key: 'id', value: { literalNumber: todo.id } }] }, ariaLabel: 'Delete todo' } };
    comps[`del-icon-${todo.id}`] = { Icon: { name: 'delete' } };
  });

  return comps;
});

const data = computed(() => {
  const d = { newTodo: newTodoText.value, todos: {} };
  todos.value.forEach(t => d.todos[t.id] = { done: t.done });
  return d;
});

const handleAction = (action) => {
  if (action.name === 'addTodo' && newTodoText.value.trim()) {
    todos.value.push({ id: nextId++, text: newTodoText.value.trim(), done: false });
    newTodoText.value = '';
  } else if (action.name === 'deleteTodo') {
    const id = action.context?.id;
    todos.value = todos.value.filter(t => t.id !== id);
  } else if (action.name === 'clearDone') {
    todos.value = todos.value.filter(t => !t.done);
  }
};

const handleDataUpdate = ({ path, value }) => {
  if (path === '/newTodo') {
    newTodoText.value = value;
  } else if (path.startsWith('/todos/')) {
    const match = path.match(/\/todos\/(\d+)\/done/);
    if (match) {
      const id = parseInt(match[1]);
      const todo = todos.value.find(t => t.id === id);
      if (todo) todo.done = value;
    }
  }
};
</script>

<template>
  <div class="dynamic-list-example">
    <A2UISurface componentId="root" :components="components" :data="data" surfaceId="todos"
      @action="handleAction" @dataUpdate="handleDataUpdate" />
  </div>
</template>

<style scoped>
.dynamic-list-example { max-width: 500px; margin: 2rem auto; padding: 1rem; }
</style>

