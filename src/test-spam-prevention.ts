import TradingBot from './bot.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Spam önleme testi - aynı sinyal 15dk içinde tekrar gönderilmez mi?
 */
async function testDuplicateSignalPrevention() {
  console.log('🧪 SPAM ÖNLEME TESTİ BAŞLATILIYOR...\n');
  
  // Test için düşük eşikler
  process.env.MIN_SIGNAL_CONFIDENCE = '25';
  process.env.MIN_SIGNAL_STRENGTH = '40';
  
  const bot = new TradingBot();
  
  try {
    console.log('1️⃣  Bot başlatılıyor...');
    await bot.initialize();
    console.log('   ✅ Bot başlatıldı\n');
    
    console.log('2️⃣  İlk analiz çalıştırılıyor...');
    // Start() arka planda çalışır, biz manuel analiz tetikleyeceğiz
    bot['isRunning'] = true;
    
    // İlk analiz
    console.log('━━━━━ İLK ANALİZ (T=0s) ━━━━━');
    await bot['runAnalysis']();
    await new Promise(r => setTimeout(r, 2000));
    
    const stats1 = bot.getStatistics();
    console.log(`   📊 Sinyal Sayısı: ${stats1.totalSignals}`);
    console.log(`   🟢 Buy: ${stats1.buySignals} | 🔴 Sell: ${stats1.sellSignals}\n`);
    
    // 5 saniye sonra ikinci analiz (15dk geçmedi)
    console.log('━━━━━ İKİNCİ ANALİZ (T=5s) ━━━━━');
    console.log('⏱️  Aynı sinyaller tekrar üretilecek AMA spam önleme devrede...\n');
    await new Promise(r => setTimeout(r, 3000));
    await bot['runAnalysis']();
    await new Promise(r => setTimeout(r, 2000));
    
    const stats2 = bot.getStatistics();
    console.log(`   📊 Sinyal Sayısı: ${stats2.totalSignals}`);
    console.log(`   🟢 Buy: ${stats2.buySignals} | 🔴 Sell: ${stats2.sellSignals}\n`);
    
    if (stats2.totalSignals === stats1.totalSignals) {
      console.log('✅ BAŞARILI: Spam önleme çalışıyor!');
      console.log('   Aynı sinyaller 15dk içinde tekrar gönderilmedi.\n');
    } else {
      console.log('❌ HATA: Spam önleme çalışmıyor!');
      console.log(`   İkinci analizde ${stats2.totalSignals - stats1.totalSignals} yeni sinyal eklendi.\n`);
    }
    
    // 10 saniye sonra üçüncü analiz
    console.log('━━━━━ ÜÇÜNCÜ ANALİZ (T=15s) ━━━━━');
    console.log('⏱️  Hâlâ 15dk geçmedi, yine spam önleme devrede olmalı...\n');
    await new Promise(r => setTimeout(r, 5000));
    await bot['runAnalysis']();
    await new Promise(r => setTimeout(r, 2000));
    
    const stats3 = bot.getStatistics();
    console.log(`   📊 Sinyal Sayısı: ${stats3.totalSignals}`);
    console.log(`   🟢 Buy: ${stats3.buySignals} | 🔴 Sell: ${stats3.sellSignals}\n`);
    
    if (stats3.totalSignals === stats1.totalSignals) {
      console.log('✅ BAŞARILI: Spam önleme hâlâ çalışıyor!\n');
    } else {
      console.log('❌ HATA: Üçüncü analizde yeni sinyal eklendi.\n');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 SONUÇ:');
    console.log(`   İlk Analiz: ${stats1.totalSignals} sinyal`);
    console.log(`   İkinci Analiz: ${stats2.totalSignals} sinyal (${stats2.totalSignals - stats1.totalSignals} yeni)`);
    console.log(`   Üçüncü Analiz: ${stats3.totalSignals} sinyal (${stats3.totalSignals - stats2.totalSignals} yeni)`);
    console.log('');
    
    if (stats2.totalSignals === stats1.totalSignals && stats3.totalSignals === stats1.totalSignals) {
      console.log('✅ TEST BAŞARILI: Spam önleme düzgün çalışıyor!');
      console.log('   Aynı symbol+type için 15dk içinde tekrar gönderilmiyor.\n');
    } else {
      console.log('❌ TEST BAŞARISIZ: Spam önleme çalışmıyor!');
      console.log('   Loglarda "⏭️ ... atlanıyor" mesajlarını kontrol et.\n');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    await bot.stop();
    
  } catch (error: any) {
    console.error('\n❌ TEST HATASI:', error.message);
    await bot.stop();
    process.exit(1);
  }
}

testDuplicateSignalPrevention().catch(console.error);
