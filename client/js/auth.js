window.Auth = {
  save(r) { localStorage.setItem('te_token', r.token); localStorage.setItem('te_user', JSON.stringify(r.user)); },
  user() { try { return JSON.parse(localStorage.getItem('te_user')); } catch { return null; } },
  isLoggedIn() { return !!localStorage.getItem('te_token'); },
  logout() { localStorage.removeItem('te_token'); localStorage.removeItem('te_user'); location.href = 'login.html'; },
  require() { if (!Auth.isLoggedIn()) location.replace('login.html'); },
};
// Landing: swap "Recruiter Login" for "Dashboard" when a session exists
document.querySelectorAll('[data-auth-link]').forEach((a) => {
  if (Auth.isLoggedIn()) { a.href = 'dashboard.html'; a.textContent = 'Dashboard'; }
});

// Login / register form handler (shared by login.html and register.html)
(function () {
  const form = document.getElementById('auth-form'); if (!form) return;
  if (Auth.isLoggedIn()) { location.replace('dashboard.html'); return; }
  const msg = document.getElementById('msg'), btn = document.getElementById('submit');
  const isRegister = !!form.accessCode;
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); msg.hidden = true;
    const d = Object.fromEntries(new FormData(form));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email || '')) return show('Please enter a valid email.');
    if (!d.password || (isRegister && d.password.length < 8)) return show(isRegister ? 'Password must be at least 8 characters.' : 'Password is required.');
    if (isRegister && (!d.name.trim() || !d.accessCode)) return show('Name and access code are required.');
    btn.disabled = true; const label = btn.textContent; btn.textContent = 'Please wait…';
    try { Auth.save(await (isRegister ? Api.register(d) : Api.login(d))); location.href = 'dashboard.html'; }
    catch (err) { show(err.message); btn.disabled = false; btn.textContent = label; }
  });
  function show(t) { msg.className = 'alert alert-error'; msg.textContent = t; msg.style.marginBottom = '16px'; msg.hidden = false; }
})();
