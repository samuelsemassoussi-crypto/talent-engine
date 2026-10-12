(function () {
  const { API_URL } = window.TE_CONFIG;
  const token = () => localStorage.getItem('te_token');
  async function request(path, { method = 'GET', body, form } = {}) {
    const headers = {};
    if (token()) headers.Authorization = 'Bearer ' + token();
    if (body) headers['Content-Type'] = 'application/json';
    let res;
    try {
      res = await fetch(API_URL + path, { method, headers, body: form || (body ? JSON.stringify(body) : undefined) });
    } catch { throw new Error('Cannot reach the server. Is the API running?'); }
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && token()) { Auth.logout(); }
    if (!res.ok) { const e = new Error(data.errors ? data.errors.join(' · ') : data.message || 'Request failed'); e.status = res.status; throw e; }
    return data;
  }
  window.Api = {
    request,
    login: (b) => request('/api/auth/login', { method: 'POST', body: b }),
    register: (b) => request('/api/auth/register', { method: 'POST', body: b }),
    me: () => request('/api/auth/me'),
    apply: (formData) => request('/api/candidates', { method: 'POST', form: formData }),
    candidates: (qs = '') => request('/api/candidates' + (qs ? '?' + qs : '')),
    candidate: (id) => request('/api/candidates/' + id),
    setStatus: (id, status) => request('/api/candidates/' + id + '/status', { method: 'PATCH', body: { status } }),
    remove: (id) => request('/api/candidates/' + id, { method: 'DELETE' }),
    stats: () => request('/api/dashboard/stats'),
    positions: () => request('/api/candidates/meta/positions'),
  };
})();
