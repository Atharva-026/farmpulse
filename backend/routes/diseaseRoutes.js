const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const DiseaseReport = require('../models/DiseaseReport');

const upload = multer({ dest: 'uploads/' });

router.post('/detect', upload.single('image'), async (req, res) => {
  try {
    const { farmerId, cropName } = req.body;

    console.log('Disease Step 1 - File received:', req.file);

    const imageBuffer = fs.readFileSync(req.file.path);
    const imageBase64 = imageBuffer.toString('base64');

    console.log('Disease Step 2 - Calling Flask...');

    const mlRes = await axios.post('http://localhost:5001/detect-disease', {
      image: imageBase64,
      cropName
    });

    console.log('Disease Step 3 - Flask response:', mlRes.data);

    const { diseaseName, confidence, treatment, estimatedCost, isHealthy } = mlRes.data;

    await DiseaseReport.create({
      farmerId,
      cropName,
      imageUrl: req.file.path,
      diseaseName,
      confidence,
      treatment,
      estimatedCost
    });

    fs.unlinkSync(req.file.path);

    console.log('Disease Step 4 - Saved to MongoDB');

    res.json({
      success: true,
      diseaseName,
      confidence,
      treatment,
      estimatedCost,
      isHealthy
    });

  } catch (err) {
    console.error('Disease ERROR:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/history/:farmerId', async (req, res) => {
  try {
    const reports = await DiseaseReport.find({ farmerId: req.params.farmerId });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;