const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.static(__dirname));  // Serve index.html etc.

app.get('/api/dp', async (req, res) => { /* same as before */ });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SAMARTH AI v2.6 LIVE ON ${PORT}`));
