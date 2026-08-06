# Wallet Reputation Score

Crypto Wallet & Coin Risiko-Analyse — lokal auf localhost.

## Schnellstart (ein Befehl)

```bash
npm install
npm run install:all
npm run dev
```

Dann öffnen: **http://localhost:3000**

- Backend API: http://localhost:3001
- Frontend UI: http://localhost:3000

## Manuell (2 Terminals)

```bash
# Terminal 1 — Backend
cd backend && npm install && npm run dev

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev:clean
```

## Fehler „Cannot find module ./682.js“?

Das ist ein kaputter Next.js Cache. Fix:

```bash
npm run clean
cd frontend && npm run dev:clean
```

Oder komplett neu:

```bash
rm -rf frontend/.next frontend/node_modules/.cache
cd frontend && npm run dev
```

## Ports

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:3001 |
| API Docs | http://localhost:3001/api/docs |

## Features

- Wallet Scan (Adresse, ENS-Name, BTC, Solana)
- Coin Scan (Symbol, Name, Contract)
- Multi-Source Pipeline (CoinGecko, DexScreener, DefiLlama, …)
- Score 0–100 mit Risiko-Level
