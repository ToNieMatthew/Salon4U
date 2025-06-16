<template>
  <div class="app-container">
    <!-- Layout dla zalogowanych użytkowników -->
    <div v-if="isAuthenticated" class="app-layout">
      <Sidebar />
      <main class="main-content">
        <router-view />
      </main>
    </div>
    
    <!-- Layout dla niezalogowanych (strona logowania) -->
    <div v-else class="login-layout">
      <router-view />
    </div>
    
    <!-- Google Cloud Panel - zawsze widoczny w development -->
    <GoogleCloudPanel v-if="isAuthenticated" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useAuthStore } from './stores/authStore.js';
import Sidebar from './components/layout/Sidebar.vue';
import GoogleCloudPanel from './components/GoogleCloudPanel.vue';

const authStore = useAuthStore();

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated);

// Lifecycle
onMounted(async () => {
  // Wyczyść legacy klucze z localStorage (stary przełącznik)
  localStorage.removeItem('salon-cloud-sync');
  
  // Inicjalizuj auth store przy starcie aplikacji
  await authStore.initializeAuth();
});

// Utility function
const clearAllData = () => {
  localStorage.removeItem('salon-clients');
  localStorage.removeItem('salon-services');
  localStorage.removeItem('salon-categories');
  localStorage.removeItem('salon-appointments');
  localStorage.removeItem('salon-settings');
    console.log('Wszystkie dane zostały wyczyszczone');
  window.location.reload();
};

window.clearAllData = clearAllData;
</script>

<style>
:root {
  /* Kolory */
  --color-primary: #7B57FF;
  --color-primary-light: #9F81FF;
  --color-primary-dark: #5A3FBF;
  --color-primary-rgb: 123, 87, 255;
  
  --color-accent: #FF6B6B;
  --color-success: #51CF66;
  --color-warning: #FFD43B;
  --color-error: #FF6B6B;
  
  --color-surface: #FFFFFF;
  --color-surface-variant: #F4F5F7;
  --color-surface-variant-rgb: 244, 245, 247;
  --color-background: #FAFBFC;
  
  --color-text-primary: #1A1B23;
  --color-text-secondary: #6B7280;
  --color-text-tertiary: #9CA3AF;
  
  --color-border: #E5E7EB;
  --color-border-light: #F3F4F6;
  
  /* Typografia */
  --font-family: 'Inter', sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-loose: 1.75;
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Odstępy */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;
  --spacing-16: 4rem;
  
  /* Zaokrąglenia */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  
  /* Cienie */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  /* Animacje */
  --transition-fast: 0.15s ease-in-out;
  --transition-normal: 0.25s ease-in-out;
  --transition-slow: 0.35s ease-in-out;
  --transition-base: 0.2s ease-in-out;
}

/* Globalne style */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  background-color: var(--color-background);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  overflow: hidden;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: var(--spacing-6);
  overflow: auto;
  background: var(--color-background);
}

@media (max-width: 768px) {
  .main-content {
    padding: var(--spacing-4);
  }
}

/* Login layout styles */
.login-layout {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
