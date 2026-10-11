const { chromium } = require('C:\\Users\\tienhop\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright');
const fs = require('fs');

const outputDir = 'D:\\ki9\\prototype\\artifacts\\contract-screens';
fs.mkdirSync(outputDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3002/pages/finance/contracts.html', { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${outputDir}\\01_contract_management_screen.png`, fullPage: true });

  await page.getByRole('button', { name: 'Tạo Hợp Đồng Mới', exact: true }).click();
  await page.locator('#createContractModal').waitFor({ state: 'visible' });
  await page.screenshot({ path: `${outputDir}\\02_create_contract_screen.png`, fullPage: false });

  await page.locator('#createContractModal button').filter({ hasText: 'Hủy Bỏ' }).click();
  await page.getByRole('button', { name: 'Xem HĐ', exact: true }).first().click();
  await page.locator('#viewFullContractModal').waitFor({ state: 'visible' });
  await page.screenshot({ path: `${outputDir}\\03_contract_detail_screen.png`, fullPage: false });

  await browser.close();
  console.log(outputDir);
})();
