const { safeGet } = require("../utils/httpClient");

const KNOWN_NAMES = {
  "vitalik.eth": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "ethereum.eth": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "nick.eth": "0xb8c2C29ee19D8307cb3f379e5Ad9eB2BFC02976",
};

function isEnsName(input) {
  const trimmed = input.trim().toLowerCase();
  return trimmed.endsWith(".eth") || /^[a-z0-9-]+$/i.test(trimmed) && !trimmed.startsWith("0x");
}

function normalizeEnsName(input) {
  const trimmed = input.trim().toLowerCase();
  return trimmed.endsWith(".eth") ? trimmed : `${trimmed}.eth`;
}

async function resolveEnsName(name) {
  const normalized = normalizeEnsName(name);

  if (KNOWN_NAMES[normalized]) {
    return { address: KNOWN_NAMES[normalized], resolvedName: normalized };
  }

  const ensData = await safeGet(`https://api.ensdata.net/${normalized}`);
  if (ensData?.address) {
    return { address: ensData.address, resolvedName: normalized };
  }

  const enstate = await safeGet(
    `https://enstate.org/api/resolve?name=${encodeURIComponent(normalized)}`
  );
  if (enstate?.address) {
    return { address: enstate.address, resolvedName: normalized };
  }

  throw new Error(
    `ENS name "${normalized}" could not be resolved. Use a full wallet address instead.`
  );
}

async function resolveWalletInput(input) {
  const trimmed = input.trim();

  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return { address: trimmed, resolvedName: null };
  }

  if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(trimmed)) {
    return { address: trimmed, resolvedName: null };
  }

  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) {
    return { address: trimmed, resolvedName: null };
  }

  if (isEnsName(trimmed)) {
    return resolveEnsName(trimmed);
  }

  throw new Error(
    "Invalid input. Use wallet address (0x..., bc1..., Solana) or ENS name (e.g. vitalik.eth)"
  );
}

module.exports = { resolveWalletInput, isEnsName, resolveEnsName };
