const messageEl = document.getElementById('message');

function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.style.color = isError ? '#f85149' : '#3fb950';
}

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;

  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    setSession(data.token, data.user);
    showMessage('Account created! Redirecting...');
    setTimeout(() => (window.location.href = 'books.html'), 800);
  } catch (err) {
    showMessage(err.message, true);
  }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setSession(data.token, data.user);
    showMessage('Logged in! Redirecting...');
    setTimeout(() => (window.location.href = 'books.html'), 800);
  } catch (err) {
    showMessage(err.message, true);
  }
});
