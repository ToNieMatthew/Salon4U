# Deploy Frontend to Google Cloud Storage and Compute Engine
# PowerShell version for Windows

param(
    [string]$ProjectId = "salon-fryzjerski-projekt",
    [string]$Region = "europe-west1",
    [string]$Zone = "europe-west1-b",
    [string]$WebsiteBucket = "salon-fryzjerski-website",
    [string]$VmName = "salon-production-vm"
)

Write-Host "🚀 Deploying Frontend to Google Cloud" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

Write-Host "📍 Project: $ProjectId" -ForegroundColor Cyan
Write-Host "📍 Website Bucket: $WebsiteBucket" -ForegroundColor Cyan
Write-Host "📍 VM: $VmName" -ForegroundColor Cyan
Write-Host ""

# Set default project
Write-Host "🔧 Setting project configuration..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# 1. Build frontend application (already done)
Write-Host "📦 Using existing build in dist/ folder..." -ForegroundColor Yellow
if (!(Test-Path "dist")) {
    Write-Host "❌ No dist folder found. Please run 'npm run build' first." -ForegroundColor Red
    exit 1
}

# 2. Deploy to Cloud Storage (CDN)
Write-Host "📦 Deploying to Cloud Storage..." -ForegroundColor Yellow

# Upload files to bucket
Write-Host "   Uploading files..." -ForegroundColor Gray
gsutil -m cp -r dist/* gs://$WebsiteBucket/

# Set main page and error page
Write-Host "   Configuring website settings..." -ForegroundColor Gray
gsutil web set -m index.html -e index.html gs://$WebsiteBucket/

# Set cache headers for optimization
Write-Host "   Setting cache headers..." -ForegroundColor Gray
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" gs://$WebsiteBucket/**/*.js
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" gs://$WebsiteBucket/**/*.css
gsutil -m setmeta -h "Cache-Control:public, max-age=86400" gs://$WebsiteBucket/assets/**/*

# Make bucket publicly readable
Write-Host "   Setting public access..." -ForegroundColor Gray
gsutil iam ch allUsers:objectViewer gs://$WebsiteBucket

Write-Host "✅ Static files deployed to Cloud Storage" -ForegroundColor Green

# 3. Deploy to Compute Engine VM
Write-Host "🖥️ Deploying to Compute Engine VM..." -ForegroundColor Yellow

# Check if VM is running
$vmStatus = gcloud compute instances describe $VmName --zone=$Zone --format="value(status)"
if ($vmStatus -ne "RUNNING") {
    Write-Host "⚠️ Starting VM $VmName..." -ForegroundColor Yellow
    gcloud compute instances start $VmName --zone=$Zone
    
    # Wait for VM to be ready
    Write-Host "   Waiting for VM to be ready..." -ForegroundColor Gray
    do {
        Start-Sleep -Seconds 10
        $vmStatus = gcloud compute instances describe $VmName --zone=$Zone --format="value(status)"
        Write-Host "   VM Status: $vmStatus" -ForegroundColor Gray
    } while ($vmStatus -ne "RUNNING")
}

Write-Host "✅ VM is running" -ForegroundColor Green

# Get VM external IP
$vmIp = gcloud compute instances describe $VmName --zone=$Zone --format="value(networkInterfaces[0].accessConfigs[0].natIP)"
Write-Host "📍 VM IP: $vmIp" -ForegroundColor Cyan

# Create a deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
$deployTime = Get-Date -Format "yyyyMMdd-HHmmss"
$deployPackage = "dist-$deployTime.tar.gz"

# Create tar.gz using 7-zip or tar if available
if (Get-Command tar -ErrorAction SilentlyContinue) {
    tar -czf $deployPackage -C dist .
} else {
    # Fallback to zip
    $deployPackage = "dist-$deployTime.zip"
    Compress-Archive -Path "dist\*" -DestinationPath $deployPackage
}

# Copy files to VM
Write-Host "📤 Copying files to VM..." -ForegroundColor Yellow
gcloud compute scp $deployPackage ${VmName}:/tmp/ --zone=$Zone

# Deploy on VM
Write-Host "🔧 Installing on VM..." -ForegroundColor Yellow
$deployScript = @"
#!/bin/bash
cd /tmp
if [[ -f "$deployPackage" ]]; then
    sudo mkdir -p /var/www/salon
    if [[ "$deployPackage" == *.tar.gz ]]; then
        sudo tar -xzf "$deployPackage" -C /var/www/salon/
    else
        sudo unzip -o "$deployPackage" -d /var/www/salon/
    fi
    sudo chown -R www-data:www-data /var/www/salon/
    sudo chmod -R 755 /var/www/salon/
    
    # Configure nginx
    sudo tee /etc/nginx/sites-available/salon > /dev/null << 'EOL'
server {
    listen 80;
    listen [::]:80;
    server_name _;
    root /var/www/salon;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle Vue.js router
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
EOL

    # Enable site and restart nginx
    sudo ln -sf /etc/nginx/sites-available/salon /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl restart nginx
    
    # Clean up
    rm -f /tmp/$deployPackage
    
    echo "✅ Deployment completed successfully!"
    echo "🌐 Website available at: http://$vmIp"
else
    echo "❌ Deployment package not found!"
    exit 1
fi
"@

# Save deploy script to temp file
$deployScript | Out-File -FilePath "deploy-vm.sh" -Encoding UTF8
gcloud compute scp "deploy-vm.sh" ${VmName}:/tmp/ --zone=$Zone

# Execute deployment script on VM
gcloud compute ssh $VmName --zone=$Zone --command="chmod +x /tmp/deploy-vm.sh && /tmp/deploy-vm.sh"

# Clean up local files
Remove-Item $deployPackage -ErrorAction SilentlyContinue
Remove-Item "deploy-vm.sh" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Cloud Storage (CDN): https://storage.googleapis.com/$WebsiteBucket/index.html" -ForegroundColor Cyan
Write-Host "📍 Compute Engine VM: http://$vmIp" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 Testing endpoints..." -ForegroundColor Yellow

# Test Cloud Storage endpoint
try {
    $storageResponse = Invoke-WebRequest -Uri "https://storage.googleapis.com/$WebsiteBucket/index.html" -Method Head -TimeoutSec 10
    Write-Host "✅ Cloud Storage: HTTP $($storageResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Cloud Storage: Failed to connect" -ForegroundColor Red
}

# Test VM endpoint
try {
    $vmResponse = Invoke-WebRequest -Uri "http://$vmIp" -Method Head -TimeoutSec 10
    Write-Host "✅ Compute Engine: HTTP $($vmResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Compute Engine: Failed to connect" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Open the applications in your browser" -ForegroundColor Gray
Write-Host "  2. Test the Google Cloud integration" -ForegroundColor Gray
Write-Host "  3. Monitor the Cloud Functions logs" -ForegroundColor Gray
Write-Host "  4. Set up monitoring and alerting" -ForegroundColor Gray
