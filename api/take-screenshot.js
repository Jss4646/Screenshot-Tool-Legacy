const screenshotApiClient = require('screenshotapi.net')('9TAV8BGMFQ4VH8XWPYNRCYPQQO7DYQGC')

export default async function takeScreenshot(req, res) {
    const url = req.query.url;
    const screenshotData = req.body;

    let screenshotUrl = await screenshotApiClient
        .getURLOfScreenshot({
            url: url,
            fresh: true,
            width: 1920,
            height: 1080,
            full_page: true,
            lazy_load: true,
        })

    let screenshotJson = {
        "url": req.query.url,
        "deviceName": screenshotData.deviceName,
        "deviceType": screenshotData.deviceType,
        "screenshot": screenshotUrl
    };

    res.json(screenshotJson)
}