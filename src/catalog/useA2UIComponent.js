/**
 * A2UI Component Composable
 * Base composable for all A2UI components providing common functionality
 * Inspired by Angular's DynamicComponent pattern
 */
import { computed, inject } from 'vue';

// Injection keys
export const A2UI_PROCESSOR_KEY = Symbol('a2ui-processor');
export const A2UI_THEME_KEY = Symbol('a2ui-theme');

// ID counter for unique element IDs
let idCounter = 0;

/**
 * Resolve primitive values from A2UI value types
 * Handles: literalString, literalNumber, literalBoolean, path
 */
export function resolvePrimitive(value, data) {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (value.literal != null) {
    return value.literal;
  }

  if ('literalString' in value) {
    return value.literalString;
  }

  if ('literalNumber' in value) {
    return value.literalNumber;
  }

  if ('literalBoolean' in value) {
    return value.literalBoolean;
  }

  if (value.path) {
    return resolveDataPath(value.path, data);
  }

  return null;
}

/**
 * Resolve a JSON Pointer path (RFC 6901) to data
 */
export function resolveDataPath(path, data) {
  if (!path || !data) return undefined;

  // Empty path = root
  if (path === '') return data;

  // Path must start with '/'
  if (!path.startsWith('/')) {
    console.warn('[A2UI] Invalid path format:', path);
    return undefined;
  }

  // Parse JSON Pointer tokens
  const tokens = path.slice(1).split('/').map(token =>
    token.replace(/~1/g, '/').replace(/~0/g, '~')
  );

  // Navigate the data structure
  return tokens.reduce((acc, token) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[token];
  }, data);
}

/**
 * Main composable for A2UI components
 */
export function useA2UIComponent(props, emit) {
  // Inject processor for data updates and actions
  const processor = inject(A2UI_PROCESSOR_KEY, null);
  const theme = inject(A2UI_THEME_KEY, null);

  // Computed weight for flex layout
  const weight = computed(() => props.weight ?? 'initial');

  // Resolve primitive value helper bound to current data
  const resolve = (value) => {
    return resolvePrimitive(value, props.data);
  };

  // Get unique ID for form elements
  const getUniqueId = (prefix) => {
    return `${prefix}-${idCounter++}`;
  };

  // Send action to parent/processor
  const sendAction = (action) => {
    if (!action) return;

    const context = {};

    // Build context from action definition
    if (action.context) {
      for (const item of action.context) {
        if (item.value.literalBoolean != null) {
          context[item.key] = item.value.literalBoolean;
        } else if (item.value.literalNumber != null) {
          context[item.key] = item.value.literalNumber;
        } else if (item.value.literalString != null) {
          context[item.key] = item.value.literalString;
        } else if (item.value.path) {
          context[item.key] = resolve({ path: item.value.path });
        }
      }
    }

    const message = {
      name: action.name,
      sourceComponentId: props.componentId,
      surfaceId: props.surfaceId,
      timestamp: new Date().toISOString(),
      context
    };

    emit('action', message);
  };

  // Update data at path (for two-way binding)
  const setData = (path, value) => {
    if (!path) return;
    emit('dataUpdate', { path, value, surfaceId: props.surfaceId });
  };

  return {
    processor,
    theme,
    weight,
    resolve,
    getUniqueId,
    sendAction,
    setData
  };
}

/**
 * Common props for all A2UI components
 */
export const A2UI_COMPONENT_PROPS = {
  componentId: { type: String, required: true },
  component: { type: Object, required: true },
  components: { type: Object, required: true },
  data: { type: Object, default: () => ({}) },
  surfaceId: { type: String, required: true },
  weight: { type: [String, Number], default: 'initial' }
};

/**
 * Common emits for all A2UI components
 */
export const A2UI_COMPONENT_EMITS = ['action', 'dataUpdate'];

