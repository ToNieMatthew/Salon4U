<template>
  <div class="statistics-view">
    <div class="statistics-header">
      <div class="header-left">
        <h1 class="statistics-title text-gradient">Statystyki</h1>
        <div class="period-selector">
          <button 
            v-for="period in periods" 
            :key="period.value"
            :class="['period-button', { 'active': selectedPeriod === period.value }]"
            @click="selectedPeriod = period.value"
          >
            {{ period.label }}
          </button>
        </div>
      </div>
      
      <div class="header-right">
        <div class="date-range">
          <button class="range-button" @click="previousPeriod">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <span class="range-label">{{ formatPeriodLabel }}</span>
          
          <button class="range-button" @click="nextPeriod">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        
        <button class="export-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Eksportuj</span>
        </button>
      </div>
    </div>

    <!-- Statistics cards -->
    <div class="stats-cards">
      <div class="stats-card">
        <div class="card-icon revenue">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div class="card-content">
          <div class="card-value">{{ formatCurrency(statistics.revenue) }}</div>
          <div class="card-label">Przychód</div>
          <div class="card-trend" :class="getTrendClass(statistics.revenueTrend)">
            <svg v-if="statistics.revenueTrend > 0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            <span>{{ formatTrend(statistics.revenueTrend) }}</span>
          </div>
        </div>
      </div>
      
      <div class="stats-card">
        <div class="card-icon clients">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="card-content">
          <div class="card-value">{{ statistics.clients }}</div>
          <div class="card-label">Klienci</div>
          <div class="card-trend" :class="getTrendClass(statistics.clientsTrend)">
            <svg v-if="statistics.clientsTrend > 0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            <span>{{ formatTrend(statistics.clientsTrend) }}</span>
          </div>
        </div>
      </div>
      
      <div class="stats-card">
        <div class="card-icon appointments">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="card-content">
          <div class="card-value">{{ statistics.appointments }}</div>
          <div class="card-label">Wizyty</div>
          <div class="card-trend" :class="getTrendClass(statistics.appointmentsTrend)">
            <svg v-if="statistics.appointmentsTrend > 0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            <span>{{ formatTrend(statistics.appointmentsTrend) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Charts -->
    <div class="charts-section">
      <div class="chart-card">
        <div class="chart-header">
          <h2 class="chart-title">Przychód miesięczny</h2>
          <div class="chart-toolbar">
            <button class="chart-toggle active">Wykres</button>
            <button class="chart-toggle">Tabela</button>
          </div>
        </div>
        <div class="chart-content">
          <!-- Placeholder for chart -->
          <div class="chart-placeholder">
            <div class="revenue-chart-placeholder"></div>
          </div>
        </div>
      </div>
      
      <div class="chart-card">
        <div class="chart-header">
          <h2 class="chart-title">Najpopularniejsze usługi</h2>
        </div>
        <div class="chart-content">
          <div class="popular-services">
            <div v-for="(service, index) in popularServices" :key="index" class="service-stat">
              <div class="service-name">{{ service.name }}</div>
              <div class="service-bar-container">
                <div class="service-bar" :style="{ width: `${service.percentage}%`, backgroundColor: getServiceColor(index) }"></div>
              </div>
              <div class="service-count">{{ service.count }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useAppointmentStore } from '../stores/appointmentStore.js';
import { useClientStore } from '../stores/clientStore.js';
import { useServiceStore } from '../stores/serviceStore.js';

const appointmentStore = useAppointmentStore();
const clientStore = useClientStore();
const serviceStore = useServiceStore();

const selectedPeriod = ref('month');
const currentDate = ref(new Date());

const periods = [
  { label: 'Dzień', value: 'day' },
  { label: 'Tydzień', value: 'week' },
  { label: 'Miesiąc', value: 'month' },
  { label: 'Rok', value: 'year' }
];

// Computed statistics based on real data
const getCurrentPeriodInterval = computed(() => {
  const date = currentDate.value;
  switch (selectedPeriod.value) {
    case 'day':
      return { start: startOfDay(date), end: endOfDay(date) };
    case 'week':
      return { start: startOfWeek(date, { locale: pl }), end: endOfWeek(date, { locale: pl }) };
    case 'month':
      return { start: startOfMonth(date), end: endOfMonth(date) };
    case 'year':
      return { start: startOfYear(date), end: endOfYear(date) };
    default:
      return { start: startOfMonth(date), end: endOfMonth(date) };
  }
});

const filteredAppointments = computed(() => {
  const interval = getCurrentPeriodInterval.value;
  return appointmentStore.appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return isWithinInterval(appointmentDate, interval);
  });
});

const statistics = computed(() => {
  const appointments = filteredAppointments.value;
  
  // Calculate revenue
  const revenue = appointments.reduce((total, appointment) => {
    const service = serviceStore.services.find(s => s.name === appointment.service);
    return total + (service?.price || 0);
  }, 0);
  
  // Count completed appointments (you can add status logic here)
  const completedAppointments = appointments.filter(a => a.status !== 'cancelled').length;
  
  // Count unique clients
  const uniqueClients = new Set(appointments.map(a => a.clientId)).size;
  
  return {
    revenue: revenue,
    revenueTrend: 0, // You can calculate this by comparing with previous period
    clients: uniqueClients,
    clientsTrend: 0,
    appointments: completedAppointments,
    appointmentsTrend: 0
  };
});

const popularServices = computed(() => {
  const appointments = filteredAppointments.value;
  const serviceCounts = {};
  
  appointments.forEach(appointment => {
    const serviceName = appointment.service;
    serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
  });
  
  const sortedServices = Object.entries(serviceCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  const maxCount = sortedServices[0]?.[1] || 1;
  
  return sortedServices.map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / maxCount) * 100)
  }));
});

const formatPeriodLabel = computed(() => {
  switch (selectedPeriod.value) {
    case 'day':
      return format(currentDate.value, 'EEEE, d MMMM yyyy', { locale: pl });
    case 'week':
      return `Tydzień ${format(currentDate.value, 'w, yyyy', { locale: pl })}`;
    case 'month':
      return format(currentDate.value, 'LLLL yyyy', { locale: pl });
    case 'year':
      return format(currentDate.value, 'yyyy');
    default:
      return format(currentDate.value, 'LLLL yyyy', { locale: pl });
  }
});

const previousPeriod = () => {
  switch (selectedPeriod.value) {
    case 'day':
      currentDate.value = subDays(currentDate.value, 1);
      break;
    case 'week':
      currentDate.value = subWeeks(currentDate.value, 1);
      break;
    case 'month':
      currentDate.value = subMonths(currentDate.value, 1);
      break;
    case 'year':
      currentDate.value = new Date(currentDate.value.getFullYear() - 1, 0, 1);
      break;
  }
};

const nextPeriod = () => {
  switch (selectedPeriod.value) {
    case 'day':
      currentDate.value = addDays(currentDate.value, 1);
      break;
    case 'week':
      currentDate.value = addWeeks(currentDate.value, 1);
      break;
    case 'month':
      currentDate.value = addMonths(currentDate.value, 1);
      break;
    case 'year':
      currentDate.value = new Date(currentDate.value.getFullYear() + 1, 0, 1);
      break;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
};

const formatTrend = (value) => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

const getTrendClass = (value) => {
  return value >= 0 ? 'positive' : 'negative';
};

const getServiceColor = (index) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2'];
  return colors[index % colors.length];
};
</script>

<style scoped>
.statistics-view {
  height: 100%;
}

.statistics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.statistics-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.period-selector {
  display: flex;
  background-color: var(--color-surface-variant);
  border-radius: var(--radius-full);
  padding: var(--spacing-1);
  width: fit-content;
}

.period-button {
  padding: var(--spacing-2) var(--spacing-4);
  border: none;
  background: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.period-button:hover {
  color: var(--color-primary);
}

.period-button.active {
  background-color: var(--color-surface);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.date-range {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  background-color: var(--color-surface);
  border-radius: var(--radius-full);
  padding: var(--spacing-1) var(--spacing-2);
  box-shadow: var(--shadow-sm);
}

.range-button {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.range-button:hover {
  background-color: var(--color-primary-light);
  color: white;
}

.range-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  text-transform: capitalize;
  padding: 0 var(--spacing-2);
  min-width: 120px;
  text-align: center;
}

.export-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.export-button:hover {
  background-color: var(--color-surface-variant);
  border-color: var(--color-primary-light);
  color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-8);
}

.stats-card {
  display: flex;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-sm);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--spacing-4);
  flex-shrink: 0;
}

.card-icon.revenue {
  background: linear-gradient(135deg, #66BB6A, #43A047);
  color: white;
}

.card-icon.clients {
  background: linear-gradient(135deg, #42A5F5, #1E88E5);
  color: white;
}

.card-icon.appointments {
  background: linear-gradient(135deg, #FFA726, #FF9800);
  color: white;
}

.card-content {
  flex: 1;
}

.card-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-1);
}

.card-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-2);
}

.card-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.card-trend.positive {
  color: var(--color-success);
}

.card-trend.negative {
  color: var(--color-error);
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-6);
}

.chart-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-sm);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.chart-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.chart-toolbar {
  display: flex;
  background-color: var(--color-surface-variant);
  border-radius: var(--radius-md);
  padding: var(--spacing-1);
}

.chart-toggle {
  padding: var(--spacing-1) var(--spacing-3);
  border: none;
  background: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.chart-toggle.active {
  background-color: var(--color-surface);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.chart-content {
  height: 300px;
}

.chart-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-surface-variant);
  border-radius: var(--radius-md);
  border: 2px dashed var(--color-border);
}

.revenue-chart-placeholder {
  width: 80%;
  height: 80%;
  background: linear-gradient(45deg, #e3f2fd, #bbdefb);
  border-radius: var(--radius-md);
  position: relative;
}

.revenue-chart-placeholder::after {
  content: 'Wykres przychodów';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.popular-services {
  padding: var(--spacing-4) 0;
}

.service-stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-3);
}

.service-name {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.service-bar-container {
  flex: 2;
  height: 8px;
  background-color: var(--color-surface-variant);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.service-bar {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.service-count {
  flex: 0 0 40px;
  text-align: right;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .statistics-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-4);
  }
  
  .header-right {
    justify-content: space-between;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
}
</style>