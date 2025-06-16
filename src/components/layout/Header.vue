<template>
  <header class="app-header">
    <div class="header-content">
      <div class="header-left">
        <div class="logo">
          <img src="@/assets/logo-small.svg" alt="Salon Logo" class="logo-image">
          <span class="logo-text">Salon Pro</span>
        </div>
        
        <div class="header-navigation" v-if="showDateNavigation">
          <div class="date-navigation">
            <button @click="previousDate" class="nav-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 18l-6-6 6-6"></path>
              </svg>
            </button>
            
            <div class="current-date">
              {{ currentView }}
            </div>
            
            <button @click="nextDate" class="nav-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18l6-6-6-6"></path>
              </svg>
            </button>
          </div>
          
          <button @click="goToToday" class="today-btn" v-if="showTodayButton">
            Dziś
          </button>
        </div>
      </div>
      
      <div class="header-center">
        <h1 class="page-title">{{ pageTitle }}</h1>
      </div>
      
      <div class="header-right">
        <div class="view-selector" v-if="showViewSelector">
          <button 
            v-for="view in views" 
            :key="view.value"
            @click="setView(view.value)"
            class="view-btn"
            :class="{ active: calendarStore.view === view.value }"
          >
            {{ view.label }}
          </button>
        </div>
        
        <div class="current-time">
          <div class="time">{{ currentTime }}</div>
          <div class="date">{{ currentDate }}</div>
        </div>
        
        <div class="user-profile">
          <div class="user-info">
            <div class="user-name">Salon Manager</div>
            <div class="user-role">Administrator</div>
          </div>
          <div class="user-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { addDays, addWeeks, addMonths, format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { useCalendarStore } from '@/stores/calendarStore'
import { useRoute } from 'vue-router'

const calendarStore = useCalendarStore()
const route = useRoute()

const now = ref(new Date())
let timeInterval = null

onMounted(() => {
  timeInterval = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

const currentTime = computed(() => {
  return format(now.value, 'HH:mm:ss')
})

const currentDate = computed(() => {
  return format(now.value, 'EEEE, d MMMM yyyy', { locale: pl })
})

const pageTitle = computed(() => {
  switch (route.name) {
    case 'dashboard': return 'Panel główny'
    case 'calendar': return 'Kalendarz'
    case 'clients': return 'Klienci'
    case 'services': return 'Usługi'
    case 'statistics': return 'Statystyki'
    case 'settings': return 'Ustawienia'
    default: return 'Salon Pro'
  }
})

const showDateNavigation = computed(() => {
  return route.name === 'calendar'
})

const showViewSelector = computed(() => {
  return route.name === 'calendar'
})

const showTodayButton = computed(() => {
  return route.name === 'calendar'
})

const views = [
  { value: 'day', label: 'Dzień' },
  { value: 'week', label: 'Tydzień' },
  { value: 'month', label: 'Miesiąc' }
]

const currentView = computed(() => {
  const formatStr = calendarStore.view === 'month' ? 'LLLL yyyy' : 'EEEE, d LLLL yyyy'
  return format(calendarStore.currentDate, formatStr, { locale: pl }).toUpperCase()
})

const goToToday = () => {
  calendarStore.setCurrentDate(new Date())
}

const setView = (view) => {
  calendarStore.view = view
}

const previousDate = () => {
  const current = calendarStore.currentDate
  let newDate

  switch (calendarStore.view) {
    case 'day':
      newDate = addDays(current, -1)
      break
    case 'week':
      newDate = addWeeks(current, -1)
      break
    case 'month':
      newDate = addMonths(current, -1)
      break
    default:
      newDate = addDays(current, -1)
  }

  calendarStore.setCurrentDate(newDate)
}

const nextDate = () => {
  const current = calendarStore.currentDate
  let newDate

  switch (calendarStore.view) {
    case 'day':
      newDate = addDays(current, 1)
      break
    case 'week':
      newDate = addWeeks(current, 1)
      break
    case 'month':
      newDate = addMonths(current, 1)
      break
    default:
      newDate = addDays(current, 1)
  }

  calendarStore.setCurrentDate(newDate)
}
</script>

<style scoped>
.app-header {
  padding: var(--spacing-4) var(--spacing-6);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-6);
  flex: 1;
}

.header-center {
  flex: 1;
  text-align: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  flex: 1;
  justify-content: flex-end;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.logo-image {
  width: 32px;
  height: 32px;
}

.logo-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.header-navigation {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.date-navigation {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  background-color: var(--color-surface-variant);
  border-radius: var(--radius-full);
  padding: var(--spacing-1) var(--spacing-3);
  border: 1px solid var(--color-border);
}

.current-date {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: 0 var(--spacing-3);
  color: var(--color-text-primary);
  min-width: 200px;
  text-align: center;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background-color: var(--color-primary-100);
  color: var(--color-primary);
}

.today-btn {
  padding: var(--spacing-2) var(--spacing-4);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
}

.today-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.view-selector {
  display: flex;
  background-color: var(--color-surface-variant);
  border-radius: var(--radius-lg);
  padding: var(--spacing-1);
  border: 1px solid var(--color-border);
}

.view-btn {
  padding: var(--spacing-2) var(--spacing-3);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn.active {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);
}

.view-btn:hover:not(.active) {
  background-color: var(--color-primary-50);
  color: var(--color-primary);
}

.current-time {
  text-align: right;
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--color-surface-variant);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.time {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  font-family: 'Courier New', monospace;
}

.date {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--color-surface-variant);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-profile:hover {
  background-color: var(--color-primary-50);
  border-color: var(--color-primary-200);
}

.user-info {
  text-align: right;
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.user-role {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

@media (max-width: 1200px) {
  .header-content {
    flex-wrap: wrap;
    gap: var(--spacing-4);
  }
  
  .header-center {
    order: -1;
    flex-basis: 100%;
    text-align: left;
  }
  
  .page-title {
    font-size: var(--font-size-xl);
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: var(--spacing-3) var(--spacing-4);
  }
  
  .user-info {
    display: none;
  }
  
  .current-time .date {
    display: none;
  }
  
  .logo-text {
    display: none;
  }
}
</style>