const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
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

// Gestion spécifique des requêtes OPTIONS 
app.options('*', cors());

// Middleware pour logger toutes les requêtes
app.use((req, res, next) => {
  
  if (req.method === 'POST' || req.method === 'PUT') {
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    } else if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
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
.catch(err => console.error('Erreur MongoDB:', err)); 


// Routes
app.use('/api/formations', require('./routes/formations'));
app.use('/api/formateurs', require('./routes/formateurs'));
app.use('/api/apprenants', require('./routes/apprenants'));
app.use('/api/inscriptions', require('./routes/inscriptions'));

app.listen(PORT, () => {
});
