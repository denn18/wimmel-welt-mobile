# Kleine Welt Backend Snapshot

This directory contains a snapshot of the Kleine Welt backend that can be run locally for development.

## Required services and environment
- MongoDB instance reachable via `MONGO_DB_URL` (preferred) or `MONGODB_URI`. You can set an optional `MONGO_DB_NAME` when the database name is not included in the URI.
- File storage defaults to S3. Set `FILE_STORAGE_MODE=local` (as in the provided `.env`) to avoid AWS credentials during local work. For S3, configure `AWS_S3_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY`.
- The API listens on `PORT` (defaults to `2000`).

Create a local `.env` next to this README (loaded automatically by `src/config/load-env.js`). An example with local defaults is already provided in `.env.example`; this repository also includes a ready-to-edit `.env` for convenience.

## Installation
Install the backend dependencies in this folder:

```bash
npm install
```

A working connection to `registry.npmjs.org` (respecting any required proxy settings) is necessary; otherwise installation will fail (e.g., with HTTP 403 errors for packages).

## Running the backend locally
Start the API with nodemon for local development:

```bash
npm run dev
```

The server boots via `src/server.js`, loads environment variables from `./.env`, and binds to port `2000` unless overridden. Ensure `MONGO_DB_URL` points to a reachable database before starting; without it the server logs a warning and will not connect to MongoDB.
