const express = require('express');
const Review = require('../models/Review');
const protect = require('../middleware/auth');

const router = express.Router();

// CREATE -> POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { book, rating, comment } = req.body;
    const review = await Review.create({
      book,
      user: req.userId,
      rating,
      comment,
    });
    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You already reviewed this book' });
    }
    res.status(400).json({ message: err.message });
  }
});

// READ ALL -> GET /api/reviews (supports ?book=<id> filter)
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.book) filter.book = req.query.book;

  const reviews = await Review.find(filter)
    .populate('user', 'username')
    .populate('book', 'title')
    .sort('-createdAt');
  res.json(reviews);
});

// READ ONE -> GET /api/reviews/:id
router.get('/:id', async (req, res) => {
  const review = await Review.findById(req.params.id)
    .populate('user', 'username')
    .populate('book', 'title');
  if (!review) return res.status(404).json({ message: 'Review not found' });
  res.json(review);
});

// UPDATE -> PUT /api/reviews/:id  (only the review's author may edit)
router.put('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }

    review.rating = req.body.rating ?? review.rating;
    review.comment = req.body.comment ?? review.comment;
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE -> DELETE /api/reviews/:id (only the review's author may delete)
router.delete('/:id', protect, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Review not found' });
  if (review.user.toString() !== req.userId) {
    return res.status(403).json({ message: 'Not authorized to delete this review' });
  }
  await review.deleteOne();
  res.json({ message: 'Review deleted' });
});

module.exports = router;
