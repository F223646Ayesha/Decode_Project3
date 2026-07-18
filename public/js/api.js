const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('bt_token');
}

function setSession(token, user) {
  localStorage.setItem('bt_token', token);
  localStorage.setItem('bt_user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('bt_token');
  localStorage.removeItem('bt_user');
}

function getUser() {
  const raw = localStorage.getItem('bt_user');
  return raw ? JSON.parse(raw) : null;
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

function renderNavUser() {
  const el = document.getElementById('navUser');
  if (!el) return;
  const user = getUser();
  if (user) {
    el.innerHTML = `Hi, ${user.username} | <a href="#" id="logoutLink">Logout</a>`;
    document.getElementById('logoutLink').addEventListener('click', (e) => {
      e.preventDefault();
      clearSession();
      window.location.href = 'index.html';
    });
  } else {
    el.innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', renderNavUser);
