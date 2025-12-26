const express = require('express');
const multer = require('multer');
const path = require('path');
const Formation = require('../models/Formation');
const Formateur = require('../models/Formateur');

const router = express.Router();

// Configure multer for image upload
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
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
});

// GET all formations
router.get('/', async (req, res) => {
  try {
    const formations = await Formation.find().populate('formateurId');
    res.json(formations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single formation
router.get('/:id', async (req, res) => {
  try {
    const formation = await Formation.findById(req.params.id).populate('formateurId');
    if (!formation) return res.status(404).json({ message: 'Formation not found' });
    res.json(formation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create formation
router.post('/', upload.single('imageFormation'), async (req, res) => {
  try {
    const { titre, description, categorie, dureeHeures, dateDebut, dateFin, niveau, formateurId, capacite } = req.body;
    const formateur = await Formateur.findById(formateurId);
    if (!formateur) return res.status(400).json({ message: 'Formateur not found' });

    const formation = new Formation({
      titre,
      description,
      categorie,
      dureeHeures,
      dateDebut,
      dateFin,
      niveau,
      imageFormation: req.file ? req.file.filename : null,
      formateurId,
      capacite
    });

    const newFormation = await formation.save();
    res.status(201).json(newFormation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update formation
router.put('/:id', upload.single('imageFormation'), async (req, res) => {
  try {
    const { titre, description, categorie, dureeHeures, dateDebut, dateFin, niveau, formateurId, capacite } = req.body;
    const formateur = await Formateur.findById(formateurId);
    if (!formateur) return res.status(400).json({ message: 'Formateur not found' });

    const updateData = {
      titre,
      description,
      categorie,
      dureeHeures,
      dateDebut,
      dateFin,
      niveau,
      formateurId,
      capacite
    };

    if (req.file) {
      updateData.imageFormation = req.file.filename;
    }

    const formation = await Formation.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!formation) return res.status(404).json({ message: 'Formation not found' });
    res.json(formation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE formation
router.delete('/:id', async (req, res) => {
  try {
    const formation = await Formation.findByIdAndDelete(req.params.id);
    if (!formation) return res.status(404).json({ message: 'Formation not found' });
    res.json({ message: 'Formation deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
