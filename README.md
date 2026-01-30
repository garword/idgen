# ID Card Generator API

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/garword/idgen)

REST API for generating Appleby College ID cards with Puppeteer.

**Demo API Key:** `windaacantik`

---

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies  
npm install

# Create .env file
copy .env.example .env

# Start server
npm start
```

**Server:** `http://localhost:3000`  
**Docs:** `http://localhost:3000/docs/index.html`

### Deploy to Vercel

See **[DEPLOY.md](./DEPLOY.md)** for complete guide.

---

## 📖 API Endpoints

### Generate ID Card
**POST** `/api/generate`

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "X-API-Key: windaacantik" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "JOHN DOE",
    "role": "STUDENT",
    "idNumber": "AC-S-12345"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cardId": "uuid-here",
    "downloadUrl": "/api/download/uuid-here",
    "expiresIn": "24 hours"
  }
}
```

### Download Card
**GET** `/api/download/:cardId`

```bash
curl http://localhost:3000/api/download/CARD_ID \
  -H "X-API-Key: windaacantik" \
  --output card.png
```

---

## 🔑 Authentication

All endpoints require API key header:
```
X-API-Key: windaacantik
```

**Create new keys (Admin):**
```bash
curl -X POST http://localhost:3000/api/keys/create \
  -H "X-Admin-Key: your-admin-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bot 1","description":"Production bot"}'
```

---

## 📦 Tech Stack

- **Backend:** Node.js + Express
- **Rendering:** Puppeteer + @sparticuz/chromium (Vercel)
- **Auth:** API Key based
- **Deploy:** Vercel Serverless

---

## 📝 Environment Variables

Create `.env` file:

```env
PORT=3000
ADMIN_KEY=your-super-secret-admin-key-change-this
TEMP_DIR=./temp
MAX_FILE_AGE_HOURS=24
ALLOWED_ORIGINS=*
NODE_ENV=development
```

For Vercel deployment, set these in Vercel Dashboard.

---

## 🎯 Features

✅ Generate ID cards programmatically  
✅ API Key authentication  
✅ Temporary file storage (24h)  
✅ Automatic cleanup  
✅ Interactive documentation  
✅ Serverless ready (Vercel)  

---

## 📚 Documentation

Full API docs available at: `/docs/index.html`

Deployment guide: [DEPLOY.md](./DEPLOY.md)

---

## 🔧 Development

```bash
# Install dependencies
npm install

# Start dev server with auto-reload
npm run dev

# Start production server
npm start
```

---

## 📄 License

MIT
