import {takeScreenshots} from '../urlFunctions/takeScreenshots.js'

const urlListElement = document.querySelector('.url-list');
let screenshotQueue = []

class UrlList {
    constructor() {
        takeScreenshotsButton.addEventListener('click', this.takeScreenshots);
    }

    addUrl(url, crawlUrl = false) {
        if (validateURL(url)) {
            if (this._checkDuplicateUrl(url, !crawlUrl)) {
                return false;
            }

            let urlContainer = this._createUrlContainer();
            let clickableUrl = this._createClickableUrl(url);

            urlContainer.appendChild(clickableUrl);
            urlListElement.appendChild(urlContainer);
            disableButtonCheck();
        } else if (!crawlUrl) {
            statusText.displayText('Please enter a valid URL')
        } else {
            console.log(`${url} is not a valid URL`)
        }
    }

    _createClickableUrl(url) {
        let clickableUrl = document.createElement('a');
        clickableUrl.href = url;
        clickableUrl.target = '_blank';
        clickableUrl.innerText = url;
        return clickableUrl;
    }

    _createUrlContainer() {
        let urlContainer = document.createElement('li');
        urlContainer.classList.add('url-list-item');
        urlContainer.addEventListener('contextmenu', this._remove_url);
        return urlContainer;
    }

    _checkDuplicateUrl(url, displayMessage = true) {
        let urlArrayElements = Array.from(urlListElement.children);
        for (let i = 0; i < urlArrayElements.length; i++) {
            if (urlArrayElements[i].innerText === url && displayMessage) {
                statusText.displayText('You have already added this url');
                return true;
            }
        }
    }

    _remove_url(event) {
        let urlContainer = event.target.parentElement;
        urlContainer.remove();
        disableButtonCheck();
        event.preventDefault();
    }

    takeScreenshots() {
        let urlListElement = document.querySelector('.url-list');
        let urlListArray = Array.from(urlListElement.children);
        urlListArray.reverse();

        urlListArray.forEach(urlElement => {
            takeScreenshots(urlElement.innerText)
        })

        screenshotQueue = Promise.all([...loadingBar.queue]);
        let createDocCheckbox = document.querySelector('#create-doc');

        screenshotQueue.then(screenshotUrls => {
            if (createDocCheckbox.checked) {
                let host = new URL(getURL()).hostname;

                let payload = {
                    method: 'POST',
                    mode: 'cors',
                    cache: 'no-cache',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    redirect: 'follow',
                    referrerPolicy: 'no-referrer',
                    body: JSON.stringify({host: host, screenshotLinks: screenshotUrls})
                }
                fetch(`${location.origin}/set-screenshot-page`, payload)
                    .then(data => console.log(data))
                    .catch(err => console.log(err));
            }
        })
    }

    clearUrls() {
        let urlArrayElements = Array.from(urlListElement.children);
        urlArrayElements.forEach(url => url.remove());
        takeScreenshotsButton.disabled = true;
    }

    getUrlElements() {
        return Array.from(urlListElement.children);
    }

    async checkIfAllScreenshotsTaken() {

    }

}

const clearUrlButton = document.querySelector('.clear-urls');

clearUrlButton.addEventListener('click', () => {
   urlList.clearUrls();
    clearUrlButton.disabled = true;
});

export function disableButtonCheck() {
    takeScreenshotsButton.disabled = urlListElement.childElementCount <= 0;
    clearUrlButton.disabled = urlListElement.childElementCount <= 0;
}

export const urlList = new UrlList();
