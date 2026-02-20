// ===== ReadFlow — State Module =====
// Namespace global
window.RF = window.RF || {};

RF.state = {
    currentText: '',
    bionicActive: false,
    rulerActive: false,
    pageModeActive: false,
    currentPage: 0,
    pages: [],
    wordsPerPage: 400,
    focusMode: false,
    minimapVisible: false,
    darkUi: false,
    readingTimer: null,
    timerSeconds: 0,
    bookmark: null,
    settings: {
        font: "'Merriweather', serif",
        fontSize: 18,
        lineHeight: 1.9,
        letterSpacing: 0.01,
        wordSpacing: 0.05,
        maxWidth: 780,
        textColor: '#2d3436',
        bgColor: '#ffffff',
        align: 'justify'
    }
};

RF.DEFAULT_SETTINGS = {
    font: "'Merriweather', serif",
    fontSize: 18,
    lineHeight: 1.9,
    letterSpacing: 0.01,
    wordSpacing: 0.05,
    maxWidth: 780,
    textColor: '#2d3436',
    bgColor: '#ffffff',
    align: 'justify'
};

// ===== Cached DOM Elements =====
RF.els = {};

RF.cacheElements = function () {
    var d = document.getElementById.bind(document);
    RF.els = {
        sidebar: d('sidebar'),
        mainContent: d('mainContent'),
        overlay: d('sidebarOverlay'),
        textInput: d('textInput'),
        readerBody: d('readerBody'),
        emptyState: d('emptyState'),
        readerToolbar: d('readerToolbar'),
        readerContainer: d('readerContainer'),
        header: d('header'),
        readingProgress: d('readingProgress'),
        wordCount: d('wordCount'),
        readTime: d('readTime'),
        paraCount: d('paraCount'),
        progressPct: d('progressPct'),
        timerDisplay: d('timerDisplay'),
        timerValue: d('timerValue'),
        readingRuler: d('readingRuler'),
        minimapEl: d('minimapEl'),
        minimapText: d('minimapText'),
        minimapViewport: d('minimapViewport'),
        bookmarkBar: d('bookmarkBar'),
        bookmarkBarText: d('bookmarkBarText'),
        resumeBtn: d('resumeBtn'),
        pageNav: d('pageNav'),
        readerCard: d('readerCard')
    };
};

// ===== LOCAL STORAGE =====
RF.saveSettings = function () {
    localStorage.setItem('readflow_settings', JSON.stringify(RF.state.settings));
    localStorage.setItem('readflow_darkUi', RF.state.darkUi);
};

RF.loadSettings = function () {
    var saved = localStorage.getItem('readflow_settings');
    if (saved) {
        try {
            var parsed = JSON.parse(saved);
            Object.assign(RF.state.settings, parsed);
        } catch (e) {
            console.warn('Erro ao carregar settings', e);
        }
    }
    var darkUi = localStorage.getItem('readflow_darkUi');
    if (darkUi === 'true') {
        RF.state.darkUi = true;
        document.body.classList.add('dark-ui');
        document.getElementById('darkUiToggle').classList.add('active');
    }
    var lastText = localStorage.getItem('readflow_last_text');
    if (lastText) {
        RF.els.textInput.value = lastText;
    }
};

RF.loadBookmark = function () {
    var bm = localStorage.getItem('readflow_bookmark');
    if (bm) {
        try {
            RF.state.bookmark = JSON.parse(bm);
            RF.els.resumeBtn.style.display = 'flex';
            RF.els.bookmarkBar.style.display = 'flex';
            RF.els.bookmarkBarText.textContent = 'Marcador salvo — clique para salvar novo';
        } catch (e) {
            console.warn('Erro ao carregar marcador', e);
        }
    }
};

RF.saveBookmark = function () {
    var el = RF.els.readerBody;
    var scrollTop = el.scrollTop;
    var scrollHeight = el.scrollHeight - el.clientHeight;
    var pct = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

    RF.state.bookmark = {
        scrollPct: pct,
        page: RF.state.currentPage,
        text: RF.state.currentText.substring(0, 60)
    };

    localStorage.setItem('readflow_bookmark', JSON.stringify(RF.state.bookmark));
    RF.els.bookmarkBarText.textContent = 'Marcador salvo em ' + Math.round(pct * 100) + '% do texto';
    RF.showToast('Marcador salvo em ' + Math.round(pct * 100) + '%', 'bookmark');
};

RF.resumeFromBookmark = function () {
    if (!RF.state.bookmark) return;
    if (RF.state.pageModeActive) {
        RF.state.currentPage = RF.state.bookmark.page || 0;
        RF.renderCurrentPage();
    } else {
        var el = RF.els.readerBody;
        var scrollHeight = el.scrollHeight - el.clientHeight;
        el.scrollTop = scrollHeight * (RF.state.bookmark.scrollPct || 0);
    }
    RF.showToast('Retomando do marcador...', 'bookmark');
};
