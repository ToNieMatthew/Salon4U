import { GOOGLE_CLOUD_CONFIG } from '../config/google-cloud.js';
import { getApiBaseUrl, CLOUD_FUNCTIONS_URLS } from '../config/cloud-functions-urls.js';

class GoogleCloudService {
  constructor() {
    console.log('🚀 Inicjalizacja Google Cloud Service - zawsze online');
    
    // Określ środowisko
    this.environment = this.detectEnvironment();
    this.config = GOOGLE_CLOUD_CONFIG.environments[this.environment];
    
    console.log(`📍 Środowisko: ${this.environment}`);
    console.log(`☁️ Cloud Services: ZAWSZE WŁĄCZONE`);
    console.log(`🌐 Hostname: ${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}`);
    
    // Zawsze inicjalizuj chmurę
    this.initializeCloudIntegration();
  }
  detectEnvironment() {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    
    console.log('🌍 Detecting environment for hostname:', hostname);
    
    let environment;
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      environment = 'development';
    } else if (hostname.includes('staging')) {
      environment = 'staging';
    } else {
      environment = 'production';
    }
    
    console.log('🌍 Detected environment:', environment);
    return environment;
  }  initializeCloudIntegration() {
    console.log('☁️ Inicjalizacja integracji Google Cloud');
    this.apiBaseUrl = getApiBaseUrl();
    this.notificationUrl = CLOUD_FUNCTIONS_URLS.notifications;
    console.log(`📡 API Base URL: ${this.apiBaseUrl}`);
    console.log(`📡 Notification URL: ${this.notificationUrl}`);
  }
  // ==================== CLOUD STORAGE INTEGRATION ====================
  
  // ==================== CLIENTS API ====================
    /**
   * Pobierz wszystkich klientów z Cloud Storage
   */
  async getClients() {
    console.log('👥 Pobieranie klientów z Cloud Storage');

    try {
      const response = await fetch(`${this.apiBaseUrl}/storage/clients`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Pobrano ${result.count} klientów z Cloud Storage`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Get clients error:', error);
      return { success: false, error: error.message, clients: [] };
    }
  }
  /**
   * Dodaj nowego klienta do Cloud Storage
   */
  async createClient(clientData) {
    console.log('👤 Dodawanie klienta do Cloud Storage:', clientData.firstName, clientData.lastName);

    try {
      const response = await fetch(`${this.apiBaseUrl}/storage/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Klient dodany do Cloud Storage:', result.client.id);
        
        // Publikuj event o utworzeniu klienta
        await this.publishEvent('client_created', {
          clientId: result.client.id,
          clientName: `${result.client.firstName} ${result.client.lastName}`,
          clientPhone: result.client.phone
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ Create client error:', error);
      return { success: false, error: error.message };
    }
  }
  /**
   * Aktualizuj klienta w Cloud Storage
   */
  async updateClient(clientData) {
    console.log('👤 Aktualizacja klienta w Cloud Storage:', clientData.id);

    try {
      const response = await fetch(`${this.apiBaseUrl}/storage/clients`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Klient zaktualizowany w Cloud Storage:', result.client.id);
        
        // Publikuj event o aktualizacji klienta
        await this.publishEvent('client_updated', {
          clientId: result.client.id,
          clientName: `${result.client.firstName} ${result.client.lastName}`,
          changes: Object.keys(clientData)
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ Update client error:', error);
      return { success: false, error: error.message };
    }
  }
  /**
   * Usuń klienta z Cloud Storage
   */
  async deleteClient(clientId) {
    console.log('👤 Usuwanie klienta z Cloud Storage:', clientId);

    try {
      const response = await fetch(`${this.apiBaseUrl}/storage/clients?id=${clientId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Klient usunięty z Cloud Storage:', clientId);
        
        // Publikuj event o usunięciu klienta
        await this.publishEvent('client_deleted', {
          clientId: clientId,
          clientName: result.deletedClient ? `${result.deletedClient.firstName} ${result.deletedClient.lastName}` : 'Unknown'
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ Delete client error:', error);
      return { success: false, error: error.message };
    }
  }
  // ==================== SERVICES API ====================
    /**
   * Pobierz wszystkie usługi z Cloud Storage
   */
  async getServices() {
    console.log('🔧 Pobieranie usług z Cloud Storage');

    try {
      const response = await fetch(`${this.apiBaseUrl}/storage/services`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Pobrano ${result.count} usług z Cloud Storage`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Get services error:', error);
      return { success: false, error: error.message, services: [] };
    }
  }
  /**
   * Dodaj nową usługę do Cloud Storage
   */
  async createService(serviceData) {
    console.log('🔧 Dodawanie usługi do Cloud Storage:', serviceData.name);

    try {
      const response = await fetch(`${this.apiBaseUrl}/storage/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Usługa dodana do Cloud Storage:', result.service.id);
        
        // Publikuj event o utworzeniu usługi
        await this.publishEvent('service_created', {
          serviceId: result.service.id,
          name: result.service.name,
          categoryId: result.service.categoryId,
          price: result.service.price
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ Create service error:', error);
      return { success: false, error: error.message };
    }
  }
  /**
   * Aktualizuj usługę w Cloud Storage
   */
  async updateService(serviceData) {
    console.log('🔧 Aktualizacja usługi w Cloud Storage:', serviceData.id);

    try {
      const response = await fetch(`${this.apiBaseUrl}/storage/services/${serviceData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Usługa zaktualizowana w Cloud Storage:', result.service.id);
        
        // Publikuj event o aktualizacji usługi
        await this.publishEvent('service_updated', {
          serviceId: result.service.id,
          name: result.service.name,
          changes: Object.keys(serviceData)
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ Update service error:', error);
      return { success: false, error: error.message };
    }
  }
  /**
   * Usuń usługę z Cloud Storage
   */
  async deleteService(serviceId) {
    console.log('🔧 Usuwanie usługi z Cloud Storage:', serviceId);

    try {
      const response = await fetch(`${this.apiBaseUrl}/storage/services/${serviceId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Usługa usunięta z Cloud Storage:', serviceId);
        
        // Publikuj event o usunięciu usługi
        await this.publishEvent('service_deleted', {
          serviceId: serviceId
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ Delete service error:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== APPOINTMENTS API ====================
    /**
   * Pobierz wszystkie appointments z Cloud Storage
   */
  async getAppointments() {
    console.log('📅 Pobieranie appointments z Cloud Storage');

    try {
      const response = await fetch(`${this.apiBaseUrl}/storage/appointments`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Pobrano ${result.count} appointments z Cloud Storage`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Get appointments error:', error);
      return { success: false, error: error.message, appointments: [] };
    }
  }
  /**
   * Dodaj nowy appointment do Cloud Storage
   */  async createAppointment(appointmentData) {
    console.log('📅 Dodawanie appointment do Cloud Storage:', appointmentData.date, appointmentData.time);
    console.log('🔍 Wszystkie dane appointment:', appointmentData);

    try {
      const url = `${this.apiBaseUrl}/storage/appointments`;
      console.log('📡 Wysyłam POST do URL:', url);
      console.log('📦 Body request:', JSON.stringify(appointmentData, null, 2));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', response.headers);
      
      const result = await response.json();
      console.log('📥 Response body:', result);
      
      if (result.success) {
        console.log('✅ Appointment dodany do Cloud Storage:', result.appointment.id);
        
        // Publikuj event o utworzeniu appointment
        await this.publishEvent('appointment_created', {
          appointmentId: result.appointment.id,
          clientId: result.appointment.clientId,
          date: result.appointment.date,
          time: result.appointment.time
        });
      }
        return result;    } catch (error) {
      console.error('❌ Create appointment error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      return { success: false, error: error.message };
    }
  }
  /**
   * Aktualizuj appointment w Cloud Storage
   */
  async updateAppointment(appointmentData) {
    console.log('📅 Aktualizacja appointment w Cloud Storage:', appointmentData.id);

    try {
      const response = await fetch(`${this.apiBaseUrl}/storage/appointments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Appointment zaktualizowany w Cloud Storage:', result.appointment.id);
        
        // Publikuj event o aktualizacji appointment
        await this.publishEvent('appointment_updated', {
          appointmentId: result.appointment.id,
          clientId: result.appointment.clientId,
          changes: Object.keys(appointmentData)
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ Update appointment error:', error);
      return { success: false, error: error.message };
    }
  }
  /**
   * Usuń appointment z Cloud Storage
   */  async deleteAppointment(appointmentId) {
    console.log('📅 Usuwanie appointment z Cloud Storage:', appointmentId);
    console.log('🌐 API URL:', this.apiBaseUrl);

    console.log('☁️ Używam Cloud API do usuwania wizyt');
    try {
      const deleteUrl = `${this.apiBaseUrl}/storage/appointments?id=${appointmentId}`;
      console.log('🔗 DELETE URL:', deleteUrl);
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      console.log('📥 Odpowiedź z Cloud API:', result);
      
      if (result.success) {
        console.log('✅ Appointment usunięty z Cloud Storage:', appointmentId);
        
        // Publikuj event o usunięciu appointment
        await this.publishEvent('appointment_deleted', {
          appointmentId: appointmentId,
          deletedAppointment: result.deletedAppointment || null
        });
      } else {
        console.error('❌ Usuwanie nieudane:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Delete appointment error:', error);
      return { success: false, error: error.message };
    }
  }
  /**
   * Upload pliku do Cloud Storage
   * @param {File} file - Plik do upload
   * @param {string} folder - Folder docelowy (uploads, exports, temp)
   * @param {string} customName - Opcjonalna custom nazwa
   */
  async uploadFile(file, folder = 'uploads', customName = null) {
    console.log(`📤 Upload pliku do Cloud Storage: ${file.name} → ${folder}`);
    
    const fileName = customName || `${Date.now()}_${file.name}`;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('fileName', fileName);

      const response = await fetch(`${this.apiBaseUrl}/api/storage/upload`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Plik uploaded do Cloud Storage:', result.url);
        // Publikuj event o upload
        await this.publishEvent('file_uploaded', {
          fileName,
          folder,
          url: result.url,
          size: file.size,
          type: file.type
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ Cloud Storage upload error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Backup danych do Cloud Storage
   */
  async backupData(data, backupName, options = {}) {
    console.log(`💾 Backup danych do Cloud Storage: ${backupName}`);
    
    const backupData = {
      name: backupName,
      data: data,
      timestamp: new Date().toISOString(),
      version: options.version || '1.0',
      environment: this.environment,
      metadata: {
        recordCount: Array.isArray(data) ? data.length : Object.keys(data).length,
        size: JSON.stringify(data).length,
        ...options.metadata
      }    };

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/storage/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupData)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Backup utworzony w Cloud Storage');
        // Publikuj event o backup
        await this.publishEvent('data_backed_up', {
          backupName,
          fileName: result.fileName,
          recordCount: backupData.metadata.recordCount
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ Cloud Storage backup error:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== CLOUD PUB/SUB INTEGRATION ====================
    /**
   * Publikuj event do Cloud Pub/Sub
   */
  async publishEvent(eventType, eventData, topicName = null) {
    const topic = topicName || this.getTopicForEvent(eventType);
    console.log(`📨 Publikowanie eventu: ${eventType} → ${topic}`);
    
    const message = {
      eventType,
      eventData,
      timestamp: new Date().toISOString(),
      source: 'salon-frontend',
      environment: this.environment,
      sessionId: this.getSessionId()
    };

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/pubsub/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicName: topic, message })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Event opublikowany: ${result.messageId}`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Pub/Sub publish error:', error);
      return { success: false, error: error.message };
    }
  }

  getTopicForEvent(eventType) {
    const eventTopicMap = {
      'appointment_created': GOOGLE_CLOUD_CONFIG.pubsub.topics.appointments,
      'appointment_updated': GOOGLE_CLOUD_CONFIG.pubsub.topics.appointments,
      'appointment_deleted': GOOGLE_CLOUD_CONFIG.pubsub.topics.appointments,
      'notification_sent': GOOGLE_CLOUD_CONFIG.pubsub.topics.notifications,
      'file_uploaded': GOOGLE_CLOUD_CONFIG.pubsub.topics.analytics,
      'data_backed_up': GOOGLE_CLOUD_CONFIG.pubsub.topics.analytics,
      'export_requested': GOOGLE_CLOUD_CONFIG.pubsub.topics.exports
    };
    
    return eventTopicMap[eventType] || GOOGLE_CLOUD_CONFIG.pubsub.topics.analytics;
  }

  // ==================== CLOUD FUNCTIONS INTEGRATION ====================
    /**
   * Wyślij powiadomienie przez Cloud Function
   */
  async sendNotification(notificationData) {
    console.log('🔔 Wysyłanie powiadomienia przez Cloud Function:', notificationData.type);

    try {
      const response = await fetch(this.notificationUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...notificationData,
          environment: this.environment,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Powiadomienie wysłane przez Cloud Function');
        // Publikuj event o wysłaniu powiadomienia
        await this.publishEvent('notification_sent', {
          type: notificationData.type,
          recipient: notificationData.clientPhone || notificationData.clientEmail,
          success: true
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ Cloud Function notification error:', error);
      return { success: false, error: error.message };
    }
  }
  /**
   * Przetwórz wizytę przez Cloud Function
   */
  async processAppointment(appointmentData, action = 'create') {
    console.log(`⚙️ Przetwarzanie wizyty przez Cloud Function: ${action}`);

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/functions/process-appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment: appointmentData,
          action: action,
          environment: this.environment,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Wizyta przetworzona przez Cloud Function');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Cloud Function process error:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== COMPUTE ENGINE INTEGRATION ====================
    /**
   * Sprawdź status Compute Engine instancji
   */
  async checkComputeEngineStatus() {
    console.log('🖥️ Sprawdzanie statusu Compute Engine');

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/compute/status`);
      const result = await response.json();
      
      console.log('✅ Status Compute Engine:', result.status);
      return result;
    } catch (error) {
      console.error('❌ Compute Engine status error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Health check całego systemu
   */
  async systemHealthCheck() {
    console.log('🏥 Sprawdzanie health całego systemu Google Cloud');
    
    try {
      const [storage, pubsub, functions, compute] = await Promise.allSettled([
        this.testCloudStorage(),
        this.testPubSub(),
        this.testCloudFunctions(),
        this.checkComputeEngineStatus()
      ]);

      const healthStatus = {
        overall: 'healthy',
        timestamp: new Date().toISOString(),
        environment: this.environment,
        services: {
          storage: storage.status === 'fulfilled' && storage.value.success,
          pubsub: pubsub.status === 'fulfilled' && pubsub.value.success,
          functions: functions.status === 'fulfilled' && functions.value.success,
          compute: compute.status === 'fulfilled' && compute.value.success
        }
      };

      // Określ ogólny status
      const failedServices = Object.values(healthStatus.services).filter(status => !status).length;
      if (failedServices > 0) {
        healthStatus.overall = failedServices > 2 ? 'critical' : 'degraded';
      }

      console.log('🏥 System health check completed:', healthStatus.overall);
      return healthStatus;
    } catch (error) {
      console.error('❌ System health check error:', error);
      return {
        overall: 'critical',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
  // 📤 UPLOAD PLIKÓW - np. zdjęcia klientów, dokumenty
  async uploadFile(file, fileName) {
    console.log(`📤 Upload pliku: ${fileName}`);

    try {
      const filePath = `${GOOGLE_CLOUD_CONFIG.storage.uploadsFolder}${fileName}`;
      const blob = this.bucket.file(filePath);
      
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.type || 'application/octet-stream',
        },
      });

      return new Promise((resolve, reject) => {
        blobStream.on('error', (err) => {
          console.error('❌ Upload error:', err);
          reject(err);
        });

        blobStream.on('finish', async () => {
          const publicUrl = `https://storage.googleapis.com/${GOOGLE_CLOUD_CONFIG.storage.bucketName}/${filePath}`;
          console.log('✅ Plik uploaded:', publicUrl);
          resolve({ 
            success: true, 
            url: publicUrl,
            message: 'Plik uploaded pomyślnie'
          });
        });

        blobStream.end(file);
      });
    } catch (error) {
      console.error('❌ Cloud Storage upload error:', error);
      return { 
        success: false, 
        error: error.message,
        message: 'Błąd podczas upload pliku'
      };
    }
  }

  // 💾 BACKUP DANYCH - automatyczne kopie zapasowe
  async backupData(data, backupName) {
    console.log(`💾 Backup danych: ${backupName}`);
    
    if (!this.isProduction) {
      console.log('🛠️ DEV MODE: Zapis backup do localStorage');
      const backupKey = `backup_${backupName}_${new Date().toISOString().split('T')[0]}`;
      localStorage.setItem(backupKey, JSON.stringify(data));
      return { 
        success: true, 
        fileName: backupKey,
        message: 'Backup zapisany lokalnie'
      };
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${GOOGLE_CLOUD_CONFIG.storage.backupsFolder}${backupName}_${timestamp}.json`;
      const file = this.bucket.file(fileName);
      
      await file.save(JSON.stringify(data, null, 2), {
        metadata: {
          contentType: 'application/json',
        },
      });

      console.log('✅ Backup utworzony:', fileName);
      return { 
        success: true, 
        fileName,
        message: 'Backup utworzony w Cloud Storage'
      };
    } catch (error) {
      console.error('❌ Backup error:', error);
      return { 
        success: false, 
        error: error.message,
        message: 'Błąd podczas tworzenia backup'
      };
    }
  }

  // 📨 PUBLIKOWANIE WIADOMOŚCI - powiadomienia o wizytach
  async publishMessage(topicName, message) {
    console.log(`📨 Publikowanie wiadomości do ${topicName}:`, message);
    
    if (!this.isProduction) {
      console.log('🛠️ DEV MODE: Symulacja wysyłania wiadomości');
      // Zapisz do localStorage dla celów deweloperskich
      const messages = JSON.parse(localStorage.getItem('dev_messages') || '[]');
      messages.push({
        topic: topicName,
        message,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('dev_messages', JSON.stringify(messages));
      return { 
        success: true, 
        messageId: `dev_${Date.now()}`,
        message: 'Wiadomość wysłana (symulacja)'
      };
    }

    try {
      const topic = this.pubsub.topic(topicName);
      const messageBuffer = Buffer.from(JSON.stringify(message));
      
      const messageId = await topic.publishMessage({
        data: messageBuffer,
        attributes: {
          timestamp: new Date().toISOString(),
          source: 'salon-app'
        }
      });

      console.log(`✅ Wiadomość ${messageId} wysłana do ${topicName}`);
      return { 
        success: true, 
        messageId,
        message: 'Wiadomość wysłana do Pub/Sub'
      };
    } catch (error) {
      console.error('❌ Pub/Sub publish error:', error);
      return { 
        success: false, 
        error: error.message,
        message: 'Błąd podczas wysyłania wiadomości'
      };
    }
  }

  // 🔔 WYSYŁANIE POWIADOMIEŃ - SMS, Email itp.
  async sendNotification(notificationData) {
    console.log('🔔 Wysyłanie powiadomienia:', notificationData);
    
    if (!this.isProduction) {
      console.log('🛠️ DEV MODE: Symulacja powiadomienia');
      return { 
        success: true, 
        message: 'Powiadomienie wysłane (symulacja)',
        details: notificationData
      };
    }

    try {
      // Na razie symulacja - później dodamy prawdziwe Cloud Functions
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Powiadomienie wysłane');
        return result;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Notification error:', error);
      return { 
        success: false, 
        error: error.message,
        message: 'Błąd podczas wysyłania powiadomienia'      };
    }
  }

  // ==================== UTILITY METHODS ====================
  
  getSessionId() {
    if (typeof window === 'undefined') return 'server-session';
    
    let sessionId = sessionStorage.getItem('salon_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('salon_session_id', sessionId);
    }
    return sessionId;
  }
  /**
   * Export danych w różnych formatach
   */
  async exportData(dataType, format = 'json', options = {}) {
    console.log(`📊 Export danych: ${dataType} → ${format}`);
    
    // Publikuj event o export
    await this.publishEvent('export_requested', {
      dataType,
      format,
      options,
      requestedBy: this.getSessionId()
    });

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataType, format, options })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Export completed:', result.downloadUrl);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Export error:', error);
      return { success: false, error: error.message };
    }
  }
  /**
   * Pobierz statystyki systemu
   */
  async getSystemStats() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/stats`);
      return await response.json();
    } catch (error) {
      console.error('❌ Stats error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Eksportuj jedną instancję (singleton)
export const googleCloudService = new GoogleCloudService();