/**
 * Utility functions for the trading bot
 */

export class Utils {
  /**
   * Format number to currency
   */
  static formatCurrency(value: number, decimals: number = 2): string {
    return value.toFixed(decimals);
  }

  /**
   * Format percentage
   */
  static formatPercentage(value: number, decimals: number = 2): string {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  /**
   * Format date/time
   */
  static formatDateTime(timestamp: number): string {
    return new Date(timestamp).toISOString();
  }

  /**
   * Sleep/delay function
   */
  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry function with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          const backoffDelay = delay * Math.pow(2, i);
          await this.sleep(backoffDelay);
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Calculate percentage change
   */
  static calculatePercentageChange(oldValue: number, newValue: number): number {
    return ((newValue - oldValue) / oldValue) * 100;
  }

  /**
   * Calculate moving average
   */
  static calculateMovingAverage(values: number[], period: number): number[] {
    if (values.length < period) {
      return [];
    }

    const result: number[] = [];
    for (let i = period - 1; i < values.length; i++) {
      const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }

    return result;
  }

  /**
   * Calculate standard deviation
   */
  static calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculate min and max
   */
  static calculateMinMax(
    values: number[]
  ): {
    min: number;
    max: number;
    avg: number;
  } {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    return { min, max, avg };
  }

  /**
   * Normalize values to 0-1 range
   */
  static normalize(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
  }

  /**
   * Denormalize values from 0-1 range
   */
  static denormalize(normalizedValue: number, min: number, max: number): number {
    return normalizedValue * (max - min) + min;
  }

  /**
   * Parse symbol from trading pair
   */
  static parseSymbol(symbol: string): { base: string; quote: string } {
    // Remove common suffixes
    const cleaned = symbol.replace(/(USDT|USD|PERP)$/, '');
    return {
      base: cleaned,
      quote: symbol.includes('USDT') ? 'USDT' : 'USD',
    };
  }

  /**
   * Validate trading symbol
   */
  static isValidSymbol(symbol: string): boolean {
    // Basic validation - at least 2 characters, alphanumeric
    return /^[A-Z0-9]{2,}$/.test(symbol);
  }

  /**
   * Get market cap category
   */
  static getMarketCapCategory(
    symbol: string
  ): 'LARGE_CAP' | 'MID_CAP' | 'SMALL_CAP' | 'UNKNOWN' {
    // This would typically query an API
    // For now, simple heuristic based on symbol
    const largeCap = ['BTC', 'ETH'];
    const midCap = ['SOL', 'AVAX', 'MATIC', 'ARB'];
    const smallCap = [
      'MEME',
      'DOGE',
      'SHIB',
      'FLOKI',
    ];

    if (largeCap.includes(symbol)) return 'LARGE_CAP';
    if (midCap.includes(symbol)) return 'MID_CAP';
    if (smallCap.includes(symbol)) return 'SMALL_CAP';

    return 'UNKNOWN';
  }

  /**
   * Get risk category
   */
  static getRiskCategory(volatility: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' {
    if (volatility < 0.05) return 'LOW';
    if (volatility < 0.10) return 'MEDIUM';
    if (volatility < 0.20) return 'HIGH';
    return 'EXTREME';
  }

  /**
   * Map hex color to mood
   */
  static getMoodColor(signal: string): string {
    const colors: Record<string, string> = {
      BUY: '🟢',
      SELL: '🔴',
      CLOSE: '🟡',
      HOLD: '⚪',
    };
    return colors[signal] || '⚪';
  }

  /**
   * Validate telegram bot token format
   */
  static isValidTelegramToken(token: string): boolean {
    // Format: number:token
    return /^\d+:[a-zA-Z0-9_-]{27}$/i.test(token);
  }

  /**
   * Validate configuration object
   */
  static validateConfig(config: any): boolean {
    const required = ['telegramBotToken', 'telegramChatId', 'symbols'];
    return required.every((key) => key in config && config[key]);
  }
}
