const mongoose = require('mongoose');

const formateurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  specialite: { type: String, required: true },
  email: { type: String, required: true },
  telephone: { type: String, required: true },
  bio: { type: String },
  photo: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Formateur', formateurSchema);
