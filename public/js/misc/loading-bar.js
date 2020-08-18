const loadingBar = new ProgressBar.Line('#progress-bar', {strokeWidth: 4,
    easing: 'easeInOut',
    duration: 1400,
    color: '#FFEA82',
    trailColor: '#eee',
    trailWidth: 1,
    svgStyle: {width: '100%', height: '100%'},
    from: {color: '#72d2e3'},
    to: {color: '#15de64'},
    step: (state, bar) => {
        bar.path.setAttribute('stroke', state.color);
    }
})

loadingBar.queue = []

loadingBar.addToQueue = function (promise) {
    if (promise.isResolved) {
        this.queue.push(promise);
        return promise;
    }

    let isPending = true;
    let isRejected = false;
    let isFulfilled = false;

    let result = promise.then(
        function(v) {
            isFulfilled = true;
            isPending = false;
            return v;
        },
        function(e) {
            isRejected = true;
            isPending = false;
            throw e;
        }
    );

    result.isFulfilled = function() { return isFulfilled; };
    result.isPending = function() { return isPending; };
    result.isRejected = function() { return isRejected; };
    this.queue.push(result);
    return result;
}

loadingBar.update = function () {
    let totalScreenshots = this.queue.length;
    let totalFinishedScreenshots = this._getFinishedScreenshots().length

    this.animate((totalFinishedScreenshots + 1) / totalScreenshots)
}

loadingBar._getFinishedScreenshots = function () {
    let finishedScreenshots = [];
    this.queue.forEach(screenshot => {
        if (!screenshot.isPending()) {
            finishedScreenshots.push(screenshot)
        }
    })
    return finishedScreenshots
}

loadingBar.reset = function () {
    if (this._getFinishedScreenshots().length === this.queue.length) {
        this.queue = [];
        this.animate(0);
    }
}