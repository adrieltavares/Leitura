// ===== ReadFlow — Settings Module =====

var _autoSaveTimer;

function _autoSaveSettings() {
    clearTimeout(_autoSaveTimer);
    _autoSaveTimer = setTimeout(RF.saveSettings, 600);
}

// ===== APPLY ALL SETTINGS =====
RF.applyAllSettings = function () {
    var s = RF.state.settings;
    var r = document.documentElement.style;
    r.setProperty('--reader-font', s.font);
    r.setProperty('--reader-size', s.fontSize + 'px');
    r.setProperty('--reader-color', s.textColor);
    r.setProperty('--reader-bg', s.bgColor);
    r.setProperty('--reader-line-height', s.lineHeight);
    r.setProperty('--reader-letter-spacing', s.letterSpacing + 'em');
    r.setProperty('--reader-word-spacing', s.wordSpacing + 'em');
    r.setProperty('--reader-max-width', s.maxWidth + 'px');
    RF.els.readerBody.style.textAlign = s.align;
};

// ===== APPLY SAVED SETTINGS TO UI =====
RF.applySavedSettingsToUI = function () {
    var s = RF.state.settings;
    document.querySelectorAll('.font-option').forEach(function (el) {
        el.classList.toggle('active', el.dataset.font === s.font);
    });
    document.documentElement.style.setProperty('--reader-font', s.font);

    document.getElementById('fontSizeSlider').value = s.fontSize;
    document.getElementById('sizeValue').textContent = s.fontSize + 'px';

    document.getElementById('lineHeightSlider').value = Math.round(s.lineHeight * 10);
    document.getElementById('lineHeightValue').textContent = s.lineHeight.toFixed(1);

    document.getElementById('letterSpacingSlider').value = Math.round(s.letterSpacing * 100);
    document.getElementById('letterSpacingValue').textContent = s.letterSpacing.toFixed(2) + 'em';

    document.getElementById('wordSpacingSlider').value = Math.round(s.wordSpacing * 100);
    document.getElementById('wordSpacingValue').textContent = s.wordSpacing.toFixed(2) + 'em';

    document.getElementById('widthSlider').value = s.maxWidth;
    document.getElementById('widthValue').textContent = s.maxWidth + 'px';

    document.getElementById('textColor').value = s.textColor;
    document.getElementById('textColorHex').textContent = s.textColor;
    document.getElementById('bgColor').value = s.bgColor;
    document.getElementById('bgColorHex').textContent = s.bgColor;

    RF.applyAllSettings();
};

// ===== FONT =====
function setFont(el) {
    document.querySelectorAll('.font-option').forEach(function (o) { o.classList.remove('active'); });
    el.classList.add('active');
    var font = el.dataset.font;
    RF.state.settings.font = font;
    document.documentElement.style.setProperty('--reader-font', font);
    RF.els.readerBody.style.fontFamily = font;
    _autoSaveSettings();
}

// ===== FONT SIZE =====
function updateFontSize(val) {
    val = parseInt(val);
    RF.state.settings.fontSize = val;
    document.documentElement.style.setProperty('--reader-size', val + 'px');
    RF.els.readerBody.style.fontSize = val + 'px';
    document.getElementById('sizeValue').textContent = val + 'px';
    _autoSaveSettings();
}

function adjustSize(delta) {
    var slider = document.getElementById('fontSizeSlider');
    var val = parseInt(slider.value) + delta;
    val = Math.max(12, Math.min(36, val));
    slider.value = val;
    updateFontSize(val);
}

// ===== LINE HEIGHT =====
function updateLineHeight(val) {
    var lh = (val / 10).toFixed(1);
    RF.state.settings.lineHeight = parseFloat(lh);
    document.documentElement.style.setProperty('--reader-line-height', lh);
    RF.els.readerBody.style.lineHeight = lh;
    document.getElementById('lineHeightValue').textContent = lh;
    _autoSaveSettings();
}

// ===== LETTER SPACING =====
function updateLetterSpacing(val) {
    var ls = (val / 100).toFixed(2);
    RF.state.settings.letterSpacing = parseFloat(ls);
    var lsEm = ls + 'em';
    document.documentElement.style.setProperty('--reader-letter-spacing', lsEm);
    RF.els.readerBody.style.letterSpacing = lsEm;
    document.getElementById('letterSpacingValue').textContent = lsEm;
    _autoSaveSettings();
}

// ===== WORD SPACING =====
function updateWordSpacing(val) {
    var ws = (val / 100).toFixed(2);
    RF.state.settings.wordSpacing = parseFloat(ws);
    var wsEm = ws + 'em';
    document.documentElement.style.setProperty('--reader-word-spacing', wsEm);
    RF.els.readerBody.style.wordSpacing = wsEm;
    document.getElementById('wordSpacingValue').textContent = wsEm;
    _autoSaveSettings();
}

// ===== WIDTH =====
function updateWidth(val) {
    val = parseInt(val);
    RF.state.settings.maxWidth = val;
    document.documentElement.style.setProperty('--reader-max-width', val + 'px');
    RF.els.readerContainer.style.maxWidth = val + 'px';
    document.getElementById('widthValue').textContent = val + 'px';
    _autoSaveSettings();
}

// ===== COLORS =====
function _clearActiveTheme() {
    document.querySelectorAll('.theme-option').forEach(function (t) { t.classList.remove('active'); });
}

function updateTextColor(val) {
    RF.state.settings.textColor = val;
    document.documentElement.style.setProperty('--reader-color', val);
    RF.els.readerBody.style.color = val;
    document.getElementById('textColorHex').textContent = val;
    _clearActiveTheme();
    _autoSaveSettings();
}

function updateBgColor(val) {
    RF.state.settings.bgColor = val;
    document.documentElement.style.setProperty('--reader-bg', val);
    RF.els.readerCard.style.background = val;
    document.getElementById('bgColorHex').textContent = val;
    _clearActiveTheme();
    _autoSaveSettings();
}

// ===== THEMES =====
function setTheme(el) {
    document.querySelectorAll('.theme-option').forEach(function (t) { t.classList.remove('active'); });
    el.classList.add('active');
    var bg = el.dataset.bg;
    var color = el.dataset.color;

    document.getElementById('bgColor').value = bg;
    document.getElementById('textColor').value = color;
    document.getElementById('bgColorHex').textContent = bg;
    document.getElementById('textColorHex').textContent = color;

    RF.state.settings.bgColor = bg;
    RF.state.settings.textColor = color;

    document.documentElement.style.setProperty('--reader-bg', bg);
    document.documentElement.style.setProperty('--reader-color', color);
    RF.els.readerCard.style.background = bg;
    RF.els.readerBody.style.color = color;

    _autoSaveSettings();
    RF.showToast('Tema aplicado', 'palette');
}

// ===== ALIGNMENT =====
function setAlign(align) {
    RF.state.settings.align = align;
    RF.els.readerBody.style.textAlign = align;
    document.getElementById('alignLeftBtn').classList.toggle('active', align === 'left');
    document.getElementById('alignJustifyBtn').classList.toggle('active', align === 'justify');
    _autoSaveSettings();
}

// ===== RESET =====
function resetSettings() {
    RF.state.settings = JSON.parse(JSON.stringify(RF.DEFAULT_SETTINGS));
    localStorage.removeItem('readflow_settings');
    RF.applySavedSettingsToUI();

    document.querySelectorAll('.theme-option').forEach(function (t, i) { t.classList.toggle('active', i === 0); });
    document.querySelectorAll('.font-option').forEach(function (o, i) { o.classList.toggle('active', i === 0); });

    document.body.classList.remove('dark-ui');
    document.getElementById('darkUiToggle').classList.remove('active');
    localStorage.removeItem('readflow_darkUi');

    RF.showToast('Configurações restauradas!');
}

// Expose to RF namespace for internal use
RF.adjustSize = adjustSize;
