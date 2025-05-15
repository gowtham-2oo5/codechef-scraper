const puppeteer = require("puppeteer");

module.exports = async (handle) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
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
