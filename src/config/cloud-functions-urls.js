// Auto-generated Cloud Functions URLs
export const CLOUD_FUNCTIONS_URLS = {
  api: 'https://europe-west1-salon-fryzjerski-projekt.cloudfunctions.net/salon-api',
  notifications: '',
  updatedAt: '2025-06-16T18:17:59Z'
};

// Environment detection helper
export function getApiBaseUrl() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // Development - use cloud services for testing
    return CLOUD_FUNCTIONS_URLS.api;
  } else if (hostname.includes('staging')) {
    // Staging environment
    return CLOUD_FUNCTIONS_URLS.api;
  } else {
    // Production environment
    return CLOUD_FUNCTIONS_URLS.api;
  }
}
