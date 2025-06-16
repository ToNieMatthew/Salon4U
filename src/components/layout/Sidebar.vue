<template>
  <!-- Sidebar -->
  <aside class="sidebar" :class="{ 'collapsed': sidebarCollapsed }">
    <div class="sidebar-header">      <div class="logo" @click="toggleSidebar">        <div class="logo-icon">
          <img src="/Logo_v2.png" alt="Logo" class="logo-image" />
        </div>
        <span v-if="!sidebarCollapsed" class="logo-text">{{ settingsStore.settings.salonName }}</span>
      </div>
    </div>

    <!-- User info -->
    <div v-if="!sidebarCollapsed" class="user-info">
      <div class="user-avatar">
        <div class="avatar-placeholder">
          {{ userInitials }}
        </div>
      </div>
      <div class="user-details">
        <div class="user-name">{{ authStore.user?.name }}</div>
        <div class="user-role">{{ roleLabel }}</div>
      </div>
    </div>

    <!-- Navigation -->    
    <nav class="sidebar-nav">      
      <router-link 
        v-for="item in filteredNavigationItems" 
        :key="item.path"
        :to="item.path" 
        class="nav-item"
        :class="{ 'active': isActiveRoute(item.path) }"
      >
        <div class="nav-icon" v-html="item.icon">
        </div>
        <span v-if="!sidebarCollapsed" class="nav-text">{{ item.name }}</span>
      </router-link>
    </nav>

    <!-- Sidebar footer -->
    <div class="sidebar-footer">
      <button v-if="!sidebarCollapsed" class="logout-btn" @click="handleLogout">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16,17 21,12 16,7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        <span>Wyloguj</span>
      </button>
      
      <button class="collapse-btn" @click="toggleSidebar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6"></path>
        </svg>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAuthStore } from '../../stores/authStore.js';

const route = useRoute();
const router = useRouter();
const settingsStore = useSettingsStore();
const authStore = useAuthStore();
const sidebarCollapsed = ref(false);

const navigationItems = [
  {
    name: 'Dashboard',
    path: '/',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>',
    roles: ['admin', 'employee', 'receptionist']
  },
  {
    name: 'Kalendarz',
    path: '/calendar',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    roles: ['admin', 'employee', 'receptionist']
  },
  {
    name: 'Klienci',
    path: '/clients',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    roles: ['admin', 'employee', 'receptionist']
  },
  {
    name: 'Usługi',
    path: '/services',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>',
    roles: ['admin', 'employee']
  },
  {
    name: 'Statystyki',
    path: '/statistics',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
    roles: ['admin']
  },
  {
    name: 'Ustawienia',
    path: '/settings',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
    roles: ['admin']
  }
];

// Computed
const filteredNavigationItems = computed(() => {
  const userRole = authStore.userRole;
  return navigationItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );
});

const userInitials = computed(() => {
  const name = authStore.user?.name || '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
});

const roleLabel = computed(() => {
  const roleLabels = {
    admin: 'Administrator',
    employee: 'Pracownik',
    receptionist: 'Recepcjonista'
  };
  return roleLabels[authStore.userRole] || 'Użytkownik';
});

// Methods
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

const isActiveRoute = (path) => {
  if (path === '/') {
    return route.path === '/' || route.path === '/dashboard';
  }
  return route.path.startsWith(path);
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

// Lifecycle
onMounted(() => {
  // Wczytaj ustawienia salonu
  settingsStore.loadFromLocalStorage();
  
  // Wczytaj stan sidebaru z localStorage
  const savedState = localStorage.getItem('sidebar-collapsed');
  if (savedState) {
    sidebarCollapsed.value = JSON.parse(savedState);
  }
  
  // Automatycznie zwiń sidebar na małych ekranach
  if (window.innerWidth < 768) {
    sidebarCollapsed.value = true;
  }
});
</script>

<style scoped>
.sidebar {
  width: 280px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  transition: width var(--transition-base);
  flex-shrink: 0;
  height: 100vh;
  position: relative;
  overflow: hidden;
  border-right: 1px solid #e5e7eb;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: var(--spacing-6);
  border-bottom: 1px solid #f3f4f6;
  position: relative;
  z-index: 1;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.logo:hover {
  transform: translateY(-1px);
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: #f8fafc;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7B57FF;
  flex-shrink: 0;
  border: 1px solid #e5e7eb;
}

.logo-image {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.logo-text {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: #1a1b23;
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  position: relative;
  z-index: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-lg);
  color: #6b7280;
  text-decoration: none;
  transition: all var(--transition-fast);
  position: relative;
}

.nav-item:hover {
  background: #7B57FF;
  color: white;
}

.nav-item.active {
  background: #7B57FF;
  color: white;
  border: 1px solid #7B57FF;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: #7B57FF;
  border-radius: 0 2px 2px 0;
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-footer {
  padding: var(--spacing-4);
  border-top: 1px solid #f3f4f6;
  position: relative;
  z-index: 1;
}

.collapse-btn {
  width: 100%;
  padding: var(--spacing-3);
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: var(--radius-lg);
  color: #6b7280;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

.sidebar.collapsed .collapse-btn svg {
  transform: rotate(180deg);
}

/* User info styles */
.user-info {
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-4);
  border-bottom: 1px solid rgba(107, 114, 128, 0.1);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.user-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #7B57FF, #9F81FF);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: var(--color-text);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Logout button styles */
.logout-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: transparent;
  border: 1px solid rgba(107, 114, 128, 0.2);
  border-radius: var(--radius-md);
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-bottom: var(--spacing-2);
  width: 100%;
}

.logout-btn:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}

.logout-btn svg {
  width: 16px;
  height: 16px;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
  }
  
  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
}
</style>
