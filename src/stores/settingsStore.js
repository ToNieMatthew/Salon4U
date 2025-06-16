import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref({
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
      { isWorking: true, startTime: '09:00', endTime: '15:00' }   // Sobota
    ]
  });

  const isLoading = ref(false);
  const error = ref(null);

  // Aktualizuj ustawienia
  const updateSettings = (newSettings) => {
    console.log('SettingsStore - aktualizacja ustawień:', newSettings);
    
    // Aktualizuj wszystkie pola
    if (newSettings.salonName !== undefined) {
      settings.value.salonName = newSettings.salonName;
    }
    if (newSettings.salonDescription !== undefined) {
      settings.value.salonDescription = newSettings.salonDescription;
    }
    if (newSettings.workingHours) {
      settings.value.workingHours = {
        start: newSettings.workingHours.start || '08:00',
        end: newSettings.workingHours.end || '20:00'
      };
    }
    if (newSettings.workingDays) {
      settings.value.workingDays = newSettings.workingDays;
    }
    
    // Zapisz do localStorage
    saveToLocalStorage();
    
    console.log('SettingsStore - ustawienia zaktualizowane:', settings.value);
  };

  // Aktualizuj tylko nazwę salonu (dla natychmiastowej zmiany)
  const updateSalonName = (newName) => {
    settings.value.salonName = newName;
    document.title = newName; // Aktualizuj tytuł strony
    saveToLocalStorage();
  };

  // Zapisz do localStorage
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('salon-settings', JSON.stringify(settings.value));
      console.log('SettingsStore - ustawienia zapisane');
    } catch (err) {
      console.error('SettingsStore - błąd zapisu:', err);
      error.value = 'Błąd zapisu ustawień';
    }
  };

  // Wczytaj z localStorage
  const loadFromLocalStorage = () => {
    console.log('SettingsStore - ładowanie ustawień...');
    isLoading.value = true;
    try {
      const savedSettings = localStorage.getItem('salon-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
          // Sprawdź czy struktura workingDays jest poprawna
        if (parsed.workingDays && Array.isArray(parsed.workingDays) && parsed.workingDays.length === 7) {
          settings.value = {
            ...settings.value,
            ...parsed
          };
        } else {
          // Jeśli struktura workingDays jest niepoprawna, wczytaj pozostałe pola
          settings.value.salonName = parsed.salonName || settings.value.salonName;
          settings.value.salonDescription = parsed.salonDescription || settings.value.salonDescription;
          if (parsed.workingHours) {
            settings.value.workingHours = {
              start: parsed.workingHours.start || settings.value.workingHours.start,
              end: parsed.workingHours.end || settings.value.workingHours.end
            };
          }
        }
        
        console.log('SettingsStore - ustawienia wczytane:', settings.value);
        
        // Aktualizuj tytuł strony
        document.title = settings.value.salonName;
      }
      error.value = null;
    } catch (err) {
      error.value = 'Błąd wczytywania ustawień';
      console.error('SettingsStore - błąd wczytywania:', err);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    updateSalonName,
    saveToLocalStorage,
    loadFromLocalStorage
  };
});