# 💇‍♀️ Salon Fryzjerski - System Zarządzania

Nowoczesna aplikacja webowa do zarządzania salonem fryzjerskim z pełną integracją Google Cloud.

![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🌟 Funkcjonalności

### 📅 Zarządzanie Kalendarzem
- **Widoki kalendarza**: dzień, tydzień, miesiąc
- **Zarządzanie wizytami**: dodawanie, edycja, usuwanie
- **Statusy wizyt**: zaplanowana, potwierdzona, zrealizowana, anulowana
- **Quick actions**: szybkie zmiany statusu z poziomu kalendarza

### 👥 Zarządzanie Klientami
- **Baza klientów**: dodawanie, edycja, usuwanie danych klientów
- **Historia wizyt**: pełna historia wizyt dla każdego klienta
- **Automatyczne sugestie**: podpowiedzi podczas wpisywania danych klienta

### 💼 Zarządzanie Usługami
- **Katalog usług**: dodawanie, edycja, usuwanie usług
- **Kategorie usług**: organizacja usług w kategorie
- **Cennik**: zarządzanie cenami i czasem trwania usług

### ☁️ Integracja Google Cloud
- **Cloud Storage**: przechowywanie wszystkich danych w chmurze
- **Cloud Functions**: API backend z automatycznym skalowaniem
- **Pub/Sub**: system powiadomień i eventów
- **Synchronizacja**: wszystkie dane zawsze zsynchronizowane między urządzeniami

### 🔐 Bezpieczeństwo
- **Autoryzacja**: system logowania użytkowników
- **Cloud Auth**: bezpieczna autoryzacja przez Google Cloud
- **Backup**: automatyczne kopie zapasowe danych

## 🚀 Demo na żywo

**Aplikacja jest dostępna pod adresem**: [https://salon-for-you-b09d5.web.app](https://salon-for-you-b09d5.web.app)

## 🛠️ Technologie

### Frontend
- **Vue.js 3** - reaktywny framework JavaScript
- **Composition API** - nowoczesne podejście do Vue.js
- **Tailwind CSS** - utility-first CSS framework
- **date-fns** - biblioteka do operacji na datach
- **Vite** - szybki bundler i dev server

### Backend & Cloud
- **Google Cloud Functions** - serverless API
- **Google Cloud Storage** - przechowywanie danych
- **Google Cloud Pub/Sub** - system powiadomień
- **Google Compute Engine** - maszyny wirtualne do hostingu i przetwarzania
- **Firebase Hosting** - hosting aplikacji frontend

### Narzędzia
- **npm** - zarządzanie pakietami
- **Firebase CLI** - wdrażanie na Firebase
- **Google Cloud CLI** - zarządzanie usługami Google Cloud

## 📁 Struktura Projektu

```
salon-fryzjerskiv2/
├── src/
│   ├── components/
│   │   ├── calendar/           # Komponenty kalendarza
│   │   ├── client/             # Zarządzanie klientami
│   │   ├── service/            # Zarządzanie usługami
│   │   └── layout/             # Layout aplikacji
│   ├── stores/                 # Pinia stores (stan aplikacji)
│   ├── services/               # Usługi (API, Cloud)
│   ├── views/                  # Widoki/strony
│   └── router/                 # Routing
├── functions/
│   ├── salon-api/              # Cloud Function API
│   ├── salon-notifications/    # System powiadomień
│   └── salon-event-processor/  # Przetwarzanie eventów
├── scripts/                    # Skrypty wdrożeniowe
└── public/                     # Pliki statyczne
```

## 🚀 Instalacja i Uruchomienie

### Wymagania
- Node.js (v16 lub nowszy)
- npm lub yarn
- Google Cloud CLI
- Firebase CLI

### Instalacja lokalna

1. **Sklonuj repozytorium**
```bash
git clone <repository-url>
cd salon-fryzjerskiv2
```

2. **Zainstaluj zależności**
```bash
npm install
```

3. **Uruchom serwer deweloperski**
```bash
npm run dev
```

4. **Otwórz aplikację**
```
http://localhost:5173
```

### Budowanie do produkcji

```bash
npm run build
```

### Wdrażanie na Firebase

```bash
firebase deploy --only hosting
```

## ⚙️ Konfiguracja Google Cloud

### 1. Cloud Functions
```bash
# Wdrożenie API
cd functions/salon-api
gcloud functions deploy salon-api --runtime nodejs18 --trigger-http --region europe-west1

# Wdrożenie systemu powiadomień
cd ../salon-notifications
gcloud functions deploy salon-notifications --runtime nodejs18 --trigger-topic salon-events

# Wdrożenie procesora eventów
cd ../salon-event-processor
gcloud functions deploy salon-event-processor --runtime nodejs18 --trigger-topic salon-events
```

### 2. Cloud Storage
```bash
# Utworzenie bucketa
gsutil mb gs://salon-fryzjerski-data
```

### 3. Pub/Sub
```bash
# Utworzenie topicu
gcloud pubsub topics create salon-events
```

## 📊 Funkcjonalności Cloud

### API Endpoints
- `GET /storage/appointments` - Lista wizyt
- `POST /storage/appointments` - Nowa wizyta
- `PUT /storage/appointments` - Aktualizacja wizyty
- `DELETE /storage/appointments` - Usunięcie wizyty
- `GET /storage/clients` - Lista klientów
- `POST /storage/clients` - Nowy klient
- `GET /storage/services` - Lista usług
- `POST /storage/services` - Nowa usługa

### System Eventów
- `appointment_created` - Utworzenie wizyty
- `appointment_updated` - Aktualizacja wizyty
- `appointment_cancelled` - Anulowanie wizyty
- `client_created` - Nowy klient
- `service_created` - Nowa usługa

## 🎨 Interfejs Użytkownika

### Responsywny Design
- **Desktop**: Pełny interfejs z sidebar
- **Tablet**: Zoptymalizowany układ
- **Mobile**: Interfejs dotykowy

### Motywy
- **Jasny motyw**: Domyślny, przyjazny interfejs
- **Ciemny motyw**: Opcjonalny (możliwość rozszerzenia)

### Komponenty UI
- **Kalendarze**: Interaktywne widoki kalendarza
- **Formularze**: Intuicyjne formularze z walidacją
- **Modals**: Okna dialogowe do zarządzania danymi
- **Tooltips**: Pomocne podpowiedzi

## 🔧 Konfiguracja

### Zmienne środowiskowe
```javascript
// src/config/google-cloud.js
export const PROJECT_ID = 'salon-fryzjerski-projekt';
export const REGION = 'europe-west1';
export const DATA_BUCKET = 'salon-fryzjerski-data';
```

### URLs Cloud Functions
```javascript
// src/config/cloud-functions-urls.js
export const CLOUD_FUNCTIONS_URLS = {
  api: 'https://europe-west1-salon-fryzjerski-projekt.cloudfunctions.net/salon-api',
  notifications: '...',
  updatedAt: '2025-06-16T20:00:00Z'
};
```

## 📈 Monitoring i Logi

### Cloud Functions Logs
```bash
# Podgląd logów API
gcloud functions logs read salon-api --region europe-west1

# Podgląd logów w czasie rzeczywistym
gcloud functions logs tail salon-api --region europe-west1
```

### Cloud Storage Monitoring
```bash
# Status bucketa
gsutil ls -L gs://salon-fryzjerski-data
```

## 🤝 Wkład w Projekt

1. **Fork** repozytorium
2. **Utwórz** branch dla swojej funkcjonalności (`git checkout -b feature/AmazingFeature`)
3. **Commit** zmiany (`git commit -m 'Add some AmazingFeature'`)
4. **Push** do brancha (`git push origin feature/AmazingFeature`)
5. **Utwórz** Pull Request

## 📝 Changelog

### v2.0.0 (2025-06-16)
- ✅ Pełna integracja z Google Cloud
- ✅ Usunięcie trybu lokalnego - tylko chmura
- ✅ Naprawione statusy wizyt
- ✅ Naprawione kategorie usług
- ✅ Nowe logo aplikacji
- ✅ Ulepszone synchronizowanie danych

### v1.0.0 (2025-06-15)
- 🎉 Pierwsza wersja aplikacji
- 📅 Podstawowy kalendarz wizyt
- 👥 Zarządzanie klientami
- 💼 Zarządzanie usługami

## 📄 Licencja

Ten projekt jest licencjonowany na licencji MIT - zobacz plik [LICENSE](LICENSE) po szczegóły.



**Salon Fryzjerski** - Nowoczesne zarządzanie, w chmurze! ☁️✨