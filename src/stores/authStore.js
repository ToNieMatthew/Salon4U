import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { cloudAuthService } from '../services/cloudAuthService.js';

export const useAuthStore = defineStore('auth', () => {
  // Stan
  const user = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const sessionToken = ref(null);

  // Computed
  const isAuthenticated = computed(() => !!user.value);
  const userRole = computed(() => user.value?.role || 'guest');

  // Metody
  const login = async (username, password) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await cloudAuthService.loginWithFallback(username, password);
      
      if (result.success) {
        user.value = result.user;
        sessionToken.value = result.session?.token || null;

        // Zapisz do localStorage jako backup
        localStorage.setItem('salon-auth-user', JSON.stringify(result.user));
        if (result.session?.token) {
          localStorage.setItem('salon-auth-token', result.session.token);
        }

        console.log('✅ Logowanie udane:', result.user.name);
        return { success: true, user: result.user };
      } else {
        throw new Error('Nieznany błąd logowania');
      }

    } catch (err) {
      error.value = err.message;
      console.error('❌ Błąd logowania:', err.message);
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (userData) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await cloudAuthService.registerWithFallback(userData);
      
      if (result.success) {
        console.log('✅ Rejestracja udana:', result.user.name);
        return { success: true, user: result.user };
      } else {
        throw new Error(result.error || 'Nieznany błąd rejestracji');
      }

    } catch (err) {
      error.value = err.message;
      console.error('❌ Błąd rejestracji:', err.message);
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    try {
      // Wyloguj z chmury jeśli mamy token sesji
      if (sessionToken.value) {
        await cloudAuthService.logout(sessionToken.value);
      }
    } catch (err) {
      console.warn('⚠️ Błąd wylogowania z chmury:', err);
    }

    // Wyczyść lokalny stan
    user.value = null;
    error.value = null;
    sessionToken.value = null;
    
    // Usuń z localStorage
    localStorage.removeItem('salon-auth-user');
    localStorage.removeItem('salon-auth-token');
    
    console.log('👋 Użytkownik wylogowany');
  };

  const initializeAuth = async () => {
    try {
      const savedToken = localStorage.getItem('salon-auth-token');
      
      if (savedToken) {
        // Spróbuj zweryfikować sesję w chmurze
        const cloudUser = await cloudAuthService.verifySession(savedToken);
        
        if (cloudUser) {
          user.value = cloudUser;
          sessionToken.value = savedToken;
          console.log('🔐 Przywrócono sesję z chmury:', cloudUser.name);
          return;
        }
      }

      // Fallback do localStorage
      const savedUser = localStorage.getItem('salon-auth-user');
      if (savedUser) {
        user.value = JSON.parse(savedUser);
        console.log('🔐 Przywrócono sesję z localStorage:', user.value.name);
      }
      
    } catch (err) {
      console.error('❌ Błąd inicjalizacji auth:', err);
      logout(); // Wyczyść nieprawidłowe dane
    }
  };

  const updateProfile = (profileData) => {
    if (!user.value) return;

    user.value = { ...user.value, ...profileData };
    localStorage.setItem('salon-auth-user', JSON.stringify(user.value));
  };

  const hasPermission = (permission) => {
    if (!user.value) return false;

    const permissions = {
      admin: ['read', 'write', 'delete', 'manage_users', 'view_stats', 'manage_settings'],
      employee: ['read', 'write', 'view_stats'],
      receptionist: ['read', 'write']
    };

    return permissions[user.value.role]?.includes(permission) || false;
  };

  const addUser = (newUser) => {
    // Dodaj użytkownika do listy użytkowników
    const { password: _, ...userWithoutPassword } = newUser;
    console.log('✅ Nowy użytkownik dodany:', userWithoutPassword.name);
  };

  return {
    // Stan
    user,
    isLoading,
    error,
    sessionToken,
    
    // Computed
    isAuthenticated,
    userRole,
    
    // Metody
    login,
    register,
    logout,
    initializeAuth,
    updateProfile,
    hasPermission,
    addUser
  };
});
