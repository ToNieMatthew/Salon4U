import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCalendarStore = defineStore('calendar', () => {
  // State - only for view and date, not appointments
  const currentDate = ref(new Date())
  const view = ref('week') // day, week, month
  
  // Actions
  function setCurrentDate(date) {
    currentDate.value = date
    saveToLocalStorage()
  }
  
  function setView(viewType) {
    if (['day', 'week', 'month'].includes(viewType)) {
      view.value = viewType
      saveToLocalStorage()
    }
  }
  
  function saveToLocalStorage() {
    localStorage.setItem('salon-calendar', JSON.stringify({
      currentDate: currentDate.value.toISOString(),
      view: view.value
    }))
  }  
  function loadFromLocalStorage() {
    try {
      const savedCalendar = localStorage.getItem('salon-calendar')
      if (savedCalendar) {
        const parsed = JSON.parse(savedCalendar)
        
        if (parsed.currentDate) {
          currentDate.value = new Date(parsed.currentDate)
        }
        
        if (parsed.view) {
          view.value = parsed.view
        }
      }
    } catch (err) {
      console.error('Error loading calendar data from localStorage:', err)
    }
  }
  
  return {
    currentDate,
    view,
    setCurrentDate,
    setView,
    saveToLocalStorage,
    loadFromLocalStorage
  }
})