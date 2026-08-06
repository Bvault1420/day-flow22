/**
 * Dummy list of known scam addresses across chains.
 * In production this would be sourced from threat-intel feeds.
 */
const SCAM_ADDRESSES = {
  ethereum: [
    "0x0000000000000000000000000000000000000000",
    "0xdead000000000000000000000000000000dead",
    "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",
    "0x1f9840a85d8a5b466d4e4e5d5e5e5e5e5e5e5e5e",
    "0xbad000000000000000000000000000000000bad",
  ],
  bitcoin: [
    "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",
    "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
    "bc1qxy2kgdygjrsqtzq2x0d5c4x8nh0q0q0q0q0q0",
  ],
  solana: [
    "11111111111111111111111111111111",
    "So11111111111111111111111111111111111111112",
    "BadScam1111111111111111111111111111111111",
  ],
};

function getScamAddresses(chain) {
  return SCAM_ADDRESSES[chain] || [];
}

function isScamAddress(address, chain) {
  const list = getScamAddresses(chain);
  const normalized = normalizeAddress(address, chain);
  return list.some((a) => normalizeAddress(a, chain) === normalized);
}

function normalizeAddress(address, chain) {
  if (chain === "ethereum") return address.toLowerCase();
  return address;
}

module.exports = { SCAM_ADDRESSES, getScamAddresses, isScamAddress, normalizeAddress };
