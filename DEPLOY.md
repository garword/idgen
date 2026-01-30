# Deploy ke Vercel

Panduan lengkap untuk deploy ID Card Generator API ke Vercel.

## 📋 Prerequisites

1. Akun Vercel (gratis) - https://vercel.com
2. Vercel CLI (optional): `npm i -g vercel`
3. Repository Git (GitHub, GitLab, atau Bitbucket)

---

## 🚀 Deployment Steps

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push ke Git Repository**
   ```bash
   cd E:\hasilkuuy\edit\id_card_recreation\api
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Import di Vercel**
   - Login ke https://vercel.com
   - Klik **"New Project"**
   - Import repository Anda
   - Vercel akan auto-detect konfigurasi dari `vercel.json`

3. **Configure Environment Variables**
   
   Di Vercel Dashboard → Settings → Environment Variables, tambahkan:
   
   ```
   ADMIN_KEY=your-super-secret-admin-key-change-this
   PORT=3000
   TEMP_DIR=/tmp
   MAX_FILE_AGE_HOURS=24
   ALLOWED_ORIGINS=*
   NODE_ENV=production
   ```

4. **Deploy!**
   - Klik **"Deploy"**
   - Tunggu proses build selesai (~2-3 menit)
   - API Anda akan tersedia di: `https://your-project.vercel.app`

---

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd E:\hasilkuuy\edit\id_card_recreation\api
vercel

# Deploy to production
vercel --prod
```

---

## ⚙️ Environment Variables

Pastikan set environment variables berikut di Vercel:

| Variable | Value | Description |
|----------|-------|-------------|
| `ADMIN_KEY` | `your-secret-key` | Admin key untuk buat API key baru |
| `NODE_ENV` | `production` | Environment mode |
| `TEMP_DIR` | `/tmp` | Temporary file directory (Vercel) |
| `MAX_FILE_AGE_HOURS` | `24` | Card expiration time |
| `ALLOWED_ORIGINS` | `*` | CORS origins (atau URL spesifik) |

---

## 🧪 Testing Deployment

Setelah deploy, test API dengan:

```bash
# Health check
curl https://your-project.vercel.app/health

# Generate card
curl -X POST https://your-project.vercel.app/api/generate \
  -H "X-API-Key: windaacantik" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "JOHN DOE",
    "role": "STUDENT",
    "idNumber": "AC-S-12345"
  }'

# View docs
# Buka: https://your-project.vercel.app/docs/index.html
```

---

## 📝 Important Notes

### Puppeteer di Vercel
- Vercel menggunakan **serverless functions**
- Puppeteer diganti dengan `chrome-aws-lambda`
- Browser binary sudah include otomatis
- Max execution time: **10 detik** (Hobby plan)

### File Storage
- Files disimpan di `/tmp` (temporary)
- **Tidak persisten** - file hilang setelah function selesai
- Cards expire otomatis setelah 24 jam
- Download harus dilakukan segera setelah generate

### Limitations (Hobby Plan)
- ⏱️ Serverless timeout: 10 detik
- 💾 File size limit: 4.5 MB
- 🔄 Max deploy: 100/hari
- 📊 Bandwidth: 100 GB/bulan

Upgrade ke Pro jika butuh lebih:
- ⏱️ Timeout: 60 detik
- 💾 File size: 50 MB
- 🔄 Unlimited deploys

---

## 🔧 Troubleshooting

### Error: "Puppeteer timeout"
- Card generation terlalu lama
- Ukuran foto terlalu besar (kompres dulu)
- Upgrade ke Vercel Pro untuk timeout lebih lama

### Error: "Module not found: chrome-aws-lambda"
- Run: `npm install chrome-aws-lambda puppeteer-core`
- Commit & push ulang
- Redeploy

### Error: "File not found" saat download
- Card sudah expire (>24 jam)
- Generate ulang card baru
- Download segera setelah generate

### CORS Error
- Set `ALLOWED_ORIGINS` di environment variables
- Atau gunakan `*` untuk allow all origins

---

## 🔄 Auto Deploy

Vercel otomatis deploy saat push ke Git:

```bash
git add .
git commit -m "Update API"
git push

# Vercel otomatis build & deploy!
```

---

## 📊 Monitoring

Monitor API di Vercel Dashboard:
- **Analytics**: Traffic & performance
- **Logs**: Function logs & errors
- **Deployments**: Deploy history

---

## 🎯 Custom Domain (Optional)

1. Vercel Dashboard → Settings → Domains
2. Add domain Anda
3. Update DNS records sesuai instruksi
4. SSL otomatis di-setup Vercel

---

## 💡 Tips

1. **Performance**: Kompres foto sebelum upload
2. **Costs**: Monitor usage di dashboard
3. **Security**: Jangan expose `ADMIN_KEY`
4. **Backup**: Simpan API keys di tempat aman

---

Butuh bantuan? Check:
- 📖 Vercel Docs: https://vercel.com/docs
- 💬 Vercel Community: https://github.com/vercel/vercel/discussions
