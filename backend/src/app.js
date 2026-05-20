const express = require('express');
const cors = require('cors');
const healthCheckRoutes = require('./routes/healthCheck.routes');
const sickLetterRoutes = require('./routes/sickLetter.routes');
const emergencyCaseRoutes = require('./routes/emergencyCase.routes');
require('dotenv').config();

const { successResponse } = require('./utils/response');
const authRoutes = require('./routes/auth.routes');
const queueRoutes = require('./routes/queue.routes');
const medicalHistoryRoutes = require('./routes/medicalHistory.routes');
const analyticsRoutes = require('./routes/analytics.routes');


const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  return successResponse(res, 'CampusCare Backend API is running', {
    app: 'CampusCare',
    version: '1.0.0',
    theme: 'Eco Health Campus',
    campus: 'Satya Terra Bhinneka',
  });
});


app.use('/api/auth', authRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/health-checks', healthCheckRoutes);
app.use('/api/sick-letters', sickLetterRoutes);
app.use('/api/emergency-cases', emergencyCaseRoutes);
app.use('/api/students', medicalHistoryRoutes);
app.use('/api/analytics', analyticsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CampusCare backend running on port ${PORT}`);
});