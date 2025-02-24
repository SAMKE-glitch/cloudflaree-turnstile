import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';

// Add the stealth plugin to Playwright
chromium.use(stealth());

/**
 * Utility function to introduce a randomized delay.
 * @param {number} min - Minimum delay in milliseconds.
 * @param {number} max - Maximum delay in milliseconds.
 */
const randomDelay = (min, max) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Simulates human-like mouse movement to a target element.
 * @param {object} target - The Playwright page or frame object.
 * @param {string} targetSelector - The CSS selector for the target element.
 */
const simulateMouseMovement = async (target, targetSelector) => {
  const element = await target.$(targetSelector);
  if (element) {
    const box = await element.boundingBox();
    if (box) {
      // Start at a random point near the element and move to its center
      const startX = box.x + Math.random() * box.width;
      const startY = box.y + Math.random() * box.height;
      const endX = box.x + box.width / 2;
      const endY = box.y + box.height / 2;
      const mouse = target.mouse ? target.mouse : target.page().mouse;
      await mouse.move(startX, startY);
      await mouse.move(endX, endY, { steps: 10 });
      await randomDelay(200, 500);
    }
  }
};

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Initiating login sequence on Kilimall with enhanced human simulation and stealth plugin.');

  try {
    // Navigate to the login page
    await page.goto('https://www.kilimall.co.ke/login', { waitUntil: 'networkidle' });
    console.log('Kilimall login page loaded.');
    await page.waitForLoadState('networkidle');
    await randomDelay(100, 200);

    // Wait for the input fields using their name attributes
    await page.waitForSelector('input[name="account"]', { timeout: 30000 });
    await page.waitForSelector('input[name="password"]', { timeout: 30000 });

    // Type into the account field
    await simulateMouseMovement(page, 'input[name="account"]');
    await page.type('input[name="account"]', 'sammythemwa@gmail.com', { delay: 100 });
    console.log('Account entered.');
    await randomDelay(40, 90);

    // Type into the password field
    await simulateMouseMovement(page, 'input[name="password"]');
    await page.type('input[name="password"]', 'mine@Ednah2025', { delay: 100 });
    console.log('Password entered.');
    await randomDelay(60, 110);

    // Click the submit button and wait for any potential navigation
    // Note: If the login is handled via AJAX, the page may not navigate.
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {}), // catch timeout if no navigation occurs
      (async () => {
        await simulateMouseMovement(page, 'button[type="submit"]');
        await randomDelay(300, 700);
        await page.click('button[type="submit"]');
        console.log('Submit button clicked.');
      })()
    ]);

    // Optionally, wait a bit more for the page to fully render post-login
    await randomDelay(2000, 3000);

    // Check the current URL
    const currentUrl = page.url();
    console.log('Navigated to URL:', currentUrl);

    if (currentUrl === 'https://www.kilimall.co.ke/') {
      console.log('Login verified by URL redirection. Successful login.');
    } else {
      console.warn('URL did not change to the expected home page. It remains:', currentUrl);
      // As a backup, check for the email label
      try {
        await page.waitForSelector('span.label[title="sammythemwa@gmail.com"]', { timeout: 15000 });
        console.log('Login verified by detecting the email label on the page.');
      } catch (labelError) {
        console.error('Neither URL redirection nor email label detection confirmed login.');
      }
    }

    // Optionally, capture a screenshot for further validation if necessary
    await page.screenshot({ path: 'post-login.png' });

  } catch (error) {
    console.error('Error during login process:', error);
  } finally {
    await browser.close();
    console.log('Browser session closed.');
  }
})();
