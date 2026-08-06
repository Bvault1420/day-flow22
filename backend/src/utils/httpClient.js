const axios = require("axios");

const TIMEOUT = 15000;
const cache = new Map();
const TTL = 120000;

async function safeGet(url, opts = {}) {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.t < TTL) return cached.d;

  for (let i = 0; i < 3; i++) {
    try {
      const { data } = await axios.get(url, { timeout: TIMEOUT, ...opts });
      cache.set(url, { d: data, t: Date.now() });
      return data;
    } catch (e) {
      if (i === 2) return null;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  return null;
}

module.exports = { safeGet };
