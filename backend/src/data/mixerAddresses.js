/**
 * Dummy list of known mixer / tumbler addresses.
 */
const MIXER_ADDRESSES = {
  ethereum: [
    "0xmixer00000000000000000000000000000001",
    "0xmixer00000000000000000000000000000002",
    "0x12d66f87d1f9d0297a58c18559eaa7269a5c5c40",
    "0x47ce0c6ed5b0ce3d3a0afd4e6d2d8e8b8b8b8b8b",
  ],
  bitcoin: [
    "bc1qmixer000000000000000000000000000001",
    "3Mixer00000000000000000000000000000001",
  ],
  solana: [
    "Mixer1111111111111111111111111111111111",
    "Mixer2222222222222222222222222222222222",
  ],
};

function getMixerAddresses(chain) {
  return MIXER_ADDRESSES[chain] || [];
}

function isMixerAddress(address, chain) {
  const list = getMixerAddresses(chain);
  const normalized = chain === "ethereum" ? address.toLowerCase() : address;
  return list.some((a) => {
    const cmp = chain === "ethereum" ? a.toLowerCase() : a;
    return cmp === normalized;
  });
}

module.exports = { MIXER_ADDRESSES, getMixerAddresses, isMixerAddress };
