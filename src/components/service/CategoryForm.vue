<template>
  <form class="category-form" @submit.prevent="handleSubmit">
    <div class="form-header">
      <h2 class="form-title">{{ isEditing ? 'Edytuj kategorię' : 'Dodaj nową kategorię' }}</h2>
      <button type="button" class="close-button" @click="$emit('close')">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <div class="form-body">
      <div class="form-group">
        <label for="name" class="form-label">Nazwa kategorii *</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="form-control"
          required
          :class="{ 'error': errors.name }"
        >
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>
      
      <div class="form-group">
        <label for="description" class="form-label">Opis (opcjonalnie)</label>
        <textarea
          id="description"
          v-model="form.description"
          class="form-control"
          rows="3"
        ></textarea>
      </div>
    </div>
    
    <div class="form-footer">
      <button type="button" class="btn btn-outline" @click="$emit('close')">
        Anuluj
      </button>
      <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
        <span v-if="isSubmitting" class="spinner"></span>
        <span>{{ isEditing ? 'Zapisz zmiany' : 'Dodaj kategorię' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, computed, watch, onMounted } from 'vue';

const props = defineProps({
  category: {
    type: Object,
    default: () => ({})
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'close']);

const isEditing = computed(() => !!props.category?.id);

const form = reactive({
  name: '',
  description: ''
});

const errors = reactive({
  name: ''
});

// Initialize form with category data if editing
onMounted(() => {
  if (isEditing.value) {
    form.name = props.category.name || '';
    form.description = props.category.description || '';
  }
});

// Watch for changes in props.category
watch(() => props.category, (newCategory) => {
  if (newCategory?.id) {
    form.name = newCategory.name || '';
    form.description = newCategory.description || '';
  }
}, { deep: true });

const validateForm = () => {
  let isValid = true;
  
  // Reset errors
  errors.name = '';
  
  // Validate name
  if (!form.name.trim()) {
    errors.name = 'Nazwa kategorii jest wymagana';
    isValid = false;
  }
  
  return isValid;
};

const handleSubmit = () => {
  if (!validateForm()) {
    return;
  }
  
  // Create a copy of the form data
  const categoryData = { ...form };
  
  // If editing, add the id
  if (isEditing.value) {
    categoryData.id = props.category.id;
  }
  
  emit('submit', categoryData);
};
</script>

<style scoped>
.category-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 500px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--color-border);
}

.form-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.close-button {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-surface-variant);
  border: none;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-button:hover {
  background-color: var(--color-primary-light);
  color: white;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
  margin-bottom: var(--spacing-6);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  margin-bottom: var(--spacing-2);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.form-control {
  width: 100%;
  padding: var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary-light);
}

.form-control.error {
  border-color: var(--color-status-error);
}

.error-message {
  font-size: var(--font-size-xs);
  color: var(--color-status-error);
  margin-top: var(--spacing-1);
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border);
}

.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: var(--spacing-2);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>