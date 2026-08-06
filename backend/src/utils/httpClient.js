const axios = require("axios");

const DEFAULT_TIMEOUT = 20000;
const MAX_RETRIES = 3;
const cache = new Map();
const CACHE_TTL_MS = 180000; // 3 minutes

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.time < CACHE_TTL_MS) return entry.data;
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, time: Date.now() });
}

async function requestWithRetry(fn, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await fn();
      if (result != null) return result;
    } catch (error) {
      const status = error.response?.status;
      if (status === 429 && i < retries - 1) {
        await sleep(2000 * (i + 1));
        continue;
      }
      console.warn("Request failed:", error.message);
    }
    if (i < retries - 1) await sleep(1000 * (i + 1));
  }
  return null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function safeGet(url, options = {}) {
  const cached = getCached(url);
  if (cached) return cached;

  const data = await requestWithRetry(async () => {
    const { data: result } = await axios.get(url, {
      timeout: DEFAULT_TIMEOUT,
      ...options,
    });
    return result;
  });

  if (data) setCache(url, data);
  return data;
}

async function safePost(url, body, options = {}) {
  const cacheKey = `POST:${url}:${JSON.stringify(body)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const data = await requestWithRetry(async () => {
    const { data: result } = await axios.post(url, body, {
      timeout: DEFAULT_TIMEOUT,
      ...options,
    });
    return result;
  });

  if (data) setCache(cacheKey, data);
  return data;
}

module.exports = { safeGet, safePost };
