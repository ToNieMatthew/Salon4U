import { defineStore } from 'pinia';
import { ref } from 'vue';
import { googleCloudService } from '../services/googleCloudService.js';
import { GOOGLE_CLOUD_CONFIG } from '../config/google-cloud.js';

export const useAppointmentStore = defineStore('appointments', () => {
  // Pusta lista wizyt
  const appointments = ref([]);
  const isLoading = ref(false);
  const error = ref(null);  // Dodaj wizytę z pełną integracją Google Cloud
  const addAppointment = async (appointment) => {
    console.log('👤 Dodawanie nowej wizyty:', appointment);
    isLoading.value = true;
    error.value = null;
    
    try {      const newAppointment = {
        ...appointment,
        id: appointment.id || `appointment_${Date.now()}`,
        createdAt: appointment.createdAt || new Date().toISOString(),
        status: appointment.status || 'scheduled', // Zachowaj status z formularza lub ustaw domyślny
        cloudSync: false,
        syncStatus: 'pending'
      };
      
      console.log('📋 Przygotowane dane do wysłania do Cloud:', newAppointment);
      
      // 🚀 GŁÓWNA INTEGRACJA Z GOOGLE CLOUD API
      console.log('☁️ Rozpoczynam tworzenie wizyty w Cloud...');
      
      const createResult = await googleCloudService.createAppointment(newAppointment);
      
      console.log('📈 Rezultat z Cloud Function:', createResult);
      
      if (createResult.success) {
        // Dodaj do lokalnej tablicy jeśli utworzono w Cloud
        appointments.value.push(createResult.appointment);
        saveToLocalStorage();
        
        console.log('✅ Wizyta utworzona w Cloud Storage:', createResult.appointment.id);
        
        // Publikuj event do Pub/Sub
        const eventResult = await googleCloudService.publishEvent('appointment_created', {
          appointment: createResult.appointment,
          clientInfo: {
            name: newAppointment.clientName,
            phone: newAppointment.clientPhone
          },
          serviceInfo: {
            name: newAppointment.service,
            duration: newAppointment.duration
          },
          timestamp: new Date().toISOString()
        });
        console.log('📨 Rezultat eventu:', eventResult);
        
        // Wyślij powiadomienie
        const notificationResult = await googleCloudService.sendNotification({
          type: 'appointment_confirmation',
          clientName: newAppointment.clientName,
          clientPhone: newAppointment.clientPhone,
          clientEmail: newAppointment.clientEmail,
          appointmentDate: newAppointment.date,
          appointmentTime: newAppointment.startTime,
          service: newAppointment.service,
          stylist: newAppointment.stylist,
          salon: {
            name: 'Salon Fryzjerski',
            phone: '+48 123 456 789',
            address: 'ul. Przykładowa 123, 00-000 Warszawa'
          }
        });
        console.log('🔔 Rezultat powiadomienia:', notificationResult);
        
        return createResult.appointment;
      } else {
        throw new Error(createResult.error || 'Failed to create appointment');
      }
      
    } catch (error) {
      console.error('❌ Błąd podczas dodawania wizyty:', error);
      error.value = `Błąd podczas dodawania wizyty: ${error.message}`;
        // Fallback - dodaj lokalnie
      const fallbackAppointment = {
        ...newAppointment,
        syncStatus: 'local_only',
        error: error.message
      };
      appointments.value.push(fallbackAppointment);
      saveToLocalStorage();
      
      throw error;
    } finally {
      isLoading.value = false;
    }
  };
  // Aktualizuj wizytę z pełną integracją Google Cloud
  const updateAppointment = async (id, updatedData) => {
    console.log('📝 Aktualizacja wizyty:', id);
    isLoading.value = true;
    error.value = null;
    
    try {
      const index = appointments.value.findIndex(app => app.id === id);
      if (index === -1) {
        throw new Error('Wizyta nie została znaleziona');
      }
        const oldAppointment = { ...appointments.value[index] };
      const updatedAppointment = { 
        ...appointments.value[index], 
        ...updatedData,
        updatedAt: new Date().toISOString(),
        cloudSync: false,
        syncStatus: 'pending_update'
      };
      
      appointments.value[index] = updatedAppointment;
      saveToLocalStorage();
      
      // 🚀 PEŁNA INTEGRACJA GOOGLE CLOUD
      console.log('☁️ Rozpoczynam aktualizację w Google Cloud...');
      
      // 1. Przetwórz aktualizację przez Cloud Function
      const processResult = await googleCloudService.processAppointment(updatedAppointment, 'update');
      console.log('⚙️ Rezultat przetwarzania aktualizacji:', processResult);
      
      // 2. Opublikuj event o aktualizacji
      const eventResult = await googleCloudService.publishEvent('appointment_updated', {
        oldAppointment,
        newAppointment: updatedAppointment,
        changes: Object.keys(updatedData),
        timestamp: new Date().toISOString()
      });
      console.log('📨 Rezultat eventu aktualizacji:', eventResult);
      
      // 3. Wyślij powiadomienie jeśli potrzebne
      if (this.shouldSendUpdateNotification(oldAppointment, updatedAppointment)) {
        const notificationResult = await googleCloudService.sendNotification({
          type: 'appointment_updated',
          clientName: updatedAppointment.clientName,
          clientPhone: updatedAppointment.clientPhone,
          clientEmail: updatedAppointment.clientEmail,
          oldDate: oldAppointment.date,
          newDate: updatedAppointment.date,
          oldTime: oldAppointment.startTime,
          newTime: updatedAppointment.startTime,
          service: updatedAppointment.service,
          changes: Object.keys(updatedData)
        });
        console.log('🔔 Rezultat powiadomienia o aktualizacji:', notificationResult);
      }
      
      // 4. Backup danych
      const backupResult = await googleCloudService.backupData(
        appointments.value, 
        'appointments',
        { 
          version: '2.0',
          metadata: { 
            triggerEvent: 'appointment_updated',
            appointmentId: id,
            changes: Object.keys(updatedData)
          }
        }
      );
      console.log('💾 Rezultat backup po aktualizacji:', backupResult);
        // 5. Aktualizuj status synchronizacji
      if (processResult.success && eventResult.success) {
        updatedAppointment.cloudSync = true;
        updatedAppointment.syncStatus = 'synchronized';
        updatedAppointment.cloudUpdatedAt = new Date().toISOString();
        saveToLocalStorage();
        console.log('✅ Wizyta zaktualizowana i zsynchronizowana z Google Cloud');
      }
      
      console.log('✅ Aktualizacja wizyty zakończona');
      return updatedAppointment;
      
    } catch (error) {
      console.error('❌ Błąd podczas aktualizacji wizyty:', error);
      error.value = `Błąd podczas aktualizacji wizyty: ${error.message}`;
      throw error;
    } finally {
      isLoading.value = false;
    }  };

  // Sprawdź czy wysłać powiadomienie o aktualizacji
  const shouldSendUpdateNotification = (oldAppointment, newAppointment) => {
    const significantChanges = ['date', 'startTime', 'endTime', 'service', 'stylist'];
    return significantChanges.some(field => oldAppointment[field] !== newAppointment[field]);
  };
  // Usuń wizytę z pełną integracją Google Cloud
  const deleteAppointment = async (id) => {
    console.log('🗑️ USUWANIE WIZYTY - START:', id);
    console.log('🔧 Środowisko:', window.location.hostname);
    isLoading.value = true;
    error.value = null;
    
    try {
      const appointmentToDelete = appointments.value.find(app => app.id === id);
      if (!appointmentToDelete) {
        throw new Error('Wizyta nie została znaleziona');
      }
      
      console.log('📋 Wizyta do usunięcia:', appointmentToDelete);
        // 🚀 PEŁNA INTEGRACJA GOOGLE CLOUD - NAJPIERW USUŃ Z CLOUD STORAGE
      console.log('☁️ Rozpoczynam usuwanie w Google Cloud...');
      
      // 1. Usuń z Cloud Storage
      const deleteResult = await googleCloudService.deleteAppointment(id);
      console.log('🗑️ Rezultat usuwania z Cloud Storage:', deleteResult);
      
      if (!deleteResult.success) {
        throw new Error(deleteResult.error || 'Failed to delete appointment from Cloud Storage');
      }
        // 2. Przetwórz usunięcie przez Cloud Function
      const processResult = await googleCloudService.processAppointment(appointmentToDelete, 'delete');
      console.log('⚙️ Rezultat przetwarzania usunięcia:', processResult);
      
      // 3. Opublikuj event o usunięciu
      const eventResult = await googleCloudService.publishEvent('appointment_deleted', {
        appointment: appointmentToDelete,
        deletedBy: 'user', // można rozszerzyć o informacje o użytkowniku
        timestamp: new Date().toISOString()
      });
      console.log('📨 Rezultat eventu usunięcia:', eventResult);
      
      // 4. Usuń lokalnie DOPIERO PO UDANYM usunięciu z cloud
      appointments.value = appointments.value.filter(app => app.id !== id);
      saveToLocalStorage();
      console.log('✅ Wizyta usunięta lokalnie');
      
      // 5. Backup danych po usunięciu
      const backupResult = await googleCloudService.backupData(
        appointments.value, 
        'appointments',
        { 
          version: '2.0',
          metadata: { 
            triggerEvent: 'appointment_deleted',
            deletedAppointmentId: id,
            deletedAppointment: appointmentToDelete
          }
        }
      );
      console.log('💾 Rezultat backup po usunięciu:', backupResult);
      
      console.log('✅ Wizyta usunięta i zsynchronizowana z Google Cloud');
      return true;
      
    } catch (error) {
      console.error('❌ Błąd podczas usuwania wizyty:', error);
      error.value = `Błąd podczas usuwania wizyty: ${error.message}`;
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  // ==================== GOOGLE CLOUD SYNC METHODS ====================
  
  /**
   * Synchronizuj wszystkie niezzsynchronizowane wizyty z Google Cloud
   */
  const syncWithGoogleCloud = async () => {
    console.log('🔄 Rozpoczynam pełną synchronizację z Google Cloud...');
    isLoading.value = true;
    error.value = null;
    
    try {
      const unsyncedAppointments = appointments.value.filter(app => !app.cloudSync);
      console.log(`📊 Znaleziono ${unsyncedAppointments.length} wizyt do synchronizacji`);
      
      if (unsyncedAppointments.length === 0) {
        console.log('✅ Wszystkie wizyty są zsynchronizowane');
        return { success: true, message: 'Wszystkie wizyty są zsynchronizowane' };
      }
      
      const syncResults = [];
      
      for (const appointment of unsyncedAppointments) {
        try {
          console.log(`🔄 Synchronizacja wizyty: ${appointment.id}`);
          
          // Określ akcję na podstawie statusu
          let action = 'create';
          if (appointment.status === 'pending_update') action = 'update';
          if (appointment.status === 'pending_delete') action = 'delete';
          
          // Przetwórz przez Cloud Function
          const processResult = await googleCloudService.processAppointment(appointment, action);
          
          if (processResult.success) {
            // Aktualizuj status synchronizacji
            appointment.cloudSync = true;
            appointment.status = action === 'delete' ? 'deleted' : 'confirmed';
            appointment.cloudSyncedAt = new Date().toISOString();
            
            syncResults.push({ appointmentId: appointment.id, success: true, action });
            console.log(`✅ Wizyta ${appointment.id} zsynchronizowana (${action})`);
          } else {
            syncResults.push({ 
              appointmentId: appointment.id, 
              success: false, 
              action, 
              error: processResult.error 
            });
            console.log(`❌ Błąd synchronizacji wizyty ${appointment.id}: ${processResult.error}`);
          }
          
          // Krótka przerwa między synchronizacjami
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`❌ Błąd podczas synchronizacji wizyty ${appointment.id}:`, error);
          syncResults.push({ 
            appointmentId: appointment.id, 
            success: false, 
            error: error.message 
          });
        }
      }
      
      // Zapisz po synchronizacji
      saveToLocalStorage();
      
      // Backup po synchronizacji
      await googleCloudService.backupData(
        appointments.value,
        'appointments',
        {
          version: '2.0',
          metadata: {
            triggerEvent: 'full_sync',
            syncResults: syncResults
          }
        }
      );
      
      const successCount = syncResults.filter(r => r.success).length;
      const failureCount = syncResults.filter(r => !r.success).length;
      
      console.log(`✅ Synchronizacja zakończona: ${successCount} sukces, ${failureCount} błędów`);
      
      return {
        success: failureCount === 0,
        message: `Zsynchronizowano ${successCount} z ${syncResults.length} wizyt`,
        results: syncResults
      };
      
    } catch (error) {
      console.error('❌ Błąd podczas synchronizacji:', error);
      error.value = `Błąd synchronizacji: ${error.message}`;
      return { success: false, error: error.message };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Sprawdź status synchronizacji
   */
  const getSyncStatus = () => {
    const total = appointments.value.length;
    const synced = appointments.value.filter(app => app.cloudSync).length;
    const pending = appointments.value.filter(app => !app.cloudSync).length;
    const errors = appointments.value.filter(app => app.error).length;
    
    return {
      total,
      synced,
      pending,
      errors,
      syncPercentage: total > 0 ? Math.round((synced / total) * 100) : 100,
      needsSync: pending > 0
    };
  };

  /**
   * Export wizyt do różnych formatów
   */
  const exportAppointments = async (format = 'json', dateRange = null) => {
    console.log(`📊 Export wizyt w formacie: ${format}`);
    
    try {
      let dataToExport = [...appointments.value];
      
      // Filtruj według zakresu dat jeśli podany
      if (dateRange) {
        dataToExport = dataToExport.filter(app => {
          const appointmentDate = new Date(app.date);
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end);
          return appointmentDate >= startDate && appointmentDate <= endDate;
        });
      }
      
      // Przygotuj dane do exportu
      const exportData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          format: format,
          dateRange: dateRange,
          recordCount: dataToExport.length,
          salon: 'Salon Fryzjerski',
          version: '2.0'
        },
        appointments: dataToExport
      };
      
      // Export przez Google Cloud Service
      const exportResult = await googleCloudService.exportData('appointments', format, {
        data: exportData,
        fileName: `appointments_export_${new Date().toISOString().split('T')[0]}`
      });
      
      console.log('✅ Export completed:', exportResult);
      return exportResult;
      
    } catch (error) {
      console.error('❌ Export error:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Import wizyt z pliku
   */
  const importAppointments = async (importData, options = {}) => {
    console.log('📥 Import wizyt z danych zewnętrznych');
    isLoading.value = true;
    
    try {
      const { mergeStrategy = 'append', validateData = true } = options;
      
      if (validateData) {
        // Walidacja danych importu
        if (!Array.isArray(importData)) {
          throw new Error('Dane importu muszą być tablicą');
        }
        
        for (const appointment of importData) {
          if (!appointment.clientName || !appointment.date || !appointment.startTime) {
            throw new Error('Niepełne dane wizyty w imporcie');
          }
        }
      }
      
      let importedCount = 0;
      let skippedCount = 0;
      let updatedCount = 0;
      
      for (const importedAppointment of importData) {
        // Sprawdź czy wizyta już istnieje
        const existingIndex = appointments.value.findIndex(app => 
          app.clientName === importedAppointment.clientName &&
          app.date === importedAppointment.date &&
          app.startTime === importedAppointment.startTime
        );
        
        if (existingIndex !== -1) {
          if (mergeStrategy === 'update') {
            // Aktualizuj istniejącą wizytę
            appointments.value[existingIndex] = {
              ...appointments.value[existingIndex],
              ...importedAppointment,
              id: appointments.value[existingIndex].id, // Zachowaj oryginalne ID
              updatedAt: new Date().toISOString(),
              importedAt: new Date().toISOString()
            };
            updatedCount++;
          } else {
            skippedCount++;
          }
        } else {
          // Dodaj nową wizytę
          const newAppointment = {
            ...importedAppointment,
            id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            importedAt: new Date().toISOString(),
            status: 'imported',
            cloudSync: false
          };
          
          appointments.value.push(newAppointment);
          importedCount++;
        }
      }
      
      // Zapisz po imporcie
      saveToLocalStorage();
      
      // Backup po imporcie
      await googleCloudService.backupData(
        appointments.value,
        'appointments',
        {
          version: '2.0',
          metadata: {
            triggerEvent: 'data_import',
            importStats: { importedCount, updatedCount, skippedCount }
          }
        }
      );
      
      // Publikuj event o imporcie
      await googleCloudService.publishEvent('data_imported', {
        dataType: 'appointments',
        importStats: { importedCount, updatedCount, skippedCount },
        totalRecords: appointments.value.length
      });
      
      console.log(`✅ Import zakończony: ${importedCount} nowych, ${updatedCount} zaktualizowanych, ${skippedCount} pominięto`);
      
      return {
        success: true,
        message: `Import zakończony pomyślnie`,
        stats: { importedCount, updatedCount, skippedCount }
      };
      
    } catch (error) {
      console.error('❌ Import error:', error);
      error.value = `Błąd importu: ${error.message}`;
      return { success: false, error: error.message };
    } finally {
      isLoading.value = false;
    }
  };

  // Zapisz do localStorage
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('salon-appointments', JSON.stringify(appointments.value));
      console.log('AppointmentStore - dane zapisane do localStorage');
    } catch (err) {
      console.error('AppointmentStore - błąd zapisu do localStorage:', err);
      error.value = 'Błąd zapisu danych';
    }
  };
  // Wczytaj z Cloud Storage
  const loadFromCloudStorage = async () => {
    console.log('AppointmentStore - ładowanie wizyt z Cloud Storage...');
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await googleCloudService.getAppointments();
      
      if (result.success && result.appointments.length > 0) {
        appointments.value = result.appointments;
        saveToLocalStorage();
        console.log('AppointmentStore - wczytano z Cloud Storage:', result.appointments.length);
      } else {
        console.log('AppointmentStore - fallback do localStorage...');
        await loadFromLocalStorage();
      }
    } catch (err) {
      console.error('AppointmentStore - błąd ładowania z Cloud Storage:', err);
      error.value = 'Błąd ładowania wizyt z Cloud Storage';
      await loadFromLocalStorage();
    } finally {
      isLoading.value = false;
    }
  };

  // Wczytaj z localStorage (fallback)
  const loadFromLocalStorage = async () => {
    console.log('AppointmentStore - ładowanie z localStorage...');
    try {
      const savedAppointments = localStorage.getItem('salon-appointments');
      if (savedAppointments && JSON.parse(savedAppointments).length > 0) {
        appointments.value = JSON.parse(savedAppointments);
        console.log('AppointmentStore - wczytano z localStorage:', appointments.value.length);
      } else {
        console.log('AppointmentStore - ładowanie przykładowych danych...');
        // Możesz tutaj załadować przykładowe dane jeśli potrzebne
        appointments.value = [];
        saveToLocalStorage();
        // await syncSampleDataWithCloud();
      }
    } catch (err) {
      console.error('AppointmentStore - błąd wczytywania z localStorage:', err);
      appointments.value = [];
    }
  };
  // Wywołaj inicjalizację przy starcie (podobnie jak clientStore)
  loadFromCloudStorage();

  // Funkcja do resetowania danych
  const resetData = () => {
    appointments.value = [];
    localStorage.removeItem('salon-appointments');
    console.log('🔄 Dane wizyt zostały zresetowane');
  };

  return {
    appointments,
    isLoading,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    resetData,
    saveToLocalStorage,
    loadFromLocalStorage,
    loadFromCloudStorage,
    syncWithGoogleCloud,
    getSyncStatus,
    exportAppointments,
    importAppointments
  };
});