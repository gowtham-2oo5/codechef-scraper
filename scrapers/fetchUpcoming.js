const { getBrowser } = require("../utils/puppeteer");

module.exports = async () => {
  let browser;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    
    await page.goto("https://www.codechef.com/contests", {
      waitUntil: "networkidle2",
    });

    await page.waitForSelector("div._table__container_7s2sw_344", {
      timeout: 30000,
    });

    const upcomingContests = await page.evaluate(() => {
      const contests = [];
      const contestElements = document.querySelectorAll("div._flex__container_7s2sw_528");
      
      contestElements.forEach((element) => {
        const nameElement = element.querySelector("a span");
        const name = nameElement ? nameElement.textContent.trim() : "";
        const code = nameElement ? nameElement.closest("a").href.split("/").pop() : "";
        
        const timerContainer = element.querySelector("div._timer__container_7s2sw_590");
        let startTime = "";
        let startDate = null;
        
        if (timerContainer) {
          const timeElements = timerContainer.querySelectorAll("p");
          const days = timeElements[0]?.textContent.trim() || "";
          const hours = timeElements[1]?.textContent.trim() || "";
          startTime = `${days} ${hours}`.trim();
          
          if (days && hours) {
            const daysNum = parseInt(days);
            const hoursNum = parseInt(hours);
            if (!isNaN(daysNum) && !isNaN(hoursNum)) {
              const startDateObj = new Date();
              startDateObj.setDate(startDateObj.getDate() + daysNum);
              startDateObj.setHours(startDateObj.getHours() + hoursNum);
              
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

    return { success: true, upcomingContests };
  } catch (err) {
    console.error("Error in CodeChef upcoming contests scraper:", err);
    return {
      success: false,
      error: "Error fetching upcoming contests data.",
      message: err?.message || "Unknown error",
    };
  } finally {
    if (browser) await browser.close().catch(console.error);
  }
};
