const devices = require('puppeteer/DeviceDescriptors');
const {Cluster} = require('puppeteer-cluster');
const path = require('path');

const bucket = require('./bucket-access.js');

const local = {}

async function initialiseCluster() {
    local.cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 1,
        retryLimit: 1,
        timeout: 500000,
        puppeteerOptions: {
            executablePath: process.env.chromeLocation || undefined
        }
    });

    await local.cluster.task(async ({page, data: {screenshotData, resolution = {width: 1920, height: 1080}}}) => {
        let {url, deviceName, screenshotName, cookieData} = screenshotData

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

        return await page.screenshot({fullPage: true});
    })
}


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
 * @returns {Promise<string>}
 */
async function generateWebScreenshot(req) {
    let resolution = req.body.resolution;

    let screenshotData = {
        url: req.query.url,
        deviceName: req.body.deviceName,
        screenshotName: req.body.fileName,
        cookieData: req.body.cookieData
    };

    let screenshot = await local.cluster.execute({screenshotData, resolution});
    let screenshotBuffer = Buffer.from(screenshot, 'base64');

    let queryUrl = new URL(screenshotData.url);
    if (queryUrl.pathname === '/') queryUrl.pathname = `${queryUrl.pathname}/`;
    let screenshotPath = `${queryUrl.host}${queryUrl.pathname}${screenshotData.screenshotName}.jpg`;
    let bucketUrl = await bucket.uploadScreenshot(screenshotBuffer, screenshotPath);

    let screenshotUrl = new URL(bucketUrl)
    screenshotUrl.host = 'd2imgupmba2ikz.cloudfront.net'

    return screenshotUrl.toString();

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
 * @return {Promise<void>}
 */
async function generateCliScreenshot(req) {
    let screenshotData = {
        url: req.query.url,
        deviceName: req.query.deviceName,
        screenshotName: 'cliScreenshot',
        cookieData: req.query.cookieData,
    };

    return await local.cluster.queue(screenshotData);
}

module.exports = {
    initialiseCluster,
    sendWebScreenshot,
    sendCliScreenshot,
};