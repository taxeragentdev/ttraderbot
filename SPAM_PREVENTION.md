# 🛡️ Spam Önleme - Aynı Sinyal Tekrar Gönderilmemesi

## 🐛 Sorun: Aynı Dakikada Aynı Token İçin Birden Fazla Sinyal

### Neden Oluyordu?

1. **Eski `lastSignals` Map'i Sadece Signal Objesini Tutuyordu:**
   ```typescript
   // ❌ YANLIŞ
   private lastSignals: Map<string, TradeSignal> = new Map();
   // "BTC" → Signal objesi (ama zaman yok!)
   ```

2. **`signalHistory.find()` Yavaş ve Yanlış:**
   ```typescript
   // ❌ YANLIŞ
   const timeSinceLastSignal = Date.now() - (
     this.signalHistory.find(h => 
       h.signal.symbol === symbol && 
       h.signal.type === signal.type
     )?.timestamp || 0
   );
   ```
   - **Sorun 1:** Her sinyalde tüm `signalHistory` array'ini tarar (O(n))
   - **Sorun 2:** `find()` **ilk** bulduğu kaydı döndürür, **en son** değil
   - **Sorun 3:** Array uzadıkça (1000 kayıt) daha yavaş

3. **Paralel Analiz:**
   - Aynı symbol aynı anda 2 kez analiz ediliyorsa (çok hızlı interval)
   - Her ikisi de aynı sinyali üretir → 2 mesaj gönderilir

---

## ✅ Çözüm: Optimize Edilmiş Spam Önleme

### 1. **`lastSignalTime` Map (O(1) Lookup)**

```typescript
// ✅ DOĞRU
private lastSignalTime: Map<string, number> = new Map();
// "BTC-BUY" → 1712345678900 (timestamp)
// "ETH-SELL" → 1712345690000
```

**Avantajlar:**
- Her symbol+type kombinasyonu için **son gönderim zamanı** saklanır
- Map lookup **O(1)** (çok hızlı)
- Array aramaya gerek yok

### 2. **Spam Kontrolü**

```typescript
const signalKey = `${symbol}-${signal.type}`; // "BTC-BUY"
const lastTime = this.lastSignalTime.get(signalKey);
const now = Date.now();

if (lastTime) {
  const timeSinceLastSignal = now - lastTime;
  const minutesSince = Math.floor(timeSinceLastSignal / 60000);
  
  if (timeSinceLastSignal < 900000) { // 15 dakika = 900000ms
    console.log(`⏭️ ${symbol} ${signal.type} sinyali ${minutesSince} dakika önce gönderildi, atlanıyor`);
    return; // Sinyal gönderilmez
  }
}
```

**Çalışma Mantığı:**
- BTC BUY sinyali 10:00'da gönderildi → `lastSignalTime["BTC-BUY"] = 1712345678900`
- 10:01'de yine BTC BUY sinyali üretildi → `timeSince = 1 dakika` → **Atlanır**
- 10:05'te yine BTC BUY → `timeSince = 5 dakika` → **Atlanır**
- 10:15'te yine BTC BUY → `timeSince = 15 dakika` → **GÖNDERİLİR** ✅

### 3. **Paralel Analiz Önleme**

```typescript
private analyzingSymbols: Set<string> = new Set();

private async analyzeSymbol(symbol: string): Promise<void> {
  // Bu symbol zaten analiz ediliyorsa atla
  if (this.analyzingSymbols.has(symbol)) {
    console.log(`⏭️ ${symbol} zaten analiz ediliyor, atlanıyor`);
    return;
  }

  this.analyzingSymbols.add(symbol);
  
  try {
    // Analiz yap...
  } finally {
    this.analyzingSymbols.delete(symbol); // Kilidi kaldır
  }
}
```

**Avantajlar:**
- Aynı symbol aynı anda 2 kez analiz edilemez
- Çok hızlı interval'larda bile güvenli

---

## 📊 Örnekler

### Örnek 1: Aynı Sinyal 15dk İçinde Tekrar Üretilirse

```
10:00:00 → BTC BUY sinyali üretildi, Telegram'a gönderildi ✅
10:01:00 → BTC BUY yine üretildi → ⏭️ 1 dakika önce gönderildi, atlanıyor
10:05:00 → BTC BUY yine üretildi → ⏭️ 5 dakika önce gönderildi, atlanıyor
10:15:00 → BTC BUY yine üretildi → ✅ 15 dakika geçti, Telegram'a gönderildi
```

### Örnek 2: Farklı Tip Sinyaller

```
10:00:00 → BTC BUY sinyali gönderildi ✅
10:02:00 → BTC SELL sinyali üretildi → ✅ Farklı tip, gönderildi
10:05:00 → BTC BUY yine üretildi → ⏭️ 5 dakika önce gönderildi (10:00'daki), atlanıyor
10:07:00 → BTC SELL yine üretildi → ⏭️ 5 dakika önce gönderildi (10:02'deki), atlanıyor
```

### Örnek 3: Farklı Semboller

```
10:00:00 → BTC BUY gönderildi ✅
10:00:05 → ETH BUY gönderildi ✅ (farklı symbol)
10:01:00 → BTC BUY yine → ⏭️ Atlanıyor
10:01:00 → ETH BUY yine → ⏭️ Atlanıyor
```

---

## 🔧 15 Dakika Süresini Değiştirme

**Daha sık sinyal istersen** (örneğin 5 dakika):

```typescript
// src/bot.ts içinde
if (timeSinceLastSignal < 300000) { // 5 dakika = 300000ms
```

**Daha az sinyal istersen** (örneğin 30 dakika):

```typescript
if (timeSinceLastSignal < 1800000) { // 30 dakika = 1800000ms
```

---

## 🧪 Test Etmek İçin

Railway Logs'unda şunları göreceksin:

```
📊 BTC için sinyal: BUY (75%)
✅ Sinyal gönderildi

(1 dakika sonra)

⏭️ BTC BUY sinyali 1 dakika önce gönderildi, atlanıyor (min: 15dk)
```

**Eğer hâlâ spam görüyorsan:**
1. Railway'de **restart** yapılıyor olabilir (her restart `lastSignalTime` sıfırlanır)
2. **Birden fazla instance** çalışıyor olabilir (Railway scale > 1)
3. Logları paylaş, inceleyelim

---

## ✅ Sonuç

- **`lastSignalTime` Map:** O(1) hızında, doğru timestamp kontrolü
- **Paralel analiz önleme:** Aynı symbol aynı anda 2 kez analiz edilemez
- **15 dakika bekleme:** Aynı symbol+type için spam önleme
- **Farklı tipler bağımsız:** BTC BUY ve BTC SELL ayrı kontrol edilir

Artık **aynı dakikada aynı sinyal tekrar gönderilmez**! 🎉
