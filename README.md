# CodeChef User Scraper API

A simple Express.js API that fetches **live CodeChef user data** using Puppeteer with Redis caching.

---

## 🎯 Features

* User Profile Info  
* Rating Graph Data  
* Recent Accepted Submissions  
* Aggregated Whole Profile  
* Upcoming Contests
* Redis-based caching
* Swagger API Docs  

---

## 🛠️ API Endpoints

| Route                  | What it does       |
| ---------------------- | ------------------ |
| `/health`              | Health check       |
| `/api/whole/:handle`   | Full profile data  |
| `/api/profile/:handle` | Basic user info    |
| `/api/ratings/:handle` | Ratings history    |
| `/api/recent/:handle`  | Recent submissions |
| `/api/upcoming`        | Upcoming contests  |

---

## ⚙️ Tech Stack

* Express.js server  
* Puppeteer (headless scraping)  
* Redis (caching)
* Clean REST APIs  

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- Redis server
- Chrome/Chromium browser

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/codechef-data-scraper.git
   cd codechef-data-scraper
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your settings:
   ```env
   PORT=8800
   REDIS_HOST=localhost
   REDIS_PORT=6379
   CACHE_TTL=3600
   ```

4. **Start Redis** (if not running)
   ```bash
   redis-server
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Test the API**
   ```
   http://localhost:8800/api/profile/your_codechef_username
   http://localhost:8800/api/whole/your_codechef_username
   ```

---

## 🔧 Configuration

### Environment Variables

- `PORT` - Server port (default: 8800)
- `NODE_ENV` - Environment (development/production)
- `REDIS_HOST` - Redis host (default: localhost)
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_PASSWORD` - Redis password (optional)
- `CACHE_TTL` - Cache TTL in seconds (default: 3600)
- `PUPPETEER_EXECUTABLE_PATH` - Chrome path (auto-detected if not set)

### Chrome Detection

The app automatically detects Chrome/Chromium:
- **Windows**: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- **Linux**: `/usr/bin/google-chrome`, `/usr/bin/chromium`
- **Custom**: Set `PUPPETEER_EXECUTABLE_PATH` to override

### Redis (Optional)

- **With Redis**: Full caching + distributed rate limiting
- **Without Redis**: Works fine, uses in-memory rate limiting (single instance only)

---

## 🔍 Error Handling

* `400 Bad Request` - Invalid input
* `404 Not Found` - User not found
* `500 Internal Server Error` - Server errors
* `503 Service Unavailable` - Connection issues

---

## 📝 License

ISC

---

## 🧑‍💻 Author

[@gowtham-2oo5](https://github.com/gowtham-2oo5)
