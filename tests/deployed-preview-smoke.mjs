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
const failedAssets = [];

page.on('pageerror', error => pageErrors.push(error.message));
page.on('requestfailed', request => {
  if (/\\.(?:m?js|css)(?:\\?|$)/i.test(request.url())) {
    failedAssets.push({ url: request.url(), error: request.failure()?.errorText || 'request failed' });
  }
});

try {
  const response = await page.goto(target.toString(), { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (!response || !response.ok()) {
    throw new Error(`Preview returned HTTP ${response?.status() ?? 'no response'}.`);
  }

  await page.waitForFunction(() => {
    const root = document.querySelector('#root');
    return Boolean(root?.children.length && (document.body?.innerText || '').trim().length > 60);
  }, null, { timeout: 45000 });

  await page.waitForTimeout(1500);

  const rendered = await page.evaluate(() => ({
    title: document.title,
    rootChildren: document.querySelector('#root')?.children.length ?? 0,
    visibleText: (document.body?.innerText || '').trim().slice(0, 500),
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }));

  if (pageErrors.length) throw new Error(`Browser runtime errors: ${pageErrors.join(' | ')}`);
  if (failedAssets.length) throw new Error(`Failed JS/CSS assets: ${JSON.stringify(failedAssets)}`);
  if (rendered.rootChildren < 1 || rendered.visibleText.length <= 60) {
    throw new Error(`Preview rendered an empty page: ${JSON.stringify(rendered)}`);
  }

  console.log('Deployed preview rendered successfully in mobile Chromium.');
  console.log(JSON.stringify(rendered, null, 2));
} catch (error) {
  await mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/deployed-preview-mobile-failure.png', fullPage: true }).catch(() => {});
  console.error('Deployed preview mobile smoke test failed.');
  console.error(error);
  console.error(JSON.stringify({ pageErrors, failedAssets }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}
