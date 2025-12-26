const mongoose = require('mongoose');

const formationSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, required: true },
  categorie: { type: String, required: true },
  dureeHeures: { type: Number, required: true },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  niveau: { type: String, enum: ['Débutant', 'Intermédiaire', 'Avancé'], required: true },
  imageFormation: { type: String },
  formateurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Formateur', required: true },
  capacite: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Formation', formationSchema);
