from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import pickle
import os
import base64
import json
from PIL import Image
import io
import time
from google import genai
from google.genai import types

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'crop_model.pkl')
DATASET_PATH = os.path.join(BASE_DIR, 'Crop_recommendation.csv')

# Gemini client (used for disease detection)
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None
print('Gemini key loaded:', GEMINI_API_KEY[:8] if GEMINI_API_KEY else 'NO KEY FOUND')

FEATURE_COLS = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']

# =========================
# Crop Model Training
# =========================
def train_and_save_model():
    df = pd.read_csv(DATASET_PATH, sep=None, engine='python')
    df.columns = df.columns.str.strip().str.replace('\ufeff', '', regex=False)

    required_columns = FEATURE_COLS + ['label']
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise ValueError(
            f"Dataset is missing columns: {missing_columns}. "
            f"Found columns: {list(df.columns)}"
        )

    X = df[FEATURE_COLS]
    y = df['label']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)

    print(f"Model trained. Accuracy: {model.score(X_test, y_test):.2f}")
    return model


# Load or train model
if os.path.exists(MODEL_PATH):
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    print("Model loaded from file")
else:
    model = train_and_save_model()


# =========================
# Crop Info
# =========================
CROP_INFO = {
    'rice': {'yield': '25-35 quintals/acre', 'profit': '₹40,000-₹55,000'},
    'wheat': {'yield': '15-20 quintals/acre', 'profit': '₹30,000-₹45,000'},
    'maize': {'yield': '20-30 quintals/acre', 'profit': '₹35,000-₹50,000'},
    'chickpea': {'yield': '8-12 quintals/acre', 'profit': '₹25,000-₹40,000'},
    'banana': {'yield': '200-300 kg/acre', 'profit': '₹50,000-₹80,000'},
    'mango': {'yield': '100-150 kg/tree', 'profit': '₹70,000-₹1,00,000'},
    'cotton': {'yield': '8-12 quintals/acre', 'profit': '₹35,000-₹55,000'},
    'muskmelon':   {'yield': '80-120 quintals/acre',   'profit': '₹40,000-₹65,000'},
    'watermelon':  {'yield': '100-150 quintals/acre',  'profit': '₹45,000-₹70,000'},
    'mungbean':    {'yield': '4-6 quintals/acre',      'profit': '₹18,000-₹28,000'},
    'blackgram':   {'yield': '4-6 quintals/acre',      'profit': '₹20,000-₹30,000'},
    'lentil':      {'yield': '5-8 quintals/acre',      'profit': '₹22,000-₹35,000'},
    'pomegranate': {'yield': '80-100 kg/tree',         'profit': '₹60,000-₹90,000'},
    'grapes':      {'yield': '8-12 tonnes/acre',       'profit': '₹80,000-₹1,20,000'},
    'orange':      {'yield': '60-80 kg/tree',          'profit': '₹50,000-₹75,000'},
    'apple':       {'yield': '40-60 kg/tree',          'profit': '₹60,000-₹90,000'},
    'papaya':      {'yield': '40-60 tonnes/acre',      'profit': '₹55,000-₹80,000'},
    'coconut':     {'yield': '60-80 nuts/tree/yr',     'profit': '₹45,000-₹70,000'},
    'jute':        {'yield': '20-25 quintals/acre',    'profit': '₹25,000-₹38,000'},
    'coffee':      {'yield': '5-8 quintals/acre',      'profit': '₹60,000-₹90,000'},
    'kidneybeans': {'yield': '6-9 quintals/acre',      'profit': '₹22,000-₹35,000'},
    'pigeonpeas':  {'yield': '6-10 quintals/acre',     'profit': '₹20,000-₹32,000'},
    'mothbeans':   {'yield': '3-5 quintals/acre',      'profit': '₹15,000-₹25,000'},
}

SOIL_TO_NPK = {
    'sandy': {'N': 30, 'P': 20, 'K': 15, 'ph': 6.5},
    'clay': {'N': 80, 'P': 60, 'K': 50, 'ph': 6.0},
    'loamy': {'N': 90, 'P': 70, 'K': 60, 'ph': 6.8},
    'silt': {'N': 70, 'P': 55, 'K': 45, 'ph': 6.5},
    'peaty': {'N': 60, 'P': 40, 'K': 35, 'ph': 5.5},
}


# =========================
# Crop Prediction API
# =========================
@app.route('/predict-crop', methods=['POST'])
def predict_crop():
    data = request.json

    soil = data.get('soilType', 'loamy')
    temp = float(data.get('temperature', 25))
    humidity = float(data.get('humidity', 60))
    rainfall = float(data.get('rainfall', 100))

    npk = SOIL_TO_NPK.get(soil, SOIL_TO_NPK['loamy'])

    # Use a named DataFrame so sklearn doesn't warn about missing feature names
    features = pd.DataFrame(
        [[npk['N'], npk['P'], npk['K'], temp, humidity, npk['ph'], rainfall]],
        columns=FEATURE_COLS
    )

    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    confidence = round(float(max(probabilities)) * 100, 2)

    info = CROP_INFO.get(prediction, {
        'yield': 'Data not available',
        'profit': 'Data not available'
    })

    return jsonify({
        'recommendedCrop': prediction,
        'confidence': confidence,
        'expectedYield': info['yield'],
        'expectedProfit': info['profit']
    })



# Try the primary model, retry on overload (503), then fall back to lighter models
GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite"]

def generate_with_fallback(contents, config):
    last_err = None
    for model_name in GEMINI_MODELS:
        for attempt in range(2):
            try:
                return gemini_client.models.generate_content(
                    model=model_name, contents=contents, config=config
                )
            except Exception as e:
                last_err = e
                msg = str(e)
                if '503' in msg or 'UNAVAILABLE' in msg or 'overloaded' in msg:
                    time.sleep(1.5)   # transient overload -> retry / next model
                    continue
                break                 # other error -> try next model
    raise last_err


# =========================
# Disease Detection API (Gemini Vision)
# =========================
@app.route('/detect-disease', methods=['POST'])
def detect_disease():
    try:
        data = request.json
        image_base64 = data.get('image')
        crop_name = data.get('cropName', 'unknown')

        if not gemini_client:
            return jsonify({'error': 'GEMINI_API_KEY not set in ml-service/.env'}), 500

        # Decode + normalize the image
        try:
            image_bytes = base64.b64decode(image_base64)
            img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            img = img.resize((512, 512))
            buf = io.BytesIO()
            img.save(buf, format='JPEG', quality=85)
            image_bytes = buf.getvalue()
        except Exception as decode_err:
            return jsonify({'error': 'Image processing failed', 'details': str(decode_err)}), 500

        prompt = f"""You are an expert plant pathologist. The user says this leaf is from a "{crop_name}" plant.
Look at the leaf photo and identify the plant disease, or confirm it is healthy.

Respond with ONLY a JSON object (no markdown, no extra text) in exactly this shape:
{{
  "diseaseName": "common name of the disease, or 'Healthy' if no disease is visible",
  "isHealthy": true or false,
  "confidence": a number from 0 to 100,
  "treatment": "one or two short, practical sentences of treatment advice for an Indian farmer",
  "estimatedCost": realistic total cost in Indian Rupees to treat this specific disease on about one acre, as a plain integer (no commas, no symbols). Base it on typical Indian agro-chemical prices and this disease's severity. Use 0 only if the plant is healthy,
  "isWarning": true if the photo is blurry, is not a leaf, or clearly does not match the "{crop_name}" crop; otherwise false
}}"""

        response = generate_with_fallback(
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                prompt
            ],
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )

        raw = response.text.strip()
        print('Gemini raw:', raw[:500])
        result = json.loads(raw)

        # Coerce cost to a clean integer (handles "1500", "₹1,500", 1500.0, etc.)
        cost = result.get('estimatedCost', 0)
        try:
            cost = int(float(str(cost).replace(',', '').replace('₹', '').strip()))
        except (ValueError, TypeError):
            cost = 0

        return jsonify({
            'diseaseName': result.get('diseaseName', 'Unknown'),
            'confidence': result.get('confidence', 0),
            'treatment': result.get('treatment', 'Consult a local agronomist.'),
            'estimatedCost': cost,
            'isHealthy': bool(result.get('isHealthy', False)),
            'isWarning': bool(result.get('isWarning', False)),
            'cropName': crop_name
        })

    except Exception as e:
        print('FULL EXCEPTION:', str(e))
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# =========================
# Health Check
# =========================
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ML service running'})


# =========================
# Run Server
# =========================
if __name__ == '__main__':
    app.run(port=5001, debug=True)