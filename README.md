# Insurance Consultation Bot for Slovakia

A Telegram bot that provides information about insurance options for Ukrainian citizens settling in Slovakia. The bot helps users understand different types of insurance policies required for residence in Slovakia.

## Features

- **Interactive Menu System**: Easy-to-use inline keyboard navigation
- **Insurance Options Information**: Detailed information about 4 types of insurance:
  - 🇺🇦 Ukrainian Tourist Insurance
  - 🇸🇰 Slovak Emergency Insurance (AXA)
  - 🇸🇰 Slovak Medical Insurance (Union)
  - 🌍 International Life Risk Insurance
- **Multilingual Support**: Currently supports Ukrainian interface
- **Consultation Requests**: Users can request consultations (feature in development)

## Project Structure

```
├── index.js                    # Main bot entry point
├── server.js                   # Server configuration
├── package.json               # Project dependencies
├── handlers/
│   ├── basicHandlers.js       # Core bot handlers (start, callbacks)
│   └── insuranceDetails.js    # Insurance information data
└── README.md                  # Project documentation
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager
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
   ```

4. **Run the bot**:
   ```bash
   npm start
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

The bot can be deployed on various platforms:

- **Heroku**: Add `Procfile` with `web: node index.js`
- **Railway**: Direct deployment with automatic builds
- **VPS**: Use PM2 for process management

## Environment Variables

- `BOT_TOKEN`: Your Telegram bot token from @BotFather

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

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
