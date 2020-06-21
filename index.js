const bodyParser = require('body-parser');
const expressQueue = require('express-queue');
const express = require('express');

const screenshotTool = require('./tools/screenshot');
const crawler = require('./tools/crawler.js');
const doc = require('./tools/document-screenshots.js');

const app = express();
const port = process.env.port || 3000;

const queue = expressQueue({activeLimit: 3, queuedLimit: -1});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(queue);

app.get('/', res => res.sendFile('./index.html'));
app.post('/take-web-screenshot', screenshotTool.sendWebScreenshot);
app.post('/take-cli-screenshot', screenshotTool.sendCliScreenshot);
app.post('/crawl-url', crawler.crawlSitemapEndpoint);
app.post('/set-screenshot-page', doc.setScreenshotPageEndpoint)

app.listen(port, () => console.log(`Site is running on port ${port}`));
