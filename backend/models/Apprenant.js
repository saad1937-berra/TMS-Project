const mongoose = require('mongoose');

const inscriptionSchema = new mongoose.Schema({
  formation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formation',
    required: true
  },
  dateInscription: {
    type: Date,
    default: Date.now
  },
  statut: {
    type: String,
    enum: ['Inscrit', 'En cours', 'Terminé', 'Abandonné'],
    default: 'Inscrit'
  },
  dateFin: {
    type: Date
  }
});

const apprenantSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  dateNaissance: { type: Date, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true, unique: true },
  telephone: { type: String },
  adresse: {
    rue: String,
    ville: String,
    codePostal: String,
    pays: String
  },
  niveauEtude: { type: String },
  profession: { type: String },
  photo: { type: String, required: true },
  statut: {
    type: String,
    enum: ['Actif', 'Inactif'],
    default: 'Actif'
  },
  formationsInscrites: [inscriptionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Apprenant', apprenantSchema);