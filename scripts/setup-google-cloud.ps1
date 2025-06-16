# Google Cloud Setup Script dla Salon Fryzjerski - PowerShell Version
# Uruchom ten skrypt aby skonfigurować wszystkie zasoby Google Cloud

Write-Host "🚀 Rozpoczynam konfigurację Google Cloud dla Salon Fryzjerski" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Zmienne konfiguracyjne
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

Write-Host "📍 Ustawienia:"
Write-Host "  Project ID: $PROJECT_ID"
Write-Host "  Region: $REGION"
Write-Host "  Zone: $ZONE"
Write-Host ""

# 1. Ustaw domyślny projekt
Write-Host "🔧 Ustawianie domyślnego projektu..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID
gcloud config set compute/region $REGION
gcloud config set compute/zone $ZONE

# 2. Włącz wymagane API
Write-Host "🔌 Włączanie wymaganych API..." -ForegroundColor Yellow
gcloud services enable compute.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable pubsub.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com

Write-Host "✅ API włączone" -ForegroundColor Green

# 3. Utwórz Cloud Storage buckets
Write-Host "📦 Tworzenie Cloud Storage buckets..." -ForegroundColor Yellow

# Bucket dla strony internetowej
Write-Host "  📁 Tworzenie bucket dla website: $WEBSITE_BUCKET"
try {
    gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$WEBSITE_BUCKET/
    Write-Host "  ✅ Bucket $WEBSITE_BUCKET utworzony"
} catch {
    Write-Host "  ⚠️ Bucket $WEBSITE_BUCKET już istnieje lub błąd: $_" -ForegroundColor Yellow
}

# Bucket dla danych aplikacji
Write-Host "  📁 Tworzenie bucket dla danych: $DATA_BUCKET"
try {
    gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$DATA_BUCKET/
    Write-Host "  ✅ Bucket $DATA_BUCKET utworzony"
} catch {
    Write-Host "  ⚠️ Bucket $DATA_BUCKET już istnieje lub błąd: $_" -ForegroundColor Yellow
}

# Konfiguruj publiczny dostęp dla website bucket
Write-Host "  🌐 Konfigurowanie publicznego dostępu dla website..."
gsutil iam ch allUsers:objectViewer gs://$WEBSITE_BUCKET
gsutil web set -m index.html -e 404.html gs://$WEBSITE_BUCKET/

# Utwórz podstawowe foldery w data bucket
Write-Host "  📂 Tworzenie struktury folderów..."
"placeholder" | gsutil cp - gs://$DATA_BUCKET/uploads/.placeholder
"placeholder" | gsutil cp - gs://$DATA_BUCKET/backups/.placeholder
"placeholder" | gsutil cp - gs://$DATA_BUCKET/exports/.placeholder
"placeholder" | gsutil cp - gs://$DATA_BUCKET/temp/.placeholder

Write-Host "✅ Cloud Storage skonfigurowane" -ForegroundColor Green

# 4. Utwórz Pub/Sub topics i subscriptions
Write-Host "📨 Tworzenie Pub/Sub topics..." -ForegroundColor Yellow

# Topics
gcloud pubsub topics create $APPOINTMENTS_TOPIC 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host "  ⚠️ Topic $APPOINTMENTS_TOPIC już istnieje" -ForegroundColor Yellow }

gcloud pubsub topics create $NOTIFICATIONS_TOPIC 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host "  ⚠️ Topic $NOTIFICATIONS_TOPIC już istnieje" -ForegroundColor Yellow }

gcloud pubsub topics create $ANALYTICS_TOPIC 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host "  ⚠️ Topic $ANALYTICS_TOPIC już istnieje" -ForegroundColor Yellow }

gcloud pubsub topics create $EXPORTS_TOPIC 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host "  ⚠️ Topic $EXPORTS_TOPIC już istnieje" -ForegroundColor Yellow }

# Subscriptions
Write-Host "📮 Tworzenie Pub/Sub subscriptions..." -ForegroundColor Yellow
gcloud pubsub subscriptions create appointment-processor-sub --topic=$APPOINTMENTS_TOPIC 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host "  ⚠️ Subscription appointment-processor-sub już istnieje" -ForegroundColor Yellow }

gcloud pubsub subscriptions create email-notifications-sub --topic=$NOTIFICATIONS_TOPIC 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host "  ⚠️ Subscription email-notifications-sub już istnieje" -ForegroundColor Yellow }

gcloud pubsub subscriptions create sms-notifications-sub --topic=$NOTIFICATIONS_TOPIC 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host "  ⚠️ Subscription sms-notifications-sub już istnieje" -ForegroundColor Yellow }

gcloud pubsub subscriptions create analytics-processor-sub --topic=$ANALYTICS_TOPIC 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host "  ⚠️ Subscription analytics-processor-sub już istnieje" -ForegroundColor Yellow }

Write-Host "✅ Pub/Sub skonfigurowane" -ForegroundColor Green

# 5. Utwórz Compute Engine VM
Write-Host "🖥️ Tworzenie Compute Engine VM..." -ForegroundColor Yellow

$startup_script = @"
#!/bin/bash
apt-get update
apt-get install -y nginx nodejs npm

# Configure nginx
cat > /etc/nginx/sites-available/salon-app << EOF
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html;
    
    location / {
        try_files \`$uri \`$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \`$host;
        proxy_set_header X-Real-IP \`$remote_addr;
    }
    
    location /health {
        access_log off;
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
EOF

ln -s /etc/nginx/sites-available/salon-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx
systemctl enable nginx

echo "VM setup completed" > /var/log/startup-script.log
"@

try {
    gcloud compute instances create $VM_NAME `
        --machine-type=$VM_MACHINE_TYPE `
        --boot-disk-size=$VM_DISK_SIZE `
        --image-family=ubuntu-2204-lts `
        --image-project=ubuntu-os-cloud `
        --tags=http-server,https-server,salon-app `
        --metadata=startup-script=$startup_script
    Write-Host "  ✅ VM $VM_NAME utworzona"
} catch {
    Write-Host "  ⚠️ VM $VM_NAME już istnieje lub błąd: $_" -ForegroundColor Yellow
}

# 6. Konfiguruj firewall rules
Write-Host "🔥 Konfigurowanie firewall rules..." -ForegroundColor Yellow
try {
    gcloud compute firewall-rules create allow-salon-http `
        --allow tcp:80,tcp:443,tcp:8080,tcp:3001 `
        --source-ranges 0.0.0.0/0 `
        --target-tags salon-app,http-server,https-server
    Write-Host "  ✅ Firewall rule utworzona"
} catch {
    Write-Host "  WARNING: Firewall rule already exists or error: $_" -ForegroundColor Yellow
}

Write-Host "✅ Compute Engine skonfigurowane" -ForegroundColor Green

# 7. Pokaż podsumowanie
Write-Host ""
Write-Host "🎉 Konfiguracja Google Cloud zakończona!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Cloud Storage:"
Write-Host "  Website bucket: gs://$WEBSITE_BUCKET"
Write-Host "  Data bucket: gs://$DATA_BUCKET"
Write-Host ""
Write-Host "📨 Pub/Sub Topics:"
Write-Host "  - $APPOINTMENTS_TOPIC"
Write-Host "  - $NOTIFICATIONS_TOPIC"
Write-Host "  - $ANALYTICS_TOPIC"
Write-Host "  - $EXPORTS_TOPIC"
Write-Host ""
Write-Host "🖥️ Compute Engine:"
Write-Host "  VM Name: $VM_NAME"
Write-Host "  Machine Type: $VM_MACHINE_TYPE"
Write-Host "  Zone: $ZONE"
Write-Host ""
Write-Host "🔗 Następne kroki:"
Write-Host "1. Wdróż Cloud Functions: .\scripts\deploy-functions.ps1"
Write-Host "2. Wdróż frontend: .\scripts\deploy-frontend.ps1"
Write-Host "3. Sprawdź status: gcloud compute instances list"
Write-Host ""
Write-Host "📚 Użyteczne komendy:"
Write-Host "  Status VM: gcloud compute instances describe $VM_NAME --zone=$ZONE"
Write-Host "  SSH do VM: gcloud compute ssh $VM_NAME --zone=$ZONE"
Write-Host "  Logi VM: gcloud compute instances get-serial-port-output $VM_NAME --zone=$ZONE"
Write-Host ""
