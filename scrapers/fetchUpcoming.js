const puppeteer = require("puppeteer");
const { getBrowser } = require("../utils/puppeteer");

module.exports = async () => {
  console.log("Fetching upcoming contests, scrapers/fetchUpcoming.js");
  let browser;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    
    // Set a reasonable timeout
    page.setDefaultNavigationTimeout(60000);
    
    console.log("Navigating to CodeChef contests page");
    await page.goto("https://www.codechef.com/contests", {
      waitUntil: "networkidle2",
    });

    console.log("Waiting for upcoming contests table");
    await page.waitForSelector("div._table__container_7s2sw_344", {
      timeout: 30000,
    });

    console.log("Extracting upcoming contests data");
    const upcomingContests = await page.evaluate(() => {
      const contests = [];
      const contestElements = document.querySelectorAll("div._flex__container_7s2sw_528");
      
      contestElements.forEach((element) => {
        const nameElement = element.querySelector("a span");
        const name = nameElement ? nameElement.textContent.trim() : "";
        const code = nameElement ? nameElement.closest("a").href.split("/").pop() : "";
        
        // Get start time information
        const timerContainer = element.querySelector("div._timer__container_7s2sw_590");
        let startTime = "";
        let startDate = null;
        
        if (timerContainer) {
          const timeElements = timerContainer.querySelectorAll("p");
          const days = timeElements[0]?.textContent.trim() || "";
          const hours = timeElements[1]?.textContent.trim() || "";
          startTime = `${days} ${hours}`.trim();
          
          // Calculate actual start date
          if (days && hours) {
            const daysNum = parseInt(days);
            const hoursNum = parseInt(hours);
            if (!isNaN(daysNum) && !isNaN(hoursNum)) {
              const startDateObj = new Date();
              startDateObj.setDate(startDateObj.getDate() + daysNum);
              startDateObj.setHours(startDateObj.getHours() + hoursNum);
              
              // Format date in a readable format
              startDate = startDateObj.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
              });
            }
          }
        }
        
        // Only add contests that have start time information
        if (startTime && startDate) {
          contests.push({
            name,
            code,
            url: `https://www.codechef.com/${code}`,
            startTime,
            startDate
          });
        }
      });

      return contests;
    });

    console.log(`Found ${upcomingContests.length} upcoming contests with start times`);
    return { success: true, upcomingContests };
  } catch (err) {
    console.error("Error in CodeChef upcoming contests scraper:", err);
    return {
      success: false,
      error: "Error fetching upcoming contests data.",
      message: err?.message || "Unknown error",
    };
  } finally {
    if (browser) {
      console.log("Closing browser");
      await browser.close().catch(e => console.error("Error closing browser:", e));
    }
  }
}; 