<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <div class="header-left">
        <h1 class="page-title">Kalendarz</h1>
        <div class="date-navigation">
          <button class="nav-button" @click="previousPeriod">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <div class="current-date">{{ currentDateDisplay }}</div>
          <button class="nav-button" @click="nextPeriod">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="header-right">
        <div class="view-selector">
          <button 
            v-for="view in views" 
            :key="view.value" 
            @click="setView(view.value)" 
            :class="['view-button', { active: currentView === view.value }]"
          >
            {{ view.label }}
          </button>
        </div>
        
        <button class="today-button" @click="goToToday">Dzisiaj</button>
        
        <button class="action-button" @click="openNewAppointmentModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"></path>
          </svg>
          <span>Nowa wizyta</span>
        </button>
      </div>
    </div>    <div class="calendar-view">
      <Transition name="fade" mode="out-in">
        <component 
          :is="calendarComponent" 
          :key="currentView"
          :currentDate="currentDate" 
          :appointments="appointmentStore.appointments"
          @navigate-date="navigateToDate"
          @select-day="selectDay"
          @create-appointment="createAppointment"
          @edit-appointment="editAppointment"
          @update-appointment-status="updateAppointmentStatus"
        />
      </Transition>
    </div>
    
    <!-- Appointment Modal -->
    <AppointmentForm
      v-if="showAppointmentModal"
      :appointment="currentAppointment"
      :initialDate="appointmentDate"
      @close="closeAppointmentModal"
      @save="saveAppointment"
      @delete="deleteAppointment"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useAppointmentStore } from '../stores/appointmentStore';
import { useCalendarStore } from '../stores/calendarStore';
import DayView from '../components/calendar/DayView.vue';
import WeekView from '../components/calendar/WeekView.vue';
import MonthView from '../components/calendar/MonthView.vue';
import AppointmentForm from '../components/calendar/AppointmentForm.vue';

const appointmentStore = useAppointmentStore();
const calendarStore = useCalendarStore();
const showAppointmentModal = ref(false);
const currentAppointment = ref(null);
const appointmentDate = ref(null);

// Use calendar store for date and view state
const currentDate = computed(() => calendarStore.currentDate);
const currentView = computed(() => calendarStore.view);

const views = [
  { value: 'day', label: 'Dzień' },
  { value: 'week', label: 'Tydzień' },
  { value: 'month', label: 'Miesiąc' }
];

// Dynamic component based on current view
const calendarComponent = computed(() => {
  switch (currentView.value) {
    case 'day': return DayView;
    case 'week': return WeekView;
    case 'month': return MonthView;
    default: return WeekView;
  }
});

// Format the current date for display
const currentDateDisplay = computed(() => {
  let formatString;
  
  switch (currentView.value) {
    case 'day':
      formatString = 'EEEE, d MMMM yyyy';
      break;
    case 'week':
      formatString = 'MMMM yyyy';
      break;
    case 'month':
      formatString = 'LLLL yyyy';
      break;
    default:
      formatString = 'd MMMM yyyy';
  }
  
  return format(currentDate.value, formatString, { locale: pl }).toUpperCase();
});

// Set the current view
const setView = (view) => {
  calendarStore.setView(view);
};

// Navigate to today
const goToToday = () => {
  calendarStore.setCurrentDate(new Date());
};

// Navigate to a specific date
const navigateToDate = (date) => {
  calendarStore.setCurrentDate(date);
};

// Navigate to previous period (day, week, or month)
const previousPeriod = () => {
  let newDate;
  switch (currentView.value) {
    case 'day':
      newDate = subDays(currentDate.value, 1);
      break;
    case 'week':
      newDate = subWeeks(currentDate.value, 1);
      break;
    case 'month':
      newDate = subMonths(currentDate.value, 1);
      break;
  }
  
  calendarStore.setCurrentDate(newDate);
};

// Navigate to next period (day, week, or month)
const nextPeriod = () => {
  let newDate;
  switch (currentView.value) {
    case 'day':
      newDate = addDays(currentDate.value, 1);
      break;
    case 'week':
      newDate = addWeeks(currentDate.value, 1);
      break;
    case 'month':
      newDate = addMonths(currentDate.value, 1);
      break;
  }
  
  calendarStore.setCurrentDate(newDate);
};

// Select a specific day
const selectDay = (day) => {
  calendarStore.setCurrentDate(day);
  calendarStore.setView('day');
};

// Open the appointment creation modal
const createAppointment = (date) => {
  console.log('Calendar.vue - createAppointment wywołane z datą:', date);
  console.log('Calendar.vue - typ daty:', typeof date);
  console.log('Calendar.vue - sformatowana data:', date?.toISOString());
  
  currentAppointment.value = null;
  appointmentDate.value = date;
  showAppointmentModal.value = true;
  
  console.log('Calendar.vue - appointmentDate ustawiona na:', appointmentDate.value);
};

// Open the appointment edit modal
const editAppointment = (appointment) => {
  currentAppointment.value = appointment;
  appointmentDate.value = null;
  showAppointmentModal.value = true;
};

// Open a new appointment modal
const openNewAppointmentModal = () => {
  currentAppointment.value = null;
  appointmentDate.value = new Date();
  showAppointmentModal.value = true;
};

// Close the appointment modal
const closeAppointmentModal = () => {
  showAppointmentModal.value = false;
  currentAppointment.value = null;
  appointmentDate.value = null;
};

// Save an appointment
const saveAppointment = (appointment) => {
  if (appointment.id && appointmentStore.appointments.find(a => a.id === appointment.id)) {
    appointmentStore.updateAppointment(appointment.id, appointment);
  } else {
    appointmentStore.addAppointment(appointment);
  }
  
  closeAppointmentModal();
};

// Delete an appointment
const deleteAppointment = (id) => {
  appointmentStore.deleteAppointment(id);
  closeAppointmentModal();
};

// Update appointment status
const updateAppointmentStatus = (appointmentId, newStatus) => {
  appointmentStore.updateAppointment(appointmentId, { status: newStatus });
};

onMounted(() => {
  // Load appointments data
  appointmentStore.loadFromLocalStorage();
  // Load calendar state (current date and view)
  calendarStore.loadFromLocalStorage();
});
</script>

<style scoped>
.calendar-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-6);
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
  color: var(--color-text-primary);
}

.date-navigation {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  background-color: var(--color-surface-variant);
  border-radius: var(--radius-full);
  padding: var(--spacing-1) var(--spacing-2);
}

.current-date {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: 0 var(--spacing-2);
  color: var(--color-text-secondary);
  min-width: 120px;
  text-align: center;
}

.nav-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background-color: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.nav-button:hover {
  background-color: var(--color-surface);
  color: var(--color-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.view-selector {
  display: flex;
  background-color: var(--color-surface-variant);
  border-radius: var(--radius-full);
  padding: var(--spacing-1);
}

.view-button {
  padding: var(--spacing-1) var(--spacing-4);
  border: none;
  background-color: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}

.view-button.active {
  background-color: var(--color-surface);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.today-button {
  display: flex;
  align-items: center;
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.today-button:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.action-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-full);
  border: none;
  background-color: var(--color-primary);
  color: white;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-button:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.calendar-view {
  flex: 1;
  min-height: 0;
  position: relative;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>