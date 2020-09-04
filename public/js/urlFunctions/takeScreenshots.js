import resolutions from '../../resolutionsJson.js'
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

/**
 * Displays screenshots
 *
 * @description
 * Adds an event listener to the screenshot button which makes a
 * requests to the server to take screenshots of the website
 * at specified resolutions. It then displays them in the area
 * underneath the site URL input box.
 *
 */
function takeScreenshots(inputUrl) {
    screenshotButton.disabled = true;
    takeScreenshotsButton.disabled = true;
    loadingBar.reset();

    statusText.displayText(`Screenshotting: ${inputUrl}`);
    console.log(`Screenshotting: ${inputUrl}`);

    let resolutions = getResolutions();

    if (!validateURL(inputUrl)) {
        statusText.displayText('Please enter a valid URL');
        console.log(`Invalid URL: ${inputUrl}`);
        screenshotButton.disabled = false;
        takeScreenshotsButton.disabled = false;
    } else if (resolutions.length === 0) {
        statusText.displayText('Please select at least one resolution');
        screenshotButton.disabled = false;
        takeScreenshotsButton.disabled = false;
    } else {
        generateScreenshots(inputUrl, resolutions);
    }
}



/**
 * @typedef {{resolution: {width, height}, name: *, url: *}} screenshotDataArray
 */

/**
 * returns the resolutions and their devices
 *
 * @description
 * Returns an array of Resolutions and their corresponding devices
 * according to what resolutions are checked
 *
 * @returns {screenshotDataArray} screenshotDataArray
 */
function getResolutions() {
    let resolutionElementArray = Array.from(resolutionList.children);
    let screenshotDataArray = [];

    resolutionElementArray.forEach(resolutionElement => {
        if (resolutionElement.firstChild.checked === true) {
            let screenshotData = getScreenshotData(resolutionElement);
            screenshotDataArray.push(screenshotData);
        }
    });

    return screenshotDataArray;
}

/**
 * Gets screenshot data from an <input> element
 *
 * Uses the key stored in the <input> elements name attribute to
 * get the data from the resolutionsJson.js file
 *
 * @param {Element} resolutionElement
 * @returns {{name: *, resolution: number | {width: number, height: number}}}
 */
function getScreenshotData(resolutionElement) {
    let key = resolutionElement.firstChild.name;

    let cookieData = document.querySelector('.cookie-container > textarea').value;
    if (cookieData) cookieData = JSON.parse(cookieData);

    let jsonData = resolutions[key];
    let resolution = jsonData.resolution;
    let deviceName = jsonData.deviceName;
    let deviceType = jsonData.deviceType;

    let fileName = generateFileName(key);

    return {
        "resolution": resolution,
        "deviceName": deviceName,
        "deviceType": deviceType,
        "cookieData": cookieData,
        "fileName": fileName
    };
}

/**
 * Generates a file name
 *
 * @param key
 * @returns {string}
 */
function generateFileName(key) {
    let url = getURL();

    let a = document.createElement('a');
    a.href = url;

    return `${a.host}-${key}`;
}

/**
 * requests a screenshot for every resolution checked
 *
 * @param {String} inputUrl
 * @param {screenshotDataArray} screenshotData
 */
function generateScreenshots(inputUrl, screenshotData) {
    screenshotData.forEach(data => {
        let screenshotPromise = generateScreenshot(inputUrl, data);
        loadingBar.addToQueue(screenshotPromise);
    })
}

/**
 * Requests a screenshot for a given URL and resolution
 * then displays the screenshot created
 *
 * @param {String} inputUrl
 * @param {screenshotDataArray} screenshotData
 * @return {Promise<Response>}
 */
function generateScreenshot(inputUrl, screenshotData) {
    console.log(screenshotData);

    return fetch(`${window.origin}/api/take-screenshot?url=${inputUrl}`, createJsonPostData(screenshotData))
        .then(response => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        })
        .then(async screenshotData => {
            displayScreenshot(screenshotData);
            changeButtonStates();
            loadingBar.update();
            return screenshotData.screenshot;
        })
        .catch(err => {
            if (err.message === 'Invalid Website') {
                statusText.displayText(err.message);
            } else {
                statusText.displayText("Something went wrong check console");
                console.log(err);
            }
            screenshotButton.disabled = false;
        })
}

function changeButtonStates() {
    screenshotButton.disabled = false;
    removeScreenshotsButton.disabled = false;
    disableButtonCheck();
}

/**
 * Displays the screenshot along with its device name
 *
 * @param {screenshotDataArray} screenshotData
 */
function displayScreenshot(screenshotData) {
    let screenshotContainer = createImageContainer(screenshotData);

    let parsedUrl = new URL(screenshotData.url)
    let siteFolder = findSiteFolder(parsedUrl);

    const observer = new MutationObserver(updateFolderAmount)

    if (siteFolder) {
        let pageFolder = findPageFolder(siteFolder, parsedUrl);

        if (pageFolder) {
            pageFolder.addScreenshot(screenshotContainer)
        } else {
            pageFolder = createPageFolder(parsedUrl);
            pageFolder.addScreenshot(screenshotContainer)
        }

        observer.observe(pageFolder.childNodes[1], {childList: true})
        siteFolder.addPage(pageFolder)
    } else {
        siteFolder = createSiteFolder(parsedUrl);
        let pageFolder = createPageFolder(parsedUrl);

        pageFolder.addScreenshot(screenshotContainer);
        siteFolder.addPage(pageFolder)
        screenshotCarousel.append(siteFolder);

        observer.observe(pageFolder.childNodes[1], {childList: true})
    }

    observer.observe(siteFolder.childNodes[1], {childList: true});
    statusText.hideText();
}



/**
 * Creates the html that contains the screenshot and device name
 *
 * @param {screenshotDataArray} screenshotData
 * @returns {HTMLDivElement} screenshotContentContainer
 */
function createImageContainer(screenshotData) {

    let screenshotContentContainer = document.createElement('div');
    screenshotContentContainer.classList.add('screenshot-content');

    let screenshotHeader = document.createElement('div')
    screenshotHeader.classList.add('screenshot-header')

    let placeholder = document.createElement('div')

    let screenshotResolutionName = document.createElement('h4');
    screenshotResolutionName.classList.add('screenshot-resolution-name');
    screenshotResolutionName.innerText = screenshotData.deviceName;

    let deleteScreenshotElement = document.createElement('img');
    deleteScreenshotElement.src = 'imgs/exit-icon.png';
    deleteScreenshotElement.alt = 'delete';
    deleteScreenshotElement.addEventListener('click', deleteScreenshot)

    screenshotHeader.appendChild(placeholder)
    screenshotHeader.appendChild(screenshotResolutionName)
    screenshotHeader.appendChild(deleteScreenshotElement)

    let screenshotContainer = document.createElement('div');
    screenshotContainer.classList.add('screenshot-container');
    screenshotContainer.setAttribute('data-device-type', screenshotData.deviceType);

    let screenshot = document.createElement('img');
    screenshot.src = screenshotData.screenshot;
    screenshot.classList.add('screenshot');
    screenshot.addEventListener('click', enlargeScreenshot);

    screenshotContainer.append(screenshot);

    screenshotContentContainer.append(screenshotHeader);
    screenshotContentContainer.append(screenshotContainer);

    return screenshotContentContainer;
}

function findSiteFolder(url) {
    let urlHost = url.host;

    let siteScreenshots = screenshotCarousel.childNodes;
    for (let i=0; i < siteScreenshots.length; i++) {
        if (siteScreenshots[i].id === urlHost) {
            return siteScreenshots[i];
        }
    }

    return null
}

function findPageFolder(siteFolder, url) {
    let selector = url.pathname.replace(/\//g, '\\\/');
    selector = selector.replace(/\./g, '\\.')
    selector = "#" + selector
    return siteFolder.querySelector(selector.toString());
}

function createSiteFolder(parsedUrl) {
    let siteContainer = document.createElement('div');
    siteContainer.id = parsedUrl.host;
    siteContainer.classList.add('site');

    let siteContainerHeader = createContainerHeader(parsedUrl.host);
    siteContainer.append(siteContainerHeader);

    let pages = document.createElement('div')
    pages.classList.add('pages')
    siteContainer.append(pages);

    siteContainer.addPage = (page) => {
        siteContainer.childNodes[1].append(page);
    }

    return siteContainer
}

function createPageFolder(parsedUrl) {
    let pageContainer = document.createElement('div');
    pageContainer.id = parsedUrl.pathname;
    pageContainer.classList.add('page');

    let pageContainerHeader = createContainerHeader(parsedUrl.pathname);
    pageContainer.append(pageContainerHeader);

    let screenshots = document.createElement('div')
    screenshots.classList.add('screenshots')
    pageContainer.append(screenshots);

    pageContainer.addScreenshot = (screenshotContainer) => {
        pageContainer.childNodes[1].append(screenshotContainer)
    }

    return pageContainer;
}

function createContainerHeader(title) {
    let siteContainerHeader = document.createElement('div');
    siteContainerHeader.classList.add('container-header');

    let toggleButton = document.createElement('img');
    toggleButton.classList.add('toggle-button');
    toggleButton.src = 'imgs/expand-arrow.png';
    toggleButton.alt = 'Toggle folder dropdown';
    toggleButton.addEventListener('click', toggleFolder);
    siteContainerHeader.append(toggleButton);

    let folderAmount = document.createElement('h4');
    folderAmount.innerText = '1';
    folderAmount.classList.add('folder-amount');
    siteContainerHeader.append(folderAmount);

    let containerTitle = document.createElement('h4')
    containerTitle.classList.add('container-title');
    containerTitle.innerText = title;
    siteContainerHeader.append(containerTitle);
    return siteContainerHeader;
}

function toggleFolder() {
    let folderHeader = this.parentElement;
    let folderElements = folderHeader.nextSibling;
    folderElements.hidden = !folderElements.hidden;
}

function updateFolderAmount(mutationList) {
    let folder = mutationList[0].target;
    let folderAmountElement = folder.previousElementSibling.childNodes[1];
    folderAmountElement.innerText = folder.childNodes.length;
    if (folder.childNodes.length === 0) {
        folder.parentElement.remove();
    }
}

function enlargeScreenshot(event) {
    let screenshot = event.target;
    let screenshotSrc = screenshot.src;
    let deviceType = screenshot.parentElement.dataset.deviceType;

    screenshotInspector.setImage(screenshotSrc, deviceType);
    screenshotInspector.show();
}

function deleteScreenshot() {
    this.parentElement.parentElement.remove();
}

export {takeScreenshots}