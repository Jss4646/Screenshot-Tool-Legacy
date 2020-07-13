const zip = new JSZip();

/**
 * Event listener to download all images in screenshot carousel when clicked
 */
downloadButton.addEventListener('click', () => {
    let screenshotsData = getScreenshotsData();
    generateScreenshotZip(screenshotsData);
});

/**
 * Gets the dataURL's of all images in the screenshot carousel
 *
 * @return {Array} ScreenshotsData - An array of DataURL
 */
function getScreenshotsData() {
    let screenshots = Array.from(imageCarousel.children);
    let screenshotsData = [];
    screenshots.forEach(screenshot => {
        let screenshotData = screenshot.querySelector('.screenshot');
        screenshotsData.push(screenshotData)
    });
    return screenshotsData
}

/**
 * Generates a zip file containing all images in PNG form
 * and prompts the user to download it
 *
 * @param {Array} screenshotsData - An array of DataURL
 */
function generateScreenshotZip(screenshotsData) {
    let screenshotsFolder = zip.folder('screenshots');

    screenshotsData.forEach((screenshotData, index) => {
        let blob = urlToBlob(screenshotData);
        screenshotsFolder.file(`Screenshot ${index + 1}.png`, blob)
    });
    zip.generateAsync({type: 'blob'})
        .then(zipFile => saveAs(zipFile, 'screenshots.zip'))
}


/**
 * Converts a dataURL to a blob so it can be viewed as a PNG when downloaded
 *
 * @param imageElement
 * @return {Blob}
 */
async function urlToBlob(imageElement) {
    const canvas = document.createElement('canvas');
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageElement, 0, 0);
    let dataUrl = canvas.toDataURL('image/jpg');

    return new Blob(dataUrl.split(',')[1])
}
