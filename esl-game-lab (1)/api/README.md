# ESL Game Lab API

Backend API server for ESL Game Lab. This service handles all Gemini API interactions securely, keeping API keys server-side.

## Features

- **POST /api/recommendations** - Get game recommendations based on filters
- **POST /api/game-detail** - Get detailed game instructions
- **POST /api/image-proxy/generate** - Generate images (placeholder for now)
- **GET /health** - Health check endpoint

## Local Development

### Prerequisites

- Node.js 18+
- Gemini API key from https://ai.google.dev/

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Add your Gemini API key to `.env`:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

### Running

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server runs on port 8080 by default.

## Docker Build

```bash
docker build -t esl-game-lab-api .
docker run -p 8080:8080 -e GEMINI_API_KEY=your_key esl-game-lab-api
```

## Deployment

Automatically deployed to Google Cloud Run via GitHub Actions when pushing to main branch.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `SYSTEM_INSTRUCTION` | System instruction for Gemini | No (has default) |
| `PORT` | Server port | No (default: 8080) |
