const puppeteer = require('puppeteer');

const getBrowser = async () => {
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/opt/render/.cache/puppeteer/chrome/linux-136.0.7103.92/chrome-linux64/chrome';
  
  console.log('Launching browser with executable path:', executablePath);
  
  return await puppeteer.launch({
    executablePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080',
    ],
    headless: 'new'
  });
};

module.exports = { getBrowser }; 