const { chromium } = require('C:\\Users\\tienhop\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto('http://localhost:3002/pages/administration/users.html', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Thêm Tài Khoản Mới', exact: true }).click();

  const roles = await page.locator('#usr-role option').allTextContents();
  if (roles.length !== 2 || !roles.some(x => x.includes('MANAGER')) || !roles.some(x => x.includes('STAFF'))) {
    throw new Error(`Unexpected create roles: ${roles.join(', ')}`);
  }
  if (await page.locator('#usr-title').count() !== 0) throw new Error('Job title field must be removed');
  if (await page.locator('#usr-zalo').count() !== 1) throw new Error('Zalo field is missing');

  await page.locator('#usr-fullName').fill('Nguyễn Test Account');
  await page.locator('#usr-email').fill('test-account@stayhub.vn');
  await page.locator('#usr-phone').fill('0901234567');
  await page.locator('#usr-zalo').fill('0901234567');
  await page.locator('#usr-role').selectOption('STAFF');
  await page.locator('#usr-building').selectOption('bld-1');
  await page.getByRole('button', { name: 'Tạo Tài Khoản', exact: true }).click();
  await page.locator('#create-account-success-modal').waitFor({ state: 'visible' });

  const popupText = await page.locator('#create-account-success-modal').innerText();
  for (const expected of ['Tên tài khoản', 'Mật khẩu tạm', 'Cơ sở làm việc', 'đổi mật khẩu']) {
    if (!popupText.includes(expected)) throw new Error(`Success popup is missing: ${expected}`);
  }
  if (!popupText.includes('Số Zalo nhận thông báo') || !popupText.includes('Nội dung gửi qua Zalo')) {
    throw new Error('Success popup is missing Zalo notification details');
  }
  await page.getByRole('button', { name: 'Đã hiểu', exact: true }).click();
  if (!(await page.locator('#create-account-success-modal').isVisible())) {
    throw new Error('Success popup closed before Zalo notification was sent');
  }
  await page.getByRole('button', { name: 'Gửi thông báo Zalo', exact: true }).click();
  const sentText = await page.locator('#created-account-zalo-status').innerText();
  if (!sentText.includes('Đã gửi thông báo đến Zalo')) throw new Error('Zalo notification was not marked as sent');
  await page.getByRole('button', { name: 'Đã hiểu', exact: true }).click();
  if (await page.locator('#create-account-success-modal').isVisible()) {
    throw new Error('Success popup did not close after Zalo notification was sent');
  }
  console.log('PASS: Create Account restricts roles, requires Zalo/building, generates password, and sends the Zalo notification.');
  await browser.close();
})();
