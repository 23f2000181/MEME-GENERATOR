# AI Meme Generator 🎨

A powerful meme generator powered by Google's Gemini 2.5 Flash and Nano Banana (Gemini 2.5 Flash Image) via **OpenRouter**. Create hilarious memes with AI assistance or full manual control!

## Features

### 🚀 Two Modes

**Auto Mode (✨):**
- Describe your meme idea in plain English
- AI generates a detailed, structured meme description
- Add custom captions with position control (top/bottom/center)
- Choose between AI-generated text or programmatic overlay
- Powered by Gemini 2.5 Flash for JSON generation → Nano Banana for image generation

**Manual Mode (⚡):**
- Full creative control with direct prompts
- Choose aspect ratio (1:1, 16:9, 4:3, 9:16, 3:4)
- Perfect for specific meme formats you have in mind
- Direct access to Nano Banana image generation

### 🎯 Key Capabilities

- **Text Overlay Options**: Choose between AI-generated text (faster) or programmatic overlay (better quality)
- **Smart Retry Logic**: Automatic exponential backoff for rate limits
- **Responsive UI**: Beautiful, modern interface with dark mode support
- **Database Ready**: SQLite schema prepared for future user authentication and meme history

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI Provider**: OpenRouter (access to 400+ models)
- **AI Models**:
  - `google/gemini-2.5-flash-lite` (structured JSON generation)
  - `google/gemini-2.5-flash-image` (Nano Banana - image generation)
- **Text Overlay**: Node Canvas
- **Database**: SQLite with Better-sqlite3 (schema ready, not enforced yet)

## Project Structure

```
new-meme-bot/
├── app/
│   ├── api/
│   │   └── meme/
│   │       ├── auto/route.ts      # Auto mode API endpoint
│   │       └── manual/route.ts    # Manual mode API endpoint
│   ├── components/
│   │   ├── AutoMode.tsx           # Auto mode form component
│   │   └── ManualMode.tsx         # Manual mode form component
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main page
├── lib/
│   ├── openrouter.ts              # OpenRouter API client with retry logic
│   ├── imageOverlay.ts            # Canvas-based text overlay
│   ├── schemas.ts                 # Zod schemas & JSON schema conversion
│   └── db.ts                      # SQLite database setup (future use)
├── .env                           # Environment variables
├── next.config.js                 # Next.js configuration
├── tailwind.config.js             # Tailwind CSS configuration
└── package.json                   # Dependencies
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- **OpenRouter API key** (get it at https://openrouter.ai/keys)

### 2. Get Your OpenRouter API Key

1. Go to **https://openrouter.ai/**
2. Sign in (Google, GitHub, or email)
3. Go to **https://openrouter.ai/keys**
4. Create a new API key
5. Copy your key (starts with `sk-or-v1-`)

**New users get $1 in free credits!** (~30 memes)

### 3. Environment Variables

Update your `.env` file with your OpenRouter API key:

```env
PORT=3000
NODE_ENV=development

OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
SITE_URL=http://localhost:3000
SITE_NAME=AI Meme Generator
```

### 4. Install Dependencies

Already installed! Dependencies include:
- next, react, react-dom
- @google/generative-ai
- canvas (for text overlay)
- better-sqlite3 (for database)
- zod (for schema validation)
- tailwindcss, typescript, and more

### 4. Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

## Usage Guide

### Auto Mode

1. Enter your meme idea (e.g., "A cat surprised by technology")
2. Optionally add up to 3 custom captions with positions
3. Choose whether to use programmatic text overlay (better quality) or AI-only (faster)
4. Click "Generate Meme"
5. Wait a few seconds for AI to work its magic
6. Download or create a new meme!

**Example Ideas:**
- Dog confused by laptop showing code
- Person realizing it's Monday tomorrow
- Cat judging you for eating junk food

### Manual Mode

1. Write a detailed prompt describing the meme you want
2. Be specific about:
   - Scene composition
   - Character expressions
   - Text placement and style
   - Visual style (photorealistic, cartoon, etc.)
3. Choose aspect ratio
4. Click "Generate Meme"

**Example Prompts:**
```
A surprised Pikachu face with text "WHEN THE CODE WORKS" at top and "ON THE FIRST TRY" at bottom, bold white Impact font with black outline
```

## API Endpoints

### POST `/api/meme/auto`

Auto mode meme generation.

**Request:**
```json
{
  "idea": "A cat surprised by technology",
  "captions": [
    { "text": "WHEN YOU SEE THE WIFI PASSWORD", "position": "top" },
    { "text": "IS 64 CHARACTERS LONG", "position": "bottom" }
  ],
  "useOverlay": true
}
```

**Response:**
```json
{
  "success": true,
  "image": "data:image/png;base64,...",
  "metadata": {
    "sceneDescription": "...",
    "style": "...",
    "mood": "...",
    "captions": [...],
    "aspectRatio": "1:1"
  },
  "mode": "auto",
  "overlayUsed": true
}
```

### POST `/api/meme/manual`

Manual mode meme generation.

**Request:**
```json
{
  "prompt": "A surprised cat with wide eyes looking at a computer screen...",
  "aspectRatio": "1:1"
}
```

**Response:**
```json
{
  "success": true,
  "image": "data:image/png;base64,...",
  "mode": "manual",
  "prompt": "...",
  "aspectRatio": "1:1"
}
```

## Database Schema (Future Use)

The database schema is ready but not enforced yet. To enable:

1. Uncomment `initializeDatabase()` in `lib/db.ts`
2. Add user authentication
3. Update API routes to save memes with `saveMeme()`

**Tables:**
- `users`: User accounts with API usage tracking
- `memes`: Generated memes with metadata

## Cost & Rate Limits

### Free Tier (Google Gemini API)
- **Gemini 2.5 Flash**: 10 RPM, 250 RPM, 250 RPD
- **Nano Banana**: Same limits
- **Cost**: $0.039 per image after free tier

**Free Tier Allowance**: ~250 images per day

### Paid Tier
- Higher rate limits
- Production-ready

## Troubleshooting

### Rate Limit Errors

If you see "Rate limit exceeded" errors:
- Wait a few seconds and try again
- The app has automatic retry logic with exponential backoff
- Consider upgrading to paid tier for production use

### Canvas Installation Issues

On some systems, canvas might require native dependencies:

**Windows**: Install Windows Build Tools
```bash
npm install --global windows-build-tools
```

**Linux**: Install dependencies
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

**macOS**: Should work out of the box with Xcode Command Line Tools

### Image Quality Issues

- **Blurry text**: Try enabling "Use Programmatic Text Overlay" in Auto mode
- **Unexpected composition**: Be more specific in your prompts
- **Wrong aspect ratio**: AI sometimes ignores aspect ratio; try specifying it in the prompt

## Future Enhancements

- [ ] User authentication and accounts
- [ ] Meme history and gallery
- [ ] Favorite/save memes
- [ ] Share to social media
- [ ] Template library for popular meme formats
- [ ] Batch generation
- [ ] Advanced editing tools
- [ ] Community features

## Contributing

Feel free to submit issues and enhancement requests!

## License

ISC

---

Built with ❤️ using Google Gemini 2.5 Flash & Nano Banana
