const { chromium } = require('C:\\Users\\tienhop\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright');
const fs = require('fs');

const outputDir = 'D:\\ki9\\prototype\\artifacts\\account-screens';
fs.mkdirSync(outputDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3002/pages/administration/users.html', { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${outputDir}\\01_account_management_screen.png`, fullPage: true });

  await page.getByRole('button', { name: 'Thêm Tài Khoản Mới', exact: true }).click();
  await page.locator('#user-modal').waitFor({ state: 'visible' });
  await page.screenshot({ path: `${outputDir}\\02_create_account_screen.png`, fullPage: false });

  await page.locator('#usr-fullName').fill('Nguyễn Test Account');
  await page.locator('#usr-email').fill('test-account@stayhub.vn');
  await page.locator('#usr-phone').fill('0901234567');
  await page.locator('#usr-zalo').fill('0901234567');
  await page.locator('#usr-role').selectOption('STAFF');
  await page.locator('#usr-building').selectOption('bld-1');
  await page.getByRole('button', { name: 'Tạo Tài Khoản', exact: true }).click();
  await page.locator('#create-account-success-modal').waitFor({ state: 'visible' });
  await page.screenshot({ path: `${outputDir}\\03_account_created_popup.png`, fullPage: false });

  await browser.close();
  console.log(outputDir);
})();
