import { MarketData } from './types.js';
import { IndicatorCalculator } from './indicators.js';

/**
 * Advanced trading strategies
 */
export class StrategyLibrary {
  /**
   * Mean Reversion Strategy - Buy oversold, sell overbought
   */
  static meanReversionStrategy(data: MarketData): { signal: string; strength: number } {
    const indicators = IndicatorCalculator.calculateAllIndicators(data);

    let score = 0;
    if (indicators.rsi < 30) score += 3;
    if (indicators.rsi < 20) score += 2;

    if (data.closes[data.closes.length - 1] < indicators.bollinger.lower) score += 2;

    const signal = score >= 4 ? 'BUY' : score <= -4 ? 'SELL' : 'HOLD';
    const strength = Math.min(100, (score / 5) * 100);

    return { signal, strength };
  }

  /**
   * Trend Following Strategy - Trade with the trend
   */
  static trendFollowingStrategy(data: MarketData): { signal: string; strength: number } {
    const trend = IndicatorCalculator.detectTrend(data);
    const indicators = IndicatorCalculator.calculateAllIndicators(data);

    let score = 0;
    if (trend === 'BULLISH') {
      score += 2;
      if (indicators.macd.histogram > 0) score += 1;
      if (indicators.rsi > 40 && indicators.rsi < 80) score += 1;
    } else if (trend === 'BEARISH') {
      score -= 2;
      if (indicators.macd.histogram < 0) score -= 1;
      if (indicators.rsi < 60 && indicators.rsi > 20) score -= 1;
    }

    let signal = 'HOLD';
    if (score >= 3) signal = 'BUY';
    if (score <= -3) signal = 'SELL';

    const strength = Math.min(100, (Math.abs(score) / 4) * 100);

    return { signal, strength };
  }

  /**
   * Bollinger Band Breakout Strategy
   */
  static bollingerBreakoutStrategy(data: MarketData): { signal: string; strength: number } {
    const { closes } = data;
    const indicators = IndicatorCalculator.calculateAllIndicators(data);
    const currentPrice = closes[closes.length - 1];
    const prevPrice = closes[closes.length - 2];

    let score = 0;

    // Upper breakout
    if (prevPrice <= indicators.bollinger.upper && currentPrice > indicators.bollinger.upper) {
      score += 2;
      if (indicators.rsi > 50) score += 1;
      if (indicators.macd.histogram > 0) score += 1;
    }

    // Lower breakout
    if (prevPrice >= indicators.bollinger.lower && currentPrice < indicators.bollinger.lower) {
      score -= 2;
      if (indicators.rsi < 50) score -= 1;
      if (indicators.macd.histogram < 0) score -= 1;
    }

    let signal = 'HOLD';
    if (score >= 3) signal = 'BUY';
    if (score <= -3) signal = 'SELL';

    const strength = Math.min(100, (Math.abs(score) / 4) * 100);

    return { signal, strength };
  }

  /**
   * MACD Divergence Strategy
   */
  static macdDivergenceStrategy(data: MarketData): { signal: string; strength: number } {
    const { closes, highs, lows } = data;
    const indicators = IndicatorCalculator.calculateAllIndicators(data);

    if (closes.length < 25) {
      return { signal: 'HOLD', strength: 0 };
    }

    const recentCloses = closes.slice(-20);
    const recentMACD = ([] as number[]).fill(0); // Simplified - actual MACD history would go here

    const priceHigh = Math.max(...recentCloses);
    const priceLow = Math.min(...recentCloses);
    const currentPrice = recentCloses[recentCloses.length - 1];

    let score = 0;

    // Bullish divergence: price makes lower low, MACD makes higher low
    if (currentPrice <= priceLow && indicators.macd.histogram > -0.1) {
      score += 3;
    }

    // Bearish divergence: price makes higher high, MACD makes lower high
    if (currentPrice >= priceHigh && indicators.macd.histogram < 0.1) {
      score -= 3;
    }

    let signal = 'HOLD';
    if (score >= 2) signal = 'BUY';
    if (score <= -2) signal = 'SELL';

    const strength = Math.min(100, (Math.abs(score) / 3) * 100);

    return { signal, strength };
  }

  /**
   * RSI + EMA Crossover Strategy
   */
  static rsiEmaStrategy(data: MarketData): { signal: string; strength: number } {
    const { closes } = data;
    const indicators = IndicatorCalculator.calculateAllIndicators(data);
    const currentPrice = closes[closes.length - 1];

    let score = 0;

    // Price above EMA + RSI bullish
    if (currentPrice > indicators.ema20 && indicators.ema20 > indicators.ema50) {
      score += 2;
      if (indicators.rsi > 50) score += 1;
      if (indicators.rsi < 70) score += 1;
    }

    // Price below EMA + RSI bearish
    if (currentPrice < indicators.ema20 && indicators.ema20 < indicators.ema50) {
      score -= 2;
      if (indicators.rsi < 50) score -= 1;
      if (indicators.rsi > 30) score -= 1;
    }

    let signal = 'HOLD';
    if (score >= 3) signal = 'BUY';
    if (score <= -3) signal = 'SELL';

    const strength = Math.min(100, (Math.abs(score) / 4) * 100);

    return { signal, strength };
  }

  /**
   * Volatility Expansion Strategy
   */
  static volatilityExpansionStrategy(data: MarketData): { signal: string; strength: number } {
    const indicators = IndicatorCalculator.calculateAllIndicators(data);
    const volatility = IndicatorCalculator.calculateVolatility(data.closes);

    let score = 0;

    // High volatility + trending
    if (volatility > 0.10) {
      if (indicators.adx > 25) {
        if (indicators.macd.histogram > 0) score += 2;
        if (indicators.macd.histogram < 0) score -= 2;
      }
    }

    let signal = 'HOLD';
    if (score >= 2) signal = 'BUY';
    if (score <= -2) signal = 'SELL';

    const strength = Math.min(100, (Math.abs(score) / 2) * 100);

    return { signal, strength };
  }

  /**
   * Get all strategies results
   */
  static getAllStrategies(
    data: MarketData
  ): Record<
    string,
    {
      signal: string;
      strength: number;
    }
  > {
    return {
      meanReversion: this.meanReversionStrategy(data),
      trendFollowing: this.trendFollowingStrategy(data),
      bollingerBreakout: this.bollingerBreakoutStrategy(data),
      macdDivergence: this.macdDivergenceStrategy(data),
      rsiEma: this.rsiEmaStrategy(data),
      volatilityExpansion: this.volatilityExpansionStrategy(data),
    };
  }

  /**
   * Consensus strategy - use majority vote
   */
  static consensusStrategy(data: MarketData): { signal: string; strength: number; agreement: number } {
    const strategies = this.getAllStrategies(data);

    let buyVotes = 0;
    let sellVotes = 0;
    let totalStrength = 0;

    for (const [name, result] of Object.entries(strategies)) {
      if (result.signal === 'BUY') buyVotes++;
      if (result.signal === 'SELL') sellVotes++;
      totalStrength += result.strength;
    }

    let signal = 'HOLD';
    if (buyVotes > 3) signal = 'BUY';
    if (sellVotes > 3) signal = 'SELL';

    const strength = totalStrength / Object.keys(strategies).length;
    const agreement = (Math.max(buyVotes, sellVotes) / Object.keys(strategies).length) * 100;

    return { signal, strength, agreement };
  }
}
