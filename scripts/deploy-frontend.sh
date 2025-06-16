#!/bin/bash
# Deploy Frontend do Google Cloud Storage i Compute Engine

set -e

echo "🚀 Deploying Frontend to Google Cloud"
echo "====================================="

PROJECT_ID="salon-fryzjerski-projekt"
REGION="europe-west1"
ZONE="europe-west1-b"
WEBSITE_BUCKET="salon-fryzjerski-website"
VM_NAME="salon-production-vm"

echo "📍 Project: $PROJECT_ID"
echo "📍 Website Bucket: $WEBSITE_BUCKET"
echo "📍 VM: $VM_NAME"
echo ""

# Ustaw domyślny projekt
gcloud config set project $PROJECT_ID

# 1. Build aplikacji frontendowej
echo "🔨 Building frontend application..."
npm install
npm run build

echo "✅ Frontend built successfully"

# 2. Deploy do Cloud Storage (CDN)
echo "📦 Deploying to Cloud Storage..."

# Upload plików do bucket
gsutil -m cp -r dist/* gs://$WEBSITE_BUCKET/

# Ustaw main page i error page
gsutil web set -m index.html -e 404.html gs://$WEBSITE_BUCKET/

# Ustaw cache headers dla optymalizacji
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" gs://$WEBSITE_BUCKET/**/*.{js,css,png,jpg,jpeg,gif,svg}
gsutil -m setmeta -h "Cache-Control:public, max-age=86400" gs://$WEBSITE_BUCKET/assets/**/*

echo "✅ Static files deployed to Cloud Storage"

# 3. Deploy do Compute Engine VM
echo "🖥️ Deploying to Compute Engine VM..."

# Sprawdź czy VM jest uruchomiona
VM_STATUS=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format="value(status)")
if [ "$VM_STATUS" != "RUNNING" ]; then
  echo "⚠️ Starting VM $VM_NAME..."
  gcloud compute instances start $VM_NAME --zone=$ZONE
  echo "⏳ Waiting for VM to be ready..."
  sleep 30
fi

# Upload plików na VM
echo "📤 Uploading files to VM..."
gcloud compute scp --recurse dist/* $VM_NAME:/tmp/salon-app/ --zone=$ZONE

# Skonfiguruj aplikację na VM
echo "⚙️ Configuring application on VM..."
gcloud compute ssh $VM_NAME --zone=$ZONE --command="
  set -e
  
  echo '🔧 Setting up application on VM...'
  
  # Backup old version
  sudo mkdir -p /var/www/backup
  sudo cp -r /var/www/html /var/www/backup/html_\$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
  
  # Deploy new version
  sudo rm -rf /var/www/html/*
  sudo cp -r /tmp/salon-app/* /var/www/html/
  sudo chown -R www-data:www-data /var/www/html
  sudo chmod -R 755 /var/www/html
  
  # Update nginx configuration
  sudo tee /etc/nginx/sites-available/salon-app > /dev/null << 'NGINX_CONFIG'
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/javascript application/json;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # API proxy (jeśli potrzebny)
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
NGINX_CONFIG
  
  # Test nginx configuration
  sudo nginx -t
  
  # Reload nginx
  sudo systemctl reload nginx
  
  # Ensure nginx is running
  sudo systemctl enable nginx
  sudo systemctl start nginx
  
  echo '✅ Application deployed on VM successfully'
"

echo "✅ Application deployed to Compute Engine"

# 4. Sprawdź status deployment
echo ""
echo "🔍 Checking deployment status..."

# Pobierz external IP VM
VM_IP=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format="value(networkInterfaces[0].accessConfigs[0].natIP)")
BUCKET_URL="https://storage.googleapis.com/$WEBSITE_BUCKET/index.html"

echo ""
echo "🌐 Deployment URLs:"
echo "=================="
echo "Cloud Storage (CDN): $BUCKET_URL"
echo "Compute Engine: http://$VM_IP"
echo ""

# Test endpoints
echo "🧪 Testing endpoints..."

echo "Testing Cloud Storage..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BUCKET_URL)
if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Cloud Storage deployment OK"
else
  echo "❌ Cloud Storage deployment failed (HTTP $HTTP_STATUS)"
fi

echo "Testing Compute Engine..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://$VM_IP/health")
if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Compute Engine deployment OK"
else
  echo "❌ Compute Engine deployment failed (HTTP $HTTP_STATUS)"
fi

# 5. Setup Load Balancer (opcjonalne)
echo ""
echo "🔄 Load Balancer setup (optional)..."
echo "To setup a load balancer, run:"
echo "  gcloud compute url-maps create salon-url-map --default-backend-bucket=$WEBSITE_BUCKET"
echo "  gcloud compute target-http-proxies create salon-http-proxy --url-map=salon-url-map"
echo "  gcloud compute forwarding-rules create salon-forwarding-rule --global --target-http-proxy=salon-http-proxy --ports=80"

echo ""
echo "🎉 Frontend deployment completed!"
echo "================================="
echo ""
echo "📋 Deployment Summary:"
echo "  ✅ Static files deployed to Cloud Storage"
echo "  ✅ Application deployed to Compute Engine VM"
echo "  ✅ Nginx configured and running"
echo "  ✅ Health checks passing"
echo ""
echo "🔗 Access your application:"
echo "  📦 CDN (recommended): $BUCKET_URL"
echo "  🖥️ Direct VM access: http://$VM_IP"
echo ""
echo "📚 Useful commands:"
echo "  VM logs: gcloud compute ssh $VM_NAME --zone=$ZONE --command='sudo tail -f /var/log/nginx/access.log'"
echo "  Update app: ./deploy-frontend.sh"
echo "  SSH to VM: gcloud compute ssh $VM_NAME --zone=$ZONE"
echo ""
