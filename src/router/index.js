import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'

// Import view components
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Calendar from '../views/Calendar.vue'
import Clients from '../views/Clients.vue'
import Services from '../views/Services.vue'
import Statistics from '../views/Statistics.vue'
import Settings from '../views/Settings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresGuest: true }
    },{
      path: '/',
      redirect: (to) => {
        // Sprawdź w localStorage czy użytkownik jest zalogowany
        const savedUser = localStorage.getItem('salon-auth-user');
        const savedToken = localStorage.getItem('salon-auth-token');
        
        if (savedUser && savedToken) {
          return '/dashboard';
        } else {
          return '/login';
        }
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: Calendar,
      meta: { requiresAuth: true }
    },
    {
      path: '/clients',
      name: 'clients',
      component: Clients,
      meta: { requiresAuth: true }
    },
    {
      path: '/services',
      name: 'services',
      component: Services,
      meta: { requiresAuth: true }
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: Statistics,
      meta: { requiresAuth: true, permission: 'view_stats' }
    },    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: { requiresAuth: true, permission: 'manage_settings' }
    },
    {
      // Fallback route - jeśli nic nie pasuje, przekieruj na login
      path: '/:pathMatch(.*)*',
      redirect: '/login'
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Sprawdź czy trasa wymaga logowania
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
    return;
  }
  
  // Sprawdź czy zalogowany użytkownik próbuje wejść na login
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard');
    return;
  }  
  // Sprawdź uprawnienia
  if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
    // Przekieruj na dashboard jeśli brak uprawnień
    next('/dashboard');
    return;
  }
  
  next();
});

export default router