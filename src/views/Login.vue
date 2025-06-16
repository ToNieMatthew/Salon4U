<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo i nagłówek -->
      <div class="login-header">        <div class="logo">
          <img src="/Logo_v2.png" alt="Salon Logo" class="logo-image" />
        </div>
        <h1>Salon Fryzjerski</h1>
        <p>Zaloguj się do systemu zarządzania</p>
      </div>

      <!-- Formularz logowania -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Nazwa użytkownika</label>
          <input 
            id="username"
            v-model="credentials.username" 
            type="text" 
            required
            :disabled="isLoading"
            placeholder="Wpisz nazwę użytkownika"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Hasło</label>
          <input 
            id="password"
            v-model="credentials.password" 
            type="password" 
            required
            :disabled="isLoading"
            placeholder="Wpisz hasło"
            class="form-input"
          />
        </div>
        
        <button 
          type="submit" 
          :disabled="isLoading"
          class="login-btn"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Logowanie...' : 'Zaloguj się' }}
        </button>
        
        <div v-if="error" class="error-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          {{ error }}
        </div>
      </form>
      
      <!-- Demo konta -->
      <div class="demo-section">
        <div class="divider">
          <span>Demo konta</span>
        </div>
        
        <div class="demo-buttons">
          <button @click="useDemo('admin')" class="demo-btn admin" :disabled="isLoading">
            <span class="demo-icon">👑</span>
            <span class="demo-text">
              <strong>Administrator</strong>
              <small>Pełny dostęp</small>
            </span>
          </button>
          
          <button @click="useDemo('fryzjer')" class="demo-btn employee" :disabled="isLoading">
            <span class="demo-icon">✂️</span>
            <span class="demo-text">
              <strong>Fryzjer</strong>
              <small>Kalendarz i klienci</small>
            </span>
          </button>
        </div>
        
        <!-- Link do rejestracji -->
        <div class="register-section">
          <p>Nie masz konta?</p>
          <button @click="showRegister = true" class="register-link" type="button">
            Zarejestruj się
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal rejestracji -->
    <div v-if="showRegister" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Rejestracja nowego konta</h2>
          <button @click="closeModal" class="close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
            <label for="reg-name">Imię i nazwisko</label>
            <input 
              id="reg-name"
              v-model="registerData.name" 
              type="text" 
              required
              :disabled="isRegistering"
              placeholder="Wpisz imię i nazwisko"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="reg-email">Email</label>
            <input 
              id="reg-email"
              v-model="registerData.email" 
              type="email" 
              required
              :disabled="isRegistering"
              placeholder="Wpisz email"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="reg-username">Nazwa użytkownika</label>
            <input 
              id="reg-username"
              v-model="registerData.username" 
              type="text" 
              required
              :disabled="isRegistering"
              placeholder="Wpisz nazwę użytkownika"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="reg-password">Hasło</label>
            <input 
              id="reg-password"
              v-model="registerData.password" 
              type="password" 
              required
              :disabled="isRegistering"
              placeholder="Wpisz hasło (min. 6 znaków)"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="reg-role">Rola</label>
            <select 
              id="reg-role"
              v-model="registerData.role" 
              required
              :disabled="isRegistering"
              class="form-input"
            >
              <option value="">Wybierz rolę</option>
              <option value="employee">Fryzjer</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          
          <div v-if="registerError" class="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            {{ registerError }}
          </div>
          
          <div v-if="registerSuccess" class="success-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>
            {{ registerSuccess }}
          </div>
          
          <button 
            type="submit" 
            :disabled="isRegistering"
            class="register-btn"
          >
            <span v-if="isRegistering" class="loading-spinner"></span>
            {{ isRegistering ? 'Rejestrowanie...' : 'Zarejestruj się' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore.js';

const router = useRouter();
const authStore = useAuthStore();

// Stan logowania
const credentials = ref({
  username: '',
  password: ''
});

// Stan rejestracji
const showRegister = ref(false);
const isRegistering = ref(false);
const registerError = ref(null);
const registerSuccess = ref(null);

const registerData = ref({
  name: '',
  email: '',
  username: '',
  password: '',
  role: ''
});

// Computed
const isLoading = computed(() => authStore.isLoading);
const error = computed(() => authStore.error);

// Metody logowania
const handleLogin = async () => {
  const result = await authStore.login(credentials.value.username, credentials.value.password);
  if (result.success) {
    router.push('/dashboard');
  }
};

const useDemo = (type) => {
  const demos = {
    admin: { username: 'admin', password: 'admin123' },
    fryzjer: { username: 'fryzjer', password: 'fryzjer123' }
  };
  credentials.value = demos[type];
};

// Metody rejestracji
const handleRegister = async () => {
  registerError.value = null;
  registerSuccess.value = null;
  
  // Walidacja
  if (registerData.value.password.length < 6) {
    registerError.value = 'Hasło musi mieć co najmniej 6 znaków';
    return;
  }
  
  isRegistering.value = true;
  
  try {
    const result = await authStore.register(registerData.value);
    
    if (result.success) {
      registerSuccess.value = 'Konto zostało utworzone pomyślnie! Możesz się teraz zalogować.';
      
      // Reset formularza
      registerData.value = {
        name: '',
        email: '',
        username: '',
        password: '',
        role: ''
      };
      
      // Zamknij modal po 2 sekundach
      setTimeout(() => {
        closeModal();
      }, 2000);
    } else {
      throw new Error(result.error);
    }
    
  } catch (err) {
    registerError.value = err.message;
  } finally {
    isRegistering.value = false;
  }
};

const closeModal = () => {
  showRegister.value = false;
  registerError.value = null;
  registerSuccess.value = null;
  registerData.value = {
    name: '',
    email: '',
    username: '',
    password: '',
    role: ''
  };
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 420px;
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #7B57FF, #9F81FF);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
}

.logo-image {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.login-header h1 {
  color: #1f2937;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.login-header p {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
}

.login-form {
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #374151;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #7B57FF;
  box-shadow: 0 0 0 3px rgba(123, 87, 255, 0.1);
}

.form-input:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.login-btn, .register-btn {
  width: 100%;
  background: linear-gradient(135deg, #7B57FF, #9F81FF);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-btn:hover:not(:disabled), .register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(123, 87, 255, 0.3);
}

.login-btn:disabled, .register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-top: 16px;
}

.success-message {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  margin-top: 16px;
}

.demo-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 24px;
}

.divider {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
}

.divider span {
  background: white;
  padding: 0 16px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
  z-index: -1;
}

.demo-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.demo-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.demo-btn:hover:not(:disabled) {
  border-color: #7B57FF;
  background: #f8f9ff;
}

.demo-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.demo-btn.admin:hover:not(:disabled) {
  border-color: #f59e0b;
  background: #fffbeb;
}

.demo-btn.employee:hover:not(:disabled) {
  border-color: #10b981;
  background: #ecfdf5;
}

.demo-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.demo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.demo-text strong {
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
}

.demo-text small {
  color: #6b7280;
  font-size: 12px;
}

.register-section {
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.register-section p {
  color: #6b7280;
  font-size: 14px;
  margin: 0 0 12px 0;
}

.register-link {
  background: transparent;
  border: 2px solid #7B57FF;
  color: #7B57FF;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.register-link:hover {
  background: #7B57FF;
  color: white;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.modal-header h2 {
  color: #1f2937;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.register-form .form-group {
  margin-bottom: 16px;
}

/* Responsive */
@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
    margin: 16px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
  
  .demo-buttons {
    gap: 8px;
  }
  
  .demo-btn {
    padding: 10px 12px;
  }
  
  .modal-content {
    padding: 24px 20px;
    margin: 16px;
  }
  
  .modal-header h2 {
    font-size: 20px;
  }
}
</style>
