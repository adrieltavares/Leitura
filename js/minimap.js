// ===== ReadFlow — Minimap Module =====

RF.toggleMinimap = function () {
    RF.state.minimapVisible = !RF.state.minimapVisible;
    RF.els.minimapEl.classList.toggle('visible', RF.state.minimapVisible);
    document.getElementById('minimapBtn').classList.toggle('active', RF.state.minimapVisible);
    if (RF.state.minimapVisible) RF.updateMinimap();
};

RF.updateMinimap = function () {
    if (!RF.state.minimapVisible) return;
    RF.els.minimapText.textContent = RF.state.currentText.substring(0, 3000);
    RF.updateMinimapViewport();
};

RF.updateMinimapViewport = function () {
    if (!RF.state.minimapVisible) return;
    var el = RF.els.readerBody;
    var scrollPct = el.scrollHeight > el.clientHeight
        ? el.scrollTop / (el.scrollHeight - el.clientHeight) : 0;
    var viewportPct = el.clientHeight / el.scrollHeight;
    var mmHeight = RF.els.minimapEl.clientHeight - 20;
    RF.els.minimapViewport.style.top = (scrollPct * mmHeight * (1 - viewportPct)) + 'px';
    RF.els.minimapViewport.style.height = (viewportPct * mmHeight) + 'px';
};

function minimapClick(e) {
    var rect = RF.els.minimapEl.getBoundingClientRect();
    var pct = (e.clientY - rect.top) / rect.height;
    var el = RF.els.readerBody;
    var scrollMax = el.scrollHeight - el.clientHeight;
    el.scrollTop = pct * scrollMax;
}

RF.setupMinimap = function () {
    document.getElementById('minimapBtn').addEventListener('click', RF.toggleMinimap);
    document.getElementById('minimapContent').addEventListener('click', minimapClick);
    window.addEventListener('resize', RF.updateMinimapViewport);
};
