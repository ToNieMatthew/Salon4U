<template>
  <div class="clients-view">
    <div class="clients-header">
      <div class="header-left">
        <h1 class="clients-title">Klienci</h1>
        <p class="clients-description">
          Zarządzaj bazą <span class="text-gradient">klientów</span> swojego salonu
        </p>
      </div>
      
      <div class="header-right">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Szukaj klientów..." 
            class="search-input"
          >
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
        </div>
        
        <button class="action-button" @click="openNewClientModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
          <span>Nowy klient</span>
        </button>
      </div>
    </div>
    
    <div v-if="clientStore.isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Ładowanie klientów...</p>
    </div>
    
    <div v-else-if="clientStore.error" class="error-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>
      <h3>Błąd podczas ładowania</h3>
      <p>{{ clientStore.error }}</p>
      <button class="btn btn-primary" @click="clientStore.loadFromLocalStorage">Spróbuj ponownie</button>
    </div>
    
    <div v-else-if="filteredClients.length === 0" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      <h2>{{ getEmptyStateTitle() }}</h2>
      <p>{{ getEmptyStateMessage() }}</p>
      <button class="btn btn-primary mt-4" @click="openNewClientModal">Dodaj klienta</button>
    </div>
    
    <div v-else class="clients-grid">
      <div 
        v-for="client in filteredClients" 
        :key="client.id" 
        class="client-card"
        @click="editClient(client)"
      >
        <div class="client-avatar">
          {{ getInitials(client) }}
        </div>        <div class="client-info">
          <h3 class="client-name">{{ client.firstName }} {{ client.lastName }}</h3>
          <p class="client-phone">{{ client.phone }}</p>
          <div class="client-meta">
            <span class="client-visits" v-if="client.totalVisits">
              {{ client.totalVisits }} wizyt
            </span>
            <span class="client-date">
              Dodany {{ formatDate(client.createdAt) }}
            </span>
          </div>
        </div>
        <div class="client-actions" @click.stop>
          <button 
            class="action-btn edit-btn" 
            @click="editClient(client)"
            title="Edytuj klienta"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 1 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button 
            class="action-btn delete-btn" 
            @click="deleteClient(client.id)"
            title="Usuń klienta"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal formularza klienta -->
    <ClientForm
      v-if="showClientModal"
      :client="currentClient"
      @close="closeClientModal"
      @save="saveClient"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useClientStore } from '../stores/clientStore';
import ClientForm from '../components/client/ClientForm.vue';

const clientStore = useClientStore();

const searchQuery = ref('');
const showClientModal = ref(false);
const currentClient = ref(null);

// Computed properties
const filteredClients = computed(() => {
  if (!searchQuery.value) {
    return clientStore.clients;
  }
  
  const query = searchQuery.value.toLowerCase();  return clientStore.clients.filter(client => 
    client.firstName.toLowerCase().includes(query) ||
    client.lastName.toLowerCase().includes(query) ||
    client.phone.includes(query)
  );
});

// Methods
const getInitials = (client) => {
  return `${client.firstName.charAt(0)}${client.lastName.charAt(0)}`.toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), 'd MMM yyyy', { locale: pl });
  } catch {
    return '';
  }
};

const getEmptyStateTitle = () => {
  return searchQuery.value ? 'Brak wyników' : 'Brak klientów';
};

const getEmptyStateMessage = () => {
  return searchQuery.value 
    ? `Nie znaleziono klientów pasujących do "${searchQuery.value}"`
    : 'Dodaj pierwszego klienta, aby rozpocząć';
};

// Event handlers
const openNewClientModal = () => {
  console.log('Otwieranie formularza nowego klienta');
  currentClient.value = null;
  showClientModal.value = true;
};

const editClient = (client) => {
  console.log('Edycja klienta:', client);
  currentClient.value = { ...client }; // Tworzymy kopię obiektu
  showClientModal.value = true;
};

const deleteClient = (clientId) => {
  console.log('Usuwanie klienta:', clientId);
  if (confirm('Czy na pewno chcesz usunąć tego klienta?')) {
    clientStore.deleteClient(clientId);
  }
};

const closeClientModal = () => {
  console.log('Zamykanie formularza klienta');
  showClientModal.value = false;
  currentClient.value = null;
};

const saveClient = (clientData) => {
  console.log('Zapisywanie klienta:', clientData);
  
  if (clientData.id && currentClient.value) {
    // Edycja istniejącego klienta
    clientStore.updateClient(clientData.id, clientData);
  } else {
    // Dodawanie nowego klienta
    const newClient = {
      ...clientData,
      id: `client_${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalVisits: 0
    };
    clientStore.addClient(newClient);
  }
  
  closeClientModal();
};

// Lifecycle
onMounted(() => {
  console.log('Wczytywanie danych klientów z Cloud Storage...');
  clientStore.loadFromCloudStorage();
});
</script>

<style scoped>
.clients-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.clients-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-6);
  gap: var(--spacing-6);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.clients-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
  color: var(--color-text-primary);
}

.clients-description {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

.text-gradient {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: var(--font-weight-bold);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.search-box {
  position: relative;
  min-width: 300px;
}

.search-input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-3) var(--spacing-12);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  background-color: var(--color-surface);
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.search-icon {
  position: absolute;
  left: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
}

.action-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-5);
  border-radius: var(--radius-full);
  border: none;
  background-color: var(--color-primary);
  color: white;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.action-button:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  text-align: center;
  color: var(--color-text-secondary);
  flex: 1;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-4);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state h2,
.error-state h3 {
  margin: var(--spacing-4) 0 var(--spacing-2) 0;
  font-size: var(--font-size-xl);
  color: var(--color-text-primary);
}

.clients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-4);
  flex: 1;
}

.client-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-4);
  position: relative;
}

.client-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.client-avatar {
  width: 50px;
  height: 50px;
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.client-info {
  flex: 1;
  min-width: 0;
}

.client-name {
  margin: 0 0 var(--spacing-1) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.client-phone {
  margin: 0 0 var(--spacing-1) 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.client-meta {
  display: flex;
  gap: var(--spacing-3);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.client-actions {
  display: flex;
  gap: var(--spacing-2);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.client-card:hover .client-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.edit-btn {
  background-color: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
}

.edit-btn:hover {
  background-color: var(--color-primary);
  color: white;
}

.delete-btn {
  background-color: rgba(var(--color-error-rgb), 0.1);
  color: var(--color-error);
}

.delete-btn:hover {
  background-color: var(--color-error);
  color: white;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
}

.mt-4 {
  margin-top: var(--spacing-4);
}
</style>
