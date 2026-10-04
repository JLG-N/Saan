# Saan

A local venue-and-itinerary app for planning café and food stops across the city.

[![Made with AI](https://img.shields.io/badge/Made_with-AI_assistance-blue)](AI-USAGE.md)

This project used GitHub Copilot extensively for backend scaffolding and route-generation assistance. I authored the React frontend, set up the database schema and data flow, and verified the final app behavior. See [AI-USAGE.md](AI-USAGE.md) for the full disclosure.

## Project structure

- `frontend/` — React app and UI flows
- `backend/` — Express API, PostgreSQL access, and auth logic

## Run locally

```bash
cd backend
npm install
npm run seed
npm start

cd ../frontend
npm install
npm run dev
```

The frontend calls the backend at `http://localhost:3001/api`.
