const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

app.use('/api/farmer', require('./routes/farmerRoutes'));
app.use('/api/crop', require('./routes/cropRoutes'));
app.use('/api/disease', require('./routes/diseaseRoutes'));
app.use('/api/market', require('./routes/marketRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));