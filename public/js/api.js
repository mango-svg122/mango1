const api = (() => {
  const BASE = '/api/bazi';

  async function calculate(data) {
    const res = await fetch(`${BASE}/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  return { calculate };
})();