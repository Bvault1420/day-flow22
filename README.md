# Wallet Reputation Score

A full-stack crypto wallet reputation scoring system — like a Schufa for crypto wallets.

## Tech Stack

- **Backend**: Node.js + Express (port 3001)
- **Frontend**: Next.js + React + TailwindCSS (port 3000)
- **API Client**: Axios
- **Database**: None (runtime only, browser localStorage for history)

## Quick Start

### Backend

```bash
cd backend
npm install
npm run dev
```

Runs on http://localhost:3001

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:3000

## API

### POST /api/scan-wallet

**Input:**
```json
{ "wallet": "0x123..." }
```

**Output:**
```json
{
  "score": 87,
  "riskLevel": "low",
  "details": {
    "scamExposure": 0,
    "mixerUsage": false,
    "txCount": 152,
    "nftWashTrading": false
  }
}
```

## Supported Wallets

- **Ethereum**: `0x` + 40 hex characters
- **Bitcoin**: `1...`, `3...`, or `bc1...` addresses
- **Solana**: Base58 addresses (32-44 chars)

## Risk Engine

Starting score: 100

| Condition | Penalty |
|-----------|---------|
| scamExposure > 0 | -40 |
| mixerUsage = true | -30 |
| txCount < 5 | -10 |
| nftWashTrading = true | -20 |
| manySmallTransfers | -15 |

Risk levels: Low (≥70), Medium (≥40), High (<40)
