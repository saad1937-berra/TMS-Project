const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion à MongoDB 
mongoose.connect('mongodb://admin:1234@localhost:27017/Clientdb?authSource=admin') 
.then(() => console.log('MongoDB connecté')) 
.catch(err => console.error('Erreur MongoDB:', err)); 

// Routes
app.use('/api/formations', require('./routes/formations'));
app.use('/api/formateurs', require('./routes/formateurs'));
app.use('/api/apprenants', require('./routes/apprenants'));
app.use('/api/inscriptions', require('./routes/inscriptions'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
