const mongoose = require('mongoose');

const apprenantSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  dateNaissance: { type: Date, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  niveauEtude: { type: String },
  photo: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Apprenant', apprenantSchema);
