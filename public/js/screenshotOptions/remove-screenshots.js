removeScreenshotsButton.addEventListener('click', () => {
    let screenshots = Array.from(imageCarousel.children);
    screenshots.forEach(screenshot => {
        screenshot.remove();
        downloadButton.disabled = true;
    })
});