import {urlList} from '../screenshotOptions/url-list.js'
const addUrlButton = document.querySelector('#add-url');

addUrlButton.addEventListener('click', () => urlList.addUrl(getURL()));