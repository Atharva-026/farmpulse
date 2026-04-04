from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import pickle
import os

app = Flask(__name__)
CORS(app)

MODEL_PATH = 'crop_model.pkl'

def train_and_save_model():
    df = pd.read_csv('Crop_recommendation.csv')
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['label']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    print(f"Model trained. Accuracy: {model.score(X_test, y_test):.2f}")
    return model

if os.path.exists(MODEL_PATH):
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    print("Model loaded from file")
else:
    model = train_and_save_model()

CROP_INFO = {
    'rice':        { 'yield': '25-35 quintals/acre', 'profit': '₹40,000-₹55,000' },
    'wheat':       { 'yield': '15-20 quintals/acre', 'profit': '₹30,000-₹45,000' },
    'maize':       { 'yield': '20-30 quintals/acre', 'profit': '₹35,000-₹50,000' },
    'chickpea':    { 'yield': '8-12 quintals/acre',  'profit': '₹25,000-₹40,000' },
    'kidneybeans': { 'yield': '6-10 quintals/acre',  'profit': '₹20,000-₹35,000' },
    'pigeonpeas':  { 'yield': '5-8 quintals/acre',   'profit': '₹18,000-₹30,000' },
    'mothbeans':   { 'yield': '4-7 quintals/acre',   'profit': '₹15,000-₹25,000' },
    'mungbean':    { 'yield': '4-6 quintals/acre',   'profit': '₹14,000-₹22,000' },
    'blackgram':   { 'yield': '4-6 quintals/acre',   'profit': '₹14,000-₹22,000' },
    'lentil':      { 'yield': '5-8 quintals/acre',   'profit': '₹16,000-₹28,000' },
    'pomegranate': { 'yield': '80-100 kg/tree',      'profit': '₹60,000-₹90,000' },
    'banana':      { 'yield': '200-300 kg/acre',     'profit': '₹50,000-₹80,000' },
    'mango':       { 'yield': '100-150 kg/tree',     'profit': '₹70,000-₹1,00,000' },
    'grapes':      { 'yield': '8-12 tons/acre',      'profit': '₹80,000-₹1,20,000' },
    'watermelon':  { 'yield': '15-20 tons/acre',     'profit': '₹45,000-₹70,000' },
    'muskmelon':   { 'yield': '8-12 tons/acre',      'profit': '₹35,000-₹55,000' },
    'apple':       { 'yield': '10-15 tons/acre',     'profit': '₹90,000-₹1,50,000' },
    'orange':      { 'yield': '8-12 tons/acre',      'profit': '₹55,000-₹85,000' },
    'papaya':      { 'yield': '30-50 tons/acre',     'profit': '₹60,000-₹90,000' },
    'coconut':     { 'yield': '50-70 nuts/tree',     'profit': '₹40,000-₹65,000' },
    'cotton':      { 'yield': '8-12 quintals/acre',  'profit': '₹35,000-₹55,000' },
    'jute':        { 'yield': '20-25 quintals/acre', 'profit': '₹25,000-₹40,000' },
    'coffee':      { 'yield': '5-8 quintals/acre',   'profit': '₹50,000-₹80,000' },
}

SOIL_TO_NPK = {
    'sandy': { 'N': 30, 'P': 20, 'K': 15, 'ph': 6.5 },
    'clay':  { 'N': 80, 'P': 60, 'K': 50, 'ph': 6.0 },
    'loamy': { 'N': 90, 'P': 70, 'K': 60, 'ph': 6.8 },
    'silt':  { 'N': 70, 'P': 55, 'K': 45, 'ph': 6.5 },
    'peaty': { 'N': 60, 'P': 40, 'K': 35, 'ph': 5.5 },
}

@app.route('/predict-crop', methods=['POST'])
def predict_crop():
    data = request.json
    soil     = data.get('soilType', 'loamy')
    temp     = float(data.get('temperature', 25))
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

@app.route('/health', methods=['GET'])
def health():
    return jsonify({ 'status': 'ML service running' })

if __name__ == '__main__':
    app.run(port=5001, debug=True)