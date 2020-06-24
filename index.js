const bodyParser = require('body-parser');
const express = require('express');

const {sendWebScreenshot, sendCliScreenshot, initialiseCluster} = require('./tools/screenshot');
const {crawlSitemapEndpoint} = require('./tools/crawler.js');
const {setScreenshotPageEndpoint} = require('./tools/document-screenshots.js');

const app = express();
const port = process.env.port || 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

initialiseCluster()
    .then(() => {
        app.get('/', res => res.sendFile('./index.html'));
        app.post('/take-web-screenshot', sendWebScreenshot);
        app.post('/take-cli-screenshot', sendCliScreenshot);
        app.post('/crawl-url', crawlSitemapEndpoint);
        app.post('/set-screenshot-page', setScreenshotPageEndpoint)
    })

app.listen(port, () => console.log(`Site is running on port ${port}`));
