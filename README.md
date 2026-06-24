# AeroMetric — Intelligent Weather Analytics Platform

A full stack weather analytics platform built with React, TypeScript and Express.js that provides real-time weather intelligence using live API data, interactive dashboards and AI-assisted weather insights.

---

## Live Demo

**Deployed Application:** https://aerometric-44mx.onrender.com

---

## Features

* Real-time weather retrieval using OpenWeather API
* Automatic geolocation based weather detection
* City-based weather search functionality
* 12-hour dynamic weather forecast dashboard
* 5-day weather forecasting with precipitation probability
* Air Quality Index (AQI) monitoring
* UV Index analysis and outdoor safety recommendations
* Wind speed and atmospheric condition monitoring
* AI-powered weather insights and activity recommendations
* Backend API caching to reduce repeated API requests

---

## Tech Stack

### Frontend

* React.js
* TypeScript
* Tailwind CSS
* Vite

### Backend

* Node.js
* Express.js

### APIs

* OpenWeather API

### Deployment

* Render

---

## System Architecture

```text
User Interface (React + TypeScript)
            ↓
Frontend State Management
            ↓
Express.js Backend API Layer
            ↓
Weather Processing Engine
            ↓
OpenWeather API Integration
            ↓
Caching Layer (15-minute request cache)
```

---

## Project Structure

```text
AeroMetric/
│
├── src/
│   ├── components/
│   ├── utils/
│   ├── types.ts
│   └── App.tsx
│
├── server.ts
├── package.json
├── vite.config.ts
└── README.md
```

---

## Environment Variables

Create a `.env` file:

```env
OPENWEATHER_API_KEY=your_api_key_here
```

---

## Run Locally

Install dependencies

```bash
npm install
```

Start development server

```bash
npm run dev
```

Build production version

```bash
npm run build
```

---

## Engineering Highlights

* Built full stack architecture using React + Express
* Implemented backend caching layer for API optimization
* Designed modular weather dashboard components
* Processed live weather, AQI, UV and forecast data dynamically
* Optimized API usage to reduce unnecessary repeated requests

---

## Future Improvements

* Interactive weather map integration
* Dynamic animated weather backgrounds
* Enhanced AI weather assistant
* PDF weather report export
* Micro animations and improved chart interactions

---

## Author

Kushal Berad
