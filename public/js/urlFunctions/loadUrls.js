import {urlList} from '../screenshotOptions/urlList.js'

const loadUrlsButton = document.querySelector('#load-urls');
const uploadFileButton = document.querySelector('#file');

loadUrlsButton.addEventListener('click', (event) => {
    uploadFileButton.click();
});

uploadFileButton.addEventListener('input', event => {
    let file = event.target.files[0];
    let reader = new FileReader();

    if (file === undefined) return;

    if (file.type.match('txt.*')) {
        statusText.displayText('Only plain text files are accepted');
        return false;
    }

    reader.onload = () => {
        urlList.clearUrls();
        let urls = reader.result.split('\n');

        urls.forEach(url => {
            if (validateURL(url)) {
                urlList.addUrl(url)
            } else {
                console.log(`${url} is not a valid url`);
            }
        })
    };

    reader.readAsText(file);
    event.target.value = '';
});