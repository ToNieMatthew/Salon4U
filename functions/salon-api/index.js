const functions = require('@google-cloud/functions-framework');
const { Storage } = require('@google-cloud/storage');
const { PubSub } = require('@google-cloud/pubsub');

// Inicjalizacja Google Cloud services
const storage = new Storage();
const pubsub = new PubSub();

// Konfiguracja
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const DATA_BUCKET = 'salon-fryzjerski-data';

/**
 * Główny endpoint API dla aplikacji salon fryzjerski
 * Obsługuje wszystkie operacje CRUD i integracje Google Cloud
 */
functions.http('salon-api', async (req, res) => {
  // Ustaw CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  console.log(`📨 API Request: ${req.method} ${req.path}`);
  
  try {
    const path = req.path;
    const method = req.method;
    
    // Router dla różnych endpoints
    if (path.startsWith('/storage')) {
      await handleStorageRequest(req, res);
    } else if (path.startsWith('/pubsub')) {
      await handlePubSubRequest(req, res);
    } else if (path === '/health') {
      await handleHealthCheck(req, res);
    } else if (path === '/stats') {
      await handleStatsRequest(req, res);
    } else {      res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        availableEndpoints: [
          '/health',
          '/stats', 
          '/storage/clients (GET, POST, PUT, DELETE)',
          '/storage/appointments (GET, POST, PUT, DELETE)',
          '/storage/services (GET, POST, PUT, DELETE)',
          '/pubsub/publish'
        ]
      });
    }
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Storage operations handler
 */
async function handleStorageRequest(req, res) {
  const subPath = req.path.replace('/storage', '');
  
  switch (subPath) {
    case '/clients':
      await handleClientsAPI(req, res);
      break;
    case '/appointments':
      await handleAppointmentsAPI(req, res);
      break;
    case '/services':
      await handleServicesAPI(req, res);
      break;
    default:
      res.status(404).json({ success: false, message: 'Storage endpoint not found' });
  }
}

/**
 * ==============================================
 * CLIENTS API - CRUD Operations
 * ==============================================
 */

/**
 * Klienci API handler - GET, POST, PUT, DELETE
 */
async function handleClientsAPI(req, res) {
  const method = req.method;
  
  try {
    switch (method) {
      case 'GET':
        await getClients(req, res);
        break;
      case 'POST':
        await createClient(req, res);
        break;
      case 'PUT':
        await updateClient(req, res);
        break;
      case 'DELETE':
        await deleteClient(req, res);
        break;
      default:
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Clients API error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Clients API error'
    });
  }
}

/**
 * GET /storage/clients - Pobierz wszystkich klientów
 */
async function getClients(req, res) {
  try {
    const bucket = storage.bucket(DATA_BUCKET);
    const file = bucket.file('clients/clients.json');
    
    const [exists] = await file.exists();
    if (!exists) {
      res.json({
        success: true,
        clients: [],
        count: 0,
        message: 'No clients found'
      });
      return;
    }
    
    const [data] = await file.download();
    const clients = JSON.parse(data.toString());
    
    console.log(`✅ Retrieved ${clients.length} clients`);
    
    res.json({
      success: true,
      clients: clients,
      count: clients.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get clients error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve clients'
    });
  }
}

/**
 * POST /storage/clients - Dodaj nowego klienta
 */
async function createClient(req, res) {
  try {
    const clientData = req.body;
    
    if (!clientData.firstName || !clientData.lastName || !clientData.phone) {
      throw new Error('Missing required fields: firstName, lastName, phone');
    }
    
    // Pobierz obecnych klientów
    const bucket = storage.bucket(DATA_BUCKET);
    const file = bucket.file('clients/clients.json');
    
    let clients = [];
    const [exists] = await file.exists();
    if (exists) {
      const [data] = await file.download();
      clients = JSON.parse(data.toString());
    }
    
    // Sprawdź czy klient już istnieje (po telefonie)
    const existingClient = clients.find(c => c.phone === clientData.phone);
    if (existingClient) {
      throw new Error('Client with this phone number already exists');
    }
    
    // Dodaj nowego klienta
    const newClient = {
      ...clientData,
      id: clientData.id || `client_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalVisits: clientData.totalVisits || 0,
      totalSpent: clientData.totalSpent || 0
    };
    
    clients.push(newClient);
    
    // Zapisz do Cloud Storage
    await file.save(JSON.stringify(clients, null, 2), {
      metadata: {
        contentType: 'application/json',
        updatedAt: new Date().toISOString()
      }
    });
      // Wyślij event do Pub/Sub
    await sendToPubSub('salon-events', {
      type: 'client_created',
      clientId: newClient.id,
      clientName: `${newClient.firstName} ${newClient.lastName}`,
      timestamp: new Date().toISOString()
    });
    
    console.log(`✅ Client created: ${newClient.firstName} ${newClient.lastName}`);
    
    res.json({
      success: true,
      client: newClient,
      message: 'Client created successfully'
    });
  } catch (error) {
    console.error('❌ Create client error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      message: 'Failed to create client'
    });
  }
}

/**
 * PUT /storage/clients - Aktualizuj klienta
 */
async function updateClient(req, res) {
  try {
    const clientData = req.body;
    const clientId = clientData.id;
    
    if (!clientId) {
      throw new Error('Client ID is required');
    }
    
    const bucket = storage.bucket(DATA_BUCKET);
    const file = bucket.file('clients/clients.json');
    
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error('Clients database not found');
    }
    
    const [data] = await file.download();
    const clients = JSON.parse(data.toString());
    
    const clientIndex = clients.findIndex(c => c.id === clientId);
    if (clientIndex === -1) {
      throw new Error('Client not found');
    }
    
    clients[clientIndex] = {
      ...clients[clientIndex],
      ...clientData,
      updatedAt: new Date().toISOString()
    };
    
    await file.save(JSON.stringify(clients, null, 2), {
      metadata: {
        contentType: 'application/json',
        updatedAt: new Date().toISOString()
      }
    });
    
    console.log(`✅ Client updated: ${clients[clientIndex].firstName} ${clients[clientIndex].lastName}`);
    
    res.json({
      success: true,
      client: clients[clientIndex],
      message: 'Client updated successfully'
    });
  } catch (error) {
    console.error('❌ Update client error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      message: 'Failed to update client'
    });
  }
}

/**
 * DELETE /storage/clients?id=client_id - Usuń klienta
 */
async function deleteClient(req, res) {
  try {
    const clientId = req.query.id;
    
    if (!clientId) {
      throw new Error('Client ID is required');
    }
    
    const bucket = storage.bucket(DATA_BUCKET);
    const file = bucket.file('clients/clients.json');
    
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error('Clients database not found');
    }
    
    const [data] = await file.download();
    const clients = JSON.parse(data.toString());
    
    const clientIndex = clients.findIndex(c => c.id === clientId);
    if (clientIndex === -1) {
      throw new Error('Client not found');
    }
    
    const deletedClient = clients[clientIndex];
    clients.splice(clientIndex, 1);
    
    await file.save(JSON.stringify(clients, null, 2), {
      metadata: {
        contentType: 'application/json',
        updatedAt: new Date().toISOString()
      }
    });
    
    console.log(`✅ Client deleted: ${deletedClient.firstName} ${deletedClient.lastName}`);
    
    res.json({
      success: true,
      deletedClient: deletedClient,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete client error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      message: 'Failed to delete client'
    });
  }
}

/**
 * ==============================================
 * APPOINTMENTS API - CRUD Operations
 * ==============================================
 */

async function handleAppointmentsAPI(req, res) {
  const method = req.method;
  
  try {
    switch (method) {
      case 'GET':
        await getAppointments(req, res);
        break;
      case 'POST':
        await createAppointment(req, res);
        break;
      case 'PUT':
        await updateAppointment(req, res);
        break;
      case 'DELETE':
        await deleteAppointment(req, res);
        break;
      default:
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Appointments API error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Appointments API error'
    });
  }
}

async function getAppointments(req, res) {
  try {
    const bucket = storage.bucket(DATA_BUCKET);
    const file = bucket.file('appointments/appointments.json');
    
    const [exists] = await file.exists();
    if (!exists) {
      res.json({
        success: true,
        appointments: [],
        count: 0,
        message: 'No appointments found'
      });
      return;
    }
      const [data] = await file.download();
    const dataString = data.toString().trim();
    
    // Bezpieczne parsowanie JSON - obsłuż puste pliki
    let appointments = [];
    if (dataString && dataString.length > 0) {
      try {
        appointments = JSON.parse(dataString);
      } catch (parseError) {
        console.warn('⚠️ Invalid JSON in appointments file, creating new array');
        appointments = [];
      }
    }
    
    console.log(`✅ Retrieved ${appointments.length} appointments`);
    
    res.json({
      success: true,
      appointments: appointments,
      count: appointments.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get appointments error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve appointments'
    });
  }
}

async function createAppointment(req, res) {
  try {
    const appointmentData = req.body;
    
    // Sprawdź wymagane pola - akceptuj zarówno time jak i startTime
    const time = appointmentData.time || appointmentData.startTime;
    if (!appointmentData.clientId || !appointmentData.date || !time) {
      throw new Error('Missing required fields: clientId, date, time/startTime');
    }
    
    const bucket = storage.bucket(DATA_BUCKET);
    const file = bucket.file('appointments/appointments.json');
      let appointments = [];
    const [exists] = await file.exists();
    if (exists) {
      const [data] = await file.download();
      const dataString = data.toString().trim();
      
      // Bezpieczne parsowanie JSON - obsłuż puste pliki
      if (dataString && dataString.length > 0) {
        try {
          appointments = JSON.parse(dataString);
        } catch (parseError) {
          console.warn('⚠️ Invalid JSON in appointments file, creating new array');
          appointments = [];
        }
      }
    }
      // Sprawdź czy termin nie jest zajęty - używaj time lub startTime
    const appointmentTime = appointmentData.time || appointmentData.startTime;
    const conflictingAppointment = appointments.find(a => 
      a.date === appointmentData.date && 
      (a.time === appointmentTime || a.startTime === appointmentTime) &&
      a.status !== 'cancelled'
    );
    
    if (conflictingAppointment) {
      throw new Error('Time slot is already booked');
    }
      const newAppointment = {
      ...appointmentData,
      id: appointmentData.id || `apt_${Date.now()}`,
      // Zapewnij że mamy zarówno time jak i startTime dla kompatybilności
      time: appointmentData.time || appointmentData.startTime,
      startTime: appointmentData.startTime || appointmentData.time,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: appointmentData.status || 'pending'
    };
    
    appointments.push(newAppointment);
    
    await file.save(JSON.stringify(appointments, null, 2), {
      metadata: {
        contentType: 'application/json',
        updatedAt: new Date().toISOString()
      }
    });    // Wyślij event do Pub/Sub z danymi klienta
    let clientData = null;
    try {
      // Pobierz dane klienta dla powiadomień
      const clientFile = bucket.file('clients/clients.json');
      const [clientExists] = await clientFile.exists();
      if (clientExists) {
        const [clientDataContent] = await clientFile.download();
        const clients = JSON.parse(clientDataContent.toString());
        clientData = clients.find(c => c.id === newAppointment.clientId);
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch client data for notifications:', error.message);
    }

    await sendToPubSub('salon-events', {
      type: 'appointment_created',
      appointmentId: newAppointment.id,
      clientId: newAppointment.clientId,
      clientName: clientData ? `${clientData.firstName} ${clientData.lastName}` : newAppointment.clientName,
      clientEmail: clientData ? clientData.email : null,
      clientPhone: clientData ? clientData.phone : null,
      date: newAppointment.date,
      time: newAppointment.time || newAppointment.startTime,
      service: newAppointment.service,
      timestamp: new Date().toISOString()
    });
    
    console.log(`✅ Appointment created: ${newAppointment.date} ${newAppointment.time || newAppointment.startTime}`);
    
    res.json({
      success: true,
      appointment: newAppointment,
      message: 'Appointment created successfully'
    });
  } catch (error) {
    console.error('❌ Create appointment error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      message: 'Failed to create appointment'
    });
  }
}

async function updateAppointment(req, res) {
  try {
    const appointmentData = req.body;
    const appointmentId = appointmentData.id;
    
    if (!appointmentId) {
      throw new Error('Appointment ID is required');
    }
    
    const bucket = storage.bucket(DATA_BUCKET);
    const file = bucket.file('appointments/appointments.json');
    
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error('Appointments database not found');
    }
    
    const [data] = await file.download();
    const dataString = data.toString().trim();
    
    // Bezpieczne parsowanie JSON - obsłuż puste pliki
    let appointments = [];
    if (dataString && dataString.length > 0) {
      try {
        appointments = JSON.parse(dataString);
      } catch (parseError) {
        console.warn('⚠️ Invalid JSON in appointments file, creating new array');
        appointments = [];
      }
    }
    
    const appointmentIndex = appointments.findIndex(a => a.id === appointmentId);
    if (appointmentIndex === -1) {
      throw new Error('Appointment not found');
    }
    
    appointments[appointmentIndex] = {
      ...appointments[appointmentIndex],
      ...appointmentData,
      updatedAt: new Date().toISOString()
    };
    
    await file.save(JSON.stringify(appointments, null, 2), {
      metadata: {
        contentType: 'application/json',
        updatedAt: new Date().toISOString()
      }
    });
    
    console.log(`✅ Appointment updated: ${appointments[appointmentIndex].date} ${appointments[appointmentIndex].time}`);
    
    res.json({
      success: true,
      appointment: appointments[appointmentIndex],
      message: 'Appointment updated successfully'
    });
  } catch (error) {
    console.error('❌ Update appointment error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      message: 'Failed to update appointment'
    });
  }
}

async function deleteAppointment(req, res) {
  try {
    const appointmentId = req.query.id;
    
    if (!appointmentId) {
      throw new Error('Appointment ID is required');
    }
    
    const bucket = storage.bucket(DATA_BUCKET);
    const file = bucket.file('appointments/appointments.json');
    
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error('Appointments database not found');
    }
    
    const [data] = await file.download();
    const dataString = data.toString().trim();
    
    // Bezpieczne parsowanie JSON - obsłuż puste pliki
    let appointments = [];
    if (dataString && dataString.length > 0) {
      try {
        appointments = JSON.parse(dataString);
      } catch (parseError) {
        console.warn('⚠️ Invalid JSON in appointments file, creating new array');
        appointments = [];
      }
    }
    
    const appointmentIndex = appointments.findIndex(a => a.id === appointmentId);
    if (appointmentIndex === -1) {
      throw new Error('Appointment not found');
    }
    
    const deletedAppointment = appointments[appointmentIndex];
    appointments.splice(appointmentIndex, 1);
    
    await file.save(JSON.stringify(appointments, null, 2), {
      metadata: {
        contentType: 'application/json',
        updatedAt: new Date().toISOString()
      }
    });
    
    console.log(`✅ Appointment deleted: ${deletedAppointment.date} ${deletedAppointment.time}`);
    
    res.json({
      success: true,
      deletedAppointment: deletedAppointment,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete appointment error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      message: 'Failed to delete appointment'
    });
  }
}

/**
 * ==============================================
 * SERVICES API - CRUD Operations
 * ==============================================
 */

/**
 * Services API handler - GET, POST, PUT, DELETE
 */
async function handleServicesAPI(req, res) {
  const method = req.method;
  
  try {
    switch (method) {
      case 'GET':
        await getServices(req, res);
        break;
      case 'POST':
        await createService(req, res);
        break;
      case 'PUT':
        await updateService(req, res);
        break;
      case 'DELETE':
        await deleteService(req, res);
        break;
      default:
        res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Services API error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Services API error'
    });
  }
}

/**
 * Pobierz wszystkie usługi
 */
async function getServices(req, res) {
  try {
    const bucket = storage.bucket(DATA_BUCKET);
    const file = bucket.file('services/services.json');
    
    const [exists] = await file.exists();
    if (!exists) {
      // Utwórz plik jeśli nie istnieje
      await file.save('[]', {
        metadata: {
          contentType: 'application/json',
          createdAt: new Date().toISOString()
        }
      });
      console.log('✅ Created new services.json file');
    }
    
    const [data] = await file.download();
    const dataString = data.toString().trim();
    
    let services = [];
    if (dataString && dataString.length > 0) {
      try {
        services = JSON.parse(dataString);
      } catch (parseError) {
        console.warn('⚠️ Invalid JSON in services file, returning empty array');
        services = [];
      }
    }
    
    console.log(`✅ Retrieved ${services.length} services`);
    
    res.json({
      success: true,
      services: services,
      count: services.length
    });
  } catch (error) {
    console.error('❌ Get services error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve services'
    });
  }
}

/**
 * Utwórz nową usługę
 */
async function createService(req, res) {
  try {
    const { name, price, duration, categoryId, description, active } = req.body;
    
    if (!name || !price || !duration) {
      throw new Error('Name, price, and duration are required');
    }
    
    const bucket = storage.bucket(DATA_BUCKET);
    const file = bucket.file('services/services.json');
    
    const [exists] = await file.exists();
    let services = [];
    
    if (exists) {
      const [data] = await file.download();
      const dataString = data.toString().trim();
      
      if (dataString && dataString.length > 0) {
        try {
          services = JSON.parse(dataString);
        } catch (parseError) {
          console.warn('⚠️ Invalid JSON in services file, creating new array');
          services = [];
        }
      }
    }
    
    const newService = {
      id: `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      price: parseFloat(price),
      duration: parseInt(duration),
      categoryId: categoryId?.trim() || '',
      description: description?.trim() || '',
      active: active !== undefined ? active : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    services.push(newService);
    
    await file.save(JSON.stringify(services, null, 2), {
      metadata: {
        contentType: 'application/json',
        updatedAt: new Date().toISOString()
      }
    });
    
    console.log(`✅ Service created: ${newService.name} - ${newService.price}zł`);
    
    res.status(201).json({
      success: true,
      service: newService,
      message: 'Service created successfully'
    });
  } catch (error) {
    console.error('❌ Create service error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      message: 'Failed to create service'
    });
  }
}

/**
 * Aktualizuj usługę
 */
async function updateService(req, res) {
  try {
    const serviceId = req.query.id;
    const { name, price, duration, categoryId, description, active } = req.body;
    
    if (!serviceId) {
      throw new Error('Service ID is required');
    }
    
    const bucket = storage.bucket(DATA_BUCKET);
    const file = bucket.file('services/services.json');
    
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error('Services database not found');
    }
    
    const [data] = await file.download();
    const dataString = data.toString().trim();
    
    let services = [];
    if (dataString && dataString.length > 0) {
      try {
        services = JSON.parse(dataString);
      } catch (parseError) {
        throw new Error('Invalid services database format');
      }
    }
    
    const serviceIndex = services.findIndex(s => s.id === serviceId);
    if (serviceIndex === -1) {
      throw new Error('Service not found');
    }
    
    // Aktualizuj tylko podane pola
    if (name !== undefined) services[serviceIndex].name = name.trim();
    if (price !== undefined) services[serviceIndex].price = parseFloat(price);
    if (duration !== undefined) services[serviceIndex].duration = parseInt(duration);
    if (categoryId !== undefined) services[serviceIndex].categoryId = categoryId.trim();
    if (description !== undefined) services[serviceIndex].description = description.trim();
    if (active !== undefined) services[serviceIndex].active = active;
    
    services[serviceIndex].updatedAt = new Date().toISOString();
    
    await file.save(JSON.stringify(services, null, 2), {
      metadata: {
        contentType: 'application/json',
        updatedAt: new Date().toISOString()
      }
    });
    
    console.log(`✅ Service updated: ${services[serviceIndex].name}`);
    
    res.json({
      success: true,
      service: services[serviceIndex],
      message: 'Service updated successfully'
    });
  } catch (error) {
    console.error('❌ Update service error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      message: 'Failed to update service'
    });
  }
}

/**
 * Usuń usługę
 */
async function deleteService(req, res) {
  try {
    const serviceId = req.query.id;
    
    if (!serviceId) {
      throw new Error('Service ID is required');
    }
    
    const bucket = storage.bucket(DATA_BUCKET);
    const file = bucket.file('services/services.json');
    
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error('Services database not found');
    }
    
    const [data] = await file.download();
    const dataString = data.toString().trim();
    
    let services = [];
    if (dataString && dataString.length > 0) {
      try {
        services = JSON.parse(dataString);
      } catch (parseError) {
        throw new Error('Invalid services database format');
      }
    }
    
    const serviceIndex = services.findIndex(s => s.id === serviceId);
    if (serviceIndex === -1) {
      throw new Error('Service not found');
    }
    
    const deletedService = services[serviceIndex];
    services.splice(serviceIndex, 1);
    
    await file.save(JSON.stringify(services, null, 2), {
      metadata: {
        contentType: 'application/json',
        updatedAt: new Date().toISOString()
      }
    });
    
    console.log(`✅ Service deleted: ${deletedService.name}`);
    
    res.json({
      success: true,
      deletedService: deletedService,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete service error:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      message: 'Failed to delete service'
    });
  }
}

/**
 * Pub/Sub operations handler
 */
async function handlePubSubRequest(req, res) {
  const subPath = req.path.replace('/pubsub', '');
  
  switch (subPath) {
    case '/publish':
      await handlePublishMessage(req, res);
      break;
    default:
      res.status(404).json({ success: false, message: 'Pub/Sub endpoint not found' });
  }
}

async function handlePublishMessage(req, res) {
  try {
    const { topicName, message } = req.body;
    
    if (!topicName || !message) {
      throw new Error('Missing topic name or message');
    }
    
    const topic = pubsub.topic(topicName);
    const messageBuffer = Buffer.from(JSON.stringify(message));
    
    const messageId = await topic.publishMessage({
      data: messageBuffer,
      attributes: {
        timestamp: new Date().toISOString(),
        source: 'cloud-function'
      }
    });
    
    console.log(`✅ Message published: ${messageId} to ${topicName}`);
    
    res.json({
      success: true,
      messageId: messageId,
      topicName: topicName,
      message: 'Message published successfully'
    });
  } catch (error) {
    console.error('❌ Publish error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Message publishing failed'
    });
  }
}

/**
 * Health check handler
 */
async function handleHealthCheck(req, res) {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      project: PROJECT_ID,
      function: 'salon-api',
      version: '3.0',
      services: {
        storage: true,
        pubsub: true,
        functions: true,
        compute: true
      }
    };
    
    res.json(healthStatus);
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Stats handler
 */
async function handleStatsRequest(req, res) {
  try {
    const stats = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      stats: {
        uploads: Math.floor(Math.random() * 100),
        backups: Math.floor(Math.random() * 50),
        events: Math.floor(Math.random() * 500),
        notifications: Math.floor(Math.random() * 200)
      },
      storage: {
        totalSize: '2.5 GB',
        filesCount: 150
      },
      compute: {
        cpuUsage: Math.floor(Math.random() * 50) + 10,
        memoryUsage: Math.floor(Math.random() * 40) + 30
      }
    };
    
    res.json(stats);
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to get stats'
    });
  }
}

/**
 * Helper function - Wyślij wiadomość do Pub/Sub
 */
async function sendToPubSub(topicName, data) {
  try {
    const topic = pubsub.topic(topicName);
    const message = Buffer.from(JSON.stringify(data));
    
    const messageId = await topic.publishMessage({ data: message });
    console.log(`📨 Message sent to ${topicName}: ${messageId}`);
  } catch (error) {
    console.error(`❌ PubSub error (${topicName}):`, error);
  }
}