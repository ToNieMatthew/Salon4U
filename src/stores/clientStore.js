import { defineStore } from 'pinia';
import { ref } from 'vue';
import { googleCloudService } from '../services/googleCloudService.js';

export const useClientStore = defineStore('clients', () => {
  // Lista klientów
  const clients = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // ==================== CRUD OPERATIONS WITH GOOGLE CLOUD ====================

  // Dodaj klienta
  const addClient = async (client) => {
    console.log('ClientStore - dodawanie klienta:', client);
    isLoading.value = true;
    error.value = null;
    
    try {
      const newClient = {
        ...client,
        id: client.id || `client_${Date.now()}`,
        createdAt: client.createdAt || new Date().toISOString(),
        totalVisits: client.totalVisits || 0
      };

      // Dodaj do Google Cloud Storage
      const result = await googleCloudService.createClient(newClient);
      
      if (result.success) {
        // Dodaj lokalnie tylko jeśli Cloud operacja sukces
        clients.value.push(result.client);
        saveToLocalStorage();
        console.log('ClientStore - klient dodany do Cloud Storage:', result.client.id);
      } else {
        throw new Error(result.error || 'Failed to create client');
      }
    } catch (err) {
      console.error('ClientStore - błąd dodawania klienta:', err);
      error.value = 'Błąd podczas dodawania klienta';
      
      // Fallback do lokalnego dodania
      const newClient = {
        ...client,
        id: client.id || `client_${Date.now()}`,
        createdAt: client.createdAt || new Date().toISOString(),
        totalVisits: client.totalVisits || 0
      };
      clients.value.push(newClient);
      saveToLocalStorage();
    } finally {
      isLoading.value = false;
    }
  };

  // Aktualizuj klienta
  const updateClient = async (clientId, updatedData) => {
    console.log('ClientStore - aktualizacja klienta:', clientId, updatedData);
    isLoading.value = true;
    error.value = null;
    
    try {
      const clientData = {
        ...updatedData,
        id: clientId,
        updatedAt: new Date().toISOString()
      };

      // Aktualizuj w Google Cloud Storage
      const result = await googleCloudService.updateClient(clientData);
      
      if (result.success) {
        // Aktualizuj lokalnie tylko jeśli Cloud operacja sukces
        const index = clients.value.findIndex(client => client.id === clientId);
        if (index !== -1) {
          clients.value[index] = result.client;
          saveToLocalStorage();
          console.log('ClientStore - klient zaktualizowany w Cloud Storage:', result.client.id);
        }
      } else {
        throw new Error(result.error || 'Failed to update client');
      }
    } catch (err) {
      console.error('ClientStore - błąd aktualizacji klienta:', err);
      error.value = 'Błąd podczas aktualizacji klienta';
      
      // Fallback do lokalnej aktualizacji
      const index = clients.value.findIndex(client => client.id === clientId);
      if (index !== -1) {
        clients.value[index] = {
          ...clients.value[index],
          ...updatedData,
          updatedAt: new Date().toISOString()
        };
        saveToLocalStorage();
      }
    } finally {
      isLoading.value = false;
    }
  };

  // Usuń klienta
  const deleteClient = async (clientId) => {
    console.log('ClientStore - usuwanie klienta:', clientId);
    isLoading.value = true;
    error.value = null;
    
    try {
      // Usuń z Google Cloud Storage
      const result = await googleCloudService.deleteClient(clientId);
      
      if (result.success) {
        // Usuń lokalnie tylko jeśli Cloud operacja sukces
        const index = clients.value.findIndex(client => client.id === clientId);
        if (index !== -1) {
          clients.value.splice(index, 1);
          saveToLocalStorage();
          console.log('ClientStore - klient usunięty z Cloud Storage:', clientId);
        }
      } else {
        throw new Error(result.error || 'Failed to delete client');
      }
    } catch (err) {
      console.error('ClientStore - błąd usuwania klienta:', err);
      error.value = 'Błąd podczas usuwania klienta';
      
      // Fallback do lokalnego usunięcia
      const index = clients.value.findIndex(client => client.id === clientId);
      if (index !== -1) {
        clients.value.splice(index, 1);
        saveToLocalStorage();
      }
    } finally {
      isLoading.value = false;
    }
  };

  // ==================== DATA LOADING ====================

  // Zapisz do localStorage (fallback)
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('salon-clients', JSON.stringify(clients.value));
      console.log('ClientStore - dane zapisane do localStorage');
    } catch (err) {
      console.error('ClientStore - błąd zapisu do localStorage:', err);
    }
  };

  // Wczytaj klientów z Google Cloud lub localStorage
  const loadFromCloudStorage = async () => {
    console.log('ClientStore - ładowanie klientów z Cloud Storage...');
    isLoading.value = true;
    error.value = null;
    
    try {
      // Pobierz z Google Cloud Storage
      const result = await googleCloudService.getClients();
      
      if (result.success && result.clients.length > 0) {
        clients.value = result.clients;
        saveToLocalStorage(); // Backup do localStorage
        console.log('ClientStore - wczytano z Cloud Storage:', result.clients.length);
      } else {
        // Fallback do localStorage
        console.log('ClientStore - fallback do localStorage...');
        await loadFromLocalStorage();
      }
    } catch (err) {
      console.error('ClientStore - błąd ładowania z Cloud Storage:', err);
      error.value = 'Błąd ładowania klientów z Cloud Storage';
      
      // Fallback do localStorage
      await loadFromLocalStorage();
    } finally {
      isLoading.value = false;
    }
  };  // Wczytaj z localStorage - ZAWSZE PUSTA LISTA NA START
  const loadFromLocalStorage = async () => {
    console.log('ClientStore - ładowanie z localStorage...');
    
    try {
      const savedClients = localStorage.getItem('salon-clients');
      if (savedClients && JSON.parse(savedClients).length > 0) {
        clients.value = JSON.parse(savedClients);
        console.log('ClientStore - wczytano z localStorage:', clients.value.length);
      } else {
        // ZAWSZE rozpocznij z pustą listą - NIE ŁADUJ przykładowych danych
        console.log('ClientStore - aplikacja startuje z pustą listą klientów');
        clients.value = [];
      }
    } catch (err) {
      console.error('ClientStore - błąd wczytywania z localStorage:', err);
      // ZAWSZE rozpocznij z pustą listą
      clients.value = [];    }
  };

  // Główna metoda ładowania (dla kompatybilności wstecznej)
  const loadFromLocalStorage_Legacy = () => {
    loadFromCloudStorage();
  };

  // ==================== UTILITY METHODS ====================

  // Znajdź klienta po ID
  const getClientById = (clientId) => {
    return clients.value.find(client => client.id === clientId);
  };

  // Znajdź klienta po telefonie
  const getClientByPhone = (phone) => {
    return clients.value.find(client => client.phone === phone);
  };

  // Funkcja do resetowania danych
  const resetData = () => {
    clients.value = [];
    localStorage.removeItem('salon-clients');
    console.log('🔄 Dane klientów zostały zresetowane');
  };

  return {
    clients,
    isLoading,
    error,
    addClient,
    updateClient,
    deleteClient,
    resetData,
    saveToLocalStorage,
    loadFromLocalStorage: loadFromLocalStorage_Legacy, // Kompatybilność wsteczna
    loadFromCloudStorage,
    getClientById,
    getClientByPhone
  };
});