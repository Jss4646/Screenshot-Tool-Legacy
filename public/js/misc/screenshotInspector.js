class ScreenshotInspector {
    constructor() {
        let returnButton = document.querySelector('.return-button');
        returnButton.addEventListener('click', this.hide);
        this._addClickToExit();
    }

    _addClickToExit() {
        let largeScreenshotCover = document.querySelector('.large-screenshot-cover');
        largeScreenshotCover.addEventListener('click', event => {
            let screenshotContainer = document.querySelector('.large-screenshot');

            if (screenshotContainer !== event.target) {
                this.hide()
            }
        })
    }

    setImage(imageSrc, deviceType) {
        document.querySelector('.large-screenshot').src = imageSrc;
        this._setScreenshotSize(deviceType);
    }

    _setScreenshotSize(deviceType) {
        let largeScreenshotContent = document.querySelector('.large-screenshot-content');

        if (deviceType === 'desktop') {
            largeScreenshotContent.style.width = '90%';
        } else if (deviceType === 'mobile') {
            largeScreenshotContent.style.width = '40%';
        }
    }

    show() {
        document.querySelector('.large-screenshot-cover').style.display = 'flex';
    }

    hide() {
        document.querySelector('.large-screenshot-cover').style.display = 'none';
    }
}

export const screenshotInspector = new ScreenshotInspector();