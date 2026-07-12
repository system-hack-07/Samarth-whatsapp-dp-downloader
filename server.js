const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.static('.'));

app.get('/api/dp', async (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.status(400).send('No target');

  const browser = await puppeteer.launch({args: chromium.args, executablePath: await chromium.executablePath(), headless: true});
  try {
    const page = await browser.newPage();
    await page.goto('https://web.whatsapp.com', {waitUntil:'networkidle2'});
    await page.waitForTimeout(25000);
    await page.type('div[data-tab="3"]', phone);
    await page.waitForTimeout(5000);
    await page.click(`span[title="${phone}"]`);
    await page.waitForTimeout(3000);
    await page.click('div[data-testid="profile-pic"]');
    await page.waitForTimeout(2000);

    const src = await page.evaluate(() => document.querySelector('img[alt="Profile photo"]')?.src);
    if (src) {
      const buf = await (await page.goto(src)).buffer();
      const fn = `${phone.replace(/[^0-9+]/g,'')}_dp.jpg`;
      fs.writeFileSync(fn, buf);
      res.download(fn);
    } else res.send('No DP');
  } catch(e) { res.send('Error'); } 
  finally { await browser.close(); }
});

app.listen(process.env.PORT || 3000, () => console.log('SAMARTH AI v2.6 RUNNING'));
