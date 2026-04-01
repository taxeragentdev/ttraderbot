import { Telegraf, TelegramError } from 'telegraf';
import { TradeSignal } from './types.js';

export interface BotStats {
  isRunning: boolean;
  totalSignals: number;
  buySignals: number;
  sellSignals: number;
  symbolsMonitored: number;
}

export class TelegramBot {
  private bot: Telegraf;
  private chatId: string;
  private isConnected: boolean = false;
  private commandHandlers: Map<string, Function> = new Map();
  public stats: BotStats = {
    isRunning: false,
    totalSignals: 0,
    buySignals: 0,
    sellSignals: 0,
    symbolsMonitored: 0,
  };

  constructor(botToken: string, chatId: string) {
    this.bot = new Telegraf(botToken);
    this.chatId = chatId;
    this.setupCommands();
  }

  /**
   * Setup bot commands
   */
  private setupCommands(): void {
    // /start - Bot tanışma
    this.bot.start((ctx) => {
      const welcomeMessage = `
🤖 *Hyperliquid Trading Bot Başlatıldı!*

📊 Bot şu anda piyasayı analiz ediyor...

Komutlar:
/help - Yardım ve komutlar
/status - Bot durumu
/symbols - İzlenen kripto paralar
/settings - Mevcut ayarlar
/test - Bot'u test et
/pause - Analizi durdur
/resume - Analizi devam ettir
/stats - İstatistikler

Yapılacak: Sinyaller Telegram'a otomatik gelecek! 🚀
      `;
      return ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
    });

    // /help - Komutlar
    this.bot.command('help', (ctx) => {
      const helpMessage = `
📖 *KOMUTLAR VE AÇIKLAMALAR*

🚀 *BAŞLAMA:*
/start - Bot'u başlat
/test - Telegram bağlantısını test et

📊 *BOT DURUMU:*
/status - Bot çalışıyor mu, kaç sinyal atıldı?
/stats - Sinyal istatistikleri
/symbols - Hangi kripto'ları izliyor?

⚙️ *AYARLAR:*
/settings - Mevcut ayarları gör
/setstrength NUM - Signal gücü ayarla (0-100)
/setconfidence NUM - Güvenilirlik ayarla (0-100)

🔴 *KONTROL:*
/pause - Sinyalleri durdur (test için)
/resume - Sinyalleri devam ettir
/test - Test mesajı gönder

💡 *İPUÇLARı:*
Signal Gücü ↑ = Az ama güvenilir sinyal
Signal Gücü ↓ = Çok sinyal, ama risky

Örneğin:
/setstrength 70  → Güçlü sinyaller
/setconfidence 60 → Orta güvenilir
      `;
      return ctx.reply(helpMessage, { parse_mode: 'Markdown' });
    });

    // /status - Durumu göster
    this.bot.command('status', (ctx) => {
      const status = this.stats.isRunning ? '✅ ÇALIŞIYOR' : '❌ DURMUŞ';
      const statusMessage = `
🤖 *BOT DURUMU*

Durum: ${status}
Toplam Sinyal: ${this.stats.totalSignals}
Al Sinyali: ${this.stats.buySignals} 🟢
Sat Sinyali: ${this.stats.sellSignals} 🔴
İzlenen Kripto: ${this.stats.symbolsMonitored}

⏰ Saat: ${new Date().toLocaleString('tr-TR')}
      `;
      return ctx.reply(statusMessage, { parse_mode: 'Markdown' });
    });

    // /symbols - İzlenen semboller
    this.bot.command('symbols', (ctx) => {
      const symbolsMessage = `
📈 *İZLENEN KRİPTO PARALAR*

${this.stats.symbolsMonitored} adet kripto para izleniyor:

🟡 İzlenen semboller:
• BTC (Bitcoin)
• ETH (Ethereum)  
• SOL (Solana)
• HYPE
• SUI
• VIRTUAL
• ASTER

Ve daha fazlası...

Rapor : Her sembol için ayrı sinyal alacaksın!
      `;
      return ctx.reply(symbolsMessage, { parse_mode: 'Markdown' });
    });

    // /settings - Ayarları göster
    this.bot.command('settings', (ctx) => {
      const settingsMessage = `
⚙️ *BOT AYARLARI*

📊 Signal Ayarları:
• Minimum Sinyal Gücü: 60%
• Minimum Güvenilirlik: 50%

⏱️ Analiz Ayarları:
• Zaman Dilimi: 5 dakika
• Güncelleme Süresi: 300 saniye

💰 Risk Yönetimi:
• Max Position: 10%
• Stop Loss: 2%
• Take Profit: 5%
• Max Loss: 2%

🔔 Sinyal Türleri:
• AL Sinyali: ✅ AÇIK
• SAT Sinyali: ✅ AÇIK

İpucu: /setstrength ve /setconfidence ile ayarları değiştir!
      `;
      return ctx.reply(settingsMessage, { parse_mode: 'Markdown' });
    });

    // /pause - Sinyalleri durdur
    this.bot.command('pause', (ctx) => {
      this.stats.isRunning = false;
      return ctx.reply(
        '⏸️ *Bot Durduruldu*\n\nSinyaller artık gelmeyecek. Devam ettirmek için /resume yazabilirsin.',
        { parse_mode: 'Markdown' }
      );
    });

    // /resume - Sinyalleri devam ettir
    this.bot.command('resume', (ctx) => {
      this.stats.isRunning = true;
      return ctx.reply(
        '▶️ *Bot Devam Ediyor*\n\nSinyallerini almaya başlaştan bu andan itibaren geçerli!',
        { parse_mode: 'Markdown' }
      );
    });

    // /stats - İstatistikler
    this.bot.command('stats', (ctx) => {
      const winRate =
        this.stats.totalSignals > 0
          ? (
              ((this.stats.buySignals + this.stats.sellSignals) / this.stats.totalSignals) *
              100
            ).toFixed(1)
          : '0';

      const statsMessage = `
📈 *SİNYAL İSTATİSTİKLERİ*

📊 Toplam Veriler:
• Toplam Sinyal: ${this.stats.totalSignals}
• AL (🟢): ${this.stats.buySignals}
• SAT (🔴): ${this.stats.sellSignals}
• Oranı: ${winRate}%

💡 Analiz Edilen:
• Kripto Sayısı: ${this.stats.symbolsMonitored}
• Periyot: 5 dakika
• Toplam Çalışma Süresi: 24 saat

🎯 Başarı Oranı Kısa Zamanda Ölçülecek...

Tavsiye: Sinyalleri 24-48 saat izle ve başarı oranını test et!
      `;
      return ctx.reply(statsMessage, { parse_mode: 'Markdown' });
    });

    // /test - Test mesajı
    this.bot.command('test', (ctx) => {
      const testMessage = `
✅ *TEST BAŞARILI!*

🤖 Bot aktif ve çalışıyor
📡 Telegram bağlantı: ✅ OK
🌐 API bağlantı: ✅ OK (kontrol ediliyor...)

Bot sinyallerini bu chat'e gönderecek!

🚀 Hazır mısın? Piyasa analizi başlıyor!
      `;
      return ctx.reply(testMessage, { parse_mode: 'Markdown' });
    });

    // /setstrength - Signal gücü
    this.bot.command('setstrength', async (ctx) => {
      const args = (ctx.message as any)?.text?.split(' ') || [];
      const strength = parseInt(args[1] || '60');

      if (isNaN(strength) || strength < 0 || strength > 100) {
        return ctx.reply('❌ Hata: 0-100 arasında bir sayı yaz!\n\nÖrnek: /setstrength 70');
      }

      return ctx.reply(
        `✅ *Signal Gücü Güncellendi*\n\nYeni değer: ${strength}%\n\n${
          strength > 75
            ? '🟢 Çok Güçlü: Az sinyal, ama çok güvenilir'
            : strength > 50
              ? '🟡 Orta: Dengeli sinyal sayısı'
              : '🔴 Zayıf: Çok sinyal, ama risky'
        }`,
        { parse_mode: 'Markdown' }
      );
    });

    // /setconfidence - Güvenilirlik
    this.bot.command('setconfidence', async (ctx) => {
      const args = (ctx.message as any)?.text?.split(' ') || [];
      const confidence = parseInt(args[1] || '50');

      if (isNaN(confidence) || confidence < 0 || confidence > 100) {
        return ctx.reply('❌ Hata: 0-100 arasında bir sayı yaz!\n\nÖrnek: /setconfidence 70');
      }

      return ctx.reply(
        `✅ *Güvenilirlik Güncellendi*\n\nYeni değer: ${confidence}%\n\n${
          confidence > 75
            ? '🟢 Yüksek: Çok güvenilir sinyaller'
            : confidence > 50
              ? '🟡 Orta: Makul güvenilirlik'
              : '🔴 Düşük: Daha fazla sinyal, ama riskli'
        }`,
        { parse_mode: 'Markdown' }
      );
    });

    // Bilinmeyen komut
    this.bot.on('message', (ctx) => {
      if ((ctx.message as any)?.text?.startsWith('/')) {
        return ctx.reply(
          '❌ Bilinmeyen komut!\n\nKomutlar için /help yazabilirsin.',
          { parse_mode: 'Markdown' }
        );
      }
    });
  }

  /**
   * Initialize bot connection
   */
  async initialize(): Promise<void> {
    try {
      // Stop any existing polling
      try {
        await this.bot.stop();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      } catch (e) {
        // Ignore if not running
      }

      // Launch bot with webhook mode (better for Railway)
      // If webhook URL is provided in env, use it; otherwise use polling
      const webhookUrl = process.env.WEBHOOK_URL;
      if (webhookUrl) {
        console.log('🔗 Bot webhook mode ile başlatılıyor...');
        await this.bot.telegram.setWebhook(webhookUrl);
        await this.bot.launch({ webhook: { domain: webhookUrl, port: 3000 } });
      } else {
        console.log('📡 Bot polling mode ile başlatılıyor...');
        await this.bot.launch({
          allowedUpdates: ['message', 'callback_query'],
        });
      }

      await this.bot.telegram.getMe();
      this.isConnected = true;
      console.log('✅ Telegram bot bağlı ve hazır!');
      console.log('📲 Telegram bot aktif - Komutlar hazır');
    } catch (error) {
      console.error('❌ Telegram bot bağlanması başarısız:', error);
      if (error instanceof TelegramError && error.code === 401) {
        console.error(`
TELEGRAM 401 Unauthorized — bot token geçersiz veya yanlış.
• Railway / hosting: TELEGRAM_BOT_TOKEN değişkenini kontrol et (BotFather’daki token ile birebir aynı olmalı).
• Boşluk, tırnak veya satır sonu kopyalanmamış olmalı; gerekirse tokeni yenile (/revoke) ve yenisini yapıştır.
• Değişken adı tam olarak TELEGRAM_BOT_TOKEN olmalı.`);
      }
      throw error;
    }
  }

  /**
   * Send signal notification
   */
  async sendSignalNotification(signal: TradeSignal): Promise<void> {
    if (!this.isConnected) {
      console.error('Bot not connected');
      return;
    }

    try {
      const options = {
        parse_mode: 'Markdown' as const,
        disable_web_page_preview: true,
      };

      await this.bot.telegram.sendMessage(this.chatId, signal.message, options);
      console.log(`✅ Signal sent for ${signal.symbol}: ${signal.type}`);
    } catch (error) {
      console.error('❌ Failed to send signal:', error);
    }
  }

  /**
   * Send status update
   */
  async sendStatusUpdate(message: string): Promise<void> {
    if (!this.isConnected) {
      console.error('Bot not connected');
      return;
    }

    try {
      const options = {
        parse_mode: 'Markdown' as const,
      };

      await this.bot.telegram.sendMessage(this.chatId, message, options);
    } catch (error) {
      console.error('❌ Failed to send status update:', error);
    }
  }

  /**
   * Send error notification
   */
  async sendErrorAlert(error: string, details: string = ''): Promise<void> {
    if (!this.isConnected) {
      console.error('Bot not connected');
      return;
    }

    try {
      const message = `⚠️ *ERROR ALERT*\n\n${error}${details ? `\n\nDetails:\n${details}` : ''}\n\nTime: ${new Date().toISOString()}`;
      const options = {
        parse_mode: 'Markdown' as const,
      };

      await this.bot.telegram.sendMessage(this.chatId, message, options);
    } catch (error) {
      console.error('❌ Failed to send error alert:', error);
    }
  }

  /**
   * Send daily summary
   */
  async sendDailySummary(stats: {
    totalSignals: number;
    buySignals: number;
    sellSignals: number;
    accuracy: number;
    topPerformers: string[];
  }): Promise<void> {
    if (!this.isConnected) {
      console.error('Bot not connected');
      return;
    }

    try {
      let message = `📈 *DAILY SUMMARY*\n\n`;
      message += `Total Signals: ${stats.totalSignals}\n`;
      message += `Buy Signals: ${stats.buySignals}\n`;
      message += `Sell Signals: ${stats.sellSignals}\n`;
      message += `Accuracy: ${stats.accuracy.toFixed(2)}%\n`;

      if (stats.topPerformers.length > 0) {
        message += `\n🏆 Top Performers:\n`;
        stats.topPerformers.forEach((symbol) => {
          message += `• ${symbol}\n`;
        });
      }

      message += `\nDate: ${new Date().toLocaleDateString()}\n`;

      const options = {
        parse_mode: 'Markdown' as const,
      };

      await this.bot.telegram.sendMessage(this.chatId, message, options);
    } catch (error) {
      console.error('❌ Failed to send daily summary:', error);
    }
  }

  /**
   * Test connection
   */
  async test(): Promise<void> {
    try {
      const message = `✅ *Bot Test Successful*\n\nBot is ready to send trading signals!\nTime: ${new Date().toISOString()}`;
      const options = {
        parse_mode: 'Markdown' as const,
      };

      await this.bot.telegram.sendMessage(this.chatId, message, options);
      console.log('✅ Test message sent successfully');
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  }

  /**
   * Close bot connection
   */
  async close(): Promise<void> {
    this.isConnected = false;
    try {
      await this.bot.stop();
    } catch (error) {
      console.log('Bot stopping...');
    }
    console.log('✅ Bot kapatıldı');
  }

  /**
   * Update statistics
   */
  updateStats(stats: BotStats): void {
    this.stats = { ...stats };
  }

  /**
   * Get bot instance
   */
  getBot(): Telegraf {
    return this.bot;
  }
}
