

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
import requests as http_requests
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

MODEL_PATH = 'crop_model.pkl'

# =========================
# Crop Model Training
# =========================
def train_and_save_model():
    df = pd.read_csv('Crop_recommendation.csv')

    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
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
    'cotton': {'yield': '8-12 quintals/acre', 'profit': '₹35,000-₹55,000'}
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

    features = [[
        npk['N'], npk['P'], npk['K'],
        temp, humidity, npk['ph'], rainfall
    ]]

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


# =========================
# Disease Treatment Data
# =========================
DISEASE_TREATMENTS = {
    'Tomato___Early_blight': {
        'treatment': 'Apply fungicide like mancozeb.',
        'cost': 1500
    },
    'Tomato___Late_blight': {
        'treatment': 'Apply metalaxyl immediately.',
        'cost': 2500
    },
    'Potato___Early_blight': {
        'treatment': 'Use chlorothalonil fungicide.',
        'cost': 1800
    },
    'Rice___Leaf_blast': {
        'treatment': 'Apply tricyclazole.',
        'cost': 2200
    },
    'Rice___healthy': {
        'treatment': 'Crop is healthy.',
        'cost': 0
    }
}


# =========================
# Disease Detection API
# =========================
@app.route('/detect-disease', methods=['POST'])
def detect_disease():
    try:
        data = request.json
        image_base64 = data.get('image')
        crop_name = data.get('cropName', 'unknown')

        HF_API_KEY = os.environ.get('HUGGINGFACE_API_KEY', '')
        print('HF Key loaded:', HF_API_KEY[:10] if HF_API_KEY else 'NO KEY FOUND')

        API_URL = "https://router.huggingface.co/hf-inference/models/ozair23/mobilenet_v2_1.0_224-finetuned-plantdisease"

        try:
            image_bytes = base64.b64decode(image_base64)
            print('Original image size:', len(image_bytes))

            img = Image.open(io.BytesIO(image_bytes))
            img = img.convert('RGB')
            img = img.resize((224, 224))

            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=85)
            image_bytes = buffer.getvalue()
            print('Resized image size:', len(image_bytes))

        except Exception as decode_err:
            print('Image processing error:', str(decode_err))
            return jsonify({'error': 'Image processing failed', 'details': str(decode_err)}), 500

        headers = {
            "Authorization": f"Bearer {HF_API_KEY}",
            "Content-Type": "application/octet-stream"
        }

        try:
            response = http_requests.post(API_URL, headers=headers, data=image_bytes, timeout=30)
            print('HF Response status:', response.status_code)
            print('HF Response body:', response.text[:300])
        except Exception as api_err:
            print('HF API call error:', str(api_err))
            return jsonify({'error': 'HF API call failed', 'details': str(api_err)}), 500

        if response.status_code != 200:
            print('HF API Error:', response.status_code, response.text)
            return jsonify({
                'error': 'Hugging Face API failed',
                'status': response.status_code,
                'details': response.text
            }), 500

        results = response.json()
        print('HF Results:', results)

        if isinstance(results, list) and len(results) > 0:
            top_result = results[0]
            disease_label = top_result.get('label', 'Unknown')
            confidence = round(top_result.get('score', 0) * 100, 2)
        else:
            return jsonify({'error': 'No results from model', 'raw': results}), 500

        treatment_info = DISEASE_TREATMENTS.get(disease_label, {
            'treatment': 'Consult local agronomist for detailed advice.',
            'cost': 1000
        })

        is_healthy = 'healthy' in disease_label.lower()

        return jsonify({
            'diseaseName': disease_label,
            'confidence': confidence,
            'treatment': treatment_info['treatment'],
            'estimatedCost': treatment_info['cost'],
            'isHealthy': is_healthy,
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