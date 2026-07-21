# Secrets for GitHub Actions

## WHERE TO ADD THEM ON GITHUB:
Settings > Secrets and variables > Actions > New repository secret

## WHICH SECRETS ARE NEEDED ON GITHUB:

### 1. BOT_TOKEN
Name: BOT_TOKEN
Value: your Telegram bot token

### 2. VERCEL_TOKEN
Name: VERCEL_TOKEN
How to get it:
- Go to https://vercel.com/account/tokens
- Click "Create Token"
- Copy the generated token

### 3. VERCEL_ORG_ID
Name: VERCEL_ORG_ID
How to get it:
- Go to your project on Vercel: https://vercel.com/dashboard
- Select the "poistenie-gm-bot" project
- Settings > General
- Find "Team ID" (or "Personal Account ID" for a personal account)

### 4. VERCEL_PROJECT_ID
Name: VERCEL_PROJECT_ID
How to get it:
- Same place, Settings > General
- Find "Project ID"

---

## NOTHING NEEDS TO BE ADDED IN VERCEL!

The GitHub Action deploys the project and sets up the webhook by itself.
Vercel environment variables are only needed if you want to add BOT_TOKEN to Vercel for convenience (optional).
