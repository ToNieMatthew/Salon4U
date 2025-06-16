export const GOOGLE_CLOUD_CONFIG = {
  projectId: 'salon-fryzjerski-projekt',
  region: 'europe-west1',
  
  // Cloud Storage - przechowywanie plików i statycznej strony
  storage: {
    // Bucket dla aplikacji frontendowej
    websiteBucket: 'salon-fryzjerski-website',
    // Bucket dla uploads i backupów
    dataBucket: 'salon-fryzjerski-data',
    folders: {
      uploads: 'uploads/',        // Zdjęcia klientów, dokumenty
      backups: 'backups/',       // Kopie zapasowe danych
      exports: 'exports/',       // Eksporty raportów
      temp: 'temp/'             // Pliki tymczasowe
    }
  },
  
  // Cloud Pub/Sub - komunikacja w czasie rzeczywistym
  pubsub: {
    topics: {
      appointments: 'salon-appointments-topic',
      notifications: 'salon-notifications-topic',
      analytics: 'salon-analytics-topic',
      exports: 'salon-exports-topic'
    },
    subscriptions: {
      appointmentProcessor: 'appointment-processor-sub',
      emailNotifications: 'email-notifications-sub',
      smsNotifications: 'sms-notifications-sub',
      analyticsProcessor: 'analytics-processor-sub'
    }
  },
  
  // Cloud Functions - serverless funkcje
  functions: {
    region: 'europe-west1',
    functions: {
      // API Backend
      api: 'salon-api',
      // Powiadomienia
      sendNotification: 'salon-send-notification',
      processAppointment: 'salon-process-appointment',
      // Backup i export
      backupData: 'salon-backup-data',
      exportReports: 'salon-export-reports',
      // Analytics
      processAnalytics: 'salon-process-analytics',
      // Webhook handlers
      webhookHandler: 'salon-webhook-handler'
    },
    triggers: {
      // HTTP triggers
      apiEndpoint: `https://europe-west1-salon-fryzjerski-projekt.cloudfunctions.net/salon-api`,
      notificationEndpoint: `https://europe-west1-salon-fryzjerski-projekt.cloudfunctions.net/salon-send-notification`,
      // Pub/Sub triggers będą automatyczne
    }
  },

  // Compute Engine - VM dla produkcji
  compute: {
    zone: 'europe-west1-b',
    instances: {
      production: {
        name: 'salon-production-vm',
        machineType: 'e2-medium',
        diskSize: '20GB',
        tags: ['http-server', 'https-server', 'salon-app']
      },
      staging: {
        name: 'salon-staging-vm', 
        machineType: 'e2-micro',
        diskSize: '10GB',
        tags: ['http-server', 'salon-staging']
      }
    },
    loadBalancer: {
      name: 'salon-load-balancer',
      healthCheck: '/api/health'
    }
  },
  // Konfiguracja środowisk
  environments: {
    development: {
      useCloudServices: true,
      mockServices: false,
      apiUrl: 'https://europe-west1-salon-fryzjerski-projekt.cloudfunctions.net/salon-api'
    },
    staging: {
      useCloudServices: true,
      apiUrl: 'https://staging.salon-fryzjerski.com'
    },    production: {
      useCloudServices: true,
      mockServices: false,
      apiUrl: 'https://europe-west1-salon-fryzjerski-projekt.cloudfunctions.net/salon-api'
    }
  }
};