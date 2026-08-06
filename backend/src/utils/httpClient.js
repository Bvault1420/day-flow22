const axios = require("axios");

const DEFAULT_TIMEOUT = 15000;

async function safeGet(url, options = {}) {
  try {
    const { data } = await axios.get(url, {
      timeout: DEFAULT_TIMEOUT,
      ...options,
    });
    return data;
  } catch (error) {
    console.warn(`GET ${url} failed:`, error.message);
    return null;
  }
}

async function safePost(url, body, options = {}) {
  try {
    const { data } = await axios.post(url, body, {
      timeout: DEFAULT_TIMEOUT,
      ...options,
    });
    return data;
  } catch (error) {
    console.warn(`POST ${url} failed:`, error.message);
    return null;
  }
}

module.exports = { safeGet, safePost };
