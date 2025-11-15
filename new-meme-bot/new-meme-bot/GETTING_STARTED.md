# Getting Started with AI Meme Generator 🚀

## Quick Start

Your meme generator is ready to go! The server is running at **http://localhost:5000**

## What You Have

✅ **Auto Mode** - AI-powered meme generation
- Describe your idea, AI creates the meme
- Customizable captions with positions
- Choice of AI-generated or programmatic text overlay

✅ **Manual Mode** - Direct control
- Write detailed prompts
- Choose aspect ratios
- Full creative freedom

✅ **Modern UI**
- Beautiful gradient interface
- Dark mode support
- Responsive design
- Loading states and error handling

✅ **Production Ready Features**
- Retry logic with exponential backoff
- Rate limit handling
- Error messages
- Download functionality

✅ **Database Ready**
- SQLite schema prepared in `lib/db.ts`
- Ready for user authentication
- Meme history support

## Try It Now!

1. Open **http://localhost:5000** in your browser
2. Try Auto Mode first:
   - Enter: "A cat surprised by technology"
   - Add caption: "WHEN YOU SEE THE WIFI PASSWORD" (top)
   - Add caption: "IS 64 CHARACTERS LONG" (bottom)
   - Click "Generate Meme"
3. Try Manual Mode:
   - Click "Manual Mode" tab
   - Use one of the example prompts
   - Click "Generate Meme"

## Example Prompts

### Auto Mode Ideas:
```
Dog confused by laptop showing code
Person realizing it's Monday tomorrow
Cat judging you for eating junk food
Programmer seeing their code work first try
```

### Manual Mode Prompts:
```
A surprised Pikachu face with text "WHEN THE CODE WORKS" at top and "ON THE FIRST TRY" at bottom, bold white Impact font with black outline, classic meme style

Drake meme format: top panel shows Drake rejecting with disgusted face, bottom panel shows Drake approving with happy face, photorealistic style, clear composition

Distracted boyfriend meme: man in red shirt looking at another woman while his girlfriend in blue looks disapproving, modern outdoor setting, photorealistic
```

## Next Steps

### Enable Database (Optional)
To save memes and add user authentication:

1. Open `lib/db.ts`
2. Uncomment the last line: `initializeDatabase()`
3. Restart the server
4. Database file `memes.db` will be created

### Add Features
Some ideas for enhancement:
- User authentication
- Meme gallery/history
- Social sharing
- Template library
- Batch generation
- Advanced editing

### Deploy to Production
1. Update `.env` with production values
2. Set `NODE_ENV=production`
3. Run `npm run build`
4. Deploy to Vercel, Netlify, or your preferred hosting

## API Usage

### Auto Mode API
```bash
curl -X POST http://localhost:5000/api/meme/auto \
  -H "Content-Type: application/json" \
  -d '{
    "idea": "A cat surprised by technology",
    "captions": [
      {"text": "WHEN YOU SEE THE WIFI PASSWORD", "position": "top"},
      {"text": "IS 64 CHARACTERS LONG", "position": "bottom"}
    ],
    "useOverlay": true
  }'
```

### Manual Mode API
```bash
curl -X POST http://localhost:5000/api/meme/manual \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A surprised cat with wide eyes...",
    "aspectRatio": "1:1"
  }'
```

## Troubleshooting

### Rate Limits
- **Free tier**: 250 images/day
- If you hit limits, wait a few seconds and retry
- Automatic retry logic is built-in

### Canvas Issues on Windows
If you see canvas errors:
```bash
npm install --global windows-build-tools
npm rebuild canvas
```

### Port Already in Use
If port 5000 is taken:
1. Edit `.env` and change `PORT=3000`
2. Restart server: `npm run dev`

## Cost Information

**Free Tier (Google Gemini API):**
- 250 images per day
- 10 requests per minute
- Perfect for testing and development

**Paid Tier:**
- $0.039 per image
- Higher rate limits
- Production-ready

## Architecture

```
User → Next.js Frontend (React)
         ↓
    API Routes (Next.js)
         ↓
    ┌────┴────┐
    ↓         ↓
Gemini 2.5   Nano Banana
(JSON)       (Image)
```

**Auto Mode Flow:**
1. User provides idea + captions
2. Gemini generates structured JSON description
3. JSON → detailed prompt
4. Nano Banana generates image
5. Optional: Add text programmatically
6. Return to user

**Manual Mode Flow:**
1. User provides detailed prompt
2. Nano Banana generates image directly
3. Return to user

## File Structure

```
app/
├── api/meme/
│   ├── auto/route.ts      # Auto mode endpoint
│   └── manual/route.ts    # Manual mode endpoint
├── components/
│   ├── AutoMode.tsx       # Auto mode form
│   └── ManualMode.tsx     # Manual mode form
└── page.tsx               # Main UI

lib/
├── gemini.ts              # API client + retry logic
├── imageOverlay.ts        # Text overlay with Canvas
├── schemas.ts             # Zod schemas
└── db.ts                  # Database (future use)
```

## Support

- Check the main README.md for detailed documentation
- Review code comments for implementation details
- Test with different prompts to understand capabilities

## Have Fun! 🎨

Create amazing memes and share them with the world! The AI is powerful, so experiment with different ideas and prompts to get the best results.

**Remember:** Be creative, be funny, and most importantly, have fun! 🚀
