function urlValidationHighlighting() {
    let inputUrl = getURL();

    if (inputUrl.length > 0) {
        if (validateURL(inputUrl)) {
            urlBar.classList.remove('reject');
            urlBar.classList.add('accept');
        } else {
            urlBar.classList.remove('accept');
            urlBar.classList.add('reject');
        }
    } else {
        urlBar.classList.remove('reject');
        urlBar.classList.remove('accept');
    }
}



urlBar.addEventListener('keyup', urlValidationHighlighting);
