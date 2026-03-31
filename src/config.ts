import dotenv from 'dotenv';
import { BotConfig } from './types.js';

// Load environment variables
dotenv.config();

const DEFAULT_CONFIG: BotConfig = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  hyperliquidApiUrl: process.env.HYPERLIQUID_API_URL || 'https://api.hyperliquid.xyz',
  symbols: (process.env.TRADING_SYMBOLS || 'BTC,ETH').split(','),
  timeframe: (process.env.TIMEFRAME as any) || '5m',
  updateInterval: parseInt(process.env.UPDATE_INTERVAL || '300000', 10), // 5 minutes
  riskManagement: {
    maxPositionSize: parseFloat(process.env.MAX_POSITION_SIZE || '0.1'),
    maxLossPct: parseFloat(process.env.MAX_LOSS_PCT || '2'),
    takeProfitPct: parseFloat(process.env.TAKE_PROFIT_PCT || '5'),
    stopLossPct: parseFloat(process.env.STOP_LOSS_PCT || '2'),
  },
  signalSettings: {
    minStrength: parseFloat(process.env.MIN_SIGNAL_STRENGTH || '60'),
    minConfidence: parseFloat(process.env.MIN_SIGNAL_CONFIDENCE || '50'),
    enableBuySignals: process.env.ENABLE_BUY_SIGNALS !== 'false',
    enableSellSignals: process.env.ENABLE_SELL_SIGNALS !== 'false',
  },
};

export class ConfigManager {
  private config: BotConfig;

  constructor(customConfig?: Partial<BotConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
    this.validate();
  }

  /**
   * Validate configuration
   */
  private validate(): void {
    if (!this.config.telegramBotToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is required');
    }
    if (!this.config.telegramChatId) {
      throw new Error('TELEGRAM_CHAT_ID is required');
    }
    if (!this.config.symbols || this.config.symbols.length === 0) {
      throw new Error('At least one trading symbol is required');
    }
    if (
      this.config.signalSettings.minStrength < 0 ||
      this.config.signalSettings.minStrength > 100
    ) {
      throw new Error('minStrength must be between 0 and 100');
    }
  }

  /**
   * Get configuration
   */
  getConfig(): BotConfig {
    return this.config;
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<BotConfig>): void {
    this.config = { ...this.config, ...updates };
    this.validate();
  }

  /**
   * Get formatted config info
   */
  getConfigInfo(): string {
    return `
╔═══════════════════════════════════╗
║     TRADING BOT CONFIGURATION     ║
╚═══════════════════════════════════╝

🔐 Telegram:
   Bot Token: ${this.config.telegramBotToken.substring(0, 10)}...
   Chat ID: ${this.config.telegramChatId}

📊 Trading:
   Symbols: ${this.config.symbols.join(', ')}
   Timeframe: ${this.config.timeframe}
   Update Interval: ${this.config.updateInterval}ms

💰 Risk Management:
   Max Position Size: ${this.config.riskManagement.maxPositionSize * 100}%
   Max Loss: ${this.config.riskManagement.maxLossPct}%
   Take Profit: ${this.config.riskManagement.takeProfitPct}%
   Stop Loss: ${this.config.riskManagement.stopLossPct}%

⚙️  Signal Settings:
   Min Strength: ${this.config.signalSettings.minStrength}%
   Min Confidence: ${this.config.signalSettings.minConfidence}%
   Buy Signals: ${this.config.signalSettings.enableBuySignals ? '✅' : '❌'}
   Sell Signals: ${this.config.signalSettings.enableSellSignals ? '✅' : '❌'}
    `;
  }
}

export function loadConfig(customConfig?: Partial<BotConfig>): BotConfig {
  const manager = new ConfigManager(customConfig);
  return manager.getConfig();
}
