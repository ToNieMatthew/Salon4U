#!/bin/bash
# Google Cloud Setup Script dla Salon Fryzjerski
# Uruchom ten skrypt aby skonfigurować wszystkie zasoby Google Cloud

set -e  # Exit on any error

echo "🚀 Rozpoczynam konfigurację Google Cloud dla Salon Fryzjerski"
echo "=================================================="

# Zmienne konfiguracyjne
PROJECT_ID="salon-fryzjerski-projekt"
REGION="europe-west1"
ZONE="europe-west1-b"

# Cloud Storage buckets
WEBSITE_BUCKET="salon-fryzjerski-website"
DATA_BUCKET="salon-fryzjerski-data"

# Pub/Sub topics
APPOINTMENTS_TOPIC="salon-appointments-topic"
NOTIFICATIONS_TOPIC="salon-notifications-topic"
ANALYTICS_TOPIC="salon-analytics-topic"
EXPORTS_TOPIC="salon-exports-topic"

# Compute Engine
VM_NAME="salon-production-vm"
VM_MACHINE_TYPE="e2-medium"
VM_DISK_SIZE="20GB"

echo "📍 Ustawienia:"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION"
echo "  Zone: $ZONE"
echo ""

# 1. Ustaw domyślny projekt
echo "🔧 Ustawianie domyślnego projektu..."
gcloud config set project $PROJECT_ID
gcloud config set compute/region $REGION
gcloud config set compute/zone $ZONE

# 2. Włącz wymagane API
echo "🔌 Włączanie wymaganych API..."
gcloud services enable compute.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable pubsub.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com

echo "✅ API włączone"

# 3. Utwórz Cloud Storage buckets
echo "📦 Tworzenie Cloud Storage buckets..."

# Bucket dla strony internetowej
echo "  📁 Tworzenie bucket dla website: $WEBSITE_BUCKET"
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$WEBSITE_BUCKET/ || echo "  ⚠️ Bucket $WEBSITE_BUCKET już istnieje"

# Konfiguruj bucket jako website
gsutil web set -m index.html -e 404.html gs://$WEBSITE_BUCKET/
gsutil iam ch allUsers:objectViewer gs://$WEBSITE_BUCKET/

# Bucket dla danych
echo "  📁 Tworzenie bucket dla danych: $DATA_BUCKET"
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$DATA_BUCKET/ || echo "  ⚠️ Bucket $DATA_BUCKET już istnieje"

# Utwórz strukturę folderów w bucket danych
echo "  📂 Tworzenie struktury folderów..."
echo "placeholder" | gsutil cp - gs://$DATA_BUCKET/uploads/.placeholder
echo "placeholder" | gsutil cp - gs://$DATA_BUCKET/backups/.placeholder
echo "placeholder" | gsutil cp - gs://$DATA_BUCKET/exports/.placeholder
echo "placeholder" | gsutil cp - gs://$DATA_BUCKET/temp/.placeholder

echo "✅ Cloud Storage skonfigurowane"

# 4. Utwórz Pub/Sub topics i subscriptions
echo "📨 Tworzenie Pub/Sub topics..."

# Topics
gcloud pubsub topics create $APPOINTMENTS_TOPIC || echo "  ⚠️ Topic $APPOINTMENTS_TOPIC już istnieje"
gcloud pubsub topics create $NOTIFICATIONS_TOPIC || echo "  ⚠️ Topic $NOTIFICATIONS_TOPIC już istnieje"
gcloud pubsub topics create $ANALYTICS_TOPIC || echo "  ⚠️ Topic $ANALYTICS_TOPIC już istnieje"
gcloud pubsub topics create $EXPORTS_TOPIC || echo "  ⚠️ Topic $EXPORTS_TOPIC już istnieje"

# Subscriptions
echo "📮 Tworzenie Pub/Sub subscriptions..."
gcloud pubsub subscriptions create appointment-processor-sub --topic=$APPOINTMENTS_TOPIC || echo "  ⚠️ Subscription już istnieje"
gcloud pubsub subscriptions create email-notifications-sub --topic=$NOTIFICATIONS_TOPIC || echo "  ⚠️ Subscription już istnieje"
gcloud pubsub subscriptions create sms-notifications-sub --topic=$NOTIFICATIONS_TOPIC || echo "  ⚠️ Subscription już istnieje"
gcloud pubsub subscriptions create analytics-processor-sub --topic=$ANALYTICS_TOPIC || echo "  ⚠️ Subscription już istnieje"

echo "✅ Pub/Sub skonfigurowane"

# 5. Utwórz Compute Engine VM
echo "🖥️ Tworzenie Compute Engine VM..."
gcloud compute instances create $VM_NAME \
  --machine-type=$VM_MACHINE_TYPE \
  --boot-disk-size=$VM_DISK_SIZE \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --tags=http-server,https-server,salon-app \
  --metadata=startup-script='#!/bin/bash
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
        try_files \$uri \$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF
  
  ln -s /etc/nginx/sites-available/salon-app /etc/nginx/sites-enabled/
  rm /etc/nginx/sites-enabled/default
  systemctl restart nginx
  systemctl enable nginx
  
  echo "VM setup completed" > /var/log/startup-script.log
  ' || echo "  ⚠️ VM $VM_NAME już istnieje"

# 6. Konfiguruj firewall rules
echo "🔥 Konfigurowanie firewall rules..."
gcloud compute firewall-rules create allow-salon-http \
  --allow tcp:80,tcp:443,tcp:8080,tcp:3001 \
  --source-ranges 0.0.0.0/0 \
  --target-tags salon-app,http-server,https-server || echo "  ⚠️ Firewall rule już istnieje"

echo "✅ Compute Engine skonfigurowane"

# 7. Pokaż podsumowanie
echo ""
echo "🎉 Konfiguracja Google Cloud zakończona!"
echo "=================================================="
echo ""
echo "📦 Cloud Storage:"
echo "  Website bucket: gs://$WEBSITE_BUCKET"
echo "  Data bucket: gs://$DATA_BUCKET"
echo ""
echo "📨 Pub/Sub Topics:"
echo "  - $APPOINTMENTS_TOPIC"
echo "  - $NOTIFICATIONS_TOPIC"
echo "  - $ANALYTICS_TOPIC"
echo "  - $EXPORTS_TOPIC"
echo ""
echo "🖥️ Compute Engine:"
echo "  VM Name: $VM_NAME"
echo "  Machine Type: $VM_MACHINE_TYPE"
echo "  Zone: $ZONE"
echo ""
echo "🔗 Następne kroki:"
echo "1. Wdróż Cloud Functions: ./deploy-functions.sh"
echo "2. Wdróż frontend: ./deploy-frontend.sh"
echo "3. Sprawdź status: gcloud compute instances list"
echo ""
echo "📚 Użyteczne komendy:"
echo "  Status VM: gcloud compute instances describe $VM_NAME --zone=$ZONE"
echo "  SSH do VM: gcloud compute ssh $VM_NAME --zone=$ZONE"
echo "  Logi VM: gcloud compute instances get-serial-port-output $VM_NAME --zone=$ZONE"
echo ""
