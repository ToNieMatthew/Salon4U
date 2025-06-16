import { defineStore } from 'pinia';
import { ref } from 'vue';
import { googleCloudService } from '../services/googleCloudService.js';

export const useServiceStore = defineStore('services', () => {
  // Puste kategorie
  const categories = ref([
    {
      id: 'cat1',
      name: 'Strzyżenie',
      description: 'Usługi strzyżenia i modelowania',
      color: '#7B57FF'
    },
    {
      id: 'cat2',
      name: 'Koloryzacja',
      description: 'Farbowanie i koloryzacja włosów',
      color: '#F43F5E'
    },
    {
      id: 'cat3',
      name: 'Stylizacja',
      description: 'Czesanie i stylizacja włosów',
      color: '#10B981'
    },
    {
      id: 'cat4',
      name: 'Pielęgnacja',
      description: 'Zabiegi pielęgnacyjne i regeneracyjne',
      color: '#F59E0B'
    }
  ]);

  // Puste usługi - tylko kategorie zostają
  const services = ref([]);

  const isLoading = ref(false);

  // Funkcja generująca ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };
  // Dodaj usługę z integracją Google Cloud
  const addService = async (serviceData) => {
    try {
      isLoading.value = true;
      
      const newService = {
        id: generateId(),
        ...serviceData,
        active: serviceData.active !== undefined ? serviceData.active : true,
        createdAt: new Date().toISOString()
      };
      
      console.log('☁️ Rozpoczynam tworzenie usługi w Cloud...');
      
      // Zapisz do Google Cloud Storage
      const createResult = await googleCloudService.createService(newService);
      
      if (createResult.success) {
        services.value.push(createResult.service);
        saveToLocalStorage();
        
        console.log('✅ Usługa utworzona w Cloud Storage:', createResult.service.id);
        
        // Publikuj event
        const eventResult = await googleCloudService.publishEvent('service_created', {
          service: createResult.service,
          timestamp: new Date().toISOString()
        });
        console.log('📨 Rezultat eventu:', eventResult);
        
        return { success: true, service: createResult.service };
      } else {
        throw new Error(createResult.error || 'Failed to create service');
      }
    } catch (error) {
      console.error('Błąd podczas dodawania usługi:', error);
      
      // Fallback - dodaj lokalnie
      const fallbackService = {
        ...newService,
        status: 'local_only',
        error: error.message
      };
      services.value.push(fallbackService);
      saveToLocalStorage();
      
      return { success: false, error: error.message };
    } finally {
      isLoading.value = false;
    }
  };
  // Aktualizuj usługę z integracją Google Cloud
  const updateService = async (serviceData) => {
    try {
      isLoading.value = true;
      
      const index = services.value.findIndex(s => s.id === serviceData.id);
      
      if (index === -1) {
        throw new Error('Service not found');
      }
      
      const updatedService = { 
        ...serviceData,
        updatedAt: new Date().toISOString()
      };
      
      console.log('☁️ Rozpoczynam aktualizację usługi w Cloud...');
      
      // Aktualizuj w Google Cloud Storage
      const updateResult = await googleCloudService.updateService(updatedService);
      
      if (updateResult.success) {
        services.value[index] = updateResult.service;
        saveToLocalStorage();
        
        console.log('✅ Usługa zaktualizowana w Cloud Storage:', updateResult.service.id);
        
        // Publikuj event
        const eventResult = await googleCloudService.publishEvent('service_updated', {
          service: updateResult.service,
          timestamp: new Date().toISOString()
        });
        console.log('📨 Rezultat eventu:', eventResult);
        
        return { success: true, service: updateResult.service };
      } else {
        throw new Error(updateResult.error || 'Failed to update service');
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji usługi:', error);
      
      // Fallback - aktualizuj lokalnie
      services.value[index] = updatedService;
      saveToLocalStorage();
      
      return { success: false, error: error.message };
    } finally {
      isLoading.value = false;
    }
  };
  // Usuń usługę z integracją Google Cloud
  const deleteService = async (serviceId) => {
    try {
      isLoading.value = true;
      
      const index = services.value.findIndex(s => s.id === serviceId);
      
      if (index === -1) {
        throw new Error('Service not found');
      }
      
      const serviceToDelete = services.value[index];
      
      console.log('☁️ Rozpoczynam usuwanie usługi z Cloud...');
      
      // Usuń z Google Cloud Storage
      const deleteResult = await googleCloudService.deleteService(serviceId);
      
      if (deleteResult.success) {
        services.value.splice(index, 1);
        saveToLocalStorage();
        
        console.log('✅ Usługa usunięta z Cloud Storage:', serviceId);
        
        // Publikuj event
        const eventResult = await googleCloudService.publishEvent('service_deleted', {
          serviceId: serviceId,
          serviceName: serviceToDelete.name,
          timestamp: new Date().toISOString()
        });
        console.log('📨 Rezultat eventu:', eventResult);
        
        return { success: true };
      } else {
        throw new Error(deleteResult.error || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Błąd podczas usuwania usługi:', error);
      
      // Fallback - usuń lokalnie
      const index = services.value.findIndex(s => s.id === serviceId);
      if (index !== -1) {
        services.value.splice(index, 1);
        saveToLocalStorage();
      }
      
      return { success: false, error: error.message };
    } finally {
      isLoading.value = false;
    }
  };

  // Dodaj kategorię
  const addCategory = async (categoryData) => {
    try {
      isLoading.value = true;
      
      const newCategory = {
        id: generateId(),
        ...categoryData
      };
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      categories.value.push(newCategory);
      saveToLocalStorage();
      return { success: true, category: newCategory };
    } catch (error) {
      console.error('Błąd podczas dodawania kategorii:', error);
      return { success: false, error: error.message };
    } finally {
      isLoading.value = false;
    }
  };

  // Aktualizuj kategorię
  const updateCategory = async (categoryData) => {
    try {
      isLoading.value = true;
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const index = categories.value.findIndex(c => c.id === categoryData.id);
      
      if (index === -1) {
        throw new Error('Category not found');
      }
      
      categories.value[index] = { ...categoryData };
      saveToLocalStorage();
      
      return { success: true, category: categories.value[index] };
    } catch (error) {
      console.error('Błąd podczas aktualizacji kategorii:', error);
      return { success: false, error: error.message };
    } finally {
      isLoading.value = false;
    }
  };

  // Usuń kategorię
  const deleteCategory = async (categoryId) => {
    try {
      isLoading.value = true;
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const index = categories.value.findIndex(c => c.id === categoryId);
      
      if (index === -1) {
        throw new Error('Category not found');
      }
      
      // Sprawdź czy kategoria jest używana przez jakąś usługę
      const isUsed = services.value.some(s => s.categoryId === categoryId);
      
      if (isUsed) {
        throw new Error('Cannot delete category used by services');
      }
      
      categories.value.splice(index, 1);
      saveToLocalStorage();
      
      return { success: true };
    } catch (error) {
      console.error('Błąd podczas usuwania kategorii:', error);
      return { success: false, error: error.message };
    } finally {
      isLoading.value = false;
    }
  };

  // Zapisz do localStorage
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('salon-services', JSON.stringify(services.value));
      localStorage.setItem('salon-categories', JSON.stringify(categories.value));
      console.log('ServiceStore - dane zapisane do localStorage');
    } catch (err) {
      console.error('ServiceStore - błąd zapisu do localStorage:', err);
    }
  };

  // Wczytaj z localStorage
  const loadFromLocalStorage = () => {
    console.log('ServiceStore - ładowanie z localStorage...');
    try {
      const savedServices = localStorage.getItem('salon-services');
      const savedCategories = localStorage.getItem('salon-categories');
      
      if (savedServices) {
        services.value = JSON.parse(savedServices);
        console.log('ServiceStore - wczytano usługi:', services.value.length);
      }
      
      if (savedCategories) {
        categories.value = JSON.parse(savedCategories);
        console.log('ServiceStore - wczytano kategorie:', categories.value.length);
      }
    } catch (err) {
      console.error('ServiceStore - błąd wczytywania z localStorage:', err);
    }
  };
  // Ładowanie usług z Google Cloud Storage
  const loadFromCloudStorage = async () => {
    console.log('ServiceStore - ładowanie usług z Cloud Storage...');
    try {
      isLoading.value = true;
      
      const response = await googleCloudService.getServices();
      if (response && response.success && response.services) {
        services.value = response.services;
        console.log(`✅ ServiceStore - wczytano ${response.services.length} usług z Cloud`);
        
        // Zapisz też lokalnie jako backup
        saveToLocalStorage();
      } else {
        console.log('ServiceStore - brak usług w Cloud, używam localStorage');
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('❌ ServiceStore - błąd ładowania z Cloud:', error);
      // Fallback do localStorage
      loadFromLocalStorage();
    } finally {
      isLoading.value = false;
    }
  };

  // Funkcja do resetowania danych
  const resetData = () => {
    categories.value = [];
    services.value = [];
    localStorage.removeItem('salon-categories');
    localStorage.removeItem('salon-services');
    console.log('🔄 Dane usług i kategorii zostały zresetowane');
  };
  // Wywołaj przy inicjalizacji
  loadFromCloudStorage();

  return {
    categories,
    services,
    isLoading,
    addService,
    updateService,
    deleteService,
    addCategory,
    updateCategory,
    deleteCategory,
    resetData,
    saveToLocalStorage,
    loadFromLocalStorage,
    loadFromCloudStorage
  };
});