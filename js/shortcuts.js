// ===== ReadFlow — Shortcuts Module =====

RF.setupKeyboardShortcuts = function () {
    document.addEventListener('keydown', function (e) {
        var tag = document.activeElement.tagName.toLowerCase();
        var isInput = tag === 'textarea' || tag === 'input';

        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            RF.applyText();
            return;
        }
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            if (RF.state.currentText) RF.saveBookmark();
            return;
        }
        if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
            e.preventDefault();
            RF.adjustSize(1);
            return;
        }
        if (e.ctrlKey && e.key === '-') {
            e.preventDefault();
            RF.adjustSize(-1);
            return;
        }
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            exportPDF();
            return;
        }

        if (isInput) return;

        switch (e.key) {
            case 'f': case 'F': RF.toggleFocusMode(); break;
            case 'b': case 'B': if (RF.state.currentText) toggleBionic(); break;
            case 'r': case 'R': toggleRuler(); break;
            case 'p': case 'P': if (RF.state.currentText) togglePageMode(); break;
            case '?': openShortcuts(); break;
            case 'ArrowRight': if (RF.state.pageModeActive) changePage(1); break;
            case 'ArrowLeft': if (RF.state.pageModeActive) changePage(-1); break;
        }
    });
};

function openShortcuts() {
    document.getElementById('shortcutsPanel').classList.add('visible');
    document.getElementById('panelOverlay').classList.add('visible');
}

function closeShortcuts() {
    document.getElementById('shortcutsPanel').classList.remove('visible');
    document.getElementById('panelOverlay').classList.remove('visible');
}

RF.setupShortcutsPanel = function () {
    document.getElementById('shortcutsBtn').addEventListener('click', openShortcuts);
};
