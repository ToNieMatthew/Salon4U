<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">{{ isEditing ? 'Edytuj klienta' : 'Nowy klient' }}</h2>
        <button class="close-button" @click="closeModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="saveClient" class="client-form">
          <!-- Imię -->
          <div class="form-group">
            <label for="firstName">Imię</label>
            <input 
              type="text" 
              id="firstName" 
              v-model="form.firstName"
              class="form-input"
              placeholder="Wprowadź imię"
              required
            >
          </div>
          
          <!-- Nazwisko -->
          <div class="form-group">
            <label for="lastName">Nazwisko</label>
            <input 
              type="text" 
              id="lastName" 
              v-model="form.lastName"
              class="form-input"
              placeholder="Wprowadź nazwisko"
              required
            >
          </div>
            <!-- Telefon -->
          <div class="form-group">
            <label for="phone">Telefon</label>
            <input 
              type="tel" 
              id="phone" 
              v-model="form.phone"
              class="form-input"
              placeholder="np. 123-456-789"
              required
            >
          </div>
          
          <!-- Notatki -->
          <div class="form-group">
            <label for="notes">Notatki</label>
            <textarea 
              id="notes" 
              v-model="form.notes"
              class="form-input form-textarea"
              rows="3"
              placeholder="Dodatkowe informacje o kliencie..."
            ></textarea>
          </div>
        </form>
      </div>
      
      <div class="modal-footer">
        <div class="footer-left">
          <button 
            v-if="isEditing" 
            type="button" 
            class="btn btn-danger" 
            @click="confirmDelete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
            </svg>
            Usuń klienta
          </button>
        </div>
        <div class="footer-right">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            Anuluj
          </button>
          <button type="button" class="btn btn-primary" @click="saveClient">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Zapisz klienta
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

// Props
const props = defineProps({
  client: Object
});

// Emits
const emit = defineEmits(['close', 'save', 'delete']);

// Form data
const form = ref({
  firstName: '',
  lastName: '',
  phone: '',
  notes: ''
});

// Computed
const isEditing = computed(() => !!props.client);

// Watchers
watch(() => props.client, (newClient) => {
  console.log('ClientForm - otrzymano klienta:', newClient);
  if (newClient) {
    loadClientData(newClient);
  } else {
    resetForm();
  }
}, { immediate: true });

// Methods
function loadClientData(client) {
  form.value = {
    firstName: client.firstName || '',
    lastName: client.lastName || '',
    phone: client.phone || '',
    notes: client.notes || ''
  };
}

function resetForm() {
  form.value = {
    firstName: '',
    lastName: '',
    phone: '',
    notes: ''
  };
}

function closeModal() {
  console.log('ClientForm - zamykanie modala');
  emit('close');
}

function saveClient() {
  console.log('ClientForm - zapisywanie klienta:', form.value);
  
  // Walidacja
  if (!form.value.firstName.trim() || !form.value.lastName.trim() || !form.value.phone.trim()) {
    alert('Wypełnij wszystkie wymagane pola');
    return;
  }
    const clientData = {
    ...form.value,
    firstName: form.value.firstName.trim(),
    lastName: form.value.lastName.trim(),
    phone: form.value.phone.trim(),
    notes: form.value.notes.trim()
  };
  
  // Jeśli edytujemy, dodaj ID
  if (props.client) {
    clientData.id = props.client.id;
  }
  
  emit('save', clientData);
}

function confirmDelete() {
  if (confirm('Czy na pewno chcesz usunąć tego klienta?')) {
    console.log('ClientForm - usuwanie klienta:', props.client.id);
    emit('delete', props.client.id);
  }
}

// Lifecycle
onMounted(() => {
  console.log('ClientForm - mounted, props.client:', props.client);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-container {
  width: 500px;
  max-width: 95vw;
  max-height: 90vh;
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-surface);
}

.modal-title {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.close-button {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.close-button:hover {
  color: var(--color-text-primary);
  background-color: var(--color-surface-variant);
}

.modal-body {
  padding: var(--spacing-6);
  overflow-y: auto;
  flex: 1;
}

.client-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.form-input {
  width: 100%;
  padding: var(--spacing-3);
  font-size: var(--font-size-base);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-footer {
  padding: var(--spacing-5) var(--spacing-6);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-surface-variant);
}

.footer-left,
.footer-right {
  display: flex;
  gap: var(--spacing-3);
}

.btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-5);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  text-decoration: none;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 2px solid var(--color-border);
}

.btn-secondary:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: rgba(var(--color-primary-rgb), 0.05);
}

.btn-danger {
  background-color: transparent;
  color: var(--color-error);
  border: 2px solid var(--color-error);
}

.btn-danger:hover {
  background-color: var(--color-error);
  color: white;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
</style>