<template>
  <form class="service-form" @submit.prevent="handleSubmit">
    <div class="form-header">
      <h2 class="form-title">{{ isEditing ? 'Edytuj usługę' : 'Dodaj nową usługę' }}</h2>
      <button type="button" class="close-button" @click="$emit('close')">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <div class="form-body">
      <div class="form-group">
        <label for="name" class="form-label">Nazwa usługi *</label>
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
      
      <div class="form-row">
        <div class="form-group">
          <label for="price" class="form-label">Cena (PLN) *</label>
          <input
            id="price"
            v-model.number="form.price"
            type="number"
            min="0"
            step="0.01"
            class="form-control"
            required
            :class="{ 'error': errors.price }"
          >
          <span v-if="errors.price" class="error-message">{{ errors.price }}</span>
        </div>
        
        <div class="form-group">
          <label for="duration" class="form-label">Czas trwania (minuty) *</label>
          <input
            id="duration"
            v-model.number="form.duration"
            type="number"
            min="5"
            step="5"
            class="form-control"
            required
            :class="{ 'error': errors.duration }"
          >
          <span v-if="errors.duration" class="error-message">{{ errors.duration }}</span>
        </div>
      </div>
      
      <div class="form-group">
        <label for="category" class="form-label">Kategoria</label>
        <select
          id="category"
          v-model="form.categoryId"
          class="form-control"
        >
          <option value="">Brak kategorii</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="description" class="form-label">Opis usługi</label>
        <textarea
          id="description"
          v-model="form.description"
          class="form-control"
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-row checkbox-row">
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="form.active"
              class="checkbox-input"
            >
            <span class="checkbox-text">Usługa aktywna</span>
          </label>
        </div>
      </div>
    </div>
    
    <div class="form-footer">
      <button type="button" class="btn btn-outline" @click="$emit('close')">
        Anuluj
      </button>
      <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
        <span v-if="isSubmitting" class="spinner"></span>
        <span>{{ isEditing ? 'Zapisz zmiany' : 'Dodaj usługę' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';

const props = defineProps({
  service: {
    type: Object,
    default: () => ({})
  },
  categories: {
    type: Array,
    default: () => []
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'close']);

const isEditing = computed(() => !!props.service?.id);

const form = reactive({
  name: '',
  price: 0,
  duration: 30,
  categoryId: '',
  description: '',
  active: true
});

const errors = reactive({
  name: '',
  price: '',
  duration: ''
});

// Initialize form with service data if editing
onMounted(() => {
  if (isEditing.value) {
    form.name = props.service.name || '';
    form.price = props.service.price || 0;
    form.duration = props.service.duration || 30;
    form.categoryId = props.service.categoryId || '';
    form.description = props.service.description || '';
    form.active = typeof props.service.active === 'boolean' ? props.service.active : true;
  }
});

// Watch for changes in props.service
watch(() => props.service, (newService) => {
  if (newService?.id) {
    form.name = newService.name || '';
    form.price = newService.price || 0;
    form.duration = newService.duration || 30;
    form.categoryId = newService.categoryId || '';
    form.description = newService.description || '';
    form.active = typeof newService.active === 'boolean' ? newService.active : true;
  }
}, { deep: true });

const validateForm = () => {
  let isValid = true;
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });
  
  // Validate name
  if (!form.name.trim()) {
    errors.name = 'Nazwa usługi jest wymagana';
    isValid = false;
  }
  
  // Validate price
  if (form.price === null || form.price === undefined || form.price < 0) {
    errors.price = 'Cena musi być większa lub równa 0';
    isValid = false;
  }
  
  // Validate duration
  if (form.duration === null || form.duration === undefined || form.duration < 5) {
    errors.duration = 'Czas trwania musi być co najmniej 5 minut';
    isValid = false;
  }
  
  return isValid;
};

const handleSubmit = () => {
  if (!validateForm()) {
    return;
  }
  
  // Create a copy of the form data
  const serviceData = { ...form };
  
  // If editing, add the id
  if (isEditing.value) {
    serviceData.id = props.service.id;
  }
  
  emit('submit', serviceData);
};
</script>

<style scoped>
.service-form {
  display: flex;
  flex-direction: column;
  width: 100%;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4);
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

.checkbox-row {
  grid-template-columns: 1fr;
}

.checkbox-group {
  margin-top: var(--spacing-2);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
}

.checkbox-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
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

/* Make form responsive on small screens */
@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>