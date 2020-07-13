import {screenshotInspector} from '../misc/screenshotInspector.js';
import {disableButtonCheck} from "../screenshotOptions/urlList.js";
import {urlList} from "../screenshotOptions/urlList.js";

function onUrlBarEnterPress(event) {
    if (event.keyCode === 13) {
        takeScreenshots(getURL());
    }

}

urlBar.addEventListener('keydown', onUrlBarEnterPress);
screenshotButton.addEventListener('click', () => takeScreenshots(getURL()));

export function takeScreenshots(inputUrl) {
    screenshotButton.disabled = true;
    takeScreenshotsButton.disabled = true;
    loadingBar.reset();

    statusText.displayText(`Screenshotting: ${inputUrl}`);
    console.log(`Screenshotting: ${inputUrl}`);

    if (!validateURL(inputUrl)) {
        statusText.displayText('Please enter a valid URL');
        console.log(`Invalid URL: ${inputUrl}`);
        screenshotButton.disabled = false;
    } else {
        generateScreenshots(inputUrl);
    }
}

async function generateScreenshots(inputUrl) {
    const iframe = document.createElement('iframe')
    iframe.src = inputUrl;
    iframe.width = '600'
    iframe.height = '400'
    iframe.title = 'Testing'
    screenshotCarousel.append(iframe)
}