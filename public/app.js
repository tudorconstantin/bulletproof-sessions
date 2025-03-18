async function login(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password})
  });

  const result = await response.json();
  if (result.success) {
    window.location.href = '/dashboard.html';
  } else {
    alert(result.error);
  }
}

async function fetchDashboard() {
  const response = await fetch('/api/dashboard');
  const data = await response.json();
  document.getElementById('message').textContent = data.message;
}

document.getElementById('loginForm')?.addEventListener('submit', login);