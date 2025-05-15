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
    const cacheDir = process.env.PUPPETEER_CACHE_DIR || '/opt/render/.cache/puppeteer';
    
    console.log(`Looking for Chrome in cache directory: ${cacheDir}`);
    
    // Try to find Chrome installation
    let chromePath = null;
    
    // Option 1: Look for exact version mentioned in error
    const versionPaths = [
      path.join(cacheDir, 'chrome', 'linux-1250561', 'chrome-linux64', 'chrome'),
      path.join(cacheDir, 'chrome', 'linux-136.0.7103.92', 'chrome-linux64', 'chrome')
    ];
    
    for (const vPath of versionPaths) {
      if (fs.existsSync(vPath)) {
        console.log(`Found Chrome at: ${vPath}`);
        chromePath = vPath;
        break;
      }
    }
    
    // Option 2: Search for any Chrome binary in the directory
    if (!chromePath) {
      try {
        const searchCommand = `find ${cacheDir} -type f -name "chrome" | grep -v "initial-preferences"`;
        const result = require('child_process').execSync(searchCommand, { encoding: 'utf8' });
        const foundPaths = result.trim().split('\n');
        
        if (foundPaths.length > 0 && foundPaths[0]) {
          console.log(`Found Chrome binary at: ${foundPaths[0]}`);
          chromePath = foundPaths[0];
        }
      } catch (error) {
        console.error('Error searching for Chrome:', error);
      }
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

    // Use found Chrome if available
    if (chromePath) {
      console.log(`Using Chrome executable from: ${chromePath}`);
      launchOptions.executablePath = chromePath;
    } else if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      console.log(`Using Chrome from env: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    } else {
      console.log('No Chrome path found, letting Puppeteer use default browser');
    }

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