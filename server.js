const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/news', async (req, res) => {
  const query = req.query.q || 'خبر';
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    headless: 'new'
  });
  const page = await browser.newPage();

  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=nws&hl=fa`;
  await page.goto(url, { waitUntil: 'networkidle2' });

  const news = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('div.dbsr').forEach(item => {
      const title = item.querySelector('div.JheGif')?.innerText;
      const link = item.querySelector('a')?.href;
      const snippet = item.querySelector('.Y3v8qd')?.innerText;
      if (title && link) {
        results.push({ title, link, snippet });
      }
    });
    return results;
  });

  await browser.close();
  res.json(news);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});