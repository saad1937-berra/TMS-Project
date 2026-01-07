const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Apprenant = require('../models/Apprenant');
const Formation = require('../models/Formation');

const router = express.Router();


// Configuration de multer pour l'upload des photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const filename = 'apprenant_' + Date.now() + path.extname(file.originalname);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {

      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, webp)'));
    }
  }
});

// GET tous les apprenants avec filtres et pagination
router.get('/', async (req, res) => {
  try {
    
    const { 
      page = 1, 
      limit = 100,
      search, 
      statut 
    } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { prenom: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (statut) query.statut = statut;
    
    const apprenants = await Apprenant.find(query)
      .sort({ nom: 1, prenom: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('formationsInscrites.formation', 'titre categorie');
    
    const total = await Apprenant.countDocuments(query);
        
    res.json({
      apprenants,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalApprenants: total
    });
  } catch (err) {
    console.error('Error fetching apprenants:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET un apprenant spécifique
router.get('/:id', async (req, res) => {
  try {
    const apprenant = await Apprenant.findById(req.params.id)
      .populate('formationsInscrites.formation', 'titre categorie dateDebut dateFin niveau');
    
    if (!apprenant) {
      return res.status(404).json({ message: 'Apprenant non trouvé' });
    }
    
    res.json(apprenant);
  } catch (err) {
    console.error('Error fetching apprenant:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST créer un nouvel apprenant
router.post('/', (req, res, next) => {

  next();
}, upload.single('photo'), (req, res, next) => {

  next();
}, async (req, res) => {
  try {
    
    const {
      nom,
      prenom,
      email,
      telephone,
      dateNaissance,
      age,
      adresse,
      niveauEtude,
      profession,
      statut
    } = req.body;
    
    
    // Validation
    if (!nom || !prenom || !email || !dateNaissance || !age) {
      return res.status(400).json({ 
        message: 'Les champs nom, prénom, email, date de naissance et âge sont obligatoires',
        received: { nom, prenom, email, dateNaissance, age },
        bodyKeys: Object.keys(req.body)
      });
    }
    
    if (!req.file) {
      return res.status(400).json({ 
        message: 'La photo est obligatoire' 
      });
    }
    
    // Vérifier si l'email existe déjà
    const existingApprenant = await Apprenant.findOne({ email });
    if (existingApprenant) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    // Parser l'adresse si elle est une chaîne JSON
    let adresseObj = {};
    if (adresse) {
      try {
        adresseObj = typeof adresse === 'string' ? JSON.parse(adresse) : adresse;
      } catch (e) {
        adresseObj = { ville: adresse };
      }
    }
    
    const apprenantData = {
      nom,
      prenom,
      email,
      telephone,
      dateNaissance: new Date(dateNaissance),
      age: parseInt(age),
      adresse: adresseObj,
      niveauEtude,
      profession,
      statut: statut || 'Actif',
      photo: req.file.filename
    };
    
    
    const apprenant = new Apprenant(apprenantData);
    const newApprenant = await apprenant.save();
    
    
    res.status(201).json(newApprenant);
  } catch (err) {
    console.error('❌ Error creating apprenant:', err);
    console.error('Stack:', err.stack);
    
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      console.error('Erreurs de validation:', errors);
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors
      });
    }
    
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: err.message 
    });
  }
});

// PUT modifier un apprenant existant
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {

    
    const updateData = { ...req.body };
    
    // Convertir la date de naissance
    if (updateData.dateNaissance) {
      updateData.dateNaissance = new Date(updateData.dateNaissance);
    }
    
    // Convertir l'âge
    if (updateData.age) {
      updateData.age = parseInt(updateData.age);
    }
    
    // Parser l'adresse si nécessaire
    if (updateData.adresse) {
      try {
        updateData.adresse = typeof updateData.adresse === 'string' 
          ? JSON.parse(updateData.adresse) 
          : updateData.adresse;
      } catch (e) {
        // Garder tel quel
      }
    }
    
    // Gérer la photo
    if (req.file) {
      updateData.photo = req.file.filename;
    }
    
    // Vérifier l'unicité de l'email (sauf pour l'apprenant actuel)
    if (updateData.email) {
      const existingApprenant = await Apprenant.findOne({ 
        email: updateData.email, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingApprenant) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }
    
    const apprenant = await Apprenant.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!apprenant) {
      return res.status(404).json({ message: 'Apprenant non trouvé' });
    }
    
    res.json(apprenant);
  } catch (err) {
    console.error('Error updating apprenant:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: err.message 
    });
  }
});

// DELETE supprimer un apprenant (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const apprenant = await Apprenant.findByIdAndUpdate(
      req.params.id,
      { statut: 'Inactif' },
      { new: true }
    );
    
    if (!apprenant) {
      return res.status(404).json({ message: 'Apprenant non trouvé' });
    }
    
    res.json({ 
      message: 'Apprenant désactivé avec succès',
      apprenant 
    });
  } catch (err) {
    console.error('Error deleting apprenant:', err);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: err.message 
    });
  }
});

// GET statistiques des apprenants
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Apprenant.countDocuments();
    const actifs = await Apprenant.countDocuments({ statut: 'Actif' });
    const inactifs = await Apprenant.countDocuments({ statut: 'Inactif' });
    
    res.json({
      total,
      actifs,
      inactifs
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques:', err);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: err.message 
    });
  }
});

module.exports = router;