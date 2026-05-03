# OracleDivine — BaZi Four Pillars of Destiny

A web application for BaZi (八字 / Four Pillars of Destiny) fortune telling, featuring authentic Chinese metaphysical calculations with an ancient Chinese aesthetic UI.

## Features

- **BaZi Chart Calculation** — Accurate four pillars based on birth date, time, and true solar time correction
- **10 Gods Analysis** — Life analysis across personality, career, wealth, relationships
- **Five Elements Distribution** — Visualized Wood, Fire, Earth, Metal, Water scoring
- **Da Yun (大运)** — 10-year fortune cycles with start age calculation
- **Liunian (流年)** — Current year fortune analysis
- **English First** — UI defaults to English with Chinese toggle
- **Ancient Chinese Aesthetic** — Traditional vertical chart layout, ink-and-paper color scheme
- **True Solar Time** — Longitude-based time correction for accurate hour pillar

## Tech Stack

| Layer     | Technology            |
|-----------|-----------------------|
| Backend   | Node.js + Express     |
| Engine    | lunar-javascript (6tail) |
| Frontend  | Vanilla HTML + CSS + JS |
| Design    | Pure CSS, no frameworks |

## Quick Start

```bash
npm install
cd server && npm install && cd ..
npm run dev
```

Open http://localhost:3001

## API

### POST /api/bazi/calculate

```json
{
  "year": 1990,
  "month": 1,
  "day": 1,
  "hour": 5,
  "minute": 30,
  "gender": "male",
  "tzOffset": 8,
  "lng": 120,
  "lat": 30
}
```

## Project Structure

```
oracle-divine/
├── server/                  # Backend API
│   ├── src/
│   │   ├── index.js         # Express entry (port 3001)
│   │   ├── routes/bazi.js   # API routes
│   │   ├── services/
│   │   │   ├── bazi.js      # Core BaZi engine
│   │   │   ├── calendar.js  # True solar time
│   │   │   ├── analysis.js  # Life analysis
│   │   │   └── fortune.js   # Da Yun / Liunian
│   │   └── constants.js     # Lookup tables
│   └── package.json
├── public/                  # Static frontend
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── app.js
│       ├── api.js
│       └── i18n.js
├── package.json
└── README.md
```

## Roadmap

- [x] BaZi chart calculation
- [x] 10 Gods analysis
- [x] Five Elements scoring
- [x] Da Yun (10-year cycles)
- [x] Liunian (annual fortune)
- [x] True solar time correction
- [x] English + Chinese i18n
- [ ] LLM-powered natural language interpretation (v2)
- [ ] I Ching hexagram reference (v2)