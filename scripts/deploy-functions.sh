#!/bin/bash
# Deploy Cloud Functions dla Salon Fryzjerski

set -e

echo "⚡ Deploying Cloud Functions for Salon Fryzjerski"
echo "================================================="

PROJECT_ID="salon-fryzjerski-projekt"
REGION="europe-west1"

echo "📍 Project: $PROJECT_ID"
echo "📍 Region: $REGION"
echo ""

# Ustaw domyślny projekt
gcloud config set project $PROJECT_ID

# 1. Deploy głównej funkcji API
echo "🚀 Deploying salon-api function..."
cd functions/salon-api
npm install

gcloud functions deploy salon-api \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --region $REGION \
  --memory 512MB \
  --timeout 60s \
  --set-env-vars NODE_ENV=production,GOOGLE_CLOUD_PROJECT=$PROJECT_ID

echo "✅ salon-api deployed"
cd ../..

# 2. Deploy funkcji powiadomień
echo "🚀 Deploying salon-send-notification function..."
cd functions/salon-notifications
npm install

# HTTP trigger dla bezpośrednich wywołań
gcloud functions deploy salon-send-notification \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --region $REGION \
  --memory 256MB \
  --timeout 60s \
  --set-env-vars NODE_ENV=production

# Pub/Sub trigger dla automatycznych powiadomień
gcloud functions deploy salon-process-notifications \
  --runtime nodejs18 \
  --trigger-topic salon-appointments-topic \
  --region $REGION \
  --memory 256MB \
  --timeout 60s \
  --set-env-vars NODE_ENV=production

echo "✅ notification functions deployed"
cd ../..

# 3. Pobierz URLs funkcji
echo ""
echo "📡 Function URLs:"
echo "=================================="

API_URL=$(gcloud functions describe salon-api --region=$REGION --format="value(httpsTrigger.url)")
NOTIFICATION_URL=$(gcloud functions describe salon-send-notification --region=$REGION --format="value(httpsTrigger.url)")

echo "API Function: $API_URL"
echo "Notification Function: $NOTIFICATION_URL"

# 4. Aktualizuj konfigurację frontend
echo ""
echo "🔧 Updating frontend configuration..."

# Utwórz plik z URLs dla frontendu
cat > src/config/cloud-functions-urls.js << EOF
// Auto-generated Cloud Functions URLs
export const CLOUD_FUNCTIONS_URLS = {
  api: '$API_URL',
  notifications: '$NOTIFICATION_URL',
  updatedAt: '$(date -u +"%Y-%m-%dT%H:%M:%SZ")'
};
EOF

echo "✅ Frontend configuration updated"

# 5. Test functions
echo ""
echo "🧪 Testing deployed functions..."

echo "Testing API health check..."
curl -s "$API_URL/health" | jq '.' || echo "API test failed or jq not installed"

echo ""
echo "Testing notification function..."
curl -s -X POST "$NOTIFICATION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "test_notification",
    "clientName": "Test Client",
    "clientPhone": "+48123456789",
    "appointmentDate": "'$(date +%Y-%m-%d)'",
    "appointmentTime": "12:00",
    "service": "Test Service"
  }' | jq '.' || echo "Notification test failed or jq not installed"

echo ""
echo "🎉 Cloud Functions deployment completed!"
echo "========================================"
echo ""
echo "📋 Summary:"
echo "  ✅ salon-api - Main API endpoint"
echo "  ✅ salon-send-notification - Direct notification calls"  
echo "  ✅ salon-process-notifications - Pub/Sub triggered notifications"
echo ""
echo "🔗 Next steps:"
echo "  1. Update frontend environment variables with function URLs"
echo "  2. Test the complete flow: frontend → functions → pub/sub"
echo "  3. Deploy frontend: ./deploy-frontend.sh"
echo ""
echo "📚 Useful commands:"
echo "  View logs: gcloud functions logs read salon-api --region=$REGION"
echo "  Update function: gcloud functions deploy salon-api --source=functions/salon-api"
echo ""
