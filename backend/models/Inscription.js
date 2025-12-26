const mongoose = require('mongoose');

const inscriptionSchema = new mongoose.Schema({
  apprenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Apprenant', required: true },
  formationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Formation', required: true },
  dateInscription: { type: Date, default: Date.now },
  statut: { type: String, enum: ['Inscrit', 'Annulé', 'Terminé'], default: 'Inscrit' },
  paiement: { type: String, enum: ['Payé', 'Non payé'], default: 'Non payé' }
}, { timestamps: true });

module.exports = mongoose.model('Inscription', inscriptionSchema);
