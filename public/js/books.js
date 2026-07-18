const bookList = document.getElementById('bookList');
const template = document.getElementById('bookCardTemplate');

async function ensureGenreIds(names) {
  const cleaned = names
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);
  if (cleaned.length === 0) return [];

  const existing = await apiFetch('/genres');
  const ids = [];
  for (const name of cleaned) {
    const found = existing.find((g) => g.name.toLowerCase() === name.toLowerCase());
    if (found) {
      ids.push(found._id);
    } else {
      const created = await apiFetch('/genres', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      ids.push(created._id);
    }
  }
  return ids;
}

async function loadBooks() {
  bookList.innerHTML = '<p>Loading books...</p>';
  try {
    const books = await apiFetch('/books');
    bookList.innerHTML = '';
    if (books.length === 0) {
      bookList.innerHTML = '<p>No books yet. Add the first one above.</p>';
      return;
    }
    books.forEach(renderBook);
  } catch (err) {
    bookList.innerHTML = `<p style="color:#f85149">${err.message}</p>`;
  }
}

function renderBook(book) {
  const node = template.content.cloneNode(true);
  node.querySelector('.b-title').textContent = book.title;
  node.querySelector('.b-author').textContent = `by ${book.author}`;
  node.querySelector('.b-genres').textContent = (book.genres || [])
    .map((g) => g.name)
    .join(', ') || 'No genres tagged';
  node.querySelector('.b-year').textContent = book.publishedYear
    ? `Published: ${book.publishedYear}`
    : '';

  const reviewsEl = node.querySelector('.b-reviews');
  reviewsEl.innerHTML = 'Loading reviews...';
  apiFetch(`/reviews?book=${book._id}`).then((reviews) => {
    reviewsEl.innerHTML = reviews.length
      ? reviews
          .map((r) => `⭐ ${r.rating} — ${r.comment || '(no comment)'} <em>(${r.user.username})</em>`)
          .join('<br/>')
      : 'No reviews yet.';
  });

  const reviewForm = node.querySelector('.review-form');
  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!getToken()) return alert('Please login to submit a review.');
    const rating = Number(reviewForm.querySelector('.rating').value);
    const comment = reviewForm.querySelector('.comment').value.trim();
    try {
      await apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({ book: book._id, rating, comment }),
      });
      loadBooks();
    } catch (err) {
      alert(err.message);
    }
  });

  node.querySelector('.delete-book').addEventListener('click', async () => {
    if (!getToken()) return alert('Please login to delete a book.');
    if (!confirm(`Delete "${book.title}"?`)) return;
    try {
      await apiFetch(`/books/${book._id}`, { method: 'DELETE' });
      loadBooks();
    } catch (err) {
      alert(err.message);
    }
  });

  bookList.appendChild(node);
}

document.getElementById('bookForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!getToken()) return alert('Please login first to add a book.');

  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const isbn = document.getElementById('isbn').value.trim();
  const publishedYear = document.getElementById('publishedYear').value;
  const genreNames = document.getElementById('genreNames').value;

  try {
    const genres = await ensureGenreIds(genreNames);
    await apiFetch('/books', {
      method: 'POST',
      body: JSON.stringify({
        title,
        author,
        isbn: isbn || undefined,
        publishedYear: publishedYear ? Number(publishedYear) : undefined,
        genres,
      }),
    });
    e.target.reset();
    loadBooks();
  } catch (err) {
    alert(err.message);
  }
});

loadBooks();
