# Deploy Frontend to Google Cloud Storage and Compute Engine
# Simplified PowerShell version for Windows

param(
    [string]$ProjectId = "salon-fryzjerski-projekt",
    [string]$Region = "europe-west1",
    [string]$Zone = "europe-west1-b",
    [string]$WebsiteBucket = "salon-fryzjerski-website",
    [string]$VmName = "salon-production-vm"
)

Write-Host "Deploying Frontend to Google Cloud" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

Write-Host "Project: $ProjectId" -ForegroundColor Cyan
Write-Host "Website Bucket: $WebsiteBucket" -ForegroundColor Cyan
Write-Host "VM: $VmName" -ForegroundColor Cyan
Write-Host ""

# Set default project
Write-Host "Setting project configuration..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# Check if dist folder exists
if (!(Test-Path "dist")) {
    Write-Host "No dist folder found. Please run 'npm run build' first." -ForegroundColor Red
    exit 1
}

# Deploy to Cloud Storage (CDN)
Write-Host "Deploying to Cloud Storage..." -ForegroundColor Yellow

# Upload files to bucket
Write-Host "Uploading files..." -ForegroundColor Gray
gsutil -m cp -r dist/* gs://$WebsiteBucket/

# Set main page and error page
Write-Host "Configuring website settings..." -ForegroundColor Gray
gsutil web set -m index.html -e index.html gs://$WebsiteBucket/

# Set cache headers for optimization
Write-Host "Setting cache headers..." -ForegroundColor Gray
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" gs://$WebsiteBucket/**/*.js
gsutil -m setmeta -h "Cache-Control:public, max-age=3600" gs://$WebsiteBucket/**/*.css
gsutil -m setmeta -h "Cache-Control:public, max-age=86400" gs://$WebsiteBucket/assets/**/*

# Make bucket publicly readable
Write-Host "Setting public access..." -ForegroundColor Gray
gsutil iam ch allUsers:objectViewer gs://$WebsiteBucket

Write-Host "Static files deployed to Cloud Storage" -ForegroundColor Green

# Get VM external IP
$vmIp = gcloud compute instances describe $VmName --zone=$Zone --format="value(networkInterfaces[0].accessConfigs[0].natIP)"
Write-Host "VM IP: $vmIp" -ForegroundColor Cyan

Write-Host ""
Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "Cloud Storage (CDN): https://storage.googleapis.com/$WebsiteBucket/index.html" -ForegroundColor Cyan
Write-Host "Compute Engine VM: http://$vmIp" -ForegroundColor Cyan
Write-Host ""

# Test Cloud Storage endpoint
Write-Host "Testing endpoints..." -ForegroundColor Yellow
try {
    $storageResponse = Invoke-WebRequest -Uri "https://storage.googleapis.com/$WebsiteBucket/index.html" -Method Head -TimeoutSec 10
    Write-Host "Cloud Storage: HTTP $($storageResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Cloud Storage: Failed to connect" -ForegroundColor Red
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open the applications in your browser" -ForegroundColor Gray
Write-Host "2. Test the Google Cloud integration" -ForegroundColor Gray
Write-Host "3. Monitor the Cloud Functions logs" -ForegroundColor Gray
