import axios, { AxiosInstance } from 'axios';
import { Candle, MarketData } from './types.js';

export class HyperliquidClient {
  private apiUrl: string;
  private axiosInstance: AxiosInstance;

  constructor(apiUrl: string = 'https://api.hyperliquid.xyz') {
    this.apiUrl = apiUrl;
    this.axiosInstance = axios.create({
      baseURL: apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Fetch OHLCV data from Hyperliquid
   */
  async getCandles(
    symbol: string,
    interval: number = 60, // in seconds
    limit: number = 100
  ): Promise<Candle[]> {
    try {
      const response = await this.axiosInstance.post('/info', {
        type: 'candleSnapshot',
        req: {
          coin: symbol,
          interval: interval * 1000, // convert to milliseconds
          startTime: Date.now() - limit * interval * 1000,
          endTime: Date.now(),
        },
      });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format');
      }

      return response.data.map((candle: any) => ({
        timestamp: candle.t,
        open: parseFloat(candle.o),
        high: parseFloat(candle.h),
        low: parseFloat(candle.l),
        close: parseFloat(candle.c),
        volume: parseFloat(candle.v),
      }));
    } catch (error) {
      console.error(`Error fetching candles for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Get current price for a symbol
   */
  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const response = await this.axiosInstance.post('/info', {
        type: 'allMids',
      });

      const price = response.data?.[symbol];
      if (!price) {
        throw new Error(`Symbol ${symbol} not found`);
      }

      return parseFloat(price);
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Get market data for analysis
   */
  async getMarketData(
    symbol: string,
    interval: number = 60,
    limit: number = 200
  ): Promise<MarketData> {
    const candles = await this.getCandles(symbol, interval, limit);

    return {
      closes: candles.map(c => c.close),
      highs: candles.map(c => c.high),
      lows: candles.map(c => c.low),
      volumes: candles.map(c => c.volume),
      timestamps: candles.map(c => c.timestamp),
    };
  }

  /**
   * Get funding rates
   */
  async getFundingRate(symbol: string): Promise<number> {
    try {
      const response = await this.axiosInstance.post('/info', {
        type: 'fundingHistory',
        req: {
          coin: symbol,
          startTime: Date.now() - 3600000, // Last hour
          endTime: Date.now(),
        },
      });

      if (!response.data || response.data.length === 0) {
        return 0;
      }

      return parseFloat(response.data[0].fundingRate);
    } catch (error) {
      console.error(`Error fetching funding rate for ${symbol}:`, error);
      return 0;
    }
  }

  /**
   * Get 24h trading volume and price change
   */
  async get24hStats(symbol: string): Promise<{
    volume24h: number;
    priceChange24h: number;
    priceChangePct24h: number;
  }> {
    try {
      const now = Date.now();
      const candles = await this.getCandles(symbol, 3600, 24); // 24 hourly candles

      if (candles.length < 2) {
        return { volume24h: 0, priceChange24h: 0, priceChangePct24h: 0 };
      }

      const volume24h = candles.reduce((sum, c) => sum + c.volume, 0);
      const openPrice = candles[0].open;
      const closePrice = candles[candles.length - 1].close;
      const priceChange24h = closePrice - openPrice;
      const priceChangePct24h = (priceChange24h / openPrice) * 100;

      return {
        volume24h,
        priceChange24h,
        priceChangePct24h,
      };
    } catch (error) {
      console.error(`Error fetching 24h stats for ${symbol}:`, error);
      return { volume24h: 0, priceChange24h: 0, priceChangePct24h: 0 };
    }
  }
}
