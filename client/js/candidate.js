Auth.require(); UI.nav();
const E = UI.esc, id = new URLSearchParams(location.search).get('id'), root = document.getElementById('content');
const MAX = { experience: 25, skills: 30, education: 15, languages: 10, availability: 10, completeness: 10 };
const EDU = { phd: 'PhD', master: "Master's", bachelor: "Bachelor's", highschool: 'High school', other: 'Other' };
const AV = { immediate: 'Immediate', '1_month': 'Within 1 month', '3_months': 'Within 3 months', later: 'More than 3 months' };
const STATUSES = ['New', 'Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Hired'];
const kv = (o) => `<dl class="kv">${o.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
async function load() {
  if (!id) return (root.innerHTML = '<div class="alert alert-error">Missing candidate id.</div>');
  try { render(await Api.candidate(id)); } catch (e) { root.innerHTML = `<div class="alert alert-error">${E(e.message)}</div>`; }
}
function render(c) {
  const b = c.scoreBreakdown || {};
  root.innerHTML = `
  <div class="page-head"><div><h2>${E(c.firstName)} ${E(c.lastName)}</h2><p class="muted">${E(c.desiredPosition)}</p></div>
    <div style="display:flex;gap:10px;align-items:center"><select id="status" aria-label="Status" style="width:auto">${STATUSES.map((s) => `<option ${s === c.status ? 'selected' : ''}>${s}</option>`).join('')}</select>
    <button class="btn btn-outline btn-sm" id="del">Delete</button></div></div>
  <div class="detail"><div>
    <div class="card"><h3>Personal information</h3><br>${kv([['Email', E(c.email)], ['Phone', E(c.phone || '—')], ['Location', E([c.city, c.country].filter(Boolean).join(', ') || '—')]])}</div>
    <div class="card"><h3>Professional profile</h3><br>${kv([['Desired position', E(c.desiredPosition)], ['Experience', c.experienceYears + ' years'], ['Education', EDU[c.education] || '—'], ['Field', E(c.field || '—')], ['Availability', AV[c.availability] || '—'], ['Applied', UI.date(c.createdAt)]])}</div>
    <div class="card"><h3>Skills</h3><br><div class="chips">${(c.skills || []).map((s) => `<span class="badge">${E(s)}</span>`).join('') || '—'}</div><br><h3>Languages</h3><br><div class="chips">${(c.languages || []).map((l) => `<span class="badge">${E(l.name)} · ${E(l.level)}</span>`).join('') || '—'}</div></div>
    <div class="card"><h3>CV</h3><br>${c.cvUrl ? '<button class="btn btn-outline btn-sm" id="cv">View CV</button>' : '<span class="muted">No CV uploaded.</span>'}</div>
  </div><div>
    <div class="card"><h3>Talent score</h3><div class="big-score">${c.score}<small class="muted" style="font-size:1rem"> / 100</small></div><div class="progress" style="margin:10px 0 18px"><span style="width:${c.score}%"></span></div>
      ${Object.keys(MAX).map((k) => `<div class="bar-row"><div><span style="text-transform:capitalize">${k}</span><b>${b[k] ?? 0}/${MAX[k]}</b></div><div class="progress"><span style="width:${((b[k] || 0) / MAX[k]) * 100}%"></span></div></div>`).join('')}</div>
    <div class="card"><h3>Why this candidate?</h3><ul class="why">${(c.scoreReasons || []).map((r) => `<li>${E(r)}</li>`).join('')}</ul><p>Recommendation: <b>${E(c.recommendation)}</b> ${UI.badge(c.category)}</p></div>
  </div></div>`;
  document.getElementById('status').onchange = async (e) => {
    try { await Api.setStatus(id, e.target.value); UI.toast('Status updated'); } catch (err) { UI.toast(err.message, false); e.target.value = c.status; }
  };
  document.getElementById('del').onclick = () => confirmDelete(c);
  const cv = document.getElementById('cv'); if (cv) cv.onclick = () => openCv(c.cvUrl);
}
async function openCv(url) {
  const w = window.open('', '_blank');
  try {
    const r = await fetch(window.TE_CONFIG.API_URL + url, { headers: { Authorization: 'Bearer ' + localStorage.getItem('te_token') } });
    if (!r.ok) throw new Error('CV file not found (demo candidates have no real PDF).');
    w.location = URL.createObjectURL(await r.blob());
  } catch (e) { w && w.close(); UI.toast(e.message, false); }
}
function confirmDelete(c) {
  const m = document.createElement('div'); m.className = 'modal-backdrop';
  m.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><h3>Delete candidate?</h3><p class="muted" style="margin:8px 0 20px">${E(c.firstName)} ${E(c.lastName)} and their CV will be permanently removed.</p><div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-outline btn-sm" id="no">Cancel</button><button class="btn btn-primary btn-sm" id="yes">Delete</button></div></div>`;
  document.body.appendChild(m);
  m.querySelector('#no').onclick = () => m.remove();
  m.querySelector('#yes').onclick = async (e) => { e.target.disabled = true; try { await Api.remove(id); location.href = 'dashboard.html'; } catch (err) { UI.toast(err.message, false); m.remove(); } };
}
load();
