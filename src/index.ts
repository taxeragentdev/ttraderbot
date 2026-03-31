import TradingBot from './bot.js';

/**
 * Ana giriş noktası (Main entry point)
 */
async function main() {
  try {
    // Bot instance'ı oluştur
    const bot = new TradingBot({
      // İsterniyorsan ayarları buradan değiştirebilirsin
      // symbols: ['BTC', 'ETH', 'SOL'],
      // updateInterval: 300000,
    });

    // Bot'u başlat
    await bot.initialize();

    // Test (isteğe bağlı)
    console.log('\n🧪 Bot bileşenleri test ediliyor...');
    try {
      await bot.test();
    } catch (testError) {
      console.warn('⚠️  Test sırasında uyarı:', testError);
      // Test başarısız olsa da devam et
    }

    // Bot'u çalıştır
    console.log('\n▶️  Bot piyasayı analiz etmeye başlıyor...\n');
    await bot.start();

    // İstatistikleri her dakika yazdır
    setInterval(() => {
      const stats = bot.getStatistics();
      console.log(
        `\n📈 Bot İstatistikleri: Çalışıyor=${stats.isRunning ? '✅' : '❌'} | Sinyaller=${stats.totalSignals} | AL🟢=${stats.buySignals} | SAT🔴=${stats.sellSignals}`
      );
    }, 60000);
  } catch (error) {
    console.error('💥 Hata:', error);
    process.exit(1);
  }
}

// Main'i çalıştır
main();
