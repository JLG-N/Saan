# Saan

## My project repository

- Public repository: https://github.com/JLG-N/Saan
- Live app (if deployed): https://saan-ka.onrender.com

## What it is

Saan is a web app for discovering cafés, restaurants, bars, bakeries, and bookstores around Angeles City, then organizing them into shareable outing itineraries. It helps people find places, read and write reviews, and plan where to go with friends or family.

## How to run it

1. Clone the repository and move into it:
   ```bash
   git clone https://github.com/JLG-N/Saan.git
   cd Saan
   ```

2. Create a Supabase project and run the SQL schema in `backend/schema.sql` from the Supabase SQL editor.

3. Copy the example environment file and fill in your values:
   ```bash
   cp backend/.env.example backend/.env
   ```

   Example `.env` values:
   ```dotenv
   DATABASE_URL=postgresql://myuser:mypassword@myhost:6543/postgres
   JWT_SECRET=replace-with-a-random-32-byte-secret
   PORT=3001
   CORS_ORIGIN=http://localhost:5173
   ```

4. Install dependencies:
   ```bash
   cd backend
   npm ci
   cd ../frontend
   npm ci
   ```

5. Seed the database with sample spots:
   ```bash
   cd ../backend
   npm run seed
   ```

6. Start the backend API in one terminal:
   ```bash
   cd backend
   npm start
   ```

7. Start the frontend app in another terminal:
   ```bash
   cd frontend
   npm run dev
   ```

8. Open the local frontend URL shown by Vite (typically `http://localhost:5173`) and create an account to begin using the app.

## Presentation

- Video (public Google Drive link): https://drive.google.com/drive/folders/1D12TUqHBrfbroLoVoob9sEYz1vqmHros
- Slides (link or PDF)
- Square image: see [the Saan sign-in screenshot](docs/screenshots/sign-in.png).

## AI usage

Link to the AI usage document in the project repository:
https://github.com/JLG-N/Saan/blob/main/AI-USAGE.md
