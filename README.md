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

## Client setup

1. In a separate terminal, install the client dependencies:
   ```bash
   cd client
   npm install
   ```
2. Copy `.env.example` to `.env` if you need to use an API URL other than the default:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

Open the URL printed by Vite, usually `http://localhost:5173`. Run the server and client in separate terminals.

## Production build

```bash
cd client
npm run build
```
