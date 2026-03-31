export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorValues {
  rsi: number;
  macd: {
    line: number;
    signal: number;
    histogram: number;
  };
  ema20: number;
  ema50: number;
  ema200: number;
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  atr: number;
  adx: number;
}

export interface TradeSignal {
  symbol: string;
  type: 'BUY' | 'SELL' | 'CLOSE';
  strength: number; // 0-100
  confidence: number; // 0-100
  indicators: {
    rsi?: { value: number; signal: string };
    macd?: { signal: string };
    trend?: string;
    pattern?: string;
  };
  timestamp: number;
  price: number;
  message: string;
  // Trading seviyeleri
  entryPrice: number;
  stopLoss: number;
  targetPrice: number;
  riskReward: number;
}

export interface BotConfig {
  telegramBotToken: string;
  telegramChatId: string;
  hyperliquidApiUrl: string;
  symbols: string[];
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  updateInterval: number; // milliseconds
  riskManagement: {
    maxPositionSize: number;
    maxLossPct: number;
    takeProfitPct: number;
    stopLossPct: number;
  };
  signalSettings: {
    minStrength: number;
    minConfidence: number;
    enableBuySignals: boolean;
    enableSellSignals: boolean;
  };
}

export interface MarketData {
  closes: number[];
  highs: number[];
  lows: number[];
  volumes: number[];
  timestamps: number[];
}

export interface SignalResult {
  triggered: boolean;
  signal: any;
  details: {
    description: string;
    currentValues?: Record<string, number>;
    previousValues?: Record<string, number>;
    metadata?: Record<string, any>;
  };
  timestamp: number;
}

export interface BotStats {
  isRunning: boolean;
  totalSignals: number;
  buySignals: number;
  sellSignals: number;
  symbolsMonitored: number;
}
