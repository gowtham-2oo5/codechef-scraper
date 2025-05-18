# 📊 CodeChef User Scraper API

A simple Express.js API that fetches **live CodeChef user data** using Puppeteer.

---

### 🎯 Features

* User Profile Info  
* Rating Graph Data  
* Recent Accepted Submissions  
* Aggregated Whole Profile  
* Swagger API Docs  

---

## 🛠️ Live API Endpoints

| Route                  | What it does       |
| ---------------------- | ------------------ |
| `/health`              | Health check       |
| `/api/whole/:handle`   | Full profile data  |
| `/api/profile/:handle` | Basic user info    |
| `/api/ratings/:handle` | Ratings history    |
| `/api/recent/:handle`  | Recent submissions |

🔗 **API Base URL**: [https://codechef-scraper-api.onrender.com](https://codechef-scraper-api.onrender.com)

---

## ⚙️ Under the Hood

* Express.js server  
* Puppeteer (headless scraping)  
* Clean REST APIs  
* Deployed on Render  

---

## 🚀 Setup Instructions

Follow these steps to run the project locally:

1. **Fork the Repository**
   > Click the fork button at the top-right corner of this repo.

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/your-username/codechef-data-scraper.git
   cd codechef-data-scraper
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Test the API**
   Open your browser or Postman and try:
   ```
   http://localhost:3000/api/profile/your_codechef_username # Doesnt require chromium
   http://localhost:3000/api/whole/your_codechef_username # Requires chromium
   ```

> 📌 Make sure you have a stable internet connection. Puppeteer will launch a headless Chromium instance to scrape data from CodeChef.

---

## 🔍 Error Handling

The API provides detailed error responses for various scenarios:

* `400 Bad Request` - Invalid input (e.g., empty username)  
* `404 Not Found` - User not found on CodeChef  
* `500 Internal Server Error` - Server-side errors  
* `503 Service Unavailable` - Connection issues with CodeChef  

All error responses follow this format:
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Detailed error message",
  "status": 400
}
```

---

## 🧑‍💻 Curious for more?

Check out my other cool projects here 👉 [@gowtham-2oo5](https://github.com/gowtham-2oo5)
