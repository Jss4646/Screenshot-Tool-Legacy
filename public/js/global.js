/**
 * Globaly used functions and variables are stored here
 */

const screenshotButton = document.querySelector('#take-screenshot');
const removeScreenshotsButton = document.querySelector('.remove-screenshots');
const takeScreenshotsButton = document.querySelector('.take-screenshots');

const screenshotCarousel = document.querySelector('.screenshot-carousel');
const imageCarousel = document.querySelector('.screenshot-carousel');
const resolutionList = document.querySelector('.resolution-list');
const defaultResolutionList = document.querySelector('.default-res-list')
const urlBar = document.querySelector('.url');

function getURL() {
    return document.querySelector('.url').value;
}

/**
 * validates a URL by using the 'a' element
 *
 * @param url
 * @returns {""|boolean}
 */
function validateURL(url) {
    let inputUrl = document.createElement('a');
    inputUrl.href = url;
    let urlComponents = inputUrl.host.split('.');

    let barUrl = document.createElement('a');
    barUrl.href = getURL();
    let barComponents = barUrl.host.split('.');

    return (
        inputUrl.host &&
        inputUrl.host !== window.location.host &&
        urlComponents[1] === barComponents[1]
    );
}

function createJsonPostData (body) {
    return {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(body)
    }
}

/**
 * A class used to change the status text underneath the site URL text bar
 */
class StatusText {
    constructor() {
        this.statusElement = document.querySelector('.status');
    }

    changeText(statusText) {

        if (statusText.length > 80) {
            statusText = statusText.slice(0, 80) + '...'
        }

        this.statusElement.innerText = statusText;
    }

    hideText() {
        this.statusElement.classList.add('opacity-hidden');
        this.statusElement.innerText = 'Nothing is happening!';
    }

    displayText(statusText) {
        this.changeText(statusText);
        this.statusElement.classList.remove('opacity-hidden');
    }
}

const statusText = new StatusText();