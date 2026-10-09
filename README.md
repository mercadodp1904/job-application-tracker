# Job Application Tracker

MERN monorepo with an Express/Mongoose API in `server/` and a Vite/React client in `client/`.

## Server setup

1. Install dependencies:
   ```bash
   cd server
   npm install
   ```
2. Copy `.env.example` to `.env` and set `MONGO_URI` to your MongoDB connection string.
3. Start the API in development mode:
   ```bash
   npm run dev
   ```

The API listens on `http://localhost:5000` by default. Check `GET /api/health` before using the application routes.
