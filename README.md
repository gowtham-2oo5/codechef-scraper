# 📊 CodeChef User Scraper API

A simple Express.js API that fetches **live CodeChef user data** using Puppeteer.

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
