<template>
  <div class="settings">
    <div class="settings-header">
      <h1 class="settings-title">Ustawienia</h1>
      <p class="settings-subtitle">Skonfiguruj parametry swojego salonu</p>
    </div>

    <div class="settings-content">
      <!-- Profil salonu -->
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">Profil salonu</h2>
          <p class="section-description">Podstawowe informacje o Twoim salonie</p>
        </div>
        
        <div class="section-content">
          <div class="form-group">
            <label for="salonName" class="form-label">Nazwa salonu</label>
            <input
              id="salonName"
              v-model="settings.salonName"
              type="text"
              class="form-input"
              placeholder="Wprowadź nazwę salonu"
              @input="updateSalonName"
            />
          </div>

          <div class="form-group">
            <label for="salonDescription" class="form-label">Opis salonu</label>
            <textarea
              id="salonDescription"
              v-model="settings.salonDescription"
              class="form-textarea"
              rows="4"
              placeholder="Krótki opis Twojego salonu..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Godziny pracy -->
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">Godziny pracy</h2>
          <p class="section-description">Ustaw godziny otwarcia salonu</p>
        </div>
        
        <div class="section-content">
          <div class="working-hours-grid">
            <div class="form-group">
              <label for="startTime" class="form-label">Godzina otwarcia</label>
              <input
                id="startTime"
                v-model="settings.workingHours.start"
                type="time"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="endTime" class="form-label">Godzina zamknięcia</label>
              <input
                id="endTime"
                v-model="settings.workingHours.end"
                type="time"
                class="form-input"
              />
            </div>
          </div>          <div class="form-group">
            <label class="form-label">Dni pracy</label>
            <div class="days-grid">
              <label 
                v-for="(day, index) in daysOfWeek" 
                :key="index"
                class="day-checkbox"
              >
                <input
                  v-model="settings.workingDays[index].isWorking"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                <span class="day-label">{{ day }}</span>              </label>
            </div>
          </div>
          
          <!-- Szczegółowe godziny pracy dla każdego dnia -->
          <div class="form-group">
            <label class="form-label">Szczegółowe godziny pracy</label>
            <div class="working-days-detailed">
              <div 
                v-for="(day, index) in daysOfWeek" 
                :key="index"
                class="day-hours-row"
                :class="{ 'day-disabled': !settings.workingDays[index].isWorking }"
              >
                <div class="day-name-col">
                  <span class="day-name">{{ day }}</span>
                </div>
                <div class="day-status-col">
                  <span v-if="!settings.workingDays[index].isWorking" class="status-closed">Zamknięte</span>
                  <div v-else class="time-inputs">
                    <input
                      v-model="settings.workingDays[index].startTime"
                      type="time"
                      class="form-input time-input"
                      :disabled="!settings.workingDays[index].isWorking"
                    />
                    <span class="time-separator">-</span>
                    <input
                      v-model="settings.workingDays[index].endTime"
                      type="time"
                      class="form-input time-input"
                      :disabled="!settings.workingDays[index].isWorking"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div></div>
      </div>

      <!-- Sekcja zarządzania danymi -->
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">Zarządzanie danymi</h2>
          <p class="section-description">Resetuj dane, przywróć domyślne ustawienia oraz zarządzaj synchronizacją z chmurą</p>
        </div>
        
        <div class="section-content">
          <div class="data-management-grid">
            <div class="data-card">
              <div class="card-icon warning">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 3v5h5"></path>
                  <path d="M3 8a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 4"></path>
                  <path d="M21 21v-5h-5"></path>
                  <path d="M21 16a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 20"></path>
                </svg>
              </div>
              <div class="card-content">
                <h3>Reset statystyk</h3>
                <p>Wyzeruj przychody, wizyty i statystyki. Dane klientów i usług zostaną zachowane.</p>
                <button class="btn btn-warning" @click="resetStatistics">
                  Resetuj statystyki
                </button>
              </div>
            </div>

            <div class="data-card">
              <div class="card-icon danger">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6l-2 14H7L5 6m5 0V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </div>
              <div class="card-content">
                <h3>Wyczyść wszystkie dane</h3>
                <p>Usuń wszystkie dane z aplikacji - wizyty, klientów, usługi i ustawienia.</p>
                <button class="btn btn-danger" @click="clearAllData">
                  Wyczyść wszystko
                </button>
              </div>            </div>
          </div>
        </div>
      </div><!-- Przyciski akcji -->
      <div class="settings-actions">
        <button 
          class="btn btn-primary"
          @click="saveSettings"
          :disabled="isLoading"
        >
          <span v-if="isLoading">Zapisywanie...</span>
          <span v-else>Zapisz ustawienia</span>
        </button>
        
        <button 
          class="btn btn-secondary"
          @click="resetToDefaults"
        >
          Przywróć domyślne
        </button>
      </div>
    </div>

    <!-- Komunikat o zapisie -->
    <div v-if="showSaveMessage" class="save-message success">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Ustawienia zostały zapisane
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useSettingsStore } from '../stores/settingsStore';
import { useAppointmentStore } from '../stores/appointmentStore';
import { useClientStore } from '../stores/clientStore';
import { useServiceStore } from '../stores/serviceStore';

const settingsStore = useSettingsStore();
const appointmentStore = useAppointmentStore();
const clientStore = useClientStore();
const serviceStore = useServiceStore();

// Reactive data
const isLoading = ref(false);
const showSaveMessage = ref(false);

const settings = reactive({
  salonName: 'Mój Salon Fryzjerski',
  salonDescription: '',
  workingHours: {
    start: '08:00',
    end: '20:00'
  },
  workingDays: [
    { isWorking: false, startTime: '09:00', endTime: '17:00' }, // Niedziela
    { isWorking: true, startTime: '08:00', endTime: '18:00' },  // Poniedziałek
    { isWorking: true, startTime: '08:00', endTime: '18:00' },  // Wtorek
    { isWorking: true, startTime: '08:00', endTime: '18:00' },  // Środa
    { isWorking: true, startTime: '08:00', endTime: '18:00' },  // Czwartek
    { isWorking: true, startTime: '08:00', endTime: '18:00' },  // Piątek
    { isWorking: false, startTime: '09:00', endTime: '15:00' }   // Sobota
  ]
});

const daysOfWeek = [
  'Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 
  'Czwartek', 'Piątek', 'Sobota'
];

// Methods
const updateSalonName = () => {
  // Aktualizuj tytuł strony
  document.title = settings.salonName;
  
  // Aktualizuj w localStorage natychmiast
  const currentSettings = JSON.parse(localStorage.getItem('salon-settings') || '{}');
  currentSettings.salonName = settings.salonName;
  localStorage.setItem('salon-settings', JSON.stringify(currentSettings));
};

const saveSettings = async () => {
  isLoading.value = true;
  
  try {
    console.log('Settings - zapisywanie ustawień:', settings);
    
    // Symulacja opóźnienia
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Przygotuj dane do zapisania
    const settingsToSave = {
      salonName: settings.salonName,
      salonDescription: settings.salonDescription,
      workingHours: {
        start: settings.workingHours.start,
        end: settings.workingHours.end
      },
      workingDays: settings.workingDays
    };
    
    console.log('Settings - dane do zapisania:', settingsToSave);
    
    // Zapisz bezpośrednio do localStorage
    localStorage.setItem('salon-settings', JSON.stringify(settingsToSave));
    
    // Aktualizuj store
    settingsStore.updateSettings(settingsToSave);
    
    // Aktualizuj tytuł strony
    document.title = settings.salonName;
    
    // Pokaż komunikat o sukcesie
    showSaveMessage.value = true;
    setTimeout(() => {
      showSaveMessage.value = false;
    }, 3000);
    
    console.log('Settings - ustawienia zapisane pomyślnie do localStorage');
    
  } catch (error) {
    console.error('Błąd podczas zapisywania ustawień:', error);
  } finally {
    isLoading.value = false;
  }
};

// Wyczyść wszystkie dane z localStorage
const clearAllData = () => {
  if (confirm('Czy na pewno chcesz usunąć wszystkie dane? Ta operacja jest nieodwracalna.')) {
    try {
      // Użyj metod resetData ze store'ów
      appointmentStore.resetData();
      clientStore.resetData();
      serviceStore.resetData();
      
      // Lista pozostałych kluczy localStorage
      const additionalKeysToRemove = [
        'salon-settings',
        'salon-auth-user',
        'salon-auth-token',
        'salon-registered-users',
        'theme',
        'dev_messages'
      ];
      
      // Usuń pozostałe klucze
      additionalKeysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Usunięto klucz localStorage: ${key}`);
      });
      
      alert('✅ Wszystkie dane zostały wyczyszczone. Statystyki zostały wyzerowane. Odśwież stronę, aby zobaczyć efekty.');
      
      // Opcjonalnie odśwież stronę
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Błąd podczas czyszczenia danych:', error);
      alert('Wystąpił błąd podczas czyszczenia danych.');
    }
  }
};

const resetToDefaults = () => {
  Object.assign(settings, {
    salonName: 'Mój Salon Fryzjerski',
    salonDescription: '',
    workingHours: {
      start: '08:00',
      end: '20:00'
    },
    workingDays: [
      { isWorking: false, startTime: '09:00', endTime: '17:00' }, // Niedziela
      { isWorking: true, startTime: '08:00', endTime: '18:00' },  // Poniedziałek
      { isWorking: true, startTime: '08:00', endTime: '18:00' },  // Wtorek
      { isWorking: true, startTime: '08:00', endTime: '18:00' },  // Środa
      { isWorking: true, startTime: '08:00', endTime: '18:00' },  // Czwartek
      { isWorking: true, startTime: '08:00', endTime: '18:00' },  // Piątek
      { isWorking: false, startTime: '09:00', endTime: '15:00' }   // Sobota
    ]
  });
  
  console.log('Settings - przywrócono domyślne ustawienia:', settings);
};

const loadSettings = () => {
  console.log('Settings - ładowanie ustawień z store...');
  settingsStore.loadFromLocalStorage();
  
  // Kopiuj dane z store do lokalnych settings
  const storeSettings = settingsStore.settings;
  
  settings.salonName = storeSettings.salonName;
  settings.salonDescription = storeSettings.salonDescription;
  settings.workingHours = {
    start: storeSettings.workingHours.start,
    end: storeSettings.workingHours.end
  };
  settings.workingDays = [...storeSettings.workingDays]; // Kopiuj array obiektów
  
  console.log('Settings - ustawienia załadowane:', settings);
};

// Reset tylko statystyk (wizyty), zachowaj klientów i usługi
const resetStatistics = () => {
  if (confirm('Czy na pewno chcesz zresetować statystyki? Zostaną usunięte wszystkie wizyty, ale klienci i usługi pozostaną.')) {
    try {
      appointmentStore.resetData();
      alert('✅ Statystyki zostały zresetowane. Przychody zostały wyzerowane.');
    } catch (error) {
      console.error('Błąd podczas resetowania statystyk:', error);
      alert('Wystąpił błąd podczas resetowania statystyk.');
    }
  }
};

// Lifecycle
onMounted(() => {
  loadSettings();
  
  // Ustaw tytuł strony
  document.title = settings.salonName;
});

// Watch for settings changes to update store
watch(settings, (newSettings) => {
  console.log('Settings - watch triggered, nowe ustawienia:', newSettings);
  settingsStore.updateSettings(newSettings);
}, { deep: true });
</script>

<style scoped>
.settings {
  padding: var(--spacing-6);
  max-width: 1000px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: var(--spacing-8);
}

.settings-title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2) 0;
}

.settings-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin: 0;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.settings-section {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.section-header {
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-variant);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-1) 0;
}

.section-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.section-content {
  padding: var(--spacing-6);
}

.form-group {
  margin-bottom: var(--spacing-5);
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  background-color: var(--color-surface);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.working-hours-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4);
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-3);
  margin-top: var(--spacing-2);
}

.day-checkbox {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.day-checkbox:hover {
  background-color: var(--color-surface-variant);
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  position: relative;
  transition: all var(--transition-fast);
}

.checkbox-input:checked + .checkbox-custom {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  top: 1px;
  left: 4px;
  width: 6px;
  height: 10px;
  border: 2px solid white;
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}

.day-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

/* Szczegółowe godziny pracy */
.working-days-detailed {
  margin-top: var(--spacing-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.day-hours-row {
  display: flex;
  align-items: center;
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--color-border);
  transition: background-color var(--transition-fast);
}

.day-hours-row:last-child {
  border-bottom: none;
}

.day-hours-row:hover {
  background-color: var(--color-surface-variant);
}

.day-hours-row.day-disabled {
  opacity: 0.6;
  background-color: rgba(var(--color-surface-variant-rgb), 0.3);
}

.day-name-col {
  flex: 0 0 120px;
}

.day-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.day-status-col {
  flex: 1;
  display: flex;
  align-items: center;
}

.status-closed {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  font-style: italic;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.time-input {
  width: 100px;
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-sm);
}

.time-separator {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.settings-actions {
  display: flex;
  gap: var(--spacing-4);
  justify-content: flex-end;
  padding-top: var(--spacing-6);
  border-top: 1px solid var(--color-border);
}

.btn {
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  min-width: 120px;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--color-surface-variant);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-border);
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: 1px solid #dc3545;
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #bd2130;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Sekcja zarządzania danymi */
.data-management-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-4);
}

.data-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  transition: all var(--transition-fast);
}

.data-card:hover {
  border-color: var(--color-primary-light);
  box-shadow: var(--shadow-md);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-2);
}

.card-icon.warning {
  background: linear-gradient(135deg, #FFA726, #FF9800);
  color: white;
}

.card-icon.danger {
  background: linear-gradient(135deg, #EF5350, #F44336);
  color: white;
}

.card-icon.info {
  background: linear-gradient(135deg, #42A5F5, #2196F3);
  color: white;
}

.card-content h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2) 0;
}

.card-content p {  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-3) 0;
  line-height: 1.5;
}

.btn.btn-warning {
  background: linear-gradient(135deg, #FFA726, #FF9800);
  color: white;
  border: none;
}

.btn.btn-warning:hover {
  background: linear-gradient(135deg, #FF9800, #F57C00);
}

@media (max-width: 768px) {
  .data-management-grid {
    grid-template-columns: 1fr;
  }
  
  .working-hours-grid {
    grid-template-columns: 1fr;
  }
  
  .settings-actions {
    flex-direction: column;
  }
  
  .days-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
}
</style>