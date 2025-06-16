<template>
  <div class="month-view">
    <div class="month-grid">
      <!-- Day labels -->
      <div v-for="day in weekDayLabels" :key="day" class="day-label">
        {{ day }}
      </div>
      
      <!-- Calendar days -->
      <div 
        v-for="(date, index) in calendarDays" 
        :key="index"
        class="day-cell"
        :class="{
          'current-month': isCurrentMonth(date),
          'other-month': !isCurrentMonth(date),
          'today': isToday(date),
          'weekend': isWeekend(date)
        }"
        @click="selectDay(date)"
      >
        <div class="day-number">{{ format(date, 'd') }}</div>
        
        <div class="day-appointments">          <div 
            v-for="appointment in getAppointmentsForDay(date)" 
            :key="appointment.id"
            class="month-appointment"
            :class="getAppointmentStatusClass(appointment)"
            @click.stop="editAppointment(appointment)"
            @mouseenter="showTooltip($event, appointment)"
            @mouseleave="hideTooltip"
          >
            <span class="appointment-dot"></span>
            <span class="appointment-time">{{ formatAppointmentTime(appointment) }}</span>
            <span class="appointment-client">
              <strong>{{ appointment.clientName }}</strong>
              <small v-if="appointment.clientPhone">{{ appointment.clientPhone }}</small>
            </span>
          </div>
          
          <div v-if="getAppointmentCount(date) > 3" class="more-appointments" @click.stop="viewAllAppointments(date)">
            +{{ getAppointmentCount(date) - 3 }} więcej
          </div>      </div>
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
import { computed, ref } from 'vue';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isToday as dateFnsIsToday, isSameMonth, parseISO, isSameDay, isWeekend as dateFnsIsWeekend } from 'date-fns';
import { pl } from 'date-fns/locale';

const props = defineProps({
  currentDate: {
    type: Date,
    required: true
  },
  appointments: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['navigate-date', 'select-day', 'edit-appointment', 'view-day']);

// Reactive data for tooltip
const tooltipPosition = ref({ x: 0, y: 0 });
const tooltipVisible = ref(false);
const tooltipContent = ref(null);

// Week day labels
const weekDayLabels = ['PON', 'WT', 'ŚR', 'CZW', 'PT', 'SOB', 'NIEDZ'];

// Calculate calendar days for current month view
const calendarDays = computed(() => {
  const monthStart = startOfMonth(props.currentDate);
  const monthEnd = endOfMonth(props.currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
});

// Check if date is in current month
const isCurrentMonth = (date) => {
  return isSameMonth(date, props.currentDate);
};

// Check if date is today
const isToday = (date) => {
  return dateFnsIsToday(date);
};

// Check if date is a weekend
const isWeekend = (date) => {
  return dateFnsIsWeekend(date);
};

// Get appointments for a specific day
const getAppointmentsForDay = (day) => {
  console.log('MonthView - szukanie wizyt dla dnia:', format(day, 'yyyy-MM-dd'));
  console.log('MonthView - wszystkie wizyty:', props.appointments);
  
  const targetDateString = format(day, 'yyyy-MM-dd');
  
  const dayAppointments = props.appointments.filter(appointment => {
    // Obsłuż różne formaty daty w appointment.date
    let appointmentDate;
    if (typeof appointment.date === 'string') {
      if (appointment.date.includes('T')) {
        // ISO format z czasem
        appointmentDate = parseISO(appointment.date);
      } else {
        // Format YYYY-MM-DD
        appointmentDate = new Date(appointment.date + 'T00:00:00');
      }
    } else {
      appointmentDate = new Date(appointment.date);
    }
    
    const appointmentDateString = format(appointmentDate, 'yyyy-MM-dd');
    const matches = appointmentDateString === targetDateString;
    
    console.log('MonthView - porównanie:', appointmentDateString, 'vs', targetDateString, '=', matches);
    return matches;
  });
  
  console.log('MonthView - znalezione wizyty dla dnia:', dayAppointments);
  
  // Return only the first 3 appointments
  return dayAppointments.slice(0, 3);
};

// Get total appointment count for a day
const getAppointmentCount = (day) => {
  const targetDateString = format(day, 'yyyy-MM-dd');
  
  return props.appointments.filter(appointment => {
    // Obsłuż różne formaty daty w appointment.date
    let appointmentDate;
    if (typeof appointment.date === 'string') {
      if (appointment.date.includes('T')) {
        // ISO format z czasem
        appointmentDate = parseISO(appointment.date);
      } else {
        // Format YYYY-MM-DD
        appointmentDate = new Date(appointment.date + 'T00:00:00');
      }
    } else {
      appointmentDate = new Date(appointment.date);
    }
    
    const appointmentDateString = format(appointmentDate, 'yyyy-MM-dd');
    return appointmentDateString === targetDateString;
  }).length;
};

// Format appointment time
const formatAppointmentTime = (appointment) => {
  // startTime już jest stringiem w formacie "HH:mm"
  return appointment.startTime;
};

// Get appointment status class
const getAppointmentStatusClass = (appointment) => {
  return {
    'confirmed': appointment.status === 'confirmed',
    'pending': appointment.status === 'pending' || !appointment.status,
    'cancelled': appointment.status === 'cancelled'
  };
};

// Event handlers
const selectDay = (date) => {
  emit('select-day', date);
};

const editAppointment = (appointment) => {
  emit('edit-appointment', appointment);
};

const viewAllAppointments = (date) => {
  emit('view-day', date);
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

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '';
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN'
  }).format(amount);
};
</script>

<style scoped>
.month-view {
  height: 100%;
  overflow: auto;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(100px, 1fr);
  gap: 1px;
  background-color: var(--color-border);
}

.day-label {
  background-color: var(--color-surface-variant);
  padding: var(--spacing-2);
  text-align: center;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.day-cell {
  position: relative;
  background-color: var(--color-surface);
  padding: var(--spacing-2);
  min-height: 120px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.day-cell:hover {
  background-color: var(--color-surface-variant);
}

.other-month {
  opacity: 0.5;
}

.weekend {
  background-color: rgba(0, 0, 0, 0.02);
}

.today {
  background-color: rgba(124, 58, 237, 0.05);
}

.today .day-number {
  background-color: var(--color-primary);
  color: white;
}

.day-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-bottom: var(--spacing-2);
  font-weight: var(--font-weight-medium);
}

.day-appointments {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  overflow: hidden;
}

.month-appointment {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  padding: var(--spacing-1);
  border-radius: var(--radius-sm);
  background-color: rgba(124, 58, 237, 0.05);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.month-appointment.confirmed {
  background-color: rgba(16, 185, 129, 0.05);
}

.month-appointment.pending {
  background-color: rgba(245, 158, 11, 0.05);
}

.month-appointment.cancelled {
  background-color: rgba(239, 68, 68, 0.05);
  opacity: 0.75;
}

.appointment-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--color-primary);
  flex-shrink: 0;
}

.month-appointment.confirmed .appointment-dot {
  background-color: var(--color-status-confirmed);
}

.month-appointment.pending .appointment-dot {
  background-color: var(--color-status-pending);
}

.month-appointment.cancelled .appointment-dot {
  background-color: var(--color-status-cancelled);
}

.appointment-time {
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;
}

.appointment-client {
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
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

.more-appointments {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  padding: var(--spacing-1);
  text-align: center;
  background-color: var(--color-surface-variant);
  border-radius: var(--radius-sm);
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