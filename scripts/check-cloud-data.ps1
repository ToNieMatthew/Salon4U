# Skrypt do sprawdzania danych w Google Cloud Storage

Write-Host "=== SPRAWDZANIE ZAWARTOŚCI BUCKET CLOUD STORAGE ===" -ForegroundColor Cyan

# Sprawdź zawartość bucket
Write-Host "`n📂 Zawartość bucket salon-fryzjerski-data:" -ForegroundColor Yellow
gsutil ls -la gs://salon-fryzjerski-data/

Write-Host "`n📋 Zawartość pliku klientów:" -ForegroundColor Yellow
gsutil cat gs://salon-fryzjerski-data/clients/clients.json

Write-Host "`n📅 Zawartość pliku wizyt:" -ForegroundColor Yellow
gsutil cat gs://salon-fryzjerski-data/appointments/appointments.json

Write-Host "`n✅ Sprawdzanie zakończone" -ForegroundColor Green
