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
  nom: { 
    type: String, 
    required: [true, 'Le nom est obligatoire'],
    trim: true
  },
  prenom: { 
    type: String, 
    required: [true, 'Le prénom est obligatoire'],
    trim: true
  },
  dateNaissance: { 
    type: Date, 
    required: [true, 'La date de naissance est obligatoire']
  },
  age: { 
    type: Number, 
    required: [true, 'L\'âge est obligatoire'],
    min: 16,
    max: 100
  },
  email: { 
    type: String, 
    required: [true, 'L\'email est obligatoire'], 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  telephone: { 
    type: String,
    trim: true
  },
  adresse: {
    rue: String,
    ville: String,
    codePostal: String,
    pays: String
  },
  niveauEtude: { 
    type: String 
  },
  profession: { 
    type: String 
  },
  photo: { 
    type: String, 
    required: [true, 'La photo est obligatoire']
  },
  statut: {
    type: String,
    enum: ['Actif', 'Inactif'],
    default: 'Actif'
  },
  formationsInscrites: [inscriptionSchema]
}, { 
  timestamps: true 
});

// Calculer l'âge automatiquement si non fourni
apprenantSchema.pre('save', function(next) {
  if (this.dateNaissance && !this.age) {
    const today = new Date();
    const birthDate = new Date(this.dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    this.age = age;
  }
  next();
});

// Export sécurisé pour éviter l'erreur OverwriteModelError
module.exports = mongoose.models.Apprenant || mongoose.model('Apprenant', apprenantSchema);