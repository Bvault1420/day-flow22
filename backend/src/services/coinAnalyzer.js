const { aggregateCoinData } = require("../pipeline/aggregator");

async function analyzeCoin(input) {
  return aggregateCoinData(input);
}

module.exports = { analyzeCoin };
