const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const protect = require('../middleware/auth');

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ message: 'Username or email already in use' });
    }

    const user = await User.create({ username, email, password });
    // Automatically create the linked 1:1 profile
    await Profile.create({ user: user._id });

    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    // .select('+password') needed since schema hides it by default
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/auth/me  (Read own user + 1:1 profile populated)
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.userId).populate('profile');
  res.json(user);
});

// @route   PUT /api/auth/profile  (Update the 1:1 profile)
router.put('/profile', protect, async (req, res) => {
  try {
    const { bio, favoriteGenre, booksReadGoal } = req.body;
    const profile = await Profile.findOneAndUpdate(
      { user: req.userId },
      { bio, favoriteGenre, booksReadGoal },
      { new: true, runValidators: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
