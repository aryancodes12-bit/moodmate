# MoodMate — Setup Guide

## Step 1 — Install dependencies
```bash
npm install
npm install express cors concurrently
```

## Step 2 — Get FREE Groq API Key
1. Go to https://console.groq.com/
2. Sign up (free, no credit card)
3. Click "API Keys" → "Create API Key"
4. Copy the key

## Step 3 — Add key to .env file
Open `.env` and replace `your_groq_api_key_here`:
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxx
```

## Step 4 — Run the app
```bash
npm run dev
```

Opens at: http://localhost:3000 ✅

---

**How it works:** React (port 3000) → Express proxy (port 3001) → Groq API
Your API key stays safe on the server, browser never sees it.
