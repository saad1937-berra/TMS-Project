const mongoose = require('mongoose');

const inscriptionSchema = new mongoose.Schema({
  apprenantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Apprenant', 
    required: [true, 'L\'apprenant est obligatoire'],
    index: true
  },
  formationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Formation', 
    required: [true, 'La formation est obligatoire'],
    index: true
  },
  dateInscription: { 
    type: Date, 
    default: Date.now 
  },
  statut: { 
    type: String, 
    enum: {
      values: ['Inscrit', 'Annulé', 'Terminé'],
      message: 'Le statut doit être: Inscrit, Annulé ou Terminé'
    },
    default: 'Inscrit' 
  },
  paiement: { 
    type: String, 
    enum: {
      values: ['Payé', 'Non payé'],
      message: 'Le paiement doit être: Payé ou Non payé'
    },
    default: 'Non payé' 
  }
}, { 
  timestamps: true 
});

// Index composé pour éviter les doublons
inscriptionSchema.index({ apprenantId: 1, formationId: 1 });

// Méthode pour vérifier si une inscription est active
inscriptionSchema.methods.isActive = function() {
  return this.statut === 'Inscrit';
};

// Méthode pour vérifier si le paiement est effectué
inscriptionSchema.methods.isPaid = function() {
  return this.paiement === 'Payé';
};

// Méthode statique pour compter les inscriptions actives d'une formation
inscriptionSchema.statics.countActiveForFormation = async function(formationId) {
  return this.countDocuments({ 
    formationId, 
    statut: 'Inscrit' 
  });
};

// Méthode statique pour obtenir les formations d'un apprenant
inscriptionSchema.statics.getApprenantFormations = async function(apprenantId) {
  return this.find({ 
    apprenantId,
    statut: { $ne: 'Annulé' }
  }).populate('formationId');
};

// Hook pre-save pour validation supplémentaire
inscriptionSchema.pre('save', async function(next) {
  // Vérifier qu'on ne crée pas de doublon
  if (this.isNew) {
    const existing = await this.constructor.findOne({
      apprenantId: this.apprenantId,
      formationId: this.formationId,
      statut: { $ne: 'Annulé' }
    });
    
    if (existing) {
      throw new Error('Cet apprenant est déjà inscrit à cette formation');
    }
  }
  
  next();
});

// Virtuel pour afficher le nom complet
inscriptionSchema.virtual('displayName').get(function() {
  if (this.apprenantId && this.formationId) {
    return `${this.apprenantId.nom} ${this.apprenantId.prenom} - ${this.formationId.titre}`;
  }
  return 'Inscription';
});

// S'assurer que les virtuels sont inclus dans JSON
inscriptionSchema.set('toJSON', { virtuals: true });
inscriptionSchema.set('toObject', { virtuals: true });

// Vérifier si le modèle existe déjà pour éviter l'erreur de réécrasement
module.exports = mongoose.models.Inscription || mongoose.model('Inscription', inscriptionSchema);