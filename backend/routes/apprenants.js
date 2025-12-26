const express = require('express');
const multer = require('multer');
const path = require('path');
const Apprenant = require('../models/Apprenant');
const Formation = require('../models/Formation');

const router = express.Router();

// Configuration de multer pour l'upload des photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
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
      limit = 10, 
      search, 
      statut,
      niveauEtude,
      ville 
    } = req.query;
    
    const query = {};
    
    // Recherche par nom, prénom ou email
    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { prenom: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (statut) query.statut = statut;
    if (niveauEtude) query.niveauEtude = niveauEtude;
    if (ville) query['adresse.ville'] = ville;
    
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
    res.status(500).json({ message: 'Erreur serveur' });
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
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST créer un nouvel apprenant
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const {
      nom,
      prenom,
      email,
      telephone,
      dateNaissance,
      adresse,
      niveauEtude,
      profession,
      statut
    } = req.body;
    
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
    
    const apprenant = new Apprenant({
      nom,
      prenom,
      email,
      telephone,
      dateNaissance: new Date(dateNaissance),
      adresse: adresseObj,
      niveauEtude,
      profession,
      statut: statut || 'Actif',
      photo: req.file ? req.file.filename : null
    });
    
    const newApprenant = await apprenant.save();
    res.status(201).json(newApprenant);
  } catch (err) {
    console.error('Error creating apprenant:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    res.status(500).json({ message: 'Erreur serveur' });
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
    
    // Parser l'adresse si nécessaire
    if (updateData.adresse) {
      try {
        updateData.adresse = typeof updateData.adresse === 'string' 
          ? JSON.parse(updateData.adresse) 
          : updateData.adresse;
      } catch (e) {
        // Garder tel quel si ce n'est pas du JSON valide
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
    
    res.status(500).json({ message: 'Erreur serveur' });
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
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE supprimer définitivement un apprenant
router.delete('/:id/permanent', async (req, res) => {
  try {
    const apprenant = await Apprenant.findByIdAndDelete(req.params.id);
    
    if (!apprenant) {
      return res.status(404).json({ message: 'Apprenant non trouvé' });
    }
    
    res.json({ message: 'Apprenant supprimé définitivement' });
  } catch (err) {
    console.error('Error deleting apprenant:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST inscrire un apprenant à une formation
router.post('/:id/inscrire', async (req, res) => {
  try {
    const { formationId } = req.body;
    
    // Vérifier si l'apprenant existe
    const apprenant = await Apprenant.findById(req.params.id);
    if (!apprenant) {
      return res.status(404).json({ message: 'Apprenant non trouvé' });
    }
    
    // Vérifier si la formation existe
    const formation = await Formation.findById(formationId);
    if (!formation) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }
    
    // Vérifier si l'apprenant est déjà inscrit
    const dejaInscrit = apprenant.formationsInscrites.some(
      inscription => inscription.formation.toString() === formationId
    );
    
    if (dejaInscrit) {
      return res.status(400).json({ message: 'Apprenant déjà inscrit à cette formation' });
    }
    
    // Ajouter l'inscription
    apprenant.formationsInscrites.push({
      formation: formationId,
      dateInscription: new Date(),
      statut: 'Inscrit'
    });
    
    await apprenant.save();
    
    res.json({
      message: 'Apprenant inscrit à la formation avec succès',
      inscription: apprenant.formationsInscrites[apprenant.formationsInscrites.length - 1]
    });
  } catch (err) {
    console.error('Error enrolling apprenant:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT mettre à jour le statut d'une inscription
router.put('/:id/inscriptions/:inscriptionId', async (req, res) => {
  try {
    const { statut } = req.body;
    
    const apprenant = await Apprenant.findById(req.params.id);
    if (!apprenant) {
      return res.status(404).json({ message: 'Apprenant non trouvé' });
    }
    
    const inscription = apprenant.formationsInscrites.id(req.params.inscriptionId);
    if (!inscription) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }
    
    inscription.statut = statut;
    
    if (statut === 'Terminé') {
      inscription.dateFin = new Date();
    }
    
    await apprenant.save();
    
    res.json({
      message: 'Statut de l\'inscription mis à jour',
      inscription
    });
  } catch (err) {
    console.error('Error updating enrollment:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET statistiques des apprenants
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Apprenant.aggregate([
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                actifs: { 
                  $sum: { $cond: [{ $eq: ['$statut', 'Actif'] }, 1, 0] } 
                },
                inactifs: { 
                  $sum: { $cond: [{ $eq: ['$statut', 'Inactif'] }, 1, 0] } 
                }
              }
            }
          ],
          niveauStats: [
            {
              $group: {
                _id: '$niveauEtude',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } }
          ],
          villeStats: [
            {
              $group: {
                _id: '$adresse.ville',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          inscriptionStats: [
            {
              $project: {
                month: { $month: '$dateInscription' },
                year: { $year: '$dateInscription' }
              }
            },
            {
              $group: {
                _id: { month: '$month', year: '$year' },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 }
          ]
        }
      }
    ]);
    
    const result = {
      total: stats[0]?.totalStats[0]?.total || 0,
      actifs: stats[0]?.totalStats[0]?.actifs || 0,
      inactifs: stats[0]?.totalStats[0]?.inactifs || 0,
      parNiveau: stats[0]?.niveauStats || [],
      parVille: stats[0]?.villeStats || [],
      inscriptionsMensuelles: stats[0]?.inscriptionStats || []
    };
    
    res.json(result);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;