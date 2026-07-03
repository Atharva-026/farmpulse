# 🌾 FarmPulse — AI-Powered Agricultural Intelligence Platform

<div align="center">

![FarmPulse](https://img.shields.io/badge/FarmPulse-Agricultural%20AI-2E7D32?style=for-the-badge&logo=leaf&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?style=flat-square&logo=node.js)
![Python](https://img.shields.io/badge/Python-Flask-3776AB?style=flat-square&logo=python)
![Gemini](https://img.shields.io/badge/Google-Gemini%20Vision-4285F4?style=flat-square&logo=google)
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
- [AI & ML](#-ai--ml)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Languages Supported](#-languages-supported)
- [Known Limitations](#-known-limitations)
- [Contributing](#-contributing)

---

## 🌱 About the Project

FarmPulse is a full-stack agricultural technology platform that empowers Indian farmers with data-driven insights, market intelligence, financial tools, and a multilingual community — all in one place, available in four Indian languages.

The platform guides a farmer through their entire journey:

```
Know what to grow  →  Detect crop disease  →  Get funded  →  Sell at the best price  →  Connect with farmers
   (AI Crop Rec)        (Gemini Vision)       (Loan Match)      (Live Mandi + Bids)        (Community)
```

### 🎯 Problem Statement

Indian farmers face four critical challenges:

1. **No data** to decide which crop to grow for maximum yield.
2. **Late disease detection**, leading to avoidable crop loss.
3. **No easy access** to government loan schemes when disaster strikes.
4. **Price exploitation** by middlemen due to a lack of market transparency.

FarmPulse addresses all four in a single, free, multilingual platform.

---

## ✨ Features

### 🌾 1. AI Crop Recommendation
- GPS-based auto-detection of soil type, water availability, temperature, and humidity.
- **SoilGrids ISRIC API** for real soil composition; **Open-Meteo API** for live weather and rainfall history.
- Random Forest model trained on **22 crop classes**.
- Returns recommended crop, confidence score, and estimated yield/profit range.
- Season auto-detected from the current month (Kharif / Rabi / Zaid).
- Optional **voice input** — fill the whole form by speaking one sentence.

### 🔬 2. Disease Detection (Google Gemini Vision)
- Upload a leaf photo → instant AI diagnosis.
- Powered by **Google Gemini Vision** (multimodal) — identifies the disease, assesses severity, and returns a practical treatment protocol.
- **Not limited to a fixed crop list** — works across a wide range of crops (Mango, Rice, Wheat, Tomato, Potato, and more).
- Returns a **per-disease treatment cost estimate** in ₹, which feeds directly into the Loan Gateway.
- **Automatic model fallback** (`gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-2.5-flash-lite`) with retry, for resilience against transient API overloads.
- Warns when the uploaded photo doesn't match the selected crop or is unclear.

### 🏦 3. Loan Gateway
- Matches farmers to 4 real government schemes: **KCC, PMFBY, Agriculture Infrastructure Fund, PM-KISAN**.
- Ranked and filtered by land size and required amount.
- Pre-filled application form, with direct links to official government portals.
- Seamlessly receives the treatment cost from Disease Detection.

### 📊 4. Smart Sell (Market Intelligence)
- **Live Agmarknet API** integration for real mandi prices across India.
- Nearby mandis surfaced first, based on the farmer's location.
- Each mandi is tagged **above / around / below the cross-mandi average**, so farmers instantly see which markets pay more than average.
- Highest-price recommendation to guide where to sell.
- Vendor direct marketplace — post a crop listing and receive competing bids.

### 🤝 5. Vendor Portal + Real-Time Bidding
- Separate vendor authentication.
- Browse active farmer listings with filters (crop, state, quantity, price).
- Place bids with price, quantity, and a message.
- **Real-time bid updates via Server-Sent Events (SSE)** — new bids appear on the farmer's screen instantly, and accept/reject status updates reach the vendor live, with no refresh.
- Post standing "Buy Offers" that farmers can discover and respond to.

### 🌿 6. Farmer Community
- Instagram-style explore feed of farming posts.
- Upload up to 3 photos per post via **Cloudinary CDN**.
- Post in any of 4 languages; **on-demand translation** via MyMemory API (cached in MongoDB after first use).
- Like, comment, nested replies, trending posts, trending tags, and infinite scroll.

### 🌐 7. Multilingual Support
- Full UI in **English, हिंदी (Hindi), मराठी (Marathi), ಕನ್ನಡ (Kannada)** via `react-i18next`.
- Language persisted in `localStorage` across sessions.

### 🔐 8. Secure Authentication
- Password-based login for **both farmers and vendors**.
- Passwords hashed with **bcrypt**; never returned to the client.

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI framework |
| Vite | 8 | Build tool and dev server |
| React Router DOM | 7 | Client-side routing |
| react-i18next / i18next | 17 / 26 | Multilingual support (4 languages) |
| Axios | 1.x | HTTP client |
| Web Speech API | — | Voice input/output |
| Cloudinary (unsigned upload) | — | Community image hosting |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js + Express | 5 | REST API server |
| MongoDB + Mongoose | 9 | Database and ODM |
| bcryptjs | 3 | Password hashing |
| Multer | 2 | Image upload handling |
| Server-Sent Events (SSE) | — | Real-time bid notifications |
| dotenv | 17 | Environment variable management |

### ML Service
| Technology | Purpose |
|-----------|---------|
| Python + Flask | ML inference server |
| Flask-CORS | Cross-origin support |
| scikit-learn | Random Forest crop model |
| pandas / NumPy | Data processing |
| Pillow | Image preprocessing |
| **google-genai** | Google Gemini Vision (disease detection) |
| Gunicorn | Production WSGI server |

### External APIs
| API | Used For | Key Required |
|-----|----------|--------------|
| Google Gemini | Disease detection (vision) | Yes (free tier) |
| SoilGrids ISRIC | Soil type from GPS | No |
| Open-Meteo | Weather + rainfall | No |
| Agmarknet (data.gov.in) | Live mandi prices | Yes (free) |
| MyMemory Translation | Community post translation | No |
| Cloudinary | Community image storage/CDN | Cloud name only |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (React 19 / Vite)                 │
│  Landing → Dashboard → CropRecommend → DiseaseDetect             │
│  SmartSell → LoanGateway → Community → VendorPortal              │
└──────────────────┬───────────────────────────┬──────────────────┘
                   │ HTTP / SSE                │ Direct upload
                   ▼                           ▼
┌──────────────────────────┐     ┌─────────────────────────────┐
│   Node.js / Express API   │     │      Cloudinary CDN          │
│   Port 5000               │     │      (community images)      │
│                           │     └─────────────────────────────┘
│  /api/farmer  (bcrypt)    │
│  /api/vendor  (bcrypt)    │
│  /api/location            │◄──── SoilGrids + Open-Meteo
│  /api/crop                │
│  /api/disease             │
│  /api/market              │◄──── Agmarknet API
│  /api/loan                │
│  /api/bids (SSE)          │
│  /api/vendor-listings     │
│  /api/community           │◄──── MyMemory Translation
└──────────┬───────────────┘
           │ HTTP (crop + disease)
           ▼
┌──────────────────────────┐     ┌─────────────────────────────┐
│   Python / Flask ML       │     │       MongoDB Atlas          │
│   Port 5001               │     │  farmers · vendors           │
│                           │     │  marketlistings · vendorbids │
│  /predict-crop            │     │  vendorlistings              │
│    RandomForest (sklearn) │     │  communityposts              │
│                           │     │  croprecommendations         │
│  /detect-disease          │◄──── Google Gemini Vision API     │
│    Gemini Vision          │     │  diseasereports              │
└──────────────────────────┘     └─────────────────────────────┘
```

---

## 🤖 AI & ML

### Crop Recommendation Model
- **Algorithm:** Random Forest Classifier (scikit-learn)
- **Dataset:** Crop Recommendation Dataset (2,200 samples)
- **Classes:** 22 crops (rice, wheat, maize, chickpea, muskmelon, cotton, mango, banana, grapes, pomegranate, etc.)
- **Features:** N, P, K, temperature, humidity, pH, rainfall
- **Accuracy:** ~99% on a 20% held-out split
- **Note:** Recommendations reflect agronomic suitability from soil and climate features. They do **not** account for regional cropping patterns or local market demand.

### Disease Detection (Google Gemini Vision)
- **Model:** Google Gemini (multimodal vision), with automatic fallback across `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-2.5-flash-lite`.
- **Input:** Base64 leaf image + selected crop → normalized to JPEG before inference.
- **Output (structured JSON):** disease name, health status, confidence, treatment advice, estimated cost (₹), and a mismatch/clarity warning.
- **Coverage:** Not restricted to a fixed dataset — handles a broad range of crops and diseases.
- **Note:** The treatment cost is an **AI-generated estimate** for guidance only, not a billed quote.

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

**2. Backend**
```bash
cd backend
npm install
```

**3. Frontend**
```bash
cd ../frontend
npm install
```

**4. ML Service**
```bash
cd ../ml-service
pip install flask flask-cors pandas numpy scikit-learn pillow python-dotenv google-genai gunicorn
```

**5. Set up environment variables** (see next section)

**6. Run all three services** (three terminals)
```bash
# Terminal 1 — Backend
cd backend && node server.js

# Terminal 2 — Frontend
cd frontend && npm run dev

# Terminal 3 — ML Service
cd ml-service && python app.py
```

Open **http://localhost:5173**

---

## 🔐 Environment Variables

### Backend — `backend/.env`
```env
# Required
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/farmpulse

# Optional (features degrade gracefully without these)
AGMARKNET_API_KEY=your_data_gov_in_key
OPENWEATHER_API_KEY=your_openweathermap_key

PORT=5000
```

### ML Service — `ml-service/.env`
```env
GEMINI_API_KEY=your_gemini_api_key
```

### How to get the keys (all free)
| Key | Where to get it |
|-----|-----------------|
| `MONGO_URI` | [cloud.mongodb.com](https://cloud.mongodb.com) → Free M0 cluster → Connect |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) → Get API key (no credit card) |
| `AGMARKNET_API_KEY` | [data.gov.in](https://data.gov.in) → Register → API key |
| Cloudinary cloud name | [cloudinary.com](https://cloudinary.com) → Free plan → Dashboard |

> **Note:** `.env` files are gitignored and must never be committed. Without `AGMARKNET_API_KEY`, Smart Sell falls back to built-in sample prices for a few crops.

---

## 📡 API Reference

### Farmer / Vendor (password auth)
```
POST   /api/farmer/register     { name, phone, password, ... }
POST   /api/farmer/login        { phone, password }
GET    /api/farmer/:id          Get profile (password excluded)
POST   /api/vendor/register     { name, businessName, phone, password, ... }
POST   /api/vendor/login        { phone, password }
```

### Location / Crop / Disease
```
POST   /api/location/auto-fill  { lat, lon } → soil + weather
POST   /api/crop/recommend      { soilType, season, ... } → crop + confidence
POST   /api/disease/detect      multipart { image, cropName } → diagnosis + cost
```

### Market / Bids
```
GET    /api/market/prices/:crop ?state=...   Live mandi prices + above/below-avg tags
POST   /api/market/list                      Post a crop listing
GET    /api/market/browse                    Filtered browse for vendors
POST   /api/bids                             Place a bid
PUT    /api/bids/:id/status                  Accept / reject a bid
GET    /api/bids/stream/:listingId           SSE stream (real-time updates)
```

### Loan / Community
```
POST   /api/loan/match          { estimatedCost, landSize } → matched schemes
GET    /api/community           Paginated feed
POST   /api/community           Create post
POST   /api/community/:id/translate   Translate caption { toLang }
```

### ML Service (Port 5001)
```
POST   /predict-crop      { soilType, temperature, humidity, rainfall } → crop
POST   /detect-disease    { image (base64), cropName } → disease + treatment + cost
GET    /health            Service health check
```

---

## 🚀 Deployment

**Target platform: Microsoft Azure App Service** (Platform-as-a-Service), using the **Azure for Students** tier — no credit card required, verified via institutional email.

| Service | Platform |
|---------|----------|
| Frontend (React build) | Served by the Node backend as static files |
| Backend (Node/Express) | Azure App Service |
| ML Service (Flask) | Azure App Service |
| Database | MongoDB Atlas (free M0) |
| Community images | Cloudinary |

> Deployment configuration (startup commands, environment variables, and Atlas network access) is documented separately in the deployment guide.

---

## 🌐 Languages Supported

| Language | Code | Coverage |
|----------|------|----------|
| English | `en` | 100% |
| हिंदी (Hindi) | `hi` | 100% |
| मराठी (Marathi) | `mr` | 100% |
| ಕನ್ನಡ (Kannada) | `kn` | 100% |

Community posts can be written in any language and translated on demand to any other with a single tap.

---

## 🐛 Known Limitations

- **Disease cost is an AI estimate** — a guidance figure from Gemini, not an official or billed price.
- **Crop recommendation** is based on soil and climate features only; it does not factor in regional cropping habits or market demand.
- **Gemini free tier** is rate-limited and can occasionally return transient overload errors (mitigated by automatic model fallback).
- **Agmarknet data** availability varies by day and crop; sample fallback data is shown when live data is unavailable.
- **MyMemory translation API** allows ~1000 free requests/day — suitable for small communities.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.

---

## 🙏 Acknowledgements

- [Google Gemini](https://ai.google.dev/) — disease detection (vision)
- [SoilGrids by ISRIC](https://soilgrids.org/) — global soil data
- [Open-Meteo](https://open-meteo.com/) — free weather API
- [Agmarknet](https://agmarknet.gov.in/) via [data.gov.in](https://data.gov.in) — mandi price data
- [MyMemory](https://mymemory.translated.net/) — free translation API
- [Cloudinary](https://cloudinary.com/) — image storage and CDN
- PM-KISAN, KCC, PMFBY — government scheme data

---

<div align="center">

**Built with ❤️ for Indian Farmers**

</div>