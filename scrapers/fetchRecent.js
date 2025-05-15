const puppeteer = require("puppeteer");

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
    const launchOptions = {
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920x1080",
      ],
      // Let Puppeteer handle browser installation and caching
      ignoreDefaultArgs: ['--disable-extensions'],
      cacheDirectory: process.env.PUPPETEER_CACHE_DIR || '/opt/render/.cache/puppeteer'
    };

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    
    // Set a reasonable timeout
    page.setDefaultNavigationTimeout(30000);
    
    await page.goto(`https://www.codechef.com/users/${handle}`, {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector("div.widget.recent-activity table.dataTable", {
      timeout: 10000,
    });

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
          const status = cols[2]?.textContent?.trim();
          if (status.includes("100")) {
            const a = cols[1].querySelector("a");
            return {
              problem_name: a?.textContent.trim(),
              problem_url: "https://www.codechef.com" + a?.getAttribute("href"),
            };
          }
          return null;
        })
        .filter(Boolean);
    });

    return { success: true, recentActivity };
  } catch (err) {
    return {
      success: false,
      error: "Error fetching profile data.",
      message: err?.message || "Unknown error",
    };
  } finally {
    if (browser) await browser.close();
  }
};
