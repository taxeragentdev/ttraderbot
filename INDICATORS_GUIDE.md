# Technical Analysis Guide - Hyperliquid Trading Bot

## 📊 Deep Dive into Indicators

This document details all indicators used in the bot, based on the comprehensive analysis of the TrendTrader repository.

### 1. RSI (Relative Strength Index)

**What it is:** Momentum oscillator measuring strength of price movements
**Range:** 0-100
**Formula:** RSI = 100 - (100 / (1 + RS)), where RS = Average Gain / Average Loss

**Signal Interpretation:**
```
RSI < 30      → Oversold (potential BUY)
30-50         → Weak downtrend
50-70         → Strong uptrend
RSI > 70      → Overbought (potential SELL)
```

**Bot Usage:**
- Primary indicator for reversal trades
- Buy when RSI < 30 combined with other bullish signals
- Sell when RSI > 70 combined with other bearish signals
- RSI 40-60 = Neutral zone (reduce reversal confidence)

**Parameters:** Period = 14 (default, adjustable)

**Divergence:**
- Bullish: Price makes lower low, RSI makes higher low
- Bearish: Price makes higher high, RSI makes lower high

### 2. MACD (Moving Average Convergence Divergence)

**Components:**
- MACD Line: 12-period EMA - 26-period EMA
- Signal Line: 9-period EMA of MACD Line
- Histogram: MACD Line - Signal Line

**Signal Interpretation:**
```
MACD > Signal   → Bullish momentum
MACD < Signal   → Bearish momentum
Crossover ↑     → Bullish crossover
Crossover ↓     → Bearish crossover
Histogram > 0   → Bullish or gaining momentum
Histogram < 0   → Bearish or losing momentum
```

**Bot Usage:**
- **Weight:** 2 points per signal (highest weight in composite)
- Bullish crossover = Strong BUY confirmation
- Bearish crossover = Strong SELL confirmation
- Histogram direction = Momentum direction
- MACD > 0 and Signal > 0 = Additional bullish confirmation

**Signal Patterns:**
1. **Zero Line Cross:** MACD crosses zero = Major momentum shift
2. **Signal Line Cross:** MACD crosses signal line = Entry/exit point
3. **Divergence:** Price vs MACD divergence = Reversal setup

### 3. EMA (Exponential Moving Average)

**What it is:** Moving average that gives more weight to recent prices
**Periods used in bot:** 20, 50, 200

**Trend Confirmation:**
```
Price > EMA20 > EMA50 > EMA200     → STRONG BULLISH TREND
Price < EMA20 < EMA50 < EMA200     → STRONG BEARISH TREND
Mixed arrangement                  → NEUTRAL/CHOPPY MARKET
```

**Bot Usage:**
- EMA20: Short-term trend (5-7 days on 1h timeframe)
- EMA50: Medium-term trend (2-3 weeks)
- EMA200: Long-term trend (2-3 months)
- 2 points if all EMAs aligned in same direction
- 1 point for price crossing EMA20

**Golden Cross:** EMA50 crosses above EMA200 = Major bullish signal
**Death Cross:** EMA50 crosses below EMA200 = Major bearish signal

### 4. Bollinger Bands

**Components:**
- Upper Band: Middle Band + (2 × Standard Deviation)
- Middle Band: 20-period SMA
- Lower Band: Middle Band - (2 × Standard Deviation)

**Signal Interpretation:**
```
Price on Upper Band   → Overbought (prepare for pullback)
Price on Lower Band   → Oversold (prepare for bounce)
Bands Expanding       → Increasing volatility
Bands Contracting     → Decreasing volatility (squeeze)
```

**Bot Usage:**
- 2 points if price bounces off lower band (with momentum)
- -2 points if price bounces off upper band (with momentum)
- Touch = within 0.5% of band
- Bollinger Squeeze = Low volatility setup (prepare for breakout)
- When combined with MACD = High probability setups

### 5. ADX (Average Directional Index)

**What it is:** Measures trend strength regardless of direction
**Range:** 0-100
**Interpretation:**
```
ADX < 20    → No trend / Weak trend
ADX 20-40   → Trending
ADX > 40    → Strong trend
ADX > 50    → Extremely strong trend
```

**Bot Usage:**
- Multiplier for other signals
- If ADX > 25: Increase confidence in trend-following signals
- If ADX < 20: Reduce size or skip trend-following trades
- Check ADX trend instead of trying to trade against strong ADX

### 6. ATR (Average True Range)

**What it is:** Measures market volatility
**Default Period:** 14

**Signal Interpretation:**
```
High ATR     → High volatility (wider stops needed)
Low ATR      → Low volatility (tighter stops possible)
ATR Expanding → Volatility increasing
ATR Contracting → Volatility decreasing
```

**Bot Usage:**
- Risk management parameter (calculate position size)
- If ATR high: Use larger stop losses
- If ATR low: Use tighter stops
- Not a direct signal, but risk modifier

### 7. Stochastic Oscillator

**Components:**
- K% = (Close - Lowest Low) / (Highest High - Lowest Low) × 100
- D% = 3-period SMA of K%

**Signal Interpretation:**
```
K < 20, D < 20      → Oversold
K > 80, D > 80      → Overbought
K crosses above D   → Bullish signal
K crosses below D   → Bearish signal
```

**Advantages over RSI:**
- More sensitive to recent price action
- Better for range-bound markets
- Can identify overbought/oversold faster

### 8. Williams %R

**What it is:** Momentum indicator similar to Stochastic
**Range:** -100 to 0

**Signal Interpretation:**
```
-100 to -80   → Oversold (potential BUY)
-80 to -20   → Normal range
-20 to 0     → Overbought (potential SELL)
```

**Bot Usage:**
- Alternative oversold/overbought detector
- Used when RSI doesn't trigger but %R does
- Provides additional confirmation

### 9. CCI (Commodity Channel Index)

**What it is:** Measures price deviation from average
**Range:** Unrestricted (typically -100 to +100)

**Signal Interpretation:**
```
CCI > +100   → Strong uptrend
CCI < -100   → Strong downtrend
-100 to +100 → Consolidation
```

## 🎯 Signal Combinations (from GitHub TrendTrader)

### Best Buy Signals

1. **RSI + MACD Bullish Crossover**
   - RSI < 40 AND Oversold
   - MACD just crossed above Signal Line
   - Price above EMA20
   - **Strength:** 🟢🟢🟢 HIGH

2. **Bollinger Squeeze Breakout**
   - Bollinger Bands contracting (squeeze)
   - Price breaks lower band upward
   - MACD histogram becomes positive
   - ADX > 20 (confirming trend)
   - **Strength:** 🟢🟢 MEDIUM-HIGH

3. **Triple EMA Alignment**
   - Price > EMA20 > EMA50 > EMA200
   - All aligned upward
   - RSI 40-70 (strong but not overbought)
   - **Strength:** 🟢🟢 MEDIUM-HIGH

4. **Bullish Divergence**
   - Price makes lower low
   - RSI/MACD makes higher low
   - RSI oversold territory
   - **Strength:** 🟢 MEDIUM (risky but rewarding)

### Best Sell Signals

1. **RSI + MACD Bearish Crossover**
   - RSI > 60 AND Overbought
   - MACD just crossed below Signal Line
   - Price below EMA20
   - **Strength:** 🔴🔴🔴 HIGH

2. **Bollinger Breakout to Upper Band**
   - Price breaks upper band upward
   - ADX shows strong trend above 30
   - But MACD histogram turning negative
   - **Strength:** 🔴🔴 MEDIUM-HIGH

3. **Triple EMA Reversal**
   - Price < EMA20 < EMA50 < EMA200
   - All aligned downward
   - RSI 30-60 (weak but not oversold)
   - **Strength:** 🔴🔴 MEDIUM-HIGH

4. **Bearish Divergence**
   - Price makes higher high
   - RSI/MACD makes lower high
   - RSI overbought territory
   - **Strength:** 🔴 MEDIUM (risky but rewarding)

## 📈 Pattern Recognition

### Price Patterns (Candlestick)

1. **Higher High / Higher Low**
   - Bullish pattern
   - Each peak higher than previous
   - Each valley higher than previous
   - Signal: BULLISH trend continuing

2. **Lower High / Lower Low**
   - Bearish pattern
   - Each peak lower than previous
   - Each valley lower than previous
   - Signal: BEARISH trend continuing

3. **Triangle Contraction**
   - Highs and lows getting closer
   - Consolidation pattern
   - Precedes breakout
   - Signal: Prepare for big move

4. **Support/Resistance Levels**
   - Price repeatedly bounces at level
   - At Support: Potential BUY
   - At Resistance: Potential SELL

## 🧮 Signal Strength Calculation

The bot calculates signal strength as follows:

```typescript
let buySignalCount = 0;
let sellSignalCount = 0;

// RSI signals (weight: 2)
if (rsi < 30) buySignalCount += 2;
if (rsi > 70) sellSignalCount += 2;

// MACD signals (weight: 2)
if (macd_crossover == 'bullish') buySignalCount += 2;
if (macd_crossover == 'bearish') sellSignalCount += 2;

// EMA alignment (weight: 2)
if (ema20 > ema50 > ema200) buySignalCount += 2;
if (ema20 < ema50 < ema200) sellSignalCount += 2;

// Pattern signals (weight: 1)
if (higher_high || higher_low) buySignalCount += 1;
if (lower_high || lower_low) sellSignalCount += 1;

// ADX trend strength (weight: 1)
if (adx > 25 && trend == 'BULLISH') buySignalCount += 1;
if (adx > 25 && trend == 'BEARISH') sellSignalCount += 1;

// Bollinger extremes (weight: 1)
if (price < bb_lower) buySignalCount += 1;
if (price > bb_upper) sellSignalCount += 1;

// Final strength
strength = (max(buySignalCount, sellSignalCount) / totalSignals) * 100;
```

## ⏱️ Timeframe Considerations

### 1-Minute Chart
- **Best for:** Scalpers, HFT
- **Noise level:** Very high
- **Use:** Only with very strong signals
- **Recommended strength:** 85%+

### 5-Minute Chart
- **Best for:** Day traders, active scalpers
- **Noise level:** High
- **Use:** Good balance of speed and reliability
- **Recommended strength:** 70%+

### 15-Minute Chart
- **Best for:** Day traders
- **Noise level:** Medium
- **Use:** Reliable signals with good frequency
- **Recommended strength:** 65%+

### 1-Hour Chart
- **Best for:** End-of-day traders, swing traders
- **Noise level:** Low
- **Use:** Very reliable signals
- **Recommended strength:** 60%+

### 4-Hour Chart
- **Best for:** Swing traders, position traders
- **Noise level:** Very low
- **Use:** High-confidence setups
- **Recommended strength:** 55%+

### Daily Chart
- **Best for:** Long-term traders
- **Noise level:** Minimal
- **Use:** Major trend changes only
- **Recommended strength:** 50%+

## 🔄 Multi-Indicator Confirmation Strategy

**Best Results:** Multiple indicators confirm

Example BUY setup:
1. ✅ RSI < 30 (oversold)
2. ✅ MACD histogram > 0 (momentum)
3. ✅ EMA20 > EMA50 (trend)
4. ✅ Price > Bollinger lower band (support)
5. ✅ ADX > 25 (strong trend)

**Confidence:** 95%+

## 📊 Advanced Analysis

### Volatility Analysis
- High volatility: Use wider stops, larger position sizing
- Low volatility: Use tighter stops, smaller positions
- Volatility squeeze: Prepare for breakout

### Trend Strength
- ADX 25-40: Normal trend (use trend-following)
- ADX 40+: Strong trend (increase position)
- ADX <20: Weak/ranging (avoid or use reversal)

### Risk/Reward Ratio
- Calculate based on support/resistance levels
- At least 1:2 ratio recommended
- Higher ratios on lower timeframes

## 💡 Pro Tips

1. **Combine timeframes** - Confirm signals across multiple timeframes
2. **Trend first** - Always check larger timeframe trend first
3. **Wait for confirmation** - Don't trade on first indicator signal
4. **Use filters** - Exclude low-volume or news-driven moves
5. **Monitor divergence** - Watch for price/indicator divergence
6. **Adjust for volatility** - Tighter stops in low vol, wider in high vol
7. **Track accuracy** - Note which combinations work best for each coin

## References

- TechnicalIndicators library documentation
- Original TrendTrader repository (khan waipd/trendtrader)
- CME's Futures Markets Education
- Market Microstructure principles
