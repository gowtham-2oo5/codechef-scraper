const puppeteer = require("puppeteer");

module.exports = async (handle) => {
  if (!handle || typeof handle !== "string") {
    return {
      success: false,
      error: "Invalid handle provided",
      message: "Please provide a valid CodeChef handle",
    };
  }

  let browser;
  try {
    const launchOptions = {
      headless: "new", // You can set this to true if you don't want to see the browser
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--window-size=1920x1080",
      ],
      // No need to set executablePath on Windows for local dev
      // Puppeteer will use its default Chromium
    };

    console.log("Launching browser...");
    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);

    console.log(`Navigating to CodeChef profile: ${handle}`);
    await page.goto(`https://www.codechef.com/users/${handle}`, {
      waitUntil: "networkidle2",
    });

    console.log("Waiting for activity table...");
    await page.waitForSelector("div.widget.recent-activity table.dataTable", {
      timeout: 30000,
    });

    console.log("Extracting recent activity data...");
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
                problem_url:
                  "https://www.codechef.com" + a.getAttribute("href"),
              };
            }
          }
          return null;
        })
        .filter(Boolean);
    });

    console.log(`Found ${recentActivity.length} recent activities.`);
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
      await browser
        .close()
        .catch((e) => console.error("Error closing browser:", e));
    }
  }
};
