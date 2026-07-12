const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

const app = express();
app.use(express.static('.'));

app.get('/', (req, res) => res.sendFile(require('path').join(__dirname, 'index.html')));

app.get('/api/dp', async (req, res) => {
  const phone = req.query.phone;
  if (!phone) return res.status(400).send('Phone required');

  let browser;
  try {
    browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: await chromium.executablePath(),
      headless: true,
      timeout: 60000
    });

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000);
    await page.goto('https://web.whatsapp.com', {waitUntil: 'domcontentloaded'});

    // ... rest of scraper ...

    res.send('Try local first - Vercel Chrome limits are tight for WhatsApp');
  } catch (e) {
    res.status(500).send('Crash: ' + e.message);
  } finally {
    if (browser) await browser.close();
  }
});

module.exports = app; // For Vercel
