const mongoose = require('mongoose');

// 1:1 relationship: each User has exactly one Profile.
const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // enforces the "exactly one" side of 1:1
    },
    bio: {
      type: String,
      maxlength: 300,
      default: '',
    },
    favoriteGenre: {
      type: String,
      trim: true,
      default: '',
    },
    booksReadGoal: {
      type: Number,
      min: [0, 'Goal cannot be negative'],
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
