# 🚀 Hızlı Başlangıç - Railway Deployment

## 1️⃣ Telegram Bot Token Al

1. Telegram'da **@BotFather** ara
2. `/newbot` komutunu gönder
3. Bot adı ver (örnek: "My Trading Signal Bot")
4. Username ver (örnek: "my_trading_signal_bot")
5. **Token**'ı kopyala (örnek: `123456789:AAH...`)

## 2️⃣ Chat ID Al

1. Telegram'da **@userinfobot** ara
2. Bota mesaj gönder
3. **ID**'ni kopyala (örnek: `750170873`)

## 3️⃣ Railway Variables Ayarla

Railway Dashboard → Variables → **Raw Editor**'a aşağıdakileri yapıştır:

```env
TELEGRAM_BOT_TOKEN=BURAYA_TOKEN_YAPISTIR
TELEGRAM_CHAT_ID=BURAYA_CHAT_ID_YAPISTIR
TRADING_SYMBOLS=BTC,ETH,SOL,HYPE,SUI,VIRTUAL,ASTER
TIMEFRAME=5m
UPDATE_INTERVAL=60000
MIN_SIGNAL_STRENGTH=50
MIN_SIGNAL_CONFIDENCE=35
ENABLE_BUY_SIGNALS=true
ENABLE_SELL_SIGNALS=true
```

### ⚙️ Ayar Açıklamaları:

| Ayar | Açıklama | Öneri |
|------|----------|-------|
| `UPDATE_INTERVAL` | Analiz sıklığı (ms) | `60000` (1dk) - daha sık sinyal |
| `MIN_SIGNAL_STRENGTH` | Sinyal gücü eşiği (0-100) | `50` - orta seviye |
| `MIN_SIGNAL_CONFIDENCE` | Güven eşiği (0-100) | `35` - sideways piyasada sinyal alırsın |
| `TRADING_SYMBOLS` | İzlenecek coinler | İstediğin kadar ekle (virgülle ayır) |

### 🎯 Sinyal Ayarları:

- **Çok Sık Sinyal İstersen:**
  - `MIN_SIGNAL_CONFIDENCE=25`
  - `MIN_SIGNAL_STRENGTH=40`
  - `UPDATE_INTERVAL=30000` (30sn)

- **Sadece Güçlü Sinyaller İstersen:**
  - `MIN_SIGNAL_CONFIDENCE=60`
  - `MIN_SIGNAL_STRENGTH=70`
  - `UPDATE_INTERVAL=300000` (5dk)

## 4️⃣ Deploy

1. **Variables** kaydettikten sonra Railway otomatik deploy yapar
2. **Logs** sekmesine bak:
   - ✅ `Bot başarıyla başlatıldı` → Çalışıyor
   - ✅ `Bot piyasayı analiz etmeye başlıyor` → Sinyal taraması aktif
   - ❌ `401 Unauthorized` → Token yanlış, tekrar kontrol et

## 5️⃣ Test Et

1. Telegram'da botuna `/start` gönder
2. `/status` → Bot durumunu göster
3. `/help` → Komutlar listesi

## 🐛 Sorun Giderme

### ❌ 401 Unauthorized

- Token'ı **@BotFather**'dan yeniden kopyala
- Railway Variables'da **boşluk/satır sonu olmadığından** emin ol
- Deploy'u yeniden tetikle

### ⚠️ Sinyal Gelmiyor

1. **Eşikleri Düşür:**
   ```env
   MIN_SIGNAL_CONFIDENCE=30
   MIN_SIGNAL_STRENGTH=45
   ```

2. **Analiz Sıklığını Artır:**
   ```env
   UPDATE_INTERVAL=30000
   ```

3. **Logs'u Kontrol Et:**
   - `BTC için sinyal: BUY (75%)` → Sinyal üretiliyor ✅
   - `BTC analiz hatası: 422` → API sorunu ❌

### ❌ 429 Too Many Requests

- Railway deploy'u çok sık restart atıyor olabilir
- 1-2 dakika bekle, Telegram rate limit sıfırlanır

## 📊 Bot Çalışma Mantığı

```
Her 1 dakikada (UPDATE_INTERVAL):
  ├─ BTC analiz et (200 mum, 5m timeframe)
  ├─ ETH analiz et
  ├─ SOL analiz et
  ├─ HYPE analiz et
  ├─ SUI analiz et
  ├─ VIRTUAL analiz et
  └─ ASTER analiz et

Her Coin İçin:
  1. Hyperliquid'den fiyat + mum verisi al
  2. Teknik indikatörleri hesapla (RSI, MACD, EMA, Bollinger, ADX...)
  3. Trend tespit et (BULLISH/BEARISH/NEUTRAL)
  4. Pattern tespit et (HIGHER_HIGH, TRIANGLE_CONTRACTION...)
  5. Sinyal gücü ve güven hesapla
  6. Eşikleri geçerse → Telegram'a gönder
  7. Aynı coin için aynı sinyal 15dk içinde tekrar gönderilmez
```

## 🔔 Telegram Komutları

- `/start` - Bot'u başlat, hoş geldin mesajı
- `/help` - Komutlar ve açıklamalar
- `/status` - Bot durumu (çalışıyor mu, kaç sinyal atıldı)
- `/symbols` - İzlenen coinler
- `/settings` - Mevcut ayarlar
- `/stats` - Sinyal istatistikleri
- `/pause` - Sinyalleri durdur
- `/resume` - Sinyalleri devam ettir
- `/test` - Telegram bağlantısını test et

## ✅ Başarı Göstergeleri

Railway Logs'ta bunları görmelisin:

```
✅ Telegram bot bağlı ve hazır!
✅ Bot başarılı şekilde başlatıldı
✅ Bot çalışıyor (Güncelleme süresi: 60000ms)
📊 BTC için sinyal: BUY (75%)
📊 ETH için sinyal: SELL (68%)
```

Telegram'da:

```
✅ Trading Bot Başlatıldı

═══════════════════════════════════
     TRADING BOT CONFIGURATION
═══════════════════════════════════

🔐 Telegram:
   Bot Token: 8773768395...
   Chat ID: 750170873

📊 Trading:
   Symbols: BTC, ETH, SOL, HYPE, SUI, VIRTUAL, ASTER
   Timeframe: 5m
   Update Interval: 60000ms

⚙️  Signal Settings:
   Min Strength: 50%
   Min Confidence: 35%
   Buy Signals: ✅
   Sell Signals: ✅
```

## 🎯 İlk Sinyal Örneği

```
🟢 BUY SIGNAL - BTC
━━━━━━━━━━━━━━━━━━━━━━━━━
Güç: ████████░░ 83%
Güven: 45%
Risk/Reward: 2.50:1

📍 TRADİNG SEVİYELERİ
Entry Price: $66930.50
Stop Loss: $65591.89 ⬇️
Target Price: $70277.03 ⬆️
Potential Loss: -$1338.61
Potential Gain: +$3346.53

📊 İNDİKATÖRLER
RSI: 51.24 (✅ Normal)
MACD: 📈 Yükseliş
ADX: 11.99 (⚠️ Zayıf Trend)

⚠️ TAVSİYELER
• Risk/Reward: 2.50:1 (Ideal: >2:1)
• Volatilite: 1.19
• Gereken İnişli: 02/04/2026 23:30:00
```

---

## 🆘 Hâlâ Çalışmıyor?

1. **Railway Logs'u Screenshot Al** → Hata mesajlarını göster
2. **Variables'ı Kontrol Et** → Token ve Chat ID doğru mu?
3. **@BotFather'da Botun Aktif Mi?** → `/mybots` → botunu seç → kontrol et
4. **Test Yap:** 
   ```bash
   curl https://api.telegram.org/bot<TOKEN>/getMe
   ```
   (TOKEN yerine bot token'ını yapıştır - başarılıysa JSON döner)

Sorun devam ederse **Railway Logs'u paylaş**!
