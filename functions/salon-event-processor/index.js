const functions = require('@google-cloud/functions-framework');
const { PubSub } = require('@google-cloud/pubsub');

// Inicjalizacja Pub/Sub
const pubsub = new PubSub();

console.log('🔧 Salon Event Processor - Starting...');

/**
 * ============================================================================
 * SALON EVENT PROCESSOR - Cloud Function
 * ============================================================================
 * Funkcja triggered przez Pub/Sub events.
 * Automatycznie przetwarza eventy z aplikacji salon fryzjerski.
 * ============================================================================
 */

/**
 * Pub/Sub Cloud Event handler
 * Ta funkcja jest wywoływana automatycznie gdy wiadomość trafia do tematu
 */
functions.cloudEvent('processEvents', async (cloudEvent) => {
  console.log('📨 Received Pub/Sub event:', cloudEvent.type);
  console.log('📋 CloudEvent full structure:', JSON.stringify(cloudEvent, null, 2));
  
  try {
    // Sprawdź wszystkie możliwe struktury danych
    console.log('🔍 Checking data structure...');
    console.log('cloudEvent.data:', JSON.stringify(cloudEvent.data, null, 2));
    console.log('cloudEvent.data.message:', cloudEvent.data.message ? 'EXISTS' : 'NOT FOUND');
    
    // Próbuj różne ścieżki do danych
    let messageData = null;
    
    // Opcja 1: cloudEvent.data.message.data (Cloud Functions 2nd gen format)
    if (cloudEvent.data && cloudEvent.data.message && cloudEvent.data.message.data) {
      console.log('📦 Found data in cloudEvent.data.message.data');
      messageData = JSON.parse(Buffer.from(cloudEvent.data.message.data, 'base64').toString());
    }
    // Opcja 2: cloudEvent.data bezpośrednio
    else if (cloudEvent.data && typeof cloudEvent.data === 'object') {
      console.log('📦 Found data directly in cloudEvent.data');
      messageData = cloudEvent.data;
    }
    // Opcja 3: cloudEvent.data jako string
    else if (cloudEvent.data && typeof cloudEvent.data === 'string') {
      console.log('📦 Found data as string in cloudEvent.data');
      messageData = JSON.parse(cloudEvent.data);
    }
    
    if (!messageData) {
      console.error('❌ Could not extract message data from any known format');
      console.error('CloudEvent structure:', JSON.stringify(cloudEvent, null, 2));
      return;
    }    
    // Dekoduj base64 message data - stara wersja usunięta
    // const messageData = JSON.parse(
    //   Buffer.from(message.data, 'base64').toString()
    // );
    
    console.log('📋 Processing event:', messageData.eventType);
    console.log('📅 Event timestamp:', messageData.timestamp);
    console.log('🏷️ Event source:', messageData.source);
    
    // Przetwórz różne typy eventów
    let processResult = null;
    
    switch (messageData.eventType) {
      case 'appointment_created':
        processResult = await processAppointmentCreated(messageData.eventData);
        break;
        
      case 'appointment_updated':
        processResult = await processAppointmentUpdated(messageData.eventData);
        break;
        
      case 'appointment_deleted':
        processResult = await processAppointmentCancelled(messageData.eventData);
        break;
        
      case 'client_created':
        processResult = await processClientCreated(messageData.eventData);
        break;
        
      case 'notification_sent':
        processResult = await processNotificationSent(messageData.eventData);
        break;
        
      case 'test_notification':
        processResult = await processTestNotification(messageData.eventData);
        break;
        
      default:
        console.log(`⚠️ Unknown event type: ${messageData.eventType}`);
        processResult = { success: false, reason: 'Unknown event type' };
    }
    
    // Log wynik przetwarzania
    if (processResult && processResult.success) {
      console.log(`✅ Successfully processed: ${messageData.eventType}`);
    } else {
      console.error(`❌ Failed to process: ${messageData.eventType}`, processResult);
    }
    
    // Opcjonalnie - wyślij analytics event
    if (messageData.eventType !== 'analytics_processed') {
      await sendAnalyticsEvent(messageData.eventType, processResult);
    }
    
  } catch (error) {
    console.error('❌ Event processing error:', error);
    // W przypadku błędu, wiadomość zostanie ponownie przetworzona przez Pub/Sub
    throw error;
  }
});

/**
 * ============================================================================
 * EVENT PROCESSORS - Specific handlers for different event types
 * ============================================================================
 */

/**
 * Przetwórz event utworzenia wizyty
 */
async function processAppointmentCreated(appointmentData) {
  console.log('📅 Processing appointment creation:', appointmentData.id);
    try {
    // 1. Zaplanuj przypomnienie na 24h przed wizytą
    await scheduleAppointmentReminder(appointmentData);
    
    // 2. Zaktualizuj statystyki
    await updateSalonStatistics('appointment_created', appointmentData);
    
    return { success: true, actions: ['reminder_scheduled', 'stats_updated'] };
    
  } catch (error) {
    console.error('❌ Error processing appointment creation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Przetwórz event aktualizacji wizyty
 */
async function processAppointmentUpdated(appointmentData) {
  console.log('📅 Processing appointment update:', appointmentData.id);
  
  try {    // Zaktualizuj przypomnienie
    await updateAppointmentReminder(appointmentData);
    
    return { success: true, actions: ['reminder_updated'] };
    
  } catch (error) {
    console.error('❌ Error processing appointment update:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Przetwórz event anulowania wizyty
 */
async function processAppointmentCancelled(appointmentData) {
  console.log('📅 Processing appointment cancellation:', appointmentData.id);
    try {
    // Usuń zaplanowane przypomnienie
    await cancelAppointmentReminder(appointmentData.id);
    
    // Zaktualizuj statystyki
    await updateSalonStatistics('appointment_cancelled', appointmentData);
    
    return { success: true, actions: ['reminder_cancelled', 'stats_updated'] };
    
  } catch (error) {
    console.error('❌ Error processing appointment cancellation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Przetwórz event utworzenia klienta
 */
async function processClientCreated(clientData) {
  console.log('👤 Processing client creation:', clientData.id);
    try {
    // Zaktualizuj statystyki klientów
    await updateSalonStatistics('client_created', clientData);
    
    return { success: true, actions: ['stats_updated'] };
    
  } catch (error) {
    console.error('❌ Error processing client creation:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Przetwórz event wysłania powiadomienia
 */
async function processNotificationSent(notificationData) {
  console.log('🔔 Processing notification sent:', notificationData.id);
  
  try {
    // Zaktualizuj statystyki powiadomień
    await updateSalonStatistics('notification_sent', {
      type: notificationData.type,
      method: notificationData.method,
      success: notificationData.success
    });
    
    return { success: true, actions: ['stats_updated'] };
    
  } catch (error) {
    console.error('❌ Error processing notification sent:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Przetwórz test notification
 */
async function processTestNotification(notificationData) {
  console.log('🧪 Processing test notification');
  
  // Tylko loguj - to jest test
  console.log('📋 Test notification data:', notificationData);
  
  return { success: true, actions: ['logged'] };
}

/**
 * ============================================================================
 * HELPER FUNCTIONS
 * ============================================================================
 */

/**
 * Wyślij powiadomienie do klienta przez funkcję notifications
 */
/**
 * Zaplanuj przypomnienie o wizycie
 */
async function scheduleAppointmentReminder(appointmentData) {
  // TODO: Implement scheduling logic (Cloud Scheduler, Cloud Tasks)
  console.log(`⏰ Scheduling reminder for appointment ${appointmentData.id} on ${appointmentData.date}`);
  
  // Symulacja - w prawdziwej implementacji użyłbyś Cloud Scheduler
  return { success: true, scheduledFor: appointmentData.date };
}

/**
 * Zaktualizuj przypomnienie o wizycie
 */
async function updateAppointmentReminder(appointmentData) {
  console.log(`⏰ Updating reminder for appointment ${appointmentData.id}`);
  return { success: true };
}

/**
 * Anuluj przypomnienie o wizycie
 */
async function cancelAppointmentReminder(appointmentId) {
  console.log(`⏰ Cancelling reminder for appointment ${appointmentId}`);
  return { success: true };
}

/**
 * Zaktualizuj statystyki salonu
 */
async function updateSalonStatistics(eventType, eventData) {
  try {
    // Wyślij event do tematu salon-events (używamy istniejącego)
    const topic = pubsub.topic('salon-events');
    const message = Buffer.from(JSON.stringify({
      eventType: 'analytics_processed',
      originalEvent: eventType,
      eventData: eventData,
      timestamp: new Date().toISOString(),
      source: 'event-processor'
    }));
    
    await topic.publishMessage({ data: message });
    console.log(`📊 Analytics event sent for: ${eventType}`);
    
  } catch (error) {
    console.error('❌ Failed to update statistics:', error);
  }
}

/**
 * Wyślij event analytics
 */
async function sendAnalyticsEvent(eventType, processResult) {
  try {
    const topic = pubsub.topic('salon-events');
    const message = Buffer.from(JSON.stringify({
      eventType: 'event_processed',
      originalEventType: eventType,
      processResult: processResult,
      timestamp: new Date().toISOString(),
      source: 'event-processor'
    }));
    
    await topic.publishMessage({ data: message });
    
  } catch (error) {
    console.error('❌ Failed to send analytics event:', error);
  }
}

console.log('✅ Salon Event Processor - Ready!');
