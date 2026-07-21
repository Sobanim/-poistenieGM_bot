# Deploying the Telegram Bot to Vercel

This project is adapted to run on Vercel as a serverless application.

## Project structure for Vercel

- `api/webhook.js` - main function that handles webhooks from Telegram
- `api/status.js` - function for checking the bot's status
- `api/setup-webhook.js` - function for setting up the webhook
- `vercel.json` - Vercel configuration

## Setup and deployment

### 1. Install the Vercel CLI (if not already installed)
```bash
npm i -g vercel
```

### 2. Log in to Vercel
```bash
vercel login
```

### 3. Deploy the project
```bash
vercel
```

### 4. Configure environment variables in Vercel (optional)

In the project settings on Vercel you can add:
- `BOT_TOKEN` - your Telegram bot token

### 5. Set up the webhook

After deployment there are several ways to set up the webhook:

**Option 1: Via the API function (recommended)**
```bash
curl -X POST "https://your-project.vercel.app/api/setup-webhook" \
     -H "Content-Type: application/json" \
     -d '{"botToken": "YOUR_BOT_TOKEN"}'
```

**Option 2: If BOT_TOKEN was added to Vercel's environment variables**
```bash
curl -X POST "https://your-project.vercel.app/api/setup-webhook"
```

**Option 3: Directly via the Telegram API**
```
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://your-project.vercel.app/api/webhook
```

## Verifying it works

- Bot status: `https://your-project.vercel.app/api/status`
- Webhook endpoint: `https://your-project.vercel.app/api/webhook`
- Webhook setup help: `https://your-project.vercel.app/api/setup-webhook`

## Main advantages of Vercel

1. **Serverless architecture**: functions only run when needed
2. **No cold-sleep issues**: unlike Render, functions don't "go to sleep"
3. **Automatic scaling**: handles any number of users
4. **Fast deployment**: automatic deploy on push to Git

## Local development

To test locally:
```bash
npm run vercel-dev
```

This starts a local Vercel dev server.

## Vercel limitations

- Maximum function execution time: 10 seconds (Hobby plan)
- Maximum request size: 4.5MB

These limits are sufficient for most Telegram bots.
