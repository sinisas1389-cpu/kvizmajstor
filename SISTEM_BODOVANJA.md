# 🏆 Sistem Bodovanja - KvizMajstor

## Kako Funkcioniše Bodovanje?

### Osnovno Bodovanje

Za svako **tačno** odgovoreno pitanje dobijate:
- **1000 osnovnih poena**

Za **netačan** odgovor:
- **0 poena**

---

## ⚡ Bonus za Brzinu (Kada postoji vremensko ograničenje)

Ako kreator kviza postavi **vremensko ograničenje po pitanju**, možete dobiti dodatne poene za brze odgovore!

### Formula:
```
Ukupni Poeni = 1000 + (500 × Preostalo Vreme / Ukupno Vreme)
```

### Primer 1: Brz Odgovor
```
Vremensko ograničenje: 30 sekundi
Vreme odgovora: 5 sekundi
Preostalo vreme: 25 sekundi

Poeni = 1000 + (500 × 25/30)
Poeni = 1000 + 416
Poeni = 1416 ⚡
```

### Primer 2: Spor Odgovor
```
Vremensko ograničenje: 30 sekundi
Vreme odgovora: 28 sekundi
Preostalo vreme: 2 sekunde

Poeni = 1000 + (500 × 2/30)
Poeni = 1000 + 33
Poeni = 1033
```

### Primer 3: Poslednja Sekunda
```
Vremensko ograničenje: 60 sekundi
Vreme odgovora: 60 sekundi
Preostalo vreme: 0 sekundi

Poeni = 1000 + (500 × 0/60)
Poeni = 1000 + 0
Poeni = 1000
```

---

## 🕐 Kada NEMA Vremenskog Ograničenja?

Ako kreator NE postavi vremensko ograničenje po pitanju:
- Dobijate **fiksnih 1000 poena** za tačan odgovor
- Nema bonusa za brzinu
- Možete razmisliti koliko god želite

---

## 📊 Ukupan Rezultat Kviza

### Računanje Ukupnog Scora:
```
Ukupan Score = Zbir poena za sva tačno odgovorena pitanja
```

### Računanje Procenta:
```
Procenat = (Broj Tačnih Odgovora / Ukupan Broj Pitanja) × 100%
```

### Primer Kviza:
```
Kviz: 10 pitanja
Tačnih odgovora: 8
Vreme po pitanju: 30 sekundi

Pitanje 1: Tačno (brzo)   → 1400 poena
Pitanje 2: Tačno (brzo)   → 1450 poena
Pitanje 3: Tačno (sporo)  → 1050 poena
Pitanje 4: Netačno        → 0 poena
Pitanje 5: Tačno (brzo)   → 1380 poena
Pitanje 6: Tačno (srednje)→ 1200 poena
Pitanje 7: Netačno        → 0 poena
Pitanje 8: Tačno (brzo)   → 1420 poena
Pitanje 9: Tačno (sporo)  → 1100 poena
Pitanje 10: Tačno (brzo)  → 1480 poena

Ukupno: 10,480 poena
Procenat: 80% (8/10 tačnih)
```

---

## 🎯 Rang Lista

Na rang listi se rangiraju korisnici po **ukupnom broju poena** sakupljenih kroz sve kvizove.

### Primer:
```
Korisnik: Marko
- Kviz 1: 8,500 poena
- Kviz 2: 12,300 poena
- Kviz 3: 6,800 poena

Ukupno: 27,600 poena
Rang: #5
```

---

## 💡 Strategije za Više Poena

### 1. **Brzina + Tačnost**
- Odgovarajte brzo, ali pažljivo
- Prvo čitajte pitanje, pa odgovarajte

### 2. **Vežbajte**
- Što više kvizova radite, bolje razumete materiju
- Brže ćete odgovarati sa više iskustva

### 3. **Fokusirajte se na Kvizove sa Vremenskim Ograničenjem**
- Možete dobiti do **1500 poena po pitanju**
- Kvizovi bez limita daju **maksimum 1000 poena**

### 4. **Koristite Bonuse**
- Gledajte YouTube video lekcije nakon grešaka
- Učite iz objašnjenja tačnih odgovora

---

## 📈 Primeri Različitih Kvizova

### Kviz sa Vremenskim Ograničenjem:
```
Naslov: "Python Osnove"
Pitanja: 10
Vreme po pitanju: 30 sekundi

Maksimalni Score: 15,000 poena (10 × 1500)
Prosečan Score: ~11,000 poena
```

### Kviz BEZ Vremenskog Ograničenja:
```
Naslov: "Srpska Književnost"
Pitanja: 15
Vreme: Neograničeno

Maksimalni Score: 15,000 poena (15 × 1000)
Prosečan Score: ~12,000 poena
```

### Kombinirani Kviz:
```
Naslov: "Matematika Mix"
Pitanja: 20
- 10 pitanja: 60 sekundi po pitanju
- 10 pitanja: Neograničeno vreme

Maksimalni Score: 25,000 poena
(10 × 1500) + (10 × 1000)
```

---

## ⏱️ Tipovi Vremenskih Ograničenja

### 1. **Bez Ograničenja**
```
timeLimit: 0
timeLimitPerQuestion: 0

→ Razmišljajte koliko god želite
→ 1000 poena po tačnom odgovoru
```

### 2. **Ukupno Vreme**
```
timeLimit: 15 minuta
timeLimitPerQuestion: 0

→ 15 minuta za ceo kviz
→ Rasporedite vreme kako želite
→ 1000 poena po tačnom odgovoru
```

### 3. **Vreme po Pitanju**
```
timeLimit: 0
timeLimitPerQuestion: 30 sekundi

→ 30 sekundi za svako pitanje
→ Bonus za brze odgovore
→ Do 1500 poena po pitanju
```

### 4. **Oba Ograničenja**
```
timeLimit: 20 minuta
timeLimitPerQuestion: 60 sekundi

→ Maksimum 60 sekundi po pitanju
→ Maksimum 20 minuta ukupno
→ Bonus za brzinu
```

---

## 🏅 Značke (Badges)

Dobijate značke za dostignu\u0107a:

- 🎯 **Prvi Kviz** - Završite prvi kviz
- 💯 **Savršen Rezultat** - 100% tačnih odgovora
- 🔟 **10 Kvizova** - Završite 10 kvizova
- ⚡ **Brzinski Demon** - Prosečno brže od 5 sekundi po pitanju
- 👑 **Majstor Kategorije** - 10 kvizova u jednoj kategoriji

---

## 📊 Statistike

Na svom profilu možete videti:
- **Ukupan Score** - Zbir poena svih kvizova
- **Broj Kvizova** - Koliko kvizova ste završili
- **Prosečan Score** - Prosečan procenat tačnosti
- **Globalni Rang** - Vaša pozicija na rang listi

---

## 🎮 Kahoot-Style Bodovanje

Ovaj sistem je inspirisan Kahoot-om:
- Nagrađuje brze i tačne odgovore
- Pravi takmi\u010darsku atmosferu
- Motiviše učenike da budu brži

---

## ❓ FAQ

**Q: Šta ako netačno odgovorim?**
A: Dobijate 0 poena za to pitanje, ali možete nastaviti kviz.

**Q: Mogu li dobiti negativne poene?**
A: Ne, minimum je 0 poena po pitanju.

**Q: Šta ako vreme istekne pre nego što odgovorim?**
A: Pitanje se automatski označa kao netačno (0 poena).

**Q: Kako da dobijem više poena?**
A: Odgovarajte brzo i tačno na kvizovima sa vremenskim ograničenjem!

**Q: Zašto neki kvizovi daju više poena?**
A: Kvizovi sa vremenskim ograničenjem po pitanju daju bonus za brzinu.

---

Srećno u osvajanju poena! 🚀
