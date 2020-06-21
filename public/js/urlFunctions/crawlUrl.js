import {urlList} from '../screenshotOptions/urlList.js'
const crawlUrlButton = document.querySelector('#crawl-url');

crawlUrlButton.addEventListener('click', () => {
    statusText.displayText(`Crawling ${getURL()} for links`);
    urlList.clearUrls();

    let postData = {"url": getURL()};

    fetch(`${window.origin}/crawl-url`, createJsonPostData(postData))
        .then(response => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.json();
        })
        .then(links => {
            console.log('Adding Links');
            links.forEach(link => {
                urlList.addUrl(link, true)
            });
            if (urlList.getUrlElements().length === 0) {
                statusText.displayText('No valid links found');
            } else {
                statusText.hideText();
            }
        })
        .catch(err => {
            if (err.message.slice(0, 24) === 'Server could not connect') {
                statusText.displayText(err.message);
            } else {
                statusText.displayText("Something went wrong check console");
                console.log(err);
            }
        })
});