// js/login.js

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMsg = document.getElementById('errorMsg');

  // Demo user database: username => { password, role }
  const demoUsers = {
    'ppc': { password: 'ppc123', role: 'PPC' },
    'cs': { password: 'cs123', role: 'CS' },
    'manager': { password: 'manager123', role: 'MANAGER' }
  };

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    errorMsg.textContent = '';  // Clear previous errors

    const username = document.getElementById('username').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    if (!username || !password) {
      errorMsg.textContent = 'Please fill in both fields.';
      return;
    }

    const user = demoUsers[username];
    if (!user || user.password !== password) {
      errorMsg.textContent = 'Invalid credentials. Please check username and password.';
      return;
    }

    // Save user info in session storage and redirect to dashboard
    sessionStorage.setItem('userRole', user.role);
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('loginTime', new Date().toISOString());
    
    // Show success message briefly before redirect
    errorMsg.className = 'text-green-500 text-sm text-center';
    errorMsg.textContent = 'Login successful! Redirecting...';
    
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
  });

  // Check if user is already logged in
  const existingRole = sessionStorage.getItem('userRole');
  if (existingRole) {
    window.location.href = 'dashboard.html';
  }
});
