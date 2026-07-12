app.get('/api/dp', async (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.status(400).send('Phone required');

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
    defaultViewport: null
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle2', timeout: 60000 });

    await page.waitForTimeout(30000); // QR scan time (or use saved session)

    // Search
    await page.waitForSelector('div[data-tab="3"]', {timeout:30000});
    await page.type('div[data-tab="3"]', phone);
    await page.waitForTimeout(4000);

    // Click contact
    await page.click(`span[title="${phone}"]`).catch(() => {});
    await page.waitForTimeout(5000);

    // Open profile pic
    await page.click('div[data-testid="profile-pic"]');
    await page.waitForTimeout(3000);

    const imgSrc = await page.evaluate(() => {
      const img = document.querySelector('img[alt="Profile photo"], img[src*="whatsapp"]');
      return img ? img.src : null;
    });

    if (imgSrc) {
      const response = await page.goto(imgSrc, {waitUntil:'networkidle2'});
      const buffer = await response.buffer();
      const filename = `${phone.replace(/[^0-9+]/g,'')}_dp.jpg`;
      fs.writeFileSync(filename, buffer);
      console.log('DP saved:', filename);
      res.download(filename);
    } else {
      res.send('DP not found - try scanning QR again');
    }
  } catch (e) {
    console.error(e);
    res.status(500).send('Scrape failed: ' + e.message);
  } finally {
    await browser.close();
  }
});
