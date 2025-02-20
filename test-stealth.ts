// playwright-extra is a drop-in replacement for playwright
import { chromium } from 'playwright-extra';

// Load the stealth plugin (hides automation traces)
import stealth from 'puppeteer-extra-plugin-stealth';

// Add the plugin to Playwright
chromium.use(stealth());

(async () => {
  const browser = await chromium.launch({ headless: false }); // Set to true for headless mode
  const page = await browser.newPage();

  console.log('Testing the stealth plugin..');

  try {
    await page.goto('https://chat.openai.com/chat', { waitUntil: 'networkidle' });
  } catch (error) {
    console.error('Error navigating:', error);
  }

  console.log('Page content fetched. ✨');
  console.log(await page.title());

  await browser.close();
})();
