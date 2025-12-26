const mongoose = require('mongoose');

const formationSchema = new mongoose.Schema({
  titre: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  categorie: { 
    type: String, 
    required: true 
  },
  dureeHeures: { 
    type: Number, 
    required: true,
    min: 1 
  },
  dateDebut: { 
    type: Date, 
    required: true 
  },
  dateFin: { 
    type: Date, 
    required: true 
  },
  niveau: { 
    type: String, 
    enum: ['Débutant', 'Intermédiaire', 'Avancé'], 
    required: true 
  },
  imageFormation: { 
    type: String 
  },
  formateurId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Formateur', 
    required: true 
  },
  capacite: { 
    type: Number, 
    required: true,
    min: 1 
  }
}, { 
  timestamps: true 
});

// Validation pour s'assurer que dateFin > dateDebut
formationSchema.pre('save', function(next) {
  if (this.dateFin <= this.dateDebut) {
    next(new Error('La date de fin doit être postérieure à la date de début'));
  }
  next();
});

module.exports = mongoose.model('Formation', formationSchema);