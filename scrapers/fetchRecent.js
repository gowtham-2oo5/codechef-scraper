const puppeteer = require("puppeteer");
const fs = require('fs');
const path = require('path');

module.exports = async (handle) => {
  if (!handle || typeof handle !== 'string') {
    return {
      success: false,
      error: "Invalid handle provided",
      message: "Please provide a valid CodeChef handle"
    };
  }

  let browser;
  try {
    // First, let's check if Chrome is installed and locate it
    const cacheDir = process.env.PUPPETEER_CACHE_DIR || '/opt/render/project/src/chrome';
    
    console.log(`Looking for Chrome in directory: ${cacheDir}`);
    
    // Look for the specific version we installed
    const expectedChromePath = path.join(cacheDir, 'chrome', 'linux-136.0.7103.92', 'chrome-linux64', 'chrome');
    
    if (fs.existsSync(expectedChromePath)) {
      console.log(`Found Chrome at: ${expectedChromePath}`);
      console.log('Chrome permissions:', fs.statSync(expectedChromePath).mode.toString(8));
    } else {
      console.log('Chrome not found at expected path, falling back to environment variable');
      console.log('Directory contents:', fs.readdirSync(cacheDir));
    }

    const launchOptions = {
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
        "--window-size=1920x1080",
      ]
    };

    // Use the Chrome path from environment variable or the one we found
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || expectedChromePath;
    console.log(`Using Chrome executable from: ${launchOptions.executablePath}`);

    console.log("Launching browser with options:", JSON.stringify(launchOptions));
    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    
    // Set a reasonable timeout
    page.setDefaultNavigationTimeout(60000); // Increased to 60 seconds for slower environments
    
    console.log(`Navigating to CodeChef profile: ${handle}`);
    await page.goto(`https://www.codechef.com/users/${handle}`, {
      waitUntil: "networkidle2", // Changed to ensure page is fully loaded
    });

    console.log("Waiting for activity table");
    await page.waitForSelector("div.widget.recent-activity table.dataTable", {
      timeout: 30000, // Increased timeout for slower environments
    });

    console.log("Extracting recent activity data");
    const recentActivity = await page.evaluate(() => {
      const rows = Array.from(
        document.querySelectorAll(
          "div.widget.recent-activity table.dataTable tr"
        )
      );
      return rows
        .filter((r) => !r.querySelector("th"))
        .map((r) => {
          const cols = r.querySelectorAll("td");
          const status = cols[2]?.textContent?.trim() || "";
          if (status.includes("100")) {
            const a = cols[1]?.querySelector("a");
            if (a) {
              return {
                problem_name: a.textContent.trim(),
                problem_url: "https://www.codechef.com" + a.getAttribute("href"),
              };
            }
          }
          return null;
        })
        .filter(Boolean);
    });

    console.log(`Found ${recentActivity.length} recent activities`);
    return { success: true, recentActivity };
  } catch (err) {
    console.error("Error in CodeChef scraper:", err);
    return {
      success: false,
      error: "Error fetching profile data.",
      message: err?.message || "Unknown error",
    };
  } finally {
    if (browser) {
      console.log("Closing browser");
      await browser.close().catch(e => console.error("Error closing browser:", e));
    }
  }
};