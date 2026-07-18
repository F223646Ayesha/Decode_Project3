const express = require('express');
const Book = require('../models/Book');
const protect = require('../middleware/auth');

const router = express.Router();

// CREATE  -> POST /api/books
router.post('/', protect, async (req, res) => {
  try {
    const { title, author, isbn, publishedYear, genres } = req.body;
    const book = await Book.create({
      title,
      author,
      isbn,
      publishedYear,
      genres, // array of Genre ObjectIds
      addedBy: req.userId,
    });
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// READ ALL -> GET /api/books  (supports ?genre=<id> and ?author=<name> filters)
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.genre) filter.genres = req.query.genre;
  if (req.query.author) filter.author = new RegExp(req.query.author, 'i');

  const books = await Book.find(filter)
    .populate('genres', 'name')
    .populate('addedBy', 'username')
    .sort('-createdAt');
  res.json(books);
});

// READ ONE -> GET /api/books/:id  (with reviews populated)
router.get('/:id', async (req, res) => {
  const book = await Book.findById(req.params.id)
    .populate('genres', 'name')
    .populate('addedBy', 'username')
    .populate({ path: 'reviews', populate: { path: 'user', select: 'username' } });

  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
});

// UPDATE -> PUT /api/books/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, author, isbn, publishedYear, genres } = req.body;
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, isbn, publishedYear, genres },
      { new: true, runValidators: true }
    );
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE -> DELETE /api/books/:id
router.delete('/:id', protect, async (req, res) => {
  const book = await Book.findByIdAndDelete(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json({ message: 'Book deleted' });
});

module.exports = router;
