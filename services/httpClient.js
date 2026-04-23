// services/httpClient.js
// ============================================================
// Cliente HTTP reutilizable para consumir APIs externas
// Centraliza: fetch + headers + error handling
// ============================================================

/**
 * Realiza un GET a la URL indicada
 * @param {string} url
 * @returns {Promise<any>} - JSON parseado
 */
async function apiGet(url) {
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.substring(0, 200)}`);
  }
  return res.json();
}

/**
 * Realiza un POST con body JSON
 * @param {string} url
 * @param {object} body
 * @returns {Promise<any>} - JSON parseado
 */
async function apiPost(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    let message;
    try {
      const parsed = JSON.parse(text);
      message = parsed.message || parsed.error || text;
    } catch {
      message = text.substring(0, 200);
    }
    throw new Error(`HTTP ${res.status}: ${message}`);
  }
  return res.json();
}

/**
 * Realiza un PUT con body JSON
 * @param {string} url
 * @param {object} body
 * @returns {Promise<any>} - JSON parseado
 */
async function apiPut(url, body) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.substring(0, 200)}`);
  }
  return res.json();
}

/**
 * Realiza un DELETE
 * @param {string} url
 * @returns {Promise<any>} - JSON parseado
 */
async function apiDelete(url) {
  const res = await fetch(url, { 
    method: 'DELETE',
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.substring(0, 200)}`);
  }
  return res.json();
}

module.exports = { apiGet, apiPost, apiPut, apiDelete };
