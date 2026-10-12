Auth.require(); UI.nav();
const $ = (id) => document.getElementById(id), E = UI.esc;
const ids = ['q', 'position', 'category', 'status', 'minExp', 'minScore', 'maxScore', 'sort'];
function showState(msg) { $('state').hidden = !msg; $('state').textContent = msg || ''; }
async function loadStats() {
  try {
    const s = await Api.stats(), c = s.byCategory || {}, max = Math.max(1, ...s.distribution.map((d) => d.count));
    $('stats').innerHTML = [['Total applications', s.total], ['Average score', s.averageScore], ['Priority candidates', c.Priority || 0], ['Recommended', c.Recommended || 0], ['To review', c['To Review'] || 0]]
      .map(([l, v]) => `<div class="card stat"><b>${v}</b><span>${l}</span></div>`).join('');
    $('dist').innerHTML = s.distribution.map((d) => `<div><span>${d.count}</span><i style="height:${(d.count / max) * 80}%"></i><span>${d.range}</span></div>`).join('');
  } catch (e) { UI.toast(e.message, false); }
}
async function loadRows() {
  const p = new URLSearchParams(); ids.forEach((i) => $(i).value && p.set(i, $(i).value));
  $('rows').innerHTML = ''; showState('Loading candidates…');
  try {
    const { items } = await Api.candidates(p.toString());
    if (!items.length) return showState('No candidates match these filters.');
    showState('');
    $('rows').innerHTML = items.map((c, i) => `<tr><td class="num">${i + 1}</td><td><b>${E(c.firstName)} ${E(c.lastName)}</b><br><small class="muted">${E(c.email)}</small></td><td>${E(c.desiredPosition)}</td>
      <td class="num">${c.experienceYears} yr</td><td class="num">${c.scoreBreakdown?.skills ?? 0}/30</td><td class="num"><b>${c.score}</b></td><td>${UI.badge(c.category)}</td><td><span class="badge">${E(c.status)}</span></td>
      <td>${UI.date(c.createdAt)}</td><td><a class="link" href="candidate.html?id=${E(c._id)}">View</a></td></tr>`).join('');
  } catch (e) { showState('Could not load candidates: ' + e.message); }
}
let t; ids.forEach((i) => $(i).addEventListener(i === 'q' ? 'input' : 'change', () => { clearTimeout(t); t = setTimeout(loadRows, 250); }));
Api.positions().then((p) => p.forEach((x) => $('position').insertAdjacentHTML('beforeend', `<option>${E(x)}</option>`))).catch(() => {});
loadStats(); loadRows();
