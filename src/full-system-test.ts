import TradingBot from './bot.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Tam sistem testi - Railway production simülasyonu
 */
async function fullSystemTest() {
  console.log('🚀 TAM SİSTEM TESTİ BAŞLATILIYOR...\n');
  console.log('📋 Ortam Değişkenleri:');
  console.log(`   TELEGRAM_BOT_TOKEN: ${process.env.TELEGRAM_BOT_TOKEN ? '✅ Var (' + process.env.TELEGRAM_BOT_TOKEN.substring(0, 10) + '...)' : '❌ YOK'}`);
  console.log(`   TELEGRAM_CHAT_ID: ${process.env.TELEGRAM_CHAT_ID || '❌ YOK'}`);
  console.log(`   TRADING_SYMBOLS: ${process.env.TRADING_SYMBOLS || 'BTC,ETH (varsayılan)'}`);
  console.log(`   TIMEFRAME: ${process.env.TIMEFRAME || '5m (varsayılan)'}`);
  console.log(`   UPDATE_INTERVAL: ${process.env.UPDATE_INTERVAL || '300000 (varsayılan)'}`);
  console.log(`   MIN_SIGNAL_STRENGTH: ${process.env.MIN_SIGNAL_STRENGTH || '60 (varsayılan)'}`);
  console.log(`   MIN_SIGNAL_CONFIDENCE: ${process.env.MIN_SIGNAL_CONFIDENCE || '50 (varsayılan)'}`);
  console.log(`   WEBHOOK_URL: ${process.env.WEBHOOK_URL || '❌ YOK (polling mode)'}\n`);

  let bot: TradingBot | null = null;
  let analysisCount = 0;
  let signalCount = 0;

  try {
    // Bot oluştur
    console.log('1️⃣  Bot instance oluşturuluyor...');
    bot = new TradingBot();
    console.log('   ✅ Bot instance oluşturuldu\n');

    // Initialize (Telegram bağlantısı)
    console.log('2️⃣  Bot başlatılıyor (Telegram bağlantısı)...');
    await bot.initialize();
    console.log('   ✅ Bot başarıyla başlatıldı\n');

    // Test çalıştır
    console.log('3️⃣  Bileşen testleri yapılıyor...');
    await bot.test();
    console.log('   ✅ Testler başarılı\n');

    // İstatistikleri kontrol et
    console.log('4️⃣  Başlangıç istatistikleri:');
    let stats = bot.getStatistics();
    console.log(`   Çalışıyor: ${stats.isRunning ? '✅' : '❌'}`);
    console.log(`   Toplam Sinyal: ${stats.totalSignals}`);
    console.log(`   İzlenen Sembol: ${stats.symbolsMonitored}\n`);

    // Bot'u başlat (async, sonsuza kadar çalışır)
    console.log('5️⃣  Bot piyasa analizine başlıyor...');
    console.log('   ⏰ İlk analiz hemen yapılacak, sonra her 5 dakikada bir tekrarlanacak\n');
    
    // Start() async olarak çalışır, bu yüzden await etmiyoruz
    bot.start().catch(err => {
      console.error('   ❌ Bot çalışma hatası:', err);
    });

    // 60 saniye bekle ve istatistikleri göster
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⏳ 60 saniye gözlemleniyor...\n');

    for (let i = 1; i <= 12; i++) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      stats = bot.getStatistics();
      console.log(`📊 [${i * 5}s] İstatistik:`);
      console.log(`   Çalışıyor: ${stats.isRunning ? '✅ EVET' : '❌ HAYIR'}`);
      console.log(`   Toplam Sinyal: ${stats.totalSignals}`);
      console.log(`   Buy: ${stats.buySignals} | Sell: ${stats.sellSignals}`);
      
      if (stats.totalSignals > signalCount) {
        console.log(`   🎉 YENİ SİNYAL ALINDI! (+${stats.totalSignals - signalCount})`);
        signalCount = stats.totalSignals;
      }
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📈 SONUÇ:');
    stats = bot.getStatistics();
    console.log(`   Durum: ${stats.isRunning ? '✅ ÇALIŞIYOR' : '❌ DURDURULDU'}`);
    console.log(`   Toplam Sinyal: ${stats.totalSignals}`);
    console.log(`   Buy Sinyalleri: ${stats.buySignals}`);
    console.log(`   Sell Sinyalleri: ${stats.sellSignals}`);
    console.log(`   İzlenen Semboller: ${stats.symbolsMonitored}\n`);

    if (stats.totalSignals === 0) {
      console.log('⚠️  UYARI: 60 saniyede hiç sinyal üretilmedi.');
      console.log('   Olası nedenler:');
      console.log('   • MIN_SIGNAL_CONFIDENCE çok yüksek (50+ → 40\'a düşür)');
      console.log('   • MIN_SIGNAL_STRENGTH çok yüksek (60+ → 50\'ye düşür)');
      console.log('   • Piyasa sideways/consolidation (ADX < 15, trend zayıf)');
      console.log('   • UPDATE_INTERVAL çok uzun (300000ms = 5dk, 60000ms = 1dk dene)\n');
    } else {
      console.log('✅ Bot düzgün çalışıyor ve sinyal üretiyor!\n');
    }

    // Bot'u durdur
    console.log('6️⃣  Bot durduruluyor...');
    await bot.stop();
    console.log('   ✅ Bot kapatıldı\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TAM SİSTEM TESTİ TAMAMLANDI');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error: any) {
    console.error('\n❌ TEST BAŞARISIZ:', error.message);
    console.error('\nDetay:', error);
    
    if (error.message?.includes('TELEGRAM_BOT_TOKEN')) {
      console.error('\n💡 Çözüm: .env dosyasında TELEGRAM_BOT_TOKEN ayarla');
    }
    if (error.message?.includes('TELEGRAM_CHAT_ID')) {
      console.error('\n💡 Çözüm: .env dosyasında TELEGRAM_CHAT_ID ayarla');
    }
    
    if (bot) {
      await bot.stop();
    }
    process.exit(1);
  }
}

fullSystemTest().catch(console.error);
