const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      maxlength: 120,
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true, // allows multiple docs without an isbn
      trim: true,
    },
    publishedYear: {
      type: Number,
      min: [1450, 'Published year looks invalid'],
      max: [new Date().getFullYear(), 'Published year cannot be in the future'],
    },
    // Many-to-Many: a book can belong to many genres, a genre has many books
    genres: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre',
      },
    ],
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Virtual 1:Many link to Reviews (a book has many reviews)
bookSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'book',
});

bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Book', bookSchema);
