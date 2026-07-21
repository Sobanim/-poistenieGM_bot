# Insurance Consultation Bot for Slovakia

A Telegram bot that provides information about insurance options for Ukrainian citizens settling in Slovakia. The bot helps users understand different types of insurance policies required for residence in Slovakia, and lets them submit an order request.

## Features

- **Interactive Menu System**: Easy-to-use inline keyboard navigation
- **Insurance Options Information**: Detailed information about 4 types of insurance:
  - 🇺🇦 Ukrainian Tourist Insurance
  - 🇸🇰 Slovak Emergency Insurance (AXA)
  - 🇸🇰 Slovak Medical Insurance (Union)
  - 🌍 International Life Risk Insurance
- **Order Flow**: Step-by-step collection of name, age, and contact info, with the finished request sent to the admin on Telegram
- **Multilingual Support**: Currently supports a Ukrainian interface
- **Dual Runtime**: Runs either as a local long-polling process or as a Vercel serverless webhook

## Project Structure

```
├── index.js                        # Local entry point (long-polling, bot.launch())
├── setup-webhook.js                # CLI script to set the webhook from env vars
├── api/
│   ├── webhook.js                  # Production entry point (Vercel serverless webhook)
│   ├── setup-webhook.js            # Public endpoint to set the Telegram webhook
│   └── status.js                   # Public endpoint to check bot/webhook status
├── config/
│   ├── env.js                      # Environment/credentials resolution
│   └── botHandlers.js              # Shared bot handler wiring (used by index.js and api/webhook.js)
├── handlers/
│   ├── basicHandlers.js            # /start, main menu, callback routing
│   ├── insuranceDetails.js         # Insurance description texts
│   └── order/
│       ├── orderHandlers.js        # Order state, validation, admin notification
│       └── orderTextHandlers.js    # Step-by-step text input handling
├── assets/images/                  # Static assets (e.g. sample policy image)
├── index.html                      # Simple landing page
├── vercel.json                     # Vercel configuration
├── .github/workflows/deploy.yml    # CI: deploy to Vercel + set up the webhook
└── package.json                    # Project dependencies and scripts
```

## Prerequisites

- Node.js (v18 or higher)
- npm package manager
- Telegram Bot Token (obtain from @BotFather)

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd poistenieGM_bot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   BOT_TOKEN=your_telegram_bot_token_here
   ADMIN_ID=your_telegram_user_id_here
   # Optional, used for a separate dev bot when NODE_ENV=development
   DEV_BOT_TOKEN=your_dev_bot_token_here
   DEV_ADMIN_ID=your_dev_admin_id_here
   ```

4. **Run the bot locally** (long-polling):
   ```bash
   npm run dev
   ```

## Dependencies

The project uses the following main dependencies:

- **telegraf**: Modern Telegram Bot API framework for Node.js
- **dotenv**: Environment variable management
- **ES6 modules**: Modern JavaScript module system

## Bot Commands

- `/start` - Initialize the bot and show the main menu

## Insurance Types Covered

### 🇺🇦 Ukrainian Tourist Insurance
- **Cost**: €100-200/year
- **Coverage**: Emergency cases, injuries, urgent care
- **Limitations**: Not suitable for long-term residence, limited coverage

### 🇸🇰 Slovak Emergency Insurance (AXA)
- **Cost**: ~€30/month
- **Coverage**: Emergency medical services only
- **Best for**: Students who want protection from expensive emergency care

### 🇸🇰 Slovak Medical Insurance (Union)
- **Cost**: ~€50/month
- **Coverage**: Full medical coverage including regular doctor visits
- **Best for**: Comprehensive healthcare needs

### 🌍 International Life Risk Insurance
- **Coverage**: International life and risk coverage
- **Best for**: Extended international coverage needs

## Development

### Adding New Features

1. **New Insurance Types**: Add entries to `handlers/insuranceDetails.js`
2. **New Handlers**: Extend `handlers/basicHandlers.js`
3. **Menu Options**: Update inline keyboards in the callback handlers

### Code Structure

- **Modular Design**: Handlers are separated into different modules
- **ES6 Modules**: Uses modern import/export syntax
- **Environment Configuration**: Sensitive data managed through environment variables

## Deployment

The bot is deployed to **Vercel** as a serverless webhook (see `api/webhook.js`). Pushing to
`main` triggers `.github/workflows/deploy.yml`, which deploys to Vercel and re-registers the
webhook automatically. See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for manual setup and
[GITHUB_SECRETS.md](GITHUB_SECRETS.md) for the CI secrets required.

Note that state is currently kept in an in-memory `Map` (see `handlers/order/orderHandlers.js`),
which is not reliable across serverless invocations — see [PROJECT_AUDIT.md](PROJECT_AUDIT.md)
for known issues and a fix plan.

## Environment Variables

- `BOT_TOKEN`: Your Telegram bot token from @BotFather
- `ADMIN_ID`: Telegram user ID that receives new order notifications
- `NODE_ENV`: Set to `development` to use `DEV_BOT_TOKEN`/`DEV_ADMIN_ID` instead
- `DEV_BOT_TOKEN` / `DEV_ADMIN_ID`: Optional separate bot/admin used during local development

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For questions or support regarding insurance options in Slovakia, use the bot's consultation request feature or contact the development team.

## Changelog

### v1.0.0
- Initial release
- Basic insurance information system
- Interactive menu navigation
- Support for 4 insurance types

---

**Note**: This bot is designed specifically for Ukrainian citizens seeking insurance information for residence in Slovakia. All information provided is for educational purposes and should be verified with official insurance providers.
