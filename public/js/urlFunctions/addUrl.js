import {urlList} from '../screenshotOptions/urlList.js'
const addUrlButton = document.querySelector('#add-url');

addUrlButton.addEventListener('click', () => urlList.addUrl(getURL()));