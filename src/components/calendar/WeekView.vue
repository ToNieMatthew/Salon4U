<template>
  <div class="week-view">
    <div class="week-grid">
      <!-- Kolumna z godzinami -->
      <div class="time-column">
        <div class="day-header-placeholder"></div>
        <div 
          v-for="hour in workingHours" 
          :key="`time-${hour}`" 
          class="hour-cell time-cell"
        >
          {{ formatHour(hour) }}
        </div>
      </div>
      
      <!-- Kolumny dni -->
      <div 
        v-for="(day, index) in weekDays" 
        :key="day.date" 
        class="day-column"
        :class="{ 
          'current-day': isToday(day.date),
          'weekend': isWeekend(day.date)
        }"
      >
        <!-- Nagłówek dnia -->
        <div class="day-header">
          <div class="day-name">{{ day.name }}</div>
          <div class="day-number" @click="selectDay(day.date)">
            {{ day.number }}
          </div>
        </div>
        
        <!-- Komórki godzin -->
        <div 
          v-for="hour in workingHours" 
          :key="`${day.date}-${hour}`"
          class="hour-cell day-cell"
          @click="createAppointment(day.date, hour)"
        >
          <!-- Wizyty w tej godzinie -->          <div 
            v-for="appointment in getAppointmentsForSlot(day.date, hour)"
            :key="appointment.id"
            class="appointment"
            :class="`status-${appointment.status}`"
            :style="getAppointmentStyle(appointment, hour)"
            @click.stop="editAppointment(appointment)"
            @mouseenter="showTooltip($event, appointment)"
            @mouseleave="hideTooltip"
          ><div class="appointment-content">
              <div class="appointment-time">{{ appointment.startTime }}</div>              <div class="appointment-client">
                <strong>{{ appointment.clientName }}</strong>
                <small v-if="appointment.clientPhone">📞 {{ appointment.clientPhone }}</small>
              </div>
              <div class="appointment-service">{{ appointment.service }}</div>
              <div class="appointment-price" v-if="appointment.price">
                {{ formatCurrency(appointment.price) }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Wskaźnik aktualnej godziny -->
        <div 
          v-if="isToday(day.date) && currentTimeIndicator"
          class="current-time-indicator"
          :style="{ top: `${currentTimeIndicator.position}px` }"
        >
          <div class="time-dot"></div>
          <div class="time-line">        </div>
      </div>
    </div>
    
    <!-- Tooltip for appointments -->
    <div
      v-if="tooltipVisible && tooltipContent"
      class="appointment-tooltip"
      :style="{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }"
    >
      <div class="tooltip-content">
        <div class="tooltip-header">
          <div class="tooltip-client">{{ tooltipContent.clientName }}</div>
          <div v-if="tooltipContent.clientPhone" class="tooltip-phone">📞 {{ tooltipContent.clientPhone }}</div>
        </div>
        <div class="tooltip-body">
          <div class="tooltip-service">{{ tooltipContent.service }}</div>
          <div class="tooltip-time">{{ tooltipContent.startTime }} - {{ tooltipContent.endTime }}</div>
          <div v-if="tooltipContent.price" class="tooltip-price">{{ formatCurrency(tooltipContent.price) }}</div>
          <div v-if="tooltipContent.notes" class="tooltip-notes">📝 {{ tooltipContent.notes }}</div>
          <div class="tooltip-status">Status: {{ getStatusLabel(tooltipContent.status) }}</div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { format, isSameDay, isToday as isDateToday, getDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useSettingsStore } from '../../stores/settingsStore';

// Props
const props = defineProps({
  currentDate: Date,
  appointments: Array
});

// Emits
const emit = defineEmits(['navigate-date', 'select-day', 'create-appointment', 'edit-appointment']);

// Stores
const settingsStore = useSettingsStore();

// Reactive data
const currentTimeIndicator = ref(null);
const updateInterval = ref(null);
const tooltipPosition = ref({ x: 0, y: 0 });
const tooltipVisible = ref(false);
const tooltipContent = ref(null);

// Computed properties
const weekDays = computed(() => {
  const days = [];
  const startOfWeek = new Date(props.currentDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Poniedziałek
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + i);
    
    days.push({
      date: date,
      name: format(date, 'EEEE', { locale: pl }),
      number: format(date, 'd')
    });
  }
  
  return days;
});

// Godziny pracy z ustawień
const workingHours = computed(() => {
  const settings = settingsStore.settings;
  const startHour = parseInt(settings.workingHours?.start?.split(':')[0] || '8');
  const endHour = parseInt(settings.workingHours?.end?.split(':')[0] || '18');
  
  const hours = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    hours.push(hour);
  }
  
  return hours;
});

// Methods
const formatHour = (hour) => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

const isToday = (date) => {
  return isDateToday(date);
};

const isWeekend = (date) => {
  const day = getDay(date);
  return day === 0 || day === 6; // Niedziela lub sobota
};

const selectDay = (date) => {
  emit('select-day', date);
};

const createAppointment = (date, hour) => {
  const appointmentDate = new Date(date);
  appointmentDate.setHours(hour, 0, 0, 0);
  emit('create-appointment', appointmentDate);
};

const editAppointment = (appointment) => {
  emit('edit-appointment', appointment);
};

const getAppointmentsForSlot = (date, hour) => {
  if (!props.appointments) return [];
  
  return props.appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const appointmentHour = parseInt(appointment.startTime.split(':')[0]);
    
    return isSameDay(appointmentDate, date) && appointmentHour === hour;
  });
};

const getAppointmentStyle = (appointment, slotHour) => {
  const startTime = appointment.startTime.split(':');
  
  const startHour = parseInt(startTime[0]);
  const startMinutes = parseInt(startTime[1]);
  
  // Wysokość komórki godziny (60px)
  const hourHeight = 60;
  
  // Pozycja rozpoczęcia
  const topOffset = (startMinutes / 60) * hourHeight;
  
  // Stała wysokość wizyty niezależnie od czasu trwania
  const fixedHeight = 50; // Stała wysokość 50px dla widoku tygodnia (mniej miejsca)
  
  return {
    top: `${topOffset}px`,
    height: `${fixedHeight}px`,
    zIndex: 10
  };
};

const updateCurrentTimeIndicator = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  
  // Sprawdź czy aktualna godzina jest w zakresie godzin pracy
  const workingHoursList = workingHours.value;
  if (currentHour < workingHoursList[0] || currentHour > workingHoursList[workingHoursList.length - 1]) {
    currentTimeIndicator.value = null;
    return;
  }
  
  // Oblicz pozycję wskaźnika
  const hourIndex = workingHoursList.indexOf(currentHour);
  if (hourIndex === -1) {
    currentTimeIndicator.value = null;
    return;
  }
  
  const hourHeight = 60;
  const headerHeight = 60;
  const minuteOffset = (currentMinutes / 60) * hourHeight;
  const position = headerHeight + (hourIndex * hourHeight) + minuteOffset;
    currentTimeIndicator.value = {
    position
  };
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(amount);
};

// Tooltip methods
const showTooltip = (event, appointment) => {
  const rect = event.target.getBoundingClientRect();
  tooltipPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.top - 10
  };
  tooltipContent.value = appointment;
  tooltipVisible.value = true;
};

const hideTooltip = () => {
  tooltipVisible.value = false;
  tooltipContent.value = null;
};

// Helper functions
const getStatusLabel = (status) => {
  const labels = {
    scheduled: 'Zaplanowana',
    confirmed: 'Potwierdzona',
    completed: 'Zrealizowana',
    cancelled: 'Anulowana'
  };
  return labels[status] || status;
};

// Lifecycle
onMounted(() => {
  // Wczytaj ustawienia
  settingsStore.loadFromLocalStorage();
  
  // Aktualizuj wskaźnik czasu co minutę
  updateCurrentTimeIndicator();
  updateInterval.value = setInterval(updateCurrentTimeIndicator, 60000);
});

onUnmounted(() => {
  if (updateInterval.value) {
    clearInterval(updateInterval.value);
  }
});
</script>

<style scoped>
.week-view {
  height: 100%;
  overflow: auto;
}

.week-grid {
  display: flex;
  min-height: 100%;
  position: relative;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.time-column {
  width: 70px;
  flex-shrink: 0;
  border-right: 3px solid var(--color-border);
  background: linear-gradient(135deg, var(--color-surface-variant), var(--color-surface));
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
}

.day-header-placeholder {
  height: 60px;
  border-bottom: 2px solid var(--color-border);
  background: var(--color-surface-variant);
}

.day-column {
  flex: 1;
  position: relative;
  min-width: 120px;
  border-right: 2px solid var(--color-border);
  box-shadow: inset 0 0 0 1px rgba(var(--color-border-rgb), 0.3);
}

.day-column:last-child {
  border-right: none;
}

.day-column.current-day {
  background-color: rgba(var(--color-primary-rgb), 0.08);
  border-right: 2px solid var(--color-primary-light);
  box-shadow: inset 0 0 0 1px rgba(var(--color-primary-rgb), 0.2);
}

.day-column.weekend {
  background-color: rgba(var(--color-surface-variant-rgb), 0.5);
  border-right: 2px solid var(--color-surface-variant);
}

.day-header {
  height: 60px;
  padding: var(--spacing-2);
  border-bottom: 2px solid var(--color-border);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-surface), var(--color-surface-variant));
  position: relative;
}

.day-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-border), transparent);
}

.day-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.day-number {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.day-number:hover {
  background-color: var(--color-surface-variant);
}

.current-day .day-number {
  background-color: var(--color-primary);
  color: white;
}

.hour-cell {
  height: 60px;
  border-bottom: 1px solid var(--color-border);
  position: relative;
}

.hour-cell:nth-child(odd) {
  background-color: rgba(var(--color-surface-variant-rgb), 0.2);
}

.time-cell {
  padding: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  text-align: right;
  padding-right: var(--spacing-2);
  font-weight: var(--font-weight-medium);
  position: relative;
}

.time-cell::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 1px;
  background-color: var(--color-border);
}

.day-cell {
  cursor: pointer;
  transition: background-color var(--transition-fast);
  position: relative;
}

.day-cell::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  pointer-events: none;
}

.day-cell:hover::before {
  border-color: rgba(var(--color-primary-rgb), 0.3);
  background-color: rgba(var(--color-primary-rgb), 0.05);
}

.appointment {
  position: absolute;
  left: 2px;
  right: 2px;
  background-color: var(--color-primary-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-1) var(--spacing-2);
  cursor: pointer;
  overflow: hidden;
  border-left: 3px solid var(--color-primary);
  transition: all var(--transition-fast);
}

.appointment:hover {
  transform: scale(1.01);
  box-shadow: var(--shadow-md);
}

.appointment-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.appointment-time {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  white-space: nowrap;
}

.appointment-client {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  overflow: hidden;
}

.appointment-client strong {
  font-weight: var(--font-weight-medium);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appointment-client small {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appointment-service {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
}

.appointment-price {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-success);
}

.status-scheduled {
  background-color: rgba(var(--color-primary-rgb), 0.1);
  border-left-color: var(--color-primary);
}

.status-confirmed {
  background-color: rgba(var(--color-success-rgb), 0.1);
  border-left-color: var(--color-success);
}

.status-completed {
  background-color: rgba(var(--color-success-rgb), 0.2);
  border-left-color: var(--color-success);
  opacity: 0.8;
}

.status-cancelled {
  background-color: rgba(var(--color-error-rgb), 0.1);
  border-left-color: var(--color-error);
  text-decoration: line-through;
  opacity: 0.6;
}

.current-time-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-accent);
  z-index: 2;
  pointer-events: none;
}

.time-dot {
  position: absolute;
  left: -4px;
  top: -4px;
  width: 10px;
  height: 10px;
  background: var(--color-accent);
  border-radius: 50%;
}

.time-line {
  width: 100%;
  height: 100%;
}

.appointment-tooltip {
  position: absolute;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-3);
  width: 280px;
  transform: translateX(-50%);
  backdrop-filter: blur(10px);
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.tooltip-header {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--spacing-2);
}

.tooltip-client {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.tooltip-phone {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-1);
}

.tooltip-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.tooltip-service {
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
  font-size: var(--font-size-sm);
}

.tooltip-time {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-style: italic;
}

.tooltip-price {
  color: var(--color-success);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
}

.tooltip-notes {
  font-style: italic;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  background-color: var(--color-surface-variant);
  padding: var(--spacing-2);
  border-radius: var(--radius-sm);
}

.tooltip-status {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  font-weight: var(--font-weight-medium);
}
</style>