const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Middleware CORS amélioré
app.use(cors({
  origin: '*', // Autoriser toutes les origines (pour le développement)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept', 
    'Origin', 
    'X-Requested-With',
    'X-HTTP-Method-Override'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Gestion spécifique des requêtes OPTIONS (preflight)
app.options('*', cors());

// Middleware pour logger toutes les requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  
  if (req.method === 'POST' || req.method === 'PUT') {
    // Ne pas loguer le body entier pour les FormData (trop volumineux)
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      console.log('Body: FormData (multipart/form-data)');
    } else if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      console.log('Body (JSON):', req.body);
    }
  }
  
  // Important: next() pour continuer
  next();
});app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion à MongoDB 
mongoose.connect('mongodb://admin:1234@localhost:27017/Clientdb?authSource=admin') 
.then(() => console.log('MongoDB connecté')) 
.catch(err => console.error('Erreur MongoDB:', err)); 

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Routes
app.use('/api/formations', require('./routes/formations'));
app.use('/api/formateurs', require('./routes/formateurs'));
app.use('/api/apprenants', require('./routes/apprenants'));
app.use('/api/inscriptions', require('./routes/inscriptions'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
