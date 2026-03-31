# 🚀 Hyperliquid Trading Signal Bot

A professional, production-ready trading signals bot for Hyperliquid with Telegram integration. Analyzes technical indicators and sends trading signals based on advanced signal evaluation logic.

## 📋 Features

### 🎯 Advanced Technical Analysis
- **RSI (Relative Strength Index)** - Momentum and overbought/oversold levels
- **MACD** - Trend direction and momentum crossovers
- **EMA/SMA** - Trend confirmation (20, 50, 200 period)
- **Bollinger Bands** - Volatility and price extremes
- **ATR** - Volatility measurement
- **ADX** - Trend strength confirmation
- **Stochastic Oscillator** - Momentum confirmation
- **Williams %R** - Overbought/oversold levels
- **Volatility Analysis** - Risk assessment

### 📊 Smart Signal Generation
- **Multi-indicator Confirmation** - Signals only when multiple indicators align
- **Signal Strength Calculation** - 0-100% strength metric
- **Confidence Scoring** - Separate confidence metric for signal validity
- **Divergence Detection** - Price vs indicator divergence patterns
- **Pattern Recognition** - Higher highs/lows, support/resistance levels

### 🔔 Telegram Integration
- Real-time signal notifications with emoji indicators
- Signal strength visualization with bar charts
- Detailed indicator breakdowns
- Error alerts and status updates
- Daily summary reports

### 💰 Risk Management
- Configurable position sizing
- Stop-loss and take-profit levels
- Maximum loss thresholds
- Signal filtering by type (BUY/SELL/CLOSE)

## 📦 Installation

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn
- Telegram bot token
- Hyperliquid API access

### Setup

1. **Clone the repository**
   ```bash
   cd d:\tradebot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   - Edit `.env` with your settings (see Configuration section)

5. **Build the project**
   ```bash
   npm run build
   ```

## ⚙️ Configuration

### Essential Settings

#### Telegram Configuration
```env
# Get from @BotFather on Telegram
TELEGRAM_BOT_TOKEN=<your_bot_token>

# Get your chat ID by messaging the bot and using /start
TELEGRAM_CHAT_ID=<your_chat_id>
```

#### Trading Symbols
```env
# Monitor multiple symbols
TRADING_SYMBOLS=BTC,ETH,SOL,AVAX,ARB

# Chart timeframe
TIMEFRAME=5m  # Options: 1m, 5m, 15m, 1h, 4h, 1d

# How often to analyze (in milliseconds)
UPDATE_INTERVAL=300000  # 5 minutes
```

#### Signal Thresholds
```env
# Only trigger signals above this strength
MIN_SIGNAL_STRENGTH=60  # 0-100

# Only trigger signals above this confidence
MIN_SIGNAL_CONFIDENCE=50  # 0-100

# Enable/disable signal types
ENABLE_BUY_SIGNALS=true
ENABLE_SELL_SIGNALS=true
```

#### Risk Management
```env
# Maximum position size
MAX_POSITION_SIZE=0.1  # 10% of account

# Loss/profit targets (%)
MAX_LOSS_PCT=2
TAKE_PROFIT_PCT=5
STOP_LOSS_PCT=2
```

## 🚀 Running the Bot

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## 📊 Understanding Signals

### Signal Types

#### 🟢 BUY Signal
Generated when multiple bullish indicators align:
- RSI < 30 (oversold) + MACD bullish crossover
- Price below Bollinger Band lower + strong EMA alignment
- Bullish divergence detected

**Strength**: How many indicators confirm (0-100%)
**Confidence**: Overall reliability of the signal

#### 🔴 SELL Signal
Generated when multiple bearish indicators align:
- RSI > 70 (overbought) + MACD bearish crossover
- Price above Bollinger Band upper + weak EMA trend
- Bearish divergence detected

#### 🟡 CLOSE Signal
Generated on conflicting signals - recommend closing current position

### Indicator Analysis

#### RSI (Relative Strength Index)
- **< 30**: Oversold (potential BUY)
- **30-70**: Neutral
- **> 70**: Overbought (potential SELL)

#### MACD
- **Histogram > 0**: Bullish momentum
- **Histogram < 0**: Bearish momentum
- **Crossovers**: Strong momentum shifts

#### EMA Trend (20, 50, 200)
- **Price > EMA20 > EMA50 > EMA200**: Strong uptrend
- **Price < EMA20 < EMA50 < EMA200**: Strong downtrend

#### Bollinger Bands
- **Touch lower band**: Buy opportunity
- **Touch upper band**: Sell opportunity
- **Outside bands**: Potential reversal

#### ADX (Trend Strength)
- **ADX > 25**: Strong trend (increases signal reliability)
- **ADX < 25**: Weak trend (reduce position size)

## 📈 Signal Examples

### Strong BUY Signal
```
🟢 BUY SIGNAL - ETH
Strength: ████████░░ 85%
Confidence: 92%

📊 Indicators:
RSI: 28.5 (⚠️ Oversold)
MACD: 📈 Bullish Crossover
Trend: BULLISH
Patterns: HIGHER_LOW, AT_SUPPORT
```

### Medium SELL Signal
```
🔴 SELL SIGNAL - BTC
Strength: ██████░░░░ 65%
Confidence: 73%

📊 Indicators:
RSI: 72.1 (⚠️ Overbought)
MACD: 📉 Bearish
Trend: BEARISH
Patterns: LOWER_HIGH, AT_RESISTANCE
```

## 🔧 Advanced Configuration

### Custom Indicator Periods

Modify `src/indicators.ts` to adjust indicator periods:

```typescript
// EMA periods
const ema20 = this.calculateEMA(closes, 20);  // Change to any period
const ema50 = this.calculateEMA(closes, 50);
const ema200 = this.calculateEMA(closes, 200);

// RSI period
const rsi = this.calculateRSI(closes, 14);  // Change period

// Bollinger Bands
const bollinger = this.calculateBollingerBands(closes, 20, 2);
```

### Custom Signal Logic

Modify `src/signals.ts` in the `evaluateConditions()` method to customize signal rules:

```typescript
// Example: Increase weight of RSI signals
if (indicators.rsi < 30) {
  buySignalCount += 3;  // Increased from 2
}
```

## 📊 Performance Monitoring

### View Statistics
The bot logs statistics every minute:
```
📈 Bot Stats: Running=true | Signals=45 | Buy=28 | Sell=17
```

### Signal History
The bot maintains signal history for analysis:
```typescript
bot.getStatistics()
// Returns:
// {
//   isRunning: true,
//   totalSignals: 45,
//   buySignals: 28,
//   sellSignals: 17,
//   symbolsMonitored: 5
// }
```

## 🔍 Troubleshooting

### Bot doesn't start
```bash
# Check environment variables
echo $TELEGRAM_BOT_TOKEN

# Verify .env file exists
ls -la .env

# Check node version
node --version
```

### No signals generated
- Check `MIN_SIGNAL_STRENGTH` and `MIN_SIGNAL_CONFIDENCE` settings
- Verify market conditions meet signal criteria
- Review bot logs for errors
- Test with different symbols

### API errors
- Verify Hyperliquid API is accessible
- Check internet connection
- Review API rate limits
- Check for symbol spelling in TRADING_SYMBOLS

## 📝 Best Practices

1. **Start Conservative**
   - Begin with 1-2 symbols
   - Use higher signal thresholds (70%+)
   - Test on paper trading first

2. **Monitor Performance**
   - Track signal accuracy
   - Review daily summaries
   - Adjust thresholds based on results

3. **Risk Management**
   - Always use stop losses
   - Never risk more than 2% per trade
   - Size positions according to volatility

4. **Indicator Tuning**
   - Adjust periods based on your timeframe
   - Test different combinations
   - Document changes and results

## 🔐 Security Notes

- **Never** commit .env file to git
- **Never** share your Telegram bot token
- Keep API credentials secure
- Use environment variables for all sensitive data
- Run on secure servers only

## 📚 Indicator Reference

| Indicator | Period | Purpose |
|-----------|--------|---------|
| RSI | 14 | Overbought/Oversold detection |
| MACD | 12,26,9 | Momentum and trend |
| EMA | 20,50,200 | Trend confirmation |
| Bollinger | 20,2 | Volatility levels |
| ATR | 14 | Volatility measure |
| ADX | 14 | Trend strength |
| Stochastic | 14 | Momentum oscillator |

## 🤝 Contributing

Improvements and contributions welcome!

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review bot logs
3. Verify configuration
4. Test components individually

## 📄 License

MIT License

## ⚠️ Disclaimer

This bot is for educational purposes. Trading cryptocurrencies involves risk. Past performance does not guarantee future results. Always conduct your own research and never invest more than you can afford to lose.

**Use at your own risk. The authors are not responsible for trading losses.**