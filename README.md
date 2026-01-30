# ID Card Generator API

REST API for generating Appleby College ID cards programmatically.

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies  
npm install

# Create .env file
copy .env.example .env

# Edit .env and set your admin key

# Start server
npm start
```

Server runs on: `http://localhost:3000`

API Documentation: `http://localhost:3000/docs/index.html`

### Deploy to Vercel

See [DEPLOY.md](./DEPLOY.md) for complete deployment guide.

**Quick Deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/id-card-api)


## 📖 API Endpoints

### Generate ID Card
**POST** `/api/generate`

Headers:
```
X-API-Key: your-api-key-here
Content-Type: application/json
```

Body:
```json
{
  "name": "JOHN DOE",
  "role": "STUDENT",
  "idNumber": "AC-S-12345",
  "validFrom": "2024",
  "validTo": "2029",
  "photo": "data:image/png;base64,..."
}
```

Response:
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

Headers:
```
X-API-Key: your-api-key-here
```

Returns: PNG image file

### Create API Key (Admin)
**POST** `/api/keys/create`

Headers:
```
X-Admin-Key: your-admin-key
Content-Type: application/json
```

Body:
```json
{
  "name": "Bot 1",
  "description": "Production bot"
}
```

### Validate API Key
**GET** `/api/keys/validate`

Headers:
```
X-API-Key: your-api-key-here
```

## 🔑 Demo API Key

For testing: `windaacantik`

## 💻 Example Usage

### Python
```python
import requests

response = requests.post(
    "http://localhost:3000/api/generate",
    headers={"X-API-Key": "windaacantik"},
    json={
        "name": "JOHN DOE",
        "role": "STUDENT",  
        "idNumber": "AC-S-12345"
    }
)

card_id = response.json()["data"]["cardId"]

# Download
img = requests.get(
    f"http://localhost:3000/api/download/{card_id}",
    headers={"X-API-Key": "windaacantik"}
)

with open("card.png", "wb") as f:
    f.write(img.content)
```

## 📝 Notes

- Cards expire after 24 hours
- Max image size: 10MB
- Automatic cleanup of old files
- See full documentation at `/docs/index.html`
