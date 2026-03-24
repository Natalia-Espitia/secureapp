const statusEl = document.getElementById('status');

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.className = isError ? 'error' : 'ok';
}

function getApiBase() {
  return document.getElementById('apiBase').value.trim().replace(/\/$/, '');
}

async function callApi(path, payload) {
  const apiBase = getApiBase();
  const response = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => ({ message: 'No response body' }));

  if (!response.ok) {
    throw new Error(json.message || `Request failed with status ${response.status}`);
  }

  return json;
}

document.getElementById('registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('registerUser').value;
  const password = document.getElementById('registerPass').value;

  try {
    setStatus('Registering...');
    const result = await callApi('/api/auth/register', { username, password });
    setStatus(result.message);
  } catch (error) {
    setStatus(error.message, true);
  }
});

document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('loginUser').value;
  const password = document.getElementById('loginPass').value;

  try {
    setStatus('Logging in...');
    const result = await callApi('/api/auth/login', { username, password });
    setStatus(result.message);
  } catch (error) {
    setStatus(error.message, true);
  }
});
