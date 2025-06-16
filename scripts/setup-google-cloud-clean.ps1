# Google Cloud Setup Script dla Salon Fryzjerski - PowerShell Version
# Uruchom ten skrypt aby skonfigurować wszystkie zasoby Google Cloud

Write-Host "Starting Google Cloud configuration for Salon Fryzjerski" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green

# Configuration variables
$PROJECT_ID = "salon-fryzjerski-projekt"
$REGION = "europe-west1"
$ZONE = "europe-west1-b"

# Cloud Storage buckets
$WEBSITE_BUCKET = "salon-fryzjerski-website"
$DATA_BUCKET = "salon-fryzjerski-data"

# Pub/Sub topics
$APPOINTMENTS_TOPIC = "salon-appointments-topic"
$NOTIFICATIONS_TOPIC = "salon-notifications-topic"
$ANALYTICS_TOPIC = "salon-analytics-topic"
$EXPORTS_TOPIC = "salon-exports-topic"

# Compute Engine
$VM_NAME = "salon-production-vm"
$VM_MACHINE_TYPE = "e2-medium"
$VM_DISK_SIZE = "20GB"

Write-Host "Settings:" -ForegroundColor Cyan
Write-Host "  Project ID: $PROJECT_ID"
Write-Host "  Region: $REGION"
Write-Host "  Zone: $ZONE"
Write-Host ""

# 1. Set default project
Write-Host "Setting default project..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID
gcloud config set compute/region $REGION
gcloud config set compute/zone $ZONE

# 2. Enable required APIs
Write-Host "Enabling required APIs..." -ForegroundColor Yellow
gcloud services enable compute.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable pubsub.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com

Write-Host "APIs enabled successfully" -ForegroundColor Green

# 3. Create Cloud Storage buckets
Write-Host "Creating Cloud Storage buckets..." -ForegroundColor Yellow

# Website bucket
Write-Host "  Creating website bucket: $WEBSITE_BUCKET"
try {
    gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$WEBSITE_BUCKET/
    Write-Host "  Website bucket created successfully" -ForegroundColor Green
} catch {
    Write-Host "  WARNING: Website bucket already exists or error: $_" -ForegroundColor Yellow
}

# Data bucket
Write-Host "  Creating data bucket: $DATA_BUCKET"
try {
    gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$DATA_BUCKET/
    Write-Host "  Data bucket created successfully" -ForegroundColor Green
} catch {
    Write-Host "  WARNING: Data bucket already exists or error: $_" -ForegroundColor Yellow
}

# Configure public access for website bucket
Write-Host "  Configuring public access for website..."
gsutil iam ch allUsers:objectViewer gs://$WEBSITE_BUCKET
gsutil web set -m index.html -e 404.html gs://$WEBSITE_BUCKET/

# Create basic folder structure in data bucket
Write-Host "  Creating folder structure..."
"placeholder" | gsutil cp - gs://$DATA_BUCKET/uploads/.placeholder
"placeholder" | gsutil cp - gs://$DATA_BUCKET/backups/.placeholder
"placeholder" | gsutil cp - gs://$DATA_BUCKET/exports/.placeholder
"placeholder" | gsutil cp - gs://$DATA_BUCKET/temp/.placeholder

Write-Host "Cloud Storage configured successfully" -ForegroundColor Green

# 4. Create Pub/Sub topics and subscriptions
Write-Host "Creating Pub/Sub topics..." -ForegroundColor Yellow

# Topics
gcloud pubsub topics create $APPOINTMENTS_TOPIC 2>$null; if ($LASTEXITCODE -ne 0) { Write-Host "  WARNING: Topic $APPOINTMENTS_TOPIC already exists" -ForegroundColor Yellow }
gcloud pubsub topics create $NOTIFICATIONS_TOPIC 2>$null; if ($LASTEXITCODE -ne 0) { Write-Host "  WARNING: Topic $NOTIFICATIONS_TOPIC already exists" -ForegroundColor Yellow }
gcloud pubsub topics create $ANALYTICS_TOPIC 2>$null; if ($LASTEXITCODE -ne 0) { Write-Host "  WARNING: Topic $ANALYTICS_TOPIC already exists" -ForegroundColor Yellow }
gcloud pubsub topics create $EXPORTS_TOPIC 2>$null; if ($LASTEXITCODE -ne 0) { Write-Host "  WARNING: Topic $EXPORTS_TOPIC already exists" -ForegroundColor Yellow }

# Subscriptions
Write-Host "Creating Pub/Sub subscriptions..." -ForegroundColor Yellow
gcloud pubsub subscriptions create appointment-processor-sub --topic=$APPOINTMENTS_TOPIC 2>$null; if ($LASTEXITCODE -ne 0) { Write-Host "  WARNING: Subscription appointment-processor-sub already exists" -ForegroundColor Yellow }
gcloud pubsub subscriptions create email-notifications-sub --topic=$NOTIFICATIONS_TOPIC 2>$null; if ($LASTEXITCODE -ne 0) { Write-Host "  WARNING: Subscription email-notifications-sub already exists" -ForegroundColor Yellow }
gcloud pubsub subscriptions create sms-notifications-sub --topic=$NOTIFICATIONS_TOPIC 2>$null; if ($LASTEXITCODE -ne 0) { Write-Host "  WARNING: Subscription sms-notifications-sub already exists" -ForegroundColor Yellow }
gcloud pubsub subscriptions create analytics-processor-sub --topic=$ANALYTICS_TOPIC 2>$null; if ($LASTEXITCODE -ne 0) { Write-Host "  WARNING: Subscription analytics-processor-sub already exists" -ForegroundColor Yellow }

Write-Host "Pub/Sub configured successfully" -ForegroundColor Green

# 5. Create Compute Engine VM
Write-Host "Creating Compute Engine VM..." -ForegroundColor Yellow

$startup_script = @"
#!/bin/bash
apt-get update
apt-get install -y nginx nodejs npm

# Configure nginx
cat > /etc/nginx/sites-available/salon-app << 'EOF'
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html;
    
    location / {
        try_files `$uri `$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
    }
}
EOF

ln -s /etc/nginx/sites-available/salon-app /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
systemctl restart nginx
systemctl enable nginx

echo "VM setup completed" > /var/log/startup-script.log
"@

try {
    gcloud compute instances create $VM_NAME --machine-type=$VM_MACHINE_TYPE --boot-disk-size=$VM_DISK_SIZE --image-family=ubuntu-2204-lts --image-project=ubuntu-os-cloud --tags=http-server,https-server,salon-app --metadata=startup-script=$startup_script
    Write-Host "  VM created successfully" -ForegroundColor Green
} catch {
    Write-Host "  WARNING: VM $VM_NAME already exists or error: $_" -ForegroundColor Yellow
}

# 6. Configure firewall rules
Write-Host "Configuring firewall rules..." -ForegroundColor Yellow
try {
    gcloud compute firewall-rules create allow-salon-http --allow tcp:80,tcp:443,tcp:8080,tcp:3001 --source-ranges 0.0.0.0/0 --target-tags salon-app,http-server,https-server
    Write-Host "  Firewall rule created successfully" -ForegroundColor Green
} catch {
    Write-Host "  WARNING: Firewall rule already exists or error: $_" -ForegroundColor Yellow
}

Write-Host "Compute Engine configured successfully" -ForegroundColor Green

# 7. Show summary
Write-Host ""
Write-Host "Google Cloud configuration completed!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Cloud Storage:" -ForegroundColor Cyan
Write-Host "  Website bucket: gs://$WEBSITE_BUCKET"
Write-Host "  Data bucket: gs://$DATA_BUCKET"
Write-Host ""
Write-Host "Pub/Sub Topics:" -ForegroundColor Cyan
Write-Host "  - $APPOINTMENTS_TOPIC"
Write-Host "  - $NOTIFICATIONS_TOPIC"
Write-Host "  - $ANALYTICS_TOPIC"
Write-Host "  - $EXPORTS_TOPIC"
Write-Host ""
Write-Host "Compute Engine:" -ForegroundColor Cyan
Write-Host "  VM Name: $VM_NAME"
Write-Host "  Machine Type: $VM_MACHINE_TYPE"
Write-Host "  Zone: $ZONE"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Deploy Cloud Functions: .\scripts\deploy-functions.ps1"
Write-Host "2. Deploy frontend: .\scripts\deploy-frontend.ps1"
Write-Host "3. Check status: gcloud compute instances list"
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  VM status: gcloud compute instances describe $VM_NAME --zone=$ZONE"
Write-Host "  SSH to VM: gcloud compute ssh $VM_NAME --zone=$ZONE"
Write-Host "  VM logs: gcloud compute instances get-serial-port-output $VM_NAME --zone=$ZONE"
