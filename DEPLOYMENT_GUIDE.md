# 🚀 KvizMajstor - Deployment Guide
## Vercel (Frontend) + Railway (Backend) + MongoDB Atlas

---

## 📋 Preduslovi

**Potrebni nalozi (svi besplatni):**
1. **GitHub** nalog - https://github.com
2. **MongoDB Atlas** nalog - https://www.mongodb.com/cloud/atlas
3. **Railway** nalog - https://railway.app
4. **Vercel** nalog - https://vercel.com

---

## 🗂️ KORAK 1: GitHub - Push Kod

### 1.1 Kreirajte novi GitHub repo:
1. Idite na https://github.com/new
2. Ime repo: `kvizmajstor` (ili kako god želite)
3. Stavite na **Private** ili **Public**
4. **NE** dodavajte README, .gitignore ili licencu
5. Kliknite **Create repository**

### 1.2 Push kod na GitHub:

**Otvorite terminal na vašem računaru i izvršite:**

```bash
# Inicijalizuj Git (ako već nije)
cd /path/to/your/kvizmajstor
git init

# Dodaj sve fajlove
git add .

# Commit
git commit -m "Initial commit - KvizMajstor ready for deployment"

# Dodaj GitHub remote (zamenite sa vašim username i repo)
git remote add origin https://github.com/YOUR_USERNAME/kvizmajstor.git

# Push
git branch -M main
git push -u origin main
```

**✅ Checkpoint:** Vaš kod je sada na GitHub-u!

---

## 🍃 KORAK 2: MongoDB Atlas - Besplatna Baza

### 2.1 Kreirajte MongoDB Atlas nalog:
1. Idite na https://www.mongodb.com/cloud/atlas/register
2. Prijavite se (može i sa Google nalogom)

### 2.2 Kreirajte besplatan cluster:
1. Kliknite **"Build a Database"**
2. Izaberite **FREE** tier (M0 Sandbox - 512MB)
3. Provider: **AWS**
4. Region: **Frankfurt (eu-central-1)** ili bilo koji u Evropi
5. Cluster Name: `KvizMajstor` ili ostavi default
6. Kliknite **Create**

⏱️ Sačekajte 3-5 minuta da se cluster kreira...

### 2.3 Podesите pristup:

**A) Kreirajte database user:**
1. Security → Database Access
2. Kliknite **"Add New Database User"**
3. Authentication: **Password**
4. Username: `kviz_admin`
5. Password: **Autogenerate Secure Password** (ili unesite svoj)
6. ⚠️ **SAČUVAJTE PASSWORD NEGDE!**
7. Database User Privileges: **Read and write to any database**
8. Kliknite **Add User**

**B) Dozvolite Network Access:**
1. Security → Network Access
2. Kliknite **"Add IP Address"**
3. Kliknite **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Kliknite **Confirm**

### 2.4 Dobijte Connection String:

1. Idite na **Database** → Kliknite **Connect** na vašem clusteru
2. Izaberite **"Connect your application"**
3. Driver: **Python**, Version: **3.12 or later**
4. Kopirajte **Connection String**:

```
mongodb+srv://kviz_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

5. **ZAMENITE `<password>`** sa vašim pravim password-om!

**Konačan format:**
```
mongodb+srv://kviz_admin:VasaSifra123@cluster0.xxxxx.mongodb.net/kviz_db?retryWrites=true&w=majority
```

⚠️ **SAČUVAJTE OVO NEGDE - trebace vam!**

**✅ Checkpoint:** MongoDB baza je spremna!

---

## 🚂 KORAK 3: Railway - Deploy Backend

### 3.1 Prijavite se na Railway:
1. Idite na https://railway.app
2. Kliknite **"Login"**
3. Prijavite se sa **GitHub nalogom** (preporučeno)

### 3.2 Kreirajte novi projekat:
1. Dashboard → Kliknite **"New Project"**
2. Izaberite **"Deploy from GitHub repo"**
3. Autorizujte Railway da pristupi vašim GitHub repozitorijima
4. Izaberite vaš `kvizmajstor` repozitorijum

### 3.3 Podesите Backend servis:

1. Railway će automatski detektovati vaš projekat
2. Kliknite **"Add a Service"** → **"GitHub Repo"**
3. Izaberite `kvizmajstor` repo
4. **Root Directory:** Kliknite **Settings** → **Root Directory** → Postavite na `/backend`

### 3.4 Dodajte Environment Variables:

1. U Railway projektu → Kliknite na servis
2. Idite na **Variables** tab
3. Dodajte sledeće variable:

```
MONGO_URL=mongodb+srv://kviz_admin:VasaSifra123@cluster0.xxxxx.mongodb.net/kviz_db?retryWrites=true&w=majority

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

PORT=8001
```

⚠️ **Za JWT_SECRET koristite random string** (npr: `ksjdhf87sdf987sdf98s7df98sdf`)

### 3.5 Deploy Backend:

1. Railway će automatski početi deployment
2. Sačekajte da vidite **"Success"** ili **zelenu kvačicu** ✅
3. Kliknite **Settings** → **Generate Domain**
4. Dobićete URL tipa: `your-backend.up.railway.app`

**✅ SAČUVAJTE OVAJ URL - to je vaš BACKEND_URL!**

**Primer:** `https://kvizmajstor-backend.up.railway.app`

### 3.6 Testirajte Backend:

Otvorite u browser-u:
```
https://your-backend.up.railway.app/api/health
```

Trebalo bi da vidite:
```json
{"status": "ok"}
```

**✅ Checkpoint:** Backend je uživo!

---

## ▲ KORAK 4: Vercel - Deploy Frontend

### 4.1 Prijavite se na Vercel:
1. Idite na https://vercel.com/signup
2. Kliknite **"Continue with GitHub"**
3. Autorizujte Vercel

### 4.2 Import projekta:
1. Dashboard → Kliknite **"Add New..."** → **"Project"**
2. **Import Git Repository** → Izaberite `kvizmajstor`
3. Kliknite **Import**

### 4.3 Podesите projekat:

**Framework Preset:** Create React App (trebalo bi automatski da detektuje)

**Root Directory:**
- Kliknite **"Edit"** pored Root Directory
- Postavite na: `frontend`

**Build and Output Settings:**
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

### 4.4 Dodajte Environment Variable:

U **Environment Variables** sekciji:

```
REACT_APP_BACKEND_URL=https://your-backend.up.railway.app
```

⚠️ **Zamenite sa PRAVIM Railway URL-om iz Koraka 3.5!**

**VAŽNO:** 
- **NE** stavljajte `/api` na kraj
- URL treba da bude samo: `https://kvizmajstor-backend.up.railway.app`

### 4.5 Deploy!

1. Kliknite **"Deploy"**
2. Sačekajte 2-3 minuta...
3. Trebalo bi da vidite 🎉 **"Deployment Complete"**

### 4.6 Dobijte Frontend URL:

1. Nakon uspešnog deployment-a, dobićete URL
2. Kliknite **"Visit"** ili kopirajte URL
3. URL će biti tipa: `https://kvizmajstor.vercel.app`

**✅ Checkpoint:** Frontend je uživo!

---

## 🔗 KORAK 5: Verifikacija - Da li sve radi?

### 5.1 Testirajte sajt:

1. Otvorite vaš Vercel URL: `https://kvizmajstor.vercel.app`
2. Trebalo bi da vidite KvizMajstor homepage! 🎉

### 5.2 Testirajte funkcionalnosti:

**Testirajte sledeće:**
- [ ] Homepage se učitava
- [ ] Možete se registrovati
- [ ] Možete se ulogovati
- [ ] Vidite listu kvizova
- [ ] Možete pokrenuti kviz
- [ ] Možete polagati kviz i submitovati
- [ ] Vidite rezultate
- [ ] (Admin) Možete kreirati nove kvizove

### 5.3 Ako nešto ne radi:

**Check Backend Logs (Railway):**
1. Idite na Railway Dashboard
2. Kliknite na vaš servis
3. Idite na **Deployments** tab
4. Kliknite na poslednji deployment
5. Pogledajte **Logs**

**Check Frontend Console (Browser):**
1. Otvorite sajt
2. Pritisnite `F12` (Developer Tools)
3. Idite na **Console** tab
4. Potražite greške (crvene poruke)

---

## 🎨 KORAK 6: Custom Domen (Opciono)

### 6.1 Ako želite svoj domen (npr. kvizmajstor.rs):

**Za Frontend (Vercel):**
1. Vercel Dashboard → Vaš projekat → **Settings** → **Domains**
2. Dodajte svoj domen
3. Pratite instrukcije za DNS podešavanje

**Za Backend (Railway):**
1. Railway Dashboard → Vaš servis → **Settings** → **Custom Domain**
2. Dodajte subdomen (npr. `api.kvizmajstor.rs`)

---

## 💰 Troškovi (Mesečno)

| Servis | Trošak |
|--------|--------|
| **MongoDB Atlas** | **BESPLATNO** (512MB) |
| **Railway Backend** | **$0-5** (besplatan $5 kredit) |
| **Vercel Frontend** | **BESPLATNO** (unlimited projekti) |
| **UKUPNO** | **$0-5 / mesec** 🎉 |

---

## 🔄 Ažuriranje Aplikacije

**Kad god napravite izmene:**

1. **Push na GitHub:**
```bash
git add .
git commit -m "Opis izmene"
git push
```

2. **Automatski re-deploy:**
   - Railway će automatski re-deploy backend
   - Vercel će automatski re-deploy frontend

**Nema dodatnih koraka!** 🚀

---

## 🆘 Pomoć i Podrška

**Ako nešto ne radi:**

1. **Proverite logove:**
   - Railway: Dashboard → Deployments → View Logs
   - Vercel: Dashboard → Deployments → Function Logs

2. **Česte greške:**
   - CORS greška → Proverite REACT_APP_BACKEND_URL
   - Database greška → Proverite MONGO_URL
   - 404 greška → Proverite da su /api route-ovi dobro podeseni

3. **Korisne komande za debubbing:**
```bash
# Test backend API
curl https://your-backend.up.railway.app/api/health

# Test database connection (u backend logu)
# Potražite: "MongoDB connected"
```

---

## ✅ Checklist - Da li ste završili sve?

- [ ] GitHub repo kreiran i kod pushed
- [ ] MongoDB Atlas cluster kreiran
- [ ] MongoDB connection string sačuvan
- [ ] Railway backend deployan
- [ ] Railway environment variables dodati
- [ ] Railway domain generisan
- [ ] Vercel frontend deployan
- [ ] Vercel environment variable (REACT_APP_BACKEND_URL) dodat
- [ ] Sajt testiran i radi
- [ ] Sve funkcionalnosti testirane

---

## 🎉 Čestitamo!

Vaš **KvizMajstor** je sada **UŽIVO** na internetu! 🌐

**Vaši URL-ovi:**
- Frontend: `https://kvizmajstor.vercel.app`
- Backend: `https://kvizmajstor-backend.up.railway.app`

Podelite link sa prijateljima! 🚀

---

**Napomena:** Ovaj guide je napisan specifično za KvizMajstor aplikaciju. Ako imate problema, vratite se i pročitajte korak po korak.
