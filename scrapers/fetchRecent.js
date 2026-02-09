const { getBrowser } = require("../utils/puppeteer");

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
    browser = await getBrowser();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);

    await page.goto(`https://www.codechef.com/users/${handle}`, {
      waitUntil: "networkidle2",
    });

    await page.waitForSelector("div.widget.recent-activity table.dataTable", {
      timeout: 30000,
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
          const status = cols[2]?.textContent?.trim() || "";
          if (status.includes("100")) {
            const a = cols[1]?.querySelector("a");
            if (a) {
              return {
                problem_name: a.textContent.trim(),
                problem_url: "https://www.codechef.com" + a.getAttribute("href"),
                language: cols[3]?.textContent?.trim() || "",
              };
            }
          }
          return null;
        })
        .filter(Boolean);
    });

    return { success: true, recentActivity };
  } catch (err) {
    console.error("Error in CodeChef scraper:", err);
    return {
      success: false,
      error: "Error fetching profile data.",
      message: err?.message || "Unknown error",
    };
  } finally {
    if (browser) await browser.close().catch(console.error);
  }
};
