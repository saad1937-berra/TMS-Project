const express = require('express');
const Inscription = require('../models/Inscription');
const Formation = require('../models/Formation');
const Apprenant = require('../models/Apprenant');

const router = express.Router();

console.log('✅ Route inscriptions chargée');

// GET all inscriptions
router.get('/', async (req, res) => {
  try {
    const inscriptions = await Inscription.find()
      .populate('apprenantId')
      .populate('formationId')
      .sort({ dateInscription: -1 });
    res.json(inscriptions);
  } catch (err) {
    console.error('Error fetching inscriptions:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET single inscription
router.get('/:id', async (req, res) => {
  try {
    const inscription = await Inscription.findById(req.params.id)
      .populate('apprenantId')
      .populate('formationId');
    
    if (!inscription) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }
    
    res.json(inscription);
  } catch (err) {
    console.error('Error fetching inscription:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST create inscription
router.post('/', async (req, res) => {
  try {
    const { apprenantId, formationId, statut, paiement } = req.body;

    console.log('Création inscription:', { apprenantId, formationId, statut, paiement });

    // Validation des champs requis
    if (!apprenantId || !formationId) {
      return res.status(400).json({ 
        message: 'L\'apprenant et la formation sont obligatoires' 
      });
    }

    // Vérifier si l'apprenant existe
    const apprenant = await Apprenant.findById(apprenantId);
    if (!apprenant) {
      return res.status(400).json({ message: 'Apprenant non trouvé' });
    }

    // Vérifier si la formation existe
    const formation = await Formation.findById(formationId);
    if (!formation) {
      return res.status(400).json({ message: 'Formation non trouvée' });
    }

    // Vérifier si l'apprenant est déjà inscrit à cette formation
    const existingInscription = await Inscription.findOne({ 
      apprenantId, 
      formationId,
      statut: { $ne: 'Annulé' } // Ignorer les inscriptions annulées
    });
    
    if (existingInscription) {
      return res.status(400).json({ 
        message: 'Cet apprenant est déjà inscrit à cette formation' 
      });
    }

    // Vérifier la capacité de la formation
    const inscriptionCount = await Inscription.countDocuments({ 
      formationId, 
      statut: 'Inscrit' 
    });
    
    if (inscriptionCount >= formation.capacite) {
      return res.status(400).json({ 
        message: 'La formation est complète (capacité maximale atteinte)' 
      });
    }

    // Créer l'inscription
    const inscriptionData = {
      apprenantId,
      formationId,
      statut: statut || 'Inscrit',
      paiement: paiement || 'Non payé'
    };

    const inscription = new Inscription(inscriptionData);
    const newInscription = await inscription.save();

    // Peupler les données avant de renvoyer
    const populatedInscription = await Inscription.findById(newInscription._id)
      .populate('apprenantId')
      .populate('formationId');

    console.log('Inscription créée avec succès:', populatedInscription._id);
    res.status(201).json(populatedInscription);

  } catch (err) {
    console.error('Error creating inscription:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        message: `ID invalide: ${err.value}` 
      });
    }
    
    res.status(500).json({ 
      message: 'Erreur lors de la création de l\'inscription',
      error: err.message 
    });
  }
});

// PUT update inscription (statut et paiement)
router.put('/:id', async (req, res) => {
  try {
    const { statut, paiement } = req.body;

    const inscription = await Inscription.findById(req.params.id);
    if (!inscription) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    const updateData = {};
    if (statut) updateData.statut = statut;
    if (paiement) updateData.paiement = paiement;

    const updatedInscription = await Inscription.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('apprenantId')
      .populate('formationId');

    res.json(updatedInscription);

  } catch (err) {
    console.error('Error updating inscription:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    res.status(500).json({ 
      message: 'Erreur lors de la mise à jour',
      error: err.message 
    });
  }
});

// DELETE inscription (suppression définitive)
router.delete('/:id', async (req, res) => {
  try {
    const inscription = await Inscription.findById(req.params.id);
    if (!inscription) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    await Inscription.findByIdAndDelete(req.params.id);
    res.json({ message: 'Inscription supprimée avec succès' });

  } catch (err) {
    console.error('Error deleting inscription:', err);
    res.status(500).json({ 
      message: 'Erreur lors de la suppression',
      error: err.message 
    });
  }
});

// GET inscriptions for a specific formation
router.get('/formation/:formationId', async (req, res) => {
  try {
    const inscriptions = await Inscription.find({ 
      formationId: req.params.formationId 
    })
      .populate('apprenantId')
      .populate('formationId')
      .sort({ dateInscription: -1 });
    
    res.json(inscriptions);
  } catch (err) {
    console.error('Error fetching inscriptions for formation:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET inscriptions for a specific apprenant
router.get('/apprenant/:apprenantId', async (req, res) => {
  try {
    const inscriptions = await Inscription.find({ 
      apprenantId: req.params.apprenantId 
    })
      .populate('apprenantId')
      .populate('formationId')
      .sort({ dateInscription: -1 });
    
    res.json(inscriptions);
  } catch (err) {
    console.error('Error fetching inscriptions for apprenant:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Inscription.countDocuments();
    const actives = await Inscription.countDocuments({ statut: 'Inscrit' });
    const terminees = await Inscription.countDocuments({ statut: 'Terminé' });
    const annulees = await Inscription.countDocuments({ statut: 'Annulé' });
    const payes = await Inscription.countDocuments({ paiement: 'Payé' });
    const nonPayes = await Inscription.countDocuments({ paiement: 'Non payé' });

    res.json({
      total,
      actives,
      terminees,
      annulees,
      payes,
      nonPayes
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;