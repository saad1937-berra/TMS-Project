const express = require('express');
const multer = require('multer');
const path = require('path');
const Formation = require('../models/Formation');
const Formateur = require('../models/Formateur');
const fs = require('fs');

const router = express.Router();

// S'assurer que le dossier uploads existe
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = 'formation_' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Middleware pour gérer les erreurs multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Fichier trop volumineux (max 5MB)' });
    }
    return res.status(400).json({ message: 'Erreur lors du téléchargement du fichier: ' + err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// GET all formations
router.get('/', async (req, res) => {
  try {
    const formations = await Formation.find().populate('formateurId');
    res.json(formations);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET single formation
router.get('/:id', async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id).populate('formateurId');
    if (!formation) return res.status(404).json({ message: 'Formation non trouvée' });
    res.json(formation);
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST create formation
router.post('/', upload.single('imageFormation'), async (req, res) => {
  try {
    console.log('=== DÉBUT CREATION FORMATION ===');
    console.log('Body reçu:', req.body);
    console.log('Fichier reçu:', req.file);
    
    const { 
      titre, 
      description, 
      categorie, 
      dureeHeures, 
      dateDebut, 
      dateFin, 
      niveau, 
      formateurId, 
      capacite 
    } = req.body;
    
    // Validation des champs requis
    if (!titre || !description || !categorie || !dureeHeures || !dateDebut || !dateFin || !niveau || !formateurId || !capacite) {
      console.log('❌ Champ manquant');
      const missing = [];
      if (!titre) missing.push('titre');
      if (!description) missing.push('description');
      if (!categorie) missing.push('categorie');
      if (!dureeHeures) missing.push('dureeHeures');
      if (!dateDebut) missing.push('dateDebut');
      if (!dateFin) missing.push('dateFin');
      if (!niveau) missing.push('niveau');
      if (!formateurId) missing.push('formateurId');
      if (!capacite) missing.push('capacite');
      
      return res.status(400).json({ 
        message: 'Tous les champs obligatoires doivent être remplis',
        missingFields: missing
      });
    }
    
    // Vérifier si le formateur existe
    console.log('Recherche formateur ID:', formateurId);
    const formateur = await Formateur.findById(formateurId);
    if (!formateur) {
      console.log('❌ Formateur non trouvé');
      return res.status(400).json({ message: 'Formateur non trouvé' });
    }
    console.log('✅ Formateur trouvé:', formateur.nom);

    // Construire l'objet formation
    const formationData = {
      titre,
      description,
      categorie,
      dureeHeures: parseInt(dureeHeures),
      dateDebut: new Date(dateDebut),
      dateFin: new Date(dateFin),
      niveau,
      formateurId,
      capacite: parseInt(capacite)
    };

    // Ajouter l'image si elle existe
    if (req.file) {
      console.log('✅ Fichier image reçu:', req.file.filename);
      formationData.imageFormation = req.file.filename;
    } else {
      console.log('ℹ️ Aucun fichier image');
    }

    console.log('Données formation:', formationData);
    
    const formation = new Formation(formationData);
    console.log('Sauvegarde formation...');
    
    const newFormation = await formation.save();
    console.log('✅ Formation sauvegardée:', newFormation._id);
    
    const populatedFormation = await Formation.findById(newFormation._id).populate('formateurId');
    console.log('✅ Formation peuplée');
    
    return res.status(201).json(populatedFormation);
  } catch (err) {
    console.error('❌ Error creating formation:', err);
    console.error('Stack:', err.stack);
    
    if (err.name === 'ValidationError') {
      console.error('Erreurs de validation:', Object.values(err.errors));
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    if (err.message.includes('La date de fin doit être postérieure')) {
      return res.status(400).json({ 
        message: err.message 
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'Une formation avec ce titre existe déjà' 
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        message: `ID invalide pour ${err.path}: ${err.value}`
      });
    }
    
    return res.status(500).json({ 
      message: 'Erreur serveur lors de la création de la formation',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// PUT update formation
router.put('/:id', upload.single('imageFormation'), async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id);
    if (!formation) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }

    const updateData = { ...req.body };
    
    // Convertir les nombres
    if (updateData.dureeHeures) updateData.dureeHeures = parseInt(updateData.dureeHeures);
    if (updateData.capacite) updateData.capacite = parseInt(updateData.capacite);
    
    // Convertir les dates
    if (updateData.dateDebut) updateData.dateDebut = new Date(updateData.dateDebut);
    if (updateData.dateFin) updateData.dateFin = new Date(updateData.dateFin);
    
    // Vérifier le formateur
    if (updateData.formateurId) {
      const formateur = await Formateur.findById(updateData.formateurId);
      if (!formateur) {
        return res.status(400).json({ message: 'Formateur non trouvé' });
      }
    }
    
    // Gérer l'image
    if (req.file) {
      // Supprimer l'ancienne image si elle existe
      if (formation.imageFormation) {
        const oldImagePath = path.join(uploadDir, formation.imageFormation);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.imageFormation = req.file.filename;
    }

    const updatedFormation = await Formation.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('formateurId');
    
    return res.json(updatedFormation);
  } catch (err) {
    console.error('Error updating formation:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    return res.status(500).json({ 
      message: 'Erreur serveur lors de la mise à jour',
      error: err.message 
    });
  }
});

// DELETE formation
router.delete('/:id', async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id);
    if (!formation) return res.status(404).json({ message: 'Formation non trouvée' });
    
    // Supprimer l'image associée si elle existe
    if (formation.imageFormation) {
      const imagePath = path.join(uploadDir, formation.imageFormation);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Formation.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Formation supprimée' });
  } catch (err) {
    return res.status(500).json({ 
      message: 'Erreur serveur lors de la suppression',
      error: err.message 
    });
  }
});

module.exports = router;