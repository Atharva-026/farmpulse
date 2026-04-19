# 🌾 FarmPulse — AI-Powered Agricultural Intelligence Platform

<div align="center">

![FarmPulse Banner](https://img.shields.io/badge/FarmPulse-Agricultural%20AI-2E7D32?style=for-the-badge&logo=leaf&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![Python](https://img.shields.io/badge/Python-Flask-3776AB?style=flat-square&logo=python)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

**From soil to sale — every farming decision powered by AI**


</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [ML Models](#-ml-models)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Languages Supported](#-languages-supported)
- [Contributing](#-contributing)

---

## 🌱 About the Project

FarmPulse is a comprehensive full-stack agricultural technology platform designed to empower Indian farmers with data-driven insights, market intelligence, financial tools, and a multilingual community network.

The platform guides a farmer through their complete journey:

```
Know what to grow  →  Detect crop disease  →  Get funded  →  Sell at best price  →  Connect with farmers
     (AI Crop)           (Computer Vision)      (Loan Match)     (Live Mandi)         (Community)
```

### 🎯 Problem Statement

Indian farmers face four critical challenges:
1. **No data** to decide which crop to grow for maximum yield
2. **Late disease detection** leading to crop loss
3. **No access** to government loan schemes when disaster strikes
4. **Price exploitation** by middlemen due to lack of market transparency

FarmPulse solves all four in one platform — free, offline-capable, and available in 4 Indian languages.

---

## ✨ Features

### 🌾 1. AI Crop Recommendation
- GPS-based auto-detection of soil type, water availability, temperature and humidity
- Uses **SoilGrids ISRIC API** (free, 250m global resolution) for real soil composition data
- Uses **Open-Meteo API** (free, no key) for real-time weather and 30-day rainfall history
- Random Forest ML model trained on 22 crop classes
- Returns recommended crop, confidence score, expected yield and profit range
- Season auto-detected from current month (Kharif/Rabi/Zaid)

### 🔬 2. Disease Detection
- Upload a leaf photo → instant AI diagnosis
- MobileNetV2 model fine-tuned on **PlantVillage dataset** (54,306 images, 38 disease classes, 14 crops)
- 97% accuracy on test set
- Detailed treatment protocol + estimated cost for all 38 disease classes
- Severity rating (none / low / moderate / high / severe)
- **One-tap loan application** pre-filled with the treatment cost

### 🏦 3. Loan Gateway
- Matches farmers to 4 real government schemes: KCC, PMFBY, Agriculture Infrastructure Fund, PM-KISAN
- Ranked by interest rate, coverage amount, and eligibility
- Pre-filled application form (personal, land, bank details)
- Direct link to official government portals
- Seamlessly receives disease treatment cost from Disease Detection

### 📊 4. Smart Sell (Market Intelligence)
- **Live Agmarknet API** integration for real mandi prices across India
- Nearby mandis shown first based on farmer's GPS location
- Price trend analysis (rising / falling / stable) with visual indicators
- Vendor direct marketplace — post crop listing, receive competing bids
- Vendor buy offers visible to farmers in the same feed
- Real-time bid notifications via Server-Sent Events (SSE)
- Mandi average vs vendor bid comparison to help farmers decide

### 🤝 5. Vendor Portal
- Separate vendor authentication (register/login by phone)
- Browse all active farmer crop listings with filters (crop, state, quantity, price)
- Place bids with price, quantity and message
- Track bid status in real time — accepted / rejected notifications via SSE
- Post standing "Buy Offers" that farmers can discover and express interest in
- View interested farmers with their contact details

### 🌿 6. Farmer Community
- Instagram-style explore feed of farming posts
- Upload up to 3 photos per post via **Cloudinary CDN**
- Post in any of 4 languages — Hindi, Marathi, Kannada, English
- **On-demand translation** via MyMemory API — cached in MongoDB after first translation
- Like, comment, reply, share
- Trending posts (last 7 days by engagement)
- Trending crop tags for filtering
- Infinite scroll pagination
- Comments with nested replies and per-comment translation

### 🌐 7. Multilingual Support
- Full UI in **English, हिंदी (Hindi), मराठी (Marathi), ಕನ್ನಡ (Kannada)**
- Language persisted in localStorage across sessions
- All 4 languages implemented via `react-i18next` — zero external API cost
- Community post translation uses MyMemory free API (1000 calls/day)

### 🎤 8. Voice Input (Crop Recommendation)
- Web Speech API integration — fill the crop form by speaking
- Supports soil type, season, water level, city name and budget in one sentence
- Text-to-speech readback of crop recommendation results

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite | Build tool and dev server |
| React Router DOM v7 | Client-side routing |
| react-i18next + i18next | Multilingual support (4 languages) |
| Axios | HTTP client |
| Web Speech API | Voice input/output |
| Cloudinary (unsigned upload) | Community post image hosting |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Database and ODM |
| Multer | Image upload handling |
| Axios | External API calls |
| Server-Sent Events (SSE) | Real-time bid notifications |
| dotenv | Environment variable management |

### ML Service
| Technology | Purpose |
|-----------|---------|
| Python + Flask | ML inference server |
| Flask-CORS | Cross-origin support |
| scikit-learn | Random Forest crop model |
| pandas | Data processing |
| Pillow | Image preprocessing |
| HuggingFace Inference API | MobileNetV2 disease detection |
| Gunicorn | Production WSGI server |

### External APIs (all free)
| API | Used For |
|-----|---------|
| SoilGrids ISRIC REST | Soil type from GPS coordinates |
| Open-Meteo | Weather + soil moisture data |
| OpenStreetMap Nominatim | Reverse geocoding (browser-side) |
| Open-Meteo Geocoding | City name to coordinates |
| Agmarknet (data.gov.in) | Live mandi crop prices |
| HuggingFace Inference | MobileNetV2 plant disease model |
| MyMemory Translation | Community post translation |
| Cloudinary | Image storage and CDN |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (React/Vite)                      │
│  LandingPage → Dashboard → CropRecommend → DiseaseDetect         │
│  SmartSell → LoanGateway → Community → VendorPortal              │
└──────────────────┬───────────────────────────┬───────────────────┘
                   │ HTTP / SSE                │ Direct upload
                   ▼                           ▼
┌──────────────────────────┐     ┌─────────────────────────────┐
│   Node.js / Express API   │     │     Cloudinary CDN           │
│   Port 5000               │     │     (community images)       │
│                           │     └─────────────────────────────┘
│  /api/farmer              │
│  /api/location            │◄──── SoilGrids + Open-Meteo
│  /api/crop                │◄──── OpenWeatherMap (optional)
│  /api/disease             │
│  /api/market              │◄──── Agmarknet API
│  /api/loan                │
│  /api/vendor              │
│  /api/bids (SSE)          │
│  /api/vendor-listings     │
│  /api/community           │◄──── MyMemory Translation
└──────────┬───────────────┘
           │ HTTP (crop/disease)
           ▼
┌──────────────────────────┐     ┌─────────────────────────────┐
│   Python / Flask ML       │     │     MongoDB Atlas             │
│   Port 5001               │     │                              │
│                           │     │  Collections:                │
│  /predict-crop            │     │  - farmers                   │
│    RandomForest model     │     │  - vendors                   │
│    (CSV → pickle)         │     │  - marketlistings            │
│                           │     │  - vendorbids                │
│  /detect-disease          │◄─── │  - vendorlistings            │
│    MobileNetV2 via        │     │  - communitypost             │
│    HuggingFace API        │     │  - croprecommendations       │
└──────────────────────────┘     │  - diseasereports            │
                                  └─────────────────────────────┘
```

---

## 🤖 ML Models

### Crop Recommendation Model

- **Algorithm**: Random Forest Classifier
- **Dataset**: Crop Recommendation Dataset (2,200 samples)
- **Classes**: 22 crops (rice, wheat, maize, chickpea, muskmelon, cotton, mango, banana, grapes, pomegranate, etc.)
- **Features**: N, P, K (soil nutrients), temperature, humidity, pH, rainfall
- **Accuracy**: 99% on 20% test split
- **Training**: On first run, trains and saves `crop_model.pkl`. Subsequent runs load from pickle.
- **Soil → NPK mapping**: GPS coordinates → SoilGrids API → sand/silt/clay % → soil type → NPK lookup table

### Disease Detection Model

- **Architecture**: MobileNetV2 (fine-tuned)
- **Dataset**: PlantVillage (54,306 images)
- **Classes**: 38 (26 diseases + 12 healthy across 14 crop types)
- **Crops covered**: Apple, Blueberry, Cherry, Corn, Grape, Orange, Peach, Bell Pepper, Potato, Raspberry, Soybean, Squash, Strawberry, Tomato
- **Accuracy**: 97% on PlantVillage test set
- **Inference**: HuggingFace Inference API (`ozair23/mobilenet_v2_1.0_224-finetuned-plantdisease`)
- **Preprocessing**: Decode base64 → RGB → resize 224×224 → send as bytes

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Python 3.10+
- MongoDB (local or Atlas)
- Git

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/Atharva-026/farmpulse.git
cd farmpulse
```

**2. Install backend dependencies**
```bash
cd backend
npm install
```

**3. Install frontend dependencies**
```bash
cd ../frontend
npm install
```

**4. Install ML service dependencies**
```bash
cd ../ml-service
pip install flask flask-cors pandas scikit-learn requests pillow python-dotenv gunicorn
```

**5. Set up environment variables** (see next section)

**6. Run all three services**

Open three terminals:

```bash
# Terminal 1 — Backend
cd backend
node server.js

# Terminal 2 — Frontend
cd frontend
npm run dev

# Terminal 3 — ML Service
cd ml-service
python app.py
```

Open **http://localhost:5173**

---

## 🔐 Environment Variables

### Backend — `backend/.env`
```env
# Required
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/farmpulse

# Optional (features degrade gracefully without these)
OPENWEATHER_API_KEY=your_openweathermap_key
AGMARKNET_API_KEY=your_data_gov_in_key
HUGGINGFACE_API_KEY=hf_your_key

PORT=5000
```

### ML Service — `ml-service/.env`
```env
HUGGINGFACE_API_KEY=hf_your_key
```

### Frontend — `frontend/.env` (production only)
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_ML_URL=https://your-ml.railway.app
VITE_CLOUDINARY_CLOUD=your_cloudinary_cloud_name
```

### How to get free API keys

| Key | Where to get |
|-----|-------------|
| `MONGO_URI` | [cloud.mongodb.com](https://cloud.mongodb.com) → Free M0 cluster → Connect |
| `OPENWEATHER_API_KEY` | [openweathermap.org/api](https://openweathermap.org/api) → Free tier (1000 calls/day) |
| `AGMARKNET_API_KEY` | [data.gov.in](https://data.gov.in) → Register → API key |
| `HUGGINGFACE_API_KEY` | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) → New token (free) |
| Cloudinary | [cloudinary.com](https://cloudinary.com) → Free plan → Cloud name shown on dashboard |

> **Note**: The app works without `OPENWEATHER_API_KEY` and `AGMARKNET_API_KEY` — it falls back to GPS-based Open-Meteo data and built-in fallback mandi prices respectively.

---

## 📁 Project Structure

```
farmpulse/
├── README.md
│
├── backend/                          # Node.js/Express API
│   ├── server.js                     # Entry point
│   ├── package.json
│   ├── .env                          # Environment variables (not committed)
│   │
│   ├── models/
│   │   ├── Farmer.js                 # Farmer schema
│   │   ├── Vendor.js                 # Vendor schema
│   │   ├── CropRecommendation.js     # Crop recommendation history
│   │   ├── DiseaseReport.js          # Disease detection history
│   │   ├── MarketListing.js          # Farmer crop listings (with bidCount)
│   │   ├── VendorBid.js              # Vendor bids on listings
│   │   ├── VendorListing.js          # Vendor buy offers
│   │   └── CommunityPost.js          # Community posts + comments
│   │
│   └── routes/
│       ├── farmerRoutes.js           # /api/farmer (register, login)
│       ├── vendorRoutes.js           # /api/vendor (register, login)
│       ├── locationRoutes.js         # /api/location/auto-fill (GPS → soil/weather)
│       ├── cropRoutes.js             # /api/crop/recommend
│       ├── diseaseRoutes.js          # /api/disease/detect
│       ├── marketRoutes.js           # /api/market (prices, listings, browse)
│       ├── bidRoutes.js              # /api/bids (place, accept, reject, SSE stream)
│       ├── vendorPriceListingRoutes.js # /api/vendor-listings (buy offers)
│       ├── loanRoutes.js             # /api/loan/match
│       └── communityRoutes.js        # /api/community (posts, likes, comments, translate)
│
├── frontend/                         # React/Vite SPA
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   │
│   └── src/
│       ├── App.jsx                   # Router + auth state
│       ├── main.jsx                  # Entry point + i18n init
│       ├── App.css
│       ├── index.css                 # Design system CSS variables
│       │
│       ├── i18n/
│       │   ├── i18n.js               # i18next configuration
│       │   ├── en.json               # English translations
│       │   ├── hi.json               # Hindi translations
│       │   ├── mr.json               # Marathi translations
│       │   └── kn.json               # Kannada translations
│       │
│       ├── components/
│       │   ├── Navbar.jsx            # Fixed nav + language switcher
│       │   └── VoiceButton.jsx       # Mic button component
│       │
│       ├── hooks/
│       │   ├── useVoice.js           # Speech input/output hooks
│       │   └── useLangCode.js        # Current language code hook
│       │
│       └── pages/
│           ├── LandingPage.jsx       # Public landing + auth modal
│           ├── Dashboard.jsx         # Farmer home (4 stage cards)
│           ├── CropRecommend.jsx     # GPS auto-fill + crop recommendation
│           ├── DiseaseDetect.jsx     # Leaf upload + disease diagnosis
│           ├── LoanGateway.jsx       # Government loan matching
│           ├── SmartSell.jsx         # Mandi prices + vendor sell
│           ├── VendorPortal.jsx      # Vendor dashboard (browse/bids/offers)
│           ├── Community.jsx         # Farmer community feed
│           └── About.jsx             # About page
│
└── ml-service/                       # Python/Flask ML inference
    ├── app.py                        # Flask server (crop + disease endpoints)
    ├── Crop_recommendation.csv       # Training data
    ├── crop_model.pkl                # Trained model (auto-generated)
    ├── requirements.txt
    └── Procfile                      # For Railway/Render deployment
```

---

## 📡 API Reference

### Farmer Routes
```
POST   /api/farmer/register     Register new farmer
POST   /api/farmer/login        Login by phone number
GET    /api/farmer/:id          Get farmer profile
```

### Location (GPS Auto-fill)
```
POST   /api/location/auto-fill  { lat, lon } → { soilType, waterAvailability, temperature, humidity, rainfall, locationName, state }
```

### Crop Recommendation
```
POST   /api/crop/recommend      { soilType, season, waterAvailability, budget, location, farmerId, [lat, lon, temperature, humidity, rainfall] }
GET    /api/crop/history/:id    Farmer's recommendation history
```

### Disease Detection
```
POST   /api/disease/detect      multipart/form-data: { image, cropName, farmerId }
GET    /api/disease/history/:id Farmer's detection history
```

### Market
```
GET    /api/market/prices/:crop ?state=Karnataka  Live mandi prices
POST   /api/market/list                           Post a crop listing
GET    /api/market/listings                       All active listings (vendor browse)
GET    /api/market/listings/farmer/:id            Farmer's own listings
GET    /api/market/browse                         Filtered browse for vendors
```

### Bids
```
POST   /api/bids                       Place a bid
GET    /api/bids/listing/:id           All bids on a listing
GET    /api/bids/vendor/:id            Vendor's bids
PUT    /api/bids/:id/status            Accept or reject bid
PUT    /api/bids/:id/withdraw          Withdraw a bid
GET    /api/bids/summary/:id           Pending bid count
GET    /api/bids/stream/:listingId     SSE stream (real-time updates)
```

### Vendor
```
POST   /api/vendor/register            Register vendor
POST   /api/vendor/login               Login by phone
GET    /api/vendor-listings            Vendor buy offers by crop
POST   /api/vendor-listings            Post a buy offer
GET    /api/vendor-listings/vendor/:id Vendor's own offers
POST   /api/vendor-listings/:id/interest  Express interest (farmer)
PUT    /api/vendor-listings/:id/close  Close a buy offer
GET    /api/vendor-listings/stream/:id SSE stream for vendor notifications
```

### Loan
```
POST   /api/loan/match           { estimatedCost, landSize, farmerId } → matched schemes
GET    /api/loan/schemes         All available schemes
```

### Community
```
GET    /api/community            Feed (paginated) ?page=1&category=disease&sort=trending
GET    /api/community/trending   Top 10 posts last 7 days
GET    /api/community/tags       Trending crop tags
GET    /api/community/:id        Single post with comments
POST   /api/community            Create post { authorId, authorName, caption, language, images[], tags[], category }
PUT    /api/community/:id/like   Toggle like { farmerId }
POST   /api/community/:id/comment  Add comment { authorId, authorName, text, language, parentId }
POST   /api/community/:id/translate  Translate caption { toLang }
DELETE /api/community/:id        Delete own post { farmerId }
```

### ML Service (Port 5001)
```
POST   /predict-crop      { soilType, temperature, humidity, rainfall } → { recommendedCrop, confidence, expectedYield, expectedProfit }
POST   /detect-disease    { image (base64), cropName } → { diseaseName, confidence, treatment, estimatedCost, isHealthy }
GET    /health            Service health check
```

---

## 🚀 Deployment

The stack deploys entirely for free:

| Service | Platform | Free Tier |
|---------|----------|-----------|
| Frontend (React/Vite) | [Vercel](https://vercel.com) | Unlimited |
| Backend (Node/Express) | [Render](https://render.com) | 750 hrs/month |
| ML Service (Flask) | [Railway](https://railway.app) | $5 credit/month |
| Database (MongoDB) | [MongoDB Atlas](https://cloud.mongodb.com) | 512MB forever |
| Images (Community) | [Cloudinary](https://cloudinary.com) | 25GB/month |

### Quick Deploy Steps

1. **MongoDB Atlas** → Create free M0 cluster → Get connection string
2. **Render** → Connect GitHub → Set root to `backend` → Add env vars → Deploy
3. **Railway** → Connect GitHub → Set root to `ml-service` → Add `HUGGINGFACE_API_KEY` → Deploy
4. **Vercel** → Connect GitHub → Set root to `frontend` → Add `VITE_API_URL` pointing to Render URL → Deploy

Full step-by-step deployment guide in [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🌐 Languages Supported

| Language | Code | Coverage |
|----------|------|---------|
| English | `en` | 100% — all pages |
| हिंदी (Hindi) | `hi` | 100% — all pages |
| मराठी (Marathi) | `mr` | 100% — all pages |
| ಕನ್ನಡ (Kannada) | `kn` | 100% — all pages |

Language is auto-persisted to `localStorage`. Community posts can be written in any language and translated on demand to any other with a single tap.

---

## 🐛 Known Limitations

- **Disease detection covers 14 crops only** (PlantVillage dataset limitation) — Mango, Wheat, Rice, Sugarcane are not supported
- **Soybean has healthy images only** in the training set — disease detection unreliable for soybean
- **Render free tier sleeps** after 15 minutes of inactivity — first request takes ~30 seconds to wake up
- **MyMemory translation API** has a limit of 1000 free requests/day — suitable for small communities
- **Agmarknet API** data availability varies by day and crop — fallback data is shown when live data is unavailable

---

## 🤝 Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgements

- [PlantVillage Dataset](https://plantvillage.psu.edu/) — disease detection training data
- [SoilGrids by ISRIC](https://soilgrids.org/) — global soil data API
- [Open-Meteo](https://open-meteo.com/) — free weather API
- [Agmarknet](https://agmarknet.gov.in/) via [data.gov.in](https://data.gov.in) — Indian mandi price data
- [HuggingFace](https://huggingface.co/) — ML model hosting
- [MyMemory](https://mymemory.translated.net/) — free translation API
- [PM-KISAN](https://pmkisan.gov.in/), [KCC](https://www.pmkisan.gov.in), [PMFBY](https://pmfby.gov.in) — government scheme data

---

<div align="center">

**Built with ❤️ for Indian Farmers**

*Powered by Agmarknet · PlantVillage · PM-KISAN · Open-Meteo · SoilGrids*

</div>