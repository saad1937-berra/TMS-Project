const express = require('express');
const multer = require('multer');
const path = require('path');
const Apprenant = require('../models/Apprenant');

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

// GET all apprenants
router.get('/', async (req, res) => {
  try {
    const apprenants = await Apprenant.find();
    res.json(apprenants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single apprenant
router.get('/:id', async (req, res) => {
  try {
    const apprenant = await Apprenant.findById(req.params.id);
    if (!apprenant) return res.status(404).json({ message: 'Apprenant not found' });
    res.json(apprenant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create apprenant
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { nom, prenom, dateNaissance, age, email, niveauEtude } = req.body;
    const apprenant = new Apprenant({
      nom,
      prenom,
      dateNaissance,
      age,
      email,
      niveauEtude,
      photo: req.file.filename
    });

    const newApprenant = await apprenant.save();
    res.status(201).json(newApprenant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update apprenant
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const { nom, prenom, dateNaissance, age, email, niveauEtude } = req.body;
    const updateData = {
      nom,
      prenom,
      dateNaissance,
      age,
      email,
      niveauEtude
    };

    if (req.file) {
      updateData.photo = req.file.filename;
    }

    const apprenant = await Apprenant.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!apprenant) return res.status(404).json({ message: 'Apprenant not found' });
    res.json(apprenant);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE apprenant
router.delete('/:id', async (req, res) => {
  try {
    const apprenant = await Apprenant.findByIdAndDelete(req.params.id);
    if (!apprenant) return res.status(404).json({ message: 'Apprenant not found' });
    res.json({ message: 'Apprenant deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
