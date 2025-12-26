const express = require('express');
const multer = require('multer');
const path = require('path');
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

// GET all formateurs
router.get('/', async (req, res) => {
  try {
    const formateurs = await Formateur.find();
    res.json(formateurs);
  } catch (err) {
    console.error('Database error:', err);
    // Return empty array if database is not available
    res.json([]);
  }
});

// GET single formateur
router.get('/:id', async (req, res) => {
  try {
    const formateur = await Formateur.findById(req.params.id);
    if (!formateur) return res.status(404).json({ message: 'Formateur not found' });
    res.json(formateur);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create formateur
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { nom, prenom, specialite, email, telephone, bio } = req.body;
    const formateur = new Formateur({
      nom,
      prenom,
      specialite,
      email,
      telephone,
      bio,
      photo: req.file.filename
    });

    const newFormateur = await formateur.save();
    res.status(201).json(newFormateur);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update formateur
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const { nom, prenom, specialite, email, telephone, bio } = req.body;
    const updateData = {
      nom,
      prenom,
      specialite,
      email,
      telephone,
      bio
    };

    if (req.file) {
      updateData.photo = req.file.filename;
    }

    const formateur = await Formateur.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!formateur) return res.status(404).json({ message: 'Formateur not found' });
    res.json(formateur);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE formateur
router.delete('/:id', async (req, res) => {
  try {
    const formateur = await Formateur.findByIdAndDelete(req.params.id);
    if (!formateur) return res.status(404).json({ message: 'Formateur not found' });
    res.json({ message: 'Formateur deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
