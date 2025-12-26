const express = require('express');
const multer = require('multer');
const path = require('path');
const Formation = require('../models/Formation');
const Formateur = require('../models/Formateur');

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/formations/'); // Changé pour un dossier spécifique
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (jpeg, jpg, png)'));
    }
  }
});

// GET all formations
router.get('/', async (req, res) => {
  try {
    const formations = await Formation.find().populate('formateurId');
    res.json(formations);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET single formation
router.get('/:id', async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id).populate('formateurId');
    if (!formation) return res.status(404).json({ message: 'Formation non trouvée' });
    res.json(formation);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST create formation
router.post('/', upload.single('imageFormation'), async (req, res) => {
  try {
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
    
    // Vérifier si le formateur existe
    const formateur = await Formateur.findById(formateurId);
    if (!formateur) {
      return res.status(400).json({ message: 'Formateur non trouvé' });
    }

    const formation = new Formation({
      titre,
      description,
      categorie,
      dureeHeures: parseInt(dureeHeures),
      dateDebut: new Date(dateDebut),
      dateFin: new Date(dateFin),
      niveau,
      formateurId,
      capacite: parseInt(capacite),
      imageFormation: req.file ? req.file.filename : null
    });

    const newFormation = await formation.save();
    const populatedFormation = await Formation.findById(newFormation._id).populate('formateurId');
    
    res.status(201).json(populatedFormation);
  } catch (err) {
    console.error('Error creating formation:', err);
    
    if (err.name === 'ValidationError') {
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
    
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT update formation
router.put('/:id', upload.single('imageFormation'), async (req, res) => {
  try {
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
      updateData.imageFormation = req.file.filename;
    }

    const formation = await Formation.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('formateurId');
    
    if (!formation) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }
    
    res.json(formation);
  } catch (err) {
    console.error('Error updating formation:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE formation
router.delete('/:id', async (req, res) => {
  try {
    const formation = await Formation.findByIdAndDelete(req.params.id);
    if (!formation) return res.status(404).json({ message: 'Formation non trouvée' });
    res.json({ message: 'Formation supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;