const express = require('express');
const Inscription = require('../models/Inscription');
const Formation = require('../models/Formation');
const Apprenant = require('../models/Apprenant');

const router = express.Router();

// GET all inscriptions
router.get('/', async (req, res) => {
  try {
    const inscriptions = await Inscription.find().populate('apprenantId').populate('formationId');
    res.json(inscriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single inscription
router.get('/:id', async (req, res) => {
  try {
    const inscription = await Inscription.findById(req.params.id).populate('apprenantId').populate('formationId');
    if (!inscription) return res.status(404).json({ message: 'Inscription not found' });
    res.json(inscription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create inscription
router.post('/', async (req, res) => {
  try {
    const { apprenantId, formationId } = req.body;

    // Check if apprenant exists
    const apprenant = await Apprenant.findById(apprenantId);
    if (!apprenant) return res.status(400).json({ message: 'Apprenant not found' });

    // Check if formation exists
    const formation = await Formation.findById(formationId);
    if (!formation) return res.status(400).json({ message: 'Formation not found' });

    // Check for duplicate inscription
    const existingInscription = await Inscription.findOne({ apprenantId, formationId });
    if (existingInscription) return res.status(400).json({ message: 'Apprenant already inscribed in this formation' });

    // Check capacity
    const inscriptionCount = await Inscription.countDocuments({ formationId, statut: 'Inscrit' });
    if (inscriptionCount >= formation.capacite) return res.status(400).json({ message: 'Formation is full' });

    const inscription = new Inscription({
      apprenantId,
      formationId
    });

    const newInscription = await inscription.save();
    res.status(201).json(newInscription);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE inscription (cancel)
router.delete('/:id', async (req, res) => {
  try {
    const inscription = await Inscription.findByIdAndDelete(req.params.id);
    if (!inscription) return res.status(404).json({ message: 'Inscription not found' });
    res.json({ message: 'Inscription cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET inscriptions for a formation
router.get('/formation/:formationId', async (req, res) => {
  try {
    const inscriptions = await Inscription.find({ formationId: req.params.formationId }).populate('apprenantId');
    res.json(inscriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET inscriptions for an apprenant
router.get('/apprenant/:apprenantId', async (req, res) => {
  try {
    const inscriptions = await Inscription.find({ apprenantId: req.params.apprenantId }).populate('formationId');
    res.json(inscriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
