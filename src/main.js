import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { useClientStore } from './stores/clientStore'
import { useAppointmentStore } from './stores/appointmentStore'
import { useSettingsStore } from './stores/settingsStore'
import { useThemeStore } from './stores/themeStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize stores with data from local storage
const clientStore = useClientStore()
clientStore.loadFromLocalStorage()

const appointmentStore = useAppointmentStore()
appointmentStore.loadFromLocalStorage()

// Initialize settings store
const settingsStore = useSettingsStore()
settingsStore.loadFromLocalStorage()

// Initialize theme store
const themeStore = useThemeStore()

app.mount('#app')
