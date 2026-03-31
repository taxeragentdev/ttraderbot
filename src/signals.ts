import { TradeSignal, IndicatorValues, MarketData } from './types.js';
import { IndicatorCalculator } from './indicators.js';

export class SignalEvaluator {
  /**
   * Generate comprehensive trade signal based on multiple indicators
   */
  static evaluateSignal(
    symbol: string,
    marketData: MarketData,
    currentPrice: number,
    stopLossPct: number = 2,
    takeProfitPct: number = 5
  ): TradeSignal | null {
    const indicators = IndicatorCalculator.calculateAllIndicators(marketData);
    const trend = IndicatorCalculator.detectTrend(marketData);
    const patterns = IndicatorCalculator.detectPatterns(marketData);
    const volatility = IndicatorCalculator.calculateVolatility(marketData.closes);

    const { signal, strength, confidence, indicators: signalIndicators } = this.evaluateConditions(
      indicators,
      trend,
      patterns,
      volatility
    );

    if (!signal) {
      return null;
    }

    // Trading seviyeleri hesapla
    let entryPrice = currentPrice;
    let stopLoss = 0;
    let targetPrice = 0;

    if (signal === 'BUY') {
      stopLoss = currentPrice * (1 - stopLossPct / 100);
      targetPrice = currentPrice * (1 + takeProfitPct / 100);
    } else if (signal === 'SELL') {
      stopLoss = currentPrice * (1 + stopLossPct / 100);
      targetPrice = currentPrice * (1 - takeProfitPct / 100);
    }

    const riskReward = Math.abs((targetPrice - entryPrice) / (entryPrice - stopLoss));

    const message = this.generateMessage(
      symbol,
      signal,
      strength,
      confidence,
      indicators,
      patterns,
      entryPrice,
      stopLoss,
      targetPrice,
      riskReward
    );

    return {
      symbol,
      type: signal,
      strength,
      confidence,
      indicators: signalIndicators,
      timestamp: Date.now(),
      price: currentPrice,
      message,
      entryPrice,
      stopLoss,
      targetPrice,
      riskReward,
    };
  }

  /**
   * Evaluate trading conditions and determine signal
   */
  private static evaluateConditions(
    indicators: IndicatorValues,
    trend: string,
    patterns: string[],
    volatility: number
  ): {
    signal: 'BUY' | 'SELL' | 'CLOSE' | null;
    strength: number;
    confidence: number;
    indicators: any;
  } {
    let buySignalCount = 0;
    let sellSignalCount = 0;
    const signalIndices: any = {};

    // ========== RSI Analysis ==========
    let rsiSignal = 'NEUTRAL';
    if (indicators.rsi < 30) {
      buySignalCount += 2;
      rsiSignal = 'OVERSOLD';
    } else if (indicators.rsi < 40) {
      buySignalCount += 1;
      rsiSignal = 'WEAK';
    } else if (indicators.rsi > 70) {
      sellSignalCount += 2;
      rsiSignal = 'OVERBOUGHT';
    } else if (indicators.rsi > 60) {
      sellSignalCount += 1;
      rsiSignal = 'STRONG';
    }
    signalIndices.rsi = { value: indicators.rsi.toFixed(2), signal: rsiSignal };

    // ========== MACD Analysis ==========
    let macdSignal = 'NEUTRAL';
    if (indicators.macd.histogram > 0 && indicators.macd.line > indicators.macd.signal) {
      buySignalCount += 2;
      macdSignal = 'BULLISH_CROSS';
    } else if (indicators.macd.histogram < 0 && indicators.macd.line < indicators.macd.signal) {
      sellSignalCount += 2;
      macdSignal = 'BEARISH_CROSS';
    } else if (indicators.macd.histogram > 0) {
      buySignalCount += 1;
      macdSignal = 'BULLISH';
    } else if (indicators.macd.histogram < 0) {
      sellSignalCount += 1;
      macdSignal = 'BEARISH';
    }
    signalIndices.macd = { signal: macdSignal };

    // ========== EMA Analysis ==========
    const emaOrder = indicators.ema20 > indicators.ema50 ? indicators.ema50 > indicators.ema200 : false;
    const emaReverseOrder = indicators.ema20 < indicators.ema50 ? indicators.ema50 < indicators.ema200 : false;

    if (emaOrder) {
      buySignalCount += 2;
    } else if (emaReverseOrder) {
      sellSignalCount += 2;
    }

    // ========== Price Position Analysis ==========
    if (indicators.bollinger.middle > 0) {
      // Price position analysis will be added in main evaluation
    }

    // ========== ADX Trend Strength ==========
    if (indicators.adx > 25) {
      // Strong trend
      if (trend === 'BULLISH') {
        buySignalCount += 1;
      } else if (trend === 'BEARISH') {
        sellSignalCount += 1;
      }
    }

    // ========== Pattern Analysis ==========
    if (patterns.includes('HIGHER_HIGH') || patterns.includes('HIGHER_LOW')) {
      buySignalCount += 1;
    }
    if (patterns.includes('LOWER_LOW') || patterns.includes('LOWER_HIGH')) {
      sellSignalCount += 1;
    }
    if (patterns.includes('TRIANGLE_CONTRACTION')) {
      // Prepare for breakout
      if (trend === 'BULLISH') {
        buySignalCount += 1;
      } else if (trend === 'BEARISH') {
        sellSignalCount += 1;
      }
    }

    // ========== Volatility Consideration ==========
    const isVolatile = volatility > 0.15; // Adjust threshold as needed
    if (isVolatile) {
      // Reduce confidence in high volatility
      buySignalCount *= 0.8;
      sellSignalCount *= 0.8;
    }

    // ========== Final Decision ==========
    let signal: 'BUY' | 'SELL' | 'CLOSE' | null = null;
    let strength = 0;
    let confidence = 0;

    const totalSignals = buySignalCount + sellSignalCount;
    if (totalSignals > 0) {
      strength = Math.min(100, (Math.max(buySignalCount, sellSignalCount) / totalSignals) * 100);
      confidence = Math.min(100, totalSignals * 10);

      if (buySignalCount > sellSignalCount * 1.5) {
        signal = 'BUY';
      } else if (sellSignalCount > buySignalCount * 1.5) {
        signal = 'SELL';
      } else if (Math.abs(buySignalCount - sellSignalCount) < 1) {
        signal = 'CLOSE'; // Conflicting signals, close position
      }
    }

    signalIndices.trend = trend;
    signalIndices.pattern = patterns.join(', ');

    return { signal, strength, confidence, indicators: signalIndices };
  }

  /**
   * Generate formatted message for the signal
   */
  private static generateMessage(
    symbol: string,
    signal: string,
    strength: number,
    confidence: number,
    indicators: IndicatorValues,
    patterns: string[],
    entryPrice: number,
    stopLoss: number,
    targetPrice: number,
    riskReward: number
  ): string {
    const emoji = signal === 'BUY' ? '🟢' : signal === 'SELL' ? '🔴' : '🟡';
    const bars = Math.round(strength / 10);
    const strengthBar = '█'.repeat(bars) + '░'.repeat(10 - bars);

    let message = `${emoji} *${signal} SIGNAL - ${symbol}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `Güç: ${strengthBar} ${strength.toFixed(0)}%\n`;
    message += `Güven: ${confidence.toFixed(0)}%\n`;
    message += `Risk/Reward: ${riskReward.toFixed(2)}:1\n\n`;

    // Trading Seviyeleri
    message += `📍 *TRADİNG SEVİYELERİ*\n`;
    message += `Entry Price: $${entryPrice.toFixed(2)}\n`;
    message += `Stop Loss: $${stopLoss.toFixed(2)} ${signal === 'BUY' ? '⬇️' : '⬆️'}\n`;
    message += `Target Price: $${targetPrice.toFixed(2)} ${signal === 'BUY' ? '⬆️' : '⬇️'}\n`;
    message += `Potential Loss: -$${Math.abs(entryPrice - stopLoss).toFixed(2)}\n`;
    message += `Potential Gain: +$${Math.abs(targetPrice - entryPrice).toFixed(2)}\n\n`;

    // İndikatörler
    message += `📊 *İNDİKATÖRLER*\n`;
    message += `RSI: ${indicators.rsi.toFixed(2)} (${indicators.rsi > 70 ? '⚠️ ÇOK Yüksek' : indicators.rsi < 30 ? '⚠️ ÇOK Düşük' : '✅ Normal'})\n`;
    message += `MACD: ${indicators.macd.histogram > 0 ? '📈 Yükseliş' : '📉 Düşüş'}\n`;
    message += `ADX: ${indicators.adx.toFixed(2)} (${indicators.adx > 25 ? '💪 Güçlü Trend' : '⚠️ Zayıf Trend'})\n\n`;

    // Desenleri göster
    if (patterns.length > 0) {
      message += `🎯 *DESENLERI*\n`;
      message += `${patterns.join(', ')}\n\n`;
    }

    // Risk tavsiyesi
    message += `⚠️ *TAVSİYELER*\n`;
    message += `• Risk/Reward: ${riskReward.toFixed(2)}:1 (Ideal: >2:1)\n`;
    message += `• Volatilite: ${indicators.atr.toFixed(2)}\n`;
    message += `• Gereken İnişli: ${new Date().toLocaleString('tr-TR')}\n\n`;

    message += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `⏰ Saat: ${new Date().toLocaleString('tr-TR')}`;

    return message;
  }
}
