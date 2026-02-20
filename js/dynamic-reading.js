// ===== ReadFlow — Dynamic Reading Module =====

// ---------- STATE ----------
RF.dr = {
    active: false,
    mode: null,        // 'rsvp' | 'orp' | 'chunking' | 'autoscroll'
    paused: false,
    words: [],
    wordIndex: 0,
    wpm: 300,
    chunkSize: 3,
    timer: null,
    scrollSpeed: 1,     // px per frame
    scrollRAF: null,
    fontSize: 48,       // px for overlay word
    startPct: 0         // start position 0-100%
};

// ---------- HELPERS ----------
function _drGetWords() {
    return RF.state.currentText.split(/\s+/).filter(function (w) { return w.length > 0; });
}

function _drInterval() {
    return Math.round(60000 / RF.dr.wpm);
}

// ORP: optimal recognition point ≈ 30% of word length (min index 0)
function _orpIndex(word) {
    if (word.length <= 1) return 0;
    if (word.length <= 3) return 1;
    return Math.floor(word.length * 0.3);
}

function _drRenderWord(word, useORP) {
    var display = document.getElementById('drWord');
    if (!display) return;

    if (!useORP) {
        display.innerHTML = '<span class="dr-word-text">' + RF.escapeHtml(word) + '</span>';
        return;
    }

    // ORP: split word into 3 parts — before, pivot, after
    var idx = _orpIndex(word);
    var before = RF.escapeHtml(word.slice(0, idx));
    var pivot = RF.escapeHtml(word.charAt(idx));
    var after = RF.escapeHtml(word.slice(idx + 1));

    display.innerHTML =
        '<span class="dr-word-text">' +
        '<span class="dr-before">' + before + '</span>' +
        '<span class="dr-pivot">' + pivot + '</span>' +
        '<span class="dr-after">' + after + '</span>' +
        '</span>';
}

function _drRenderChunk() {
    var display = document.getElementById('drWord');
    if (!display) return;

    var end = Math.min(RF.dr.wordIndex + RF.dr.chunkSize, RF.dr.words.length);
    var chunk = RF.dr.words.slice(RF.dr.wordIndex, end);
    display.innerHTML = '<span class="dr-chunk-text">' + chunk.map(RF.escapeHtml).join(' ') + '</span>';
}

function _drUpdateProgress() {
    var bar = document.getElementById('drProgressBar');
    var info = document.getElementById('drInfo');
    if (!bar || !info) return;
    var total = RF.dr.words.length;
    var current = RF.dr.wordIndex;
    var pct = total > 0 ? Math.round((current / total) * 100) : 0;
    bar.style.width = pct + '%';

    var modeLabel = RF.dr.mode === 'rsvp' ? 'RSVP' :
        RF.dr.mode === 'orp' ? 'ORP' : 'Chunk';
    info.textContent = modeLabel + ' · ' + RF.dr.wpm + ' WPM · ' + pct + '%';
}

function _drUpdateSpeedDisplay() {
    var el = document.getElementById('drSpeedValue');
    if (el) el.textContent = RF.dr.wpm + ' WPM';
}

function _drUpdateChunkDisplay() {
    var el = document.getElementById('drChunkValue');
    if (el) el.textContent = RF.dr.chunkSize + ' palavras';
}

// ---------- FONT SIZE ----------
RF.drFontUp = function () {
    RF.dr.fontSize = Math.min(96, RF.dr.fontSize + 4);
    _drApplyFontSize();
};

RF.drFontDown = function () {
    RF.dr.fontSize = Math.max(24, RF.dr.fontSize - 4);
    _drApplyFontSize();
};

function _drApplyFontSize() {
    var el = document.getElementById('drWord');
    if (el) el.style.fontSize = RF.dr.fontSize + 'px';
    var display = document.getElementById('drFontSizeValue');
    if (display) display.textContent = RF.dr.fontSize + 'px';
}

// ---------- POSITION SLIDER ----------
RF.drSetPosition = function (value) {
    var pct = parseInt(value, 10);
    RF.dr.startPct = pct;
    var posLabel = document.getElementById('drPositionValue');
    if (posLabel) posLabel.textContent = pct + '%';

    // If already running, jump to that position
    if (RF.dr.active && RF.dr.words.length > 0) {
        var newIndex = Math.floor((pct / 100) * RF.dr.words.length);
        RF.dr.wordIndex = Math.min(newIndex, RF.dr.words.length - 1);
        _drUpdateProgress();
    }
};

// ---------- OVERLAY SHOW/HIDE ----------
function _drShowOverlay() {
    var overlay = document.getElementById('drOverlay');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';

    // Show/hide chunk controls
    var chunkControls = document.getElementById('drChunkControls');
    chunkControls.style.display = RF.dr.mode === 'chunking' ? 'flex' : 'none';

    // Apply font size
    _drApplyFontSize();

    // Init position slider
    var slider = document.getElementById('drPositionSlider');
    if (slider) slider.value = RF.dr.startPct;
    var posLabel = document.getElementById('drPositionValue');
    if (posLabel) posLabel.textContent = RF.dr.startPct + '%';

    _drUpdateSpeedDisplay();
    _drUpdateChunkDisplay();
}

function _drHideOverlay() {
    var overlay = document.getElementById('drOverlay');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
}

// ---------- TICK (word step) ----------
function _drTick() {
    if (RF.dr.paused) return;
    if (RF.dr.wordIndex >= RF.dr.words.length) {
        RF.drStop();
        RF.showToast('Leitura dinâmica concluída!', 'check_circle');
        return;
    }

    if (RF.dr.mode === 'chunking') {
        _drRenderChunk();
        RF.dr.wordIndex += RF.dr.chunkSize;
    } else {
        var word = RF.dr.words[RF.dr.wordIndex];
        _drRenderWord(word, RF.dr.mode === 'orp');
        RF.dr.wordIndex++;
    }

    _drUpdateProgress();
}

// ---------- START MODES ----------
function _drStartWordMode(mode) {
    if (!RF.state.currentText) {
        RF.showToast('Carregue um texto primeiro.', 'warning');
        return;
    }

    RF.dr.mode = mode;
    RF.dr.words = _drGetWords();

    // Apply start position
    var startIdx = Math.floor((RF.dr.startPct / 100) * RF.dr.words.length);
    RF.dr.wordIndex = Math.min(startIdx, RF.dr.words.length - 1);

    RF.dr.paused = false;
    RF.dr.active = true;

    _drShowOverlay();
    _drUpdatePauseBtn();

    // First tick immediately
    _drTick();

    RF.dr.timer = setInterval(_drTick, _drInterval());

    var label = mode === 'rsvp' ? 'RSVP' : mode === 'orp' ? 'ORP' : 'Chunking';
    var pctLabel = RF.dr.startPct > 0 ? ' (de ' + RF.dr.startPct + '%)' : '';
    RF.showToast(label + ' iniciado a ' + RF.dr.wpm + ' WPM' + pctLabel, 'speed');
}

RF.startRSVP = function () { _drStartWordMode('rsvp'); };
RF.startORP = function () { _drStartWordMode('orp'); };
RF.startChunking = function () { _drStartWordMode('chunking'); };

// ---------- AUTO-SCROLL ----------
RF.startAutoScroll = function () {
    if (!RF.state.currentText) {
        RF.showToast('Carregue um texto primeiro.', 'warning');
        return;
    }

    RF.dr.mode = 'autoscroll';
    RF.dr.active = true;
    RF.dr.paused = false;

    // Show the guide line
    var guide = document.getElementById('autoScrollGuide');
    guide.classList.add('visible');

    // Show auto-scroll controls bar
    var bar = document.getElementById('autoScrollBar');
    bar.classList.add('visible');
    _drUpdateAutoScrollSpeed();

    function scrollStep() {
        if (!RF.dr.active || RF.dr.mode !== 'autoscroll') return;
        if (!RF.dr.paused) {
            RF.els.readerBody.scrollTop += RF.dr.scrollSpeed * 0.5;
            RF.updateProgress();

            // Check if reached bottom
            var el = RF.els.readerBody;
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
                RF.drStopAutoScroll();
                RF.showToast('Scroll automático concluído!', 'check_circle');
                return;
            }
        }
        RF.dr.scrollRAF = requestAnimationFrame(scrollStep);
    }

    RF.dr.scrollRAF = requestAnimationFrame(scrollStep);
    RF.showToast('Scroll automático iniciado', 'swap_vert');
};

RF.drStopAutoScroll = function () {
    RF.dr.active = false;
    RF.dr.mode = null;
    if (RF.dr.scrollRAF) {
        cancelAnimationFrame(RF.dr.scrollRAF);
        RF.dr.scrollRAF = null;
    }
    var guide = document.getElementById('autoScrollGuide');
    if (guide) guide.classList.remove('visible');
    var bar = document.getElementById('autoScrollBar');
    if (bar) bar.classList.remove('visible');
};

function _drUpdateAutoScrollSpeed() {
    var el = document.getElementById('autoScrollSpeedValue');
    if (el) el.textContent = RF.dr.scrollSpeed.toFixed(1) + 'x';
}

// ---------- CONTROLS ----------
RF.drPauseToggle = function () {
    RF.dr.paused = !RF.dr.paused;
    _drUpdatePauseBtn();

    if (RF.dr.mode === 'autoscroll') return;

    if (RF.dr.paused) {
        clearInterval(RF.dr.timer);
    } else {
        RF.dr.timer = setInterval(_drTick, _drInterval());
    }
};

function _drUpdatePauseBtn() {
    var btn = document.getElementById('drPauseBtn');
    if (!btn) return;
    var icon = btn.querySelector('.material-icons-round');
    if (icon) icon.textContent = RF.dr.paused ? 'play_arrow' : 'pause';
}

RF.drStop = function () {
    RF.dr.active = false;
    RF.dr.paused = false;
    clearInterval(RF.dr.timer);
    RF.dr.timer = null;
    _drHideOverlay();

    if (RF.dr.mode === 'autoscroll') {
        RF.drStopAutoScroll();
    }
    RF.dr.mode = null;
};

RF.drSpeedUp = function () {
    if (RF.dr.mode === 'autoscroll') {
        RF.dr.scrollSpeed = Math.min(5, RF.dr.scrollSpeed + 0.5);
        _drUpdateAutoScrollSpeed();
        return;
    }
    RF.dr.wpm = Math.min(1000, RF.dr.wpm + 50);
    _drUpdateSpeedDisplay();
    _drUpdateProgress();
    if (!RF.dr.paused && RF.dr.timer) {
        clearInterval(RF.dr.timer);
        RF.dr.timer = setInterval(_drTick, _drInterval());
    }
};

RF.drSpeedDown = function () {
    if (RF.dr.mode === 'autoscroll') {
        RF.dr.scrollSpeed = Math.max(0.5, RF.dr.scrollSpeed - 0.5);
        _drUpdateAutoScrollSpeed();
        return;
    }
    RF.dr.wpm = Math.max(50, RF.dr.wpm - 50);
    _drUpdateSpeedDisplay();
    _drUpdateProgress();
    if (!RF.dr.paused && RF.dr.timer) {
        clearInterval(RF.dr.timer);
        RF.dr.timer = setInterval(_drTick, _drInterval());
    }
};

RF.drChunkUp = function () {
    RF.dr.chunkSize = Math.min(8, RF.dr.chunkSize + 1);
    _drUpdateChunkDisplay();
};

RF.drChunkDown = function () {
    RF.dr.chunkSize = Math.max(2, RF.dr.chunkSize - 1);
    _drUpdateChunkDisplay();
};

// Auto-scroll specific
RF.drAutoScrollPause = function () {
    RF.dr.paused = !RF.dr.paused;
    var btn = document.getElementById('autoScrollPauseBtn');
    if (btn) {
        var icon = btn.querySelector('.material-icons-round');
        if (icon) icon.textContent = RF.dr.paused ? 'play_arrow' : 'pause';
    }
};

// ---------- SETUP ----------
RF.setupDynamicReading = function () {
    // Keyboard: Space to pause in overlay, Esc to stop
    document.addEventListener('keydown', function (e) {
        if (!RF.dr.active) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            RF.drStop();
            return;
        }
        if (e.key === ' ' || e.code === 'Space') {
            var tag = document.activeElement.tagName.toLowerCase();
            if (tag === 'textarea' || tag === 'input') return;
            e.preventDefault();
            if (RF.dr.mode === 'autoscroll') {
                RF.drAutoScrollPause();
            } else {
                RF.drPauseToggle();
            }
        }
    });
};
