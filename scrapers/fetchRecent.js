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
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
        "--window-size=1920x1080",
      ],
      ignoreDefaultArgs: ['--disable-extensions']
    };

    // If we're on Render and have an executable path defined, use it
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      console.log(`Using Chrome from: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
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