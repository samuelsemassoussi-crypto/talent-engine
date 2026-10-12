window.UI = {
  esc: (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
  badge(c) { return `<span class="badge badge-${{ Priority: 'priority', Recommended: 'recommended', 'To Review': 'review', 'Low Match': 'low' }[c] || ''}">${UI.esc(c)}</span>`; },
  date: (d) => new Date(d).toLocaleDateString(),
  nav() {
    const u = Auth.user() || {};
    document.getElementById('nav').innerHTML = `<header class="site-header"><div class="container nav"><a class="brand" href="index.html"><img src="assets/logo.svg" alt="">Talent Engine</a>
    <nav class="nav-links"><a href="dashboard.html">Dashboard</a><a href="apply.html">Applications</a></nav>
    <div class="nav-actions"><span class="muted" style="align-self:center;font-size:.86rem">${UI.esc(u.name)}</span><button class="btn btn-outline btn-sm" id="logout">Log out</button></div></div></header>`;
    document.getElementById('logout').onclick = Auth.logout;
  },
  toast(msg, ok = true) {
    const t = document.createElement('div'); t.className = 'alert ' + (ok ? 'alert-success' : 'alert-error'); t.textContent = msg;
    t.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:60;max-width:360px;box-shadow:0 8px 24px rgba(16,24,40,.15)';
    document.body.appendChild(t); setTimeout(() => t.remove(), 4000);
  },
};
