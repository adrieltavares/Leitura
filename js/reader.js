// ===== ReadFlow — Reader Module =====

// ===== HELPERS =====
RF.escapeHtml = function (str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
};

// ===== RENDER TEXT =====
RF.renderText = function (text) {
    var paragraphs = text.split(/\n+/).filter(function (p) { return p.trim(); });
    if (paragraphs.length === 0) {
        RF.els.readerBody.innerHTML = '';
        return;
    }
    RF.els.readerBody.innerHTML = paragraphs.map(function (p) {
        return '<p>' + RF.escapeHtml(p.trim()) + '</p>';
    }).join('');
    if (RF.state.bionicActive) RF.renderBionic();
    RF.els.readerBody.scrollTop = 0;
};

// ===== STATS =====
RF.updateStats = function (text) {
    var words = text.split(/\s+/).filter(function (w) { return w.length > 0; }).length;
    var paragraphs = text.split(/\n+/).filter(function (p) { return p.trim(); }).length;
    var readMinutes = Math.max(1, Math.ceil(words / 200));

    RF.els.wordCount.textContent = words.toLocaleString('pt-BR') + ' palavras';
    RF.els.readTime.textContent = '~' + readMinutes + ' min';
    RF.els.paraCount.textContent = paragraphs + ' parágrafos';
};

// ===== APPLY TEXT =====
function applyText() {
    var text = RF.els.textInput.value.trim();
    if (!text) {
        RF.showToast('Por favor, insira um texto para leitura.', 'warning');
        return;
    }

    RF.state.currentText = text;
    localStorage.setItem('readflow_last_text', text);

    RF.state.bionicActive = false;
    document.getElementById('bionicBtn').classList.remove('active');
    RF.state.pageModeActive = false;
    document.getElementById('pageModeBtn').classList.remove('active');
    RF.els.readerCard.classList.remove('page-mode');

    RF.renderText(text);
    RF.updateStats(text);
    RF.startReadingTimer();

    RF.els.readerToolbar.style.display = 'flex';
    RF.els.bookmarkBar.style.display = 'flex';
    RF.els.progressPct.style.display = 'inline-block';
    RF.els.timerDisplay.style.display = 'flex';

    RF.updateMinimap();
    if (window.innerWidth <= 900) RF.closeSidebarMobile();

    RF.els.readerBody.addEventListener('scroll', RF.updateProgress);
    RF.showToast('Texto carregado com sucesso!', 'auto_stories');
}
RF.applyText = applyText;

// ===== CLEAR TEXT =====
function clearAll() {
    RF.els.textInput.value = '';
    RF.updateCharCount();
    RF.state.currentText = '';
    localStorage.removeItem('readflow_last_text');

    RF.els.readerBody.innerHTML =
        '<div class="empty-state" id="emptyState">' +
        '<span class="material-icons-round empty-icon">menu_book</span>' +
        '<h3>Pronto para começar?</h3>' +
        '<p>Cole seu texto no painel lateral e personalize sua experiência de leitura.</p>' +
        '</div>';
    RF.els.readerToolbar.style.display = 'none';
    RF.els.bookmarkBar.style.display = 'none';
    RF.els.resumeBtn.style.display = 'none';
    RF.els.progressPct.style.display = 'none';
    RF.els.timerDisplay.style.display = 'none';

    RF.els.wordCount.textContent = '0 palavras';
    RF.els.readTime.textContent = '~0 min';
    RF.els.paraCount.textContent = '0 parágrafos';
    RF.els.readingProgress.style.width = '0%';

    if (RF.state.readingTimer) clearInterval(RF.state.readingTimer);
    RF.els.timerValue.textContent = '00:00';

    RF.showToast('Texto limpo com sucesso!');
}

// ===== READING PROGRESS =====
RF.updateProgress = function () {
    var el = RF.els.readerBody;
    var scrollable = el.scrollHeight - el.clientHeight;
    if (scrollable <= 0) return;
    var progress = el.scrollTop / scrollable * 100;
    var clamped = Math.min(100, Math.max(0, progress));
    RF.els.readingProgress.style.width = clamped + '%';
    RF.els.progressPct.textContent = Math.round(clamped) + '% lido';
    RF.updateMinimapViewport();
    RF.els.header.classList.toggle('scrolled', el.scrollTop > 10);
};

function scrollToTop() {
    RF.els.readerBody.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== BIONIC READING =====
function bionicWord(word) {
    if (word.length <= 1) return word;
    var half = Math.ceil(word.length / 2);
    return '<b>' + RF.escapeHtml(word.slice(0, half)) + '</b>' + RF.escapeHtml(word.slice(half));
}

RF.renderBionic = function () {
    var paragraphs = RF.state.currentText.split(/\n+/).filter(function (p) { return p.trim(); });
    RF.els.readerBody.innerHTML = paragraphs.map(function (p) {
        var bionic = p.trim().split(/(\s+)/).map(function (token) {
            return /\S/.test(token) ? bionicWord(token) : token;
        }).join('');
        return '<p class="bionic">' + bionic + '</p>';
    }).join('');
};

function toggleBionic() {
    RF.state.bionicActive = !RF.state.bionicActive;
    document.getElementById('bionicBtn').classList.toggle('active', RF.state.bionicActive);
    RF.showToast(RF.state.bionicActive ? 'Bionic Reading ativado' : 'Bionic Reading desativado', 'visibility');

    if (!RF.state.currentText) return;
    if (RF.state.pageModeActive) {
        RF.renderCurrentPage();
    } else if (RF.state.bionicActive) {
        RF.renderBionic();
    } else {
        RF.renderText(RF.state.currentText);
    }
}

// ===== READING RULER =====
function toggleRuler() {
    RF.state.rulerActive = !RF.state.rulerActive;
    document.body.classList.toggle('ruler-active', RF.state.rulerActive);
    document.getElementById('rulerBtn').classList.toggle('active', RF.state.rulerActive);
    RF.showToast(RF.state.rulerActive ? 'Régua ativada' : 'Régua desativada', 'horizontal_rule');
}

RF.setupRuler = function () {
    RF.els.readerBody.addEventListener('mousemove', function (e) {
        if (!RF.state.rulerActive) return;
        var rect = RF.els.readerBody.getBoundingClientRect();
        var y = e.clientY - rect.top;
        RF.els.readingRuler.style.top = y + 'px';
    });
};

// ===== PAGE MODE =====
function togglePageMode() {
    RF.state.pageModeActive = !RF.state.pageModeActive;
    document.getElementById('pageModeBtn').classList.toggle('active', RF.state.pageModeActive);
    RF.els.readerCard.classList.toggle('page-mode', RF.state.pageModeActive);

    if (RF.state.pageModeActive) {
        _buildPages();
        RF.renderCurrentPage();
        RF.showToast('Modo páginas ativado', 'menu_book');
    } else {
        RF.renderText(RF.state.currentText);
        RF.els.pageNav.style.display = 'none';
        RF.showToast('Modo páginas desativado', 'article');
    }
}

function _buildPages() {
    var words = RF.state.currentText.split(/\s+/).filter(function (w) { return w; });
    RF.state.pages = [];
    for (var i = 0; i < words.length; i += RF.state.wordsPerPage) {
        RF.state.pages.push(words.slice(i, i + RF.state.wordsPerPage).join(' '));
    }
    if (RF.state.pages.length === 0) RF.state.pages = [''];
    RF.state.currentPage = 0;
    RF.els.pageNav.style.display = 'flex';
}

RF.renderCurrentPage = function () {
    var page = RF.state.pages[RF.state.currentPage] || '';
    var paragraphs = page.split(/\n+/).filter(function (p) { return p.trim(); });
    var html = paragraphs.length
        ? paragraphs.map(function (p) { return '<p>' + RF.escapeHtml(p.trim()) + '</p>'; }).join('')
        : '<p>' + RF.escapeHtml(page) + '</p>';

    if (RF.state.bionicActive) {
        html = html.replace(/>([^<]+)</g, function (match, text) {
            var bionic = text.split(/(\s+)/).map(function (token) {
                return /\S/.test(token) ? bionicWord(token) : token;
            }).join('');
            return '>' + bionic + '<';
        });
    }

    RF.els.readerBody.innerHTML = '<div class="page-content active">' + html + '</div>';

    var prevBtn = document.getElementById('prevPageBtn');
    var nextBtn = document.getElementById('nextPageBtn');
    prevBtn.disabled = RF.state.currentPage === 0;
    nextBtn.disabled = RF.state.currentPage >= RF.state.pages.length - 1;
    document.getElementById('pageIndicator').textContent =
        'Página ' + (RF.state.currentPage + 1) + ' de ' + RF.state.pages.length;

    var pct = RF.state.pages.length > 1
        ? Math.round((RF.state.currentPage / (RF.state.pages.length - 1)) * 100) : 100;
    RF.els.readingProgress.style.width = pct + '%';
    RF.els.progressPct.textContent = pct + '% lido';
};

function changePage(delta) {
    var newPage = RF.state.currentPage + delta;
    if (newPage < 0 || newPage >= RF.state.pages.length) return;
    RF.state.currentPage = newPage;
    RF.renderCurrentPage();
    RF.els.readerBody.scrollTop = 0;
}

// ===== SETUP EVENT LISTENERS =====
RF.setupReaderEvents = function () {
    document.getElementById('applyText').addEventListener('click', applyText);
    document.getElementById('clearText').addEventListener('click', clearAll);
    RF.els.readerBody.addEventListener('scroll', RF.updateProgress);

    RF.els.textInput.addEventListener('input', function () {
        RF.updateCharCount();
        localStorage.setItem('readflow_last_text', RF.els.textInput.value);
    });

    RF.setupRuler();
};
