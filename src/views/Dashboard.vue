<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">Panel główny</h1>
        <p class="dashboard-subtitle">
          Witaj w systemie zarządzania <span class="text-gradient">salonem fryzjerskim</span>
        </p>
      </div>
      <div class="header-actions">
        <button class="quick-action-btn" @click="createQuickAppointment">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
          <span>Nowa wizyta</span>
        </button>
      </div>
    </div>

    <!-- Statystyki -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon clients">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ clientStore.clients.length }}</div>
          <div class="stat-label">Klienci</div>
          <div class="stat-change positive">+0% vs. poprzedni miesiąc</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon appointments">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ appointmentStore.appointments.length }}</div>
          <div class="stat-label">Wizyty</div>
          <div class="stat-change neutral">0% vs. poprzedni miesiąc</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon services">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="6" cy="6" r="3"></circle>
            <circle cx="6" cy="18" r="3"></circle>
            <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
            <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
            <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ serviceStore.services.length }}</div>
          <div class="stat-label">Usługi</div>
          <div class="stat-change positive">+0% vs. poprzedni miesiąc</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon revenue">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div class="stat-content">
          <div class="stat-number">0 zł</div>
          <div class="stat-label">Przychód</div>
          <div class="stat-change neutral">+0% vs. poprzedni miesiąc</div>
        </div>
      </div>
    </div>

    <!-- Główna zawartość -->
    <div class="dashboard-content">
      <!-- Dzisiejsze wizyty -->
      <div class="content-section">
        <div class="section-header">
          <h2 class="section-title">Dzisiejsze wizyty</h2>
          <router-link to="/calendar" class="section-link">
            Zobacz wszystkie
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18l6-6-6-6"></path>
            </svg>
          </router-link>
        </div>
        
        <div class="appointments-list">
          <div v-if="todayAppointments.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h3>Brak wizyt na dziś</h3>
            <p>Świetnie! Możesz zaplanować nowe wizyty</p>
            <button class="btn btn-primary" @click="createQuickAppointment">
              Dodaj wizytę
            </button>
          </div>
          
          <div v-else>
            <div 
              v-for="appointment in todayAppointments.slice(0, 5)" 
              :key="appointment.id"
              class="appointment-item"
            >
              <div class="appointment-time">{{ appointment.startTime }}</div>
              <div class="appointment-details">
                <div class="appointment-client">{{ appointment.clientName }}</div>
                <div class="appointment-service">{{ appointment.service }}</div>
              </div>
              <div class="appointment-status" :class="`status-${appointment.status}`">
                {{ getStatusLabel(appointment.status) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Najpopularniejsze usługi -->
      <div class="content-section">
        <div class="section-header">
          <h2 class="section-title">Najpopularniejsze usługi</h2>
          <router-link to="/services" class="section-link">
            Zobacz wszystkie
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18l6-6-6-6"></path>
            </svg>
          </router-link>
        </div>
        
        <div class="services-list">
          <div v-if="serviceStore.services.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="6" cy="6" r="3"></circle>
                <circle cx="6" cy="18" r="3"></circle>
                <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
                <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
                <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
              </svg>
            </div>
            <h3>Brak usług</h3>
            <p>Dodaj pierwsze usługi do swojego salonu</p>
            <button class="btn btn-primary" @click="$router.push('/services')">
              Dodaj usługę
            </button>
          </div>
          
          <div v-else>
            <div 
              v-for="service in popularServices.slice(0, 5)" 
              :key="service.id"
              class="service-item"
            >
              <div class="service-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="6" cy="6" r="3"></circle>
                  <circle cx="6" cy="18" r="3"></circle>
                  <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
                  <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
                  <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
                </svg>
              </div>
              <div class="service-details">
                <div class="service-name">{{ service.name }}</div>
                <div class="service-price">{{ formatCurrency(service.price) }}</div>
              </div>
              <div class="service-stats">
                <span class="usage-count">{{ service.usageCount || 0 }} razy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>    <!-- Szybkie akcje -->
    <div class="quick-actions">
      <h2 class="section-title">Szybkie akcje</h2>
      <div class="actions-grid">
        <button class="action-card" @click="$router.push('/calendar')">
          <div class="action-icon calendar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="action-content">
            <h3>Kalendarz</h3>
            <p>Zarządzaj wizytami</p>
          </div>
        </button>

        <button class="action-card" @click="$router.push('/clients')">
          <div class="action-icon clients">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="action-content">
            <h3>Dodaj klienta</h3>
            <p>Nowy klient</p>
          </div>
        </button>

        <button class="action-card" @click="$router.push('/services')">
          <div class="action-icon services">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="6" cy="6" r="3"></circle>
              <circle cx="6" cy="18" r="3"></circle>
              <line x1="20" y1="4" x2="8.12" y2="15.88"></line>
              <line x1="14.47" y1="14.48" x2="20" y2="20"></line>
              <line x1="8.12" y1="8.12" x2="12" y2="12"></line>
            </svg>
          </div>
          <div class="action-content">
            <h3>Dodaj usługę</h3>
            <p>Nowa usługa</p>
          </div>
        </button>

        <button class="action-card" @click="$router.push('/settings')">
          <div class="action-icon settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </div>
          <div class="action-content">
            <h3>Ustawienia</h3>
            <p>Konfiguracja</p>
          </div>
        </button>
      </div>
    </div>

    <!-- Modal formularza wizyty -->
    <AppointmentForm
      v-if="showAppointmentModal"
      :appointment="null"
      :initial-date="new Date()"
      @close="closeAppointmentModal"
      @save="saveAppointment"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { isToday, format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useClientStore } from '../stores/clientStore';
import { useServiceStore } from '../stores/serviceStore';
import { useAppointmentStore } from '../stores/appointmentStore';
import AppointmentForm from '../components/calendar/AppointmentForm.vue';

const clientStore = useClientStore();
const serviceStore = useServiceStore();
const appointmentStore = useAppointmentStore();

// Reactive state
const showAppointmentModal = ref(false);

// Computed properties
const todayAppointments = computed(() => {
  return appointmentStore.appointments
    .filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return isToday(appointmentDate);
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
});

const popularServices = computed(() => {
  // Sortuj usługi według liczby użyć (wszystkie będą miały 0)
  return serviceStore.services
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
});

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(amount);
};

const getStatusLabel = (status) => {
  const labels = {
    scheduled: 'Zaplanowana',
    confirmed: 'Potwierdzona',
    completed: 'Zrealizowana',
    cancelled: 'Anulowana'
  };
  return labels[status] || status;
};

const createQuickAppointment = () => {
  showAppointmentModal.value = true;
};

const closeAppointmentModal = () => {
  showAppointmentModal.value = false;
};

const saveAppointment = (appointmentData) => {
  console.log('Dashboard - zapisywanie wizyty:', appointmentData);
  // Zapisz wizytę przez store
  appointmentStore.addAppointment(appointmentData);
  console.log('Dashboard - wizyta zapisana, total wizyt:', appointmentStore.appointments.length);
  closeAppointmentModal();
};

// Lifecycle
onMounted(() => {
  clientStore.loadFromLocalStorage();
  serviceStore.loadFromLocalStorage();
  appointmentStore.loadFromLocalStorage();
});
</script>

<style scoped>
.dashboard {
  padding: var(--spacing-6);
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-8);
  gap: var(--spacing-6);
}

.header-content {
  flex: 1;
}

.header-content h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--spacing-2) 0;
  color: var(--color-text-primary);
}

.dashboard-subtitle {
  font-size: var(--font-size-lg);
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

.header-actions {
  flex-shrink: 0;
}

.quick-action-btn {
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

.quick-action-btn:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-8);
}

.stat-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  transition: all var(--transition-fast);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.clients {
  background-color: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
}

.stat-icon.appointments {
  background-color: rgba(var(--color-accent-rgb), 0.1);
  color: var(--color-accent);
}

.stat-icon.services {
  background-color: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success);
}

.stat-icon.revenue {
  background-color: rgba(var(--color-warning-rgb), 0.1);
  color: var(--color-warning);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-1);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-1);
}

.stat-change {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.stat-change.positive {
  color: var(--color-success);
}

.stat-change.negative {
  color: var(--color-error);
}

.stat-change.neutral {
  color: var(--color-text-tertiary);
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-8);
  margin-bottom: var(--spacing-8);
}

.content-section {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  border: 1px solid var(--color-border);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-5);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.section-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
}

.section-link:hover {
  color: var(--color-primary-dark);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-8);
  color: var(--color-text-secondary);
}

.empty-icon {
  margin-bottom: var(--spacing-4);
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 var(--spacing-2) 0;
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
}

.empty-state p {
  margin: 0 0 var(--spacing-4) 0;
  font-size: var(--font-size-base);
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
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.appointment-item,
.service-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  margin-bottom: var(--spacing-3);
  transition: all var(--transition-fast);
}

.appointment-item:hover,
.service-item:hover {
  background-color: var(--color-surface-variant);
  border-color: var(--color-primary);
}

.appointment-item:last-child,
.service-item:last-child {
  margin-bottom: 0;
}

.appointment-time {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  min-width: 60px;
}

.appointment-details,
.service-details {
  flex: 1;
}

.appointment-client,
.service-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-1);
}

.appointment-service,
.service-price {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.appointment-status {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
}

.status-scheduled {
  background-color: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
}

.status-confirmed {
  background-color: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success);
}

.status-completed {
  background-color: rgba(var(--color-success-rgb), 0.2);
  color: var(--color-success);
}

.status-cancelled {
  background-color: rgba(var(--color-error-rgb), 0.1);
  color: var(--color-error);
}

.service-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  background-color: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.service-stats {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.usage-count {
  background-color: var(--color-surface-variant);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
}

.quick-actions {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  border: 1px solid var(--color-border);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
  margin-top: var(--spacing-5);
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: center;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon.calendar {
  background-color: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
}

.action-icon.clients {
  background-color: rgba(var(--color-accent-rgb), 0.1);
  color: var(--color-accent);
}

.action-icon.services {
  background-color: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success);
}

.action-icon.settings {
  background-color: rgba(var(--color-warning-rgb), 0.1);
  color: var(--color-warning);
}

.action-content h3 {
  margin: 0 0 var(--spacing-1) 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.action-content p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: var(--spacing-4);
    align-items: stretch;
  }
  
  .actions-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .header-actions {
    align-self: flex-start;
  }
}
</style>