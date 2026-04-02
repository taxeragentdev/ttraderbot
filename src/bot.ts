import { HyperliquidClient } from './hyperliquid.js';
import { IndicatorCalculator } from './indicators.js';
import { SignalEvaluator } from './signals.js';
import { TelegramBot, BotStats } from './telegram.js';
import { ConfigManager, loadConfig } from './config.js';
import { TradeSignal, BotConfig } from './types.js';

export class TradingBot {
  private config: BotConfig;
  private hyperliquidClient: HyperliquidClient;
  private telegramBot: TelegramBot;
  private isRunning: boolean = false;
  private lastSignals: Map<string, TradeSignal> = new Map();
  private signalHistory: {
    timestamp: number;
    signal: TradeSignal;
  }[] = [];

  constructor(customConfig?: Partial<BotConfig>) {
    this.config = loadConfig(customConfig);
    this.hyperliquidClient = new HyperliquidClient(this.config.hyperliquidApiUrl);
    this.telegramBot = new TelegramBot(
      this.config.telegramBotToken,
      this.config.telegramChatId
    );
  }

  async initialize(): Promise<void> {
    try {
      console.log('🚀 Bot başlatılıyor...');
      await this.telegramBot.initialize();

      const configManager = new ConfigManager(this.config);
      await this.telegramBot.sendStatusUpdate(
        `✅ *Trading Bot Başlatıldı*\n\n${configManager.getConfigInfo()}\n\n💡 Komutlar için /help yazabilirsin!`
      );

      console.log('✅ Bot başarılı şekilde başlatıldı');
    } catch (error) {
      console.error('❌ Bot başlatması başarısız oldu:', error);
      await this.telegramBot.sendErrorAlert('Bot başlatması başarısız oldu', String(error));
      throw error;
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('ℹ️  Bot zaten çalışıyor');
      return;
    }

    this.isRunning = true;
    console.log('▶️  Bot çalışmaya başladı...');

    await this.runAnalysis();

    const intervalId = setInterval(async () => {
      if (this.isRunning) {
        await this.runAnalysis();
      }
    }, this.config.updateInterval);

    setInterval(() => {
      this.telegramBot.updateStats(this.getStatistics());
    }, 10000);

    console.log(`✅ Bot çalışıyor (Güncelleme süresi: ${this.config.updateInterval}ms)`);

    process.on('SIGINT', async () => {
      console.log('\n🛑 Bot kapatılıyor...');
      this.isRunning = false;
      clearInterval(intervalId);
      await this.stop();
    });
  }

  private async runAnalysis(): Promise<void> {
    try {
      for (const symbol of this.config.symbols) {
        await this.analyzeSymbol(symbol);
      }
    } catch (error) {
      console.error('❌ Analiz sırasında hata:', error);
    }
  }

  private async analyzeSymbol(symbol: string): Promise<void> {
    try {
      const interval = this.getIntervalSeconds(this.config.timeframe);
      const marketData = await this.hyperliquidClient.getMarketData(symbol, interval, 200);
      const currentPrice = await this.hyperliquidClient.getCurrentPrice(symbol);

      const signal = SignalEvaluator.evaluateSignal(
        symbol,
        marketData,
        currentPrice,
        this.config.riskManagement.stopLossPct,
        this.config.riskManagement.takeProfitPct
      );

      if (!signal) {
        return;
      }

      if (
        signal.strength < this.config.signalSettings.minStrength ||
        signal.confidence < this.config.signalSettings.minConfidence
      ) {
        return;
      }

      if (signal.type === 'BUY' && !this.config.signalSettings.enableBuySignals) {
        return;
      }
      if (signal.type === 'SELL' && !this.config.signalSettings.enableSellSignals) {
        return;
      }

      const lastSignal = this.lastSignals.get(symbol);
      // Aynı symbol için aynı tip sinyali 15 dakika içinde tekrar gönderme
      if (lastSignal && lastSignal.type === signal.type) {
        const timeSinceLastSignal = Date.now() - (this.signalHistory.find(h => h.signal.symbol === symbol && h.signal.type === signal.type)?.timestamp || 0);
        if (timeSinceLastSignal < 900000) { // 15 dakika = 900000ms
          console.log(`⏭️  ${symbol} ${signal.type} sinyali son 15dk içinde gönderildi, atlanıyor`);
          return;
        }
      }

      await this.telegramBot.sendSignalNotification(signal);

      this.lastSignals.set(symbol, signal);
      this.signalHistory.push({
        timestamp: Date.now(),
        signal,
      });

      if (this.signalHistory.length > 1000) {
        this.signalHistory = this.signalHistory.slice(-1000);
      }

      console.log(`📊 ${symbol} için sinyal: ${signal.type} (${signal.strength.toFixed(0)}%)`);
    } catch (error) {
      console.error(`❌ ${symbol} analiz hatası:`, error);
    }
  }

  private getIntervalSeconds(timeframe: string): number {
    const intervals: Record<string, number> = {
      '1m': 60,
      '5m': 300,
      '15m': 900,
      '1h': 3600,
      '4h': 14400,
      '1d': 86400,
    };
    return intervals[timeframe] || 300;
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    await this.telegramBot.sendStatusUpdate(
      '❌ *Trading Bot Durduruldu*\n\nSinyaller artık gelmez. Yeniden başlatmak için botu yeniden çalıştır.'
    );
    await this.telegramBot.close();
    console.log('✅ Bot kapatıldı');
  }

  getStatistics(): BotStats {
    let buyCount = 0;
    let sellCount = 0;

    this.signalHistory.forEach((item) => {
      if (item.signal.type === 'BUY') buyCount++;
      if (item.signal.type === 'SELL') sellCount++;
    });

    return {
      isRunning: this.isRunning,
      totalSignals: this.signalHistory.length,
      buySignals: buyCount,
      sellSignals: sellCount,
      symbolsMonitored: this.config.symbols.length,
    };
  }

  async test(): Promise<void> {
    try {
      console.log('🧪 Bot bileşenleri test ediliyor...');

      console.log('Telegram bağlantısı test ediliyor...');
      await this.telegramBot.test();

      console.log('Hyperliquid API test ediliyor...');
      const price = await this.hyperliquidClient.getCurrentPrice(this.config.symbols[0]);
      console.log(`✅ ${this.config.symbols[0]} fiyatı alındı: ${price}`);

      console.log('✅ Tüm testler başarılı!');
    } catch (error) {
      console.error('❌ Test başarısız oldu:', error);
      throw error;
    }
  }
}

export default TradingBot;
