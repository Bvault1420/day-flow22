const SCAM = {
  ethereum: ["0xdead000000000000000000000000000000dead", "0xbad000000000000000000000000000000000bad"],
  bitcoin: ["1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2"],
  solana: ["11111111111111111111111111111111"],
};

function isScam(addr, chain) {
  const list = SCAM[chain] || [];
  const n = chain === "ethereum" ? addr.toLowerCase() : addr;
  return list.some((a) => (chain === "ethereum" ? a.toLowerCase() : a) === n);
}

module.exports = { isScam };
