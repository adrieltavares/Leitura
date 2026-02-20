// ===== ReadFlow — Timer Module =====

RF.startReadingTimer = function () {
    if (RF.state.readingTimer) clearInterval(RF.state.readingTimer);
    RF.state.timerSeconds = 0;
    _updateTimerDisplay();
    RF.state.readingTimer = setInterval(function () {
        RF.state.timerSeconds++;
        _updateTimerDisplay();
    }, 1000);
};

function _updateTimerDisplay() {
    var m = Math.floor(RF.state.timerSeconds / 60).toString().padStart(2, '0');
    var s = (RF.state.timerSeconds % 60).toString().padStart(2, '0');
    RF.els.timerValue.textContent = m + ':' + s;
}

RF.setupTimerVisibility = function () {
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            if (RF.state.readingTimer) clearInterval(RF.state.readingTimer);
        } else if (RF.state.currentText) {
            RF.startReadingTimer();
        }
    });
};
