<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { format, addMinutes } from 'date-fns';
import { useClientStore } from '../../stores/clientStore';
import { useServiceStore } from '../../stores/serviceStore';

// Props
const props = defineProps({
  appointment: Object,
  initialDate: Date
});

// Emits
const emit = defineEmits(['close', 'save', 'delete']);

// Stores
const clientStore = useClientStore();
const serviceStore = useServiceStore();

// Stany
const form = ref({
  date: '',
  startTime: '10:00',
  endTime: '10:30',
  clientFirstName: '',
  clientLastName: '',
  clientPhone: '',
  service: '',
  notes: '',
  status: 'scheduled',
});

const existingClient = ref(null);
const showClientSuggestions = ref(false);
const clientSearchQuery = ref('');

// Computed
const isEditing = computed(() => !!props.appointment);

const timeSlots = computed(() => {
  const slots = [];
  for (let hour = 7; hour < 20; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:05`);
    slots.push(`${hour.toString().padStart(2, '0')}:10`);
    slots.push(`${hour.toString().padStart(2, '0')}:15`);
    slots.push(`${hour.toString().padStart(2, '0')}:20`);
    slots.push(`${hour.toString().padStart(2, '0')}:25`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
    slots.push(`${hour.toString().padStart(2, '0')}:35`);
    slots.push(`${hour.toString().padStart(2, '0')}:40`);
    slots.push(`${hour.toString().padStart(2, '0')}:45`);
    slots.push(`${hour.toString().padStart(2, '0')}:50`);
    slots.push(`${hour.toString().padStart(2, '0')}:55`);
  }
  return slots;
});

const availableEndTimes = computed(() => {
  if (!form.value.startTime) return timeSlots.value;
  
  const startTimeIndex = timeSlots.value.findIndex(time => time === form.value.startTime);
  return startTimeIndex >= 0 ? timeSlots.value.slice(startTimeIndex + 1) : timeSlots.value;
});

const filteredClients = computed(() => {
  if (!clientSearchQuery.value) return [];
  
  const query = clientSearchQuery.value.toLowerCase();
  return clientStore.clients.filter(client => 
    client.firstName.toLowerCase().includes(query) ||
    client.lastName.toLowerCase().includes(query) ||
    `${client.firstName} ${client.lastName}`.toLowerCase().includes(query)
  ).slice(0, 5); // Maksymalnie 5 sugestii
});

const availableServices = computed(() => {
  return serviceStore.services.filter(service => service.active !== false);
});

// Watchers
watch(() => props.appointment, (newVal) => {
  if (newVal) {
    loadAppointmentData(newVal);
  }
}, { immediate: true });

watch(() => props.initialDate, (newDate) => {
  if (newDate && !props.appointment) {
    console.log('AppointmentForm - otrzymana initialDate:', newDate);
    form.value.date = format(newDate, 'yyyy-MM-dd');
    
    // Ustaw dokładne godziny z DayView (bez zaokrąglania)
    const hour = newDate.getHours();
    const minutes = newDate.getMinutes();
    form.value.startTime = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    console.log(`AppointmentForm - ustawiona data: ${form.value.date}, czas: ${form.value.startTime}`);
    
    // Domyślnie 30 minut
    const endDate = addMinutes(newDate, 30);
    form.value.endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  }
}, { immediate: true });

// Watcher dla automatycznego ustawiania czasu zakończenia na podstawie usługi
watch(() => form.value.service, (newService) => {
  if (newService && form.value.startTime) {
    updateEndTimeFromService(newService);
  }
});

// Watcher dla czasu rozpoczęcia - też zaktualizuj czas zakończenia
watch(() => form.value.startTime, (newStartTime) => {
  if (newStartTime && form.value.service) {
    updateEndTimeFromService(form.value.service);
  }
});

// Metody
function loadAppointmentData(appointment) {
  if (!appointment) return;
  
  const appointmentDate = new Date(appointment.date);
  form.value = {
    ...appointment,
    date: format(appointmentDate, 'yyyy-MM-dd'),
    clientFirstName: appointment.clientFirstName || '',
    clientLastName: appointment.clientLastName || '',
    clientPhone: appointment.clientPhone || ''
  };
}

// Sprawdź czy klient już istnieje w bazie na podstawie telefonu
function checkExistingClient() {
  if (!form.value.clientPhone) {
    existingClient.value = null;
    return;
  }
  
  const client = clientStore.clients.find(c => c.phone === form.value.clientPhone);
  if (client) {
    existingClient.value = client;
    form.value.clientFirstName = client.firstName;
    form.value.clientLastName = client.lastName;
  } else {
    existingClient.value = null;
  }
}

// Funkcja do aktualizacji czasu zakończenia na podstawie wybranej usługi
function updateEndTimeFromService(serviceName) {
  if (!serviceName || !form.value.startTime) return;
  
  // Znajdź usługę po nazwie
  const service = serviceStore.services.find(s => s.name === serviceName);
  if (!service || !service.duration) return;
  
  // Parsuj czas rozpoczęcia
  const [startHour, startMinute] = form.value.startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(startHour, startMinute, 0, 0);
  
  // Dodaj czas trwania usługi
  const endDate = addMinutes(startDate, service.duration);
  
  // Ustaw czas zakończenia
  form.value.endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
}

// Obsługa autocomplete klientów
function onClientInput(event) {
  clientSearchQuery.value = event.target.value;
  showClientSuggestions.value = clientSearchQuery.value.length > 0;
}

function selectClient(client) {
  form.value.clientFirstName = client.firstName;
  form.value.clientLastName = client.lastName;
  form.value.clientPhone = client.phone;
  existingClient.value = client;
  clientSearchQuery.value = `${client.firstName} ${client.lastName}`;
  showClientSuggestions.value = false;
}

function onClientBlur() {
  // Opóźnienie, aby kliknięcie na sugestię mogło się wykonać
  setTimeout(() => {
    showClientSuggestions.value = false;
  }, 200);
}

function closeModal() {
  emit('close');
}

function saveAppointment() {
  console.log('AppointmentForm - rozpoczęcie zapisywania wizyty');
  console.log('AppointmentForm - dane formularza:', form.value);
  
  // Walidacja danych
  if (!form.value.clientFirstName || !form.value.clientLastName || !form.value.service) {
    console.error('AppointmentForm - brak wymaganych danych');
    alert('Proszę wypełnić wszystkie wymagane pola');
    return;
  }
  
  // Sprawdź czy klient istnieje, jeśli nie - dodaj go
  let clientId = null;
  
  if (existingClient.value) {
    clientId = existingClient.value.id;
    console.log('AppointmentForm - używam istniejącego klienta:', clientId);
  } else {
    // Dodaj nowego klienta
    clientId = `client_${Date.now()}`;
    const newClient = {
      id: clientId,
      firstName: form.value.clientFirstName,
      lastName: form.value.clientLastName,
      phone: form.value.clientPhone,
      createdAt: new Date().toISOString()
    };
    
    console.log('AppointmentForm - dodaję nowego klienta:', newClient);
    clientStore.addClient(newClient);
  }
    // Znajdź wybraną usługę i pobierz jej cenę
  const selectedService = serviceStore.services.find(s => s.name === form.value.service);
  const servicePrice = selectedService ? selectedService.price : 0;
  
  // Przygotuj dane wizyty
  const appointmentData = {
    id: props.appointment ? props.appointment.id : `appointment_${Date.now()}`,
    date: form.value.date, // Format YYYY-MM-DD
    startTime: form.value.startTime,
    endTime: form.value.endTime,
    clientId: clientId,
    clientFirstName: form.value.clientFirstName,
    clientLastName: form.value.clientLastName,
    clientPhone: form.value.clientPhone,
    clientName: `${form.value.clientFirstName} ${form.value.clientLastName}`,
    service: form.value.service,
    price: servicePrice, // Dodaj cenę usługi
    notes: form.value.notes,
    status: form.value.status,
    createdAt: props.appointment ? props.appointment.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  console.log('AppointmentForm - dane wizyty do zapisania:', appointmentData);
  console.log('AppointmentForm - emituję zdarzenie save');
  
  emit('save', appointmentData);
}

function confirmDelete() {
  if (confirm('Czy na pewno chcesz usunąć tę wizytę?')) {
    emit('delete', props.appointment.id);
  }
}

// Inicjalizacja
onMounted(() => {
  if (!props.appointment && !props.initialDate) {
    form.value.date = format(new Date(), 'yyyy-MM-dd');
  }
  
  // Wczytaj dane z stores
  clientStore.loadFromLocalStorage();
  serviceStore.loadFromLocalStorage();
});
</script>

<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">{{ isEditing ? 'Edytuj wizytę' : 'Nowa wizyta' }}</h2>
        <button class="close-button" @click="closeModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="saveAppointment" class="appointment-form">
          <!-- Data wizyty -->
          <div class="form-group">
            <label for="date">Data wizyty</label>
            <input 
              type="date" 
              id="date" 
              v-model="form.date"
              class="form-input"
              required
            >
          </div>
          
          <!-- Godziny -->
          <div class="form-row">
            <div class="form-group">
              <label for="startTime">Godzina rozpoczęcia</label>
              <select id="startTime" v-model="form.startTime" class="form-input" required>
                <option value="" disabled>Wybierz godzinę</option>
                <option v-for="time in timeSlots" :key="`start-${time}`" :value="time">
                  {{ time }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="endTime">Godzina zakończenia</label>
              <select id="endTime" v-model="form.endTime" class="form-input" required>
                <option value="" disabled>Wybierz godzinę</option>
                <option v-for="time in availableEndTimes" :key="`end-${time}`" :value="time">
                  {{ time }}
                </option>
              </select>
            </div>
          </div>
            <!-- Dane klienta -->
          <div class="form-section">
            <h3 class="section-title">Dane klienta</h3>
            
            <!-- Wyszukiwanie klienta -->
            <div class="form-group autocomplete-container">
              <label for="clientSearch">Wyszukaj klienta</label>
              <input 
                type="text" 
                id="clientSearch" 
                v-model="clientSearchQuery"
                class="form-input" 
                placeholder="Wpisz imię lub nazwisko..."
                @input="onClientInput"
                @blur="onClientBlur"
                @focus="showClientSuggestions = clientSearchQuery.length > 0"
              >
              
              <!-- Sugestie klientów -->
              <div v-if="showClientSuggestions && filteredClients.length > 0" class="suggestions-dropdown">
                <div 
                  v-for="client in filteredClients" 
                  :key="client.id"
                  class="suggestion-item"
                  @click="selectClient(client)"
                >
                  <div class="suggestion-main">
                    <strong>{{ client.firstName }} {{ client.lastName }}</strong>
                  </div>
                  <div class="suggestion-phone">{{ client.phone }}</div>
                </div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="clientFirstName">Imię</label>
                <input 
                  type="text" 
                  id="clientFirstName" 
                  v-model="form.clientFirstName" 
                  class="form-input" 
                  placeholder="Wprowadź imię"
                  required
                >
              </div>
              
              <div class="form-group">
                <label for="clientLastName">Nazwisko</label>
                <input 
                  type="text" 
                  id="clientLastName" 
                  v-model="form.clientLastName" 
                  class="form-input" 
                  placeholder="Wprowadź nazwisko"
                  required
                >
              </div>
            </div>
            
            <div class="form-group">
              <label for="clientPhone">Telefon</label>
              <input 
                type="tel" 
                id="clientPhone" 
                v-model="form.clientPhone" 
                class="form-input" 
                placeholder="np. 123-456-789"
                required
                @blur="checkExistingClient"
              >
              <div v-if="existingClient" class="client-info">
                <small class="text-success">
                  ✓ Znaleziono klienta: {{ existingClient.firstName }} {{ existingClient.lastName }}
                </small>
              </div>
            </div>
          </div>          <!-- Usługa -->
          <div class="form-group">
            <label for="service">Usługa</label>
            <select 
              id="service" 
              v-model="form.service" 
              class="form-input" 
              required
            >
              <option value="" disabled>Wybierz usługę</option>
              <optgroup 
                v-for="category in serviceStore.categories" 
                :key="category.id" 
                :label="category.name"
              >
                <option 
                  v-for="service in availableServices.filter(s => s.categoryId === category.id)" 
                  :key="service.id" 
                  :value="service.name"
                >
                  {{ service.name }} - {{ service.price }} zł
                </option>
              </optgroup>
              <!-- Usługi bez kategorii -->
              <option 
                v-for="service in availableServices.filter(s => !s.categoryId)" 
                :key="service.id" 
                :value="service.name"
              >
                {{ service.name }} - {{ service.price }} zł
              </option>
            </select>
          </div>
          
          <!-- Notatki -->
          <div class="form-group">
            <label for="notes">Notatki</label>
            <textarea 
              id="notes" 
              v-model="form.notes" 
              class="form-input form-textarea" 
              rows="3"
              placeholder="Dodatkowe informacje..."
            ></textarea>
          </div>
          
          <!-- Status -->
          <div class="form-group">
            <label for="status">Status wizyty</label>
            <select id="status" v-model="form.status" class="form-input">
              <option value="scheduled">Zaplanowana</option>
              <option value="confirmed">Potwierdzona</option>
              <option value="completed">Zrealizowana</option>
              <option value="cancelled">Anulowana</option>
            </select>
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
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Usuń wizytę
          </button>
        </div>
        <div class="footer-right">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            Anuluj
          </button>
          <button type="button" class="btn btn-primary" @click="saveAppointment">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Zapisz wizytę
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

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
  width: 600px;
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

.appointment-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

.form-section {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
  background-color: var(--color-surface-variant);
}

.section-title {
  margin: 0 0 var(--spacing-4) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-row {
  display: flex;
  gap: var(--spacing-4);
}

.form-row .form-group {
  flex: 1;
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

.client-info {
  margin-top: var(--spacing-1);
}

.text-success {
  color: var(--color-success);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
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

/* Autocomplete styles */
.autocomplete-container {
  position: relative;
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  padding: var(--spacing-3);
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
  transition: background-color var(--transition-fast);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background-color: var(--color-surface-variant);
}

.suggestion-main {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.suggestion-phone {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-1);
}

/* Service select styles */
optgroup {
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  background-color: var(--color-surface-variant);
}

optgroup option {
  font-weight: var(--font-weight-normal);
  color: var(--color-text-secondary);
  background-color: var(--color-surface);
  padding-left: var(--spacing-4);
}
</style>