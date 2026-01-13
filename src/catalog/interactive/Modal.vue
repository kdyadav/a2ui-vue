<script>
export default { name: 'A2UIModal' };
</script>

<script setup>
import { computed, ref, watch, nextTick, defineAsyncComponent } from 'vue';
import { A2UI_COMPONENT_PROPS, A2UI_COMPONENT_EMITS, useA2UIComponent } from '../useA2UIComponent.js';

// Lazy import to avoid circular dependency
const A2UIRenderer = defineAsyncComponent(() => import('../A2UIRenderer.vue'));

const props = defineProps(A2UI_COMPONENT_PROPS);
const emit = defineEmits(A2UI_COMPONENT_EMITS);

const { weight } = useA2UIComponent(props, emit);

// Extract Modal properties
const modalProps = computed(() => props.component?.Modal || props.component || {});
const entryPointChild = computed(() => modalProps.value.entryPointChild || null);
const contentChild = computed(() => modalProps.value.contentChild || null);

const showDialog = ref(false);
const dialogRef = ref(null);

// Open dialog when showDialog becomes true
watch(showDialog, async (newValue) => {
  if (newValue) {
    await nextTick();
    if (dialogRef.value && !dialogRef.value.open) {
      dialogRef.value.showModal();
    }
  }
});

const handleDialogClick = (event) => {
  // Close on backdrop click
  if (event.target === dialogRef.value) {
    closeDialog();
  }
};

const closeDialog = () => {
  if (dialogRef.value?.open) {
    dialogRef.value.close();
  }
  showDialog.value = false;
};
</script>

<template>
  <section class="a2ui-modal" :style="{ '--weight': weight }">
    <!-- Dialog overlay -->
    <dialog v-if="showDialog" ref="dialogRef" class="a2ui-modal__dialog" @click="handleDialogClick">
      <div class="a2ui-modal__content">
        <div class="a2ui-modal__controls">
          <button class="a2ui-modal__close" @click="closeDialog">
            <span class="material-icons">close</span>
          </button>
        </div>
        <A2UIRenderer v-if="contentChild" :componentId="contentChild" :components="components" :data="data"
          :surfaceId="surfaceId" @action="emit('action', $event)" @dataUpdate="emit('dataUpdate', $event)" />
      </div>
    </dialog>

    <!-- Entry point trigger -->
    <div v-else class="a2ui-modal__trigger" @click="showDialog = true">
      <A2UIRenderer v-if="entryPointChild" :componentId="entryPointChild" :components="components" :data="data"
        :surfaceId="surfaceId" @action="emit('action', $event)" @dataUpdate="emit('dataUpdate', $event)" />
    </div>
  </section>
</template>

<style scoped>
.a2ui-modal {
  display: block;
  flex: var(--weight);
}

.a2ui-modal__trigger {
  cursor: pointer;
}

.a2ui-modal__dialog {
  padding: 0;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  max-width: 100vw;
  max-height: 100vh;
  width: 100%;
  height: 100%;
}

.a2ui-modal__dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}

.a2ui-modal__content {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  max-width: 500px;
  margin: 5vh auto;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}

.a2ui-modal__controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
}

.a2ui-modal__close {
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.a2ui-modal__close .material-icons {
  font-size: 1.25rem;
  color: #6b7280;
}

.a2ui-modal__close:hover .material-icons {
  color: #374151;
}
</style>
