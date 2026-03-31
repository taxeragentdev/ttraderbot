# Quick Start Guide for Hyperliquid Trading Bot

## ⚡ 5-Minute Setup

### Step 1: Clone and Install
```bash
cd d:\tradebot
npm install
```

### Step 2: Get Your Credentials

#### Get Telegram Bot Token
1. Open Telegram and search for `@BotFather`
2. Send `/start`
3. Send `/newbot`
4. Follow the prompts and save your token

#### Get Your Chat ID
1. Send `/start` to your new bot
2. Go to: `https://api.telegram.org/bot{YOUR_TOKEN}/getUpdates`
3. Find your `chat_id` in the response

### Step 3: Configure Bot
1. Copy `.env.example` to `.env`
2. Fill in your credentials:
   ```env
   TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
   TELEGRAM_CHAT_ID=987654321
   TRADING_SYMBOLS=BTC,ETH
   ```

### Step 4: Run Bot
```bash
npm run build
npm start
```

## 🎯 Configuration Examples

### Conservative Setup (Low False Signals)
```env
TRADING_SYMBOLS=BTC,ETH
TIMEFRAME=1h
MIN_SIGNAL_STRENGTH=75
MIN_SIGNAL_CONFIDENCE=70
UPDATE_INTERVAL=3600000
ENABLE_BUY_SIGNALS=true
ENABLE_SELL_SIGNALS=true
```

### Aggressive Setup (More Signals)
```env
TRADING_SYMBOLS=BTC,ETH,SOL,AVAX,ARB
TIMEFRAME=5m
MIN_SIGNAL_STRENGTH=50
MIN_SIGNAL_CONFIDENCE=40
UPDATE_INTERVAL=300000
ENABLE_BUY_SIGNALS=true
ENABLE_SELL_SIGNALS=true
```

### Scalping Setup (Very Active)
```env
TRADING_SYMBOLS=BTC,ETH
TIMEFRAME=1m
MIN_SIGNAL_STRENGTH=60
MIN_SIGNAL_CONFIDENCE=45
UPDATE_INTERVAL=60000
ENABLE_BUY_SIGNALS=true
ENABLE_SELL_SIGNALS=true
```

### Swing Trading Setup
```env
TRADING_SYMBOLS=BTC,ETH,SOL
TIMEFRAME=4h
MIN_SIGNAL_STRENGTH=70
MIN_SIGNAL_CONFIDENCE=65
UPDATE_INTERVAL=900000
ENABLE_BUY_SIGNALS=true
ENABLE_SELL_SIGNALS=true
```

## 📊 Understanding Your First Signals

When the bot starts, you'll see signals like:
```
🟢 BUY SIGNAL - ETH
Strength: ████████░░ 85%
Confidence: 92%

📊 Indicators:
RSI: 28.5 (⚠️ Oversold)
MACD: 📈 Bullish
Trend: BULLISH
Patterns: HIGHER_LOW, AT_SUPPORT
```

**What it means:**
- 🟢 = Buy signal with 85% strength
- RSI 28.5 = Price is oversold (potential reversal)
- MACD is Bullish = Momentum is increasing
- Multiple indicators align = High confidence

## 🔧 Customization

### Adding More Symbols
Edit `.env`:
```env
TRADING_SYMBOLS=BTC,ETH,SOL,AVAX,ARB,DOGE,MATIC
```

### Changing Sensitivity
Lower `MIN_SIGNAL_STRENGTH` for more signals:
- `70+` = Only strongest signals (recommended for beginners)
- `50-70` = Balanced approach
- `<50` = Many signals (more false positives)

### Adjusting Update Frequency
`UPDATE_INTERVAL` in milliseconds:
- 60000 = Every 1 minute (very active)
- 300000 = Every 5 minutes (recommended)
- 900000 = Every 15 minutes (relaxed)
- 3600000 = Every 1 hour (swing traders)

## 🐛 Debugging

### Check if running
```bash
npm run dev
```

### Test components
View log output and check for errors

### Common issues
1. **"Bot not connected"** - Check your token and chat ID
2. **"No signals"** - Try lowering `MIN_SIGNAL_STRENGTH`
3. **"API errors"** - Check internet connection

## 📈 Next Steps

1. **Monitor Performance**
   - Watch the first 24 hours of signals
   - Note which symbols generate good signals
   - Track accuracy

2. **Optimize Settings**
   - Adjust timeframes based on results
   - Modify RSI/MACD thresholds if needed
   - Fine-tune signal strength requirements

3. **Scale Up**
   - Add more symbols gradually
   - Test different timeframes
   - Consider multiple bots for different strategies

## 💡 Tips for Success

✅ **DO:**
- Start with major symbols (BTC, ETH)
- Use 4h or 1h timeframes first
- Keep signals at 70%+ strength initially
- Test configuration before live trading
- Use with a risk management plan

❌ **DON'T:**
- Trade on news events (bot can't predict)
- Go all-in on one trade
- Ignore diverging signals
- Use very low signal thresholds
- Trade without stop losses

## 📞 Need Help?

1. Check the full README.md
2. Review your signal analysis
3. Verify environment variables
4. Check bot logs for errors
5. Test with different symbols

Happy trading! 🚀
