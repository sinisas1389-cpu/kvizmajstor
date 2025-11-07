# ⚡ KvizMajstor - Quick Start Deployment

## 5 Minuta do Uživo Sajta! 🚀

---

## 📋 Šta Vam Treba:
- GitHub nalog
- MongoDB Atlas nalog (besplatan)
- Railway nalog (besplatan)
- Vercel nalog (besplatan)

---

## 🎯 Brzi Koraci:

### 1️⃣ GitHub (2 min)
```bash
git init
git add .
git commit -m "Deploy KvizMajstor"
git remote add origin https://github.com/YOUR_USERNAME/kvizmajstor.git
git push -u origin main
```

### 2️⃣ MongoDB Atlas (3 min)
1. https://mongodb.com/cloud/atlas → Register
2. Create FREE cluster (M0)
3. Database Access → Add User → Sačuvaj password
4. Network Access → Allow from Anywhere (0.0.0.0/0)
5. Connect → Copy connection string

**Connection String:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/kviz_db
```

### 3️⃣ Railway - Backend (2 min)
1. https://railway.app → Login sa GitHub
2. New Project → Deploy from GitHub → Izaberi `kvizmajstor`
3. Settings → Root Directory → `/backend`
4. Variables → Dodaj:
   ```
   MONGO_URL=<your-mongodb-connection-string>
   JWT_SECRET=random-secret-key-12345
   PORT=8001
   ```
5. Settings → Generate Domain → **Sačuvaj URL!**

### 4️⃣ Vercel - Frontend (2 min)
1. https://vercel.com → Login sa GitHub
2. Add New Project → Import `kvizmajstor`
3. Root Directory → `frontend`
4. Environment Variables → Dodaj:
   ```
   REACT_APP_BACKEND_URL=<your-railway-url>
   ```
5. Deploy!

---

## ✅ Gotovo! 🎉

**Vaš sajt je UŽIVO:**
- Frontend: `https://kvizmajstor.vercel.app`
- Backend: `https://your-app.up.railway.app`

---

## 🔄 Ažuriranje:
```bash
git add .
git commit -m "Update"
git push
```
Automatski se deployuje! ⚡

---

## 💰 Troškovi:
- MongoDB: **$0**
- Railway: **$0-5** (prvi $5 besplatno)
- Vercel: **$0**
- **UKUPNO: ~$0/mesec** 🎉

---

**Za detaljne instrukcije, pogledajte `DEPLOYMENT_GUIDE.md`**
