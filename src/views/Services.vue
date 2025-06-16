<template>
  <div class="services-view">
    <div class="services-header">
      <div class="header-left">
        <h1 class="services-title text-gradient">Usługi</h1>
        <p class="services-description">
          Zarządzaj usługami oferowanymi przez Twój salon
        </p>
      </div>
      
      <div class="header-right">
        <div class="search-container">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Szukaj usługi..."
            class="search-input"
          />
          <svg
            v-if="!searchQuery"
            class="search-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <button
            v-else
            class="clear-button"
            @click="searchQuery = ''"
            title="Wyczyść wyszukiwanie"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <button class="btn btn-primary" @click="openServiceForm()">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Dodaj usługę
        </button>
      </div>
    </div>
    
    <!-- Categories -->
    <div class="category-tabs">
      <button 
        class="category-tab" 
        :class="{ 'active': selectedCategory === 'all' }"
        @click="selectedCategory = 'all'"
      >
        Wszystkie
      </button>
      <button 
        v-for="category in categories" 
        :key="category.id"
        class="category-tab" 
        :class="{ 'active': selectedCategory === category.id }"
        @click="selectedCategory = category.id"
      >
        {{ category.name }}
      </button>
      <button class="category-tab add-category" @click="openCategoryForm()">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
    
    <!-- Services list -->
    <div v-if="filteredServices.length > 0" class="services-list">
      <div v-for="service in filteredServices" :key="service.id" class="service-card">
        <div class="service-header">
          <h3 class="service-name">{{ service.name }}</h3>
          <div class="service-actions">
            <button class="action-btn edit" @click="editService(service)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="action-btn delete" @click="confirmDeleteService(service)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="service-details">
          <div class="detail-item">
            <span class="detail-label">Czas trwania:</span>
            <span class="detail-value">{{ service.duration }} min</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Cena:</span>
            <span class="detail-value">{{ formatCurrency(service.price) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Kategoria:</span>
            <span class="detail-value">{{ getCategoryName(service.categoryId) }}</span>
          </div>
        </div>
        
        <p v-if="service.description" class="service-description">
          {{ service.description }}
        </p>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-else class="empty-state">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
      </svg>
      <h3 class="empty-title">{{ getEmptyStateMessage() }}</h3>
      <p class="empty-description">
        {{ 
          selectedCategory !== 'all' 
            ? 'Spróbuj wybrać inną kategorię lub dodaj nową usługę w tej kategorii.' 
            : 'Zacznij od dodania swojej pierwszej usługi.' 
        }}
      </p>
      <button class="btn btn-primary" @click="openServiceForm()">
        Dodaj usługę
      </button>
    </div>
    
    <!-- Service form modal -->
    <div v-if="showServiceForm" class="modal">
      <div class="modal-backdrop" @click="showServiceForm = false"></div>
      <div class="modal-container">
        <ServiceForm 
          :service="currentService"
          :categories="categories"
          :is-submitting="isSubmitting"
          @submit="submitService"
          @close="showServiceForm = false"
        />
      </div>
    </div>
    
    <!-- Category form modal -->
    <div v-if="showCategoryForm" class="modal">
      <div class="modal-backdrop" @click="showCategoryForm = false"></div>
      <div class="modal-container">
        <CategoryForm 
          :category="currentCategory"
          :is-submitting="isSubmitting"
          @submit="submitCategory"
          @close="showCategoryForm = false"
        />
      </div>
    </div>
    
    <!-- Confirmation modal -->
    <div v-if="showDeleteConfirmation" class="modal">
      <div class="modal-backdrop" @click="showDeleteConfirmation = false"></div>
      <div class="modal-container confirmation-modal">
        <div class="confirmation-header">
          <h3 class="confirmation-title">Potwierdź usunięcie</h3>
          <button class="close-button" @click="showDeleteConfirmation = false">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="confirmation-body">
          <p>Czy na pewno chcesz usunąć usługę "<b>{{ serviceToDelete?.name }}</b>"? Tej operacji nie można cofnąć.</p>
        </div>
        <div class="confirmation-footer">
          <button class="btn btn-outline" @click="showDeleteConfirmation = false">Anuluj</button>
          <button class="btn btn-danger" @click="deleteService" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="spinner"></span>
            <span>Usuń usługę</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useServiceStore } from '../stores/serviceStore';
import ServiceForm from '../components/service/ServiceForm.vue';
import CategoryForm from '../components/service/CategoryForm.vue';

const serviceStore = useServiceStore();

const searchQuery = ref('');
const selectedCategory = ref('all');
const showServiceForm = ref(false);
const showCategoryForm = ref(false);
const showDeleteConfirmation = ref(false);
const currentService = ref(null);
const currentCategory = ref(null);
const serviceToDelete = ref(null);
const isSubmitting = ref(false);

// Filtered services based on search query and selected category
const filteredServices = computed(() => {
  let result = serviceStore.services;
  
  // Filter by category
  if (selectedCategory.value !== 'all') {
    result = result.filter(service => service.categoryId === selectedCategory.value);
  }
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(service => 
      service.name.toLowerCase().includes(query) ||
      service.description?.toLowerCase().includes(query)
    );
  }
  
  return result;
});

const categories = computed(() => {
  return serviceStore.categories;
});

// Form handling
const openServiceForm = (service = null) => {
  currentService.value = service ? { ...service } : null;
  showServiceForm.value = true;
};

const openCategoryForm = (category = null) => {
  currentCategory.value = category ? { ...category } : null;
  showCategoryForm.value = true;
};

const submitService = async (serviceData) => {
  isSubmitting.value = true;
  
  try {
    if (serviceData.id) {
      await serviceStore.updateService(serviceData);
    } else {
      await serviceStore.addService(serviceData);
    }
    
    showServiceForm.value = false;
  } catch (error) {
    console.error('Error submitting service:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const submitCategory = async (categoryData) => {
  isSubmitting.value = true;
  
  try {
    if (categoryData.id) {
      await serviceStore.updateCategory(categoryData);
    } else {
      await serviceStore.addCategory(categoryData);
    }
    
    showCategoryForm.value = false;
  } finally {
    isSubmitting.value = false;
  }
};

// Edit service
const editService = (service) => {
  openServiceForm(service);
};

// Delete service
const confirmDeleteService = (service) => {
  serviceToDelete.value = service;
  showDeleteConfirmation.value = true;
};

const deleteService = async () => {
  if (!serviceToDelete.value) return;
  
  isSubmitting.value = true;
  
  try {
    await serviceStore.deleteService(serviceToDelete.value.id);
    showDeleteConfirmation.value = false;
    serviceToDelete.value = null;
  } catch (error) {
    console.error('Error deleting service:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Utilities
const getCategoryName = (categoryId) => {
  const category = categories.value.find(cat => cat.id === categoryId);
  return category ? category.name : 'Brak kategorii';
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
};

const getEmptyStateMessage = () => {
  if (selectedCategory !== 'all' && searchQuery.value) {
    return 'Nie znaleziono usług w tej kategorii z podanym wyszukiwaniem';
  } else if (selectedCategory !== 'all') {
    return `Brak usług w kategorii "${getCategoryName(selectedCategory.value)}"`;
  } else if (searchQuery.value) {
    return 'Nie znaleziono usług dla podanego wyszukiwania';
  } else {
    return 'Brak usług do wyświetlenia';
  }
};
</script>

<style scoped>
.services-view {
  height: 100%;
}

.services-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-6);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.services-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.services-description {
  font-size: var(--font-size-md);
  color: var(--color-text-tertiary);
  margin: 0;
}

.text-gradient {
  background: linear-gradient(to right, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.header-right {
  display: flex;
  gap: var(--spacing-4);
}

.search-container {
  position: relative;
  width: 240px;
}

.search-input {
  width: 100%;
  padding: var(--spacing-2) var(--spacing-4);
  padding-left: var(--spacing-8);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
}

.search-icon {
  position: absolute;
  left: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.clear-button {
  position: absolute;
  right: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.clear-button:hover {
  color: var(--color-primary);
}

.category-tabs {
  display: flex;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-6);
  overflow-x: auto;
  padding-bottom: var(--spacing-2);
  scrollbar-width: thin;
}

.category-tabs::-webkit-scrollbar {
  height: 4px;
}

.category-tabs::-webkit-scrollbar-track {
  background: var(--color-surface-variant);
  border-radius: var(--radius-full);
}

.category-tabs::-webkit-scrollbar-thumb {
  background: var(--color-text-tertiary);
  border-radius: var(--radius-full);
}

.category-tab {
  padding: var(--spacing-2) var(--spacing-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.category-tab:hover {
  background-color: var(--color-surface-variant);
  border-color: var(--color-text-tertiary);
}

.category-tab.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.category-tab.add-category {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.services-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-6);
}

.service-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.service-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.service-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.service-actions {
  display: flex;
  gap: var(--spacing-2);
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: none;
  background-color: var(--color-surface-variant);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn.edit:hover {
  background-color: var(--color-secondary);
  color: white;
}

.action-btn.delete:hover {
  background-color: var(--color-primary);
  color: white;
}

.service-details {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
}

.detail-item {
  display: flex;
  flex-direction: column;
  min-width: 100px;
  flex: 1;
}

.detail-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-1);
}

.detail-value {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.service-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-10) 0;
  color: var(--color-text-tertiary);
  text-align: center;
}

.empty-state svg {
  margin-bottom: var(--spacing-4);
  color: var(--color-border);
}

.empty-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.empty-description {
  font-size: var(--font-size-md);
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-6);
  max-width: 400px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.modal-container {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-lg);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  z-index: 1001;
}

.confirmation-modal {
  max-width: 450px;
}

.confirmation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--color-border);
}

.confirmation-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0;
  color: var(--color-primary);
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

.confirmation-body {
  margin-bottom: var(--spacing-6);
}

.confirmation-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border);
}

.btn-danger {
  background-color: var(--color-status-error);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #d32f2f;
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