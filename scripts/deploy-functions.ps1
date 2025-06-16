# Deploy Cloud Functions dla Salon Fryzjerski - PowerShell Version

Write-Host "Deploying Cloud Functions for Salon Fryzjerski" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

$PROJECT_ID = "salon-fryzjerski-projekt"
$REGION = "europe-west1"

Write-Host "Settings:" -ForegroundColor Cyan
Write-Host "  Project: $PROJECT_ID"
Write-Host "  Region: $REGION"
Write-Host ""

# Set default project
gcloud config set project $PROJECT_ID

# 1. Deploy main API function
Write-Host "Deploying salon-api function..." -ForegroundColor Yellow
Set-Location "functions/salon-api"
npm install

gcloud functions deploy salon-api --runtime nodejs18 --trigger-http --allow-unauthenticated --region $REGION --memory 512MB --timeout 60s --set-env-vars "NODE_ENV=production,GOOGLE_CLOUD_PROJECT=$PROJECT_ID"

Write-Host "salon-api deployed successfully" -ForegroundColor Green
Set-Location "../.."

# 2. Deploy notifications function
Write-Host "Deploying salon-send-notification function..." -ForegroundColor Yellow
Set-Location "functions/salon-notifications"
npm install

# HTTP trigger for direct calls
gcloud functions deploy salon-send-notification --runtime nodejs18 --trigger-http --allow-unauthenticated --region $REGION --memory 256MB --timeout 60s --set-env-vars "NODE_ENV=production"

# Pub/Sub trigger for automatic notifications
gcloud functions deploy salon-process-notifications --runtime nodejs18 --trigger-topic salon-appointments-topic --region $REGION --memory 256MB --timeout 60s --set-env-vars "NODE_ENV=production"

Write-Host "notification functions deployed successfully" -ForegroundColor Green
Set-Location "../.."

# 3. Get function URLs
Write-Host ""
Write-Host "Function URLs:" -ForegroundColor Cyan
Write-Host "==============" -ForegroundColor Cyan

$API_URL = gcloud functions describe salon-api --region=$REGION --format="value(httpsTrigger.url)"
$NOTIFICATION_URL = gcloud functions describe salon-send-notification --region=$REGION --format="value(httpsTrigger.url)"

Write-Host "API Function: $API_URL"
Write-Host "Notification Function: $NOTIFICATION_URL"

# 4. Update frontend configuration
Write-Host ""
Write-Host "Updating frontend configuration..." -ForegroundColor Yellow

# Create file with URLs for frontend
$config_content = @"
// Auto-generated Cloud Functions URLs
export const CLOUD_FUNCTIONS_URLS = {
  api: '$API_URL',
  notifications: '$NOTIFICATION_URL',
  updatedAt: '$(Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")'
};

// Environment detection helper
export function getApiBaseUrl() {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // Development - use local or mock services
    return 'http://localhost:3001/api';
  } else if (hostname.includes('staging')) {
    // Staging environment
    return CLOUD_FUNCTIONS_URLS.api;
  } else {
    // Production environment
    return CLOUD_FUNCTIONS_URLS.api;
  }
}
"@

$config_content | Out-File -FilePath "src/config/cloud-functions-urls.js" -Encoding UTF8

Write-Host "Frontend configuration updated" -ForegroundColor Green

# 5. Test functions
Write-Host ""
Write-Host "Testing deployed functions..." -ForegroundColor Yellow

Write-Host "Testing API health check..."
try {
    $response = Invoke-RestMethod -Uri "$API_URL/health" -Method GET
    Write-Host "API test: " -NoNewline
    Write-Host "SUCCESS" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json)
} catch {
    Write-Host "API test: " -NoNewline  
    Write-Host "FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "Testing notification function..."
$test_notification = @{
    type = "test_notification"
    clientName = "Test Client"
    clientPhone = "+48123456789"
    appointmentDate = (Get-Date -Format "yyyy-MM-dd")
    appointmentTime = "12:00"
    service = "Test Service"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $NOTIFICATION_URL -Method POST -Body $test_notification -ContentType "application/json"
    Write-Host "Notification test: " -NoNewline
    Write-Host "SUCCESS" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json)
} catch {
    Write-Host "Notification test: " -NoNewline
    Write-Host "FAILED" -ForegroundColor Red  
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "Cloud Functions deployment completed!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  salon-api - Main API endpoint" -ForegroundColor Green
Write-Host "  salon-send-notification - Direct notification calls" -ForegroundColor Green
Write-Host "  salon-process-notifications - Pub/Sub triggered notifications" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Update frontend environment variables with function URLs"
Write-Host "  2. Test the complete flow: frontend -> functions -> pub/sub"
Write-Host "  3. Deploy frontend: .\scripts\deploy-frontend.ps1"
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  View logs: gcloud functions logs read salon-api --region=$REGION"
Write-Host "  Update function: gcloud functions deploy salon-api --source=functions/salon-api"
