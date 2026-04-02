import { HyperliquidClient } from './hyperliquid.js';
import { SignalEvaluator } from './signals.js';
import { IndicatorCalculator } from './indicators.js';

// Test için eşikleri düşür
const MIN_STRENGTH = 45;
const MIN_CONFIDENCE = 30;

async function testSignalGeneration() {
  console.log('🧪 Sinyal üretim testi başlatılıyor...\n');
  console.log(`⚙️  Test Ayarları:`);
  console.log(`   MIN_SIGNAL_STRENGTH: ${MIN_STRENGTH}%`);
  console.log(`   MIN_SIGNAL_CONFIDENCE: ${MIN_CONFIDENCE}%\n`);

  const client = new HyperliquidClient('https://api.hyperliquid.xyz');
  const symbols = ['BTC', 'ETH', 'SOL', 'HYPE', 'SUI'];
  
  let totalSignals = 0;
  let passedSignals = 0;
  
  for (const symbol of symbols) {
    try {
      console.log(`\n━━━━━ ${symbol} ANALİZ EDİLİYOR ━━━━━`);
      
      // 1. Fiyat çek
      console.log('1️⃣  Güncel fiyat alınıyor...');
      const currentPrice = await client.getCurrentPrice(symbol);
      console.log(`   ✅ ${symbol} fiyatı: $${currentPrice}`);
      
      // 2. Market data çek
      console.log('2️⃣  Market verisi alınıyor (200 mum, 5m)...');
      const marketData = await client.getMarketData(symbol, 300, 200);
      console.log(`   ✅ ${marketData.closes.length} mum alındı`);
      console.log(`   📊 Son 5 kapanış: ${marketData.closes.slice(-5).map(c => c.toFixed(2)).join(', ')}`);
      
      // 3. İndikatörleri hesapla
      console.log('3️⃣  Teknik indikatörler hesaplanıyor...');
      const indicators = IndicatorCalculator.calculateAllIndicators(marketData);
      console.log(`   RSI: ${indicators.rsi.toFixed(2)} ${indicators.rsi > 70 ? '(OVERBOUGHT)' : indicators.rsi < 30 ? '(OVERSOLD)' : ''}`);
      console.log(`   MACD: ${indicators.macd.histogram > 0 ? '📈 Bullish' : '📉 Bearish'} (${indicators.macd.histogram.toFixed(4)})`);
      console.log(`   EMA: 20=${indicators.ema20.toFixed(2)}, 50=${indicators.ema50.toFixed(2)}, 200=${indicators.ema200.toFixed(2)}`);
      console.log(`   ADX: ${indicators.adx.toFixed(2)} ${indicators.adx > 25 ? '(GÜÇLÜ TREND)' : '(ZAYIF TREND)'}`);
      
      // 4. Trend tespit et
      const trend = IndicatorCalculator.detectTrend(marketData);
      console.log(`   📈 Trend: ${trend}`);
      
      // 5. Pattern tespit et
      const patterns = IndicatorCalculator.detectPatterns(marketData);
      console.log(`   🎯 Patternler: ${patterns.length > 0 ? patterns.join(', ') : 'Yok'}`);
      
      // 6. Volatilite
      const volatility = IndicatorCalculator.calculateVolatility(marketData.closes);
      console.log(`   📊 Volatilite: ${(volatility * 100).toFixed(2)}%`);
      
      // 7. Sinyal değerlendir
      console.log('4️⃣  Sinyal değerlendiriliyor...');
      const signal = SignalEvaluator.evaluateSignal(symbol, marketData, currentPrice, 2, 5);
      
      if (signal) {
        totalSignals++;
        console.log(`   ✅ SİNYAL OLUŞTU!`);
        console.log(`   📍 Tip: ${signal.type}`);
        console.log(`   💪 Güç: ${signal.strength.toFixed(0)}%`);
        console.log(`   🎯 Güven: ${signal.confidence.toFixed(0)}%`);
        console.log(`   💵 Entry: $${signal.entryPrice.toFixed(2)}`);
        console.log(`   🛑 Stop Loss: $${signal.stopLoss.toFixed(2)}`);
        console.log(`   🎯 Target: $${signal.targetPrice.toFixed(2)}`);
        console.log(`   ⚖️  Risk/Reward: ${signal.riskReward.toFixed(2)}:1`);
        
        // Eşik kontrolü
        if (signal.strength >= MIN_STRENGTH && signal.confidence >= MIN_CONFIDENCE) {
          passedSignals++;
          console.log(`   ✅ EŞİKLERİ GEÇTİ - TELEGRAM'A GÖNDERİLİR`);
        } else {
          console.log(`   ❌ EŞİKLERİ GEÇEMEDI - FİLTRELENDİ`);
          console.log(`      Gerekli: Güç≥${MIN_STRENGTH}%, Güven≥${MIN_CONFIDENCE}%`);
        }
      } else {
        console.log(`   ⚠️  Sinyal yok (koşullar karşılanmadı)`);
      }
      
      // Küçük gecikme
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      console.error(`   ❌ ${symbol} hatası:`, error.message);
      if (error.response) {
        console.error(`   📡 API Yanıt:`, error.response.status, error.response.statusText);
      }
    }
  }
  
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 TEST SONUÇLARI:');
  console.log(`   Toplam Analiz: ${symbols.length}`);
  console.log(`   Sinyal Oluşan: ${totalSignals}`);
  console.log(`   Eşikleri Geçen: ${passedSignals}`);
  console.log(`   Filtrelenen: ${totalSignals - passedSignals}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (passedSignals === 0) {
    console.log('⚠️  HİÇBİR SİNYAL EŞİKLERİ GEÇEMEDI!');
    console.log('   Öneriler:');
    console.log(`   • MIN_SIGNAL_CONFIDENCE'ı ${MIN_CONFIDENCE} → 25'e düşür`);
    console.log(`   • MIN_SIGNAL_STRENGTH'i ${MIN_STRENGTH} → 40'a düşür`);
    console.log('   • Piyasa sideways/consolidation durumunda (ADX < 15)');
    console.log('   • Güçlü trend başladığında (ADX > 25) daha çok sinyal gelecek\n');
  } else {
    console.log(`✅ ${passedSignals} sinyal Telegram'a gönderilecek!\n`);
  }
}

testSignalGeneration().catch(console.error);
