const $ = (i) => document.getElementById(i), E = UI.esc, MAX_MB = 5;
const HINTS = { 'Full Stack Developer': 'HTML, CSS, JavaScript, React, Node.js, MongoDB', 'Frontend Developer': 'HTML, CSS, JavaScript, React, TypeScript, Tailwind CSS', 'Backend Developer': 'Node.js, Express, MongoDB, REST API, JWT, Docker', 'Data Analyst': 'SQL, Excel, Python, Power BI, Statistics' };
const LANGS = ['English', 'French', 'Spanish', 'German', 'Portuguese', 'Arabic'], LEVELS = ['basic', 'intermediate', 'fluent', 'native'];
let step = 1, file = null;
function addLang(n = 'English', l = 'intermediate') {
  const r = document.createElement('div'); r.className = 'lang-row';
  r.innerHTML = `<select aria-label="Language">${LANGS.map((x) => `<option ${x === n ? 'selected' : ''}>${x}</option>`).join('')}</select><select aria-label="Level">${LEVELS.map((x) => `<option ${x === l ? 'selected' : ''}>${x}</option>`).join('')}</select><button type="button" class="btn btn-outline btn-sm" aria-label="Remove">&times;</button>`;
  r.querySelector('button').onclick = () => r.remove(); $('langs').appendChild(r);
}
const langs = () => [...document.querySelectorAll('.lang-row')].map((r) => { const s = r.querySelectorAll('select'); return { name: s[0].value, level: s[1].value }; });
const skills = () => [...new Set($('skills').value.split(',').map((s) => s.trim()).filter(Boolean))];
function validate(n) {
  const e = [], v = (i) => $(i).value.trim();
  if (n === 1) {
    ['firstName', 'lastName', 'country', 'city'].forEach((i) => !v(i) && e.push(`${$(i).previousElementSibling.textContent} is required.`));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) e.push('Enter a valid email address.');
    if (!v('phone')) e.push('Phone is required.');
  }
  if (n === 2) {
    if (!v('desiredPosition')) e.push('Select a desired position.');
    const x = Number(v('experienceYears')); if (v('experienceYears') === '' || Number.isNaN(x) || x < 0 || x > 60) e.push('Experience must be a number between 0 and 60.');
    if (!v('education')) e.push('Select an education level.'); if (!skills().length) e.push('Enter at least one skill.'); if (!v('availability')) e.push('Select your availability.');
  }
  return e;
}
function setFile(f) {
  if (f && f.type !== 'application/pdf') { $('cv').value = ''; return err(['Only PDF files are allowed.']); }
  if (f && f.size > MAX_MB * 1048576) { $('cv').value = ''; return err([`The CV must be under ${MAX_MB} MB.`]); }
  file = f || null; $('fileBox').hidden = !file; if (file) $('fileInfo').textContent = `${file.name} · ${(file.size / 1048576).toFixed(2)} MB`; err([]);
}
function err(list) { $('err').hidden = !list.length; $('err').innerHTML = list.map(E).join('<br>'); }
function show(n) {
  step = n; document.querySelectorAll('.step').forEach((s) => (s.hidden = +s.dataset.step !== n));
  document.querySelectorAll('.stepper li').forEach((li) => li.classList.toggle('on', +li.dataset.s <= n));
  $('back').hidden = n === 1; $('next').hidden = n === 4; $('submit').hidden = n !== 4; err([]);
  if (n === 4) $('sum').innerHTML = [['Name', `${$('firstName').value} ${$('lastName').value}`], ['Email', $('email').value], ['Phone', $('phone').value], ['Location', `${$('city').value}, ${$('country').value}`], ['Position', $('desiredPosition').value],
    ['Experience', $('experienceYears').value + ' years'], ['Education', $('education').selectedOptions[0].text], ['Skills', skills().join(', ')], ['Languages', langs().map((l) => `${l.name} (${l.level})`).join(', ') || '—'], ['Availability', $('availability').selectedOptions[0].text], ['CV', file ? file.name : 'None']]
    .map(([k, v]) => `<dt>${k}</dt><dd>${E(v)}</dd>`).join('');
}
$('next').onclick = () => { const e = validate(step); e.length ? err(e) : show(step + 1); };
$('back').onclick = () => show(step - 1);
$('addLang').onclick = () => addLang(); addLang('English', 'intermediate');
$('desiredPosition').onchange = () => ($('hint').textContent = HINTS[$('desiredPosition').value] ? 'Suggested for this role: ' + HINTS[$('desiredPosition').value] : '');
$('cv').onchange = (e) => setFile(e.target.files[0]); $('rm').onclick = () => { $('cv').value = ''; setFile(null); };
$('f').onsubmit = async (ev) => {
  ev.preventDefault(); const e = [...validate(1), ...validate(2)]; if (e.length) return err(e);
  const fd = new FormData();
  ['firstName', 'lastName', 'email', 'phone', 'country', 'city', 'desiredPosition', 'experienceYears', 'education', 'field', 'availability'].forEach((i) => fd.append(i, $(i).value.trim()));
  fd.append('skills', JSON.stringify(skills())); fd.append('languages', JSON.stringify(langs())); if (file) fd.append('cv', file);
  $('submit').disabled = true; $('submit').textContent = 'Submitting…';
  try {
    await Api.apply(fd);
    $('box').innerHTML = '<span class="eyebrow">Application received</span><h1>Thank you.</h1><div class="alert alert-success">Your application has been successfully submitted.</div><p style="margin-top:20px"><a class="btn btn-outline" href="index.html">Back to home</a></p>';
  } catch (x) { err([x.message]); $('submit').disabled = false; $('submit').textContent = 'Submit application'; }
};
