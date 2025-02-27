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

    // Click the submit button and wait for navigation or page update
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {
        console.warn('No navigation occurred after clicking submit; login might be handled via AJAX.');
      }),
      (async () => {
        await simulateMouseMovement(page, 'button[type="submit"]');
        await randomDelay(300, 700);
        await page.click('button[type="submit"]');
        console.log('Submit button clicked.');
      })()
    ]);

    // Debug: take a screenshot immediately after login attempt
    await page.screenshot({ path: 'after-login.png' });
    console.log('Screenshot after login saved as "after-login.png".');

    // Instead of checking URL, wait for the search input on the home page to confirm login
    try {
      await page.waitForSelector('input#van-field-19414382-input', { timeout: 30000 });
      console.log('Login verified by presence of search input on the home page.');
    } catch (e) {
      console.error('Search input not found – login might have failed.');
    }

    // =========================
    // Begin purchase flow: Buying a laptop
    // =========================

    // Directly use the search input on the home page
    await simulateMouseMovement(page, 'input#van-field-19414382-input');
    await page.fill('input#van-field-19414382-input', 'lenovo laptop 20000');
    console.log('Filled search input with "lenovo laptop 20000".');
    await randomDelay(1000, 1500);

    // Click the search button within the search container
    await simulateMouseMovement(page, 'div#pc__search-input .search-button');
    await page.click('div#pc__search-input .search-button');
    console.log('Search button clicked.');
    await randomDelay(2000, 2500);

    // Wait for the search results to load (assuming product prices indicate results)
    await page.waitForSelector('div.product-price', { timeout: 30000 });
    console.log('Search results loaded.');

    // Retrieve all product-price elements and log their text for debugging
    const priceElements = await page.$$('div.product-price');
    console.log(`Found ${priceElements.length} product-price elements.`);
    const eligibleProducts = [];
    for (const [index, element] of priceElements.entries()) {
      const text = await element.textContent();
      console.log(`Product ${index}: ${text}`);
      if (text) {
        // Remove "KSh", spaces, and commas to parse the numeric value
        const priceNum = Number(text.replace(/KSh|\s|,/g, ''));
        if (priceNum >= 15000 && priceNum <= 20000) {
          eligibleProducts.push(element);
        }
      }
    }

    if (eligibleProducts.length === 0) {
      console.error('No products found in the price range of KSh 15,000 to KSh 20,000.');
    } else {
      // Select one product randomly from the eligible products
      const randomIndex = Math.floor(Math.random() * eligibleProducts.length);
      const chosenProduct = eligibleProducts[randomIndex];
      // Click the chosen product
      await simulateMouseMovement(page, 'div.product-price');
      await chosenProduct.click();
      console.log('Selected a product with a price in the desired range.');
    }

    // Optionally, take a screenshot after selecting the product
    await page.screenshot({ path: 'product-selected.png' });

  } catch (error) {
    console.error('Error during the process:', error);
  } finally {
    await browser.close();
    console.log('Browser session closed.');
  }
})();
