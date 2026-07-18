const express = require('express');
const Genre = require('../models/Genre');
const protect = require('../middleware/auth');

const router = express.Router();

// CREATE
router.post('/', protect, async (req, res) => {
  try {
    const genre = await Genre.create({ name: req.body.name });
    res.status(201).json(genre);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// READ ALL
router.get('/', async (req, res) => {
  const genres = await Genre.find().sort('name');
  res.json(genres);
});

// READ ONE
router.get('/:id', async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(404).json({ message: 'Genre not found' });
  res.json(genre);
});

// UPDATE
router.put('/:id', protect, async (req, res) => {
  try {
    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true, runValidators: true }
    );
    if (!genre) return res.status(404).json({ message: 'Genre not found' });
    res.json(genre);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE
router.delete('/:id', protect, async (req, res) => {
  const genre = await Genre.findByIdAndDelete(req.params.id);
  if (!genre) return res.status(404).json({ message: 'Genre not found' });
  res.json({ message: 'Genre deleted' });
});

module.exports = router;
