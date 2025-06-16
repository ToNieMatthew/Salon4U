<template>
  <div class="day-view">
    <div class="day-grid">
      <!-- Kolumna z godzinami -->
      <div class="time-column">
        <div class="day-header-placeholder">
          <div class="day-info">
            <div class="day-name">{{ formatDayName(currentDate) }}</div>
            <div class="day-number">{{ formatDayNumber(currentDate) }}</div>
          </div>
        </div>
        <div 
          v-for="hour in workingHours" 
          :key="`time-${hour}`" 
          class="hour-cell time-cell"
        >
          {{ formatHour(hour) }}
        </div>
      </div>
      
      <!-- Kolumna dnia -->
      <div 
        class="day-column"
        :class="{ 
          'current-day': isToday,
          'weekend': isWeekend
        }"
      >
        <!-- Nagłówek dnia -->
        <div class="day-header">
          <div class="day-stats">
            <span class="stat-item">{{ todayAppointments.length }} wizyt</span>
            <span class="stat-item">{{ completedAppointments.length }} zrealizowanych</span>
          </div>
        </div>
        
        <!-- Komórki godzin -->
        <div 
          v-for="hour in workingHours" 
          :key="`hour-${hour}`"
          class="hour-cell day-cell"
          @click="createAppointment(hour)"
        >          <!-- Sub-sloty (co 5 minut) -->
          <div 
            v-for="slot in 12" 
            :key="`slot-${hour}-${slot}`"
            class="minute-slot"
            @click.stop="createAppointment(hour, (slot - 1) * 5)"
          ></div>
          
          <!-- Wizyty w tej godzinie -->          <div 
            v-for="appointment in getAppointmentsForHour(hour)"
            :key="appointment.id"
            class="appointment"
            :class="`status-${appointment.status}`"
            :style="getAppointmentStyle(appointment, hour)"
            @click.stop="editAppointment(appointment)"
            @mouseenter="showTooltip($event, appointment)"
            @mouseleave="hideTooltip"
          ><div class="appointment-content">
              <div class="appointment-time">
                {{ appointment.startTime }} - {{ appointment.endTime }}
              </div>
              <div class="appointment-client">
                <strong>{{ appointment.clientName }}</strong>
                <small v-if="appointment.clientPhone">📞 {{ appointment.clientPhone }}</small>
              </div>
              <div class="appointment-service">{{ appointment.service }}</div>
              <div class="appointment-notes" v-if="appointment.notes">
                📝 {{ appointment.notes }}
              </div>
              <div class="appointment-price" v-if="appointment.price">
                {{ formatCurrency(appointment.price) }}
              </div>
            </div>
            
            <!-- Akcje wizyty -->
            <div class="appointment-actions" @click.stop>
              <button 
                v-if="appointment.status === 'scheduled'"
                class="action-btn confirm-btn"
                @click="updateAppointmentStatus(appointment, 'confirmed')"
                title="Potwierdź wizytę"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
              
              <button 
                v-if="appointment.status !== 'completed'"
                class="action-btn complete-btn"
                @click="updateAppointmentStatus(appointment, 'completed')"
                title="Oznacz jako zrealizowaną"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Wskaźnik aktualnej godziny -->
        <div 
          v-if="isToday && currentTimeIndicator"
          class="current-time-indicator"
          :style="{ top: `${currentTimeIndicator.position}px` }"
        >
          <div class="time-dot"></div>
          <div class="time-line"></div>
          <div class="time-text">{{ currentTimeIndicator.time }}</div>
        </div>
        
        <!-- Komunikat gdy brak wizyt -->
        <div v-if="todayAppointments.length === 0" class="empty-day-overlay">
          <div class="empty-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <h3>Brak wizyt</h3>
            <p>Kliknij w dowolną godzinę, aby dodać wizytę</p>
          </div>
        </div>
        
        <!-- Tooltip -->
        <div 
          v-if="tooltipVisible && tooltipContent"
          class="appointment-tooltip"
          :style="{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translateX(-50%) translateY(-100%)'
          }"
        >
          <div class="tooltip-content">
            <div class="tooltip-header">
              <strong>{{ tooltipContent.clientName }}</strong>
              <span class="tooltip-time">{{ tooltipContent.startTime }} - {{ tooltipContent.endTime }}</span>
            </div>
            <div class="tooltip-body">
              <div class="tooltip-service">{{ tooltipContent.service }}</div>
              <div class="tooltip-price" v-if="tooltipContent.price">{{ formatCurrency(tooltipContent.price) }}</div>
              <div class="tooltip-phone" v-if="tooltipContent.clientPhone">📞 {{ tooltipContent.clientPhone }}</div>
              <div class="tooltip-notes" v-if="tooltipContent.notes">📝 {{ tooltipContent.notes }}</div>
              <div class="tooltip-status">Status: {{ getStatusLabel(tooltipContent.status) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { format, isToday as isDateToday, getDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useSettingsStore } from '../../stores/settingsStore';

// Props
const props = defineProps({
  currentDate: Date,
  appointments: Array
});

// Emits
const emit = defineEmits(['create-appointment', 'edit-appointment', 'update-appointment-status']);

// Stores
const settingsStore = useSettingsStore();

// Reactive data
const currentTimeIndicator = ref(null);
const updateInterval = ref(null);
const tooltipPosition = ref({ x: 0, y: 0 });
const tooltipVisible = ref(false);
const tooltipContent = ref(null);

// Computed properties
const isToday = computed(() => isDateToday(props.currentDate));

const isWeekend = computed(() => {
  const day = getDay(props.currentDate);
  return day === 0 || day === 6; // Niedziela lub sobota
});

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

const todayAppointments = computed(() => {
  if (!props.appointments) {
    console.log('DayView - brak wizyt w props');
    return [];
  }
  
  console.log('DayView - wszystkie wizyty:', props.appointments);
  console.log('DayView - aktualna data:', props.currentDate);
  
  const filtered = props.appointments
    .filter(appointment => {
      // Parsuj datę wizyty
      let appointmentDate;
      if (typeof appointment.date === 'string') {
        // Jeśli data jest stringiem YYYY-MM-DD, stwórz datę
        appointmentDate = new Date(appointment.date + 'T00:00:00');
      } else {
        appointmentDate = new Date(appointment.date);
      }
      
      const matches = format(appointmentDate, 'yyyy-MM-dd') === format(props.currentDate, 'yyyy-MM-dd');
      console.log(`Wizyta ${appointment.clientName}: data=${appointment.date}, matches=${matches}`);
      return matches;
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
    
  console.log('DayView - wizyty na dzisiaj:', filtered);
  return filtered;
});

const completedAppointments = computed(() => {
  return todayAppointments.value.filter(app => app.status === 'completed');
});

// Methods
const formatDayName = (date) => {
  return format(date, 'EEEE', { locale: pl });
};

const formatDayNumber = (date) => {
  return format(date, 'd MMMM yyyy', { locale: pl });
};

const formatHour = (hour) => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(amount);
};

const createAppointment = (hour, minutes = 0) => {
  console.log(`DayView - createAppointment wywołane: hour=${hour}, minutes=${minutes} (slot co 5 min)`);
  console.log('DayView - currentDate:', props.currentDate);
  
  const appointmentDate = new Date(props.currentDate);
  appointmentDate.setHours(hour, minutes, 0, 0);
  
  console.log('DayView - utworzona appointmentDate:', appointmentDate);
  console.log('DayView - sformatowana data:', appointmentDate.toISOString());
  
  emit('create-appointment', appointmentDate);
};

const editAppointment = (appointment) => {
  emit('edit-appointment', appointment);
};

const updateAppointmentStatus = (appointment, newStatus) => {
  emit('update-appointment-status', appointment.id, newStatus);
};

const getAppointmentsForHour = (hour) => {
  const appointments = todayAppointments.value.filter(appointment => {
    const appointmentHour = parseInt(appointment.startTime.split(':')[0]);
    return appointmentHour === hour;
  });
  
  if (appointments.length > 0) {
    console.log(`Wizyty na godzinę ${hour}:`, appointments);
  }
  
  return appointments;
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
  const fixedHeight = 80; // Stała wysokość 80px dla wszystkich wizyt
  
  console.log(`Wizyta ${appointment.clientName}: start=${appointment.startTime}, end=${appointment.endTime}, wysokość=${fixedHeight}px (stała)`);
  
  return {
    top: `${topOffset}px`,
    height: `${fixedHeight}px`,
    zIndex: 10
  };
};

const updateCurrentTimeIndicator = () => {
  if (!isToday.value) {
    currentTimeIndicator.value = null;
    return;
  }

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
    position,
    time: `${currentHour.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`
  };
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
.day-view {
  height: 100%;
  overflow: auto;
}

.day-grid {
  display: flex;
  min-height: 100%;
  position: relative;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.time-column {
  width: 80px;
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
}

.day-header-placeholder {
  height: 60px;
  padding: var(--spacing-2);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: var(--color-surface-variant);
}

.day-info {
  text-align: center;
}

.day-name {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  font-weight: var(--font-weight-medium);
}

.day-number {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.day-column {
  flex: 1;
  position: relative;
  min-width: 300px;
}

.day-column.current-day {
  background-color: rgba(var(--color-primary-rgb), 0.03);
}

.day-column.weekend {
  background-color: rgba(var(--color-surface-variant-rgb), 0.3);
}

.day-header {
  height: 60px;
  padding: var(--spacing-3);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-surface-variant);
}

.day-stats {
  display: flex;
  gap: var(--spacing-4);
}

.stat-item {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background-color: var(--color-surface);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.hour-cell {
  height: 60px;
  border-bottom: 1px solid var(--color-border);
  position: relative;
}

.time-cell {
  padding: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  text-align: right;
  padding-right: var(--spacing-2);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-top: var(--spacing-1);
}

.day-cell {
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.day-cell:hover {
  background-color: rgba(var(--color-primary-rgb), 0.05);
}

.minute-slot {
  height: 8.333%; /* 100% / 12 slotów = 8.333% */
  border-bottom: 1px dotted rgba(var(--color-border-rgb), 0.2);
}

.minute-slot:last-child {
  border-bottom: none;
}

.minute-slot:hover {
  background-color: rgba(var(--color-primary-rgb), 0.06);
}

/* Wyróżnij co 15 minut (slot 3, 6, 9, 12) */
.minute-slot:nth-child(3n) {
  border-bottom: 1px dotted rgba(var(--color-border-rgb), 0.4);
}

/* Wyróżnij co 30 minut (slot 6, 12) */
.minute-slot:nth-child(6n) {
  border-bottom: 1px dotted rgba(var(--color-border-rgb), 0.6);
}

.appointment {
  position: absolute;
  left: 4px;
  right: 4px;
  background: linear-gradient(135deg, var(--color-primary-light), rgba(var(--color-primary-rgb), 0.1));
  border-radius: var(--radius-md);  padding: var(--spacing-3);
  cursor: pointer;
  overflow: visible;
  border-left: 4px solid var(--color-primary);
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.appointment:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-md);
  z-index: 20 !important;
  background: linear-gradient(135deg, var(--color-primary-light), rgba(var(--color-primary-rgb), 0.2));
}

.appointment.status-scheduled {
  background: linear-gradient(135deg, #e3f2fd, rgba(33, 150, 243, 0.1));
  border-left-color: #2196f3;
  border-color: rgba(33, 150, 243, 0.2);
}

.appointment.status-confirmed {
  background: linear-gradient(135deg, #e8f5e8, rgba(76, 175, 80, 0.1));
  border-left-color: #4caf50;
  border-color: rgba(76, 175, 80, 0.2);
}

.appointment.status-completed {
  background: linear-gradient(135deg, #f3e5f5, rgba(156, 39, 176, 0.1));
  border-left-color: #9c27b0;
  border-color: rgba(156, 39, 176, 0.2);
}

.appointment.status-cancelled {
  background: linear-gradient(135deg, #ffebee, rgba(244, 67, 54, 0.1));
  border-left-color: #f44336;
  border-color: rgba(244, 67, 54, 0.2);
  opacity: 0.7;
}

.appointment-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  flex: 1;
  justify-content: center;
}

.appointment-time {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: #1a1a1a;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  display: inline-block;
  width: fit-content;
  margin-bottom: 2px;
}

.appointment-client {
  font-size: var(--font-size-sm);
  color: #1a1a1a;
  margin-bottom: 2px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  display: block;
  width: calc(100% - 12px);
}

.appointment-client strong {
  font-weight: var(--font-weight-bold);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appointment-client small {
  font-size: var(--font-size-xs);
  color: #666;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.appointment-service {
  font-size: var(--font-size-xs);
  color: #2a2a2a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  display: inline-block;
  width: calc(100% - 12px);
}

.appointment-notes {
  font-size: var(--font-size-xs);
  color: #555;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  display: inline-block;
  width: calc(100% - 12px);
  margin-bottom: 2px;
}

.appointment-price {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-success);
}

.appointment-actions {
  display: flex;
  gap: var(--spacing-1);
  margin-top: var(--spacing-1);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.appointment:hover .appointment-actions {
  opacity: 1;
}

.action-btn {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.confirm-btn {
  background-color: rgba(var(--color-success-rgb), 0.2);
  color: var(--color-success);
}

.confirm-btn:hover {
  background-color: var(--color-success);
  color: white;
}

.complete-btn {
  background-color: rgba(var(--color-primary-rgb), 0.2);
  color: var(--color-primary);
}

.complete-btn:hover {
  background-color: var(--color-primary);
  color: white;
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
  z-index: 15;
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

.time-text {
  position: absolute;
  right: var(--spacing-2);
  top: -8px;
  font-size: var(--font-size-xs);
  color: var(--color-accent);
  font-weight: var(--font-weight-bold);
  background: var(--color-surface);
  padding: 0 var(--spacing-1);
}

.empty-day-overlay {
  position: absolute;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--color-surface-rgb), 0.8);
  pointer-events: none;
}

.empty-content {
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-content h3 {
  margin: var(--spacing-2) 0;
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
}

.empty-content p {
  margin: 0;
  font-size: var(--font-size-sm);
}

.appointment-tooltip {
  position: absolute;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-2);
  width: 250px;
  transform: translateX(-50%);
}

.tooltip-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.tooltip-header {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.tooltip-body {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.tooltip-service {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.tooltip-time {
  font-style: italic;
  color: var(--color-text-tertiary);
}

.tooltip-price {
  color: var(--color-success);
  font-weight: var(--font-weight-medium);
}

.tooltip-notes {
  font-style: italic;
  color: var(--color-text-secondary);
}
</style>