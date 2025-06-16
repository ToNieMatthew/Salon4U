<template>
  <div v-if="showPanel" class="google-cloud-panel">
    <div class="panel-header">
      <div class="header-content">
        <h3>☁️ Google Cloud Dashboard</h3>
        <div class="environment-badge" :class="environment">
          {{ environment.toUpperCase() }}
        </div>
      </div>
      <button @click="togglePanel" class="toggle-btn">
        {{ panelOpen ? '▼' : '▲' }}
      </button>
    </div>
    
    <div v-if="panelOpen" class="panel-content">
      <!-- System Health Status -->
      <div class="health-section">
        <div class="section-title">
          <span class="icon">🏥</span>
          <span>System Health</span>
          <button @click="refreshHealth" class="refresh-btn" :disabled="healthChecking">
            {{ healthChecking ? '🔄' : '🔄' }}
          </button>
        </div>
        
        <div class="health-grid">
          <div class="health-item" :class="healthStatus.overall">
            <div class="health-icon">{{ getHealthIcon(healthStatus.overall) }}</div>
            <div class="health-text">
              <div class="health-label">Overall</div>
              <div class="health-value">{{ healthStatus.overall || 'Unknown' }}</div>
            </div>
          </div>
          
          <div class="health-item" :class="healthStatus.services?.storage ? 'healthy' : 'error'">
            <div class="health-icon">📦</div>
            <div class="health-text">
              <div class="health-label">Storage</div>
              <div class="health-value">{{ healthStatus.services?.storage ? 'OK' : 'Error' }}</div>
            </div>
          </div>
          
          <div class="health-item" :class="healthStatus.services?.pubsub ? 'healthy' : 'error'">
            <div class="health-icon">📨</div>
            <div class="health-text">
              <div class="health-label">Pub/Sub</div>
              <div class="health-value">{{ healthStatus.services?.pubsub ? 'OK' : 'Error' }}</div>
            </div>
          </div>
          
          <div class="health-item" :class="healthStatus.services?.functions ? 'healthy' : 'error'">
            <div class="health-icon">⚡</div>
            <div class="health-text">
              <div class="health-label">Functions</div>
              <div class="health-value">{{ healthStatus.services?.functions ? 'OK' : 'Error' }}</div>
            </div>
          </div>
          
          <div class="health-item" :class="healthStatus.services?.compute ? 'healthy' : 'error'">
            <div class="health-icon">🖥️</div>
            <div class="health-text">
              <div class="health-label">Compute</div>
              <div class="health-value">{{ healthStatus.services?.compute ? 'OK' : 'Error' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="stats-section">
        <div class="section-title">
          <span class="icon">📊</span>
          <span>Statistics</span>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ stats.uploads || 0 }}</div>
            <div class="stat-label">Uploaded Files</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.backups || 0 }}</div>
            <div class="stat-label">Backups</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.events || 0 }}</div>
            <div class="stat-label">Pub/Sub Events</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ stats.notifications || 0 }}</div>
            <div class="stat-label">Notifications</div>
          </div>
        </div>
      </div>

      <!-- Sync Status -->
      <div class="sync-section">
        <div class="section-title">
          <span class="icon">🔄</span>
          <span>Sync Status</span>
          <button @click="syncData" class="action-btn" :disabled="syncing">
            {{ syncing ? 'Syncing...' : 'Sync Now' }}
          </button>
        </div>
        
        <div class="sync-info">
          <div class="sync-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: syncStatus.syncPercentage + '%' }"></div>
            </div>
            <div class="progress-text">{{ syncStatus.syncPercentage }}% synced</div>
          </div>
          
          <div class="sync-details">
            <span class="sync-detail">
              <span class="sync-label">Total:</span>
              <span class="sync-value">{{ syncStatus.total }}</span>
            </span>
            <span class="sync-detail">
              <span class="sync-label">Synced:</span>
              <span class="sync-value">{{ syncStatus.synced }}</span>
            </span>
            <span class="sync-detail">
              <span class="sync-label">Pending:</span>
              <span class="sync-value">{{ syncStatus.pending }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-section">
        <div class="section-title">
          <span class="icon">⚙️</span>
          <span>Actions</span>
        </div>
        
        <div class="action-buttons">
          <button @click="exportData" class="action-btn export">
            📊 Export Data
          </button>
          <button @click="testNotification" class="action-btn test">
            🔔 Test Notification
          </button>
          <button @click="forceBackup" class="action-btn backup">
            💾 Force Backup
          </button>
          <button @click="clearLogs" class="action-btn danger">
            🧹 Clear Logs
          </button>
        </div>
      </div>

      <!-- Recent Events -->
      <div v-if="showLogs" class="logs-section">
        <div class="section-title">
          <span class="icon">📋</span>
          <span>Recent Events</span>
          <button @click="toggleLogs" class="toggle-logs-btn">
            {{ showLogs ? 'Hide' : 'Show' }}
          </button>
        </div>
        
        <div class="logs-container">
          <div v-for="event in recentEvents" :key="event.id" class="log-event" :class="event.type">
            <div class="event-time">{{ formatTime(event.timestamp) }}</div>
            <div class="event-type">{{ event.eventType || event.type }}</div>
            <div class="event-message">{{ event.message || event.description }}</div>
            <div class="event-status" :class="event.success ? 'success' : 'error'">
              {{ event.success ? '✅' : '❌' }}
            </div>
          </div>
          
          <div v-if="recentEvents.length === 0" class="no-events">
            No recent events
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { googleCloudService } from '../services/googleCloudService.js'
import { useAppointmentStore } from '../stores/appointmentStore.js'

// Props
const props = defineProps({
  alwaysShow: {
    type: Boolean,
    default: false
  }
})

// State
const appointmentStore = useAppointmentStore()
const showPanel = ref(props.alwaysShow || import.meta.env.DEV)
const panelOpen = ref(false)
const showLogs = ref(false)

// Data
const environment = ref('development')
const healthStatus = ref({
  overall: 'unknown',
  services: {
    storage: false,
    pubsub: false,
    functions: false,
    compute: false
  }
})
const stats = ref({
  uploads: 0,
  backups: 0,
  events: 0,
  notifications: 0
})
const syncStatus = ref({
  total: 0,
  synced: 0,
  pending: 0,
  syncPercentage: 100
})
const recentEvents = ref([])

// Loading states
const healthChecking = ref(false)
const syncing = ref(false)

// Auto refresh interval
let refreshInterval = null

// Methods
const togglePanel = () => {
  panelOpen.value = !panelOpen.value
  if (panelOpen.value) {
    refreshAllData()
  }
}

const toggleLogs = () => {
  showLogs.value = !showLogs.value
  if (showLogs.value) {
    loadRecentEvents()
  }
}

const refreshHealth = async () => {
  healthChecking.value = true
  try {
    const health = await googleCloudService.systemHealthCheck()
    healthStatus.value = health
    console.log('🏥 Health check completed:', health)
  } catch (error) {
    console.error('❌ Health check failed:', error)
    healthStatus.value = {
      overall: 'critical',
      error: error.message,
      services: {
        storage: false,
        pubsub: false,
        functions: false,
        compute: false
      }
    }
  } finally {
    healthChecking.value = false
  }
}

const refreshStats = async () => {
  try {
    const systemStats = await googleCloudService.getSystemStats()
    if (systemStats.success) {
      stats.value = systemStats.stats
    }
    
    // Update sync status
    syncStatus.value = appointmentStore.getSyncStatus()
    
    console.log('📊 Stats refreshed:', stats.value)
  } catch (error) {
    console.error('❌ Stats refresh failed:', error)
  }
}

const syncData = async () => {
  syncing.value = true
  try {
    const result = await appointmentStore.syncWithGoogleCloud()
    console.log('🔄 Sync completed:', result)
    
    // Refresh stats after sync
    await refreshStats()
    
    // Add event to recent events
    recentEvents.value.unshift({
      id: `sync_${Date.now()}`,
      type: 'sync',
      eventType: 'sync_completed',
      message: result.message,
      success: result.success,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Sync failed:', error)
    recentEvents.value.unshift({
      id: `sync_error_${Date.now()}`,
      type: 'sync',
      eventType: 'sync_failed',
      message: error.message,
      success: false,
      timestamp: new Date().toISOString()
    })
  } finally {
    syncing.value = false
  }
}

const exportData = async () => {
  try {
    const result = await appointmentStore.exportAppointments('json')
    console.log('📊 Export completed:', result)
    
    recentEvents.value.unshift({
      id: `export_${Date.now()}`,
      type: 'export',
      eventType: 'data_exported',
      message: result.message || 'Data exported successfully',
      success: result.success,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Export failed:', error)
  }
}

const testNotification = async () => {
  try {
    const result = await googleCloudService.sendNotification({
      type: 'test_notification',
      clientName: 'Test Client',
      clientPhone: '+48123456789',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }),
      service: 'Test Service'
    })
    
    console.log('🔔 Test notification sent:', result)
    
    recentEvents.value.unshift({
      id: `test_notif_${Date.now()}`,
      type: 'notification',
      eventType: 'test_notification_sent',
      message: 'Test notification sent successfully',
      success: result.success,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Test notification failed:', error)
  }
}

const forceBackup = async () => {
  try {
    const result = await googleCloudService.backupData(
      appointmentStore.appointments,
      'manual_backup',
      { metadata: { trigger: 'manual', source: 'dev_panel' } }
    )
    
    console.log('💾 Manual backup completed:', result)
    
    recentEvents.value.unshift({
      id: `backup_${Date.now()}`,
      type: 'backup',
      eventType: 'manual_backup_created',
      message: 'Manual backup created successfully',
      success: result.success,
      timestamp: new Date().toISOString()
    })
    
    await refreshStats()
  } catch (error) {
    console.error('❌ Manual backup failed:', error)
  }
}

const clearLogs = () => {
  recentEvents.value = []
  googleCloudService.clearMockData()
  console.log('🧹 Logs and mock data cleared')
}

const loadRecentEvents = () => {
  // Load events from localStorage (mock data)
  const mockEvents = JSON.parse(localStorage.getItem('mock_events') || '[]')
  const mockNotifications = JSON.parse(localStorage.getItem('mock_notifications') || '[]')
  
  const events = [
    ...mockEvents.map(event => ({
      ...event,
      type: 'pubsub'
    })),
    ...mockNotifications.map(notif => ({
      id: notif.id,
      type: 'notification',
      eventType: notif.type,
      message: `Notification sent to ${notif.clientName || notif.clientPhone}`,
      success: true,
      timestamp: notif.sentAt
    }))
  ]
  
  recentEvents.value = events
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 20)
}

const refreshAllData = async () => {
  await Promise.all([
    refreshHealth(),
    refreshStats(),
    showLogs.value && loadRecentEvents()
  ])
}

const getHealthIcon = (status) => {
  switch (status) {
    case 'healthy': return '✅'
    case 'degraded': return '⚠️'
    case 'critical': return '❌'
    default: return '❓'
  }
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('pl-PL')
}

// Lifecycle
onMounted(() => {
  // Detect environment
  environment.value = googleCloudService.environment
  
  // Start auto refresh if panel is open
  refreshInterval = setInterval(() => {
    if (panelOpen.value) {
      refreshStats()
    }
  }, 10000) // Refresh every 10 seconds
  
  // Initial data load
  if (showPanel.value) {
    refreshAllData()
  }
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.google-cloud-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  z-index: 1000;
  min-width: 350px;
  max-width: 450px;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: 13px;
  border: 1px solid rgba(255,255,255,0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-content h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.environment-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.environment-badge.development {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.environment-badge.staging {
  background: rgba(249, 115, 22, 0.2);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
}

.environment-badge.production {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.toggle-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.toggle-btn:hover {
  background: rgba(255,255,255,0.3);
}

.panel-content {
  padding: 20px;
  max-height: 600px;
  overflow-y: auto;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 600;
  color: #e2e8f0;
}

.icon {
  font-size: 16px;
}

.refresh-btn, .action-btn {
  background: rgba(66, 153, 225, 0.2);
  border: 1px solid rgba(66, 153, 225, 0.3);
  color: #4299e1;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  transition: all 0.2s;
  margin-left: auto;
}

.refresh-btn:hover, .action-btn:hover {
  background: rgba(66, 153, 225, 0.3);
}

.refresh-btn:disabled, .action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Health Section */
.health-section {
  margin-bottom: 24px;
}

.health-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.health-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
}

.health-item.healthy {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.1);
}

.health-item.degraded {
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.1);
}

.health-item.error, .health-item.critical {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.1);
}

.health-icon {
  font-size: 16px;
}

.health-text {
  flex: 1;
}

.health-label {
  font-size: 10px;
  color: #a0aec0;
  text-transform: uppercase;
}

.health-value {
  font-size: 12px;
  font-weight: 600;
}

/* Stats Section */
.stats-section {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-card {
  text-align: center;
  padding: 12px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #4299e1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  color: #a0aec0;
  text-transform: uppercase;
}

/* Sync Section */
.sync-section {
  margin-bottom: 24px;
}

.sync-info {
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(255,255,255,0.1);
}

.sync-progress {
  margin-bottom: 12px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4299e1, #22c55e);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 12px;
  color: #e2e8f0;
}

.sync-details {
  display: flex;
  justify-content: space-between;
}

.sync-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.sync-label {
  font-size: 10px;
  color: #a0aec0;
  text-transform: uppercase;
}

.sync-value {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

/* Actions Section */
.actions-section {
  margin-bottom: 24px;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.action-btn {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.action-btn.export {
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: #a855f7;
}

.action-btn.test {
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.action-btn.backup {
  background: rgba(249, 115, 22, 0.2);
  border: 1px solid rgba(249, 115, 22, 0.3);
  color: #f97316;
}

.action-btn.danger {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

/* Logs Section */
.logs-section {
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 16px;
}

.logs-container {
  background: rgba(0,0,0,0.2);
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid rgba(255,255,255,0.1);
}

.log-event {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 11px;
}

.log-event:last-child {
  border-bottom: none;
}

.event-time {
  color: #a0aec0;
  font-family: 'Courier New', monospace;
}

.event-type {
  color: #4299e1;
  font-weight: 500;
  text-transform: uppercase;
}

.event-message {
  color: #e2e8f0;
}

.event-status.success {
  color: #22c55e;
}

.event-status.error {
  color: #ef4444;
}

.no-events {
  padding: 20px;
  text-align: center;
  color: #a0aec0;
  font-style: italic;
}

.toggle-logs-btn {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  color: #e2e8f0;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  margin-left: auto;
}
</style>
