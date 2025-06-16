import { googleCloudService } from './googleCloudService.js';

class CloudAuthService {
  constructor() {
    this.storageKey = 'salon-users';
    this.sessionKey = 'salon-user-sessions';
  }

  /**
   * Rejestracja nowego użytkownika w chmurze
   */
  async register(userData) {
    try {
      // Pobierz istniejących użytkowników z chmury
      const existingUsers = await this.getUsers();
      
      // Sprawdź czy username już istnieje
      if (existingUsers.find(u => u.username === userData.username)) {
        throw new Error('Nazwa użytkownika już istnieje');
      }

      // Sprawdź czy email już istnieje
      if (existingUsers.find(u => u.email === userData.email)) {
        throw new Error('Email już jest zarejestrowany');
      }

      // Stwórz nowego użytkownika
      const newUser = {
        id: Date.now().toString(),
        username: userData.username,
        passwordHash: await this.hashPassword(userData.password), // Zahashuj hasło
        email: userData.email,
        name: userData.name,
        role: userData.role || 'employee',
        avatar: null,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true
      };

      // Dodaj do listy użytkowników
      existingUsers.push(newUser);
      
      // Zapisz w chmurze
      await this.saveUsers(existingUsers);

      console.log('✅ Użytkownik zarejestrowany w chmurze:', newUser.name);
      return { success: true, user: newUser };

    } catch (error) {
      console.error('❌ Błąd rejestracji w chmurze:', error);
      throw error;
    }
  }

  /**
   * Logowanie użytkownika
   */
  async login(username, password) {
    try {
      // Pobierz użytkowników z chmury
      const users = await this.getUsers();
      
      // Znajdź użytkownika
      const user = users.find(u => u.username === username && u.isActive);
      
      if (!user) {
        throw new Error('Nieprawidłowa nazwa użytkownika lub hasło');
      }

      // Sprawdź hasło
      const isPasswordValid = await this.verifyPassword(password, user.passwordHash);
      
      if (!isPasswordValid) {
        throw new Error('Nieprawidłowa nazwa użytkownika lub hasło');
      }

      // Zaktualizuj ostatnie logowanie
      user.lastLogin = new Date().toISOString();
      await this.updateUser(user);

      // Utwórz sesję
      const session = await this.createSession(user);

      const { passwordHash, ...userWithoutPassword } = user;
      
      console.log('✅ Logowanie w chmurze udane:', user.name);
      return { 
        success: true, 
        user: userWithoutPassword, 
        session: session 
      };

    } catch (error) {
      console.error('❌ Błąd logowania w chmurze:', error);
      throw error;
    }
  }

  /**
   * Weryfikacja sesji
   */
  async verifySession(sessionToken) {
    try {
      if (!sessionToken) return null;

      const sessions = await this.getSessions();
      const session = sessions.find(s => s.token === sessionToken);

      if (!session) return null;

      // Sprawdź czy sesja nie wygasła
      const now = new Date();
      const sessionExpiry = new Date(session.expiresAt);
      
      if (now > sessionExpiry) {
        // Usuń wygasłą sesję
        await this.removeSession(sessionToken);
        return null;
      }

      // Pobierz dane użytkownika
      const users = await this.getUsers();
      const user = users.find(u => u.id === session.userId);

      if (!user || !user.isActive) {
        await this.removeSession(sessionToken);
        return null;
      }

      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;

    } catch (error) {
      console.error('❌ Błąd weryfikacji sesji:', error);
      return null;
    }
  }

  /**
   * Wylogowanie - usuń sesję
   */
  async logout(sessionToken) {
    try {
      if (sessionToken) {
        await this.removeSession(sessionToken);
      }
      console.log('✅ Wylogowano z chmury');
    } catch (error) {
      console.error('❌ Błąd wylogowania:', error);
    }
  }

  // Metody pomocnicze

  async getUsers() {
    try {
      const data = await googleCloudService.getData(this.storageKey);
      return data || [];
    } catch (error) {
      console.log('ℹ️ Brak użytkowników w chmurze, tworzę nową listę');
      return [];
    }
  }

  async saveUsers(users) {
    return await googleCloudService.saveData(this.storageKey, users);
  }

  async updateUser(user) {
    const users = await this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      await this.saveUsers(users);
    }
  }

  async getSessions() {
    try {
      const data = await googleCloudService.getData(this.sessionKey);
      return data || [];
    } catch (error) {
      return [];
    }
  }

  async createSession(user) {
    const sessions = await this.getSessions();
    
    // Usuń stare sesje tego użytkownika
    const filteredSessions = sessions.filter(s => s.userId !== user.id);
    
    // Utwórz nową sesję
    const session = {
      token: this.generateSessionToken(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dni
    };

    filteredSessions.push(session);
    await googleCloudService.saveData(this.sessionKey, filteredSessions);
    
    return session;
  }

  async removeSession(sessionToken) {
    const sessions = await this.getSessions();
    const filteredSessions = sessions.filter(s => s.token !== sessionToken);
    await googleCloudService.saveData(this.sessionKey, filteredSessions);
  }

  generateSessionToken() {
    return 'session-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
  }

  async hashPassword(password) {
    // W rzeczywistej aplikacji użyj bcrypt lub podobnej biblioteki
    // Tutaj używamy prostego hashowania dla demonstracji
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'salon-salt-2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async verifyPassword(password, hash) {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  /**
   * Fallback do localStorage jeśli chmura nie jest dostępna
   */
  async loginWithFallback(username, password) {
    try {
      // Spróbuj najpierw chmurę
      return await this.login(username, password);
    } catch (error) {
      console.warn('🔄 Chmura niedostępna, używam localStorage');
      
      // Fallback do localStorage
      const localUsers = JSON.parse(localStorage.getItem('salon-registered-users') || '[]');
      const defaultUsers = [
        {
          id: 1,
          username: 'admin',
          password: 'admin123',
          email: 'admin@salon.pl',
          name: 'Administrator',
          role: 'admin'
        },
        {
          id: 2,
          username: 'fryzjer',
          password: 'fryzjer123',
          email: 'fryzjer@salon.pl',
          name: 'Fryzjer',
          role: 'employee'
        }
      ];

      const allUsers = [...defaultUsers, ...localUsers];
      const user = allUsers.find(u => u.username === username && u.password === password);
      
      if (!user) {
        throw new Error('Nieprawidłowa nazwa użytkownika lub hasło');
      }

      const { password: _, ...userWithoutPassword } = user;
      return { success: true, user: userWithoutPassword, session: null };
    }
  }

  /**
   * Rejestracja z fallback
   */
  async registerWithFallback(userData) {
    try {
      // Spróbuj najpierw chmurę
      return await this.register(userData);
    } catch (error) {
      console.warn('🔄 Chmura niedostępna, używam localStorage');
      
      // Fallback do localStorage  
      const localUsers = JSON.parse(localStorage.getItem('salon-registered-users') || '[]');
      
      if (localUsers.find(u => u.username === userData.username)) {
        throw new Error('Nazwa użytkownika już istnieje');
      }

      if (localUsers.find(u => u.email === userData.email)) {
        throw new Error('Email już jest zarejestrowany');
      }

      const newUser = {
        id: Date.now(),
        username: userData.username,
        password: userData.password,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'employee',
        avatar: null,
        createdAt: new Date().toISOString()
      };

      localUsers.push(newUser);
      localStorage.setItem('salon-registered-users', JSON.stringify(localUsers));

      return { success: true, user: newUser };
    }
  }
}

export const cloudAuthService = new CloudAuthService();
