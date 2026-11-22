import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.EDUKEN_PREVIEW_URL;
if (!baseUrl) throw new Error('EDUKEN_PREVIEW_URL is required.');

const target = new URL(baseUrl);
target.searchParams.set('preview-smoke', process.env.GITHUB_SHA || String(Date.now()));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const pageErrors = [];
const consoleErrors = [];
const failedAssets = [];

page.on('pageerror', error => pageErrors.push(error.message));
page.on('console', message => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('requestfailed', request => {
  if (/\\.(?:m?js|css)(?:\\?|$)/i.test(request.url())) {
    failedAssets.push({ url: request.url(), error: request.failure()?.errorText || 'request failed' });
  }
});
page.on('response', response => {
  if (response.status() >= 400 && /\\.(?:m?js|css)(?:\\?|$)/i.test(response.url())) {
    failedAssets.push({ url: response.url(), error: `HTTP ${response.status()}` });
  }
});

try {
  const response = await page.goto(target.toString(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (!response || !response.ok()) {
    throw new Error(`Preview returned HTTP ${response?.status() ?? 'no response'}.`);
  }

  await page.locator('.hero h1').waitFor({ state: 'visible', timeout: 45000 });
  await page.waitForTimeout(1200);

  const rendered = await page.evaluate(() => {
    const heading = [...document.querySelectorAll('.hero h1')].find(node => node.textContent?.includes('EDUKEN CONSULT.'));
    const rect = heading?.getBoundingClientRect();
    const style = heading ? getComputedStyle(heading) : null;
    return {
      title: document.title,
      rootChildren: document.querySelector('#root')?.children.length ?? 0,
      headingText: heading?.textContent?.replace(/\\s+/g, ' ').trim() || '',
      headingVisible: Boolean(rect && rect.width > 0 && rect.height > 0 && style?.display !== 'none' && style?.visibility !== 'hidden' && Number(style?.opacity || 1) > 0),
      headingBounds: rect ? { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) } : null,
      visibleText: (document.body?.innerText || '').trim().slice(0, 500),
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
    };
  });

  if (pageErrors.length) throw new Error(`Browser runtime errors: ${pageErrors.join(' | ')}`);
  if (failedAssets.length) throw new Error(`Failed JS/CSS assets: ${JSON.stringify(failedAssets)}`);
  if (!rendered.headingVisible || !rendered.headingText.includes('EDUKEN CONSULT.')) {
    throw new Error(`The expected EDUKEN homepage hero is not visibly rendered: ${JSON.stringify(rendered)}`);
  }

  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/deployed-preview-mobile-success.png', fullPage: true });
  console.log('Deployed preview rendered the approved EDUKEN CONSULT welcome hero in mobile Chromium.');
  console.log(JSON.stringify({ rendered, consoleErrors }, null, 2));
} catch (error) {
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/deployed-preview-mobile-failure.png', fullPage: true }).catch(() => {});
  console.error('Deployed preview mobile smoke test failed.');
  console.error(error);
  console.error(JSON.stringify({ pageErrors, consoleErrors, failedAssets }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
