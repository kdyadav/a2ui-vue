<script setup>
/**
 * Simple Example - Basic A2UI usage
 * Shows how to create a simple form with data binding
 */
import { reactive } from 'vue';
import A2UISurface from '../A2UISurface.vue';

// Reactive data that will be bound to components
const formData = reactive({
  name: '',
  email: '',
  subscribe: false,
  rating: 50
});

// Component definitions (A2UI spec format)
const components = {
  'root': {
    Card: { child: 'form-column' }
  },
  'form-column': {
    Column: {
      children: { explicitList: ['title', 'divider', 'name-field', 'email-field', 'subscribe-check', 'rating-slider', 'submit-btn', 'output'] }
    }
  },
  'title': {
    Text: { text: { literalString: 'Contact Form' }, usageHint: 'h1' }
  },
  'divider': {
    Divider: {}
  },
  'name-field': {
    TextField: {
      label: 'Your Name',
      placeholder: 'Enter your name',
      text: { path: '/name' }
    }
  },
  'email-field': {
    TextField: {
      label: 'Email Address',
      placeholder: 'you@example.com',
      text: { path: '/email' }
    }
  },
  'subscribe-check': {
    Checkbox: {
      label: 'Subscribe to newsletter',
      value: { path: '/subscribe' }
    }
  },
  'rating-slider': {
    Slider: {
      label: 'Satisfaction Rating',
      minValue: 0,
      maxValue: 100,
      value: { path: '/rating' }
    }
  },
  'submit-btn': {
    Button: {
      child: 'submit-text',
      action: { name: 'submit', context: [
        { key: 'name', value: { path: '/name' } },
        { key: 'email', value: { path: '/email' } }
      ] },
      ariaLabel: 'Submit form'
    }
  },
  'submit-text': {
    Text: { text: { literalString: 'Submit' } }
  },
  'output': {
    Text: { text: { path: '/name' }, usageHint: 'caption' }
  }
};

// Handle form submission
const handleAction = (action) => {
  if (action.name === 'submit') {
    console.log('Form submitted:', action.context);
    alert(`Thanks ${action.context.name}! We'll contact you at ${action.context.email}`);
  }
};

// Handle data updates from inputs
const handleDataUpdate = ({ path, value }) => {
  const key = path.slice(1); // Remove leading '/'
  formData[key] = value;
};
</script>

<template>
  <div class="simple-example">
    <h2>Simple Form Example</h2>
    <p>This shows basic two-way data binding with A2UI components.</p>
    
    <div class="form-container">
      <A2UISurface
        componentId="root"
        :components="components"
        :data="formData"
        surfaceId="simple-form"
        @action="handleAction"
        @dataUpdate="handleDataUpdate"
      />
    </div>

    <div class="debug-panel">
      <h4>Live Data:</h4>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.simple-example {
  max-width: 500px;
  margin: 2rem auto;
  padding: 1rem;
}

.form-container {
  margin: 1.5rem 0;
}

.debug-panel {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
}

.debug-panel h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.debug-panel pre {
  margin: 0;
  font-size: 0.75rem;
  color: #374151;
}
</style>

