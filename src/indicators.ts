import {
  RSI,
  MACD,
  EMA,
  BollingerBands,
  ATR,
  ADX,
  Stochastic,
  StochasticRSI,
  WilliamsR,
} from 'technicalindicators';
import { IndicatorValues, MarketData } from './types.js';

export class IndicatorCalculator {
  /**
   * Calculate RSI (Relative Strength Index)
   */
  static calculateRSI(closes: number[], period: number = 14): number {
    if (closes.length < period + 1) {
      return 50; // neutral
    }

    const rsiValues = RSI.calculate({ values: closes, period });
    return rsiValues.length > 0 ? rsiValues[rsiValues.length - 1] : 50;
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   */
  static calculateMACD(
    closes: number[]
  ): { line: number; signal: number; histogram: number } {
    if (closes.length < 26) {
      return { line: 0, signal: 0, histogram: 0 };
    }

    const macdValues = MACD.calculate({
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    });

    const latestMACD = macdValues[macdValues.length - 1];
    return {
      line: latestMACD?.MACD || 0,
      signal: latestMACD?.signal || 0,
      histogram: latestMACD?.histogram || 0,
    };
  }

  /**
   * Calculate EMA (Exponential Moving Average)
   */
  static calculateEMA(closes: number[], period: number): number {
    if (closes.length < period) {
      return closes[closes.length - 1];
    }

    const emaValues = EMA.calculate({ values: closes, period });
    return emaValues.length > 0 ? emaValues[emaValues.length - 1] : closes[closes.length - 1];
  }

  /**
   * Calculate Bollinger Bands
   */
  static calculateBollingerBands(
    closes: number[],
    period: number = 20,
    stdDev: number = 2
  ): { upper: number; middle: number; lower: number } {
    if (closes.length < period) {
      return { upper: 0, middle: 0, lower: 0 };
    }

    const bbValues = BollingerBands.calculate({ values: closes, period, stdDev });
    const latest = bbValues[bbValues.length - 1];

    return {
      upper: latest?.upper || 0,
      middle: latest?.middle || 0,
      lower: latest?.lower || 0,
    };
  }

  /**
   * Calculate ATR (Average True Range)
   */
  static calculateATR(
    highs: number[],
    lows: number[],
    closes: number[],
    period: number = 14
  ): number {
    if (closes.length < period) {
      return 0;
    }

    const atrValues = ATR.calculate({ high: highs, low: lows, close: closes, period });
    return atrValues.length > 0 ? atrValues[atrValues.length - 1] : 0;
  }

  /**
   * Calculate ADX (Average Directional Index)
   */
  static calculateADX(
    highs: number[],
    lows: number[],
    closes: number[],
    period: number = 14
  ): number {
    if (closes.length < period) {
      return 0;
    }

    const adxValues = ADX.calculate({ high: highs, low: lows, close: closes, period });
    const latest = adxValues[adxValues.length - 1];
    return latest?.adx || 0;
  }

  /**
   * Calculate Stochastic Oscillator
   */
  static calculateStochastic(
    highs: number[],
    lows: number[],
    closes: number[],
    period: number = 14
  ): { k: number; d: number } {
    if (closes.length < period) {
      return { k: 50, d: 50 };
    }

    const stochValues = Stochastic.calculate({
      high: highs,
      low: lows,
      close: closes,
      period,
      signalPeriod: 3,
    });

    const latest = stochValues[stochValues.length - 1];
    return {
      k: latest?.k || 50,
      d: latest?.d || 50,
    };
  }

  /**
   * Calculate Stochastic RSI
   */
  static calculateStochasticRSI(
    closes: number[],
    rsiPeriod: number = 14,
    stochasticPeriod: number = 14,
    kPeriod: number = 3,
    dPeriod: number = 3
  ): { k: number; d: number } {
    if (closes.length < rsiPeriod + stochasticPeriod) {
      return { k: 50, d: 50 };
    }

    const srsiValues = StochasticRSI.calculate({
      values: closes,
      rsiPeriod,
      stochasticPeriod,
      kPeriod,
      dPeriod,
    });

    const latest = srsiValues[srsiValues.length - 1];
    return {
      k: latest?.k || 50,
      d: latest?.d || 50,
    };
  }

  /**
   * Calculate Williams %R
   */
  static calculateWilliamsR(
    highs: number[],
    lows: number[],
    closes: number[],
    period: number = 14
  ): number {
    if (closes.length < period) {
      return -50;
    }

    const wrValues = WilliamsR.calculate({ high: highs, low: lows, close: closes, period });
    return wrValues.length > 0 ? wrValues[wrValues.length - 1] : -50;
  }

  /**
   * Calculate all indicators at once
   */
  static calculateAllIndicators(data: MarketData): IndicatorValues {
    const { closes, highs, lows, volumes } = data;

    const rsi = this.calculateRSI(closes);
    const macd = this.calculateMACD(closes);
    const ema20 = this.calculateEMA(closes, 20);
    const ema50 = this.calculateEMA(closes, 50);
    const ema200 = this.calculateEMA(closes, 200);
    const bollinger = this.calculateBollingerBands(closes);
    const atr = this.calculateATR(highs, lows, closes);
    const adx = this.calculateADX(highs, lows, closes);

    return {
      rsi,
      macd,
      ema20,
      ema50,
      ema200,
      bollinger,
      atr,
      adx,
    };
  }

  /**
   * Detect trend direction
   */
  static detectTrend(data: MarketData): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    const { closes, highs, lows } = data;
    const indicators = this.calculateAllIndicators(data);

    let bullishSignals = 0;
    let bearishSignals = 0;

    // EMA trend
    if (closes[closes.length - 1] > indicators.ema20 && 
        indicators.ema20 > indicators.ema50 && 
        indicators.ema50 > indicators.ema200) {
      bullishSignals += 2;
    } else if (closes[closes.length - 1] < indicators.ema20 && 
               indicators.ema20 < indicators.ema50 && 
               indicators.ema50 < indicators.ema200) {
      bearishSignals += 2;
    }

    // RSI trend
    if (indicators.rsi > 50) {
      bullishSignals += 1;
    } else if (indicators.rsi < 50) {
      bearishSignals += 1;
    }

    // MACD trend
    if (indicators.macd.histogram > 0 && indicators.macd.line > indicators.macd.signal) {
      bullishSignals += 2;
    } else if (indicators.macd.histogram < 0 && indicators.macd.line < indicators.macd.signal) {
      bearishSignals += 2;
    }

    // ADX trend strength
    if (indicators.adx > 25) {
      // Strong trend (add to whichever is leading)
      if (bullishSignals > bearishSignals) {
        bullishSignals += 1;
      } else if (bearishSignals > bullishSignals) {
        bearishSignals += 1;
      }
    }

    if (bullishSignals > bearishSignals) {
      return 'BULLISH';
    } else if (bearishSignals > bullishSignals) {
      return 'BEARISH';
    }
    return 'NEUTRAL';
  }

  /**
   * Detect chart patterns
   */
  static detectPatterns(data: MarketData): string[] {
    const { closes, highs, lows } = data;
    const patterns: string[] = [];

    if (closes.length < 20) {
      return patterns;
    }

    const recentHighs = highs.slice(-20);
    const recentLows = lows.slice(-20);
    const recentCloses = closes.slice(-20);

    const currentHigh = recentHighs[recentHighs.length - 1];
    const currentLow = recentLows[recentLows.length - 1];
    const prevHigh = Math.max(...recentHighs.slice(0, -1));
    const prevLow = Math.min(...recentLows.slice(0, -1));

    // Higher High / Lower Low patterns
    if (currentHigh > prevHigh) {
      patterns.push('HIGHER_HIGH');
    }
    if (currentLow < prevLow) {
      patterns.push('LOWER_LOW');
    }
    if (currentHigh < prevHigh && currentLow > prevLow) {
      patterns.push('TRIANGLE_CONTRACTION');
    }

    // Support/Resistance levels
    const currentPrice = recentCloses[recentCloses.length - 1];
    if (Math.abs(currentPrice - currentHigh) / currentHigh < 0.005) {
      patterns.push('AT_RESISTANCE');
    }
    if (Math.abs(currentPrice - currentLow) / currentLow < 0.005) {
      patterns.push('AT_SUPPORT');
    }

    return patterns;
  }

  /**
   * Calculate volatility (annualized)
   */
  static calculateVolatility(closes: number[], period: number = 14): number {
    if (closes.length < period) {
      return 0;
    }

    const returns: number[] = [];
    for (let i = 1; i < closes.length; i++) {
      returns.push((closes[i] - closes[i - 1]) / closes[i - 1]);
    }

    const recentReturns = returns.slice(-period);
    const mean = recentReturns.reduce((a, b) => a + b, 0) / period;
    const variance = recentReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    return stdDev * Math.sqrt(365); // Annualized
  }
}
