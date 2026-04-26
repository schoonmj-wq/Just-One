# Just One — Online Multiplayer

A real-time online version of the party game **Just One**, built with React, Firebase Realtime Database, and deployable to Vercel.

---

## Setup Guide

### Step 1 — Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `just-one-game` → Create
3. In the left sidebar: **Build → Realtime Database → Create database**
   - Choose your region (US Central is fine)
   - Start in **Test mode** (we'll lock it down after)
4. In the left sidebar: **Project Settings** (gear icon) → **Your apps** → click **</>** (Web)
   - Register the app (nickname: `just-one-web`)
   - Copy the `firebaseConfig` object — you'll need all 7 values
5. **Set security rules**: In Realtime Database → Rules tab, paste the contents of `database.rules.json` and publish

### Step 2 — GitHub Setup

1. Create a new repo on GitHub (e.g. `just-one-game`) — make it public or private
2. In your terminal (or GitHub Desktop):
   ```bash
   cd just-one
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/just-one-game.git
   git push -u origin main
   ```

### Step 3 — Vercel Deployment

1. Go to [vercel.com](https://vercel.com) and click **Add New Project**
2. Import your GitHub repo
3. Framework: **Create React App** (auto-detected)
4. **Environment Variables** — add all 7 Firebase values:
   - `REACT_APP_FIREBASE_API_KEY`
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`
   - `REACT_APP_FIREBASE_DATABASE_URL`
   - `REACT_APP_FIREBASE_PROJECT_ID`
   - `REACT_APP_FIREBASE_STORAGE_BUCKET`
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
   - `REACT_APP_FIREBASE_APP_ID`
5. Click **Deploy** — Vercel builds and gives you a live URL

### Step 4 — Play!

- Share the URL with friends
- One person creates a room → shares the 4-letter code or link
- Everyone joins from their phones
- Host starts the game

---

## How to Play

1. **Guesser** closes their eyes (honor system)
2. Everyone else types **one word** as a clue for the secret word
3. **Duplicate clues are eliminated** — the guesser never sees them
4. Guesser sees the surviving clues and makes **one guess**
5. Score a point for each correct guess!

---

## Local Development

```bash
# Install dependencies
npm install

# Copy env file and fill in your Firebase values
cp .env.example .env.local

# Start dev server
npm start
```

---

## Tech Stack

- **React** — UI
- **Firebase Realtime Database** — live sync across all players
- **Vercel** — hosting + auto-deploy on git push
- **Anthropic Claude API** — validates clues (AI-powered)
