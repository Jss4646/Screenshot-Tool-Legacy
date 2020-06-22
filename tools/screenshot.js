const devices = require('puppeteer/DeviceDescriptors');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const urlParser = require('url');
const util = require("util");

const bucket = require('./bucket-access.js');


/**
 * Sends a screenshot to the client in png dataURL form
 *
 * @param req
 * @param res
 * @param next
 */
function sendWebScreenshot(req, res, next) {
    generateWebScreenshot(req)
        .then(screenshotUrl => {
            let screenshotData = req.body;

            let screenshotJson = {
                "url": req.query.url,
                "deviceName": screenshotData.deviceName,
                "deviceType": screenshotData.deviceType,
                "screenshot": screenshotUrl
            };
            res.json(screenshotJson);


            console.log('Image Sent!');
        })
        .catch(err => {
            if (err.message.slice(5, 26) === 'ERR_NAME_NOT_RESOLVED') {
                console.error('Invalid Website');
                res.statusMessage = 'Invalid Website';
                res.status(400).end();
            } else {
                console.log(err);
            }
        })
}

/**
 * Takes a screenshot of a given website and saves it to ./screenshots/
 *
 * @param req
 * @returns {Promise<Buffer>}
 */
async function generateWebScreenshot(req) {
    let url = req.query.url;
    let deviceName = req.body.deviceName;
    let resolution = req.body.resolution;
    let screenshotName = req.body.fileName;
    let cookieData = req.body.cookieData;

    let screenshotData = {url, deviceName, screenshotName, cookieData};
    let screenshotPath = await generateScreenshot(screenshotData, resolution);

    const readFile = util.promisify(fs.readFile);
    return readFile(screenshotPath)
        .then(async file => {
            let queryUrl = new URL(url);
            if (queryUrl.pathname === '/') queryUrl.pathname = `${queryUrl.pathname}/`;
            let screenshotPath = `${queryUrl.host}${queryUrl.pathname}${screenshotName}.jpg`;
            let bucketUrl = await bucket.uploadScreenshot(file, screenshotPath);

            let screenshotUrl = new URL(bucketUrl)
            screenshotUrl.host = 'd2imgupmba2ikz.cloudfront.net'

            return screenshotUrl.toString();
        })
}

/**
 *
 * @param req
 * @param res
 */
function sendCliScreenshot(req, res) {
    console.log('started');
    generateCliScreenshot(req)
        .then(screenshotPath => {
            screenshotPath = path.resolve(`${__dirname}/../${screenshotPath}`);
            res.sendFile(screenshotPath)
        })
}

/**
 *
 * @param req
 * @return {Promise<string>}
 */
async function generateCliScreenshot(req) {
    let url = req.query.url;
    let deviceName = req.query.deviceName;
    let cookieData = req.query.cookieData;

    let screenshotData = {
        url: url,
        deviceName: deviceName,
        screenshotName: 'cliScreenshot',
        cookieData: cookieData
    }
    return await generateScreenshot(screenshotData);
}

/**
 *
 * @param screenshotData
 * @param resolution
 * @return {Promise<string>}
 */
async function generateScreenshot(screenshotData, resolution = {width: 1920, height: 1080}) {
    let {url, deviceName, screenshotName, cookieData} = screenshotData
    let parsedUrl = urlParser.parse(url);
    let urlHost = parsedUrl.host;
    let urlPath = parsedUrl.path;

    const local = {};

    if (await fs.existsSync('/usr/bin/google-chrome-stable')) {
        local.browser = await puppeteer.launch({executablePath: '/usr/bin/google-chrome-stable',headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
    } else {
        local.browser = await puppeteer.launch({headless: true, args: ['--disable-extensions']});
    }

    let page = await local.browser.newPage();

    if (deviceName in devices) {
        console.log(`Emulating ${deviceName}`);
        let device = devices[deviceName];
        await page.emulate(device);
    } else {
        await page.setViewport(resolution);
    }

    console.log(`Screenshotting Website: ${url}`);
    console.log(`Device: ${deviceName}`);

    if (cookieData) await page.setCookie(...cookieData);
    await page.goto(`${url}`);
    await page.waitFor(0);

    if (urlPath === '/') {
        urlPath = 'home'
    } else {
        urlPath = `pages/${urlPath}`;
    }

    let folderPath = `./screenshots/${urlHost}/${urlPath}`
    let imagePath = `${folderPath}/${screenshotName}.jpg`;

    await folderPathCheck(folderPath);

    await page.screenshot({path: imagePath, fullPage: true});
    console.log('screenshot taken');
    local.browser.close();
    return imagePath;
}

async function folderPathCheck(path) {

    let folderNames = path.split('/')

    let pathCheck = '';
    for (const folderName of folderNames) {
        pathCheck = `${pathCheck}${folderName}/`

        if (!fs.existsSync(pathCheck)) {
            await fs.promises.mkdir(pathCheck);
        }
    }
}

module.exports = {
    sendWebScreenshot,
    sendCliScreenshot
};