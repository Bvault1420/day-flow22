const { safeGet } = require("../../utils/httpClient");
const { isScamAddress } = require("../../data/scamAddresses");
const { isMixerAddress } = require("../../data/mixerAddresses");

async function fetchAddressData(address) {
  const data = await safeGet(`https://blockchain.info/rawaddr/${address}`);
  if (data) return data;

  const mempool = await safeGet(
    `https://mempool.space/api/address/${address}`
  );
  if (mempool) {
    return {
      n_tx: (mempool.chain_stats?.tx_count || 0) + (mempool.mempool_stats?.tx_count || 0),
      txs: [],
    };
  }

  return { n_tx: 0, txs: [] };
}

function detectRiskyPatterns(txs) {
  const smallTransfers = txs.filter((tx) => {
    const totalOut = tx.out?.reduce((sum, o) => sum + o.value, 0) || 0;
    return totalOut > 0 && totalOut < 100000;
  });

  return {
    manySmallTransfers: smallTransfers.length >= 5,
    smallTransferCount: smallTransfers.length,
  };
}

function detectNftWashTrading() {
  return false;
}

function countScamExposure(address, txs) {
  if (isScamAddress(address, "bitcoin")) return 1;

  let exposure = 0;
  for (const tx of txs) {
    for (const input of tx.inputs || []) {
      const prevOut = input.prev_out;
      if (prevOut?.addr && isScamAddress(prevOut.addr, "bitcoin")) exposure++;
    }
    for (const out of tx.out || []) {
      if (out.addr && isScamAddress(out.addr, "bitcoin")) exposure++;
    }
  }
  return exposure;
}

function detectMixerUsage(address, txs) {
  if (isMixerAddress(address, "bitcoin")) return true;

  for (const tx of txs) {
    for (const input of tx.inputs || []) {
      const prevOut = input.prev_out;
      if (prevOut?.addr && isMixerAddress(prevOut.addr, "bitcoin")) return true;
    }
    for (const out of tx.out || []) {
      if (out.addr && isMixerAddress(out.addr, "bitcoin")) return true;
    }
  }
  return false;
}

async function analyzeBitcoinWallet(address) {
  if (!/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address)) {
    throw new Error("Invalid Bitcoin address format");
  }

  const data = await fetchAddressData(address);
  const txs = data.txs || [];

  return {
    chain: "bitcoin",
    wallet: address,
    txCount: data.n_tx || txs.length,
    scamExposure: countScamExposure(address, txs),
    mixerUsage: detectMixerUsage(address, txs),
    riskyPatterns: detectRiskyPatterns(txs),
    nftWashTrading: detectNftWashTrading(),
  };
}

module.exports = { analyzeBitcoinWallet };
