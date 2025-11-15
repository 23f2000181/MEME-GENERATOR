# OpenRouter Setup Guide

Your meme generator now uses **OpenRouter** to access Google's Gemini models!

## Why OpenRouter?

- ✅ **No quota issues** - Works with free tier
- ✅ **Easy access** to 400+ AI models
- ✅ **Better reliability** than direct Google API
- ✅ **Pay-as-you-go** pricing with free credits

## Quick Setup (2 minutes)

### Step 1: Get Your OpenRouter API Key

1. Go to **https://openrouter.ai/**
2. Click "Sign In" (top right)
3. Sign in with Google, GitHub, or email
4. Go to **https://openrouter.ai/keys**
5. Click "Create Key"
6. Copy your API key (starts with `sk-or-v1-...`)

### Step 2: Add API Key to .env

Open your `.env` file and replace `your_openrouter_key_here` with your actual key:

```env
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
```

### Step 3: Start the Server

```bash
npm run dev
```

That's it! Your meme generator is ready to use! 🎉

## Models Being Used

Your app now uses these models via OpenRouter:

1. **`google/gemini-2.5-flash-lite`** - For JSON generation (Auto mode)
   - Fast and efficient
   - Generates structured meme descriptions

2. **`google/gemini-2.5-flash-image`** - For image generation (Nano Banana)
   - State-of-the-art image generation
   - Creates amazing memes
   - Supports aspect ratios

## Pricing

OpenRouter has **very affordable** pricing:

### Free Credits
- New users get **$1 in free credits**
- Perfect for testing and development

### Gemini 2.5 Flash Lite (JSON generation)
- Input: $0.30/M tokens
- Output: $2.50/M tokens
- **~$0.001 per meme** (very cheap!)

### Gemini 2.5 Flash Image (image generation)
- **$0.03 per image** (or 30 images for $1)
- High quality meme generation

### Example Costs
- **100 memes**: ~$3.10
- **1000 memes**: ~$31.00
- **Your $1 free credit**: ~30 memes!

## Testing Your Setup

Run the development server:

```bash
npm run dev
```

Then open http://localhost:5000 and try:

**Auto Mode:**
- Idea: "A cat surprised by technology"
- Click "Generate Meme"

**Manual Mode:**
- Prompt: "A surprised cat with wide eyes looking at a computer screen, classic meme format"
- Click "Generate Meme"

If it works, you're all set! 🚀

## Troubleshooting

### Error: "Missing Authentication header or invalid API key"

- Check that your API key is correct in `.env`
- Make sure it starts with `sk-or-v1-`
- Restart the server after updating `.env`

### Error: "Insufficient credits"

- You've used your free $1 credit
- Add payment method at https://openrouter.ai/credits
- Top up your account

### Image not generating

- Check the console for error messages
- Verify the model name is correct: `google/gemini-2.5-flash-image`
- Try the alternative method (the code has fallbacks)

## Advanced: Monitor Your Usage

1. Go to **https://openrouter.ai/activity**
2. See all your API calls
3. Track costs and usage
4. Set spending limits

## Alternative Models

You can easily switch to other models by editing `lib/openrouter.ts`:

### For Image Generation:
- `google/gemini-2.5-flash-image` (current)
- `google/gemini-2.0-flash-exp-image-generation`
- `openai/dall-e-3` (if you want DALL-E)
- `stability-ai/stable-diffusion-xl`

### For JSON Generation:
- `google/gemini-2.5-flash-lite` (current - cheapest)
- `google/gemini-2.5-flash` (more powerful)
- `openai/gpt-4o-mini` (alternative)

## Benefits Over Direct Google API

✅ **No quota issues** - Consistent access
✅ **Better error handling** - More reliable
✅ **Access to 400+ models** - Easy to switch
✅ **Pay-as-you-go** - No monthly subscriptions
✅ **Free credits** - Test before you pay
✅ **Usage dashboard** - Track every request

## Need Help?

- **OpenRouter Docs**: https://openrouter.ai/docs
- **OpenRouter Discord**: Join their community
- **Check Activity**: https://openrouter.ai/activity to see errors

---

**Ready to create amazing memes!** 🎨

Get your API key and start generating: **https://openrouter.ai/keys**
