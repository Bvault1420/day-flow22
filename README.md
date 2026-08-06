# Wallet Reputation v2.0

Crypto Wallet & Coin Risiko-Analyse mit **Developer API**.

## Starten

```bash
npm install
npm run install:all
npm run dev
```

- Website: http://localhost:3000
- API: http://localhost:3001
- API Keys: http://localhost:3000/developer

## Developer API

1. Gehe zu `/developer` und erstelle einen API-Key
2. Nutze den Key in deiner App:

```bash
curl -H "X-API-Key: wrs_dein_key" http://localhost:3001/api/v1/coin/BTC
curl -H "X-API-Key: wrs_dein_key" http://localhost:3001/api/v1/wallet/vitalik.eth
```

## Security

- Helmet, Rate Limiting, Input Validation
- API Keys gehasht gespeichert (SHA-256)
- CORS nur für localhost:3000
