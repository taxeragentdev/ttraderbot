import { HyperliquidClient } from './hyperliquid.js';
import { SignalEvaluator } from './signals.js';
import { IndicatorCalculator } from './indicators.js';

async function testSignalGeneration() {
  console.log('🧪 Sinyal üretim testi başlatılıyor...\n');

  const client = new HyperliquidClient('https://api.hyperliquid.xyz');
  const symbols = ['BTC', 'ETH', 'SOL'];
  
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
      console.log(`   RSI: ${indicators.rsi.toFixed(2)}`);
      console.log(`   MACD Histogram: ${indicators.macd.histogram.toFixed(4)}`);
      console.log(`   EMA20: ${indicators.ema20.toFixed(2)}, EMA50: ${indicators.ema50.toFixed(2)}`);
      console.log(`   ADX: ${indicators.adx.toFixed(2)}`);
      console.log(`   Bollinger: L=${indicators.bollinger.lower.toFixed(2)}, M=${indicators.bollinger.middle.toFixed(2)}, U=${indicators.bollinger.upper.toFixed(2)}`);
      
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
        console.log(`   ✅ SİNYAL OLUŞTU!`);
        console.log(`   📍 Tip: ${signal.type}`);
        console.log(`   💪 Güç: ${signal.strength.toFixed(0)}%`);
        console.log(`   🎯 Güven: ${signal.confidence.toFixed(0)}%`);
        console.log(`   💵 Entry: $${signal.entryPrice.toFixed(2)}`);
        console.log(`   🛑 Stop Loss: $${signal.stopLoss.toFixed(2)}`);
        console.log(`   🎯 Target: $${signal.targetPrice.toFixed(2)}`);
        console.log(`   ⚖️  Risk/Reward: ${signal.riskReward.toFixed(2)}:1`);
      } else {
        console.log(`   ⚠️  Sinyal yok (koşullar karşılanmadı)`);
      }
      
      // Küçük gecikme
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      console.error(`   ❌ ${symbol} hatası:`, error.message);
      if (error.response) {
        console.error(`   📡 API Yanıt:`, error.response.status, error.response.statusText);
        console.error(`   📄 Veri:`, JSON.stringify(error.response.data).substring(0, 200));
      }
    }
  }
  
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Test tamamlandı!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

testSignalGeneration().catch(console.error);
